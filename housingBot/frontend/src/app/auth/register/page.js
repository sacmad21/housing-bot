"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  KeyRound,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    religion: "",
    subscription: "Free",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [religionDropdownOpen, setReligionDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const religionDropdownRef = useRef(null);
  const religionContainerRef = useRef(null);

  const router = useRouter();

  // Religion options
  const religionOptions = [
    "Christianity",
    "Islam",
    "Hinduism",
    "Buddhism",
    "Judaism",
    "Sikhism",
    "Other",
    "Prefer not to say",
  ];

  // Check system preference for dark mode on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(isDarkMode);
    }
  }, []);

  // Determine dropdown position based on available space
  useEffect(() => {
    const handleReligionDropdownPosition = () => {
      if (religionContainerRef.current && religionDropdownRef.current) {
        const containerRect =
          religionContainerRef.current.getBoundingClientRect();
        const containerBottom = containerRect.bottom;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 220; // Approximate max height of dropdown

        // If there's not enough space below, position the dropdown above
        if (containerBottom + dropdownHeight > viewportHeight) {
          setDropdownPosition("top");
        } else {
          setDropdownPosition("bottom");
        }
      }
    };

    if (religionDropdownOpen) {
      handleReligionDropdownPosition();
    }
  }, [religionDropdownOpen]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};

    // Trim values before validation
    const cleanedForm = {
      ...form,
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
      confirmPassword: form.confirmPassword.trim(),
    };

    if (!cleanedForm.username) newErrors.username = "Username is required";
    if (!cleanedForm.email || !/^\S+@\S+\.\S+$/.test(cleanedForm.email))
      newErrors.email = "Enter a valid email";
    if (!cleanedForm.phone || !/^\d{10}$/.test(cleanedForm.phone))
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (cleanedForm.password.includes(" ")) {
      newErrors.password = "Password should not contain spaces";
    }
    if (
      !cleanedForm.password ||
      cleanedForm.password.length < 6 ||
      cleanedForm.password.length > 14
    )
      newErrors.password = "Password must be 6-14 characters";
    if (cleanedForm.password !== cleanedForm.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.religion) newErrors.religion = "Religion is required";

    console.log(cleanedForm);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Gender Selection
  const handleGenderSelect = (value) => {
    setForm((prevForm) => ({ ...prevForm, gender: value }));
    setGenderDropdownOpen(false);
  };

  // Handle Religion Selection
  const handleReligionSelect = (value) => {
    setForm((prevForm) => ({ ...prevForm, religion: value }));
    setReligionDropdownOpen(false);
  };

  // Handle Input Change with Trimming
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value.trimStart(), // Prevents leading spaces
    }));
  };

  // Handle Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setLoading(true);

    // Ensure trimmed values are used
    const cleanedForm = {
      ...form,
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
    };

    setForm(cleanedForm);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const submitData = { ...cleanedForm };
      delete submitData.confirmPassword; // Remove confirmPassword from data to be sent

      await axios.post("/api/auth/register", submitData);

      // Facebook-Themed Toast Notification
      toast.success("Registration Successful! Redirecting...", {
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
      setServerError("");
      toast.error(error.response?.data?.error || "Something went wrong", {
        style: { background: "#DC2626", color: "#fff", borderRadius: "8px" },
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        religionDropdownRef.current &&
        religionContainerRef.current &&
        !religionContainerRef.current.contains(event.target) &&
        !religionDropdownRef.current.contains(event.target)
      ) {
        setReligionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
        </div>

        <div className="p-5">
          {/* API Errors */}
          {serverError && (
            <div className="bg-red-500 text-white px-3 py-2 rounded mb-3 text-center text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username */}
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
                size={16}
              />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Username"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs">{errors.username}</p>
            )}

            {/* Email */}
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
                size={16}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Email"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}

            {/* Phone */}
            <div className="relative">
              <Phone
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
                size={16}
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Phone"
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-xs">{errors.phone}</p>
            )}

            {/* Password */}
            <div className="relative">
              <KeyRound
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-9 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Password"
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
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password}</p>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <KeyRound
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
                size={16}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-9 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#4267B2] ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
            )}

            {/* Gender Dropdown */}
            <div className="relative">
              <div
                className={`w-full px-3 py-2 border rounded-md flex items-center justify-between cursor-pointer ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white hover:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 hover:border-[#4267B2]"
                }`}
                onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
              >
                <span
                  className={
                    form.gender
                      ? ""
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }
                >
                  {form.gender || "Select Gender"}
                </span>
                <ChevronDown
                  size={16}
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-400"
                  } transition-transform ${
                    genderDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {genderDropdownOpen && (
                <div
                  className={`absolute z-10 mt-1 w-full border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div
                    className={`px-3 py-2 cursor-pointer ${
                      darkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => handleGenderSelect("Male")}
                  >
                    Male
                  </div>
                  <div
                    className={`px-3 py-2 cursor-pointer ${
                      darkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => handleGenderSelect("Female")}
                  >
                    Female
                  </div>
                  <div
                    className={`px-3 py-2 cursor-pointer ${
                      darkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => handleGenderSelect("Other")}
                  >
                    Other
                  </div>
                </div>
              )}
            </div>
            {errors.gender && (
              <p className="text-red-400 text-xs">{errors.gender}</p>
            )}

            {/* Religion Dropdown */}
            <div className="relative" ref={religionContainerRef}>
              <div
                className={`w-full px-3 py-2 border rounded-md flex items-center justify-between cursor-pointer ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white hover:border-blue-400"
                    : "bg-white border-gray-300 text-gray-900 hover:border-[#4267B2]"
                }`}
                onClick={() => setReligionDropdownOpen(!religionDropdownOpen)}
              >
                <span
                  className={
                    form.religion
                      ? ""
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }
                >
                  {form.religion || "Select Religion"}
                </span>
                <ChevronDown
                  size={16}
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-400"
                  } transition-transform ${
                    religionDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {religionDropdownOpen && (
                <div
                  ref={religionDropdownRef}
                  className={`absolute z-10 w-full border rounded-md max-h-48 overflow-y-auto ${
                    dropdownPosition === "top"
                      ? "bottom-full mb-1"
                      : "top-full mt-1"
                  } ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                  style={{
                    maxHeight: "192px", // 6 items × 32px per item
                  }}
                >
                  {religionOptions.map((religion) => (
                    <div
                      key={religion}
                      className={`px-3 py-2 cursor-pointer ${
                        darkMode
                          ? "text-white hover:bg-gray-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={() => handleReligionSelect(religion)}
                    >
                      {religion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.religion && (
              <p className="text-red-400 text-xs">{errors.religion}</p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className={`w-full py-2 mt-2 bg-[#4267B2] text-white rounded-md font-medium transition-all duration-200 ${
                loading ? "opacity-75 cursor-not-allowed" : "hover:bg-[#365899]"
              }`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Login Link */}
            <p
              className={`text-center text-xs mt-2 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-[#4267B2] hover:underline font-medium"
              >
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
