const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["user", "expert", "admin"],
        default: "user",
    },
    description: {
        type: String,
        default: "",
    },
    approved: {
        type: Boolean,
        default: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
},
{ timestamps: true }
);


module.exports = mongoose.model("User", UserSchema);