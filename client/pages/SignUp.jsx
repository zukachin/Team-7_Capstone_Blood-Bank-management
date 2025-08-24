import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { userId } = await api.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        password: form.password,
      });
      navigate(`/verify-otp?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      setErr(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-center">
            Create Your Account
          </h1>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12 md:gap-y-6 bg-gray-900/40 border border-gray-800 rounded-2xl p-6"
          >
            {err && <div className="text-red-400 text-sm col-span-2">{err}</div>}

            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Enter full name"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Enter email"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Enter phone number"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Street / Address</label>
                <input
                  name="street"
                  value={form.street}
                  onChange={onChange}
                  placeholder="Enter street"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="Enter city"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={onChange}
                  placeholder="Enter state"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={onChange}
                  placeholder="Enter pincode"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Create password"
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex flex-col space-y-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors duration-200 disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Register"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full bg-transparent border border-gray-600 hover:border-red-500 text-white py-3 rounded-lg transition-colors duration-200"
              >
                Back to Home
              </button>

              <p className="text-sm text-gray-400 text-center">
                Already have an account?{" "}
                <a href="/login" className="text-red-400 hover:underline">
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
