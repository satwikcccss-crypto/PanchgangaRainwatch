import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, CloudRain, Zap, Activity, Globe, MapPin, Clock } from 'lucide-react';
import { getIMDConfigByKey } from '../../config/imdThresholds';
import MeteoGauge from '../Dashboard/MeteoGauge';
import RainfallChart from '../Charts/RainfallChart';

// ─── Animated falling raindrops ─────────────────────────────────────────────
const MAX_INTENSITY_DISPLAY = 30; // mm/hr ← maps to 100% fill on gauge

const Raindrops = ({ intensity }) => {
  const count = Math.min(20, Math.ceil((intensity / MAX_INTENSITY_DISPLAY) * 20));
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left:             `${10 + Math.random() * 80}%`,
            height:           `${6 + Math.random() * 10}px`,
            animationDuration: `${0.5 + Math.random() * 0.8}s`,
            animationDelay:    `${Math.random() * 1.2}s`,
          }}
        />
      ))}
    </>
  );
};

// ─── Full engineering-style gauge ───────────────────────────────────────────
export const RainGaugeWidget = ({ station, data, onClick }) => {
  const intensity = data?.hourlyIntensity ?? 0;
  const cfg       = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  const fillPct   = Math.min(100, (intensity / MAX_INTENSITY_DISPLAY) * 100);
  const isRaining = intensity > 0;

  // Threshold positions (% of gauge height)
  const modPct    = (2.5  / MAX_INTENSITY_DISPLAY) * 100;
  const heavyPct  = (15.6 / MAX_INTENSITY_DISPLAY) * 100;

  return (
    <div
      className="academic-panel p-4 cursor-pointer hover:border-academic-blue transition-all relative overflow-hidden h-full flex flex-col"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h4 className="text-xs font-bold font-serif text-academic-blue tracking-wider leading-tight">
            {station.name}
          </h4>
          <span className="text-[9px] font-bold text-slate-400 font-mono">
            CCCSS-RG-STN-{station.stationNo.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-base font-black font-mono tracking-tighter" style={{ color: cfg.color }}>
            {intensity.toFixed(1)} <span className="text-[10px]">mm/hr</span>
          </div>
          <div
            className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm"
            style={{ backgroundColor: cfg.color, color: '#fff' }}
          >
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Gauge */}
      <div className="rain-gauge-container flex-grow relative" style={{ height: '220px' }}>
        {/* Raindrops above tube */}
        {isRaining && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ bottom: '40px' }}>
            <Raindrops intensity={intensity} />
          </div>
        )}

        {/* Scale labels */}
        <div className="absolute right-[calc(50%+34px)] top-0 bottom-10 w-10 pointer-events-none">
          {[0, 5, 10, 15, 20, 25, 30].map(val => (
            <div
              key={val}
              className="absolute right-0 text-[9px] font-mono font-bold text-slate-500"
              style={{
                bottom: `${(val / MAX_INTENSITY_DISPLAY) * 100}%`,
                transform: 'translateY(50%)',
              }}
            >
              {val}
            </div>
          ))}
        </div>

        {/* Tube */}
        <div
          className="absolute bottom-10 mx-auto rain-gauge-tube"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            height: 'calc(100% - 40px)',
          }}
        >
          {/* Colour zones */}
          <div className="zone-light"  style={{ height: `${modPct}%` }} />
          <div
            className="zone-moderate"
            style={{ bottom: `${modPct}%`, height: `${heavyPct - modPct}%` }}
          />
          <div
            className="zone-heavy"
            style={{ bottom: `${heavyPct}%`, height: `${100 - heavyPct}%` }}
          />

          {/* Water fill */}
          <motion.div
            className="gauge-water"
            animate={{ height: `${fillPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Threshold marks */}
          <div
            className="imd-mark glow-moderate"
            style={{ bottom: `${modPct}%`, borderColor: '#eab308' }}
          />
          <div
            className="imd-mark glow-heavy"
            style={{ bottom: `${heavyPct}%`, borderColor: '#ef4444' }}
          />
        </div>

        {/* Funnel top */}
        <div
          className="absolute mx-auto"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'calc(100% - 40px + 2px)',
            width: '72px',
            height: '16px',
            background: 'linear-gradient(#e2e8f0, #cbd5e1)',
            clipPath: 'polygon(10% 0%, 90% 0%, 80% 100%, 20% 100%)',
          }}
        />

        {/* Label strip at bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest text-slate-400"
        >
          mm/hr
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 mt-3 flex-shrink-0">
        <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Instant Rate</div>
          <div className="text-sm font-black font-mono text-slate-700">
            {(data?.instantaneousRate ?? 0).toFixed(1)}<span className="text-[9px] text-slate-400 ml-0.5">mm/hr</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
          <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Today</div>
          <div className="text-sm font-black font-mono text-blue-700">
            {(data?.dailyCumulative ?? 0).toFixed(1)}<span className="text-[9px] text-blue-400 ml-0.5">mm</span>
          </div>
        </div>
      </div>

      {/* Mock warning */}
      {data?.isMockData && (
        <div className="mt-2 text-[8px] font-bold text-amber-500 uppercase tracking-widest text-center">
          ⚠ Demo Data — Configure ThingSpeak channel
        </div>
      )}
    </div>
  );
};

// ─── Compact list indicator (right column) ──────────────────────────────────
export const SimpleRainIndicator = ({ station, data, active, onClick }) => {
  const intensity = data?.hourlyIntensity ?? 0;
  const cfg       = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  const fillPct   = Math.min(100, (intensity / MAX_INTENSITY_DISPLAY) * 100);

  return (
    <motion.div
      whileHover={{ x: 3 }}
      onClick={onClick}
      className="academic-panel p-3 cursor-pointer flex items-center gap-3 transition-all"
      style={{
        borderColor: active ? cfg.color : undefined,
        boxShadow:   active ? `0 0 0 2px ${cfg.color}30` : undefined,
      }}
    >
      {/* Station colour dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: station.markerColor }}
      />

      {/* Mini tube */}
      <div className="w-4 h-12 bg-slate-100 border border-slate-300 rounded-sm relative overflow-hidden flex-shrink-0">
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          animate={{ height: `${fillPct}%` }}
          transition={{ duration: 1 }}
          style={{
            background: `linear-gradient(180deg, ${cfg.color}aa, ${cfg.color})`,
          }}
        />
        <div
          className="absolute left-0 right-0 h-px"
          style={{ bottom: `${(2.5 / MAX_INTENSITY_DISPLAY) * 100}%`, backgroundColor: '#eab308' }}
        />
        <div
          className="absolute left-0 right-0 h-px"
          style={{ bottom: `${(15.6 / MAX_INTENSITY_DISPLAY) * 100}%`, backgroundColor: '#ef4444' }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-academic-blue truncate">{station.shortName}</div>
        <div className="text-[10px] text-slate-500">
          Stn {station.stationNo} · {data?.isMockData ? '⚠ Demo' : '● Live'}
        </div>
      </div>

      {/* Reading */}
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-black font-mono" style={{ color: cfg.color }}>
          {intensity.toFixed(1)}
        </div>
        <div className="text-[8px] font-bold text-slate-400 uppercase">mm/hr</div>
      </div>
    </motion.div>
  );
};

// ─── Zoomed modal gauge ──────────────────────────────────────────────────────
export const ZoomedGauge = ({ station, data, onClose }) => {
  const cfg = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  return (
    <AnimatePresence>
      {station && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[210] pointer-events-none p-4 md:p-8"
          >
            <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(30,58,138,0.25)] w-full max-w-5xl pointer-events-auto relative overflow-hidden flex flex-col md:flex-row border border-slate-200"
              style={{ maxHeight: 'calc(100vh - 80px)' }}
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-red-500 hover:text-white rounded-full text-slate-500 transition-all z-[100] shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* ── Left Sidebar (Station Info & Gauge) ────────────────── */}
              <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-6">
                <div className="space-y-4">
                   <div className="aspect-square rounded-3xl overflow-hidden border-2 border-white shadow-xl relative bg-slate-200">
                     <img 
                       src={station.imageUrl} 
                       alt={station.name} 
                       className="w-full h-full object-cover"
                       onLoad={(e) => e.target.classList.add('opacity-100')}
                       onError={(e) => {
                         e.target.src = 'https://images.unsplash.com/photo-1544653852-237285eec32b?q=80&w=400&auto=format&fit=crop';
                       }}
                     />
                     <div className="absolute top-3 left-3 bg-academic-blue/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <span className="text-[9px] font-black text-white uppercase tracking-wider">RG-{station.stationNo}</span>
                     </div>
                   </div>

                   <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      {station.authority}
                    </span>
                    <h3 className="text-xl font-black text-academic-blue leading-tight uppercase font-serif">
                      {station.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-500 uppercase">
                      <MapPin className="w-3 h-3 text-academic-gold" />
                      {station.location.lat.toFixed(4)}°N, {station.location.lng.toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center gap-3">
                  <MeteoGauge value={data?.dailyCumulative ?? 0} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                     Atmospheric Load
                  </span>
                </div>
              </div>

              {/* ── Main Panel (Analytics & Hyetograph) ───────────────── */}
              <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
                {/* Rolling Analytics (IS Standard Window) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { label: 'Current 1h',  val: data?.rollingStats?.['1h'] || 0, color: 'text-blue-600' },
                    { label: 'Rolling 3h',  val: data?.rollingStats?.['3h'] || 0, color: 'text-emerald-500' },
                    { label: 'Rolling 6h',  val: data?.rollingStats?.['6h'] || 0, color: 'text-amber-500' },
                    { label: 'Rolling 12h', val: data?.rollingStats?.['12h'] || 0, color: 'text-orange-500' },
                    { label: 'Rolling 24h', val: data?.rollingStats?.['24h'] || 0, color: 'text-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">
                        {stat.label}
                      </span>
                      <div className={`text-lg font-black tabular-nums ${stat.color}`}>
                        {parseFloat(stat.val).toFixed(1)}
                        <span className="text-[10px] ml-1 opacity-50 uppercase">mm</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hyetograph Section */}
                <div className="flex-1 min-h-[300px] flex flex-col bg-white border border-slate-100 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-academic-blue" />
                      Station Hyetograph — Intensity vs. Accumulation
                    </h4>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-academic-blue animate-pulse" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Live Telemetry</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <RainfallChart stationData={data} stationName={station.name} />
                  </div>
                </div>

                {/* Technical Metadata Footer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Battery Power</span>
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {data?.batteryVoltage ? `${data.batteryVoltage.toFixed(2)} V` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Uplink Health</span>
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                      <Globe className="w-3 h-3 text-emerald-500" />
                      {data?.signalStrength ? `${data.signalStrength} / 100` : 'Search...'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sensor Standard</span>
                    <div className="text-[11px] font-bold text-slate-700">ISO/IS 0.2mm TP</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Data Source</span>
                    <div className={data?.isMockData ? 'text-amber-500 font-bold text-[10px] uppercase' : 'text-emerald-500 font-bold text-[10px] uppercase'}>
                      {data?.isMockData ? '⚠ Demo Dataset' : '● Cryptograph Encrypted'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RainGaugeWidget;
