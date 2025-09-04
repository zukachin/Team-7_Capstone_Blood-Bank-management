import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, MessageSquare, Home } from "lucide-react";

export default function AdminDashboard() {
  const location = useLocation();

  const links = [
    { path: "/admin/donors/register", label: "Donor Register", icon: <Users size={18} /> },
    { path: "/admin/donors/counseling", label: "Donor Counseling", icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-red-700 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-10 text-center tracking-wide">
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === link.path
                    ? "bg-red-900 font-semibold"
                    : "hover:bg-red-800"
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
            className="flex items-center justify-center gap-2 w-full bg-black text-white py-2 rounded-lg border border-gray-600 hover:bg-red-600 transition-colors"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
