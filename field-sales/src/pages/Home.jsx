import React from 'react';
import { CiLocationOn } from "react-icons/ci";
import ConfigureOfferView from '../modal/ConfigureOfferView';
import { useState } from 'react';

// Mock Data remains organized for easy API swapping later
const statsData = [
  {
    id: 1,
    title: "New Leads",
    value: "5",
    theme: {
      card: "bg-[#f0f7ff] border-blue-200 shadow-sm",
      title: "text-blue-600",
      value: "text-blue-700",
      iconBg: "bg-blue-100 text-blue-600"
    },
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
  },
  {
    id: 2,
    title: "Pending Follow-ups",
    value: "12",
    theme: {
      card: "bg-[#fff7f0] border-orange-200 shadow-sm",
      title: "text-orange-600",
      value: "text-orange-600",
      iconBg: "bg-orange-100 text-orange-600"
    },
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
  },
  {
    id: 3,
    title: "Meetings Today",
    value: "8",
    theme: {
      card: "bg-white border-gray-200 shadow-sm",
      title: "text-[#14325a]",
      value: "text-[#14325a]",
      iconBg: "bg-gray-50 border border-gray-100 text-[#14325a]"
    },
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  }
];

const scheduleData = [
  {
    id: 1,
    time: "10:00 AM",
    status: "COMPLETED",
    company: "TechSolutions Inc.",
    address: "123 Tech Park",
    theme: {
      dot: "bg-gray-300 border-4 border-[#f4f7f9]",
      badge: "text-gray-500 bg-gray-100"
    }
  },
  {
    id: 2,
    time: "01:30 PM",
    status: "ONGOING",
    company: "Global Mfg",
    address: "45 Industrial Blvd",
    theme: {
      dot: "bg-[#badd29] border-4 border-[#f4f7f9]",
      badge: "text-green-700 bg-green-100"
    }
  },
  {
    id: 3,
    time: "03:45 PM",
    status: "UPCOMING",
    company: "Retail Giants",
    address: "789 Market St",
    theme: {
      dot: "bg-white border-2 border-[#14325a]",
      badge: "text-blue-600 bg-blue-50"
    }
  },
  {
    id: 4,
    time: "05:00 PM",
    status: "UPCOMING",
    company: "Alpha Logistics",
    address: "101 Cargo Way",
    theme: {
      dot: "bg-white border-2 border-[#14325a]",
      badge: "text-blue-600 bg-blue-50"
    }
  }
];

export default function Dashboard() {

  const [view, setView] = useState('home'); // 'home' or 'offer'
  const [activeClient, setActiveClient] = useState(null);

  // Function to switch to Offer Page
  const handleLogClick = (client) => {
    setActiveClient(client);
    setView('offer');
  };

  // Function to switch back to Home
  const handleBackToHome = () => {
    setView('home');
    setActiveClient(null);
  };

  // --- RENDER LOGIC ---

  // If view is 'offer', show the Configure screen and HIDE the dashboard
  if (view === 'offer') {
    return (
      <ConfigureOfferView 
        client={activeClient} 
        onBack={handleBackToHome} 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4">

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <div key={stat.id} className={`${stat.theme.card} p-6 rounded-2xl relative border overflow-hidden`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`${stat.theme.title} text-[11px] font-bold tracking-widest uppercase`}>{stat.title}</h3>
              <div className={`${stat.theme.iconBg} p-2 rounded-lg`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{stat.icon}</svg>
              </div>
            </div>
            <p className={`${stat.theme.value} text-4xl font-bold`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Schedule Timeline Section */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-8 text-[#14325a]">
          <svg className="w-6 h-6 text-[#84cc16]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-xl font-extrabold">Your Schedule Today</h2>
        </div>

        {/* Timeline Container */}
        <div className="relative pl-8 border-l-2 border-gray-200 space-y-8 ml-3">
          {scheduleData.map((item) => (
            <div key={item.id} className="relative group">

              {/* Status Dot */}
              <div className={`absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10 transition-transform group-hover:scale-125 ${item.theme.dot}`}></div>

              {/* Content Card */}
              <div className={`bg-white px-6 py-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 
                ${item.status === 'ONGOING' ? 'border-green-200 shadow-md ring-1 ring-green-100' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>

                <div className="flex flex-col gap-6">
                  <div className="mb-2">
                    <span className="text-[11px] font-bold text-[#14325a] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.time}</span>
                    <h3 className="text-xl font-bold text-black">{item.company}</h3>
                  </div>


                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-2">
                    <CiLocationOn className="text-gray-400 w-4 h-4" />
                    {/* <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg> */}
                    {item.address}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-6'>
                  <div className='flex-1 w-full mb-2 text-right'>
                    <span className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase ${item.theme.badge}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex-2 flex items-center gap-2 self-end md:self-center">
                    <button className="p-2.5 border border-gray-100 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </button>
                    <button className="p-2.5 border border-gray-100 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-100 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                    <button onClick={() => handleLogClick(item)} className="bg-[#14325a] text-white px-6 py-2.5 rounded-3xl text-sm font-bold hover:bg-[#0e2444] shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-2">
                      Log <svg className="" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}