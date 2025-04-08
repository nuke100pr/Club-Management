"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import landscapeImage from "../../../public/img3.jpg";

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
  const [timeLeft, setTimeLeft] = useState(0); // Start with 0 (inactive)
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0); // 30 seconds cooldown
  const otpInputRefs = useRef([]);

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
      const response = await fetch(`http://localhost:5000/otp/send`, {
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
      const response = await fetch("http://localhost:5000/otp/verify", {
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
      const response = await fetch("http://localhost:5000/otp/reset-password", {
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

  return (
    <div className="flex h-screen bg-[#ffffff]">
      {/* Left Side with Image */}
      <div className="hidden md:block md:w-1/2 relative bg-[#8E24AA]">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 z-10">
            <Image
              src={landscapeImage}
              alt="Landscape image"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div className="absolute inset-0 bg-black opacity-30 z-20"></div>
          <div className="absolute bottom-16 left-16 text-white z-30">
            <h2 className="text-4xl font-bold mb-2">Reset Your Password</h2>
            <h2 className="text-4xl font-bold mb-8">Secure Your Account</h2>
            <div className="flex space-x-2">
              <div className={`w-6 h-1 rounded-full ${step === 1 ? "bg-white" : "bg-gray-400"}`}></div>
              <div className={`w-6 h-1 rounded-full ${step === 2 ? "bg-white" : "bg-gray-400"}`}></div>
              <div className={`w-6 h-1 rounded-full ${step === 3 ? "bg-white" : "bg-gray-400"}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Back button for mobile */}
          <div className="md:hidden mb-6">
            <Link href="/login" className="text-[#6A1B9A] flex items-center">
              <svg
                className="mr-1 w-4 h-4 rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span>Back to login</span>
            </Link>
          </div>

          {/* Back button for desktop */}
          <div className="hidden md:block absolute top-6 right-8">
            <Link
              href="/login"
              className="text-[#6A1B9A] bg-[#F3E5F5] px-4 py-2 rounded-full flex items-center"
            >
              <svg
                className="mr-1 w-4 h-4 rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span>Back to login</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[#6A1B9A]">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Reset Password"}
            </h1>
            <p className="mt-2 text-[#AB47BC]">
              {step === 1 && "Enter your email to receive a reset OTP"}
              {step === 2 && `Enter the OTP sent to ${formData.email}`}
              {step === 3 && "Set your new password"}
            </p>
          </div>

          {/* Status Message */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-md ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#CE93D8] rounded-md bg-[#F3E5F5] text-[#6A1B9A] focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className={`w-full font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center ${
                  loading
                    ? "bg-[#CE93D8] cursor-not-allowed"
                    : "bg-[#AB47BC] hover:bg-[#8E24AA] text-white"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
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
                      className="w-12 h-12 text-center text-xl border-2 border-[#CE93D8] rounded-md bg-[#F3E5F5] text-[#6A1B9A] focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                      disabled={loading || timeLeft <= 0}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-[#AB47BC]">
                    OTP sent to {formData.email}
                  </p>
                  <p className={`text-sm font-medium ${
                    timeLeft <= 60 ? "text-red-500" : "text-[#6A1B9A]"
                  }`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : "OTP expired"}
                  </p>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResend || loading}
                    className={`text-sm ${canResend ? "text-[#6A1B9A] hover:underline" : "text-gray-400"}`}
                  >
                    {canResend ? (
                      "Resend OTP"
                    ) : (
                      `Resend available in ${resendCooldown}s`
                    )}
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
                  className="w-1/3 font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center bg-[#E1BEE7] text-[#6A1B9A] hover:bg-[#CE93D8]"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`w-2/3 font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center ${
                    loading || timeLeft <= 0
                      ? "bg-[#CE93D8] cursor-not-allowed"
                      : "bg-[#AB47BC] hover:bg-[#8E24AA] text-white"
                  }`}
                  disabled={loading || timeLeft <= 0}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#CE93D8] rounded-md bg-[#F3E5F5] text-[#6A1B9A] focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#CE93D8] rounded-md bg-[#F3E5F5] text-[#6A1B9A] focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setFormData({...formData, newPassword: "", confirmPassword: ""});
                  }}
                  className="w-1/3 font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center bg-[#E1BEE7] text-[#6A1B9A] hover:bg-[#CE93D8]"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`w-2/3 font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center ${
                    loading
                      ? "bg-[#CE93D8] cursor-not-allowed"
                      : "bg-[#AB47BC] hover:bg-[#8E24AA] text-white"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
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
      </div>
    </div>
  );
}