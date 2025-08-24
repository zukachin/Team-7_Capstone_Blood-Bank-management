// client/components/UserMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthToken } from "../lib/api";
import userPng from "../assets/profile-icon.png";

export default function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false); // close on Esc
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const logout = () => {
    clearAuthToken();
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button (same look & feel as header links) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-gray-700 px-4 py-2 hover:bg-gray-900 transition-colors"
      >
        <img src={userPng} alt="User" className="h-8 w-12 rounded-full" />
      </button>

      {/* Dropdown: position/visual matches Header dropdowns */}
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full mt-0 origin-top-right bg-black border border-gray-800 rounded-md shadow-lg z-50 min-w-[14rem] overflow-hidden"
          style={{ transformOrigin: "top right" }}
        >
          <Link
            to="/manage-profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-white hover:bg-gray-900 transition-colors"
          >
            Manage Profile
          </Link>

          <button
            role="menuitem"
            onClick={logout}
            type="button"
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
