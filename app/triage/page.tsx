'use client';

import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import { NewIncidentModal } from '../../components/NewIncidentModal';
import { SosAlertModal } from '../../components/SosAlertModal';
import { INITIAL_AGENCY_MATCHES, INITIAL_DATA_FEED_LOGS } from '../../data/mockData';
import { AgencyMatch, DataFeedLog } from '../../types/rescue';

export default function TriagePage() {
  const [agencies, setAgencies] = useState<AgencyMatch[]>(INITIAL_AGENCY_MATCHES);
  const [logs, setLogs] = useState<DataFeedLog[]>(INITIAL_DATA_FEED_LOGS);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editable incident fields
  const [incidentTitle, setIncidentTitle] = useState('Flooded Building - Ground Floor Breach');
  const [locationText, setLocationText] = useState('Alappuzha District, Sector 4');
  const [victimCount, setVictimCount] = useState(15);
  const [waterRising, setWaterRising] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAssignAgency = (id: string, name: string) => {
    setAgencies(prev =>
      prev.map(a => (a.id === id ? { ...a, assigned: true, statusText: 'AGENCY DISPATCHED' } : a))
    );
    showToast(`SUCCESS: ${name} assigned to INC-1024! Dispatch orders transmitted.`);
    const newLog: DataFeedLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' IST',
      logText: `Dispatch order issued for ${name} [${id}].`,
      type: 'system'
    };
    setLogs([newLog, ...logs]);
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

      {/* Main Content Wrapper */}
      <div className="flex-grow flex flex-col lg:ml-64 w-full relative pb-20 md:pb-8">
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f5f0e8]">
          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-[#1a1a1a] pb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#1a1a1a] text-white px-2.5 py-1 font-headline text-xs font-black uppercase brutal-border">
                  INC-1024
                </span>
                <span className="text-[#e63b2e] font-headline font-black uppercase text-xs animate-pulse flex items-center gap-1">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  Critical Triage Priority
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    className="w-full bg-[#eee9e0] brutal-border p-2 font-headline font-black text-xl"
                  />
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="w-full bg-[#eee9e0] brutal-border p-2 font-body text-sm font-bold"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-headline font-black uppercase tracking-tighter leading-none text-[#1a1a1a]">
                    {incidentTitle}
                  </h2>
                  <p className="text-sm md:text-lg font-headline font-bold mt-2 flex items-center gap-2 text-[#4a4a4a]">
                    <span className="material-symbols-outlined text-xl">location_on</span> {locationText}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="neo-button bg-[#eee9e0] text-[#1a1a1a] px-5 py-2.5 flex items-center gap-2 text-xs"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                {isEditing ? 'SAVE DETAILS' : 'EDIT DETAILS'}
              </button>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: AI Score & Context Data Feed (Cols 1-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* AI Priority Score Card */}
              <div className="bg-[#eee9e0] brutal-border p-6 relative overflow-hidden brutal-shadow">
                <h3 className="font-headline font-black uppercase text-lg mb-4 flex items-center gap-2 border-b-2 border-[#1a1a1a] pb-2 text-[#1a1a1a]">
                  <span className="material-symbols-outlined text-xl">smart_toy</span> AI Priority Score
                </h3>

                {/* Circular Gauge */}
                <div className="flex justify-center items-center py-4">
                  <div className="relative w-44 h-44 flex justify-center items-center rounded-full border-8 border-[#1a1a1a] bg-[#f5f0e8] brutal-shadow">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e63b2e"
                        strokeWidth="10"
                        strokeDasharray="251"
                        strokeDashoffset="25"
                      />
                    </svg>
                    <div className="text-center z-10">
                      <span className="block text-5xl font-headline font-black text-[#e63b2e]">91</span>
                      <span className="block text-[10px] font-headline font-black uppercase tracking-wider text-[#4a4a4a] mt-0.5">
                        out of 100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 mt-2">
                  <div className="flex justify-between items-center bg-[#f5f0e8] p-2.5 brutal-border">
                    <span className="font-headline text-xs font-bold uppercase text-[#4a4a4a]">Victim Count</span>
                    <span className="font-headline font-black text-base text-[#1a1a1a]">
                      {victimCount}+ Est.
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-[#f5f0e8] p-2.5 brutal-border">
                    <span className="font-headline text-xs font-bold uppercase text-[#4a4a4a]">Water Level Rising</span>
                    <button
                      onClick={() => setWaterRising(!waterRising)}
                      className={`font-headline font-black text-xs px-2 py-0.5 brutal-border ${
                        waterRising ? 'bg-[#e63b2e] text-white' : 'bg-[#00cc00] text-white'
                      }`}
                    >
                      {waterRising ? 'YES (CRITICAL)' : 'STABLE'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-[#f5f0e8] p-2.5 brutal-border">
                    <span className="font-headline text-xs font-bold uppercase text-[#4a4a4a]">Structural Risk</span>
                    <span className="font-headline font-black text-base text-[#e63b2e]">HIGH</span>
                  </div>
                </div>
              </div>

              {/* Data Feed & Sensor Logs */}
              <div className="bg-[#1a1a1a] text-white p-6 brutal-shadow-lg relative">
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#ffcc00] border-l-4 border-b-4 border-[#1a1a1a]"></div>
                <h3 className="font-headline font-black uppercase text-base mb-3 border-b-2 border-white/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span> Sensor & Drone Telemetry
                </h3>
                <p className="font-body text-xs leading-relaxed mb-4 text-[#eee9e0]">
                  Sensors indicate ground floor submergence. 3 distress calls received from coordinates within the building block. Power grid offline.
                </p>

                <div className="space-y-2 font-mono text-[11px] bg-[#2a2a2a] p-3 border-l-4 border-[#e63b2e]">
                  {logs.map(log => (
                    <div key={log.id} className="border-b border-white/10 pb-1 last:border-0">
                      <span className="text-[#ffcc00]">[{log.timestamp}]</span> {log.logText}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column: Smart Agency Match (Cols 5-12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-[#faf7f2] brutal-border p-6 flex-1 flex flex-col brutal-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-4 border-[#1a1a1a] pb-4 gap-2">
                  <h3 className="font-headline font-black uppercase text-2xl flex items-center gap-2 text-[#1a1a1a]">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      target
                    </span>
                    Smart Agency Match Engine
                  </h3>
                  <span className="bg-[#0055ff] text-white px-3 py-1 font-headline text-xs font-black uppercase brutal-shadow">
                    3 Optimal Targets
                  </span>
                </div>

                {/* Agency Match List */}
                <div className="space-y-4 flex-1">
                  {agencies.map((agency, idx) => (
                    <div
                      key={agency.id}
                      className={`p-5 brutal-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative transition-colors ${
                        idx === 0
                          ? 'bg-[#f5f0e8] hover:bg-[#ffcc00] brutal-shadow-lg'
                          : 'bg-[#eee9e0] hover:bg-[#e8e3da]'
                      }`}
                    >
                      {/* Match percentage badge */}
                      <div
                        className={`absolute -left-3 -top-3 font-headline text-xs font-black uppercase px-2.5 py-1 brutal-border brutal-shadow rotate-[-4deg] ${
                          agency.matchScore > 90
                            ? 'bg-[#e63b2e] text-white'
                            : agency.matchScore > 80
                            ? 'bg-[#0055ff] text-white'
                            : 'bg-[#1a1a1a] text-white'
                        }`}
                      >
                        {agency.matchScore}% Match
                      </div>

                      <div className="flex-1 mt-2 sm:mt-0">
                        <h4 className="font-headline font-black text-xl uppercase text-[#1a1a1a] mb-1">
                          {agency.name}
                        </h4>
                        <p className="font-headline font-bold text-xs text-[#4a4a4a] mb-2">{agency.statusText}</p>

                        <div className="flex flex-wrap gap-2 text-xs font-headline font-bold">
                          <span className="bg-[#1a1a1a] text-white px-2 py-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">distance</span> {agency.distanceKm} km away
                          </span>
                          {agency.equipment.map((eq, i) => (
                            <span key={i} className="border-2 border-[#1a1a1a] bg-[#f5f0e8] px-2 py-1">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>

                      {agency.assigned ? (
                        <button
                          disabled
                          className="neo-button bg-[#00cc00] text-white px-6 py-3 w-full sm:w-auto text-xs"
                        >
                          ✓ ASSIGNED
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignAgency(agency.id, agency.name)}
                          className={`neo-button px-6 py-3 w-full sm:w-auto text-xs ${
                            idx === 0 ? 'bg-[#0055ff] text-white' : 'bg-[#eee9e0] text-[#1a1a1a]'
                          }`}
                        >
                          ASSIGN AGENCY
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-[#1a1a1a] border-dashed flex justify-between items-center text-xs font-headline font-bold uppercase">
                  <span>Need broader jurisdiction response?</span>
                  <button
                    onClick={() => showToast('Search radius expanded to 50 km (6 additional units discovered).')}
                    className="underline text-[#0055ff] hover:text-[#1a1a1a] cursor-pointer"
                  >
                    Expand Search Radius (+25 km)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onAddIncident={(inc) => showToast(`New Incident Registered: ${inc.id}`)}
      />
      <SosAlertModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSos={(cat) => showToast(`GLOBAL SOS BROADCAST: ${cat}`)}
      />
    </div>
  );
}
