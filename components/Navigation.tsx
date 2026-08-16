'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationProps {
  onOpenNewIncident?: () => void;
  onOpenSosModal?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenNewIncident,
  onOpenSosModal,
  searchQuery = '',
  setSearchQuery
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [timeString, setTimeString] = useState<string>('');
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kolkata'
        }) + ' IST'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/', icon: 'dashboard' },
    { label: 'Victim SOS', href: '/sos', icon: 'emergency' },
    { label: 'Mesh Network', href: '/mesh', icon: 'hub' },
    { label: 'Worker Safety', href: '/field-ops', icon: 'security' },
    { label: 'AI Triage', href: '/triage', icon: 'biotech' },
  ];

  return (
    <>
      {/* Desktop SideNavBar */}
      <nav className="hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-[#eee9e0] border-r-4 border-[#1a1a1a] h-full w-64 z-50">
        {/* Header */}
        <div className="p-5 border-b-4 border-[#1a1a1a] flex items-center gap-3">
          <div className="w-11 h-11 brutal-border bg-[#ffcc00] flex items-center justify-center font-headline font-black text-xl text-[#1a1a1a] brutal-shadow">
            HQ
          </div>
          <div>
            <h2 className="text-lg font-headline font-black uppercase text-[#1a1a1a] leading-none">
              HQ Alpha
            </h2>
            <p className="text-xs font-headline font-bold text-[#4a4a4a] uppercase tracking-wider mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#00cc00] rounded-full inline-block animate-pulse"></span>
              System Online
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="p-4 border-b-4 border-[#1a1a1a]">
          <button
            onClick={onOpenNewIncident}
            className="w-full bg-[#e63b2e] text-white font-headline font-bold uppercase tracking-tight py-3 px-4 brutal-border brutal-shadow hover:bg-[#1a1a1a] hover:text-white transition-colors duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            NEW INCIDENT
          </button>
        </div>

        {/* Navigation Links */}
        <ul className="flex-grow flex flex-col py-3 font-headline font-bold uppercase text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="px-2 my-1">
                <Link
                  href={link.href}
                  className={`p-3.5 flex items-center gap-3 brutal-border brutal-border-sm transition-all ${
                    isActive
                      ? 'bg-[#0055ff] text-white brutal-shadow'
                      : 'bg-transparent text-[#1a1a1a] hover:bg-[#ffcc00] hover:skew-x-1'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer Info & Clock */}
        <div className="border-t-4 border-[#1a1a1a] mt-auto flex flex-col font-headline font-bold uppercase text-xs p-4 bg-[#e8e3da]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#4a4a4a]">SYS TIME:</span>
            <span className="text-[#1a1a1a] font-black text-sm">{timeString || '14:42:09 IST'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('RescueNet v2.4 (Kerala Floods 2026 Emergency Deployment). Contact Central Dispatch for sysops assistance.')}
              className="flex-1 brutal-border p-2 bg-[#f5f0e8] hover:bg-[#ffcc00] flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">help</span> Support
            </button>
            <button
              onClick={() => alert('Archive mode: 1,420 resolved incident logs synced to cloud storage.')}
              className="flex-1 brutal-border p-2 bg-[#f5f0e8] hover:bg-[#ffcc00] flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">history</span> Archive
            </button>
          </div>
        </div>
      </nav>

      {/* Top Header Bar */}
      <header className="flex justify-between items-center w-full px-4 md:px-6 py-3 h-20 bg-[#f5f0e8] border-b-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] z-40 sticky top-0">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden brutal-border p-2 bg-[#eee9e0] hover:bg-[#ffcc00]"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 brutal-border bg-[#e63b2e] flex items-center justify-center text-white font-headline font-black text-sm">
              RN
            </div>
            <span className="text-xl md:text-2xl font-headline font-black text-[#1a1a1a] uppercase tracking-tight">
              RescueNet
            </span>
          </Link>

          {/* Desktop Links Header Bar */}
          <nav className="hidden md:flex gap-3 font-headline font-bold uppercase text-xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 brutal-border transition-colors ${
                    isActive
                      ? 'bg-[#ffcc00] text-[#1a1a1a] brutal-shadow'
                      : 'bg-[#f5f0e8] text-[#4a4a4a] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="hidden sm:flex items-center brutal-border bg-[#eee9e0] px-3 py-1.5 gap-2 focus-within:bg-[#ffcc00] focus-within:shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] transition-all">
            <span className="material-symbols-outlined text-[#1a1a1a] text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Search ID, Sector, Location..."
              className="bg-transparent border-none outline-none focus:ring-0 text-xs font-headline uppercase font-bold text-[#1a1a1a] w-36 md:w-52 placeholder-[#4a4a4a]"
            />
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationsMenu(!showNotificationsMenu);
                if (unreadNotifications > 0) setUnreadNotifications(0);
              }}
              className="w-10 h-10 brutal-border bg-[#eee9e0] flex items-center justify-center hover:bg-[#1a1a1a] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all relative cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#e63b2e] text-white font-headline text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center brutal-border">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotificationsMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-[#f5f0e8] brutal-border brutal-shadow-lg p-4 z-50 font-headline">
                <div className="flex justify-between items-center border-b-2 border-[#1a1a1a] pb-2 mb-3">
                  <h4 className="font-black text-sm uppercase">Emergency Alerts</h4>
                  <span className="bg-[#e63b2e] text-white text-[10px] px-2 py-0.5 font-bold uppercase">LIVE</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-[#ffcc00] brutal-border">
                    <p className="font-bold uppercase">Airlift Unit Dispatched</p>
                    <p className="text-[11px] font-body text-[#1a1a1a]">Wayanad Sector 7 • 2m ago</p>
                  </div>
                  <div className="p-2 bg-[#eee9e0] brutal-border">
                    <p className="font-bold uppercase">Water Level Spike Detected</p>
                    <p className="text-[11px] font-body text-[#4a4a4a]">Alappuzha Sector 4 • 10m ago</p>
                  </div>
                  <div className="p-2 bg-[#eee9e0] brutal-border">
                    <p className="font-bold uppercase">New Victim SOS Received</p>
                    <p className="text-[11px] font-body text-[#4a4a4a]">GPS Lat: 9.4981 Lng: 76.3388 • 15m ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SOS Alert Trigger */}
          <button
            onClick={onOpenSosModal}
            className="bg-[#e63b2e] text-white font-headline font-black uppercase tracking-tight text-xs md:text-sm px-3 md:px-5 py-2 brutal-border brutal-shadow hover:bg-[#1a1a1a] transition-colors duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <span>SOS ALERT</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 flex flex-col" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-[#f5f0e8] w-72 h-full brutal-border border-r-4 p-5 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b-4 border-[#1a1a1a] pb-4 mb-4">
              <h2 className="text-xl font-headline font-black uppercase">RescueNet Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="brutal-border p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNewIncident && onOpenNewIncident();
              }}
              className="bg-[#e63b2e] text-white font-headline font-bold uppercase py-3 px-4 brutal-border brutal-shadow mb-6"
            >
              + NEW INCIDENT
            </button>
            <nav className="space-y-3 font-headline font-bold uppercase">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block p-3 brutal-border ${
                    pathname === link.href ? 'bg-[#0055ff] text-white' : 'bg-[#eee9e0] text-[#1a1a1a]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 z-40 flex justify-around items-stretch bg-[#f5f0e8] border-t-4 border-[#1a1a1a]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center font-headline font-black text-[10px] uppercase border-x border-[#1a1a1a]/20 ${
                isActive ? 'bg-[#ffcc00] text-[#1a1a1a]' : 'bg-[#f5f0e8] text-[#1a1a1a]'
              }`}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
