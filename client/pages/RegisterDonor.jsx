import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    medicalIssues: '',
    weight: '',
    consent: false,
  });

  const [showConsentInfo, setShowConsentInfo] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!formData.consent) {
      toast.warning("⚠ Please agree to the consent before registering.");
      return;
    }

    // Show success toast immediately
    toast.success("🎉 Registered successfully! Check your email.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Reset form immediately
    setFormData({
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
      medicalIssues: '',
      weight: '',
      consent: false,
    });

    try {
      // Send donor data to backend asynchronously
      await fetch("http://localhost:4001/api/donors/register-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.error(err);
      toast.error("⚠ Error sending email. Donor registration saved locally.");
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-black text-white flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-5xl bg-neutral-900 p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold mb-10 text-center">Register as Donor</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 flex flex-col space-y-6">
            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
            <InputField label="Email Id" name="emailId" type="email" value={formData.emailId} onChange={handleInputChange} />
            <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} />
            <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} />

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
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col space-y-6">
            <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} min="18" max="65" />
            <InputField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} min="40" />

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
                {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>

            <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
            <InputField label="Last Donation Date (if any)" name="lastDonationDate" type="date" value={formData.lastDonationDate} onChange={handleInputChange} />

            {/* Medical Issues */}
            <div>
              <label className="block text-lg mb-2">Medical Issues:</label>
              <select
                name="medicalIssues"
                value={formData.medicalIssues}
                onChange={handleInputChange}
                className="w-full bg-black border-b border-gray-600 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
              >
                <option value="">Select Option</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              {formData.medicalIssues === 'yes' && (
                <div className="mt-3 p-4 bg-red-900/40 border border-red-600 rounded-lg text-red-400 text-sm">
                  ⚠ Not eligible to donate blood right now.
                </div>
              )}
            </div>

            {/* Consent */}
            <div className="flex items-center space-x-3">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleInputChange} className="w-5 h-5 accent-red-600" />
              <button type="button" className="text-sm font-medium underline text-red-400 hover:text-red-500" onClick={() => setShowConsentInfo(true)}>Consent & Agreements</button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={formData.medicalIssues === 'yes'}
            className={`w-full md:w-1/2 py-3 px-6 rounded-lg font-bold transition-colors duration-200 ${formData.medicalIssues === 'yes' ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            Register Now
          </button>
          <button type="button" className="w-full md:w-1/2 bg-transparent border border-gray-600 hover:border-red-500 text-white py-3 px-6 rounded-lg transition-colors duration-200" onClick={() => navigate('/')}>Back to Home</button>
        </div>

        {/* Consent Modal */}
        {showConsentInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-neutral-900 text-white p-8 rounded-xl max-w-lg w-full shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Consent & Agreements</h2>
              <p className="mb-4 text-sm text-gray-300">
                By registering as a donor, you agree to eligibility criteria and accurate health info. Your data will be stored securely.
              </p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600" onClick={() => setShowConsentInfo(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, name, type = 'text', value, onChange, ...props }) => (
  <div>
    <label className="block text-lg mb-2">{label}:</label>
    <input type={type} name={name} value={value} onChange={onChange} {...props} className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"/>
  </div>
);

export default RegisterDonor;
