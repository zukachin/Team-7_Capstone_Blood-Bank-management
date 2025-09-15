import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001";

export default function CampForm({ organizerId }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [centres, setCentres] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Fetch states on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/states`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStates(Array.isArray(data) ? data : data.states || []))
      .catch((err) => console.error("Failed to fetch states:", err));
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict("");
      setCentres([]);
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/districts?state_id=${selectedState}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDistricts(Array.isArray(data) ? data : data.districts || []))
      .catch((err) => console.error("Failed to fetch districts:", err));
  }, [selectedState]);

  // Fetch centres when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setCentres([]);
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/centres?district_id=${selectedDistrict}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCentres(Array.isArray(data) ? data : data.centres || []))
      .catch((err) => console.error("Failed to fetch centres:", err));
  }, [selectedDistrict]);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in.");
      return;
    }

    const body = {
      organizer_id: organizerId,
      centre_id: form.get("centre_id"),
      state_id: form.get("state_id"),
      district_id: form.get("district_id"),
      camp_name: form.get("camp_name"),
      location: form.get("location"),
      camp_date: form.get("camp_date"),
      camp_time: form.get("camp_time"),
      has_venue: form.get("has_venue") === "on",
    };

    try {
      const res = await fetch(`${API_BASE}/api/camps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Camp creation failed");
      }

      alert("Camp created successfully!");
      e.target.reset();
      setSelectedState("");
      setSelectedDistrict("");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-red-500">Register a Camp</h2>
      
      <input
        name="camp_name"
        placeholder="Camp Name"
        required
        className="w-full p-2 rounded bg-gray-800"
      />
      <input
        name="location"
        placeholder="Location"
        required
        className="w-full p-2 rounded bg-gray-800"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          name="state_id"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          required
          className="p-2 rounded bg-gray-800"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.state_name || s.name}
            </option>
          ))}
        </select>

        <select
          name="district_id"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          required
          disabled={!selectedState}
          className="p-2 rounded bg-gray-800"
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.district_name || d.name}
            </option>
          ))}
        </select>

        <select
          name="centre_id"
          required
          disabled={!selectedDistrict}
          className="p-2 rounded bg-gray-800"
        >
          <option value="">Select Centre</option>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.centre_name || c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input type="date" name="camp_date" required className="p-2 rounded bg-gray-800" />
        <input type="time" name="camp_time" required className="p-2 rounded bg-gray-800" />
      </div>

      <label className="flex items-center space-x-2">
        <input type="checkbox" name="has_venue" />
        <span>Organizer provides venue</span>
      </label>

      <button type="submit" className="bg-red-600 px-4 py-2 rounded">
        Create Camp
      </button>
    </form>
  );
}
