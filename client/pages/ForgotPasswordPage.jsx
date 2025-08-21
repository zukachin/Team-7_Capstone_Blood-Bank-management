import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 




const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = forget step, 2 = reset step
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = () => {
    if (!formData.email) {
      alert('Please enter your email');
      return;
    }
    console.log('Sending OTP to:', formData.email);
    setStep(2);
    // API call to send OTP
  };

  const handleSubmitReset = () => {
    if (!formData.otp || !formData.newPassword) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Resetting password:', formData);
    // API call to verify OTP and reset password
    // On success, navigate back to login page
    alert('Password reset successful! Redirecting to login...');
  };

  const handleBackToLogin = () => {
    navigate('/login');
    console.log('Navigate back to login page');
  };

  const handleBackToHome = () => {
    navigate('/');
    console.log('Navigate back to home');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-md">
          <h1 className="text-5xl font-bold mb-12 text-center">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h1>
          
          {step === 1 ? (
            // Step 1: Forget Password
            <div className="space-y-8">
              <div>
                <label className="block text-white text-lg mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSendOTP}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                >
                  Send OTP
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Reset Password
            <div className="space-y-8">
              <div>
                <label className="block text-white text-lg mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">OTP:</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSubmitReset}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col items-center space-y-4 mt-8">
            <button
              onClick={handleBackToLogin}
              className="text-red-400 hover:text-red-300 transition-colors text-base underline"
            >
              Back to Login
            </button>
            
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

export default ForgotPasswordPage;