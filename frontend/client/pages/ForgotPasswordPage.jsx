// ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setErr("Please enter your email.");
      return;
    }

    setErr(""); setMsg(""); setLoading(true);
    try {
      await api.forgotPassword({ email: formData.email });
      setMsg("OTP sent to your email.");
      setStep(2);
    } catch (error) {
      setErr(error?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReset = async () => {
    if (!/^\d{6}$/.test(formData.otp)) {
      setErr("OTP must be a 6-digit number.");
      return;
    }
    if (!formData.newPassword) {
      setErr("Please enter your new password.");
      return;
    }

    setErr(""); setMsg(""); setLoading(true);
    try {
      await api.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      setMsg("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErr(error?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate("/login");
  const handleBackToHome = () => navigate("/");

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md p-6 bg-neutral-900 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h1>

        {err && <div className="text-red-400 text-sm mb-3 text-center">{err}</div>}
        {msg && <div className="text-green-400 text-sm mb-3 text-center">{msg}</div>}

        {step === 1 ? (
          // Step 1: Send OTP
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your registered email"
                className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        ) : (
          // Step 2: Reset Password
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full bg-transparent border-b border-gray-600 py-2 text-white opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleSubmitReset}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}

        <div className="flex flex-col items-center mt-6 space-y-2">
          <button
            onClick={handleBackToLogin}
            className="text-red-400 hover:text-red-300 text-sm underline"
          >
            Back to Login
          </button>
          <button
            onClick={handleBackToHome}
            className="text-white hover:text-red-400 text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
