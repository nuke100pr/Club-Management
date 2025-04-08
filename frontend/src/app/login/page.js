"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import landscapeImage from "../../../public/img1.jpg";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  // Check for authentication tokens on page load (for OAuth redirects)
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    
    // If token exists in URL (from Google OAuth redirect)
    if (token && userParam) {
      try {
        // Parse user data and store in localStorage
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("user", JSON.stringify(user));
        
        // Store token in cookies
        Cookies.set("auth_token", token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 30 // 30 days
        });
        
        // Show success message and redirect
        setMessage({ type: "success", text: "Google login successful! Redirecting..." });
        setTimeout(() => {
          router.push("/home");
        }, 1000);
      } catch (error) {
        setMessage({ type: "error", text: "Failed to process authentication" });
      }
    }
  }, [router]);

  const validateEmail = (email) => {
    // return email.endsWith("@iitrpr.ac.in");
    return true;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = "http://localhost:5000/users/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.email || !formData.password) {
      setMessage({ type: "error", text: "Email and password are required" });
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setMessage({
        type: "error",
        text: "Please use your college email (@iitrpr.ac.in)",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Login request
      const response = await fetch("http://localhost:5000/users/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token in cookies
      if (data.token) {
        const cookieOptions = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        };

        if (rememberMe) {
          cookieOptions.expires = 30; // 30 days
        }

        Cookies.set("auth_token", data.token, cookieOptions);

        // Store user data in localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }

      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      // Redirect after successful login
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#ffffff]">
      {/* Left Side with Image */}
      <div className="hidden md:block md:w-1/2 relative bg-[#30C1E0]">
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
            <h2 className="text-4xl font-bold mb-2">Welcome Back</h2>
            <h2 className="text-4xl font-bold mb-8">
              Let's Continue Your Journey
            </h2>
            <div className="flex space-x-2">
              <div className="w-6 h-1 bg-white rounded-full"></div>
              <div className="w-6 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-6 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Back button for mobile */}
          <div className="md:hidden mb-6">
            <Link href="/" className="text-[#002F60] flex items-center">
              <span>Back to website</span>
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              className="text-[#002F60] bg-[#E1F5FE] px-4 py-2 rounded-full flex items-center"
            >
              <span>Back to website</span>
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
            <h1 className="text-4xl font-bold text-[#002F60]">Log in</h1>
            <p className="mt-2 text-[#2A93D5]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#002F60] underline">
                Sign up
              </Link>
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-[#30C1E0] rounded-md bg-[#E1F5FE] text-[#002F60] focus:outline-none focus:ring-2 focus:ring-[#002F60]"
                disabled={loading}
              />
            </div>

            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-[#30C1E0] rounded-md bg-[#E1F5FE] text-[#002F60] pr-10 focus:outline-none focus:ring-2 focus:ring-[#002F60]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2A93D5]"
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

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 h-5 w-5 border-[#30C1E0] rounded accent-[#002F60]"
                  disabled={loading}
                />
                <label htmlFor="remember" className="text-sm text-[#002F60]">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-[#002F60] underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`w-full font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center ${
                loading
                  ? "bg-[#30C1E0] cursor-not-allowed"
                  : "bg-[#2A93D5] hover:bg-[#002F60] text-white"
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
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
            
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-[#30C1E0]"></div>
              <span className="px-4 text-sm text-[#002F60]">or</span>
              <div className="flex-grow border-t border-[#30C1E0]"></div>
            </div>
            
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-[#30C1E0] text-[#002F60] font-medium py-3 px-4 rounded-md transition duration-300 hover:bg-[#E1F5FE] flex justify-center items-center"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}