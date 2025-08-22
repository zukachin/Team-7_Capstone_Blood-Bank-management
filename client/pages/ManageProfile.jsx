import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageProfilePage = () => {
  // Mock data - in real app, this would come from API/database
  const [profileData, setProfileData] = useState({
    email: 'user@example.com', // Non-editable, comes from DB
    first_name: 'John',
    last_name: 'Doe',
    phone: '+91 9876543210',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    blood_group_id: 1,
    district_id: 2,
    gender: 'Male'
  });
  const navigate = useNavigate();
  // Mock options data - in real app, this would come from API
  const options = {
    bloodGroups: [
      { id: 1, group_name: 'A+' },
      { id: 2, group_name: 'A-' },
      { id: 3, group_name: 'B+' },
      { id: 4, group_name: 'B-' },
      { id: 5, group_name: 'AB+' },
      { id: 6, group_name: 'AB-' },
      { id: 7, group_name: 'O+' },
      { id: 8, group_name: 'O-' }
    ],
    districts: [
      { id: 1, district_name: 'Mumbai City' },
      { id: 2, district_name: 'Mumbai Suburban' },
      { id: 3, district_name: 'Pune' },
      { id: 4, district_name: 'Nashik' },
      { id: 5, district_name: 'Aurangabad' },
      { id: 6, district_name: 'Solapur' }
    ],
    genders: ['Male', 'Female', 'Other']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', profileData);
    // API call to update profile (PATCH/UPDATE)
    // Show success message
    alert('Profile updated successfully!');
  };

  const handleBackToHome = () => {
    navigate('/');
    console.log('Navigate back to home');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-start justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-5xl font-bold mb-12 text-center">Manage Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 max-w-4xl mx-auto">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Non-editable Email Field */}
              <div>
                <label className="block text-white text-lg mb-2">Email:</label>
                <div className="w-full border-b border-gray-700 py-2 text-gray-400 text-lg opacity-60">
                  {profileData.email}
                </div>
                <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-white text-lg mb-2">First Name:</label>
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">Last Name:</label>
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white text-lg mb-2">City:</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">State:</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">Pincode:</label>
                <input
                  type="text"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">Blood Group:</label>
                <select
                  name="blood_group_id"
                  value={profileData.blood_group_id}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
                  required
                >
                  {options.bloodGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-lg mb-2">District:</label>
                <select
                  name="district_id"
                  value={profileData.district_id}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
                  required
                >
                  {options.districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-lg mb-2">Gender:</label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
                  required
                >
                  {options.genders.map(gender => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-12 space-x-6">
            <button
              onClick={handleSave}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Save Profile
            </button>
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleBackToHome}
              className="text-white hover:text-red-400 transition-colors text-lg font-medium"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProfilePage;