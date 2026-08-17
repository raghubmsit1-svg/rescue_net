'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../../components/Navigation';
import { MeshStatusBanner } from '../../components/MeshStatusBanner';
import { apiGet, apiPost } from '../../lib/api/client';
import { MeshNode, MeshPacket } from '../../types/rescue';

export default function MeshNetworkPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const { data: nodes = [] } = useQuery({
    queryKey: ['mesh-nodes'],
    queryFn: () => apiGet<MeshNode[]>('/api/mesh/nodes'),
  });
  const { data: recentPackets = [] } = useQuery({
    queryKey: ['mesh-packets'],
    queryFn: () => apiGet<MeshPacket[]>('/api/mesh/packets'),
  });

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? nodes[0];
  const activeNodesCount = nodes.filter((n) => n.status === 'Active').length;
  const syncedCount = nodes.reduce((sum, n) => sum + n.packetsRelayed, 0);
  const avgRssi = nodes.length ? Math.round(nodes.reduce((s, n) => s + n.rssi, 0) / nodes.length) : 0;

  const broadcast = useMutation({
    mutationFn: (payload: string) => apiPost<MeshPacket>('/api/mesh/broadcast', { payload }),
    onSuccess: () => {
      setBroadcastMessage('');
      void qc.invalidateQueries({ queryKey: ['mesh-packets'] });
      void qc.invalidateQueries({ queryKey: ['mesh-nodes'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const pingNode = useMutation({
    mutationFn: (id: string) => apiPost(`/api/mesh/nodes/${id}/ping`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mesh-nodes'] });
    },
  });

  return (
    <div className="bg-[#f5f0e8] text-[#1a1a1a] font-body min-h-screen flex flex-col">
      <MeshStatusBanner />
      <Navigation />

      <div className="flex-grow flex flex-col lg:ml-64 w-full p-4 md:p-8 pb-20 md:pb-8">
        <div className="mb-6 border-b-4 border-[#1a1a1a] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="bg-[#ffcc00] text-[#1a1a1a] font-headline font-black text-xs px-2.5 py-1 border-2 border-[#1a1a1a] uppercase tracking-wider">
              Offline P2P Mesh Architecture
            </span>
            <h1 className="text-3xl md:text-5xl font-headline font-black uppercase text-[#1a1a1a] tracking-tight mt-2">
              RescueMesh Peer Network
            </h1>
            <p className="text-sm font-headline font-bold text-[#4a4a4a] uppercase tracking-widest mt-1">
              Zero-Infrastructure Emergency LoRa &amp; BLE Relay Protocol
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="brutal-border bg-[#1a1a1a] text-white p-5 brutal-shadow">
            <p className="text-xs font-headline font-bold uppercase text-[#ffcc00]">Active Peer Nodes</p>
            <p className="text-4xl font-headline font-black mt-2 text-white">
              {activeNodesCount} / {nodes.length}
            </p>
            <p className="text-[11px] text-gray-300 font-mono mt-1">LoRa + BLE + Satellite</p>
          </div>
          <div className="brutal-border bg-[#eee9e0] p-5 brutal-shadow">
            <p className="text-xs font-headline font-bold uppercase text-[#4a4a4a]">Packets Relayed</p>
            <p className="text-4xl font-headline font-black mt-2 text-[#1a1a1a]">{syncedCount}</p>
            <p className="text-[11px] text-[#0055ff] font-mono font-bold mt-1">Live mesh counters</p>
          </div>
          <div className="brutal-border bg-[#ffcc00] p-5 brutal-shadow">
            <p className="text-xs font-headline font-bold uppercase text-[#1a1a1a]">Avg Signal Strength</p>
            <p className="text-4xl font-headline font-black mt-2 text-[#1a1a1a]">{avgRssi} dBm</p>
            <p className="text-[11px] text-[#1a1a1a] font-mono font-bold mt-1">NETWORK RSSI</p>
          </div>
          <div className="brutal-border bg-[#0055ff] text-white p-5 brutal-shadow">
            <p className="text-xs font-headline font-bold uppercase text-[#ffcc00]">Registered Nodes</p>
            <p className="text-4xl font-headline font-black mt-2">{nodes.length}</p>
            <p className="text-[11px] text-white font-mono mt-1">Postgres mesh registry</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 brutal-border bg-[#eee9e0] p-5 brutal-shadow">
            <div className="flex justify-between items-center border-b-3 border-[#1a1a1a] pb-3 mb-4">
              <h3 className="font-headline font-black text-lg uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055ff]">router</span>
                Network Node Topology
              </h3>
              <span className="text-xs font-headline font-bold bg-[#1a1a1a] text-white px-2 py-0.5">
                {nodes.length} Registered
              </span>
            </div>
            <div className="space-y-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedId(node.id)}
                  className={`brutal-border p-4 cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? 'bg-[#ffcc00] text-[#1a1a1a] brutal-shadow translate-x-1'
                      : 'bg-[#f5f0e8] hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-[#1a1a1a] text-white px-1.5 py-0.5">
                        {node.type}
                      </span>
                      <h4 className="font-headline font-black text-base uppercase mt-1">{node.name}</h4>
                      <p className="text-xs text-[#4a4a4a] font-mono">ID: {node.id}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-headline font-black uppercase px-2 py-0.5 brutal-border ${
                          node.status === 'Active'
                            ? 'bg-[#00cc00] text-white'
                            : node.status === 'Degraded'
                            ? 'bg-[#ffcc00] text-[#1a1a1a]'
                            : 'bg-[#e63b2e] text-white'
                        }`}
                      >
                        {node.status}
                      </span>
                      <p className="text-xs font-mono font-bold mt-1 text-[#4a4a4a]">Bat: {node.batteryLevel}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#1a1a1a]/20 text-[11px] font-mono font-bold text-[#4a4a4a]">
                    <div>
                      RSSI: <span className="text-[#1a1a1a]">{node.rssi} dBm</span>
                    </div>
                    <div>
                      Peers: <span className="text-[#1a1a1a]">{node.connectedPeers}</span>
                    </div>
                    <div>
                      Pkts: <span className="text-[#1a1a1a]">{node.packetsRelayed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6">
            {selectedNode && (
              <div className="brutal-border bg-[#1a1a1a] text-white p-5 brutal-shadow">
                <div className="flex justify-between items-start border-b-2 border-white/20 pb-3 mb-4">
                  <div>
                    <span className="text-xs font-headline font-bold text-[#ffcc00] uppercase">Selected Node Details</span>
                    <h3 className="text-xl font-headline font-black uppercase text-white mt-0.5">{selectedNode.name}</h3>
                  </div>
                  <span className="material-symbols-outlined text-[#ffcc00] text-3xl">sensors</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono mb-4">
                  <div className="bg-white/10 p-3 brutal-border border-white/30">
                    <p className="text-gray-400">HARDWARE TYPE</p>
                    <p className="font-bold text-white text-sm mt-1">{selectedNode.type}</p>
                  </div>
                  <div className="bg-white/10 p-3 brutal-border border-white/30">
                    <p className="text-gray-400">BATTERY POWER</p>
                    <p className="font-bold text-[#ffcc00] text-sm mt-1">{selectedNode.batteryLevel}%</p>
                  </div>
                  <div className="bg-white/10 p-3 brutal-border border-white/30">
                    <p className="text-gray-400">LAST HEARTBEAT</p>
                    <p className="font-bold text-white text-sm mt-1">{selectedNode.lastPing}</p>
                  </div>
                  <div className="bg-white/10 p-3 brutal-border border-white/30">
                    <p className="text-gray-400">GPS LATITUDE</p>
                    <p className="font-bold text-white text-sm mt-1">{selectedNode.coordinates.lat}</p>
                  </div>
                  <div className="bg-white/10 p-3 brutal-border border-white/30">
                    <p className="text-gray-400">GPS LONGITUDE</p>
                    <p className="font-bold text-white text-sm mt-1">{selectedNode.coordinates.lng}</p>
                  </div>
                  <div className="bg-white/10 p-3 brutal-border border-white/30">
                    <p className="text-gray-400">CONNECTED HOPS</p>
                    <p className="font-bold text-[#0055ff] text-sm mt-1">{selectedNode.connectedPeers} Nodes</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => pingNode.mutate(selectedNode.id)}
                    className="neo-button bg-[#ffcc00] text-[#1a1a1a] px-3 py-2 text-xs font-black uppercase flex-1"
                  >
                    Ping Node
                  </button>
                  <button
                    onClick={() => pingNode.mutate(selectedNode.id)}
                    className="neo-button bg-[#0055ff] text-white px-3 py-2 text-xs font-black uppercase flex-1"
                  >
                    Run Diagnostics
                  </button>
                </div>
              </div>
            )}

            <div className="brutal-border bg-[#eee9e0] p-5 brutal-shadow flex-grow">
              <h3 className="font-headline font-black text-lg uppercase border-b-3 border-[#1a1a1a] pb-3 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e63b2e]">podcasts</span>
                Broadcast P2P Emergency Packet
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!broadcastMessage.trim()) return;
                  broadcast.mutate(broadcastMessage);
                }}
                className="mb-5 space-y-3"
              >
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter high-priority mesh broadcast payload (e.g. Water rising in Sector 4, head to High Ground)..."
                  className="w-full bg-[#f5f0e8] brutal-border p-3 font-headline text-xs font-bold text-[#1a1a1a] focus:bg-white outline-none h-20 uppercase"
                />
                <button
                  type="submit"
                  className="w-full neo-button bg-[#e63b2e] text-white py-3 text-xs font-black uppercase flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  BROADCAST TO ALL MESH NODES
                </button>
              </form>
              <h4 className="font-headline font-black text-xs uppercase text-[#4a4a4a] mb-2 tracking-wider">
                Recent Relayed Packets (Live Stream)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentPackets.map((pkt) => (
                  <div key={pkt.id} className="bg-[#f5f0e8] brutal-border p-3 text-xs font-headline">
                    <div className="flex justify-between font-bold text-[11px] text-[#4a4a4a] mb-1">
                      <span className="text-[#0055ff] uppercase">{pkt.sender}</span>
                      <span>{pkt.time}</span>
                    </div>
                    <p className="font-bold text-[#1a1a1a] uppercase">{pkt.payload}</p>
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                      <span>ID: {pkt.id}</span>
                      <span>HOPS: {pkt.hops}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
