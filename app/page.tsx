'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import NationalOverview from '@/components/NationalOverview';
import RegionalOperations from '@/components/RegionalOperations';
import DepotOperations from '@/components/DepotOperations';
import EmergencyMode from '@/components/EmergencyMode';

import Chatbot from '@/components/Chatbot';

export default function Home() {
  const [activeTab, setActiveTab] = useState('national');

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 font-sans text-slate-200 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-slate-700/50 pb-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 font-bold shadow-lg shadow-blue-900/20">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                Stock Smart AI
              </h1>
              <p className="text-xs uppercase tracking-widest text-slate-400">PEA Hackathon PoC</p>
            </div>
          </div>

          <nav className="flex w-full gap-2 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/80 p-1.5 shadow-inner md:w-auto">
            {[
              { id: 'national', label: 'ภาพรวมประเทศ' },
              { id: 'regional', label: 'ระดับเขต (Region)' },
              { id: 'depot', label: 'ระดับคลังพัสดุ (Depot)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="mx-1 hidden w-px bg-slate-700 md:block" />

            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'emergency'
                  ? 'animate-pulse bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'border border-transparent text-red-400 hover:border-red-900/50 hover:bg-red-950/40'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              โหมดฉุกเฉิน
            </button>
          </nav>
        </header>

        <main className="min-h-[600px]">
          {activeTab === 'national' && <NationalOverview />}
          {activeTab === 'regional' && <RegionalOperations />}
          {activeTab === 'depot' && <DepotOperations />}
          {activeTab === 'emergency' && <EmergencyMode />}
        </main>
      </div>

      <Chatbot />
    </div>
  );
}
