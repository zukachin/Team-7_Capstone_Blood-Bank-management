import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, MessageSquare, Home, Bell, User, LogOut } from "lucide-react";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const location = useLocation();
  const [adminProfile, setAdminProfile] = useState(null);
  const [donors, setDonors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledging, setAcknowledging] = useState(false);

  const links = [
    { path: "/admin/donors/register", label: "Donor Register", icon: <Users size={18} /> },
    { path: "/admin/donors/counseling", label: "Donor Counseling", icon: <MessageSquare size={18} /> },
    { path: "/admin/centers", label: "Manage Centres", icon: <Home size={18} /> },
    { path: "/admin/appointments", label: "Manage Appointments", icon: <Home size={18} /> },
    { path: "/admin/profile", label: "Profile", icon: <User size={18} /> },
    { path: "/admin/camps", label: "Camps", icon: <Bell size={18} /> }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const admin = await api.getAdminProfile();
        setAdminProfile(admin);

        // Confirm admin profile has location info before fetching notifications
        const hasLocation = admin?.state_id || admin?.district_id || admin?.centre_id;
        if (hasLocation) {
          const notif = await api.getDonorNotifications({
            state_id: admin.state_id,
            district_id: admin.district_id,
            centre_id: admin.centre_id,
          });
          setNotifications(notif || []);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load admin data or notifications.");
        setLoading(false);
        console.error("Error loading admin or notifications", err);
      }
    };

    fetchData();
  }, []);

  const handleAcknowledge = async (donorId) => {
    if (!adminProfile) return;

    try {
      setAcknowledging(true);
      const donor = await api.getDonorProfile(donorId);
      await api.acceptDonorNotification(donorId);
      setSelectedDonor(donor);
      setShowNotif(false);

      // Refresh notifications after acknowledge
      const refreshedNotifs = await api.getDonorNotifications({
        state_id: adminProfile.state_id,
        district_id: adminProfile.district_id,
        centre_id: adminProfile.centre_id,
      });
      setNotifications(refreshedNotifs || []);
    } catch (err) {
      console.error("Error acknowledging donor:", err);
    } finally {
      setAcknowledging(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Or whatever key you're using
    window.location.href = "/admin/login"; // Redirect to login route
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading admin data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <aside className="w-64 bg-gradient-to-b from-red-800 via-red-900 to-black p-6 flex flex-col justify-between shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold mb-10 text-center tracking-wide text-red-50">
            Admin Panel
          </h2>

          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-red-600/70 text-white font-bold shadow-md"
                    : "text-gray-300 hover:bg-red-700/70 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => setShowNotif(true)}
              className="flex items-center gap-3 mt-8 px-4 py-2 rounded-lg text-sm text-yellow-400 hover:bg-red-700/60 transition"
            >
              <Bell size={18} />
              Notifications
              {notifications.length > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="mt-10">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full bg-black text-gray-200 py-2 rounded-lg border border-gray-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-800 hover:text-white transition-all"
          >
            <Home size={18} />
            Back to Home
          </Link>

          {/* 🔐 Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-red-700 text-white py-2 rounded-lg hover:bg-red-800 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg p-8">
          <Outlet context={{ adminProfile, donors, selectedDonor }} />
        </div>
      </main>

      {showNotif && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowNotif(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4 text-red-600">New Donor Requests</h2>

            {notifications.length === 0 ? (
              <p className="text-gray-600 text-sm">No new registrations yet.</p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((donor) => (
                  <li key={donor.id || donor.donor_id} className="bg-gray-100 p-3 rounded-md">
                    <p className="text-gray-800 font-medium">{donor.name}</p>
                    <p className="text-gray-500 text-sm">{donor.email}</p>
                    <button
                      onClick={() => handleAcknowledge(donor.id || donor.donor_id)}
                      disabled={acknowledging}
                      className={`mt-2 text-sm px-4 py-1 rounded ${
                        acknowledging
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      } transition`}
                    >
                      {acknowledging ? "Processing..." : "View Profile"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}