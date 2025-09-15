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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-black p-10 rounded-2xl shadow-2xl w-96 border border-red-700 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-red-600 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-red-600 rounded-full opacity-20 blur-xl"></div>
        
        {/* Title */}
        <h2 className="text-3xl font-bold mb-8 text-center text-red-600 relative z-10">
          ADMIN ACCESS
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Username */}
        <div className="mb-5 relative z-10">
          <input
            type="text"
            placeholder="Username"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative z-10">
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-200 relative z-10 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          ACCESS SYSTEM
        </button>
        
        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-6 relative z-10">
          Restricted administrative access only
        </p>
      </form>
    </div>
  );
}