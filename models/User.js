const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nationalID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 14,
      minlength: 14,
    },
    profileImage: {
      type: String,
    },
    longitude: {
      type: String,
    },
    latitude: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "manager", "admin"],
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("User", userSchema);
