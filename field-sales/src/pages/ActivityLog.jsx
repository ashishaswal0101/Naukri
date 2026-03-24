import React from 'react';
import { LuUsers, LuPhone, LuBriefcase, LuCircleCheckBig } from "react-icons/lu";

export default function ActivityLog() {
  // Mock data representing the chronological activity log
  const activities = [
    {
      id: 1,
      company: "TechSolutions Inc.",
      type: "MEETING",
      date: "TODAY, 10:30 AM",
      notes: '"Client interested in Silver package. Requested proposal."',
      status: "SUCCESS",
      iconType: "meeting"
    },
    {
      id: 2,
      company: "Retail Giants",
      type: "CALL",
      date: "YESTERDAY, 4:15 PM",
      notes: '"Spoke with Raj. Need to call back on Monday with pricing details."',
      status: "FOLLOW-UP",
      iconType: "call"
    },
    {
      id: 3,
      company: "Alpha Logistics",
      type: "SITE VISIT",
      date: "FEB 10, 2:00 PM",
      notes: '"Conducted site survey. Location suitable for standard deployment."',
      status: "COMPLETED",
      iconType: "visit"
    },
    {
      id: 4,
      company: "Global Manufacturing",
      type: "MEETING",
      date: "FEB 09, 11:00 AM",
      notes: '"Signed contract for Gold Package! Onboarding starts next week."',
      status: "CLOSED WON",
      iconType: "won"
    },
    {
      id: 5,
      company: "Beta Systems",
      type: "CALL",
      date: "FEB 08, 9:30 AM",
      notes: '"Left voicemail. Will try again tomorrow."',
      status: "NO ANSWER",
      iconType: "call"
    }
  ];

  // Helper function to render the correct icon and its background color
  const renderIcon = (type) => {
    switch (type) {
      case 'meeting':
        return <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><LuUsers size={22} /></div>;
      case 'call':
        return <div className="p-3 bg-slate-50 text-slate-600 rounded-full"><LuPhone size={22} /></div>;
      case 'visit':
        return <div className="p-3 bg-slate-50 text-slate-600 rounded-full"><LuBriefcase size={22} /></div>;
      case 'won':
        return <div className="p-3 bg-green-50 text-green-600 rounded-full"><LuCircleCheckBig size={22} /></div>;
      default:
        return <div className="p-3 bg-gray-50 text-gray-500 rounded-full"><LuUsers size={22} /></div>;
    }
  };

  // Helper function to render the exact badge styles from the screenshot
  const renderBadge = (status) => {
    const baseStyle = "text-[10px] font-bold px-3 py-1 rounded-md tracking-wider uppercase";
    switch (status) {
      case 'SUCCESS':
        return <span className={`${baseStyle} bg-green-100 text-green-700`}>{status}</span>;
      case 'FOLLOW-UP':
        return <span className={`${baseStyle} bg-orange-100 text-orange-700`}>{status}</span>;
      case 'COMPLETED':
        return <span className={`${baseStyle} bg-gray-100 text-gray-600`}>{status}</span>;
      case 'CLOSED WON':
        return <span className={`${baseStyle} bg-green-100 text-green-700`}>{status}</span>;
      case 'NO ANSWER':
        return <span className={`${baseStyle} bg-gray-100 text-gray-600`}>{status}</span>;
      default:
        return <span className={`${baseStyle} bg-gray-100 text-gray-500`}>{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#14325a]">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">Recent interactions and updates.</p>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity) => {
          // Check if this is a "Closed Won" card to apply the special green border
          const isClosedWon = activity.status === 'CLOSED WON';
          
          return (
            <div 
              key={activity.id} 
              className={`bg-white p-6 rounded-2xl flex items-start gap-4 transition-shadow hover:shadow-md
                ${isClosedWon ? 'border-2 border-green-200 shadow-sm' : 'border border-gray-200 shadow-sm'}`}
            >
              {/* Left Side Icon */}
              <div className="flex-shrink-0 mt-1">
                {renderIcon(activity.iconType)}
              </div>

              {/* Middle Content */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{activity.company}</h3>
                  {/* Status Badge (moves to top right on desktop) */}
                  <div className="hidden md:block">
                    {renderBadge(activity.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  <span className="text-[#14325a]">{activity.type}</span>
                  <span>•</span>
                  <span>{activity.date}</span>
                </div>

                <p className="text-gray-500 text-sm pt-1">
                  {activity.notes}
                </p>

                {/* Status Badge (visible on mobile only, under text) */}
                <div className="block md:hidden pt-2">
                  {renderBadge(activity.status)}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}