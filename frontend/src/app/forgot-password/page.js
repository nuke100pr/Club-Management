"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import img6 from "../../../public/img6.jpg";
import img7 from "../../../public/img7.jpg";
import img8 from "../../../public/img8.jpg";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  KeyRound, 
  Check, 
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    email: "",
    otp: Array(6).fill(""),
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Start with 0 (inactive)
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0); // 30 seconds cooldown
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const otpInputRefs = useRef([]);
  const images = [img6, img7, img8];

  // Image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle OTP timer
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmail = (email) => {
    // return email.endsWith("@iitrpr.ac.in");
    return true;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });

    // Auto focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOTPRequest = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setMessage({
        type: "success",
        text: "OTP sent to your email. Please check your inbox.",
      });
      setStep(2);
      setTimeLeft(300); // Reset timer to 5 minutes
      setResendCooldown(30); // 30 seconds cooldown
      setCanResend(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setMessage({ type: "error", text: "Email is required" });
      return;
    }
    if (!validateEmail(formData.email)) {
      setMessage({
        type: "error",
        text: "Please use your college email (@iitrpr.ac.in)",
      });
      return;
    }
    await sendOTPRequest();
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    await sendOTPRequest();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otp = formData.otp.join('');
    if (otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter a 6-digit OTP" });
      return;
    }

    if (timeLeft <= 0) {
      setMessage({ type: "error", text: "OTP has expired. Please request a new one." });
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      setMessage({
        type: "success",
        text: "OTP verified successfully. Please set your new password.",
      });
      setStep(3);
    } catch (error) {
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      
      if (newAttempts <= 0) {
        setMessage({
          type: "error",
          text: "Maximum attempts reached. Please try again later.",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: `${error.message || "Invalid OTP"} (${newAttempts} attempts remaining)`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: "error", text: "Both password fields are required" });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/otp/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      setMessage({
        type: "success",
        text: "Password reset successfully! Redirecting to login...",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Recover Your Account";
      case 2: return "Verify Your Identity";
      case 3: return "Create New Password";
      default: return "Forgot Password";
    }
  };

  const getStepDescription = () => {
    switch(step) {
      case 1: return "Enter your email and we'll send a verification code";
      case 2: return `Enter the 6-digit code sent to ${formData.email}`;
      case 3: return "Set a strong password to secure your account";
      default: return "";
    }
  };

  return (
    <div className="flex h-screen bg-[#f8faff] font-['Inter',sans-serif]">
      {/* Left Side with Image Carousel */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4776E6] to-[#8E54E9] opacity-40 z-10"></div>
        
        {/* Image Carousel */}
        <div className="relative w-full h-full">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentImageIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={img}
                alt={`Background ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16">
          <div>
            <h1 className="text-white text-4xl font-bold mb-3">
              Account Recovery
            </h1>
            <div className="h-1 w-24 bg-white rounded-full mb-8"></div>
          </div>
          
          <div className="w-4/5">
            <h2 className="text-white text-5xl font-bold mb-6">{getStepTitle()}</h2>
            <p className="text-white/90 text-xl mb-12">{getStepDescription()}</p>
            
            {/* Step indicators */}
            <div className="flex space-x-4 mb-8">
              <div className={`h-3 w-20 rounded-full transition-all duration-500 ${
                step === 1 ? "bg-white" : "bg-white/40"
              }`}></div>
              <div className={`h-3 w-20 rounded-full transition-all duration-500 ${
                step === 2 ? "bg-white" : "bg-white/40"
              }`}></div>
              <div className={`h-3 w-20 rounded-full transition-all duration-500 ${
                step === 3 ? "bg-white" : "bg-white/40"
              }`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Back button for all screen sizes */}
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center py-2 px-4 rounded-full text-[#4776E6] hover:text-[#3a5fc0] transition-all duration-300 hover:-translate-x-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to login</span>
            </Link>
          </div>

          {/* Form Header - Mobile friendly version of the left side content */}
          <div className="mb-8 md:hidden">
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#4776E6] to-[#8E54E9] bg-clip-text text-transparent">
              {getStepTitle()}
            </h1>
            <p className="mt-2 text-[#607080]">
              {getStepDescription()}
            </p>
            
            {/* Step indicators for mobile */}
            <div className="flex space-x-2 mt-6">
              <div className={`h-1 w-16 rounded-full transition-all duration-500 ${
                step === 1 ? "bg-gradient-to-r from-[#4776E6] to-[#8E54E9]" : "bg-gray-200"
              }`}></div>
              <div className={`h-1 w-16 rounded-full transition-all duration-500 ${
                step === 2 ? "bg-gradient-to-r from-[#4776E6] to-[#8E54E9]" : "bg-gray-200"
              }`}></div>
              <div className={`h-1 w-16 rounded-full transition-all duration-500 ${
                step === 3 ? "bg-gradient-to-r from-[#4776E6] to-[#8E54E9]" : "bg-gray-200"
              }`}></div>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(95,150,230,0.1)] p-6 mb-6 transition-all duration-300 hover:shadow-[0_12px_20px_rgba(95,150,230,0.2)]">
            {/* Desktop Form Header */}
            <div className="hidden md:block mb-6">
              <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#4776E6] to-[#8E54E9] bg-clip-text text-transparent">
                {getStepTitle()}
              </h1>
              <p className="mt-2 text-[#607080]">
                {getStepDescription()}
              </p>
            </div>

            {/* Status Message */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                    : "bg-green-50 text-green-700 border-l-4 border-green-500"
                }`}
              >
                <div className="mr-3 mt-0.5">
                  {message.type === "error" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </div>
                <p>{message.text}</p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-[#2A3B4F] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#607080]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-lg bg-white shadow-[0_2px_8px_rgba(95,150,230,0.1)] text-[#2A3B4F] focus:outline-none focus:ring-2 focus:ring-[#4776E6] focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center shadow-[0_4px_10px_rgba(71,118,230,0.3)] transform hover:-translate-y-1 ${
                    loading
                      ? "bg-[#6a98ff] cursor-not-allowed"
                      : "bg-gradient-to-r from-[#4776E6] to-[#8E54E9] hover:from-[#3a5fc0] hover:to-[#7b45d2] text-white"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#2A3B4F] mb-2">
                    Verification Code
                  </label>
                  
                  <div className="flex justify-between space-x-2 mb-4">
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        className={`w-12 h-12 text-center text-xl border rounded-lg shadow-[0_2px_8px_rgba(95,150,230,0.1)] focus:outline-none focus:ring-2 focus:ring-[#4776E6] focus:border-transparent transition-all duration-300 ${
                          timeLeft <= 0 
                            ? "bg-gray-100 text-gray-400 border-gray-200" 
                            : "bg-white text-[#2A3B4F] border-[#E2E8F0]"
                        }`}
                        disabled={loading || timeLeft <= 0}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-sm text-[#607080]">
                      <Mail className="mr-2 h-4 w-4" />
                      <span className="truncate max-w-[150px] md:max-w-full">
                        {formData.email}
                      </span>
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      timeLeft <= 60 ? "text-red-500" : "text-[#4776E6]"
                    }`}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      {timeLeft > 0 ? formatTime(timeLeft) : "Expired"}
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={!canResend || loading}
                      className={`text-sm inline-flex items-center transition-all duration-300 ${
                        canResend 
                          ? "text-[#4776E6] hover:text-[#3a5fc0]" 
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <RefreshCw className={`mr-1 h-3 w-3 ${!canResend && resendCooldown > 0 ? "animate-spin" : ""}`} />
                      {canResend
                        ? "Resend verification code"
                        : `Available in ${resendCooldown}s`}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setFormData({...formData, otp: Array(6).fill("")});
                    }}
                    className="w-1/3 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center border border-[#E2E8F0] text-[#607080] hover:bg-gray-50"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`w-2/3 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center shadow-[0_4px_10px_rgba(71,118,230,0.3)] transform hover:-translate-y-1 ${
                      loading || timeLeft <= 0
                        ? "bg-[#6a98ff] cursor-not-allowed"
                        : "bg-gradient-to-r from-[#4776E6] to-[#8E54E9] hover:from-[#3a5fc0] hover:to-[#7b45d2] text-white"
                    }`}
                    disabled={loading || timeLeft <= 0}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Verify Code
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[#2A3B4F] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#607080]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 border border-[#E2E8F0] rounded-lg bg-white shadow-[0_2px_8px_rgba(95,150,230,0.1)] text-[#2A3B4F] focus:outline-none focus:ring-2 focus:ring-[#4776E6] focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#607080] hover:text-[#4776E6]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2A3B4F] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#607080]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 border border-[#E2E8F0] rounded-lg bg-white shadow-[0_2px_8px_rgba(95,150,230,0.1)] text-[#2A3B4F] focus:outline-none focus:ring-2 focus:ring-[#4776E6] focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#607080] hover:text-[#4776E6]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      setFormData({...formData, newPassword: "", confirmPassword: ""});
                    }}
                    className="w-1/3 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center border border-[#E2E8F0] text-[#607080] hover:bg-gray-50"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`w-2/3 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center shadow-[0_4px_10px_rgba(71,118,230,0.3)] transform hover:-translate-y-1 ${
                      loading
                        ? "bg-[#6a98ff] cursor-not-allowed"
                        : "bg-gradient-to-r from-[#4776E6] to-[#8E54E9] hover:from-[#3a5fc0] hover:to-[#7b45d2] text-white"
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Note at bottom */}
          <div className="text-center text-sm text-[#607080]">
            <p>
              Need help? <a href="#" className="text-[#4776E6] hover:text-[#3a5fc0] font-medium">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}