import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    password: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = () => {
    if (!formData.email) {
      alert('Please enter your email first');
      return;
    }
    console.log('Sending OTP to:', formData.email);
    setOtpSent(true);
    // API call to send OTP
  };

  const handleResendOTP = () => {
    console.log('Resending OTP to:', formData.email);
    // API call to resend OTP
  };

  const handleVerifyAndRegister = () => {
    if (!formData.otp) {
      alert('Please enter the OTP');
      return;
    }
    console.log('Verifying OTP and registering user:', formData);
    // API call to verify OTP and register user
    // On success, navigate to login page
  };

  const handleBackToHome = () => {
    navigate('/'); 
    console.log('Navigate back to home');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-center">Registration</h1>
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
                <label className="block text-white text-base sm:text-lg mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white text-base sm:text-lg mb-2">District/City:</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">State:</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Pincode:</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-base sm:text-lg mb-2">Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-base sm:text-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* OTP Section */}
          <div className="mt-8 sm:mt-12 max-w-md mx-auto space-y-6">
            <div className="flex justify-center">
              {!otpSent ? (
                <button
                  onClick={handleSendOTP}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200"
                >
                  Send OTP
                </button>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {otpSent && (
              <>
                <div>
                  <label className="block text-white text-base sm:text-lg mb-2 text-center">Enter OTP:</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-gray-600 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-center text-base sm:text-lg"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleVerifyAndRegister}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200"
                  >
                    Verify & Register
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={handleBackToHome}
              className="text-white hover:text-red-400 transition-colors text-base sm:text-lg font-medium"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;