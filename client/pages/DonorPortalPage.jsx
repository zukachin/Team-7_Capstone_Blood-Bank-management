import React from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ added Link

const DonorPortalPage = () => {
  const navigate = useNavigate(); // ✅ create navigate instance

  const handleNavigation = (path) => {
    navigate(path); // ✅ navigate to page
  };

  const handleBackToHome = () => {
    navigate("/"); // ✅ go to home
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="w-full bg-black border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              {/* Red arrow icon */}
              <svg
                width="10"
                height="58"
                viewBox="0 0 10 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-2"
              >
                <path d="M0 14.5L10 0V43L0 57.5V14.5Z" fill="#FF0000" />
              </svg>
              <Link
                to="/"
                className="text-blood-primary font-bold text-2xl"
                style={{
                  fontFamily:
                    "Instrument Sans, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                LIFE LINK
              </Link>
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-9">
              <button
                onClick={() => handleNavigation("/")}
                className="text-red-500 hover:text-red-400 text-xl transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("/looking-for-blood")}
                className="hover:text-red-400 text-xl transition-colors"
              >
                Looking for Blood
              </button>
              <button
                onClick={() => handleNavigation("/want-to-donate")}
                className="hover:text-red-400 text-xl transition-colors"
              >
                Want to donate Blood
              </button>
              <button
                onClick={() => handleNavigation("/blood-bank-dashboard")}
                className="hover:text-red-400 text-xl transition-colors"
              >
                Blood Bank Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
        {/* Title */}
        <h1 className="text-5xl font-bold mb-16 text-center tracking-wide">
          DONOR PORTAL
        </h1>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl w-full mb-16">
          {/* Register as Donor Card */}
          <div
            className="bg-gray-900 rounded-lg p-8 hover:bg-gray-800 transition-colors cursor-pointer group"
            onClick={() => handleNavigation("/register-donor")}
          >
            <div className="text-center">
              <h2 className="text-red-500 text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                Register as Donor
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Fill in your details to become a donor.
              </p>
            </div>
          </div>

          {/* My Appointments Card */}
          <div
            className="bg-gray-900 rounded-lg p-8 hover:bg-gray-800 transition-colors cursor-pointer group"
            onClick={() => handleNavigation("/my-appointments")}
          >
            <div className="text-center">
              <h2 className="text-red-500 text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                My Appointments
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                View past and upcoming donation appointments.
              </p>
            </div>
          </div>

          {/* Book Appointments Card */}
          <div
            className="bg-gray-900 rounded-lg p-8 hover:bg-gray-800 transition-colors cursor-pointer group md:col-span-2 lg:col-span-1 mx-auto md:mx-0"
            onClick={() => handleNavigation("/book-appointments")}
          >
            <div className="text-center">
              <h2 className="text-red-500 text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                Book Appointments
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Choose a date and time to donate blood.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="text-white hover:text-red-400 transition-colors text-lg font-medium"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default DonorPortalPage;
