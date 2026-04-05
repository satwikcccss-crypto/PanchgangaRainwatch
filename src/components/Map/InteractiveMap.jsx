import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Map as MapIcon } from 'lucide-react';
import { STATIONS } from '../../config/stations';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getIMDConfigByKey } from '../../config/imdThresholds';
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

const InteractiveMap = ({ stationData, selectedStation, onStationClick }) => {
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
            <BaseLayer name="ESRI Topography">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
              />
            </BaseLayer>
          </LayersControl>

          {/* Live precipitation overlay */}
          <LayersControl position="bottomright">
            <LayersControl.Overlay name="Precipitation Radar (Live)" checked>
              <TileLayer
                url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=8c6f40fc4f2c52789ab7fb96bcce2d72"
                attribution="OpenWeatherMap"
                opacity={0.55}
              />
            </LayersControl.Overlay>
          </LayersControl>

          <FlyToStation selectedId={selectedStation} />

          {STATIONS.map(station => {
            const d         = stationData?.[station.id];
            const intensity = d?.hourlyIntensity ?? 0;
            const cfg       = getIMDConfigByKey(d?.imdLevel || 'no_rain');
            const isSelected = selectedStation === station.id;
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
                {/* ── Hover Tooltip ── */}
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="rtdas-tooltip">
                  <div style={{
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', padding: '10px 13px', minWidth: '230px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.13)', fontFamily: 'inherit'
                  }}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '7px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
                        Station {station.stationNo} · {station.authority}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f4c81', display: 'block', marginTop: '2px', lineHeight: 1.2 }}>
                        {station.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Hourly Intensity</span>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: cfg.color, fontFamily: 'monospace', lineHeight: 1.1 }}>
                          {intensity.toFixed(1)}
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginLeft: '3px' }}>mm/hr</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: '99px',
                        background: cfg.bgColor, color: cfg.color, border: `1px solid ${cfg.borderColor}`
                      }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    {/* IMD scale mini-bar */}
                    <div style={{ marginBottom: '7px' }}>
                      <div style={{ display: 'flex', gap: '3px', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                        {['#22c55e','#eab308','#f97316','#ef4444','#a855f7'].map((c, i) => (
                          <div key={i} style={{ flex: 1, background: c, opacity: cfg.priority > i ? 1 : 0.2 }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#94a3b8', marginTop: '2px' }}>
                        <span>Light</span><span>Moderate</span><span>Heavy</span><span>V.Heavy</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      {[
                        { label: 'Instant', val: `${(d?.instantaneousRate ?? 0).toFixed(1)} mm/hr`, color: '#0ea5e9' },
                        { label: 'Daily',   val: `${(d?.dailyCumulative ?? 0).toFixed(1)} mm`,      color: '#1e3a8a' },
                      ].map(t => (
                        <div key={t.label} style={{ flex: 1, background: '#f8fafc', borderRadius: '6px', padding: '4px 5px', textAlign: 'center', border: `1px solid ${t.color}30` }}>
                          <span style={{ fontSize: '8px', color: t.color, fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t.label}</span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', fontFamily: 'monospace' }}>{t.val}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '5px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 700 }}>{station.sensorType}</span>
                      <span style={{ fontSize: '8px', fontWeight: 700, color: isMock ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isMock ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
                        {isMock ? 'Demo Data' : 'Live RTDAS'}
                      </span>
                    </div>
                  </div>
                </Tooltip>

                {/* ── Click Popup ── */}
                <Popup maxWidth={280} className="radar-popup">
                  <div style={{ padding: '4px', minWidth: '240px', fontFamily: 'inherit' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                        {station.authority}
                      </span>
                      <h3 style={{ fontWeight: 900, color: '#0f4c81', fontSize: '13px', margin: '2px 0', lineHeight: 1.2 }}>
                        {station.name}
                      </h3>
                    </div>
                    <p style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.6, borderLeft: '2px solid #e2e8f0', paddingLeft: '8px', marginBottom: '8px', fontStyle: 'italic' }}>
                      {station.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                      <span>📍 {station.location.lat.toFixed(4)}°N, {station.location.lng.toFixed(4)}°E</span>
                      <span style={{ color: isMock ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                        {isMock ? '⚠ Demo' : '● Live'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* CCCSS watermark */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-md text-[9px] tracking-widest font-bold text-slate-500 shadow-sm pointer-events-none">
          CCCSS • SHIVAJI UNIVERSITY KOLHAPUR
        </div>

        {/* IMD legend */}
        <div className="absolute top-2 left-2 z-[1000] bg-white/95 backdrop-blur border border-slate-200 px-3 py-2 rounded-md shadow-sm pointer-events-none">
          <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">IMD Scale</div>
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
