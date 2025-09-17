import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminCampsPage() {
  const [profile, setProfile] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfileAndCamps() {
      try {
        setLoading(true);
        const profData = await api.getAdminProfile();
        const admin = profData.admin || profData;
        setProfile(admin);

        const stateId = admin.state_id;
        const campsData = await api.getAdminCamps(stateId);
        setCamps(campsData.camps || campsData);
      } catch (err) {
        console.error("Error loading admin camps:", err);
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndCamps();
  }, []);

  const handleStatusUpdate = async (campId, action) => {
    try {
      await api.updateCampStatus(campId, action);
      // Update the camp status in UI
      setCamps((prevCamps) =>
        prevCamps.map((camp) =>
          camp.camp_id === campId ? { ...camp, status: action === "approve" ? "active" : "rejected" } : camp
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} camp:`, err);
      alert(`Failed to ${action} camp. Please try again.`);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {profile && (
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.name ? profile.name.charAt(0) : "A"}
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome, {profile.name || "Admin"}
              </h2>
              <p className="text-lg text-gray-600 mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {profile.state_name
                  ? profile.state_name
                  : profile.state_id
                  ? `State ID: ${profile.state_id}`
                  : "Unknown State"}
              </p>
            </div>
          </div>
        </div>
      )}

      {camps.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No camps available</h3>
          <p className="text-gray-500 text-lg">No camps in your state yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Available Camps</h3>
          {camps.map((camp) => (
            <div
              key={camp.camp_id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {camp.camp_name}
                  </h3>
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                    <span className="text-lg font-medium text-gray-700">{camp.organization_name}</span>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    camp.status === "active"
                      ? "bg-green-100 text-green-800"
                      : camp.status === "upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : camp.status === "completed"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {camp.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(camp.camp_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    🙋‍♂️
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organizer</p>
                    <p className="font-semibold text-gray-800">{camp.contact_person || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200">
                  View Details
                </button>

                {/* Approval buttons */}
                {camp.status === "pending" && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStatusUpdate(camp.camp_id, "approve")}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(camp.camp_id, "reject")}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
