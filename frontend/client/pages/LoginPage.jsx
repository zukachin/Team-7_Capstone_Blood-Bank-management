import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      const token =
        res?.token || res?.data?.token || res?.accessToken || res?.access_token;
      if (!token) throw new Error("Login response did not include a token");

      api.setToken(token);
      localStorage.setItem(
        "user",
        JSON.stringify(res?.user || res?.data?.user || { email: form.email })
      );

      // 🎉 Success popup
      // toast.success("Logged in successfully — Welcome back, Donor!❤️", {
      //   position: "top-center",
      //   autoClose: 6000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   theme: "dark",
      //   style: {
      //     background: "#1a1a1a",
      //     color: "#e01e1eff",
      //     fontWeight: "bold",
      //     border: "1px solid #b91c1c",
      //     borderRadius: "12px",
      //   },
      // });
      toast.success("Logged in successfully — Welcome back, Donor!❤️", {
  position: "top-center",
  autoClose: 6000,
  hideProgressBar: true,  // removes the flashy bar
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  icon: false, // 🚫 no green tick
  theme: "dark",
  style: {
    background: "#3c3c3cff",       // softer black
    color: "#fca5a5",         // subtle soft red (rose-400)
    fontWeight: "500",        // normal weight, not too bold
    border: "1px solid #374151", // gray border instead of bright red
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)", // soft shadow
  },
});


      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (e) {
      console.error("Login failed:", e);
      setErr(e.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-500">
          Login
        </h2>

        {err && (
          <div className="bg-red-800 text-red-200 text-center p-2 rounded mb-4 animate-pulse">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">email</label>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="you@example.com"
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              placeholder="••••••••"
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-red-400 hover:text-red-300 underline transition"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-800 hover:bg-red-600 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-red-500 hover:text-red-400 font-semibold underline"
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
