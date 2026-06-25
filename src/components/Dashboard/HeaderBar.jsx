import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Clock, Wifi, WifiOff, CloudRain, Type, Map as MapIcon } from 'lucide-react';

const HeaderBar = ({ connectionStatus, lastUpdateTime, onAboutClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFontSize = () => {
    const cur = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = cur === '110%' ? '100%' : '110%';
  };

  return (
    <header className="inst-header flex-col lg:flex-row gap-6 py-5">
      {/* Left — Logo + Title */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-slate-200 pr-6 mr-2">
          <div className="p-1">
            <img
              src={`${import.meta.env.BASE_URL}cccss_logo.png`}
              alt="Shivaji University CCCSS"
              className="h-14 lg:h-16 object-contain"
              onError={e => {
                e.target.src =
                  'https://upload.wikimedia.org/wikipedia/en/b/b3/Shivaji_University_logo.png';
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold font-serif text-academic-blue tracking-tight leading-snug max-w-md">
              Realtime Rain Gauge Monitoring System
              <br />
              <span className="text-lg lg:text-xl">Panchganga Basin</span>
            </h1>
            <h2 className="text-[9px] lg:text-[10px] font-bold text-academic-gold uppercase tracking-[0.2em] mt-1.5 opacity-90">
              Developed by: Centre for Climate Change and Sustainability Studies (CCCSS)
            </h2>
          </div>
        </div>
      </div>


      {/* Right — clock + status + about */}
      <div className="hidden xl:flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-academic-blue" />
            <span className="text-lg font-mono font-bold text-academic-blue">
              {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {time
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Kolkata',
              })
              .toUpperCase()}{' '}
            IST
          </span>
        </div>

        <div className="h-10 w-px bg-slate-300" />

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {connectionStatus === 'online' ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : connectionStatus === 'demo' ? (
              <Wifi className="w-4 h-4 text-amber-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-xs font-bold uppercase tracking-widest ${
                connectionStatus === 'online' ? 'text-emerald-600' : connectionStatus === 'demo' ? 'text-amber-500' : 'text-red-600'
              }`}
            >
              Network: {connectionStatus === 'online' ? 'Secure' : connectionStatus === 'demo' ? 'Demo Uplink' : 'Offline'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">
            Sync: {lastUpdateTime || 'Initialising…'}
          </span>
        </div>

        <button
          onClick={onAboutClick}
          className="ml-2 flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-slate-700 rounded transition-all font-bold text-[11px] uppercase tracking-widest active:scale-95 shadow-sm"
        >
          <Info className="w-4 h-4" />
          Project Info
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
