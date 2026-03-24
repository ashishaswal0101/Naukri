import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    zone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    // We can hardcode the role as 'FSE' when preparing the data for the backend
    const submissionData = {
      ...formData,
      role: 'FSE' 
    };
    
    console.log("Attempting to register new FSE:", submissionData);
    // TODO: Connect Axios to send user data to the backend
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] p-4 sm:p-8 font-sans">
      
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Left Side - Dark Brand Panel */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#1c3150] to-[#14233a] p-10 lg:p-14 text-white flex flex-col justify-center">
          
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md w-max mb-6 border border-white/5">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            <span className="text-xs font-semibold tracking-wider text-emerald-400">FSE ONBOARDING</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Join the operational sales network.
          </h1>
          
          <p className="text-gray-300 mb-8 text-sm lg:text-base leading-relaxed">
            Register your Field Sales account to get access to area-wise lead mapping, automated workflows, and direct hierarchy approvals.
          </p>

          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-gray-200">
              Manage full conversion flows and client follow-ups
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-gray-200">
              Submit area data directly to your State Manager (ASM)
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="lg:w-1/2 p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create an Account
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Enter your operating zone and credentials to request access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Company Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c3150] focus:border-transparent transition-all"
                />
              </div>

              {/* Zone (Now Full Width) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Assigned Zone</label>
                <select 
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c3150] transition-all cursor-pointer"
                >
                  <option value="" disabled>Select your operating zone</option>
                  <option value="North">North Zone</option>
                  <option value="East">East Zone</option>
                  <option value="West">West Zone</option>
                  <option value="South">South Zone</option>
                </select>
              </div>

              {/* Passwords (Side by Side) */}
              <div className="flex gap-4">
                <div className="relative space-y-1.5 w-1/2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type={showPassword ? "password" : "text"} 
                    name="password"
                    placeholder="Create password" 
                    value={formData.password}
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c3150] transition-all"
                  />
                <button type="button" onClick={()=>{setShowPassword(!showPassword)}} className=" absolute right-3 top-1/2 text-xl cursor-pointer text-gray-500">
                  {showPassword ? <FaEyeSlash /> : <FaEye/>}
                </button>
                </div>
                <div className="relative space-y-1.5 w-1/2">
                  <label className="text-sm font-medium text-gray-700">Confirm</label>
                  <input 
                    type={showConfirmPassword ? "password" : "text"}
                    name="confirmPassword"
                    placeholder="Confirm password" 
                    value={formData.confirmPassword}
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c3150] transition-all"
                  />

                  <button type="button" onClick={()=>{setShowConfirmPassword(!showConfirmPassword)}} className=" absolute right-3 top-1/2 text-xl cursor-pointer text-gray-500">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye/>}
                  </button>

                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1c3150] hover:bg-[#12223a] text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 mt-4 shadow-md"
              >
                Submit Registration
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account? <Link to="/login" className="text-[#1c3150] font-semibold hover:underline">Sign in here</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}