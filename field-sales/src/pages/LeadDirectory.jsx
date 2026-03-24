import React, { useState } from 'react';
import { 
  LuSearch, LuUser, LuMapPin, LuPhone, 
  LuSend, LuArrowRight, LuX, LuCircleCheckBig, LuCalendar 
} from "react-icons/lu";
import { useRef } from 'react';

export default function LeadDirectory() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState(null); // For the Modal
  const dateRef = useRef(null);

  const leads = [
    { id: 1, company: "TechSolutions Inc.", contact: "Amit Kumar", dist: "2.5 km", status: "INTERESTED" },
    { id: 2, company: "Global Manufacturing", contact: "Sarah Jones", dist: "5.2 km", status: "NEW" },
    { id: 3, company: "Retail Giants", contact: "Raj Patel", dist: "1.1 km", status: "CONTACTED" },
    { id: 4, company: "Alpha Logistics", contact: "Mike Ross", dist: "8.0 km", status: "CONVERTED" },
    { id: 5, company: "Beta Systems", contact: "Jenny Lee", dist: "3.4 km", status: "NEW" },
  ];

  // Filtering Logic
  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'All' || lead.status === filter.toUpperCase();
    const matchesSearch = lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="relative">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search companies or location..." 
            className="w-full pl-12 pr-4 py-4 bg-[#F8FAFC] rounded-2xl border-none  focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['All', 'New', 'Contacted', 'Interested', 'Converted'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filter === cat ? 'bg-[#14325a] text-white' : 'bg-blue-50 text-gray-500 hover:bg-blue-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Cards List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-6 right-6">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-md tracking-wider
                ${lead.status === 'NEW' ? 'bg-blue-50 text-blue-500' : 
                  lead.status === 'INTERESTED' ? 'bg-green-50 text-green-600' : 
                  lead.status === 'CONVERTED' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                {lead.status}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#14325a]">{lead.company}</h3>
              <div className="flex gap-6 text-sm text-gray-400 font-medium">
                <span className="flex items-center gap-1.5"><LuUser size={16} /> {lead.contact}</span>
                <span className="flex items-center gap-1.5"><LuMapPin size={16} /> {lead.dist}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={() => setSelectedLead(lead)}
                  className="text-blue-700 font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  Log Activity <LuArrowRight size={16} />
                </button>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100"><LuPhone size={20} /></button>
                  <button className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"><LuSend size={20} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- LOG ACTIVITY MODAL --- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#14325a]">Log Activity</h2>
                <p className="text-xs text-gray-400 font-medium">Selected: {selectedLead.company}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600"><LuX size={24}/></button>
            </div>

            <div className="p-6 space-y-3">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Outcome</label>
                <select className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Meeting Successful</option>
                  <option>Follow-up Required</option>
                  <option>Not Interested</option>
                  <option>Decision Pending</option>
                  <option>Closed Won</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Meeting Notes</label>
                <textarea 
                  placeholder="Key takeaways, client feedback, next steps..." 
                  className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 text-sm font-medium h-32 outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Next Follow-up</label>
                <div className="relative cursor-pointer" onClick={() => dateRef.current?.showPicker?.() || dateRef.current?.focus()}>
                   <LuCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input type="date" ref={dateRef} className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 cursor-pointer pr-4 text-sm font-medium outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setSelectedLead(null)} className="py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                <button className="py-4 bg-[#badd29] text-[#14325a] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <LuCircleCheckBig size={20}/> Submit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}