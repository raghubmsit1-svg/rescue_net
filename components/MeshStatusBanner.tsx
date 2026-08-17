'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiGet } from '../lib/api/client';
import type { OpsStats } from '../types/rescue';

export function MeshStatusBanner() {
  const { status } = useSession();
  const qc = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiGet<OpsStats>('/api/stats'),
    enabled: status === 'authenticated',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const active = (stats?.activeMeshNodes ?? 0) > 0;
  const nodes = stats?.meshNodeCount ?? 0;
  const packets = stats?.packetsRelayed ?? 0;
  const rssi = stats?.avgRssi ?? -64;

  const triggerManualSync = async () => {
    setIsSyncing(true);
    await qc.invalidateQueries({ queryKey: ['stats'] });
    await qc.invalidateQueries({ queryKey: ['mesh-nodes'] });
    await qc.invalidateQueries({ queryKey: ['mesh-packets'] });
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="bg-[#1a1a1a] text-[#f5f0e8] border-b-3 border-[#1a1a1a] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold tracking-wider z-50">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 bg-[#ffcc00] text-[#1a1a1a] px-2 py-0.5 border-2 border-[#1a1a1a] font-black uppercase text-[11px]">
          <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#0055ff] animate-ping' : 'bg-[#e63b2e]'}`}></span>
          {active ? 'RESCUEMESH P2P: ACTIVE' : 'RESCUEMESH: DEGRADED'}
        </span>
        <span className="hidden sm:inline text-gray-300">
          NODES: <strong className="text-[#ffcc00]">{stats?.activeMeshNodes ?? 0}/{nodes} PEERS</strong> | LORA CH: 04 | RSSI: {rssi}dBm
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="hidden md:inline text-gray-400">
          QUEUE: <span className="text-white font-bold">{packets} PKTS SYNCED</span>
        </span>

        <button
          onClick={() => void triggerManualSync()}
          disabled={isSyncing}
          className="neo-button bg-[#ffcc00] text-[#1a1a1a] px-2.5 py-1 text-[11px] hover:bg-white flex items-center gap-1 active:translate-y-0.5"
        >
          <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          {isSyncing ? 'SYNCING...' : 'FORCE MESH SYNC'}
        </button>

        <Link
          href="/mesh"
          className="neo-button bg-[#0055ff] text-white px-2 py-1 text-[11px] hover:bg-[#1a1a1a] flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">hub</span>
          MESH NETWORK
        </Link>
      </div>
    </div>
  );
}
