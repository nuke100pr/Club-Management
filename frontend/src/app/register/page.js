"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import landscapeImage from "../../../public/img2.jpg";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpInputRefs = useRef([]);

  const formData = useRef({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const validateEmail = (email) => {
    return email.endsWith("@iitrpr.ac.in");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle timers
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    formData.current = { ...formData.current, [name]: value };
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/users/auth/google";
  };

  const sendOTP = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/otp/sendRegister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.current.email,
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
      setTimeLeft(300); // 5 minutes
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

  const handleResendOTP = async () => {
    if (!canResend) return;
    await sendOTP();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (
      !formData.current.firstName ||
      !formData.current.lastName ||
      !formData.current.email ||
      !formData.current.password
    ) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (!validateEmail(formData.current.email)) {
      setMessage({
        type: "error",
        text: "Please use your college email (@iitrpr.ac.in)",
      });
      return;
    }

    if (!isChecked) {
      setMessage({
        type: "error",
        text: "You must agree to the Terms & Conditions",
      });
      return;
    }

    await sendOTP();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
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
      // Verify OTP
      const verifyResponse = await fetch("http://localhost:5000/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.current.email,
          otp: otpCode,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "OTP verification failed");
      }

      // Create user account after OTP verification
      const registerResponse = await fetch("http://localhost:5000/users/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.current.firstName} ${formData.current.lastName}`,
          email_id: formData.current.email,
          password: formData.current.password,
          registered_at: new Date().toISOString(),
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error?.message || "Registration Failed");
      }

      setMessage({
        type: "success",
        text: "Account created successfully! Redirecting to login...",
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
      <div className="hidden md:block md:w-1/2 relative bg-[#3F51B5]">
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
            <h2 className="text-4xl font-bold mb-2">Capturing Moments,</h2>
            <h2 className="text-4xl font-bold mb-8">Creating Memories</h2>
            <div className="flex space-x-2">
              <div className={`w-6 h-1 rounded-full ${step === 1 ? "bg-white" : "bg-gray-400"}`}></div>
              <div className={`w-6 h-1 rounded-full ${step === 2 ? "bg-white" : "bg-gray-400"}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Back button for mobile */}
          <div className="md:hidden mb-6">
            <Link href="/" className="text-[#303F9F] flex items-center">
              <span>Back to website</span>
              <svg
                className="ml-1 w-4 h-4"
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
            </Link>
          </div>

          {/* Back button for desktop */}
          <div className="hidden md:block absolute top-6 right-8">
            <Link
              href="/"
              className="text-[#303F9F] bg-[#E8EAF6] px-4 py-2 rounded-full flex items-center"
            >
              <span>Back to website</span>
              <svg
                className="ml-1 w-4 h-4"
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
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[#303F9F]">
              {step === 1 ? "Create an account" : "Verify OTP"}
            </h1>
            <p className="mt-2 text-[#5C6BC0]">
              {step === 1 ? (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#303F9F] underline">
                    Log in
                  </Link>
                </>
              ) : (
                `Enter the OTP sent to ${formData.current.email}`
              )}
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

          {step === 1 ? (
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    defaultValue={formData.current.firstName}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#C5CAE9] rounded-md bg-[#E8EAF6] text-[#303F9F] focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    defaultValue={formData.current.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#C5CAE9] rounded-md bg-[#E8EAF6] text-[#303F9F] focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={formData.current.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#C5CAE9] rounded-md bg-[#E8EAF6] text-[#303F9F] focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  disabled={loading}
                />
              </div>

              <div className="mb-6 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  defaultValue={formData.current.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#C5CAE9] rounded-md bg-[#E8EAF6] text-[#303F9F] pr-10 focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5C6BC0]"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="mr-2 h-5 w-5 border-[#C5CAE9] rounded accent-[#3F51B5]"
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-[#303F9F]">
                  I agree to the{" "}
                  <Link href="/terms" className="underline">
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className={`w-full font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center ${
                  loading
                    ? "bg-[#C5CAE9] cursor-not-allowed"
                    : "bg-[#5C6BC0] hover:bg-[#3F51B5] text-white"
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

              <div className="mt-8 mb-6 flex items-center">
                <div className="flex-grow border-t border-[#C5CAE9]"></div>
                <span className="mx-4 text-sm text-[#5C6BC0]">
                  Or register with
                </span>
                <div className="flex-grow border-t border-[#C5CAE9]"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={`flex justify-center items-center py-3 px-4 border border-[#C5CAE9] rounded-md transition duration-200 ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#E8EAF6]"
                  }`}
                  disabled={loading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-black font-medium">Continue with Google</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              {/* OTP Input */}
              <div className="mb-6">
                <div className="flex justify-between space-x-2 mb-4">
                  {otp.map((digit, index) => (
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
                    OTP sent to {formData.current.email}
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
                    setOtp(Array(6).fill(""));
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
                    "Create Account"
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