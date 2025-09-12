import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = forgot step, 2 = reset step
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setErr("Please enter your email");
      return;
    }
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await api.forgotPassword({ email: formData.email });
      setMsg("OTP sent to your email.");
      setStep(2);
    } catch (error) {
      setErr(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReset = async () => {
    if (!formData.otp || !formData.newPassword) {
      setErr("Please fill in all fields");
      return;
    }
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await api.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      setMsg("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErr(error.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate("/login");
  const handleBackToHome = () => navigate("/");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-md">
          <h1 className="text-5xl font-bold mb-12 text-center">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>

          {err && (
            <div className="text-red-400 text-sm text-center mb-4">
              {err}
            </div>
          )}
          {msg && (
            <div className="text-green-400 text-sm text-center mb-4">
              {msg}
            </div>
          )}

          {step === 1 ? (
            // Step 1: Forgot Password
            <div className="space-y-8">
              <div>
                <label className="block text-white text-lg mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Reset Password
            <div className="space-y-8">
              <div>
                <label className="block text-white text-lg mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg opacity-70"
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">OTP:</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">
                  New Password:
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSubmitReset}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                >
                  {loading ? "Resetting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col items-center space-y-4 mt-8">
            <button
              onClick={handleBackToLogin}
              className="text-red-400 hover:text-red-300 transition-colors text-base underline"
            >
              Back to Login
            </button>

            <button
              onClick={handleBackToHome}
              className="text-white hover:text-red-400 transition-colors text-lg font-medium"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
