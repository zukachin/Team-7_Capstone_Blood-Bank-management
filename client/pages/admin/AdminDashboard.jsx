// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Users, MessageSquare, Home, Bell, Package } from "lucide-react"; // Added Package import
import { api } from "../../lib/api"; // adjust if your path differs

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  // control submenu open state
  const [openMenu, setOpenMenu] = useState(null); // can be "donorRegister" or "donorCounsel"

  const links = [
    { path: "/admin/donors/register", label: "Donor Register", icon: <Users size={18} /> },
    { path: "/admin/centers", label: "Manage Centres", icon: <Home size={18} /> },
    { path: "/admin/appointments", label: "Manage Appointments", icon: <Home size={18} /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const admin = await api.getAdminProfile();
        setAdminProfile(admin);

        // fetch notifications if your API supports it
        if (api.getDonorNotifications) {
          const notif = await api.getDonorNotifications();
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
      if (api.acceptDonorNotification) {
        await api.acceptDonorNotification(donorId);
      }
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
          <h2 className="text-2xl font-extrabold mb-10 text-center tracking-wide text-red-50">Admin Panel</h2>

          <nav className="flex flex-col gap-3">
            {/* Donor Register (kept as top-level link, unchanged except styling) */}
            <Link
              to="/admin/donors/register"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname.startsWith("/admin/donors/register")
                  ? "bg-red-600/70 text-white font-bold shadow-md"
                  : "text-gray-300 hover:bg-red-700/70 hover:text-white"
              }`}
            >
              <Users size={18} />
              Donor Register
            </Link>

            {/* Donor Counseling — separate collapsible group (NOT inside Donor Register) */}
            <div>
              <button
                onClick={() => setOpenMenu(openMenu === "donorCounsel" ? null : "donorCounsel")}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left ${
                  location.pathname.startsWith("/admin/donors/counseling")
                    ? "bg-red-600/70 text-white font-bold shadow-md"
                    : "text-gray-300 hover:bg-red-700/70 hover:text-white"
                }`}
                style={{ border: "none", cursor: "pointer" }}
              >
                <MessageSquare size={18} />
                Donor Counseling
                <span className="ml-auto">{openMenu === "donorCounsel" ? "▾" : "▸"}</span>
              </button>

              {openMenu === "donorCounsel" && (
                <ul style={{ listStyle: "none", paddingLeft: 12, marginTop: 8 }}>
                  <li>
                    {/* This opens the Counseling form (main counseling UI). When navigated with state { donor_id } it will prefill */}
                    <Link to="/admin/donors/counseling" className="block px-3 py-2 rounded hover:bg-red-700/50">
                      Donor Counseling
                    </Link>
                  </li>
                  <li>
                    {/* List page with camp filter */}
                    <Link to="/admin/donors/counseling" className="block px-3 py-2 rounded hover:bg-red-700/50">
                      All Counselings
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Other existing links (unchanged) */}
            <Link
              to="/admin/centers"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === "/admin/centers"
                  ? "bg-red-600/70 text-white font-bold shadow-md"
                  : "text-gray-300 hover:bg-red-700/70 hover:text-white"
              }`}
            >
              <Home size={18} />
              Manage Centres
            </Link>

            <Link
              to="/admin/collections"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname.startsWith("/admin/collections")
                  ? "bg-red-600/70 text-white font-bold shadow-md"
                  : "text-gray-300 hover:bg-red-700/70 hover:text-white"
              }`}
            >
              <Home size={18} />
              Collections
            </Link>

            <Link
              to="/admin/testing"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname.startsWith("/admin/testing")
                  ? "bg-red-600/70 text-white font-bold shadow-md"
                  : "text-gray-300 hover:bg-red-700/70 hover:text-white"
              }`}
            >
              <Users size={18} />
              Testing
            </Link>

            <Link
              to="/admin/inventory"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname.startsWith("/admin/inventory")
                  ? "bg-red-600/70 text-white font-bold shadow-md"
                  : "text-gray-300 hover:bg-red-700/70 hover:text-white"
              }`}
            >
              <Package size={18} />
              Inventory
            </Link>

            <Link
              to="/admin/appointments"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === "/admin/appointments"
                  ? "bg-red-600/70 text-white font-bold shadow-md"
                  : "text-gray-300 hover:bg-red-700/70 hover:text-white"
              }`}
            >
              <Home size={18} />
              Manage Appointments
            </Link>

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
          {/* Outlet will render the route components; they now use dark backgrounds */}
          <Outlet context={{ adminProfile, notifications }} />
        </div>
      </main>

      {/* Notification Modal */}
      {showNotif && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 text-white rounded-xl max-w-md w-full p-6 relative border border-gray-700">
            <button
              onClick={() => setShowNotif(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-200"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4 text-red-400">New Donor Requests</h2>

            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm">No new registrations yet.</p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((donor) => (
                  <li key={donor.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                    <p className="text-gray-200 font-medium">{donor.name}</p>
                    <p className="text-gray-400 text-sm">{donor.email}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => { handleAcknowledge(donor.id); navigate(`/admin/donors/register?mode=search`); }}
                        className="bg-red-600 text-white text-sm px-4 py-1 rounded hover:bg-red-700 transition"
                      >
                        View in Register
                      </button>
                      <button
                        onClick={() => handleAcknowledge(donor.id)}
                        className="bg-gray-700 text-white text-sm px-4 py-1 rounded hover:bg-gray-600 transition"
                      >
                        Dismiss
                      </button>
                    </div>
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