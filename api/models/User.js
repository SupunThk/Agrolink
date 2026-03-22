const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        /**
         * profilePic — Full Cloudinary secure URL for the user's avatar.
         */
        profilePic: {
            type: String,
            default: "",
        },
        /**
         * profilePicPublicId — Cloudinary public_id for the avatar image.
         * Stored so the old image can be deleted from Cloudinary on update/delete.
         */
        profilePicPublicId: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
