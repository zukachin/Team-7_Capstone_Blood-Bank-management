import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, MessageSquare, Home } from "lucide-react";
import { Path } from "three";

export default function AdminDashboard() {
  const location = useLocation();

  const links = [
    { path: "/admin/donors/register", label: "Donor Register", icon: <Users size={18} /> },
    { path: "/admin/donors/counseling", label: "Donor Counseling", icon: <MessageSquare size={18} /> },
    { path: "/admin/centers", label: "Manage Centres", icon: <Home size={18} /> },
    { path: "/admin/appointments", label: "Manage Appointments", icon: <Home size={18} /> }
  ];

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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
