import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ManageProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!api.getToken()) {
      navigate("/login");
    }
  }, [navigate]);

  // Load profile, states, blood groups
  useEffect(() => {
    async function fetchData() {
      try {
        const [profile, bloodGroupsData, statesData] = await Promise.all([
          api.getProfile(),
          api.getBloodGroups(),
          api.getStates(),
        ]);

        setProfileData(profile);
        setBloodGroups(bloodGroupsData || []);
        setStates(statesData?.states || statesData || []);

        if (profile?.state_id) {
          const districtsData = await api.getDistrictsByState(profile.state_id);
          setDistricts(districtsData?.districts || districtsData || []);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  // Load districts when state changes
  useEffect(() => {
    async function fetchDistricts() {
      if (!profileData?.state_id) {
        setDistricts([]);
        return;
      }

      try {
        const districtsData = await api.getDistrictsByState(profileData.state_id);
        setDistricts(districtsData?.districts || districtsData || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
        setDistricts([]);
      }
    }

    fetchDistricts();
  }, [profileData?.state_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        age: Number(profileData.age),
        gender: profileData.gender,
        state_id: Number(profileData.state_id),
        district_id: Number(profileData.district_id),
        blood_group_id: Number(profileData.blood_group_id),
      };

      console.log("🚀 Payload being sent:", payload);
      await api.updateProfile(payload);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("❌ Failed to update profile. " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!profileData) return <div className="text-red-500 text-center">No profile data</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-start justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-10 text-center">Manage Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg mb-2">Email:</label>
                <div className="border-b border-gray-700 py-2 text-gray-400 text-lg opacity-60">
                  {profileData.email}
                </div>
              </div>

              <Input label="Full Name" name="name" value={profileData.name} onChange={handleInputChange} />
              <Input label="Phone" name="phone" value={profileData.phone} onChange={handleInputChange} />
              <Input label="Address" name="address" value={profileData.address} onChange={handleInputChange} />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <Input label="Age" name="age" type="number" value={profileData.age} onChange={handleInputChange} />

              <Select
                label="Gender"
                name="gender"
                value={profileData.gender}
                onChange={handleInputChange}
                options={["Male", "Female", "Other"]}
              />

              <Select
                label="State"
                name="state_id"
                value={profileData.state_id}
                onChange={handleInputChange}
                options={states}
                getOptionValue={(s) => s.id || s.state_id}
                getOptionLabel={(s) => s.name || s.state_name}
              />

              <Select
                label="District"
                name="district_id"
                value={profileData.district_id}
                onChange={handleInputChange}
                options={districts}
                disabled={!profileData.state_id}
                getOptionValue={(d) => d.id || d.district_id}
                getOptionLabel={(d) => d.name || d.district_name}
              />

              <Select
                label="Blood Group"
                name="blood_group_id"
                value={profileData.blood_group_id}
                onChange={handleInputChange}
                options={bloodGroups}
                getOptionValue={(g) => g.id}
                getOptionLabel={(g) => g.group_name}
              />
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
              onClick={() => navigate("/")}
              className="text-white hover:text-red-400 transition-colors text-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Input
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-lg mb-2">{label}:</label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full bg-transparent border-b border-gray-600 py-2 text-white"
      />
    </div>
  );
}

// Reusable Select
function Select({ label, name, value, onChange, options = [], getOptionValue, getOptionLabel, disabled }) {
  return (
    <div>
      <label className="block text-lg mb-2">{label}:</label>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-black border-b border-gray-600 py-2 text-white"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={getOptionValue ? getOptionValue(opt) : opt} value={getOptionValue ? getOptionValue(opt) : opt}>
            {getOptionLabel ? getOptionLabel(opt) : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
