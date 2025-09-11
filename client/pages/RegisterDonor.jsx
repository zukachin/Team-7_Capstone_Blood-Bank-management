import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RegisterDonor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    phoneNumber: '',
    address: '',
    state: '',
    district: '',
    center: '',
    gender: '',
    age: '',
    bloodGroupId: '',
    dateOfBirth: '',
    lastDonationDate: '',
    medicalIssues: '',
    weight: '',
    consent: false,
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [centres, setCentres] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [showConsentInfo, setShowConsentInfo] = useState(false);

  // Fetch states
  useEffect(() => {
    fetch(`${baseUrl}/api/donors/states`)
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(err => console.error("Error fetching states:", err));
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (formData.state) {
      fetch(`${baseUrl}/api/donors/districts/${formData.state}`)
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(err => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
    }
    setFormData(prev => ({ ...prev, district: '', center: '' }));
  }, [formData.state]);

  // Fetch centres when district changes
  useEffect(() => {
    if (formData.district) {
      fetch(`${baseUrl}/api/donors/centres/${formData.district}`)
        .then(res => res.json())
        .then(data => setCentres(data))
        .catch(err => console.error("Error fetching centres:", err));
    } else {
      setCentres([]);
    }
    setFormData(prev => ({ ...prev, center: '' }));
  }, [formData.district]);

  // Fetch blood groups
  useEffect(() => {
    fetch(`${baseUrl}/api/donors/blood-groups`)
      .then(res => res.json())
      .then(data => setBloodGroups(data))
      .catch(err => console.error("Error fetching blood groups:", err));
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formData.consent) {
      toast.warning("⚠ Please agree to the consent before registering.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/donors/register-donor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Registration failed");

      toast.success("🎉 Registered successfully! Check your email.", { autoClose: 5000 });

      setFormData({
        fullName: '',
        emailId: '',
        phoneNumber: '',
        address: '',
        state: '',
        district: '',
        center: '',
        gender: '',
        age: '',
        bloodGroupId: '',
        dateOfBirth: '',
        lastDonationDate: '',
        medicalIssues: '',
        weight: '',
        consent: false,
      });
    } catch (err) {
      console.error(err);
      toast.error("⚠ Error registering donor.");
    }
  };

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

            {/* State */}
            <SelectField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              options={states.map(s => ({ value: s.state_id, label: s.state_name }))}
            />

            {/* District */}
            <SelectField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              options={districts.map(d => ({ value: d.district_id, label: d.district_name }))}
            />

            {/* Centre */}
            <SelectField
              label="Centre"
              name="center"
              value={formData.center}
              onChange={handleInputChange}
              options={centres.map(c => ({ value: c.centre_id, label: c.centre_name }))}
            />

            {/* Gender */}
            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col space-y-6">
            <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} min="18" max="65" />
            <InputField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} min="40" />

            {/* Blood Group */}
            <SelectField
              label="Blood Group"
              name="bloodGroupId"
              value={formData.bloodGroupId}
              onChange={handleInputChange}
              options={bloodGroups.map(bg => ({ value: bg.id, label: bg.group_name }))}
            />

            <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
            <InputField label="Last Donation Date (if any)" name="lastDonationDate" type="date" value={formData.lastDonationDate} onChange={handleInputChange} />

            {/* Medical Issues */}
            <SelectField
              label="Medical Issues"
              name="medicalIssues"
              value={formData.medicalIssues}
              onChange={handleInputChange}
              options={[

                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />
            {formData.medicalIssues === 'yes' && (
              <div className="mt-3 p-4 bg-red-900/40 border border-red-600 rounded-lg text-red-400 text-sm">
                ⚠ Not eligible to donate blood right now.
              </div>
            )}

            {/* Consent */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                className="w-5 h-5 accent-red-600"
              />
              <button
                type="button"
                className="text-sm font-medium underline text-red-400 hover:text-red-500"
                onClick={() => setShowConsentInfo(true)}
              >
                Consent & Agreements
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={formData.medicalIssues === 'yes'}
            className={`w-full md:w-1/2 py-3 px-6 rounded-lg font-bold transition-colors duration-200 ${
              formData.medicalIssues === 'yes'
                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
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

        {/* Consent Modal */}
{showConsentInfo && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-xl max-w-lg w-full shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Consent & Agreements</h2>

      <p className="mb-2 text-sm text-gray-300">
        By registering as a blood donor, I confirm that:
      </p>

      <ul className="list-disc list-inside mb-4 text-gray-300 text-sm space-y-2">
        <li>I am at least 18 years old and meet the minimum eligibility criteria for blood donation.</li>
        <li>The information I provide, including medical history and personal details, is accurate and complete to the best of my knowledge.</li>
        <li>I am not currently suffering from any illness, infection, or medical condition that may endanger myself or the recipient.</li>
        <li>I understand that my blood will be collected, tested, and used according to standard medical and safety protocols.</li>
        <li>I consent to the storage and processing of my personal data for donor registration, appointment scheduling, and related communications.</li>
        <li>I understand that I may be deferred from donation temporarily or permanently based on health criteria and test results.</li>
        <li>I acknowledge that donating blood is voluntary and I can withdraw my consent at any time before the donation process begins.</li>
      </ul>

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          onClick={() => setShowConsentInfo(false)}
        >
          Close
        </button>
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

// Reusable Select Component
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-lg mb-2">{label}:</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-black border-b border-gray-600 py-2 text-white"
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default RegisterDonor;
