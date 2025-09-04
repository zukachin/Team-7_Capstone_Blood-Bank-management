import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_ADMIN_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("role", "admin");

      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <form
        onSubmit={handleLogin}
        className="bg-gray-800 text-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-700"
        >
        {/* Title */}
        <h2 className="text-3xl font-bold mb-8 text-center text-red-500">
            Admin Login
        </h2>

        {/* Error Message */}
        {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Username */}
        <div className="mb-5">
            <input
            type="text"
            placeholder="Username"
            className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
        </div>

        {/* Password */}
        <div className="mb-6">
            <input
            type="password"
            placeholder="Password"
            className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
        </div>

        {/* Login Button */}
        <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200"
        >
            Login
        </button>
        </form>
    </div>
    );


}
