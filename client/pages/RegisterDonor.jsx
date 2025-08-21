import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterDonor = () => {
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
    dateOfBirth: '',
    lastDonationDate: '',
    consent: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.consent) {
      alert('Please agree to the consent & agreements before registering.');
      return;
    }
    console.log('Donor Registration Data:', formData);
    // API call or backend integration goes here
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-black text-white flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-5xl bg-neutral-900 p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold mb-10 text-center">Register as Donor</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-6">
            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
            <InputField label="Email Id" name="emailId" type="email" value={formData.emailId} onChange={handleInputChange} />
            <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} />
            <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Gender */}
            <div>
              <label className="block text-lg mb-2">Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} min="18" max="65" />
            
            {/* Blood Group */}
            <div>
              <label className="block text-lg mb-2">Blood Group:</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
            <InputField label="Last Donation Date (if any)" name="lastDonationDate" type="date" value={formData.lastDonationDate} onChange={handleInputChange} />

            {/* Consent */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                className="w-5 h-5 accent-red-600"
              />
              <label className="text-sm font-medium">Consent & Agreements</label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full md:w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Register Now
          </button>
          <button
            type="button"
            className="w-full md:w-1/2 bg-transparent border border-gray-600 hover:border-red-500 text-white py-3 px-6 rounded-lg transition-colors duration-200"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, name, type = 'text', value, onChange, ...props }) => (
  <div>
    <label className="block text-lg mb-2">{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      {...props}
      className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
    />
  </div>
);

export default RegisterDonor;
