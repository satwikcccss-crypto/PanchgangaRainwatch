import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, CloudRain, Zap } from 'lucide-react';
import { getIMDConfigByKey } from '../../config/imdThresholds';

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[210] pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto relative"
              style={{ border: `2px solid ${cfg.color}40` }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div style={{ height: '380px' }}>
                <RainGaugeWidget station={station} data={data} onClick={() => {}} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RainGaugeWidget;
