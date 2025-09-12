import React, { useState } from "react";

export default function DonorCounseling() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/donors/counseling`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Failed to add counseling");
      setMessage("Counseling added successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-xl p-10">
      <h2 className="text-3xl font-extrabold mb-10 text-center text-red-500">
        Donor Counseling
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-center font-medium ${
            message.includes("success")
              ? "bg-green-700 text-green-200"
              : "bg-red-700 text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Fields */}
        {[
          { label: "Donor ID", name: "donor_id", type: "text" },
          { label: "Counseling Date", name: "counseling_date", type: "datetime-local" },
          { label: "Height (cm)", name: "height", type: "number" },
          { label: "Weight (kg)", name: "weight", type: "number" },
          { label: "Hb Level (g/dl)", name: "hb_level", type: "text" },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              {field.label}
            </label>
            <input
              name={field.name}
              type={field.type}
              placeholder={`Enter ${field.label}`}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            />
          </div>
        ))}

        {/* Checkboxes */}
        {[
          { name: "drunk_last_12hrs", label: "Drunk in last 12hrs" },
          { name: "well_today", label: "Well Today" },
          { name: "under_medication", label: "Under Medication" },
          { name: "fever_in_2_weeks", label: "Fever in last 2 weeks" },
          { name: "recently_delivered", label: "Recently Delivered" },
          { name: "pregnancy", label: "Pregnancy" },
          { name: "surgery", label: "Recent Surgery" },
        ].map((cb, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              type="checkbox"
              onChange={(e) =>
                handleChange({
                  target: { name: cb.name, value: e.target.checked },
                })
              }
              className="w-5 h-5 accent-red-600 hover:scale-110 transition-transform"
            />
            <label className="text-gray-300">{cb.label}</label>
          </div>
        ))}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Disease History
          </label>
          <textarea
            name="disease_history"
            rows="3"
            placeholder="Enter disease history"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Status
          </label>
          <select
            name="status"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select status</option>
            <option>Approved</option>
            <option>Deferred</option>
            <option>Pending</option>
          </select>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center mt-8">
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-12 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
          >
            Save Counseling
          </button>
        </div>
      </form>
    </div>
  );
}
