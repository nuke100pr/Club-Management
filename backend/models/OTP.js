const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "5m" }, // Auto-delete after 5 minutes
    },
    type: {
      type: String,
      enum: ["otp", "attempt"], // ⬅ 'attempt' is used to track failed attempts
      default: "otp",
    },
    count: {
      type: Number,
      default: 0, // ⬅ This is where count is initialized
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OTP", OTPSchema);
