const otpService = require("../services/otpService");

class OTPController {
  async sendOTP(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      const result = await otpService.sendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      console.error("OTP send error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
  async sendOTPRegister(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      const result = await otpService.sendOTPRegister(email);
      res.status(200).json(result);
    } catch (error) {
      console.error("OTP send error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: "Email and OTP are required",
        });
      }

      const result = await otpService.verifyOTP(email, otp);
      res.status(200).json(result);
    } catch (error) {
      console.error("OTP verify error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Email and new password are required",
        });
      }

      const result = await otpService.resetPassword(email, newPassword);
      res.status(200).json(result);
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new OTPController();
