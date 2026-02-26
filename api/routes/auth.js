const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');

//REGISTER
router.post("/register", async(req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const isAdmin = req.body.isAdmin === true; // Only true if explicitly set
        // Determine role: admin > explicit role > default "user"
        let role = "user";
        if (isAdmin) {
            role = "admin";
        } else if (req.body.role === "expert") {
            role = "expert";
        }
        const newUser = new User({
            username: req.body.username,
            name: req.body.name || req.body.username,
            email: req.body.email,
            password: hashedPass,
            role: role,
            description: role === "expert" ? (req.body.description || "") : "",
            approved: role === "expert" ? false : true,
            isAdmin: isAdmin
        });
        const user = await newUser.save();
        // Let the client know if they need approval
        if (role === "expert") {
            return res.status(200).json({ ...user._doc, pendingApproval: true });
        }
        res.status(200).json(user);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json("Username or email already exists!");
        }
        res.status(500).json("Something went wrong!");
    }
});

//LOGIN
router.post("/login", async(req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json("Wrong credentials!");

        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) return res.status(400).json("Wrong credentials!");

        // Block unapproved experts from logging in
        if (user.role === "expert" && !user.approved) {
            return res.status(403).json("Your expert account is pending admin approval. Please wait for approval before logging in.");
        }

        // Block deactivated accounts from logging in
        if (user.active === false) {
            return res.status(403).json("Your account has been deactivated by an administrator. Please contact support.");
        }

        const { password, ...others } = user._doc;
        // Always include isAdmin and role in response
        res.status(200).json({ ...others, isAdmin: user.isAdmin, role: user.role });
    } catch (err) {
        res.status(500).json("Something went wrong!");
    }
});

//VERIFY
router.post("/verify", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json("Wrong credentials!");

        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) return res.status(400).json("Wrong credentials!");

        res.status(200).json("Verification successful");
    } catch (err) {
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;