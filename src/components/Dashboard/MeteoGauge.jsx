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
  const width  = compact ? "44px"  : "68px";
  const ticks  = [120, 100, 80, 60, 40, 20, 0];

  return (
    <div 
      className="relative flex flex-col items-center" 
      style={{ width, height }}
    >
      {/* Glass tube container */}
      <div className={`absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-black/10 border-[#e2e8f0] rounded-full shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden z-10 ${compact ? 'border-2' : 'border-4'}`}>
        
        {/* Dynamic Water Level with Wave & Shimmer */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(percent, 2)}%` }} // 2% baseline for visibility
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f4c81] to-[#3b82f6] rounded-b-full overflow-hidden"
          style={{ width: '100%' }}
        >
          {/* Shimmer Effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          
          {/* Subtle Wave overlay */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-white/10 blur-[2px] rounded-t-full" />
        </motion.div>

        {/* Refraction/Glass Reflection Highlight */}
        <div className="absolute top-0 bottom-0 left-[20%] w-[15%] bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />
      </div>

      {/* Vertical Scale Markings */}
      <div className="absolute right-[-26px] top-0 h-full flex flex-col justify-between py-1 z-0">
        {ticks.map(val => (
          <div key={val} className="flex items-center gap-1">
            <div className={`h-[1px] bg-slate-300 ${compact ? 'w-2' : 'w-4'}`} />
            <span className={`font-mono font-bold tabular-nums text-slate-400 ${compact ? 'text-[7px]' : 'text-[9px]'}`}>
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Refined Rainfall Value Badge (Smaller and cleaner) */}
      <div className={`absolute left-1/2 -translate-x-1/2 bg-white ring-2 ring-slate-800 shadow-xl rounded-xl z-30 tabular-nums text-center whitespace-nowrap
        ${compact ? '-bottom-1 px-2.5 py-0.5' : '-bottom-4 px-4 py-1.5'}
      `}>
        <span className={`font-black text-slate-900 ${compact ? 'text-sm' : 'text-2xl tracking-tighter'}`}>
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
