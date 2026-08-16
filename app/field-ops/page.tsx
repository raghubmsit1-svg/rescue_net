'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { InteractiveMap } from '../../components/InteractiveMap';
import { NewIncidentModal } from '../../components/NewIncidentModal';
import { SosAlertModal } from '../../components/SosAlertModal';
import { INITIAL_INCIDENTS } from '../../data/mockData';

export default function FieldOpsPage() {
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [responderStatus, setResponderStatus] = useState<string>('En Route to Scene');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(262); // 4m 22s
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} Elapsed`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateStatus = (newStatus: string) => {
    setResponderStatus(newStatus);
    showToast(`Responder status updated to: "${newStatus}"`);
  };

  return (
    <div className="bg-[#f5f0e8] text-[#1a1a1a] font-body min-h-screen flex flex-col">
      {/* Navigation */}
      <Navigation
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Canvas */}
      <div className="flex-grow w-full lg:ml-64 pb-24 md:pb-8 relative">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-[#ffcc00] text-[#1a1a1a] px-6 py-3 border-b-4 border-[#1a1a1a] font-headline font-black uppercase text-xs flex justify-between items-center z-30 animate-pulse">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="font-bold">✕</button>
          </div>
        )}

        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Incident Summary Card */}
          <section className="border-4 border-[#1a1a1a] bg-[#f5f0e8] brutal-shadow p-4 md:p-6 relative font-headline">
            <div className="absolute top-0 right-0 bg-[#e63b2e] text-white px-3 py-1 border-l-4 border-b-4 border-[#1a1a1a] font-black text-xs md:text-sm uppercase">
              High Priority Dispatch
            </div>

            <div className="mb-2">
              <span className="bg-[#1a1a1a] text-white px-2 py-0.5 text-xs font-bold uppercase inline-block border-2 border-[#1a1a1a]">
                INC-1024
              </span>
              <span className="ml-2 bg-[#ffcc00] text-[#1a1a1a] px-2 py-0.5 text-xs font-bold uppercase inline-block border-2 border-[#1a1a1a]">
                {responderStatus}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tighter leading-none text-[#1a1a1a]">
              Flooded Building Structure Rescue
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mt-4 text-xs md:text-sm font-bold uppercase">
              <div className="flex items-center gap-2 text-[#4a4a4a]">
                <span className="material-symbols-outlined text-[#1a1a1a]">location_on</span>
                <span>Sector 4, Alappuzha Waterway Grid</span>
              </div>
              <div className="flex items-center gap-2 text-[#e63b2e]">
                <span className="material-symbols-outlined text-base">timer</span>
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
            </div>
          </section>

          {/* Map View Snippet */}
          <section className="border-4 border-[#1a1a1a] bg-[#f5f0e8] brutal-shadow relative h-72 md:h-96 overflow-hidden">
            <InteractiveMap
              incidents={INITIAL_INCIDENTS.slice(0, 3)}
              selectedIncidentId="INC-1024"
              title="Field GPS Route Navigation"
              heightClass="h-full"
            />
          </section>

          {/* Action Buttons Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 font-headline">
            {/* Primary Navigation Action */}
            <button
              onClick={() => {
                setIsNavigating(!isNavigating);
                showToast(isNavigating ? 'GPS Navigation Paused.' : 'GPS Turn-by-Turn Navigation Started!');
              }}
              className={`border-4 border-[#1a1a1a] brutal-shadow-lg p-6 md:p-8 flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer ${
                isNavigating
                  ? 'bg-[#00cc00] text-white hover:bg-[#1a1a1a]'
                  : 'bg-[#0055ff] text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <span className="material-symbols-outlined text-5xl md:text-6xl group-hover:scale-110 transition-transform">
                navigation
              </span>
              <span className="font-black text-2xl md:text-3xl uppercase tracking-tight">
                {isNavigating ? 'NAVIGATION ACTIVE (PAUSE)' : 'START GPS NAVIGATION'}
              </span>
            </button>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Status Selector Dropdown / Button */}
              <div className="flex gap-2">
                {['En Route', 'On Scene', 'Cleared'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`flex-1 border-4 border-[#1a1a1a] p-3 font-black text-xs uppercase brutal-shadow cursor-pointer transition-all ${
                      responderStatus === st ? 'bg-[#ffcc00] text-[#1a1a1a]' : 'bg-[#eee9e0] hover:bg-[#ffcc00]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* SOS Trigger */}
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="bg-[#f5f0e8] text-[#e63b2e] border-4 border-[#e63b2e] brutal-shadow p-4 md:p-6 flex items-center justify-center gap-3 hover:bg-[#e63b2e] hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  sos
                </span>
                <span className="font-black text-xl uppercase">RESPONDER MAYDAY / TRIGGER SOS</span>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Modals */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onAddIncident={(inc) => showToast(`New Incident Broadcast: ${inc.id}`)}
      />
      <SosAlertModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSos={(cat) => showToast(`RESPONDER MAYDAY DISPATCHED: ${cat}`)}
      />
    </div>
  );
}
