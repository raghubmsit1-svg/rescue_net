'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../../components/Navigation';
import { MeshStatusBanner } from '../../components/MeshStatusBanner';
import { NewIncidentModal } from '../../components/NewIncidentModal';
import { SosAlertModal } from '../../components/SosAlertModal';
import { apiGet, apiPatch, apiPost } from '../../lib/api/client';
import { ALAPPUZHA, mapSosCategory } from '../../lib/geo';
import { AgencyMatch, CreateIncidentInput, DataFeedLog, Incident } from '../../types/rescue';

function TriagePageInner() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('id');
  const [incidentId, setIncidentId] = useState(requestedId ?? 'INC-1024');
  const [radiusKm, setRadiusKm] = useState(25);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [incidentTitle, setIncidentTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [victimCount, setVictimCount] = useState(0);
  const [waterRising, setWaterRising] = useState(true);

  const { data: allIncidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => apiGet<Incident[]>('/api/incidents'),
  });

  useEffect(() => {
    if (requestedId) setIncidentId(requestedId);
    else if (allIncidents[0] && incidentId === 'INC-1024' && !allIncidents.some((i) => i.id === 'INC-1024')) {
      setIncidentId(allIncidents[0].id);
    }
  }, [requestedId, allIncidents, incidentId]);

  const { data: detail } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => apiGet<{ incident: Incident; logs: DataFeedLog[] }>(`/api/incidents/${incidentId}`),
    enabled: Boolean(incidentId),
  });
  const { data: agencies = [] } = useQuery({
    queryKey: ['matches', incidentId, radiusKm],
    queryFn: () => apiGet<AgencyMatch[]>(`/api/incidents/${incidentId}/matches?radiusKm=${radiusKm}`),
    enabled: Boolean(incidentId),
  });

  const incident = detail?.incident;
  const logs = detail?.logs ?? [];

  useEffect(() => {
    if (!incident) return;
    setIncidentTitle(incident.title);
    setLocationText(incident.location);
    setVictimCount(incident.casualtiesEst);
    setWaterRising(incident.waterLevelRising);
  }, [incident]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const assignAgency = useMutation({
    mutationFn: (agency: AgencyMatch) => apiPost(`/api/incidents/${incidentId}/assign`, { agencyId: agency.id }),
    onSuccess: (_data, agency) => {
      void qc.invalidateQueries({ queryKey: ['matches'] });
      void qc.invalidateQueries({ queryKey: ['incident'] });
      void qc.invalidateQueries({ queryKey: ['incidents'] });
      showToast(`SUCCESS: ${agency.name} assigned to ${incidentId}! Dispatch orders transmitted.`);
    },
  });

  const saveDetails = useMutation({
    mutationFn: () =>
      apiPatch(`/api/incidents/${incidentId}`, {
        title: incidentTitle,
        location: locationText,
        casualtiesEst: victimCount,
        waterLevelRising: waterRising,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['incident', incidentId] });
      showToast(`Incident ${incidentId} details saved.`);
    },
  });

  const score = incident?.priorityScore ?? 0;

  return (
    <div className="bg-[#f5f0e8] text-[#1a1a1a] font-body min-h-screen flex flex-col">
      <MeshStatusBanner />
      <Navigation
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-grow flex flex-col lg:ml-64 w-full relative pb-20 md:pb-8">
        {toastMessage && (
          <div className="bg-[#ffcc00] text-[#1a1a1a] px-6 py-3 border-b-4 border-[#1a1a1a] font-headline font-black uppercase text-xs flex justify-between items-center z-30 animate-pulse">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="font-bold">
              ✕
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f5f0e8]">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-[#1a1a1a] pb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#1a1a1a] text-white px-2.5 py-1 font-headline text-xs font-black uppercase brutal-border">
                  {incident?.id ?? incidentId}
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
                    {incidentTitle || incident?.title || 'Loading incident'}
                  </h2>
                  <p className="text-sm md:text-lg font-headline font-bold mt-2 flex items-center gap-2 text-[#4a4a4a]">
                    <span className="material-symbols-outlined text-xl">location_on</span> {locationText || incident?.location}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isEditing) saveDetails.mutate();
                  setIsEditing(!isEditing);
                }}
                className="neo-button bg-[#eee9e0] text-[#1a1a1a] px-5 py-2.5 flex items-center gap-2 text-xs"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                {isEditing ? 'SAVE DETAILS' : 'EDIT DETAILS'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#eee9e0] brutal-border p-6 relative overflow-hidden brutal-shadow">
                <h3 className="font-headline font-black uppercase text-lg mb-4 flex items-center gap-2 border-b-2 border-[#1a1a1a] pb-2 text-[#1a1a1a]">
                  <span className="material-symbols-outlined text-xl">smart_toy</span> AI Priority Score
                </h3>
                <div className="flex justify-center items-center py-4">
                  <div className="relative w-44 h-44 flex justify-center items-center rounded-full border-8 border-[#1a1a1a] bg-[#f5f0e8] brutal-shadow">
                    <div className="text-center z-10">
                      <span className="block text-5xl font-headline font-black text-[#e63b2e]">{score}</span>
                      <span className="block text-[10px] font-headline font-black uppercase tracking-wider text-[#4a4a4a] mt-0.5">
                        out of 100
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 mt-2">
                  <div className="flex justify-between items-center bg-[#f5f0e8] p-2.5 brutal-border">
                    <span className="font-headline text-xs font-bold uppercase text-[#4a4a4a]">Victim Count</span>
                    <span className="font-headline font-black text-base text-[#1a1a1a]">{victimCount}+ Est.</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#f5f0e8] p-2.5 brutal-border">
                    <span className="font-headline text-xs font-bold uppercase text-[#4a4a4a]">Water Level Rising</span>
                    <button
                      onClick={() => {
                        const next = !waterRising;
                        setWaterRising(next);
                        apiPatch(`/api/incidents/${incidentId}`, { waterLevelRising: next }).then(() =>
                          qc.invalidateQueries({ queryKey: ['incident', incidentId] })
                        );
                      }}
                      className={`font-headline font-black text-xs px-2 py-0.5 brutal-border ${
                        waterRising ? 'bg-[#e63b2e] text-white' : 'bg-[#00cc00] text-white'
                      }`}
                    >
                      {waterRising ? 'YES (CRITICAL)' : 'STABLE'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-[#f5f0e8] p-2.5 brutal-border">
                    <span className="font-headline text-xs font-bold uppercase text-[#4a4a4a]">Structural Risk</span>
                    <span className="font-headline font-black text-base text-[#e63b2e]">
                      {incident?.structuralRisk ?? 'HIGH'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] text-white p-6 brutal-shadow-lg relative">
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#ffcc00] border-l-4 border-b-4 border-[#1a1a1a]"></div>
                <h3 className="font-headline font-black uppercase text-base mb-3 border-b-2 border-white/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span> Sensor & Drone Telemetry
                </h3>
                <p className="font-body text-xs leading-relaxed mb-4 text-[#eee9e0]">
                  {incident?.description}
                </p>
                <div className="space-y-2 font-mono text-[11px] bg-[#2a2a2a] p-3 border-l-4 border-[#e63b2e]">
                  {logs.map((log) => (
                    <div key={log.id} className="border-b border-white/10 pb-1 last:border-0">
                      <span className="text-[#ffcc00]">[{log.timestamp}]</span> {log.logText}
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
                    {agencies.length} Optimal Targets
                  </span>
                </div>

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
                        <h4 className="font-headline font-black text-xl uppercase text-[#1a1a1a] mb-1">{agency.name}</h4>
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
                        <button disabled className="neo-button bg-[#00cc00] text-white px-6 py-3 w-full sm:w-auto text-xs">
                          ✓ ASSIGNED
                        </button>
                      ) : (
                        <button
                          onClick={() => assignAgency.mutate(agency)}
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
                    onClick={() => {
                      setRadiusKm((r) => r + 25);
                      showToast(`Search radius expanded to ${radiusKm + 25} km.`);
                    }}
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

      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onAddIncident={async (inc: CreateIncidentInput) => {
          const created = await apiPost<Incident>('/api/incidents', inc);
          showToast(`New Incident Registered: ${created.id}`);
          void qc.invalidateQueries({ queryKey: ['incidents'] });
        }}
      />
      <SosAlertModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSos={(cat) => {
          apiPost('/api/sos', {
            type: mapSosCategory(cat),
            location: { ...ALAPPUZHA, address: 'Kerala Command Grid' },
            accuracyMeters: 10,
          }).then(() => showToast(`GLOBAL SOS BROADCAST: ${cat}`));
        }}
      />
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense fallback={<div className="p-8 font-headline font-black uppercase">Loading triage...</div>}>
      <TriagePageInner />
    </Suspense>
  );
}
