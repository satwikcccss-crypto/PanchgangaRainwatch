import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Meteorological Vertical Tube Gauge
 * @param {number} value - Daily cumulative rainfall in mm
 * @param {boolean} compact - If true, scales down for map popups
 */
const MeteoGauge = ({ value = 0, compact = false }) => {
  // Scale math: 0-120mm range
  const percent = Math.min(Math.max((value / 120) * 100, 0), 100);
  
  // Responsive sizing constants
  const height = compact ? "160px" : "240px";
  const width  = compact ? "45px"  : "70px";
  const ticks  = [120, 100, 80, 60, 40, 20, 0];

  return (
    <div 
      className="relative flex flex-col items-center" 
      style={{ width, height, margin: compact ? '0 auto' : '0 auto' }}
    >
      {/* Glass tube container */}
      <div className={`absolute inset-0 bg-gradient-to-b from-slate-50/80 to-slate-100/90 border-[#e2e8f0] rounded-full shadow-inner overflow-hidden ${compact ? 'border-2' : 'border-4'}`}>
        {/* Dynamic Water Level */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-academic-blue to-blue-500 rounded-b-full shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
          style={{ width: '100%' }}
        />
      </div>

      {/* Vertical Scale Markings */}
      <div className="absolute right-[-24px] top-0 h-full flex flex-col justify-between py-1">
        {ticks.map(val => (
          <div key={val} className="flex items-center gap-1">
            <div className={`h-[1px] bg-slate-300 ${compact ? 'w-1.5' : 'w-3'}`} />
            <span className={`font-mono font-bold tabular-nums text-slate-400 ${compact ? 'text-[7px]' : 'text-[9px]'}`}>
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Refined Rainfall Value Badge (Smaller and cleaner) */}
      <div className={`absolute left-1/2 -translate-x-1/2 bg-white ring-2 ring-slate-800 shadow-lg rounded-xl z-20 tabular-nums text-center whitespace-nowrap
        ${compact ? '-bottom-1 px-2 py-0.5' : '-bottom-2 px-3 py-1'}
      `}>
        <span className={`font-black text-slate-900 ${compact ? 'text-sm' : 'text-xl'}`}>
          {value.toFixed(1)}
        </span>
        <span className={`font-bold text-slate-400 uppercase ml-0.5 ${compact ? 'text-[6px]' : 'text-[8px]'}`}>
          mm
        </span>
      </div>
    </div>
  );
};

export default MeteoGauge;
