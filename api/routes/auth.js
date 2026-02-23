const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');

//REGISTER
router.post("/register", async(req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const isAdmin = req.body.isAdmin === true; // Only true if explicitly set
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPass,
            isAdmin: isAdmin
        });
        const user = await newUser.save();
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

        const { password, ...others } = user._doc;
        // Always include isAdmin in response
        res.status(200).json({ ...others, isAdmin: user.isAdmin });
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