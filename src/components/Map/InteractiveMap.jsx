import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Map as MapIcon, Radio, Pause, Play } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getIMDConfigByKey } from '../../config/imdThresholds';
import MeteoGauge from '../Dashboard/MeteoGauge';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

const FlyToStation = ({ selectedId }) => {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const s = STATIONS.find(s => s.id === selectedId);
    if (s) map.flyTo([s.location.lat, s.location.lng], 13, { duration: 1.2 });
  }, [selectedId, map]);
  return null;
};

// ─── Rain Radar Animation Logic ─────────────────────────────────────────────
const RainRadarTile = ({ isPlaying, onTimeUpdate }) => {
  const [timestamps, setTimestamps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        const times = data.radar.past.map(r => r.time);
        setTimestamps(times);
        setCurrentIndex(times.length - 1);
        onTimeUpdate(times[times.length - 1]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isPlaying || timestamps.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % timestamps.length;
        onTimeUpdate(timestamps[next]);
        return next;
      });
    }, 1200); // 1.2s per frame
    return () => clearInterval(timer);
  }, [isPlaying, timestamps, onTimeUpdate]);

  if (timestamps.length === 0) return null;
  const currentTs = timestamps[currentIndex];

  return (
    <TileLayer
      key={`radar-${currentTs}`}
      url={`https://tilecache.rainviewer.com/v2/radar/${currentTs}/256/{z}/{x}/{y}/2/1_1.png`}
      opacity={0.65}
      zIndex={100} // Always above base layers
      attribution="&copy; RainViewer"
    />
  );
};

// ─── Main Map Component ─────────────────────────────────────────────────────
const InteractiveMap = ({ stationData, selectedId, onStationClick }) => {
  const [showRadar, setShowRadar] = useState(true);
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarTime, setRadarTime] = useState(null);

  const radarTimeStr = radarTime 
    ? new Date(radarTime * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="academic-panel h-full flex flex-col overflow-hidden shadow-sm"
    >
      {/* Map header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MapIcon className="w-5 h-5 text-academic-blue" />
          <div>
            <h2 className="text-sm font-bold font-serif text-academic-blue uppercase tracking-tight">
              Panchganga Basin — Spatial Monitoring
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Live Station Markers & Regional Rain Radar
            </p>
          </div>
        </div>
        
        {/* Radar Toggle Control */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowRadar(!showRadar)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${showRadar ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <Radio className={`w-3.5 h-3.5 ${showRadar ? 'animate-pulse' : ''}`} />
            {showRadar ? 'Live Radar Active' : 'Enable Radar'}
          </button>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {STATIONS.length} Active Nodes
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[350px]">
        {/* Radar Time Control Floating Panel */}
        {showRadar && radarTime && (
          <div className="absolute top-4 right-[60px] z-[1000] bg-white/95 backdrop-blur border border-slate-200 p-2.5 rounded-xl shadow-lg flex items-center gap-4">
             <button
                onClick={() => setRadarPlaying(!radarPlaying)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                title={radarPlaying ? "Pause Animation" : "Play Animation"}
              >
                {radarPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
             </button>
             <div className="pr-2">
               <div className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-0.5">Radar Frame Time</div>
               <div className="text-sm font-black font-mono text-slate-800 leading-none">{radarTimeStr}</div>
             </div>
          </div>
        )}

        <MapContainer
          center={MAP_CONFIG.defaultCenter}
          zoom={MAP_CONFIG.defaultZoom}
          className="h-full w-full z-10"
        >
          {showRadar && (
             <RainRadarTile 
               isPlaying={radarPlaying} 
               onTimeUpdate={setRadarTime} 
             />
          )}

          <LayersControl position="topright">
            <BaseLayer name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </BaseLayer>
            <BaseLayer name="Google Hybrid" checked>
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                attribution="Google Maps"
              />
            </BaseLayer>
            <BaseLayer name="ESRI Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
              />
            </BaseLayer>
          </LayersControl>

          <FlyToStation selectedId={selectedId} />

          {STATIONS.map(station => {
            const d         = stationData?.[station.id];
            const intensity = d?.hourlyIntensity ?? 0;
            const cfg       = getIMDConfigByKey(d?.imdLevel || 'no_rain');
            const isSelected = selectedId === station.id;
            const isMock     = d?.isMockData;

            return (
              <CircleMarker
                key={station.id}
                center={[station.location.lat, station.location.lng]}
                radius={isSelected ? 14 : 10}
                pathOptions={{
                  color:       isSelected ? '#fde047' : '#ffffff',
                  fillColor:   cfg.color,
                  fillOpacity: 0.95,
                  weight:      isSelected ? 3 : 1.5,
                }}
                eventHandlers={{ click: () => onStationClick?.(station.id) }}
              >
                {/* ── Hover Tooltip ── */}
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="rtdas-tooltip-v2">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl min-w-[240px]">
                    <div className="border-b border-slate-100 pb-2 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block font-sans">
                        RG-{station.stationNo} · {station.authority}
                      </span>
                      <h4 className="text-[13px] font-black text-academic-blue uppercase font-serif">
                        {station.name}
                      </h4>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex items-center justify-center min-w-[60px]">
                        <MeteoGauge value={d?.dailyCumulative ?? 0} compact={true} />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Intensity</span>
                          <span className="text-xs font-black text-slate-800">{intensity.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50/50 px-2.5 py-1.5 rounded-lg">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Daily</span>
                          <span className="text-xs font-black text-blue-700">{(d?.dailyCumulative ?? 0).toFixed(1)}</span>
                        </div>
                        <div className={`text-[9px] font-black uppercase text-center py-1 rounded-md border ${isMock ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isMock ? '⚠ Demo Data' : '● Live Uplink'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* CCCSS watermark */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-md text-[9px] tracking-widest font-bold text-slate-500 shadow-sm pointer-events-none font-sans uppercase">
          CCCSS • Shivaji University Kolhapur
        </div>

        {/* IMD legend */}
        <div className="absolute bottom-12 left-2 z-[1000] bg-white/95 backdrop-blur border border-slate-200 px-3 py-2 rounded-md shadow-sm pointer-events-none font-sans">
          <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">IMD Intensity Scale</div>
          {[
            { label: 'Light',        color: '#22c55e' },
            { label: 'Moderate',     color: '#eab308' },
            { label: 'Rather Heavy', color: '#f97316' },
            { label: 'Heavy',        color: '#ef4444' },
            { label: 'Very Heavy',   color: '#a855f7' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[8px] font-bold text-slate-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(InteractiveMap);
