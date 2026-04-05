import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';
import { IMD_LEVELS } from '../../config/imdThresholds';

const ICON_MAP = {
  no_rain:      <CloudRain className="w-5 h-5" />,
  light:        <CloudRain className="w-5 h-5" />,
  moderate:     <CloudRain className="w-5 h-5" />,
  rather_heavy: <AlertTriangle className="w-5 h-5" />,
  heavy:        <ShieldAlert className="w-5 h-5" />,
  very_heavy:   <Zap className="w-5 h-5" />,
  extreme:      <Zap className="w-5 h-5" />,
};

const AlertBanner = ({ imdLevelKey }) => {
  const [visible, setVisible] = useState(false);
  const cfg = IMD_LEVELS[imdLevelKey] || IMD_LEVELS.no_rain;
  const showBanner = cfg.priority >= 2; // moderate and above

  useEffect(() => {
    setVisible(showBanner);
  }, [imdLevelKey, showBanner]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={imdLevelKey}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="mb-4 rounded-lg border px-5 py-3 flex items-center justify-between gap-4"
          style={{
            backgroundColor: cfg.bgColor,
            borderColor: cfg.borderColor,
            borderLeftWidth: '4px',
            borderLeftColor: cfg.color,
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ color: cfg.color }}>{ICON_MAP[imdLevelKey]}</span>
            <div>
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: cfg.color }}
              >
                {cfg.icon} {cfg.label} — RAINFALL NETWORK ALERT
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">{cfg.description}</p>
            </div>
          </div>

          {cfg.priority >= 4 && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                color: cfg.color,
                borderColor: cfg.color,
                backgroundColor: cfg.bgColor,
              }}
            >
              ● LIVE ALERT
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBanner;
