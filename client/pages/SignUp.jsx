import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    phoneNumber: '',
    address: '',
    location: '',
    gender: '',
    age: '',
    bloodGroup: '',
    dateOfBirth: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-center">Sign Up</h1>
          <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12 md:gap-y-6 max-w-4xl mx-auto">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Full Name:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Email Id:</label>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Phone Number:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="18"
                  max="65"
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Blood Group:</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className="w-full bg-transparent border border-gray-600 hover:border-red-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition-colors duration-200"
                  onClick={() => navigate('/')}
                >
                  Back to home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;