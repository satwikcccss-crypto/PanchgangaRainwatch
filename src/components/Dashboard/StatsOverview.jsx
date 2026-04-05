import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Droplets } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { getIMDConfigByKey } from '../../config/imdThresholds';

const StatCard = ({ station, data, index, onClick, isSelected }) => {
  const cfg = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  const intensity = data?.hourlyIntensity ?? 0;
  const daily     = data?.dailyCumulative ?? 0;
  const isMock    = data?.isMockData;

  const getTrendIcon = () => {
    const rate = data?.instantaneousRate ?? 0;
    if (rate > intensity + 1) return <TrendingUp  className="w-3.5 h-3.5" style={{ color: cfg.color }} />;
    if (rate < intensity - 1) return <TrendingDown className="w-3.5 h-3.5 text-slate-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onClick?.(station.id)}
      className="bg-white rounded-xl p-4 border shadow-sm cursor-pointer group relative overflow-hidden transition-all duration-300"
      style={{
        borderColor: isSelected ? cfg.color : `${cfg.color}20`,
        boxShadow: isSelected ? `0 0 0 2px ${cfg.color}40` : undefined,
      }}
    >
      {/* Top glow bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-full"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
      />

      {/* Station number badge */}
      <div
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
        style={{ backgroundColor: station.markerColor }}
      >
        {station.stationNo}
      </div>

      {/* Header */}
      <div className="flex items-start gap-2 mb-2 pr-6">
        <div
          className="status-dot mt-1"
          style={{ backgroundColor: data?.status === 'active' ? cfg.color : '#475569' }}
        />
        <div className="min-w-0">
          <h3 className="text-sm font-black text-academic-blue truncate leading-tight uppercase tracking-tight">
            {station.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              ID: {station.id.slice(0, 8)}
            </span>
            <span className="text-[8px] font-bold text-slate-300">|</span>
            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
              {data?.status === 'active' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Metadata */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
          style={{ backgroundColor: cfg.bgColor, color: cfg.color, border: `1px solid ${cfg.borderColor}` }}
        >
          {cfg.icon} {cfg.label}
        </span>
        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          <Clock className="w-2.5 h-2.5" />
          {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Syncing'}
        </div>
      </div>

      {/* Main reading */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">
              {intensity.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">mm/hr</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <span className="text-[10px] text-slate-500">
              {data?.instantaneousRate?.toFixed(1) ?? '—'} mm/hr instant
            </span>
          </div>
        </div>

        {/* Daily total */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-bold text-blue-600">{daily.toFixed(1)} mm</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">today</span>
        </div>
      </div>

      {/* Demo data warning */}
      {isMock && (
        <div className="absolute bottom-2 left-3 text-[8px] font-bold text-amber-500 uppercase tracking-widest">
          ⚠ Demo Data
        </div>
      )}
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
