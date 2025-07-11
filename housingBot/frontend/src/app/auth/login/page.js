"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  MessageSquare,
  KeyRound,
  User,
  Send,
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { login, isLoggedIn } from "@/lib/auth"; // ✅ Secure Login & Auth Handling

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");
  const [darkMode, setDarkMode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const router = useRouter();

  // Initialize dark mode from localStorage if available
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    } else {
      // Check user's system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (otpExpiresAt) {
      const updateCountdown = () => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.ceil((otpExpiresAt - now) / 1000));
        setRemainingTime(timeLeft);
  
        if (timeLeft === 0) {
          setOtpExpiresAt(null);
          setOtpSent(false);
          clearInterval(timer);
        }
      };
  
      updateCountdown(); // Initial call to set the remaining time immediately
      const timer = setInterval(updateCountdown, 1000);
  
      return () => clearInterval(timer);
    }
  }, [otpExpiresAt]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/chat"); // ✅ Redirect if already logged in
    }
  }, []);

  useEffect(() => {
    let timer;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        if (new Date() > otpExpiresAt) {
          setOtpExpiresAt(null);
          setOtpSent(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiresAt]);

  // ✅ Handle Login with Username & Password
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      if (response.status === 200) {
        login(response.data.token); // ✅ Store JWT token securely
        router.push(
          `/chat?username=${JSON.parse(response.config.data).username}`
        );
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send OTP
  const sendOtp = async () => {
    setError("");
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/auth/otp-login", { phone });

      if (response.status === 200) {
        setOtpSent(true);
        setOtpExpiresAt(new Date(response.data.expiresAt));
      } else {
        setError(response.data.error || "Failed to send OTP");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    setError("");
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/auth/verify-otp", { phone, otp });
      const username = response.data.username;

      if (response.status === 200) {
        login(response.data.token); // ✅ Store JWT token
        router.push(`/chat?username=${username}`);
      } else {
        setError(response.data.error || "Invalid OTP");
      }
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-montserrat ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-opacity-30 backdrop-blur-sm transition-all duration-300 z-10"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="text-white" size={24} />
        ) : (
          <Moon className="text-[#4267B2]" size={24} />
        )}
      </button>

      <div
        className={`max-w-md w-full rounded-xl overflow-hidden transition-colors duration-300 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* ✅ Header */}
        <div className="relative h-40 flex items-center justify-center bg-[#4267B2]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2 font-outfit">
              Welcome Back
            </h2>
            <p className="text-blue-100 text-sm">
              Sign in to continue your journey
            </p>
          </div>
        </div>

        {/* ✅ Error Display */}
        {error && (
          <div
            className={`p-3 text-sm text-center mt-3 ${
              darkMode ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-500"
            }`}
          >
            {error}
          </div>
        )}

        {/* ✅ Login Type Selection */}
        <div
          className={`flex mb-6 rounded-lg p-1 mt-6 mx-6 transition-colors ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <button
            className={`flex-1 py-2.5 rounded-md transition-all duration-300 text-sm font-medium ${
              activeTab === "credentials"
                ? darkMode
                  ? "bg-[#4267B2] text-white"
                  : "bg-[#4267B2] text-white"
                : darkMode
                ? "text-gray-300 hover:bg-gray-600"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("credentials")}
          >
            Password Login
          </button>
          <button
            className={`flex-1 py-2.5 rounded-md transition-all duration-300 text-sm font-medium ${
              activeTab === "otp"
                ? darkMode
                  ? "bg-[#4267B2] text-white"
                  : "bg-[#4267B2] text-white"
                : darkMode
                ? "text-gray-300 hover:bg-gray-600"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("otp")}
          >
            OTP Login
          </button>
        </div>

        <div className="px-8 pb-8">
          {activeTab === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* ✅ Username */}
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4267B2]"
                  size={18}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4267B2] focus:border-transparent transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "border-gray-200 text-gray-900"
                  }`}
                  placeholder="Username"
                  required
                />
              </div>

              {/* ✅ Password */}
              <div className="relative">
                <KeyRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4267B2]"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                  className={`w-full pl-10 pr-12 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4267B2] focus:border-transparent transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "border-gray-200 text-gray-900"
                  }`}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#4267B2] transition-colors ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ✅ Login Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg bg-[#4267B2] hover:bg-[#385998] text-white font-medium transition-all duration-300 transform active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
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
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* ✅ Phone Number Input */}
              <div className="relative">
                <MessageSquare
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4267B2]"
                  size={18}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4267B2] focus:border-transparent transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "border-gray-200 text-gray-900"
                  }`}
                  placeholder="Phone Number"
                  required
                />
              </div>

              {/* ✅ Send OTP / Verify OTP */}
              {!otpSent ? (
                <button
                  onClick={sendOtp}
                  className="w-full py-3.5 rounded-lg bg-[#4267B2] hover:bg-[#385998] text-white font-medium transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
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
                    </span>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send OTP
                    </>
                  )}
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`w-full px-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4267B2] focus:border-transparent transition-all duration-300 text-center tracking-widest font-medium text-lg ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-200 text-gray-900"
                    }`}
                    placeholder="Enter OTP"
                    required
                  />
                  <button
                    onClick={verifyOtp}
                    className="w-full py-3.5 rounded-lg bg-[#4267B2] hover:bg-[#385998] text-white font-medium transition-all duration-300 transform active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
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
                      </span>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                  <div className={`text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      {remainingTime > 0 ? <p>OTP expires in {remainingTime} seconds</p> : <p>OTP expired!</p>}
    </div>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm mt-6">
            { <a
              href="/auth/forgot"
              className={`hover:underline transition-colors ${
                darkMode
                  ? "text-[#4267B2] hover:text-blue-300"
                  : "text-[#4267B2] hover:text-blue-800"
              }`}
            >
              Forgot Password?
            </a> }
            <a
              href="/auth/register"
              className={`hover:underline transition-colors ${
                darkMode
                  ? "text-[#4267B2] hover:text-blue-300"
                  : "text-[#4267B2] hover:text-blue-800"
              }`}
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
