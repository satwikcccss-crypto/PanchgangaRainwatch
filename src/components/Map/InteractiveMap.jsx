import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Map as MapIcon } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getIMDConfigByKey } from '../../config/imdThresholds';
import MeteoGauge from '../Dashboard/MeteoGauge';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

const FlyToStation = ({ selectedId }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!selectedId) return;
    const s = STATIONS.find(s => s.id === selectedId);
    if (s) map.flyTo([s.location.lat, s.location.lng], 13, { duration: 1.2 });
  }, [selectedId, map]);
  return null;
};

const InteractiveMap = ({ stationData, selectedId, onStationClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="academic-panel h-full flex flex-col overflow-hidden shadow-sm"
    >
      {/* Map header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <MapIcon className="w-5 h-5 text-academic-blue" />
          <div>
            <h2 className="text-sm font-bold font-serif text-academic-blue uppercase tracking-tight">
              Panchganga Basin — Rain Gauge Station Network
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Hover a station marker to view live rainfall data
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {STATIONS.length} Active Nodes
          </span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[350px]">
        <MapContainer
          center={MAP_CONFIG.defaultCenter}
          zoom={MAP_CONFIG.defaultZoom}
          className="h-full w-full z-10"
        >
          <LayersControl position="topright">
            <BaseLayer name="OpenStreetMap" checked>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </BaseLayer>
            <BaseLayer name="Google Hybrid">
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
                  color:       isSelected ? '#1e3a5f' : cfg.color,
                  fillColor:   cfg.color,
                  fillOpacity: 0.92,
                  weight:      isSelected ? 4 : 2,
                }}
                eventHandlers={{ click: () => onStationClick?.(station.id) }}
              >
                {/* ── Hover Tooltip (Synced with Meteo Gauge Design) ── */}
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
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter text-slate-400">Intensity</span>
                          <span className="text-xs font-black text-slate-800">{intensity.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50/50 px-2.5 py-1.5 rounded-lg">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Daily</span>
                          <span className="text-xs font-black text-blue-700">{(d?.dailyCumulative ?? 0).toFixed(1)}</span>
                        </div>
                        <div className={`text-[9px] font-black uppercase text-center py-1 rounded-md border ${isMock ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isMock ? '⚠ Demo' : '● Live'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tooltip>

                <Popup maxWidth={320} className="rtdas-map-popup">
                  <div className="p-2 min-w-[280px]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1 font-sans">
                          {station.authority} · RG-{station.stationNo}
                        </span>
                        <h3 className="text-base font-black text-academic-blue leading-tight uppercase font-serif">
                          {station.name}
                        </h3>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${isMock ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                        {isMock ? 'Demo' : 'Live'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="flex flex-col items-center bg-slate-50/50 rounded-2xl py-4 border border-slate-100">
                        <MeteoGauge value={d?.dailyCumulative ?? 0} compact={true} />
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white border border-slate-100 rounded-xl p-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1 font-sans">Intensity</span>
                          <div className="text-xl font-black text-slate-800 tabular-nums">
                            {(d?.hourlyIntensity ?? 0).toFixed(1)}
                            <span className="text-[10px] ml-1 text-slate-400">mm/h</span>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1 font-sans">Status</span>
                          <div className={`text-[11px] font-black uppercase ${d?.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {d?.status === 'active' ? '● Reporting' : '○ Standby'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* CCCSS watermark */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-md text-[9px] tracking-widest font-bold text-slate-500 shadow-sm pointer-events-none font-sans uppercase">
          CCCSS • Shivaji University Kolhapur
        </div>

        {/* IMD legend */}
        <div className="absolute top-2 left-2 z-[1000] bg-white/95 backdrop-blur border border-slate-200 px-3 py-2 rounded-md shadow-sm pointer-events-none font-sans">
          <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Rainfall Scale</div>
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
