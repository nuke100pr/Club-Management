const OTP = require("../models/OTP");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class OTPService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async sendOTPRegister(email) {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }
    const user = await User.findOne({ email_id: email });
    if (user) {
      throw new Error("User Already Exists");
    }

    // Generate cryptographically secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    const newOTP = new OTP({ email, otp, expiresAt });
    await newOTP.save();

    // Send email
    try {
      await this.transporter.sendMail({
        from: `"LOC - LifeOnCampus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #57068C;">Password Reset Request</h2>
            <p>Your OTP code is:</p>
            <h3 style="background:rgb(169, 97, 218); padding: 10px; display: inline-block; border-radius: 4px;">
              ${otp}
            </h3>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send OTP email");
    }

    return { success: true, message: "OTP sent successfully" };
  }
  async sendOTP(email) {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    const user = await User.findOne({ email_id: email });
    if (!user) {
      throw new Error("User not found with this email");
    }

    // Generate cryptographically secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    const newOTP = new OTP({ email, otp, expiresAt });
    await newOTP.save();

    // Send email
    try {
      await this.transporter.sendMail({
        from: `"LOC - LifeOnCampus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #57068C;">Password Reset Request</h2>
            <p>Your OTP code is:</p>
            <h3 style="background:rgb(169, 97, 218); padding: 10px; display: inline-block; border-radius: 4px;">
              ${otp}
            </h3>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send OTP email");
    }

    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOTP(email, otp) {
    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }

    // Check if user has exceeded attempts
    const attempts = (await OTP.findOne({ email, type: "attempt" })) || {
      count: 0,
    };

    if (attempts.count >= 3) {
      throw new Error("Maximum attempts reached. Please try again later.");
    }

    // Check if OTP exists (valid or expired)
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      // Check if an expired OTP exists for the email
      const expiredOTP = await OTP.findOne({
        email,
        expiresAt: { $lte: new Date() },
      });

      if (expiredOTP) {
        throw new Error("OTP has expired. Please request a new one.");
      } else {
        // Increment failed attempts for invalid OTP
        await OTP.findOneAndUpdate(
          { email, type: "attempt" },
          {
            $inc: { count: 1 },
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
          { upsert: true, new: true }
        );

        const updatedAttempts = (await OTP.findOne({
          email,
          type: "attempt",
        })) || { count: 1 };
        const remainingAttempts = 3 - updatedAttempts.count;

        throw new Error(
          `Invalid OTP. ${
            remainingAttempts > 0
              ? `${remainingAttempts} attempt${
                  remainingAttempts !== 1 ? "s" : ""
                } remaining`
              : "No attempts remaining"
          }`
        );
      }
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt <= new Date()) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Reset attempts on successful verification
    await OTP.deleteOne({ email, type: "attempt" });

    // Delete the OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    return {
      success: true,
      message: "OTP verified successfully",
      verified: true,
    };
  }

  async resetPassword(email, newPassword) {
    if (!email || !newPassword) {
      throw new Error("Email and new password are required");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const user = await User.findOne({ email_id: email });
    if (!user) {
      throw new Error("User not found");
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: "Password reset successfully" };
  }
}

module.exports = new OTPService();
