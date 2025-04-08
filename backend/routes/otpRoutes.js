const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Middleware to ensure JSON content-type
const requireJsonContent = (req, res, next) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({
      success: false,
      error: 'Server requires application/json'
    });
  }
  next();
};

router.post('/send', requireJsonContent, otpController.sendOTP);
router.post('/verify', requireJsonContent, otpController.verifyOTP);
router.post('/reset-password', requireJsonContent, otpController.resetPassword);
router.post('/sendRegister', requireJsonContent, otpController.sendOTPRegister);

module.exports = router;