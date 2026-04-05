import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Droplets } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { getIMDConfigByKey } from '../../config/imdThresholds';

const StatCard = ({ station, data, index, onClick, isSelected }) => {
  const cfg = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  const intensity = data?.hourlyIntensity ?? 0;
  const cumulative = data?.dailyCumulative ?? 0;
  
  // Trend Logic: If current 1h intensity > 0.5 mm, it's "RISING" (technically accumulation is increasing)
  const isRising = intensity > 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onClick?.(station.id)}
      className={`bg-white rounded-lg p-5 border shadow-sm cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-[160px] ${isSelected ? 'ring-2 ring-academic-blue/10 border-academic-blue bg-slate-50/50' : 'border-slate-200'}`}
    >
      {/* Floodwatch Left Accent Bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: station.markerColor || cfg.color }}
      />

      {/* Top Header & Icon */}
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight mb-1">
            {station.name.toUpperCase()}
          </h4>
        </div>
        <div className="flex-shrink-0 opacity-20">
           <Droplets className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
      </div>

      {/* Main Reading (Floodwatch Style) */}
      <div className="flex flex-col mt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums">
            {cumulative.toFixed(2)}
          </span>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">MM</span>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center gap-1.5 mt-1">
          {isRising ? (
            <>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">RISING</span>
            </>
          ) : (
            <>
              <Minus className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">STABLE</span>
            </>
          )}
        </div>
      </div>

      {/* Reference Footer */}
      <div className="flex justify-between items-end mt-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded">
          IST REF
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest py-0.5 px-2 rounded-full border ${isSelected ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent'}`} style={{ color: cfg.color }}>
          {cfg.label}
        </div>
      </div>
    </motion.div>
  );
};

const StatsOverview = ({ stationData, selectedId, onStationClick }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
    {STATIONS.map((station, i) => (
      <StatCard
        key={station.id}
        station={station}
        data={stationData?.[station.id]}
        index={i}
        onClick={onStationClick}
        isSelected={selectedId === station.id}
      />
    ))}
  </div>
);

export default StatsOverview;
