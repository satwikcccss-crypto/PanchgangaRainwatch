import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Battery, Signal, Info, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { getIMDConfigByKey } from '../../config/imdThresholds';

const GaugeCard = ({ station, data, index }) => {
  const cfg = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  const current = data?.dailyCumulative ?? 0;
  const intensity = data?.hourlyIntensity ?? 0;
  
  // Scale math: 0-120mm range (standard meteorological tube)
  const percent = Math.min(Math.max((current / 120) * 100, 0), 100);
  
  const intensityColor = intensity > 15.5 ? '#ef4444' : intensity > 2.4 ? '#eab308' : '#22c55e';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-light rounded-3xl p-6 flex flex-col h-full border border-slate-200/60"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-mono text-xl font-bold text-slate-800 tracking-tight">RG-{String(station.stationNo).padStart(2, '0')}</span>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-0.5">{station.shortName}</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-mono text-[9px] font-bold">
            {data?.lastSeen?.split(' ')[1] || '00:00'} IST
          </span>
        </div>
      </div>

      {/* Vertical Meteorological Tube */}
      <div className="flex justify-center mb-8 relative">
        <div className="meteo-gauge-v2">
          {/* Glass tube */}
          <div className="meteo-tube-v2"></div>
          
          {/* Water level */}
          <div 
            className="meteo-water-v2" 
            style={{ height: `${percent}%` }}
          ></div>
          
          {/* Scale markings */}
          <div className="meteo-scale-v2">
            {[120, 100, 80, 60, 40, 20, 0].map(val => (
              <div key={val} className="flex items-center justify-end gap-1.5">
                <span className="tabular-nums">{val}</span>
                <div className="meteo-tick-v2"></div>
              </div>
            ))}
          </div>
          
          {/* Current value floating badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-800 text-slate-900 text-3xl font-black rounded-2xl px-4 py-1.5 shadow-xl z-30 tabular-nums">
            {current.toFixed(1)}<span className="text-[10px] uppercase ml-1 opacity-50">mm</span>
          </div>
        </div>
      </div>

      {/* Rainfall Intensity bar */}
      <div className="mt-auto space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Rainfall Intensity</span>
          <span className="font-mono text-slate-700">{intensity.toFixed(2)} mm/hr</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full relative overflow-hidden ring-1 ring-slate-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(intensity * 4, 100)}%` }}
            className="absolute h-full rounded-full" 
            style={{ backgroundColor: intensityColor }}
          ></motion.div>
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
          <span>Light</span>
          <span>Moderate</span>
          <span>Heavy</span>
        </div>
      </div>

      {/* Technical Telemetry */}
      <div className="grid grid-cols-3 gap-2 text-center mt-8 pt-6 border-t border-slate-100">
        <div>
          <div className="flex items-center justify-center gap-1 mb-1 text-slate-400">
            <Signal className="w-3 h-3" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Signal</span>
          </div>
          <div className="font-mono text-[11px] font-bold text-emerald-600">
            {data?.signalStrength ? `${data.signalStrength}%` : '89%'}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 mb-1 text-slate-400">
            <Battery className="w-3 h-3" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Power</span>
          </div>
          <div className={`font-mono text-[11px] font-bold ${(data?.batteryVoltage < 3.5) ? 'text-amber-500' : 'text-emerald-600'}`}>
            {data?.batteryVoltage ? `${data.batteryVoltage}V` : '3.8V'}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 mb-1 text-slate-400">
            <Activity className="w-3 h-3" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Status</span>
          </div>
          <div className="font-bold text-[10px] uppercase text-emerald-500">
            {data?.status === 'active' ? 'Live' : 'Ready'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NetworkSensors = ({ stationData }) => {
  // Calculations for summary metrics
  const totalRain = Object.values(stationData).reduce((sum, d) => sum + (d?.dailyCumulative ?? 0), 0);
  const activeCount = Object.values(stationData).filter(d => d?.status === 'active').length;
  const avgIntensity = activeCount > 0 
    ? Object.values(stationData).reduce((sum, d) => sum + (d?.hourlyIntensity ?? 0), 0) / activeCount 
    : 0;
  const maxRain = Math.max(...Object.values(stationData).map(d => d?.dailyCumulative ?? 0), 0);

  return (
    <div className="mb-12">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-light rounded-3xl p-6 border border-slate-200/50">
          <div className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Network Accumulation</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 tabular-nums">{totalRain.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">mm Today</span>
          </div>
        </div>
        <div className="glass-light rounded-3xl p-6 border border-slate-200/50">
          <div className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Network Average</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 tabular-nums">{(totalRain / STATIONS.length).toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">mm / Station</span>
          </div>
        </div>
        <div className="glass-light rounded-3xl p-6 border border-slate-200/50">
          <div className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Network Intensity</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 tabular-nums">{avgIntensity.toFixed(2)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">mm/hr avg</span>
          </div>
        </div>
        <div className="glass-light rounded-3xl p-6 border border-emerald-100 bg-emerald-50/20">
          <div className="text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase mb-2">Operational Status</div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-bold text-emerald-700 uppercase tracking-tight">Active & Reporting</span>
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {STATIONS.map((station, i) => (
          <GaugeCard 
            key={station.id} 
            station={station} 
            data={stationData[station.id]} 
            index={i} 
          />
        ))}
      </div>
    </div>
  );
};

export default NetworkSensors;
