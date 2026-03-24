import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpg'

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    return (
        <aside className="w-64 bg-[#14325a] text-white flex flex-col hidden md:flex border-r-4 border-blue-400/20">

            {/* Logo Area */}
            <div className="p-6">
                <div className=" h-[47px]  w-full overflow-hidden flex items-center justify-center rounded-lg">
                    
                       <img src={logo} alt="Maven Jobs Logo"  className="rounded-lg"/>
                   
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard')
                            ? 'bg-[#badd29] text-[#14325a] font-bold shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    Home
                </Link>

                <Link
                    to="/dashboard/leads"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/leads')
                            ? 'bg-[#badd29] text-[#14325a] font-bold shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Lead Directory
                </Link>

                <Link
                    to="/dashboard/activity"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/activity')
                            ? 'bg-[#badd29] text-[#14325a] font-bold shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Activity Log
                </Link>

                <Link
                    to="/dashboard/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/profile')
                            ? 'bg-[#badd29] text-[#14325a] font-bold shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profile
                </Link>
            </nav>

            {/* Bottom User Area */}
            <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#badd29] flex items-center justify-center text-[#14325a] font-bold text-sm">
                        SE
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Avinash</p>
                        <p className="text-xs text-gray-400">Field Sales Exec</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
