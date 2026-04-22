const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const requireDb = require("../middleware/requireDb");
const {
    validateRegistrationInput,
    validateLoginInput,
    validatePhone,
    validateForgotPasswordInput,
    validateVerifyOtpInput,
    validateResetPasswordInput,
} = require("../utils/validators");
const { sendOtpEmail } = require("../utils/mailer");

router.use(requireDb);

const OTP_EXPIRY_MINUTES = 5;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const OTP_LOCK_MS = 15 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;

const resetSuccessResponse = {
    message: "If this email is registered, an OTP has been sent.",
};

const estimateBase64Bytes = (value) => {
    if (typeof value !== "string") return 0;
    const base64 = value.includes(",") ? value.split(",")[1] : value;
    if (!base64) return 0;
    const padding = (base64.match(/=+$/) || [""])[0].length;
    return Math.ceil((base64.length * 3) / 4) - padding;
};

const MAX_SINGLE_FARM_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_FARM_IMAGE_BYTES = 12 * 1024 * 1024;

//REGISTER
router.post("/register", async (req, res) => {
    try {
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase() : "";

        // Validate input
        const validation = validateRegistrationInput({
            email: normalizedEmail,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            phone: req.body.phone,
            name: req.body.name
        });

        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: normalizedEmail });
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

        // For experts, validate farm images
        let farmImages = [];
        if (role === "expert") {
            if (!req.body.farmImages || !Array.isArray(req.body.farmImages)) {
                return res.status(400).json({ errors: { farmImages: "Farm images are required for expert registration" } });
            }
            if (req.body.farmImages.length < 3) {
                return res.status(400).json({ errors: { farmImages: "Minimum 3 farm images required for expert verification" } });
            }

            let totalFarmImageBytes = 0;
            for (const img of req.body.farmImages) {
                if (typeof img !== "string" || !img.startsWith("data:image")) {
                    return res.status(400).json({
                        errors: { farmImages: "Each farm image must be a valid Base64 data URL" },
                    });
                }

                const imageBytes = estimateBase64Bytes(img);
                if (imageBytes > MAX_SINGLE_FARM_IMAGE_BYTES) {
                    return res.status(400).json({
                        errors: { farmImages: "Each farm image must be 3MB or less after processing" },
                    });
                }

                totalFarmImageBytes += imageBytes;
            }

            if (totalFarmImageBytes > MAX_TOTAL_FARM_IMAGE_BYTES) {
                return res.status(400).json({
                    errors: { farmImages: "Total farm image payload is too large. Please upload smaller images." },
                });
            }

            // Convert farm images to proper format
            farmImages = req.body.farmImages.map(img => ({
                image: img,
                uploadedAt: new Date()
            }));
        }

        // Create new user
        const baseName = (req.body.username || req.body.name || "").trim();
        // Append a short random suffix to guarantee username uniqueness
        const uniqueSuffix = Math.random().toString(36).substring(2, 6);
        const uniqueUsername = `${baseName}_${uniqueSuffix}`;

        const newUser = new User({
            username: uniqueUsername,
            name: req.body.name,
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPass,
            role: role,
            description: role === "expert" ? (req.body.description || "") : "",
            approved: role === "expert" ? false : true,
            farmImages: farmImages,
            verificationStatus: role === "expert" ? "pending" : "approved",
            isAdmin: false
        });

        const user = await newUser.save();

        // Remove password from response
        // Avoid returning potentially large Base64 payloads (farmImages) in auth responses.
        const { password, farmImages: _farmImages, ...userWithoutPassword } = user._doc;

        // Let the client know if they need approval
        if (role === "expert") {
            return res.status(200).json({ ...userWithoutPassword, pendingApproval: true });
        }

        res.status(200).json(userWithoutPassword);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ errors: { general: "Email already exists!" } });
        }

        if (err?.code === 10334 || /BSONObjectTooLarge|object to insert too large/i.test(String(err?.message))) {
            return res.status(400).json({
                errors: { farmImages: "Farm images are too large. Please upload smaller images." },
            });
        }

        console.error("Register error:", err);
        res.status(500).json({ errors: { general: "Something went wrong during registration!" } });
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    try {
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase() : "";

        // Validate login input
        const validation = validateLoginInput({
            email: normalizedEmail,
            password: req.body.password
        });

        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Find user by email (not username)
        // IMPORTANT: Experts can have large Base64 farmImages; never load them during auth.
        const user = await User.findOne({ email: normalizedEmail }).select("-farmImages");
        if (!user) {
            return res.status(400).json({ errors: { email: "Email or password is incorrect" } });
        }

        // Validate password
        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) {
            return res.status(400).json({ errors: { password: "Email or password is incorrect" } });
        }

        // Block rejected experts from logging in
        if (user.role === "expert" && user.verificationStatus === "rejected") {
            return res.status(403).json({
                errors: { general: "Your expert account was rejected. Reason: " + (user.verificationNotes || "No details provided") }
            });
        }

        // Block unapproved experts from logging in
        if (user.role === "expert" && user.verificationStatus === "pending") {
            return res.status(403).json({
                errors: { general: "Your expert account is pending admin verification of your farm images. Please wait for approval before logging in." }
            });
        }

        // Block deactivated accounts from logging in
        if (user.active === false) {
            return res.status(403).json({
                errors: { general: "Your account has been deactivated by an administrator. Please contact support." }
            });
        }

        // Remove password from response
        // Avoid returning potentially large Base64 payloads (farmImages) on login.
        const { password, farmImages: _farmImages, ...others } = user._doc;
        res.status(200).json({ ...others, isAdmin: user.isAdmin, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ errors: { general: "Something went wrong during login!" } });
    }
});

// FORGOT PASSWORD: send OTP
router.post("/forgot-password", async (req, res) => {
    try {
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase().trim() : "";

        const validation = validateForgotPasswordInput({ email: normalizedEmail });
        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        const user = await User.findOne({ email: normalizedEmail });

        // Do not reveal whether an email exists.
        if (!user) {
            return res.status(200).json(resetSuccessResponse);
        }

        const now = Date.now();
        if (user.passwordResetLastSentAt && now - new Date(user.passwordResetLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
            const retryAfterSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - new Date(user.passwordResetLastSentAt).getTime())) / 1000);
            return res.status(429).json({
                errors: { otp: `Please wait ${retryAfterSeconds}s before requesting another OTP` },
            });
        }

        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const otpSalt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otpCode, otpSalt);

        user.passwordResetOtpHash = otpHash;
        user.passwordResetOtpExpiresAt = new Date(now + OTP_EXPIRY_MS);
        user.passwordResetLastSentAt = new Date(now);
        user.passwordResetFailedAttempts = 0;
        user.passwordResetLockUntil = null;
        user.passwordResetToken = "";
        user.passwordResetTokenExpiresAt = null;
        await user.save();

        try {
            await sendOtpEmail({
                toEmail: normalizedEmail,
                otpCode,
                otpExpiryMinutes: OTP_EXPIRY_MINUTES,
            });
        } catch (mailError) {
            console.error("Forgot password email error:", mailError.message);
            return res.status(500).json({
                errors: { general: "Unable to send OTP right now. Please try again shortly." },
            });
        }

        return res.status(200).json(resetSuccessResponse);
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ errors: { general: "Something went wrong while sending OTP." } });
    }
});

// VERIFY RESET OTP
router.post("/verify-reset-otp", async (req, res) => {
    try {
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const otp = String(req.body.otp || "").trim();

        const validation = validateVerifyOtpInput({ email: normalizedEmail, otp });
        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
            return res.status(400).json({ errors: { otp: "OTP is invalid or expired. Please request a new OTP." } });
        }

        const now = Date.now();

        if (user.passwordResetLockUntil && new Date(user.passwordResetLockUntil).getTime() > now) {
            const retryAfterSeconds = Math.ceil((new Date(user.passwordResetLockUntil).getTime() - now) / 1000);
            return res.status(429).json({
                errors: { otp: `Too many attempts. Try again in ${retryAfterSeconds}s.` },
            });
        }

        if (new Date(user.passwordResetOtpExpiresAt).getTime() < now) {
            user.passwordResetOtpHash = "";
            user.passwordResetOtpExpiresAt = null;
            user.passwordResetToken = "";
            user.passwordResetTokenExpiresAt = null;
            await user.save();
            return res.status(400).json({ errors: { otp: "OTP is invalid or expired. Please request a new OTP." } });
        }

        const isMatch = await bcrypt.compare(otp, user.passwordResetOtpHash);
        if (!isMatch) {
            user.passwordResetFailedAttempts = (user.passwordResetFailedAttempts || 0) + 1;

            if (user.passwordResetFailedAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
                user.passwordResetLockUntil = new Date(now + OTP_LOCK_MS);
            }

            await user.save();
            return res.status(400).json({ errors: { otp: "OTP is incorrect" } });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = resetToken;
        user.passwordResetTokenExpiresAt = new Date(now + RESET_TOKEN_EXPIRY_MS);
        user.passwordResetOtpHash = "";
        user.passwordResetOtpExpiresAt = null;
        user.passwordResetFailedAttempts = 0;
        user.passwordResetLockUntil = null;
        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully",
            resetToken,
        });
    } catch (err) {
        console.error("Verify reset OTP error:", err);
        return res.status(500).json({ errors: { general: "Something went wrong while verifying OTP." } });
    }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const payload = {
            email: normalizedEmail,
            resetToken: req.body.resetToken,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        };

        const validation = validateResetPasswordInput(payload);
        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !user.passwordResetToken || !user.passwordResetTokenExpiresAt) {
            return res.status(400).json({ errors: { general: "Reset session expired. Please verify OTP again." } });
        }

        const now = Date.now();
        if (user.passwordResetToken !== payload.resetToken || new Date(user.passwordResetTokenExpiresAt).getTime() < now) {
            return res.status(400).json({ errors: { general: "Reset session expired. Please verify OTP again." } });
        }

        const isSameAsOldPassword = await bcrypt.compare(payload.password, user.password);
        if (isSameAsOldPassword) {
            return res.status(400).json({
                errors: { password: ["New password must be different from your current password"] },
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(payload.password, salt);

        user.password = hashedPass;
        user.passwordChangedAt = new Date(now);
        user.passwordResetToken = "";
        user.passwordResetTokenExpiresAt = null;
        user.passwordResetOtpHash = "";
        user.passwordResetOtpExpiresAt = null;
        user.passwordResetFailedAttempts = 0;
        user.passwordResetLockUntil = null;
        await user.save();

        return res.status(200).json({ message: "Password reset successful. Please log in with your new password." });
    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ errors: { general: "Something went wrong while resetting your password." } });
    }
});

//LOGOUT
router.post("/logout/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ errors: { general: "User ID is required" } });
        }

        // Update user's lastLogout timestamp
        await User.findByIdAndUpdate(userId, { lastLogout: new Date() });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ errors: { general: "Something went wrong during logout!" } });
    }
});

//VERIFY
router.post("/verify", async (req, res) => {
    try {
        if (!req.body?.email || !req.body?.password) {
            return res.status(400).json({ errors: { general: "Email and password are required!" } });
        }
        const normalizedEmail = req.body.email.toLowerCase();
        // Avoid loading large expert farmImages for a simple credential check.
        const user = await User.findOne({ email: normalizedEmail }).select("-farmImages");
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