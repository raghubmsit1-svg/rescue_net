'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Navigation } from '../../components/Navigation';
import { MeshStatusBanner } from '../../components/MeshStatusBanner';
import { NewIncidentModal } from '../../components/NewIncidentModal';
import { SosAlertModal } from '../../components/SosAlertModal';

export default function VictimSosPage() {
  const [gpsLocked, setGpsLocked] = useState<boolean>(true);
  const [holdingProgress, setHoldingProgress] = useState<number>(0);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const holdIntervalRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStartHold = () => {
    if (sosSent) return;
    setHoldingProgress(0);

    let progress = 0;
    holdIntervalRef.current = setInterval(() => {
      progress += 10;
      setHoldingProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        setSosSent(true);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e63b2e', '#ffcc00', '#0055ff']
        });
        showToast('EMERGENCY SIGNAL SENT! Rescue Net HQ and nearest units alerted.');
      }
    }, 100);
  };

  const handleStopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    if (!sosSent) {
      setHoldingProgress(0);
    }
  };

  const handleQuickReport = (type: string) => {
    showToast(`Distress Request Logged: "${type}". Location coords transmitted.`);
    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#ffcc00', '#0055ff']
    });
  };

  return (
    <div className="bg-[#f5f0e8] text-[#1a1a1a] font-body min-h-screen flex flex-col">
      <MeshStatusBanner />
      {/* Navigation */}
      <Navigation
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Canvas */}
      <div className="flex-grow flex flex-col lg:ml-64 w-full relative pb-24 md:pb-8">
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

        <main className="flex-grow flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 md:p-8 gap-8 font-headline">
          {/* Left Column: Primary Hold-to-SOS Action */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            {/* GPS Status Block */}
            <div className="bg-[#eee9e0] p-4 brutal-border brutal-shadow flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#0055ff] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  my_location
                </span>
                <div>
                  <h2 className="font-black uppercase text-base">GPS Location Locked</h2>
                  <p className="font-body text-xs text-[#4a4a4a]">Accurate to 3 meters • Kerala Sector 4 Grid</p>
                </div>
              </div>
              <div className="w-3.5 h-3.5 bg-[#00cc00] rounded-full animate-pulse brutal-border"></div>
            </div>

            {/* Massive SOS Trigger */}
            <div className="flex-grow flex flex-col items-center justify-center py-6 bg-[#faf7f2] brutal-border brutal-shadow p-6 relative">
              {sosSent ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-24 h-24 bg-[#00cc00] text-white rounded-full flex items-center justify-center mx-auto brutal-border brutal-shadow text-5xl font-black">
                    ✓
                  </div>
                  <h3 className="text-3xl font-black uppercase text-[#1a1a1a]">DISTRESS SIGNAL BROADCAST</h3>
                  <p className="font-body text-sm text-[#4a4a4a] max-w-xs mx-auto">
                    Delta Rescue Squad and Sector 4 HQ have received your GPS coordinates. Stay calm, help is en route.
                  </p>
                  <button
                    onClick={() => {
                      setSosSent(false);
                      setHoldingProgress(0);
                    }}
                    className="bg-[#1a1a1a] text-white font-black text-xs uppercase py-3 px-6 brutal-border"
                  >
                    RESET DISPATCH STATUS
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase text-[#4a4a4a] mb-4 text-center">
                    PRESS & HOLD FOR 1 SECOND TO BROADCAST SOS
                  </p>

                  <div className="relative">
                    {/* Progress Circle SVG Overlay */}
                    <svg className="w-64 h-64 absolute -inset-2 transform -rotate-90 pointer-events-none z-20" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="#ffcc00"
                        strokeWidth="8"
                        strokeDasharray="289"
                        strokeDashoffset={289 - (289 * holdingProgress) / 100}
                        className="transition-all duration-75"
                      />
                    </svg>

                    <button
                      onMouseDown={handleStartHold}
                      onMouseUp={handleStopHold}
                      onMouseLeave={handleStopHold}
                      onTouchStart={handleStartHold}
                      onTouchEnd={handleStopHold}
                      className="w-60 h-60 rounded-full bg-[#e63b2e] text-white brutal-border brutal-shadow-lg flex flex-col items-center justify-center gap-3 sos-btn-anim active:scale-95 transition-transform cursor-pointer relative overflow-hidden select-none"
                    >
                      <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        warning
                      </span>
                      <span className="font-black text-2xl uppercase tracking-tighter">HOLD FOR SOS</span>
                      <span className="text-[10px] font-bold uppercase text-[#ffcc00]">
                        {holdingProgress > 0 ? `${holdingProgress}%` : 'HOLD DOWN'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Quick Category Reporting & Mini Map */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            {/* Quick Report Category Grid */}
            <div>
              <h3 className="font-black text-xl uppercase border-b-4 border-[#1a1a1a] pb-2 mb-4">
                One-Touch Quick Emergency Report
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Medical Help */}
                <button
                  onClick={() => handleQuickReport('Medical Emergency')}
                  className="bg-[#eee9e0] brutal-border brutal-shadow p-5 flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <span className="material-symbols-outlined text-4xl text-[#e63b2e]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    medical_services
                  </span>
                  <span className="font-bold uppercase text-xs text-center">Medical Emergency</span>
                </button>

                {/* Rescue Needed */}
                <button
                  onClick={() => handleQuickReport('Water Rescue Needed')}
                  className="bg-[#eee9e0] brutal-border brutal-shadow p-5 flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <span className="material-symbols-outlined text-4xl text-[#0055ff]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    sailing
                  </span>
                  <span className="font-bold uppercase text-xs text-center">Boat Evac Needed</span>
                </button>

                {/* Supplies */}
                <button
                  onClick={() => handleQuickReport('Food & Water Supplies')}
                  className="bg-[#eee9e0] brutal-border brutal-shadow p-5 flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <span className="material-symbols-outlined text-4xl text-[#ffcc00]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    inventory_2
                  </span>
                  <span className="font-bold uppercase text-xs text-center">Food & Supplies</span>
                </button>

                {/* Hazard */}
                <button
                  onClick={() => handleQuickReport('Fire / Gas Hazard')}
                  className="bg-[#eee9e0] brutal-border brutal-shadow p-5 flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <span className="material-symbols-outlined text-4xl text-[#e63b2e]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  <span className="font-bold uppercase text-xs text-center">Hazard Alert</span>
                </button>
              </div>
            </div>

            {/* Mini Map Coordinates Block */}
            <div className="bg-[#eee9e0] brutal-border p-4 brutal-shadow flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-black text-sm uppercase mb-1">GPS Telemetry Output</h4>
                <p className="font-mono text-xs text-[#4a4a4a]">LAT: 9.4981° N | LNG: 76.3388° E</p>
                <p className="font-body text-xs text-[#4a4a4a] mt-1">Grid Sector: Alappuzha Central Waterway Block 3</p>
              </div>
              <button
                onClick={() => setGpsLocked(!gpsLocked)}
                className="mt-4 bg-[#1a1a1a] text-white p-2.5 font-black text-xs uppercase brutal-border hover:bg-[#ffcc00] hover:text-[#1a1a1a] cursor-pointer"
              >
                {gpsLocked ? '✓ RE-CALIBRATE GPS POSITION' : 'LOCK CURRENT LOCATION'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onAddIncident={(inc) => showToast(`Incident Registered: ${inc.id}`)}
      />
      <SosAlertModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSos={(cat) => showToast(`GLOBAL SOS BROADCAST: ${cat}`)}
      />
    </div>
  );
}
