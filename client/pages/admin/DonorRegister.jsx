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
      const res = await fetch(`${import.meta.env.VITE_ADMIN_BASE_URL}/admin/donors/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to register donor");
      setMessage("Donor registered successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-500">
        Register Donor
        </h2>

        {message && (
        <p className="text-center mb-6 text-green-400 font-medium">{message}</p>
        )}

        <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
        {/* Basic Info */}
        <div>
            <label className="block text-sm mb-2">First Name</label>
            <input
            name="first_name"
            placeholder="Enter first name"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Last Name</label>
            <input
            name="last_name"
            placeholder="Enter last name"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Date of Birth</label>
            <input
            name="dob"
            type="date"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Age</label>
            <input
            name="age"
            placeholder="Enter age"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Gender</label>
            <select
            name="gender"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            </select>
        </div>

        <div>
            <label className="block text-sm mb-2">Mobile No</label>
            <input
            name="mobile_no"
            placeholder="Enter mobile number"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm mb-2">Email</label>
            <input
            name="email"
            placeholder="Enter email"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        {/* Extended Fields */}
        <div>
            <label className="block text-sm mb-2">Blood Group</label>
            <select
            name="blood_group_id"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
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
            <label className="block text-sm mb-2">Marital Status</label>
            <select
            name="marital_status"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            >
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            </select>
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm mb-2">Address</label>
            <input
            name="address"
            placeholder="Enter address"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">District</label>
            <input
            name="district"
            placeholder="Enter district"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">State</label>
            <input
            name="state"
            placeholder="Enter state"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Country</label>
            <input
            name="country"
            placeholder="Enter country"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Centre ID</label>
            <input
            name="centre_id"
            placeholder="Enter centre ID"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Camp ID</label>
            <input
            name="camp_id"
            type="number"
            placeholder="Enter camp ID"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            />
        </div>

        <div>
            <label className="block text-sm mb-2">Registration Type</label>
            <select
            name="registration_type"
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-red-500 focus:outline-none transition-colors"
            >
            <option value="">Select type</option>
            <option value="Centre">Centre</option>
            <option value="Camp">Camp</option>
            </select>
        </div>

        {/* Boolean Fields */}
        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="donated_previously"
            onChange={(e) =>
                handleChange({ target: { name: "donated_previously", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Donated Previously</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="willing_future_donation"
            onChange={(e) =>
                handleChange({ target: { name: "willing_future_donation", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Willing for Future Donation</label>
        </div>

        <div className="flex items-center gap-3">
            <input
            type="checkbox"
            name="contact_preference"
            onChange={(e) =>
                handleChange({ target: { name: "contact_preference", value: e.target.checked } })
            }
            className="w-5 h-5 accent-red-600"
            />
            <label>Allow Contact</label>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center mt-6">
            <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-lg transition-colors text-lg"
            type="submit"
            >
            Register Donor
            </button>
        </div>
        </form>
    </div>
    );
}
