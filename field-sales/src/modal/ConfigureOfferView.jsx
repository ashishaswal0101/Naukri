import React, { useState } from 'react';
import { LuArrowLeft, LuPackage, LuCalculator, LuCircleCheckBig, LuInfo} from "react-icons/lu";

const ConfigureOfferView = ({ client, onBack }) => {
  const [plan, setPlan] = useState('Bronze');
  const plans = {
    Bronze: { price: 15000, features: ["Basic Listing", "Email Support"] },
    Silver: { price: 25000, features: ["Premium Listing", "Email & Phone Support", "Analytics"] },
    Gold: { price: 40000, features: ["Featured Listing", "Email & Phone Support", "Advanced Analytics", "API Access"] }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors"><LuArrowLeft size={24} /></button>
        <h1 className="text-2xl font-bold text-[#14325a]">Configure Offer for {client?.company}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Standard Details */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h2 className="flex items-center gap-2 text-[#14325a] font-bold text-lg"><LuPackage className="text-blue-600" /> Standard Package Details</h2>
          <div className="border border-blue-50 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold text-[#14325a]">{plan} Plan</h3>
              <span className="text-2xl font-bold text-[#14325a]">₹{plans[plan].price.toLocaleString()}</span>
            </div>
            <ul className="space-y-3">
              {plans[plan].features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-gray-400 text-[10px] flex items-center gap-1"><LuInfo size={12}/> List prices subject to quarterly review.</p>
        </div>

        {/* Right: Build Proposal */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
          <h2 className="flex items-center gap-2 text-[#14325a] font-bold text-lg"><LuCalculator className="text-blue-600" /> Build Proposal</h2>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Package</label>
            <div className="grid grid-cols-3 gap-2">
              {['Bronze', 'Silver', 'Gold'].map(p => (
                <button key={p} onClick={() => setPlan(p)} className={`py-3 rounded-xl font-bold border-2 transition-all ${plan === p ? 'bg-[#14325a] text-white border-[#14325a]' : 'bg-white text-gray-400 border-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Negotiated Price (₹)</label>
            <input type="number" placeholder={`Target: ₹${plans[plan].price}`} className="w-full bg-[#f8fafc] rounded-2xl py-5 px-6 text-xl font-bold text-[#14325a] outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-center text-green-600 font-bold text-sm">No Discount</p>
          </div>
          <button className="w-full bg-[#14325a] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 active:scale-95 transition-all">
            <LuCircleCheckBig size={22} className="text-green-400" /> Generate Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureOfferView;