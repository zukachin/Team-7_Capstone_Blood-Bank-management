import React from 'react';

const DonorPortalPage = () => {
  const handleNavigation = (path) => {
    console.log(`Navigate to: ${path}`);
    // Handle navigation here
  };

  const handleBackToHome = () => {
    console.log('Navigate back to home');
    // Handle back navigation here
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-red-600"></div>
          <span className="text-red-600 text-xl font-bold">LIFE LINK</span>
        </div>
        <div className="flex space-x-8">
          <a href="#" onClick={() => handleNavigation('/')} className="text-red-500 hover:text-red-400 transition-colors">Home</a>
          <a href="#" onClick={() => handleNavigation('/looking-for-blood')} className="hover:text-red-400 transition-colors">Looking for Blood</a>
          <a href="#" onClick={() => handleNavigation('/want-to-donate')} className="hover:text-red-400 transition-colors">Want to donate Blood</a>
          <a href="#" onClick={() => handleNavigation('/dashboard')} className="hover:text-red-400 transition-colors">Blood Bank Dashboard</a>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
        {/* Title */}
        <h1 className="text-5xl font-bold mb-16 text-center tracking-wide">DONOR PORTAL</h1>
        
        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl w-full mb-16">
          {/* Register as Donor Card */}
          <div 
            className="bg-gray-900 rounded-lg p-8 hover:bg-gray-800 transition-colors cursor-pointer group"
            onClick={() => handleNavigation('/signup')}
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
            onClick={() => handleNavigation('/my-appointments')}
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
            onClick={() => handleNavigation('/book-appointments')}
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