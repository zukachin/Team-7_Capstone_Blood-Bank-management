import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

/**
 * Login page that uses api.login and stores token via api.setToken
 * On successful login navigates to previous location or /donor-portal
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/donor-portal";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.login({ email: form.email, password: form.password });
      const token = res?.token || res?.data?.token || res?.accessToken || res?.access_token;
      // if (token) {
      //   api.setToken(token);
      //   navigate(from, { replace: true });
      // } else {
      //   // If server didn't return token, still navigate to donor portal
      //   navigate(from, { replace: true });
      // }
      if (!token) throw new Error("Login response did not include a token");

      // Store token with your API helper
      api.setToken(token);

      // Store user info in localStorage for other pages to access
      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      } else if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        // Fallback if user info is missing (optional)
        localStorage.setItem("user", JSON.stringify({ email: form.email }));
      }
      navigate("/", { replace: true });
    } catch (e) {
      console.error("Login failed:", e);
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {err && <div className="text-red-400 mb-3">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input name="email" value={form.email} onChange={onChange} required
              className="w-full bg-transparent border-b border-gray-600 py-2" />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full bg-transparent border-b border-gray-600 py-2"
            />

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-red-400 hover:text-red-300 underline"
              >
                Forgot password?
              </button>
            </div>
          </div>


          <div className="flex items-center justify-between gap-4">
            <button type="submit" disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold">
              {loading ? "Logging in..." : "Login"}
            </button>

            <button type="button" onClick={() => navigate("/signup")}
              className="bg-transparent border border-gray-700 hover:border-red-500 px-4 py-2 rounded-lg">
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
