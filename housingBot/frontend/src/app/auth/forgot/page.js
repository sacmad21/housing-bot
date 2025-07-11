"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  RefreshCw,
  Send,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [countdown, setCountdown] = useState(0);

  const router = useRouter();

  // Check system preference for dark mode on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(isDarkMode);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (otpExpiresAt) {
      const timer = setInterval(() => {
        if (new Date() > new Date(otpExpiresAt)) {
          setOtpExpiresAt(null);
          toast.error("OTP has expired. Please request a new one.", {
            style: {
              background: "#DC2626",
              color: "#fff",
              borderRadius: "8px",
            },
            position: "top-center",
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiresAt]);

  // Send OTP only if phone number is registered
  const sendOtp = async () => {
    if (!phone) {
      setError("Enter your registered phone number!");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/forgot-password", { phone });

      setOtpSent(true);
      setOtpExpiresAt(response.data.expiresAt);

      // Set countdown time (e.g., 120 seconds)
      const expirationTime = Math.ceil(
        (new Date(response.data.expiresAt) - new Date()) / 1000
      );
      setCountdown(expirationTime > 0 ? expirationTime : 0);

      setError("");
      toast.success("OTP sent successfully!", {
        style: {
          background: "rgba(66, 103, 178, 0.9)",
          color: "#fff",
          borderRadius: "8px",
        },
        duration: 3000,
        position: "top-center",
      });
    } catch (error) {
      setError("");
      toast.error(
        error.response?.data?.error || "Phone number not registered.",
        {
          style: { background: "#DC2626", color: "#fff", borderRadius: "8px" },
          position: "top-center",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setError("Enter the OTP!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/verify-otp", { phone, otp });
      setOtpVerified(true);
      setError("");
      toast.success("OTP Verified! You can now reset your password.", {
        style: {
          background: "rgba(66, 103, 178, 0.9)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
        },
        duration: 3000,
        position: "top-center",
      });
    } catch (error) {
      setError("");
      toast.error(error.response?.data?.error || "Invalid OTP", {
        style: { background: "#DC2626", color: "#fff", borderRadius: "8px" },
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on unmount
    } else if (countdown === 0 && otpSent) {
      setOtpExpiresAt(null);
      setOtpSent(false);
      toast.error("OTP has expired. Please request a new one.", {
        style: { background: "#DC2626", color: "#fff", borderRadius: "8px" },
        position: "top-center",
      });
    }
  }, [countdown, otpSent]);

  // Reset Password
  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6 || newPassword.length > 14) {
      setError("Password must be between 6 and 14 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { phone, otp, newPassword });
      toast.success("Password reset successful! Redirecting to login...", {
        style: {
          background: "rgba(66, 103, 178, 0.9)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
        },
        duration: 3000,
        position: "top-center",
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      setError("");
      toast.error(error.response?.data?.error || "Password reset failed.", {
        style: { background: "#DC2626", color: "#fff", borderRadius: "8px" },
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative font-['Poppins',sans-serif] ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Toast Notification System */}
      <Toaster />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-5 right-5 p-2 rounded-full z-50 ${
          darkMode ? "bg-gray-700 text-white-300" : "bg-white text-gray-800"
        }`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div
        className={`max-w-md w-full rounded-lg overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header - slimmer */}
        <div className="relative h-32 bg-[#4267B2] flex items-center justify-center">
          <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
        </div>

        <div className="p-5">
          {/* API Errors */}
          {error && (
            <div className="bg-red-500 text-white px-3 py-2 rounded mb-3 text-center text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Phone Number Input */}
            {!otpVerified && (
              <div className="relative">
                <Phone
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-300" : "text-gray-400"
                  }`}
                  size={16}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter phone number"
                  disabled={otpSent}
                />
              </div>
            )}

            {/* Send OTP Button */}
            {!otpSent && (
              <button
                type="button"
                onClick={sendOtp}
                className={`w-full py-2 mt-2 bg-[#4267B2] text-white rounded-md font-medium transition-all duration-200 flex items-center justify-center ${
                  loading
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:bg-[#365899]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send OTP
                  </>
                )}
              </button>
            )}

            {/* OTP Input & Verify Button */}
            {otpSent && !otpVerified && (
              <>
                <div className="relative">
                  <KeyRound
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? "text-gray-300" : "text-gray-400"
                    }`}
                    size={16}
                  />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter OTP"
                  />
                </div>

                <button
                  type="button"
                  onClick={verifyOtp}
                  className={`w-full py-2 mt-2 bg-[#4267B2] text-white rounded-md font-medium transition-all duration-200 flex items-center justify-center ${
                    loading
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-[#365899]"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    "Verifying..."
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Verify OTP
                    </>
                  )}
                </button>

                {/* OTP Expiration Timer */}
                {otpExpiresAt && countdown > 0 && (
                  <p
                    className={`text-sm text-center mt-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    OTP expires in{" "}
                    <span className="font-semibold">{countdown}</span> seconds.
                  </p>
                )}
              </>
            )}

            {/* New Password Input */}
            {otpVerified && (
              <>
                <div className="relative">
                  <KeyRound
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? "text-gray-300" : "text-gray-400"
                    }`}
                    size={16}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetPassword}
                  className={`w-full py-2 mt-2 bg-[#4267B2] text-white rounded-md font-medium transition-all duration-200 flex items-center justify-center ${
                    loading
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-[#365899]"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    "Resetting..."
                  ) : (
                    <>
                      <RefreshCw size={16} className="mr-2" />
                      Reset Password
                    </>
                  )}
                </button>
              </>
            )}

            {/* Login Link */}
            <p
              className={`text-center text-xs mt-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Remember your password?{" "}
              <a
                href="/auth/login"
                className="text-[#4267B2] hover:underline font-medium"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
