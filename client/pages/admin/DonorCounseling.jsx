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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/donors/counseling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add counseling");
      setMessage("Counseling added successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-500">
        Donor Counseling
        </h2>

        {message && (
        <p className="text-center mb-6 text-green-400 font-medium">{message}</p>
        )}

        <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
        {/* Donor ID */}
        <div>
            <label className="block text-sm mb-2">Donor ID</label>
            <input
            name="donor_id"
            placeholder="Enter Donor ID"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            />
        </div>

        {/* Counseling Date */}
        <div>
            <label className="block text-sm mb-2">Counseling Date</label>
            <input
            name="counseling_date"
            type="datetime-local"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            />
        </div>

        {/* Height */}
        <div>
            <label className="block text-sm mb-2">Height (cm)</label>
            <input
            name="height"
            placeholder="Enter height"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            />
        </div>

        {/* Weight */}
        <div>
            <label className="block text-sm mb-2">Weight (kg)</label>
            <input
            name="weight"
            placeholder="Enter weight"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            />
        </div>

        {/* Hb Level */}
        <div>
            <label className="block text-sm mb-2">Hb Level (g/dl)</label>
            <input
            name="hb_level"
            placeholder="Enter Hb level"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="drunk_last_12hrs"
            onChange={(e) =>
                handleChange({ target: { name: "drunk_last_12hrs", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Drunk in last 12hrs</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="well_today"
            onChange={(e) =>
                handleChange({ target: { name: "well_today", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Well Today</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="under_medication"
            onChange={(e) =>
                handleChange({ target: { name: "under_medication", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Under Medication</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="fever_in_2_weeks"
            onChange={(e) =>
                handleChange({ target: { name: "fever_in_2_weeks", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Fever in last 2 weeks</label>
        </div>

        {/* Extra fields */}
        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="recently_delivered"
            onChange={(e) =>
                handleChange({ target: { name: "recently_delivered", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Recently Delivered</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="pregnancy"
            onChange={(e) =>
                handleChange({ target: { name: "pregnancy", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Pregnancy</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="surgery"
            onChange={(e) =>
                handleChange({ target: { name: "surgery", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Recent Surgery</label>
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm mb-2">Disease History</label>
            <textarea
            name="disease_history"
            placeholder="Enter disease history"
            onChange={handleChange}
            rows="3"
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            ></textarea>
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm mb-2">Status</label>
            <select
            name="status"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition"
            >
            <option value="">Select status</option>
            <option value="Approved">Approved</option>
            <option value="Deferred">Deferred</option>
            <option value="Pending">Pending</option>
            </select>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center mt-6">
            <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-lg transition-colors text-lg"
            type="submit"
            >
            Save Counseling
            </button>
        </div>
        </form>
    </div>
    );

}
