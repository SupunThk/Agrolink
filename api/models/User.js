const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
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
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationNotes: {
      type: String,
      default: "",
    },
    farmImages: {
      type: [
        {
          image: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    passwordResetOtpHash: {
      type: String,
      default: "",
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetLastSentAt: {
      type: Date,
      default: null,
    },
    passwordResetFailedAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetLockUntil: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: "",
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
