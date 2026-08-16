'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SosAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSos: (type: string) => void;
}

export const SosAlertModal: React.FC<SosAlertModalProps> = ({
  isOpen,
  onClose,
  onConfirmSos
}) => {
  const [sosCategory, setSosCategory] = useState<string>('General Emergency SOS');
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'broadcasting' | 'sent'>('idle');
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    let timer: any;
    if (dispatchStatus === 'broadcasting') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setDispatchStatus('sent');
        onConfirmSos(sosCategory);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e63b2e', '#ffcc00', '#0055ff']
        });
      }
    }
    return () => clearTimeout(timer);
  }, [dispatchStatus, countdown, sosCategory, onConfirmSos]);

  if (!isOpen) return null;

  const handleStartBroadcast = () => {
    setDispatchStatus('broadcasting');
    setCountdown(3);
  };

  const handleReset = () => {
    setDispatchStatus('idle');
    setCountdown(3);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleReset}>
      <div
        className="bg-[#f5f0e8] w-full max-w-lg brutal-border brutal-shadow-lg p-6 font-headline relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#e63b2e] text-white p-4 brutal-border flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">GLOBAL SOS ALERT</h2>
              <p className="text-xs font-bold text-[#ffcc00] uppercase">High Priority Dispatch Center</p>
            </div>
          </div>
          <button onClick={handleReset} className="brutal-border p-1 bg-white text-[#1a1a1a] font-black text-sm">
            ✕
          </button>
        </div>

        {dispatchStatus === 'idle' && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase text-[#4a4a4a]">
              Select Emergency Category for Priority Dispatch & Geo-Targeting:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase">
              {[
                { label: 'General Emergency SOS', icon: 'sos', color: 'bg-[#e63b2e] text-white' },
                { label: 'Immediate Evacuation', icon: 'sailing', color: 'bg-[#ffcc00] text-[#1a1a1a]' },
                { label: 'Medical Rescue', icon: 'medical_services', color: 'bg-[#0055ff] text-white' },
                { label: 'Structural Hazard', icon: 'local_fire_department', color: 'bg-[#1a1a1a] text-white' },
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setSosCategory(cat.label)}
                  className={`p-4 brutal-border text-center flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    sosCategory === cat.label
                      ? `${cat.color} brutal-shadow scale-105`
                      : 'bg-[#eee9e0] text-[#1a1a1a] hover:bg-[#e8e3da]'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-[#eee9e0] brutal-border text-xs">
              <p className="font-bold uppercase text-[#1a1a1a]">Target Coordinates:</p>
              <p className="font-mono text-[#4a4a4a] text-[11px]">LAT: 9.4981° N | LNG: 76.3388° E (Kerala Command Grid)</p>
            </div>

            <button
              onClick={handleStartBroadcast}
              className="w-full bg-[#e63b2e] text-white font-headline font-black text-lg uppercase py-4 brutal-border brutal-shadow hover:bg-[#1a1a1a] cursor-pointer"
            >
              TRIGGER BROADCAST (3S HOLD)
            </button>
          </div>
        )}

        {dispatchStatus === 'broadcasting' && (
          <div className="py-8 text-center space-y-4">
            <p className="text-sm font-bold uppercase text-[#e63b2e] animate-pulse">
              Broadcasting Distress Signal to All Regional Agencies...
            </p>
            <div className="w-24 h-24 rounded-full bg-[#e63b2e] text-white font-black text-5xl flex items-center justify-center mx-auto brutal-border brutal-shadow animate-ping">
              {countdown}
            </div>
            <button
              onClick={() => setDispatchStatus('idle')}
              className="bg-[#1a1a1a] text-white text-xs font-bold uppercase py-2 px-6 brutal-border mt-4"
            >
              ABORT SIGNAL
            </button>
          </div>
        )}

        {dispatchStatus === 'sent' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#00cc00] text-white rounded-full flex items-center justify-center mx-auto brutal-border brutal-shadow text-3xl font-black">
              ✓
            </div>
            <h3 className="text-2xl font-black uppercase text-[#1a1a1a]">DISPATCH CONFIRMED</h3>
            <p className="text-xs font-bold uppercase text-[#4a4a4a]">
              Emergency broadcast sent for &quot;{sosCategory}&quot;. Delta Rescue Squad and Regional Field Ops notified.
            </p>
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1a] text-white font-black text-sm uppercase py-3 brutal-border brutal-shadow"
            >
              CLOSE & RETURN TO DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
