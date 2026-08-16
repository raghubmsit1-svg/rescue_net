'use client';

import React, { useState } from 'react';
import { Incident } from '../types/rescue';

interface MapProps {
  incidents: Incident[];
  onSelectIncident?: (inc: Incident) => void;
  selectedIncidentId?: string;
  title?: string;
  heightClass?: string;
}

export const InteractiveMap: React.FC<MapProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId,
  title = "Kerala Operations Map",
  heightClass = "min-h-[420px]"
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<'radar' | 'heat' | 'drones'>('radar');
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);

  // Sector locations mapped to SVG coordinates
  const sectorPins = incidents.map((inc) => {
    // Relative mock layout coordinates on map grid
    let x = 50;
    let y = 50;

    if (inc.sector.includes('7') || inc.location.toLowerCase().includes('wayanad')) {
      x = 35;
      y = 25;
    } else if (inc.sector.includes('4') || inc.location.toLowerCase().includes('alappuzha')) {
      x = 55;
      y = 70;
    } else if (inc.location.toLowerCase().includes('munnar')) {
      x = 75;
      y = 40;
    } else if (inc.location.toLowerCase().includes('idukki') || inc.sector.includes('zone b')) {
      x = 68;
      y = 58;
    } else if (inc.sector.includes('2') || inc.location.toLowerCase().includes('kottayam')) {
      x = 48;
      y = 60;
    }

    return { ...inc, posX: x, posY: y };
  });

  return (
    <div className={`w-full ${heightClass} brutal-border bg-[#e8e3da] relative overflow-hidden flex flex-col brutal-shadow`}>
      {/* Top Map Header & Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        <div className="bg-[#1a1a1a] text-[#ffcc00] px-4 py-2 brutal-border font-headline font-black uppercase text-sm flex items-center gap-2 brutal-shadow">
          <span className="material-symbols-outlined text-lg">explore</span>
          <span>{title}</span>
        </div>

        {/* Layer Selectors */}
        <div className="flex bg-[#eee9e0] brutal-border font-headline text-xs font-bold uppercase">
          <button
            onClick={() => setActiveLayer('radar')}
            className={`px-3 py-1.5 transition-colors ${
              activeLayer === 'radar' ? 'bg-[#ffcc00] text-[#1a1a1a]' : 'hover:bg-[#f5f0e8]'
            }`}
          >
            Tactical
          </button>
          <button
            onClick={() => setActiveLayer('heat')}
            className={`px-3 py-1.5 transition-colors border-l-2 border-[#1a1a1a] ${
              activeLayer === 'heat' ? 'bg-[#e63b2e] text-white' : 'hover:bg-[#f5f0e8]'
            }`}
          >
            Flood Risk
          </button>
          <button
            onClick={() => setActiveLayer('drones')}
            className={`px-3 py-1.5 transition-colors border-l-2 border-[#1a1a1a] ${
              activeLayer === 'drones' ? 'bg-[#0055ff] text-white' : 'hover:bg-[#f5f0e8]'
            }`}
          >
            Drone Flights
          </button>
        </div>
      </div>

      {/* Right Map Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0))}
          className="w-10 h-10 bg-[#eee9e0] brutal-border brutal-shadow flex items-center justify-center hover:bg-[#ffcc00] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-headline font-black text-xl"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
          className="w-10 h-10 bg-[#eee9e0] brutal-border brutal-shadow flex items-center justify-center hover:bg-[#ffcc00] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-headline font-black text-xl"
        >
          -
        </button>
        <button
          onClick={() => setZoomLevel(1.0)}
          className="w-10 h-10 bg-[#eee9e0] brutal-border brutal-shadow flex items-center justify-center hover:bg-[#ffcc00] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-headline font-bold text-xs"
          title="Reset Zoom"
        >
          RST
        </button>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div
        className="w-full h-full relative overflow-hidden bg-[#f5f0e8] bg-[radial-gradient(#1a1a1a_1.5px,transparent_1.5px)] [background-size:24px_24px] flex-grow transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Topographic Sector Grid Lines */}
          <line x1="20" y1="0" x2="20" y2="100" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="1 1" />

          {/* Flooded Coastal Zone Polyline */}
          {activeLayer === 'heat' && (
            <polygon points="40,10 65,40 60,95 25,95 30,30" fill="#e63b2e" opacity="0.18" stroke="#e63b2e" strokeWidth="0.5" />
          )}

          {/* Drone Paths */}
          {activeLayer === 'drones' && (
            <>
              <path d="M 35 25 Q 45 45 55 70" fill="none" stroke="#0055ff" strokeWidth="0.8" strokeDasharray="2 2" />
              <path d="M 55 70 Q 65 60 75 40" fill="none" stroke="#0055ff" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx="45" cy="45" r="1.5" fill="#0055ff" className="animate-ping" />
            </>
          )}

          {/* Sector Boundary Box */}
          <rect x="25" y="20" width="55" height="60" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
        </svg>

        {/* Render Pins */}
        {sectorPins.map((pin) => {
          const isSelected = pin.id === selectedIncidentId;
          const isCritical = pin.priority === 'Crit-01';

          return (
            <div
              key={pin.id}
              onClick={() => onSelectIncident && onSelectIncident(pin)}
              onMouseEnter={() => setHoveredIncident(pin)}
              onMouseLeave={() => setHoveredIncident(null)}
              style={{ left: `${pin.posX}%`, top: `${pin.posY}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
            >
              {/* Pulse Outer Ring */}
              <div
                className={`w-9 h-9 absolute -top-1.5 -left-1.5 rounded-none border-2 animate-ping ${
                  isCritical ? 'border-[#e63b2e] bg-[#e63b2e]/20' : 'border-[#0055ff] bg-[#0055ff]/20'
                }`}
              />

              {/* Pin Marker */}
              <div
                className={`w-6 h-6 brutal-border flex items-center justify-center font-headline font-black text-[10px] brutal-shadow transition-transform group-hover:scale-125 ${
                  isSelected
                    ? 'bg-[#ffcc00] text-[#1a1a1a] scale-125'
                    : isCritical
                    ? 'bg-[#e63b2e] text-white'
                    : 'bg-[#0055ff] text-white'
                }`}
              >
                {pin.priority === 'Crit-01' ? 'P0' : 'P1'}
              </div>

              {/* Hover Badge */}
              <div className="hidden group-hover:block absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] text-white p-2 brutal-border text-[11px] font-headline w-44 z-40 brutal-shadow-lg">
                <p className="font-black uppercase text-[#ffcc00]">{pin.id}</p>
                <p className="font-bold truncate">{pin.title}</p>
                <p className="text-[10px] text-[#eee9e0] mt-0.5">{pin.sector} • Est. {pin.casualtiesEst} Victims</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Incident Drawer on Map */}
      {hoveredIncident && (
        <div className="absolute bottom-4 left-4 z-30 bg-[#f5f0e8] brutal-border p-3 brutal-shadow font-headline max-w-xs text-xs">
          <span className="bg-[#e63b2e] text-white px-1.5 py-0.5 font-black uppercase text-[10px]">
            {hoveredIncident.priority}
          </span>
          <p className="font-black uppercase text-sm mt-1">{hoveredIncident.title}</p>
          <p className="font-body text-[11px] text-[#4a4a4a]">{hoveredIncident.location}</p>
        </div>
      )}
    </div>
  );
};
