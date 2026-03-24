import React from 'react'

const Header = () => {
  return (
         <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8">
          
          <div className="relative w-96">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#14325a] focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-[#14325a] relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-0 right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#14325a]">Avinash</p>
                <p className="text-xs text-gray-500">Field Sales Executive</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#14325a] text-white flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </div>
        </header>
  )
}

export default Header
