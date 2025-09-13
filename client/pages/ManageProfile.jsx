// client/pages/ManageProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ManageProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token"); // JWT from login

  // redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
  async function fetchProfile() {
    try {
      const data = await api.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchProfile();
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
  try {
    await api.updateProfile(profileData);
    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Update failed:", err);
    alert("Failed to update profile");
  }
};

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!profileData) return <div>No profile data</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-start justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-10 text-center">Manage Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg mb-2">Email:</label>
                <div className="border-b border-gray-700 py-2 text-gray-400 text-lg opacity-60">
                  {profileData.email}
                </div>
                <p className="text-gray-500 text-sm">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-lg mb-2">Full Name:</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg mb-2">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">Gender:</label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-lg mb-2">State ID:</label>
                <input
                  type="text"
                  name="state_id"
                  value={profileData.state_id}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">District:</label>
                <select
                  name="district_id"
                  value={profileData.district_id}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.district_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg mb-2">Blood Group:</label>
                <select
                  name="blood_group_id"
                  value={profileData.blood_group_id}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12 space-x-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleBackToHome}
              className="text-white hover:text-red-400 transition-colors text-lg"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
