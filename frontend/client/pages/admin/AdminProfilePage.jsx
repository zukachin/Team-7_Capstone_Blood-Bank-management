import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await api.getAdminProfile();

        console.log("Admin profile response:", res);

        // If using Axios wrapper that returns res.data
        const data = res?.data || res;

        setProfile(data);
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setError(err?.message || "Failed to fetch admin profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) return <div className="text-center text-white py-8">Loading profile...</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error: {error}</div>;
  if (!profile) return <div className="text-center text-gray-400">No profile data available.</div>;

  return (
    <div className="p-6 bg-neutral-900 rounded shadow max-w-2xl mx-auto mt-10 text-white border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-red-500 text-center">Admin Profile</h2>

      <div className="space-y-3 text-sm sm:text-base">
        <p><strong>Name:</strong> {profile.name || "N/A"}</p>
        <p><strong>Email:</strong> {profile.email || "N/A"}</p>
        <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
        <p><strong>Gender:</strong> {profile.gender || "N/A"}</p>
        <p><strong>Centre:</strong> {profile.centre_name || profile.centre || "N/A"}</p>
        <p><strong>Address:</strong> {profile.address || "N/A"}</p>
        <p><strong>State:</strong> {profile.state_name || profile.state_id || "N/A"}</p>
        <p><strong>District:</strong> {profile.district_name || profile.district_id || "N/A"}</p>
        <p><strong>Role:</strong> Admin</p>
      </div>
    </div>
  );
}
