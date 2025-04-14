"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Import all background images
// Note: You'll need to add these images to your public directory
import img1 from "../../../public/img1.jpg";
import img2 from "../../../public/img2.jpg";
import img3 from "../../../public/img3.jpg";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  // State for the image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [img1, img2, img3];
  
  const router = useRouter();

  // Image rotation effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Check for authentication tokens on page load (for OAuth redirects)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("user", JSON.stringify(user));
        
        Cookies.set("auth_token", token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 30
        });
        
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
    return true; // For testing purposes
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

      if (data.token) {
        const cookieOptions = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 30*10000
        };

        Cookies.set("auth_token", data.token, cookieOptions);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }

      setMessage({ type: "success", text: "Login successful! Redirecting..." });

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

  // Function to render slide indicators
  const renderSlideIndicators = () => {
    return (
      <div className="flex space-x-2">
        {backgroundImages.map((_, index) => (
          <div 
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? "w-12 bg-white" 
                : "w-6 bg-white/40"
            }`}
            onClick={() => setCurrentImageIndex(index)}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8faff] font-['Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif]">
      {/* Left Side with Image Carousel */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="relative w-full h-full">
          {/* Image Carousel */}
          {backgroundImages.map((img, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
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
          
          {/* Primary Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4776E6] to-[#8E54E9] opacity-50 z-20"></div>
          
          {/* Bottom text and slide indicators */}
          <div className="absolute bottom-16 left-16 text-white z-30">
            <h2 className="text-4xl font-semibold mb-2">Welcome Back</h2>
            <h2 className="text-4xl font-semibold mb-8">
              Let's Continue Your Journey
            </h2>
            {renderSlideIndicators()}
          </div>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#4776E6] to-[#8E54E9] bg-clip-text text-transparent">Log in</h1>
            <p className="mt-2 text-[#607080]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#4776E6] hover:text-[#3a5fc0] font-medium transition duration-300">
                Sign up
              </Link>
            </p>
          </div>

          {/* Status Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                  : "bg-green-50 text-green-700 border-l-4 border-green-500"
              } transition-all duration-300 animate-fadeIn`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#607080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg bg-white text-[#2A3B4F] shadow-[0_2px_8px_rgba(95,150,230,0.1)] hover:shadow-[0_4px_15px_rgba(95,150,230,0.2)] focus:shadow-[0_4px_15px_rgba(95,150,230,0.2)] focus:outline-none focus:ring-2 focus:ring-[#4776E6] focus:border-transparent transition duration-300"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#607080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg bg-white text-[#2A3B4F] pr-10 shadow-[0_2px_8px_rgba(95,150,230,0.1)] hover:shadow-[0_4px_15px_rgba(95,150,230,0.2)] focus:shadow-[0_4px_15px_rgba(95,150,230,0.2)] focus:outline-none focus:ring-2 focus:ring-[#4776E6] focus:border-transparent transition duration-300"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#607080] hover:text-[#4776E6] transition duration-300"
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

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[#4776E6] hover:text-[#3a5fc0] font-medium transition duration-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`w-full font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center transform hover:-translate-y-1 
                ${loading 
                  ? "bg-opacity-70 cursor-not-allowed bg-gradient-to-r from-[#4776E6] to-[#8E54E9]"
                  : "bg-gradient-to-r from-[#4776E6] to-[#8E54E9] hover:from-[#3a5fc0] hover:to-[#7b46d7] text-white shadow-[0_4px_10px_rgba(71,118,230,0.3)] hover:shadow-[0_6px_15px_rgba(71,118,230,0.4)]"
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
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-sm text-[#607080]">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-200 text-[#2A3B4F] font-medium py-3 px-4 rounded-lg transition duration-300 hover:bg-gray-50 flex justify-center items-center shadow-[0_2px_8px_rgba(95,150,230,0.1)] hover:shadow-[0_4px_15px_rgba(95,150,230,0.15)] transform hover:-translate-y-1"
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
          
          {/* Additional info section */}
          <div className="mt-8 text-center text-xs text-[#607080]">
            <p>By logging in, you agree to our <a href="#" className="text-[#4776E6] hover:underline">Terms of Service</a> and <a href="#" className="text-[#4776E6] hover:underline">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}