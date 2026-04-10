import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, CloudRain, Zap, Activity, Globe, MapPin, Clock, TrendingUp, Minus } from 'lucide-react';
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
  const cfg       = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  const intensity = data?.hourlyIntensity ?? 0;
  const cumulative = data?.dailyCumulative ?? 0;
  const isRising   = intensity > 0.5;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${active ? 'ring-2 ring-academic-blue/10 border-academic-blue shadow-md' : 'border-slate-200 shadow-sm'}`}
      style={{ height: '140px' }}
    >
      {/* Floodwatch Side Accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: station.markerColor || cfg.color }}
      />
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <h4 className="text-[9px] font-bold font-serif text-slate-500 uppercase tracking-[0.2em] leading-tight pr-2">
          {station.name.toUpperCase()}
        </h4>
      </div>

      {/* Value & Trend */}
      <div className="mt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter font-mono">
            {cumulative.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MM</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[8px] font-black uppercase tracking-widest ${isRising ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isRising ? 'RISING' : 'STABLE'}
          </span>
          {isRising && <TrendingUp className="w-3 h-3 text-emerald-500" />}
        </div>
      </div>

      {/* Footer (Dynamic Telemetry Status) */}
      <div className="flex justify-between items-end mt-2">
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] font-sans">
          RTDAS Live Uplink
        </span>
        <div className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-slate-100 bg-slate-50 shadow-sm" style={{ color: cfg.color }}>
          {cfg.label}
        </div>
      </div>
    </motion.div>
  );
};

// ─── QUICK RAIN WIDGET MODAL (RainGauge Style) ──────────────────────────────
export const QuickRainWidgetModal = ({ station, data, onClose }) => {
  return (
    <AnimatePresence>
      {station && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="overlay z-[205]"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[210] pointer-events-none p-6"
          >
            <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-sm pointer-events-auto relative overflow-hidden border border-slate-200">
               <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-red-500 hover:text-white rounded-full text-slate-500 transition-all z-[100] shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-2 h-[420px]">
                 <RainGaugeWidget station={station} data={data} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── TECHNICAL ANALYTICS MODAL (Detailed Mode) ──────────────────────────────
export const DetailedAnalyticsModal = ({ station, data, onClose }) => {
  const cfg = getIMDConfigByKey(data?.imdLevel || 'no_rain');
  return (
    <AnimatePresence>
      {station && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="overlay z-[215]"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[220] pointer-events-none p-4"
          >
            <div className="bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(30,58,138,0.25)] w-full max-w-4xl pointer-events-auto relative overflow-hidden flex flex-col md:flex-row border border-slate-200"
              style={{ maxHeight: 'calc(100vh - 60px)' }}
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-red-500 hover:text-white rounded-full text-slate-500 transition-all z-[100] shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ── Left Sidebar (Station Info & Gauge) ────────────────── */}
              <div className="w-full md:w-[260px] bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-6">
                <div className="space-y-4">
                   <div className="aspect-square rounded-2xl overflow-hidden border border-white shadow-lg relative bg-slate-200">
                     <img 
                       src={station.imageUrl} 
                       alt={station.name} 
                       className="w-full h-full object-cover"
                       onLoad={(e) => e.target.classList.add('opacity-100')}
                       onError={(e) => {
                         e.target.src = 'https://images.unsplash.com/photo-1544653852-237285eec32b?q=80&w=400&auto=format&fit=crop';
                       }}
                     />
                     <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                        <span className="text-[8px] font-black text-white uppercase tracking-wider">RG-{station.stationNo}</span>
                     </div>
                   </div>

                   <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      {station.authority}
                    </span>
                    <h3 className="text-lg font-black text-academic-blue leading-tight uppercase font-serif">
                      {station.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-slate-500 uppercase">
                      <MapPin className="w-2.5 h-2.5 text-academic-gold" />
                      {station.location.lat.toFixed(4)}°N, {station.location.lng.toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col items-center gap-2">
                  <MeteoGauge value={data?.dailyCumulative ?? 0} compact={true} />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                     Atmospheric Load
                  </span>
                </div>
              </div>

              {/* ── Main Panel (Analytics & Hyetograph) ───────────────── */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                {/* Rolling Analytics (IS Standard Window) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {[
                    { label: 'Current 1h',  val: data?.rollingStats?.['1h'] || 0, color: 'text-blue-600' },
                    { label: 'Rolling 3h',  val: data?.rollingStats?.['3h'] || 0, color: 'text-emerald-500' },
                    { label: 'Rolling 6h',  val: data?.rollingStats?.['6h'] || 0, color: 'text-amber-500' },
                    { label: 'Rolling 12h', val: data?.rollingStats?.['12h'] || 0, color: 'text-orange-500' },
                    { label: 'Rolling 24h', val: data?.rollingStats?.['24h'] || 0, color: 'text-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100/80">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block mb-0.5">
                        {stat.label}
                      </span>
                      <div className={`text-base font-black tabular-nums ${stat.color}`}>
                        {parseFloat(stat.val).toFixed(1)}
                        <span className="text-[9px] ml-0.5 opacity-50 uppercase">mm</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hyetograph Section */}
                <div className="flex-1 min-h-[280px] flex flex-col bg-white border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-academic-blue" />
                      Station Hyetograph — Intensity vs. Accumulation
                    </h4>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Live Telemetry</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <RainfallChart stationData={data} stationName={station.name} />
                  </div>
                </div>

                {/* Technical Metadata Footer */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-slate-100">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Battery Power</span>
                    <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {data?.batteryVoltage ? `${data.batteryVoltage.toFixed(2)} V` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Uplink Health</span>
                    <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-emerald-500" />
                      {data?.signalStrength ? `${data.signalStrength} / 100` : 'Search...'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Sensor Standard</span>
                    <div className="text-[10px] font-bold text-slate-700">ISO/IS 0.2mm TP</div>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Data Source</span>
                    <div className={data?.isMockData ? 'text-amber-500 font-bold text-[9px] uppercase' : 'text-emerald-500 font-bold text-[9px] uppercase'}>
                      {data?.isMockData ? '⚠ Demo Dataset' : '● Cryptograph Secure'}
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
