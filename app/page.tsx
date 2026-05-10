'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import NationalOverview from '@/components/NationalOverview';
import RegionalOperations from '@/components/RegionalOperations';
import DepotOperations from '@/components/DepotOperations';
import EmergencyMode from '@/components/EmergencyMode';

export default function Home() {
  const [activeTab, setActiveTab] = useState('national');

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-700/50 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-900/20">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
                Stock Smart AI
              </h1>
              <p className="text-xs text-slate-400 tracking-widest uppercase">PEA Hackathon PoC</p>
            </div>
          </div>
          
          {/* Tabs */}
          <nav className="flex gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/50 shadow-inner overflow-x-auto w-full md:w-auto">
            {[
              { id: 'national', label: 'ภาพรวมประเทศ' },
              { id: 'regional', label: 'ระดับเขต (Region)' },
              { id: 'depot', label: 'ระดับคลังพัสดุ (Depot)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            <div className="w-px bg-slate-700 mx-1 hidden md:block"></div>
            
            <button 
              onClick={() => setActiveTab('emergency')} 
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'emergency' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40 animate-pulse' 
                  : 'text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              โหมดฉุกเฉิน
            </button>
          </nav>
        </header>

        {/* Content Area */}
        <main className="min-h-[600px]">
          {activeTab === 'national' && <NationalOverview />}
          {activeTab === 'regional' && <RegionalOperations />}
          {activeTab === 'depot' && <DepotOperations />}
          {activeTab === 'emergency' && <EmergencyMode />}
        </main>

      </div>
    </div>
  );
}