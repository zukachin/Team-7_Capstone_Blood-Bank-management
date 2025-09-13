import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

/**
 * VerifyOtp page
 * Accepts query params: userId and/or email
 * Calls api.verifyOtp({ email, otp }) or api.verifyOtp({ userId, otp })
 * On success, if response contains token -> save and navigate to donor portal
 * Otherwise navigate to /login
 */

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

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const payload = email ? { email, otp } : { userId, otp };
      const res = await api.verifyOtp(payload);

      // If backend returns a token after verification, store it and go to portal
      const token = res?.token || res?.data?.token || res?.accessToken || res?.access_token;
      // if (token) {
      //   api.setToken(token);
      //   navigate("/donor-portal", { replace: true });
      //   return;
      // }

      // otherwise show success and redirect to login
      setMsg("Verification successful. Please login.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      console.error("Verify failed:", e);
      setErr(e.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setErr(""); setMsg(""); setLoading(true);
    try {
      const payload = email ? { email } : { userId };
      await api.resendOtp(payload);
      setMsg("OTP resent. Check your email.");
    } catch (e) {
      console.error("Resend failed:", e);
      setErr(e.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Verify your account</h2>

        {email && <p className="text-sm mb-2 text-gray-300">Verification email: <b>{email}</b></p>}
        {msg && <div className="text-green-400 mb-3">{msg}</div>}
        {err && <div className="text-red-400 mb-3">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Enter OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-transparent border-b border-gray-600 py-2"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
              {loading ? "Verifying..." : "Verify"}
            </button>

            <button type="button" onClick={onResend} disabled={loading}
              className="bg-transparent border border-gray-700 hover:border-red-500 px-4 py-2 rounded-lg">
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
