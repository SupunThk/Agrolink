const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const requireDb = require("../middleware/requireDb");
const { validateRegistrationInput, validateLoginInput, validatePhone } = require("../utils/validators");

router.use(requireDb);

//REGISTER
router.post("/register", async(req, res) => {
    try {
        // Validate input
        const validation = validateRegistrationInput({
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            phone: req.body.phone,
            name: req.body.name
        });

        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ errors: { email: "Email already registered" } });
        }

        // Normalize phone number
        const phoneValidation = validatePhone(req.body.phone);
        const normalizedPhone = phoneValidation.formatted;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Determine role
        let role = "user";
        if (req.body.role === "expert") {
            role = "expert";
        }

        // Create new user
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            phone: normalizedPhone,
            password: hashedPass,
            role: role,
            description: role === "expert" ? (req.body.description || "") : "",
            approved: role === "expert" ? false : true,
            isAdmin: false
        });

        const user = await newUser.save();

        // Remove password from response
        const { password, ...userWithoutPassword } = user._doc;

        // Let the client know if they need approval
        if (role === "expert") {
            return res.status(200).json({ ...userWithoutPassword, pendingApproval: true });
        }

        res.status(200).json(userWithoutPassword);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ errors: { general: "Email already exists!" } });
        }
        console.error("Register error:", err);
        res.status(500).json({ errors: { general: "Something went wrong during registration!" } });
    }
});

//LOGIN
router.post("/login", async(req, res) => {
    try {
        // Validate login input
        const validation = validateLoginInput({
            email: req.body.email,
            password: req.body.password
        });

        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Find user by email (not username)
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ errors: { email: "Email or password is incorrect" } });
        }

        // Validate password
        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) {
            return res.status(400).json({ errors: { password: "Email or password is incorrect" } });
        }

        // Block unapproved experts from logging in
        if (user.role === "expert" && !user.approved) {
            return res.status(403).json({ 
                errors: { general: "Your expert account is pending admin approval. Please wait for approval before logging in." } 
            });
        }

        // Block deactivated accounts from logging in
        if (user.active === false) {
            return res.status(403).json({ 
                errors: { general: "Your account has been deactivated by an administrator. Please contact support." } 
            });
        }

        // Remove password from response
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, isAdmin: user.isAdmin, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ errors: { general: "Something went wrong during login!" } });
    }
});

//VERIFY
router.post("/verify", async (req, res) => {
    try {
        if (!req.body?.email || !req.body?.password) {
            return res.status(400).json({ errors: { general: "Email and password are required!" } });
        }
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ errors: { email: "Email or password is incorrect" } });
        }

        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) {
            return res.status(400).json({ errors: { password: "Email or password is incorrect" } });
        }

        res.status(200).json({ verified: true, message: "Verification successful" });
    } catch (err) {
        console.error("Verify error:", err);
        res.status(500).json({ errors: { general: "Something went wrong!" } });
    }
});

module.exports = router;