'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../components/Navigation';
import { MeshStatusBanner } from '../components/MeshStatusBanner';
import { InteractiveMap } from '../components/InteractiveMap';
import { NewIncidentModal } from '../components/NewIncidentModal';
import { SosAlertModal } from '../components/SosAlertModal';
import { apiGet, apiPost } from '../lib/api/client';
import { ALAPPUZHA, mapSosCategory } from '../lib/geo';
import { CreateIncidentInput, Incident, OpsStats } from '../types/rescue';

export default function CommandCenterPage() {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', searchQuery],
    queryFn: () =>
      apiGet<Incident[]>(`/api/incidents${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`),
  });
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiGet<OpsStats>('/api/stats'),
  });

  const selectedIncident = incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const createIncident = useMutation({
    mutationFn: (input: CreateIncidentInput) => apiPost<Incident>('/api/incidents', input),
    onSuccess: (inc) => {
      void qc.invalidateQueries({ queryKey: ['incidents'] });
      showToast(`New Incident Broadcast: ${inc.id} - ${inc.title}`);
    },
  });

  const dispatchIncident = useMutation({
    mutationFn: (id: string) => apiPost<Incident>(`/api/incidents/${id}/dispatch`),
    onSuccess: (inc) => {
      void qc.invalidateQueries({ queryKey: ['incidents'] });
      showToast(`Unit Dispatched for ${inc.id} (${inc.title})`);
    },
  });

  const sendSos = useMutation({
    mutationFn: (cat: string) =>
      apiPost('/api/sos', {
        type: mapSosCategory(cat),
        location: { ...ALAPPUZHA, address: 'Kerala Command Grid' },
        accuracyMeters: 10,
      }),
    onSuccess: (_data, cat) => showToast(`GLOBAL SOS DISPATCHED: ${cat}`),
  });

  const totalRescues = stats?.totalRescues ?? 0;
  const deployedUnits = stats?.deployedUnits ?? 0;
  const criticalCount = stats?.criticalCount ?? incidents.filter((i) => i.priority === 'Crit-01').length;

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

        <main className="flex-grow p-4 md:p-8 overflow-y-auto bg-[#f5f0e8] bg-[radial-gradient(#d0cbc3_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-[#1a1a1a] pb-4 gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-headline font-black uppercase tracking-tighter text-[#1a1a1a] leading-none">
                Kerala Floods &apos;26
              </h1>
              <p className="text-sm md:text-lg font-headline font-bold text-[#e63b2e] uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-[#e63b2e] rounded-full animate-pulse inline-block"></span>
                Active Emergency State • Command Level Alpha
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl lg:text-3xl font-headline font-black uppercase text-[#1a1a1a]">LIVE IST</p>
              <p className="font-headline font-bold text-xs text-[#4a4a4a] uppercase tracking-wider">Sys_Time / HQ_Sync</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(140px,auto)]">
            <div className="md:col-span-3 brutal-border bg-[#1a1a1a] text-white p-6 flex flex-col justify-between brutal-shadow hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(255,204,0,1)] transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-headline font-bold uppercase text-[#d6d1c9] tracking-widest text-xs">Total Rescues</h3>
                <span className="material-symbols-outlined text-[#ffcc00] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  groups
                </span>
              </div>
              <div className="mt-4">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-headline font-black tracking-tighter">
                  {totalRescues.toLocaleString()}
                </span>
                <div className="mt-2 text-[#ffcc00] font-headline font-bold uppercase text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Resolved casualty total
                </div>
              </div>
            </div>

            <div className="md:col-span-3 brutal-border bg-[#eee9e0] p-6 flex flex-col justify-between brutal-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-headline font-bold uppercase text-[#4a4a4a] tracking-widest text-xs">Deployed Units</h3>
                <span className="material-symbols-outlined text-[#0055ff] text-2xl">local_shipping</span>
              </div>
              <div className="mt-4">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-headline font-black tracking-tighter text-[#1a1a1a]">
                  {deployedUnits}
                </span>
                <div className="mt-2 text-[#0055ff] font-headline font-bold uppercase text-xs flex items-center gap-1">
                  Field responders on task
                </div>
              </div>
            </div>

            <div className="md:col-span-6 brutal-border bg-[#e63b2e] text-white p-6 flex flex-col justify-between brutal-shadow pulse-red">
              <div className="flex justify-between items-start">
                <h3 className="font-headline font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Critical Incidents
                </h3>
                <div className="bg-[#1a1a1a] text-[#ffcc00] px-3 py-1 text-xs font-black uppercase tracking-widest">
                  Priority 0
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-4">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-headline font-black tracking-tighter leading-none">
                  {criticalCount}
                </span>
                <div className="flex-grow flex flex-col gap-2 mb-1 text-xs font-bold uppercase">
                  {incidents
                    .filter((i) => i.priority === 'Crit-01' && i.status !== 'Resolved')
                    .slice(0, 2)
                    .map((i) => (
                      <div key={i.id} className="flex justify-between border-b-2 border-white/30 pb-1">
                        <span>{i.title}</span>
                        <span className="text-[#ffcc00] font-black">{i.id}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 md:row-span-3 flex flex-col">
              <InteractiveMap
                incidents={incidents}
                selectedIncidentId={selectedIncident?.id}
                onSelectIncident={(inc) => setSelectedId(inc.id)}
                title="Kerala Operations Live Map"
                heightClass="min-h-[460px]"
              />
            </div>

            <div className="md:col-span-4 md:row-span-3 brutal-border bg-[#eee9e0] p-5 brutal-shadow flex flex-col h-full">
              <div className="flex justify-between items-end border-b-4 border-[#1a1a1a] pb-3 mb-4">
                <div>
                  <h2 className="text-xl font-headline font-black uppercase text-[#1a1a1a]">Priority Queue</h2>
                  <p className="text-[10px] font-headline font-bold text-[#4a4a4a]">DISPATCH ACTION CENTER</p>
                </div>
                <span className="bg-[#1a1a1a] text-[#ffcc00] px-2.5 py-1 text-[11px] font-black uppercase brutal-border">
                  Live ({incidents.length})
                </span>
              </div>

              <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-1 max-h-[500px]">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedId(inc.id)}
                    className={`brutal-border p-4 transition-all cursor-pointer ${
                      selectedIncident?.id === inc.id
                        ? 'bg-[#ffcc00] text-[#1a1a1a] brutal-shadow-lg translate-x-1'
                        : 'bg-[#f5f0e8] hover:bg-[#faf7f2]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-headline font-black uppercase px-2 py-0.5 brutal-border ${
                          inc.priority === 'Crit-01'
                            ? 'bg-[#e63b2e] text-white'
                            : inc.priority === 'High-04'
                            ? 'bg-[#1a1a1a] text-white'
                            : 'bg-[#0055ff] text-white'
                        }`}
                      >
                        {inc.priority}
                      </span>
                      <span className="font-headline font-bold text-[10px] uppercase text-[#4a4a4a]">{inc.timeAgo}</span>
                    </div>

                    <h4 className="font-headline font-bold text-base leading-snug mb-1.5 uppercase text-[#1a1a1a]">
                      {inc.title}
                    </h4>
                    <p className="font-body text-xs text-[#4a4a4a] mb-3 line-clamp-2">{inc.description}</p>

                    <div className="flex gap-2">
                      {inc.status === 'Pending' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatchIncident.mutate(inc.id);
                          }}
                          className="flex-1 bg-[#1a1a1a] text-white text-xs font-headline font-black uppercase py-2 brutal-border hover:bg-[#e63b2e] cursor-pointer"
                        >
                          Dispatch
                        </button>
                      ) : (
                        <button disabled className="flex-1 bg-[#00cc00] text-white text-xs font-headline font-black uppercase py-2 brutal-border">
                          ✓ {inc.status}
                        </button>
                      )}
                      <Link
                        href={`/triage?id=${inc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-[#eee9e0] text-[#1a1a1a] text-xs font-headline font-black uppercase py-2 brutal-border text-center hover:bg-[#ffcc00]"
                      >
                        AI Triage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onAddIncident={async (inc) => {
          await createIncident.mutateAsync(inc);
        }}
      />
      <SosAlertModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSos={(cat) => sendSos.mutate(cat)}
      />
    </div>
  );
}
