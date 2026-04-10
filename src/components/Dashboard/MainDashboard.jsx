import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldAlert, Activity, Globe, Info, BookOpen,
  AlertCircle, Phone, Clock, Radio, CloudRain, Droplets,
} from 'lucide-react';
import HeaderBar from './HeaderBar';
import NetworkSensors from './NetworkSensors';
import AlertBanner from '../Alerts/AlertBanner';
import QRRegistration from '../Alerts/QRRegistration';
import { SimpleRainIndicator, DetailedAnalyticsModal, QuickRainWidgetModal } from '../RainGauge/RainGaugeWidget';
import RainfallChart from '../Charts/RainfallChart';
import StatsOverview from './StatsOverview';
import ErrorBoundary from './ErrorBoundary';
import { fetchAllStations } from '../../services/thingspeakAPI';
import { STATIONS, POLL_INTERVAL_MS } from '../../config/stations';
import { getNetworkAlertLevel } from '../../config/imdThresholds';
import InteractiveMap from '../Map/InteractiveMap';

/* ─── Project Info Sidebar ─────────────────────────────────────────────── */
const InfoPanel = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="overlay"
        />
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="info-sidebar p-8 flex flex-col gap-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold font-serif text-academic-blue flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" /> PROJECT INFO
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-red-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> OWNERSHIP & DEVELOPMENT
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              This dashboard is the intellectual property of the{' '}
              <strong className="text-academic-blue">
                Centre for Climate Change and Sustainability Studies (CCCSS)
              </strong>
              , <strong>Shivaji University, Kolhapur</strong>. All data, results, and visual
              representations are owned by CCCSS.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> SPONSORED PROJECT
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Developed under the <strong>DST–SERB, Govt. of India</strong> sponsored research project:
            </p>
            <p className="text-[11px] font-mono text-academic-blue my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-inner leading-relaxed">
              "IoT and Geoinformatics Based Flood Monitoring and Prediction System for Panchganga River Basin"
            </p>
            <p className="text-sm text-slate-600">
              Under the guidance of <strong>Dr. S. S. Panhalkar</strong> &amp; <strong>Dr. G. S. Nivhekar</strong>.<br />
              Developed by <strong>Er. Satwik K. Udupi</strong>.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> DATA ACQUISITION
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Rainfall data is captured by <strong>tipping-bucket rain gauges</strong> installed at 5
              stations across the Panchganga Basin. Telemetry is transmitted via{' '}
              <strong>ThingSpeak IoT API</strong>. Hourly intensity and instantaneous rainfall rate are
              computed on-client using Rainfall Classification standards.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <CloudRain className="w-4 h-4" /> RAINFALL CLASSIFICATION
            </h3>
            <div className="space-y-1.5">
              {[
                { label: 'Light Rain',       range: '0.1 – 2.4 mm/hr',   color: '#22c55e' },
                { label: 'Moderate',         range: '2.5 – 7.5 mm/hr',   color: '#eab308' },
                { label: 'Rather Heavy',     range: '7.6 – 15.5 mm/hr',  color: '#f97316' },
                { label: 'Heavy Rain',       range: '15.6 – 64.4 mm/hr', color: '#ef4444' },
                { label: 'Very Heavy',       range: '64.5 – 115.5 mm/hr',color: '#a855f7' },
                { label: 'Extremely Heavy',  range: '> 115.5 mm/hr',     color: '#1e293b' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  <span className="text-[10px] text-slate-400 ml-auto font-mono">{item.range}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> ACADEMIC DISCLAIMER
            </h3>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This dashboard is developed by CCCSS, Shivaji University and is currently{' '}
              <strong>under active development</strong>. All data is <strong>academic and research-derived</strong>{' '}
              — for awareness purposes only. Official flood decisions must rely on official government sources.
              <br /><br />
              Data and site ownership: <strong>CCCSS, Shivaji University, Kolhapur</strong>.
              Unauthorised reproduction is prohibited.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> EMERGENCY HOTLINES
            </h3>
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
              {[
                { label: 'Flood Control Room',  num: '1070' },
                { label: 'Police Control Room', num: '100'  },
                { label: 'Disaster Management', num: '108'  },
                { label: 'WRD Maharashtra',     num: '022-22027990' },
                { label: 'Meteorological Dept', num: '020-25535435' },
              ].map((c, i, arr) => (
                <div key={c.label}
                  className={`flex justify-between font-bold text-slate-700 py-2 ${i < arr.length - 1 ? 'border-b border-slate-200' : ''}`}
                >
                  <span>{c.label}</span>
                  <a href={`tel:${c.num}`} className="text-academic-blue hover:underline">{c.num}</a>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ─── Disclaimer Footer ────────────────────────────────────────────────── */
const DisclaimerFooter = () => (
  <div className="border-t border-slate-200 bg-amber-50/60 px-4 lg:px-8 py-3 text-center">
    <p className="text-[10px] text-amber-800 font-medium leading-relaxed max-w-5xl mx-auto">
      <strong>⚠ Academic Disclaimer:</strong> This dashboard is developed by CCCSS, Shivaji University Kolhapur
      and is under active development. Data is academic and research-derived — for awareness purposes only.
      Official emergency decisions must rely on official government sources.
      Site &amp; data ownership: <strong>CCCSS, Shivaji University, Kolhapur</strong>. |{' '}
      <span className="text-amber-700 font-bold">
        Demo data shown until ThingSpeak channels are configured.
      </span>
    </p>
  </div>
);

/* ─── Main Dashboard ───────────────────────────────────────────────────── */
const MainDashboard = () => {
  const [stationData,     setStationData]     = useState(
    STATIONS.reduce((acc, s) => ({ ...acc, [s.id]: { hourlyIntensity: 0, dailyCumulative: 0 } }), {})
  );
  const [loading,         setLoading]         = useState(true);
  const [lastUpdate,      setLastUpdate]      = useState(null);
  const [selectedId,      setSelectedId]      = useState(STATIONS[0].id);
  const [isAboutOpen,     setIsAboutOpen]     = useState(false);
  const [shuffledStations, setShuffledStations] = useState(STATIONS);
  const [detailedStation, setDetailedStation] = useState(null);
  const [quickStation,    setQuickStation]    = useState(null);
  const [activeView,      setActiveView]      = useState('home'); // 'home' | 'network'

  // Keep selected station first in the right-column list
  useEffect(() => {
    const active = STATIONS.find(s => s.id === selectedId);
    if (active) setShuffledStations([active, ...STATIONS.filter(s => s.id !== selectedId)]);
  }, [selectedId]);

  // Data polling
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllStations();
        setStationData(data);
        setLastUpdate(
          new Date().toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
        );
      } catch (err) {
        console.error('Failed to fetch station data:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const networkAlertKey = getNetworkAlertLevel(stationData);
  const selectedStation = STATIONS.find(s => s.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col pt-8">
      <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 flex-grow pb-8">
        
        <HeaderBar
          connectionStatus={loading ? 'offline' : 'online'}
          lastUpdateTime={lastUpdate}
          onAboutClick={() => setIsAboutOpen(true)}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* ── View Switcher Content ── */}
        <div className="mt-4">
          {activeView === 'home' ? (
            <div className="space-y-6">
              <AlertBanner imdLevelKey={networkAlertKey} />
              
              {/* Station summary cards (Floodwatch Plates) */}
              <StatsOverview 
                stationData={stationData}
                selectedId={selectedId}
                onStationClick={(id) => {
                  setSelectedId(id);
                  setQuickStation(STATIONS.find(s => s.id === id));
                }}
              />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Column (Chart/Map) */}
                <div className="xl:col-span-8 space-y-6">
                  <div className="academic-panel p-6 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
                      <div>
                        <h3 className="text-base font-bold font-serif text-academic-blue uppercase tracking-tight flex items-center gap-2">
                          <Activity className="w-5 h-5 group-hover:animate-pulse" />
                          Rainfall Intensity Time-Series
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {STATIONS.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedId(s.id)}
                            className={`auth-button ${selectedId === s.id ? 'active' : ''}`}
                          >
                            {s.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ErrorBoundary label="Rainfall Intensity Chart">
                        <RainfallChart
                          stationData={stationData[selectedId]}
                          stationName={selectedStation?.name}
                        />
                      </ErrorBoundary>
                    </div>
                  </div>

                  <div className="h-[440px]">
                    <ErrorBoundary label="Interactive Map">
                      <InteractiveMap
                        stationData={stationData}
                        selectedId={selectedId}
                        onStationClick={(id) => {
                          setSelectedId(id);
                          setQuickStation(STATIONS.find(s => s.id === id));
                        }}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Right Column (Live Sidebar Plates) */}
                <div className="xl:col-span-4 space-y-4">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <h3 className="text-xs font-black font-serif text-academic-blue uppercase tracking-widest">
                       Live Station Gauges
                    </h3>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded shadow-sm flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> RTDAS 
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {STATIONS.map(s => (
                      <SimpleRainIndicator
                        key={s.id}
                        station={s}
                        data={stationData[s.id]}
                        active={selectedId === s.id}
                        onClick={() => {
                          setSelectedId(s.id);
                          setDetailedStation(s);
                        }}
                      />
                    ))}
                  </div>

                  {/* Technical Export Utility removed as per request */}
                  
                  <QRRegistration />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <ErrorBoundary label="Sensor Network View">
                <NetworkSensors 
                  stationData={stationData} 
                  onViewAnalytics={(s) => setDetailedStation(s)}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>

      <DisclaimerFooter />

      {/* Modals Selection Logic (Defensive Hydration) */}
      <InfoPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      
      {quickStation && (
        <QuickRainWidgetModal
          station={quickStation}
          data={stationData?.[quickStation.id] || null}
          onClose={() => setQuickStation(null)}
        />
      )}

      {detailedStation && (
        <DetailedAnalyticsModal
          station={detailedStation}
          data={stationData?.[detailedStation.id] || null}
          onClose={() => setDetailedStation(null)}
        />
      )}
    </div>
  );
};

export default MainDashboard;
