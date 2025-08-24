import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // userId/email can arrive via query params (from signup)
  const userId = useMemo(() => params.get("userId") || "", [params]);
  const email = useMemo(() => params.get("email") || "", [params]);

  const onVerify = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      await api.verifyOtp({ userId, otp });
      setMsg("Email verified! You can login now.");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      setErr(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setErr(""); setMsg(""); setLoading(true);
    try {
      await api.resendOtp(userId);
      setMsg("OTP resent to your email.");
    } catch (error) {
      setErr(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Verify your email</h1>
        {email && <p className="text-gray-400 mb-6">We sent a 6-digit code to <span className="text-white">{email}</span></p>}

        <form onSubmit={onVerify} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-4">
          {err && <div className="text-red-400 text-sm">{err}</div>}
          {msg && <div className="text-green-400 text-sm">{msg}</div>}

          <input
            className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-3 tracking-widest text-center"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:opacity-60 px-6 py-2 rounded-lg">
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button type="button" onClick={onResend} disabled={loading} className="border border-gray-700 hover:border-red-500 px-6 py-2 rounded-lg">
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
