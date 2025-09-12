import React, { useState } from "react";

export default function DonorRegister() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_ADMIN_BASE_URL}/admin/donors/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Failed to register donor");
      setMessage("Donor registered successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-xl p-10">
      <h2 className="text-3xl font-extrabold mb-10 text-center text-red-500">
        Register Donor
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
          { label: "First Name", name: "first_name", type: "text" },
          { label: "Last Name", name: "last_name", type: "text" },
          { label: "Date of Birth", name: "dob", type: "date" },
          { label: "Age", name: "age", type: "number" },
          { label: "Mobile No", name: "mobile_no", type: "text" },
          { label: "Email", name: "email", type: "email", span: 2 },
          { label: "Address", name: "address", type: "text", span: 2 },
          { label: "District", name: "district", type: "text" },
          { label: "State", name: "state", type: "text" },
          { label: "Country", name: "country", type: "text" },
          { label: "Centre ID", name: "centre_id", type: "text" },
          { label: "Camp ID", name: "camp_id", type: "number" },
        ].map((field, idx) => (
          <div
            key={idx}
            className={field.span === 2 ? "md:col-span-2" : ""}
          >
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

        {/* Selects */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Gender
          </label>
          <select
            name="gender"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Blood Group
          </label>
          <select
            name="blood_group_id"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select blood group</option>
            <option value="1">A+</option>
            <option value="2">A-</option>
            <option value="3">B+</option>
            <option value="4">B-</option>
            <option value="5">AB+</option>
            <option value="6">AB-</option>
            <option value="7">O+</option>
            <option value="8">O-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Marital Status
          </label>
          <select
            name="marital_status"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select status</option>
            <option>Single</option>
            <option>Married</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Registration Type
          </label>
          <select
            name="registration_type"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select type</option>
            <option value="Centre">Centre</option>
            <option value="Camp">Camp</option>
          </select>
        </div>

        {/* Checkboxes */}
        {[
          { name: "donated_previously", label: "Donated Previously" },
          { name: "willing_future_donation", label: "Willing for Future Donation" },
          { name: "contact_preference", label: "Allow Contact" },
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

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center mt-8">
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-12 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
          >
            Register Donor
          </button>
        </div>
      </form>
    </div>
  );
}
