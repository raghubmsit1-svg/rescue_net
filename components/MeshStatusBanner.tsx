'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function MeshStatusBanner() {
  const [isMeshActive, setIsMeshActive] = useState(true);
  const [syncedPackets, setSyncedPackets] = useState(1482);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedPackets((prev) => prev + 7);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="bg-[#1a1a1a] text-[#f5f0e8] border-b-3 border-[#1a1a1a] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold tracking-wider z-50">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 bg-[#ffcc00] text-[#1a1a1a] px-2 py-0.5 border-2 border-[#1a1a1a] font-black uppercase text-[11px]">
          <span className={`w-2 h-2 rounded-full ${isMeshActive ? 'bg-[#0055ff] animate-ping' : 'bg-[#e63b2e]'}`}></span>
          {isMeshActive ? 'RESCUEMESH P2P: ACTIVE' : 'RESCUEMESH: OFFLINE MODE'}
        </span>
        <span className="hidden sm:inline text-gray-300">
          NODES: <strong className="text-[#ffcc00]">18 PEERS</strong> | LORA CH: 04 | RSSI: -64dBm
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="hidden md:inline text-gray-400">
          QUEUE: <span className="text-white font-bold">{syncedPackets} PKTS SYNCED</span>
        </span>

        <button
          onClick={triggerManualSync}
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

        <button
          onClick={() => setIsMeshActive(!isMeshActive)}
          className={`neo-button text-white px-2 py-1 text-[11px] ${
            isMeshActive ? 'bg-[#e63b2e]' : 'bg-[#2e7d32]'
          }`}
          title="Toggle mesh connection simulation"
        >
          {isMeshActive ? 'OFFLINE SIM' : 'GO ONLINE'}
        </button>
      </div>
    </div>
  );
}
