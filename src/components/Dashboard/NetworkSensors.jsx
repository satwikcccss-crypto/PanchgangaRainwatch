import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Battery, Signal, Info, Droplets, Globe, Clock, ShieldAlert, Radio } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { getIMDConfigByKey } from '../../config/imdThresholds';
import MeteoGauge from './MeteoGauge';

const GaugeCard = ({ station, data, index, onViewAnalytics }) => {
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
      className="glass-light rounded-3xl p-6 flex flex-col h-full border border-slate-200/60 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-mono text-xl font-bold text-slate-800 tracking-tight">RG-{String(station.stationNo).padStart(2, '0')}</span>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-0.5">{station.shortName}</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-white/80 text-slate-500 rounded-full font-mono text-[9px] font-bold shadow-sm">
            {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '00:00'} IST
          </span>
        </div>
      </div>

      {/* Vertical Meteorological Tube (Refined) */}
      <div className="flex justify-center mb-8 relative pt-4">
        <MeteoGauge value={current} />
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
      </div>

      {/* Technical Telemetry */}
      <div className="grid grid-cols-3 gap-2 text-center mt-6 pt-6 border-t border-slate-100">
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

      {/* Action Button */}
      <button
        onClick={() => onViewAnalytics?.(station)}
        className="mt-6 w-full py-3 bg-white border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 hover:bg-academic-blue hover:text-white hover:border-academic-blue transition-all shadow-sm"
      >
        View Analytics
      </button>
    </motion.div>
  );
};


const NetworkSensors = ({ stationData = {}, onViewAnalytics }) => {
  const dataArray = Object.values(stationData || {});
  
  // Calculations for summary metrics (safe defaults)
  const totalRain = dataArray.reduce((sum, d) => sum + (d?.dailyCumulative ?? 0), 0);
  const activeCount = dataArray.filter(d => d?.status === 'active').length;
  const avgIntensity = activeCount > 0 
    ? dataArray.reduce((sum, d) => sum + (d?.hourlyIntensity ?? 0), 0) / activeCount 
    : 0;
  
  const rawMax = dataArray.map(d => d?.dailyCumulative ?? 0);
  const maxRain = rawMax.length > 0 ? Math.max(...rawMax) : 0;

  return (
    <div className="mb-12">
      {/* Network Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
           <h2 className="text-xl font-bold font-serif text-academic-blue uppercase tracking-tight flex items-center gap-2">
             <Activity className="w-6 h-6" /> Telemetry Network Analysis
           </h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             RTDAS Sensor Grid · IS-Standards · 24/7 Monitoring
           </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Export utility removed as per request */}
        </div>
      </div>

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
            onViewAnalytics={onViewAnalytics}
          />
        ))}
      </div>

      {/* Secondary Technical Telemetry Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 pb-4">
        {[
          { icon: <Activity className="w-3.5 h-3.5 text-blue-600" />,   label: 'Active Nodes', value: `0${Object.keys(stationData).length || STATIONS.length} of 05` },
          { icon: <Globe    className="w-3.5 h-3.5 text-emerald-600" />, label: 'Gateway',      value: 'CCCSS-SU-RG-01' },
          { icon: <Clock    className="w-3.5 h-3.5 text-amber-600" />,   label: 'Latency',      value: '< 1500 ms' },
          { icon: <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />, label: 'Protocol',     value: 'TLS 1.3 / AES' },
          { icon: <Radio    className="w-3.5 h-3.5 text-indigo-600" />, label: 'Uplink',       value: 'ThingSpeak API' },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="glass-light rounded-2xl p-4 border border-slate-200/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-[13px] font-mono font-bold text-slate-800 truncate">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkSensors;
