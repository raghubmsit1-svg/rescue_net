'use client';

import React, { useState } from 'react';
import { PriorityLevel, CreateIncidentInput } from '../types/rescue';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncident: (inc: CreateIncidentInput) => void | Promise<void>;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onAddIncident
}) => {
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('Sector 4 (Alappuzha)');
  const [location, setLocation] = useState('Alappuzha Waterway Block 3');
  const [priority, setPriority] = useState<PriorityLevel>('Crit-01');
  const [description, setDescription] = useState('');
  const [casualties, setCasualties] = useState<number>(10);
  const [waterRising, setWaterRising] = useState<boolean>(true);
  const [structuralRisk, setStructuralRisk] = useState<'Low' | 'Medium' | 'High' | 'Extreme'>('High');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddIncident({
      title,
      location,
      sector,
      priority,
      description,
      casualtiesEst: Number(casualties),
      waterLevelRising: waterRising,
      structuralRisk,
    });
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#f5f0e8] w-full max-w-xl brutal-border brutal-shadow-lg p-6 font-headline relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-[#1a1a1a] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e63b2e] text-white flex items-center justify-center brutal-border font-black">
              !
            </div>
            <h2 className="text-2xl font-black uppercase text-[#1a1a1a]">Register New Incident</h2>
          </div>
          <button
            onClick={onClose}
            className="brutal-border p-1 hover:bg-[#ffcc00] font-black text-lg w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase">
          <div>
            <label className="block text-[#4a4a4a] mb-1">Incident Title / Summary *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood Evacuation at Boat Jetty"
              className="w-full bg-[#eee9e0] brutal-border p-3 outline-none focus:bg-[#ffcc00] font-headline text-sm font-bold text-[#1a1a1a]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#4a4a4a] mb-1">Sector *</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-[#eee9e0] brutal-border p-3 outline-none focus:bg-[#ffcc00] font-headline font-bold"
              >
                <option value="Sector 4 (Alappuzha)">Sector 4 (Alappuzha)</option>
                <option value="Sector 7 (Wayanad)">Sector 7 (Wayanad)</option>
                <option value="Pass 3 (Munnar)">Pass 3 (Munnar)</option>
                <option value="Zone B (Idukki)">Zone B (Idukki)</option>
                <option value="Sector 2 (Kottayam)">Sector 2 (Kottayam)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#4a4a4a] mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#eee9e0] brutal-border p-3 outline-none focus:bg-[#ffcc00] font-headline font-bold text-[#e63b2e]"
              >
                <option value="Crit-01">CRIT-01 (Priority 0 - Immediate Airlift/Rescue)</option>
                <option value="High-04">HIGH-04 (Priority 1 - Urgent Relief Drop)</option>
                <option value="Med-12">MED-12 (Priority 2 - Support & Comms)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#4a4a4a] mb-1">Exact Location / Landmarks *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#eee9e0] brutal-border p-3 outline-none focus:bg-[#ffcc00] font-headline text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#4a4a4a] mb-1">Casualties Est.</label>
              <input
                type="number"
                min="0"
                value={casualties}
                onChange={(e) => setCasualties(Number(e.target.value))}
                className="w-full bg-[#eee9e0] brutal-border p-2.5 outline-none font-headline font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-[#4a4a4a] mb-1">Water Rising?</label>
              <select
                value={waterRising ? 'yes' : 'no'}
                onChange={(e) => setWaterRising(e.target.value === 'yes')}
                className="w-full bg-[#eee9e0] brutal-border p-2.5 outline-none font-headline font-bold text-center"
              >
                <option value="yes">YES (Rising)</option>
                <option value="no">NO (Stable)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#4a4a4a] mb-1">Structural Risk</label>
              <select
                value={structuralRisk}
                onChange={(e) => setStructuralRisk(e.target.value as any)}
                className="w-full bg-[#eee9e0] brutal-border p-2.5 outline-none font-headline font-bold text-center"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#4a4a4a] mb-1">Situation Description & Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe access routes, trapped victims, or special medical needs..."
              className="w-full bg-[#eee9e0] brutal-border p-3 outline-none focus:bg-[#ffcc00] font-body text-xs font-normal normal-case"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#eee9e0] text-[#1a1a1a] p-3 brutal-border brutal-shadow font-black hover:bg-[#e8e3da]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#e63b2e] text-white p-3 brutal-border brutal-shadow font-black hover:bg-[#1a1a1a]"
            >
              BROADCAST INCIDENT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
