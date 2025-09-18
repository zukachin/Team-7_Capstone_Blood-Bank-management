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
      const res = await api.updateCampStatus(campId, action);

      setCamps((prevCamps) =>
        prevCamps.map((camp) => {
          if (camp.camp_id === campId) {
            const newStatus =
              action === "approve"
                ? "active"
                : action === "reject"
                ? "rejected"
                : camp.status;
            return { ...camp, status: newStatus };
          }
          return camp;
        })
      );
    } catch (err) {
      console.error(`Failed to ${action} camp:`, err);
      alert(`Failed to ${action} camp. ${err.message || ""}`);
    }
  };

  if (loading) return <div className="text-white">Loading…</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {profile && (
        <div className="mb-8 bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.admin_name ? profile.admin_name.charAt(0) : "A"}
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white">
                Welcome, {profile.admin_name || "Admin"}
              </h2>
              <p className="text-lg text-gray-400 mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {profile.state_name
                  ? profile.state_name
                  : profile.state_id
                  ? `State: ${profile.state_id}`
                  : "Unknown State"}
              </p>
            </div>
          </div>
        </div>
      )}

      {camps.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-200 mb-2">
            No camps available
          </h3>
          <p className="text-gray-400 text-lg">
            No camps in your state yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-100 mb-6">
            Available Camps
          </h3>
          {camps.map((camp) => (
            <div
              key={camp.camp_id}
              className="group bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-800 hover:border-indigo-500 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {camp.camp_name}
                  </h3>
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full mr-3"></div>
                    <span className="text-lg font-medium text-gray-300">
                      {camp.organization_name ||
                        camp.organizer_name ||
                        "Organizer"}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    camp.status === "active"
                      ? "bg-green-900 text-green-300"
                      : camp.status === "pending"
                      ? "bg-yellow-900 text-yellow-300"
                      : camp.status === "rejected"
                      ? "bg-red-900 text-red-300"
                      : camp.status === "upcoming"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {camp.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-800 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-semibold text-gray-100">
                      {new Date(camp.camp_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-800 rounded-lg flex items-center justify-center">
                    🙋‍♂️
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Organizer</p>
                    <p className="font-semibold text-gray-100">
                      {camp.contact_person ||
                        camp.organizer_name ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-800">
                  View Details
                </button>

                {camp.status &&
                  camp.status.toLowerCase() === "pending" && (
                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          handleStatusUpdate(camp.camp_id, "approve")
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(camp.camp_id, "reject")
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
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
