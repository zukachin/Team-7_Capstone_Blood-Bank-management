import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, MessageSquare, Home, Bell } from "lucide-react";
import { api } from "../../lib/api"; // Adjust as needed

export default function AdminDashboard() {
  const location = useLocation();
  const [adminProfile, setAdminProfile] = useState(null);
  const [donors, setDonors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);

  const links = [
    { path: "/admin/donors/register", label: "Donor Register", icon: <Users size={18} /> },
    { path: "/admin/donors/counseling", label: "Donor Counseling", icon: <MessageSquare size={18} /> },
    { path: "/admin/centers", label: "Manage Centres", icon: <Home size={18} /> },
    { path: "/admin/appointments", label: "Manage Appointments", icon: <Home size={18} /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const admin = await api.getAdminProfile();
        setAdminProfile(admin);

        // Fetch notifications for matching donor registrations
        if (admin?.state_id || admin?.district_id || admin?.centre_id) {
          const notif = await api.getDonorNotifications({
            state_id: admin.state_id,
            district_id: admin.district_id,
            centre_id: admin.centre_id,
          });
          setNotifications(notif || []);
        }
      } catch (err) {
        console.error("Error loading admin or notifications", err);
      }
    };

    fetchData();
  }, []);

  const handleAcknowledge = async (donorId) => {
    try {
      const donor = await api.getDonorProfile(donorId); // fetch donor details
      await api.acceptDonorNotification(donorId); // mark as seen
      setSelectedDonor(donor);
      setShowNotif(false);
    } catch (err) {
      console.error("Error acknowledging donor:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Sidebar */}
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

            {/* Notification Bell */}
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
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg p-8">
          <Outlet context={{ adminProfile, donors, selectedDonor }} />
        </div>
      </main>

      {/* Notification Modal */}
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
                  <li key={donor.id} className="bg-gray-100 p-3 rounded-md">
                    <p className="text-gray-800 font-medium">{donor.name}</p>
                    <p className="text-gray-500 text-sm">{donor.email}</p>
                    <button
                      onClick={() => handleAcknowledge(donor.id)}
                      className="mt-2 bg-red-600 text-white text-sm px-4 py-1 rounded hover:bg-red-700 transition"
                    >
                      View Profile
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
