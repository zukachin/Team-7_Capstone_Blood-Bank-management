// client/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token, user } = await api.login(form); // ✅ backend returns token + user
      setAuthToken(token);
      localStorage.setItem("auth_user", JSON.stringify(user)); // ✅ persist user
      navigate("/"); // redirect after login (can be /dashboard if needed)
    } catch (error) {
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

        <form
          onSubmit={onSubmit}
          className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-lg"
        >
          {err && (
            <div className="text-red-400 text-sm text-center bg-red-900/40 py-2 rounded-lg">
              {err}
            </div>
          )}

          <input
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={onChange}
            required
          />

          <input
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={onChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 px-6 py-3 rounded-lg font-medium"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Don’t have an account?{" "}
            <a href="/signup" className="text-red-400 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
