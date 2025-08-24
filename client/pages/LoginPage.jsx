// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; 

// const LoginPage = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleLogin = () => {
//     if (!formData.email || !formData.password) {
//       alert('Please fill in all fields');
//       return;
//     }
//     console.log('Logging in user:', formData);
//     // API call to login user
//     // On success, navigate to dashboard or home
//   };

  

//   const handleForgotPassword = () => {
//     // Navigate to forgot password page
//     navigate('/forgot-password');
//     console.log('Navigate to forgot password page');
  
//   };

//   const navigate = useNavigate();

//   const handleBackToHome = () => {
//     navigate('/'); 
//     console.log('Navigate back to home');
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <div className="flex items-center justify-center min-h-screen px-6">
//         <div className="w-full max-w-md">
//           <h1 className="text-5xl font-bold mb-12 text-center">Login</h1>
          
//           <div className="space-y-8">
//             <div>
//               <label className="block text-white text-lg mb-2">Email:</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-white text-lg mb-2">Password:</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className="w-full bg-transparent border-b border-gray-600 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-lg"
//                 required
//               />
//             </div>

//             <div className="pt-6 space-y-4">
//               <button
//                 onClick={handleLogin}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
//               >
//                 Login
//               </button>

//               <div className="text-center">
//                 <button
//                   onClick={handleForgotPassword}
//                   className="text-red-400 hover:text-red-300 transition-colors text-base underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Back to Home Button */}
//           <div className="flex justify-center mt-12">
//             <button
//               onClick={handleBackToHome}
//               className="text-white hover:text-red-400 transition-colors text-lg font-medium"
//             >
//               Back to home
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;




import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token } = await api.login(form);
      setAuthToken(token);
      navigate("/"); // redirect after login
    } catch (error) {
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

        <form
          onSubmit={onSubmit}
          className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-lg"
        >
          {err && (
            <div className="text-red-400 text-sm text-center bg-red-900/40 py-2 rounded-lg">
              {err}
            </div>
          )}

          <input
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={onChange}
            required
          />

          <input
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={onChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 px-6 py-3 rounded-lg font-medium"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Don’t have an account?{" "}
            <a href="/signup" className="text-red-400 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
