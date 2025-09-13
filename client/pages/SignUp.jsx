import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

/**
 * SignUp.jsx
 * - fetches states, districts, blood groups
 * - submits payload that matches backend validators:
 *   { name, email, password, phone, gender, age, blood_group_id, state_id, district_id, address }
 */

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    age: "",
    blood_group_id: "", // <- important: numeric id expected by backend
    state_id: "",
    district_id: "",
    address: "",
  });

  // load states
  useEffect(() => {
    api.getStates()
      .then((res) => {
        // backend returns { states: [...] } earlier — handle both shapes
        const arr = res?.states ?? res?.data ?? res ?? [];
        setStates(Array.isArray(arr) ? arr : []);
      })
      .catch((e) => {
        console.error("Failed to load states:", e);
      });
  }, []);

  // load districts when state changes
  useEffect(() => {
    if (!form.state_id) {
      setDistricts([]);
      setForm((s) => ({ ...s, district_id: "" }));
      return;
    }
    api.getDistrictsByState(form.state_id)
      .then((res) => {
        const arr = res?.districts ?? res?.data ?? res ?? [];
        setDistricts(Array.isArray(arr) ? arr : []);
      })
      .catch((e) => {
        console.error("Failed to load districts:", e);
      });
  }, [form.state_id]);

  // load blood groups
  useEffect(() => {
    if (!api.getBloodGroups) return;
    api.getBloodGroups()
      .then((res) => {
        // many backends return array directly; some wrap in { blood_groups: [...] }
        const arr = res?.blood_groups ?? res?.data ?? res ?? [];
        setBloodGroups(Array.isArray(arr) ? arr : []);
      })
      .catch((e) => {
        console.error("Failed to load blood groups:", e);
      });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Validate all fields required by backend
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.phone.trim() ||
      !form.gender ||
      !form.age ||
      !form.blood_group_id ||
      !form.state_id ||
      !form.district_id ||
      !form.address.trim()
    ) {
      setErr("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Build payload using backend field names
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      gender: form.gender,
      age: Number(form.age),
      blood_group_id: Number(form.blood_group_id), // <- numeric id required
      state_id: Number(form.state_id),
      district_id: Number(form.district_id),
      address: form.address,
    };

    console.log("Register payload:", payload); // check in DevTools Network/Console

    try {
      const res = await api.register(payload);
      // backend may return { userId } or similar
      const userId = res?.userId || res?.user_id || res?.id || "";
      navigate(`/verify-otp?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      console.error("Register failed:", error);
      // If backend returns structured errors, show a friendly message
      const detail = error?.body ?? error?.message;
      setErr(typeof detail === "string" ? detail : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-neutral-900 p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Your Account</h1>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-y-6">
          {err && <div className="text-red-400 text-sm">{err}</div>}

          <div>
            <label className="block mb-2">Full Name</label>
            <input name="name" value={form.name} onChange={onChange} required
              className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block mb-2">Phone</label>
              <input name="phone" value={form.phone} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Password</label>
              <input name="password" type="password" value={form.password} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none" />
            </div>

            <div>
              <label className="block mb-2">Gender</label>
              <select name="gender" value={form.gender} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">Age</label>
              <input name="age" type="number" min="18" value={form.age} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white" />
            </div>

            <div>
              <label className="block mb-2">Blood Group</label>
              <select name="blood_group_id" value={form.blood_group_id} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white">
                <option value="">Select blood group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg.id} value={bg.id}>
                    {bg.group_name ?? bg.name ?? bg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">State</label>
              <select name="state_id" value={form.state_id} onChange={onChange} required
                className="w-full bg-black border-b border-gray-600 py-2 text-white">
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.state_name ?? s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2">District</label>
            <select name="district_id" value={form.district_id} onChange={onChange} required
              className="w-full bg-black border-b border-gray-600 py-2 text-white">
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name ?? d.district_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Address</label>
            <textarea name="address" value={form.address} onChange={onChange} rows={2}
              className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <button type="submit" disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold disabled:opacity-60">
              {loading ? "Registering..." : "Create Account"}
            </button>

            <button type="button" onClick={() => navigate("/login")}
              className="bg-transparent border border-gray-700 hover:border-red-500 px-6 py-2 rounded-lg">
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
