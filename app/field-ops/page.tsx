'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { MeshStatusBanner } from '../../components/MeshStatusBanner';
import { InteractiveMap } from '../../components/InteractiveMap';
import { NewIncidentModal } from '../../components/NewIncidentModal';
import { SosAlertModal } from '../../components/SosAlertModal';
import { INITIAL_INCIDENTS, INITIAL_RESPONDER_SAFETY } from '../../data/mockData';
import { ResponderSafety } from '../../types/rescue';

export default function FieldOpsPage() {
  const [responders, setResponders] = useState<ResponderSafety[]>(INITIAL_RESPONDER_SAFETY);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [responderStatus, setResponderStatus] = useState<string>('En Route to Scene');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(262); // 4m 22s
  const [deadmanTimer, setDeadmanTimer] = useState<number>(1800); // 30 minutes countdown
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setDeadmanTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCheckIn = () => {
    setDeadmanTimer(1800);
    showToast('RESPONDER SAFETY CHECK-IN VERIFIED! Dead-man timer reset to 30:00');
  };

  const handleUpdateStatus = (newStatus: string) => {
    setResponderStatus(newStatus);
    showToast(`Responder status updated to: "${newStatus}"`);
  };

  return (
    <div className="bg-[#f5f0e8] text-[#1a1a1a] font-body min-h-screen flex flex-col">
      <MeshStatusBanner />
      <Navigation
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-grow w-full lg:ml-64 pb-24 md:pb-8 relative">
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
          {/* Header */}
          <div className="border-b-4 border-[#1a1a1a] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 font-headline">
            <div>
              <span className="bg-[#0055ff] text-white font-black text-xs px-2.5 py-1 border-2 border-[#1a1a1a] uppercase tracking-wider">
                Tactical Unit Safety Protocol
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase text-[#1a1a1a] tracking-tight mt-2">
                Worker Safety &amp; Field Ops
              </h1>
              <p className="text-sm font-bold text-[#4a4a4a] uppercase tracking-widest mt-1">
                Dead-Man Heartbeat Monitor • Environmental Risk Telemetry
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCheckIn}
                className="neo-button bg-[#00cc00] text-white px-5 py-3 text-xs font-black uppercase flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">verified_user</span>
                SAFETY CHECK-IN ({formatTimer(deadmanTimer)})
              </button>
            </div>
          </div>

          {/* Safety Alert Banner if timer low */}
          {deadmanTimer < 300 && (
            <div className="bg-[#e63b2e] text-white p-4 border-4 border-[#1a1a1a] brutal-shadow flex justify-between items-center font-headline animate-bounce">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <div>
                  <h3 className="font-black text-sm uppercase">AUTOMATIC CHECK-IN TIMEOUT WARNING</h3>
                  <p className="text-xs font-bold text-white/90">
                    Mandatory dead-man heartbeat check-in required within {formatTimer(deadmanTimer)}.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCheckIn}
                className="bg-[#ffcc00] text-[#1a1a1a] font-black text-xs px-4 py-2 border-2 border-[#1a1a1a] uppercase"
              >
                CONFIRM SAFE NOW
              </button>
            </div>
          )}

          {/* Incident Context Block */}
          <section className="border-4 border-[#1a1a1a] bg-[#f5f0e8] brutal-shadow p-4 md:p-6 relative font-headline">
            <div className="absolute top-0 right-0 bg-[#e63b2e] text-white px-3 py-1 border-l-4 border-b-4 border-[#1a1a1a] font-black text-xs md:text-sm uppercase">
              Active Task Assignment
            </div>

            <div className="mb-2">
              <span className="bg-[#1a1a1a] text-white px-2 py-0.5 text-xs font-bold uppercase inline-block border-2 border-[#1a1a1a]">
                INC-1024
              </span>
              <span className="ml-2 bg-[#ffcc00] text-[#1a1a1a] px-2 py-0.5 text-xs font-bold uppercase inline-block border-2 border-[#1a1a1a]">
                {responderStatus}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-tighter text-[#1a1a1a]">
              Flooded Building Structure Rescue &amp; Evac
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mt-4 text-xs md:text-sm font-bold uppercase">
              <div className="flex items-center gap-2 text-[#4a4a4a]">
                <span className="material-symbols-outlined text-[#1a1a1a]">location_on</span>
                <span>Sector 4, Alappuzha Waterway Grid</span>
              </div>
              <div className="flex items-center gap-2 text-[#e63b2e]">
                <span className="material-symbols-outlined text-base">timer</span>
                <span>Mission Time: {formatTimer(elapsedSeconds)} Elapsed</span>
              </div>
            </div>
          </section>

          {/* Field Map Navigation & Roster Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-headline">
            {/* Map Canvas */}
            <div className="lg:col-span-7 border-4 border-[#1a1a1a] bg-[#f5f0e8] brutal-shadow h-96 overflow-hidden">
              <InteractiveMap
                incidents={INITIAL_INCIDENTS.slice(0, 3)}
                selectedIncidentId="INC-1024"
                title="Field Tactical GPS Navigation"
                heightClass="h-full"
              />
            </div>

            {/* Deployed Responders Safety Roster */}
            <div className="lg:col-span-5 brutal-border bg-[#eee9e0] p-5 brutal-shadow">
              <div className="flex justify-between items-center border-b-3 border-[#1a1a1a] pb-3 mb-4">
                <h3 className="font-black text-base uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0055ff]">shield_person</span>
                  Team Safety Roster
                </h3>
                <span className="text-xs font-bold bg-[#1a1a1a] text-white px-2 py-0.5">
                  {responders.length} Deployed
                </span>
              </div>

              <div className="space-y-3">
                {responders.map((resp) => (
                  <div key={resp.id} className="bg-[#f5f0e8] brutal-border p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm uppercase text-[#1a1a1a]">{resp.name}</h4>
                        <p className="text-xs text-[#4a4a4a] font-mono">{resp.role} • {resp.unit}</p>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 brutal-border ${
                          resp.status === 'Safe / On Task'
                            ? 'bg-[#00cc00] text-white'
                            : resp.status === 'Check-in Warning'
                            ? 'bg-[#e63b2e] text-white animate-pulse'
                            : 'bg-[#ffcc00] text-[#1a1a1a]'
                        }`}
                      >
                        {resp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#1a1a1a]/20 text-[11px] font-mono font-bold text-[#4a4a4a]">
                      <div>HR: <span className="text-[#1a1a1a]">{resp.heartRateBpm} BPM</span></div>
                      <div>BAT: <span className="text-[#1a1a1a]">{resp.battery}%</span></div>
                      <div>RISK: <span className={resp.hazardRisk === 'Severe Risk' ? 'text-[#e63b2e]' : 'text-[#1a1a1a]'}>{resp.hazardRisk}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Grid */}
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
              {/* Status Selector */}
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

              {/* Responder Mayday SOS */}
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
