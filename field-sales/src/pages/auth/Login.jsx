import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({
    zone: "", // <-- Added Zone to state
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Attempting to login with:", formData);
    // TODO: Connect Axios to verify credentials
  };

  return (
    <div className="min-h-screen sm:h-screen flex items-center justify-center bg-[#f4f7f9] p-4 sm:p-8 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Left Side - Dark Brand Panel */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#1c3150] to-[#14233a] p-10 lg:p-14 text-white flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md w-max mb-6 border border-white/5">
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            <span className="text-xs font-semibold tracking-wider text-emerald-400">
              FIELD SALES
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Operational sales control with live client workflows.
          </h1>

          <p className="text-gray-300 mb-8 text-sm lg:text-base leading-relaxed">
            Sign in with an active FSE or Manager account to manage leads,
            schedule follow-ups, submit approvals, and view application
            analytics.
          </p>

          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-gray-200">
              Area-wise lead mapping and follow-up scheduling
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-gray-200">
              Hierarchy approvals (Normal to High-Value deals)
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-gray-200">
              Real-time conversion tracking and activity logs
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
              Portal Access
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to Sales Panel
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              This app connects to the central backend and only allows active
              sales accounts to enter.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Zone Dropdown Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Operating Zone
                </label>
                {/* We use appearance-none to remove the default browser arrow and let Tailwind style it */}
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c3150] focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Select your zone
                  </option>
                  <option value="North">North Zone</option>
                  <option value="East">East Zone</option>
                  <option value="West">West Zone</option>
                  <option value="South">South Zone</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
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

              <div className="relative space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "password" : "text"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c3150] focus:border-transparent transition-all"
                />
                <button type="button" onClick={()=>{setShowPassword(!showPassword)}} className=" absolute right-3 top-1/2 text-xl cursor-pointer text-gray-500">
                  {showPassword ? <FaEyeSlash /> : <FaEye/>}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1c3150] hover:bg-[#12223a] text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 mt-4 shadow-md"
              >
                Continue to Sales Dashboard
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#1c3150] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
