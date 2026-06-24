import React, { useEffect, useState } from 'react';
import { fetchForecast } from '../../services/forecastAPI';
import { STATIONS } from '../../config/stations';
import { 
  CloudRain, AlertTriangle, Sun, CloudSun, Cloud, CloudFog, 
  CloudDrizzle, CloudLightning, Wind, Thermometer, Droplets, 
  ChevronRight, Compass, Eye, Umbrella
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  BarController, LineController,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  BarController, LineController,
  Title, Tooltip, Legend, Filler
);

// ─── Weather Code Mapper (WMO Standards) ──────────────────────────────────
const getWeatherConfig = (code) => {
  if (code === 0) {
    return {
      icon: <Sun className="w-10 h-10 text-amber-500 animate-[spin_20s_linear_infinite]" />,
      label: 'Clear Sky',
      color: '#eab308',
      bgColor: 'bg-amber-50/40 border-amber-200/50',
      gradient: 'from-amber-500/10 to-orange-500/5'
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      icon: <CloudSun className="w-10 h-10 text-sky-400" />,
      label: 'Partly Cloudy',
      color: '#38bdf8',
      bgColor: 'bg-sky-50/40 border-sky-200/50',
      gradient: 'from-sky-500/10 to-blue-500/5'
    };
  }
  if (code === 45 || code === 48) {
    return {
      icon: <CloudFog className="w-10 h-10 text-slate-400" />,
      label: 'Foggy',
      color: '#94a3b8',
      bgColor: 'bg-slate-50/40 border-slate-200/50',
      gradient: 'from-slate-500/10 to-slate-600/5'
    };
  }
  if (code >= 51 && code <= 55) {
    return {
      icon: <CloudDrizzle className="w-10 h-10 text-teal-400" />,
      label: 'Drizzle',
      color: '#14b8a6',
      bgColor: 'bg-teal-50/40 border-teal-200/50',
      gradient: 'from-teal-500/10 to-emerald-500/5'
    };
  }
  if (code >= 61 && code <= 65) {
    return {
      icon: <CloudRain className="w-10 h-10 text-blue-500" />,
      label: 'Rainy',
      color: '#3b82f6',
      bgColor: 'bg-blue-50/40 border-blue-200/50',
      gradient: 'from-blue-500/10 to-sky-500/5'
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      icon: <CloudRain className="w-10 h-10 text-indigo-500" />,
      label: 'Rain Showers',
      color: '#6366f1',
      bgColor: 'bg-indigo-50/40 border-indigo-200/50',
      gradient: 'from-indigo-500/10 to-purple-500/5'
    };
  }
  if (code >= 95) {
    return {
      icon: <CloudLightning className="w-10 h-10 text-purple-600 animate-bounce" />,
      label: 'Thunderstorm',
      color: '#a855f7',
      bgColor: 'bg-purple-50/40 border-purple-200/50',
      gradient: 'from-purple-500/15 to-indigo-500/5'
    };
  }
  return {
    icon: <Cloud className="w-10 h-10 text-slate-500" />,
    label: 'Overcast',
    color: '#64748b',
    bgColor: 'bg-slate-50/40 border-slate-200/50',
    gradient: 'from-slate-500/10 to-slate-400/5'
  };
};

const ForecastView = () => {
  const [selectedStationId, setSelectedStationId] = useState(STATIONS[0].id);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('temperature'); // 'temperature' | 'wind-humidity'

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const active = STATIONS.find(s => s.id === selectedStationId);
      if (active) {
        const data = await fetchForecast(active.location.lat, active.location.lng);
        setForecast(data);
      }
      setLoading(false);
    };
    loadData();
  }, [selectedStationId]);

  const activeStation = STATIONS.find(s => s.id === selectedStationId) || STATIONS[0];

  if (loading && forecast.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-academic-blue border-t-transparent rounded-full animate-spin" />
        <span className="font-sans text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Meteorology Forecast...</span>
      </div>
    );
  }

  // Get current forecast hour (first item)
  const current = forecast[0] || { temperature: 0, precipitation: 0, humidity: 0, windSpeed: 0, weatherCode: 0 };
  const currentCfg = getWeatherConfig(current.weatherCode);

  // Time labels and dataset values for the next 24 hours of prediction
  const chartLength = Math.min(24, forecast.length);
  const chartForecast = forecast.slice(0, chartLength);
  const labels = chartForecast.map(d => 
    d.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );

  // Chart datasets configuration
  const rainData = chartForecast.map(d => d.precipitation);
  const tempData = chartForecast.map(d => d.temperature);
  const humidityData = chartForecast.map(d => d.humidity);
  const windData = chartForecast.map(d => d.windSpeed);

  const isTemp = activeChart === 'temperature';

  const chartData = {
    labels,
    datasets: isTemp ? [
      {
        type: 'line',
        label: 'Temperature (°C)',
        data: tempData,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: '#ea580c',
        pointHoverRadius: 6,
        tension: 0.3,
        yAxisID: 'y',
      }
    ] : [
      {
        type: 'line',
        label: 'Humidity (%)',
        data: humidityData,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line',
        label: 'Wind Speed (km/h)',
        data: windData,
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointBackgroundColor: '#4f46e5',
        tension: 0.3,
        yAxisID: 'y1',
        order: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
        padding: 10,
        callbacks: {
          label: (item) => {
            let unit = '';
            if (item.dataset.label.includes('Temperature')) unit = ' °C';
            else if (item.dataset.label.includes('Humidity')) unit = ' %';
            else if (item.dataset.label.includes('Wind')) unit = ' km/h';
            return ` ${item.dataset.label}: ${item.raw?.toFixed(1) ?? 0}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 9, weight: '600' },
          color: '#94a3b8',
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 9 },
          color: '#94a3b8',
        },
        title: {
          display: true,
          text: isTemp ? 'Temperature (°C)' : 'Humidity (%)',
          font: { size: 9, weight: '700' },
          color: isTemp ? '#f97316' : '#06b6d4',
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        display: !isTemp,
        grid: { drawOnChartArea: false },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 9 },
          color: '#94a3b8',
        },
        title: {
          display: true,
          text: 'Wind Speed (km/h)',
          font: { size: 9, weight: '700' },
          color: '#6366f1',
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Station Switcher Navigation Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Select Station Forecast:
        </span>
        <div className="flex flex-wrap items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 shadow-inner gap-1">
          {STATIONS.map(s => {
            const isSelected = selectedStationId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStationId(s.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 select-none ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30 scale-[1.02]'
                    : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-400'}`} />
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="w-12 h-12 border-4 border-academic-blue border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Forecast Data...</span>
        </div>
      ) : (
        <>
          {/* ─── Premium Weather Summary Card ─── */}
          <div className={`p-6 md:p-8 rounded-3xl border shadow-sm bg-gradient-to-br ${currentCfg.gradient} bg-white flex flex-col md:flex-row items-center justify-between gap-8 transition-all`}>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-md">
                {currentCfg.icon}
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">
                  CURRENT HOURS CONDITIONS · {activeStation.name}
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-serif text-academic-blue leading-tight uppercase">
                  {currentCfg.label}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Latitude: {activeStation.location.lat.toFixed(4)}°N · Longitude: {activeStation.location.lng.toFixed(4)}°E
                </p>
              </div>
            </div>

            {/* Dynamic Parameter Grid */}
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto min-w-[240px] lg:min-w-[360px]">
              <div className="bg-white/80 border border-slate-100/50 p-4 rounded-2xl shadow-sm text-center">
                <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                <span className="text-[8px] font-black text-slate-400 uppercase block">Temp</span>
                <span className="text-base font-black text-slate-800 font-mono mt-0.5 block">{current.temperature.toFixed(1)}°C</span>
              </div>

              <div className="bg-white/80 border border-slate-100/50 p-4 rounded-2xl shadow-sm text-center">
                <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1.5" />
                <span className="text-[8px] font-black text-slate-400 uppercase block">Humidity</span>
                <span className="text-base font-black text-slate-800 font-mono mt-0.5 block">{current.humidity}%</span>
              </div>

              <div className="bg-white/80 border border-slate-100/50 p-4 rounded-2xl shadow-sm text-center">
                <Wind className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
                <span className="text-[8px] font-black text-slate-400 uppercase block">Wind</span>
                <span className="text-base font-black text-slate-800 font-mono mt-0.5 block">{current.windSpeed.toFixed(1)} km/h</span>
              </div>
            </div>
          </div>

          {/* ─── Horizontal Hourly Forecast Carousel ─── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-3">
              <h3 className="text-xs font-black font-serif text-academic-blue uppercase tracking-widest">
                Hourly Timeline — {activeStation.shortName} (24h)
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Scroll for details <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300">
              {forecast.slice(0, 24).map((h, i) => {
                const cfg = getWeatherConfig(h.weatherCode);
                return (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 w-[120px] p-4 rounded-2xl border bg-white flex flex-col items-center text-center transition-all hover:-translate-y-0.5 shadow-sm border-slate-200/60`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block mb-2">
                      {h.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    <div className="mb-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                      {cfg.icon}
                    </div>

                    <span className="text-[9px] font-black uppercase text-slate-700 tracking-tight block mb-3 h-6 flex items-center justify-center leading-none">
                      {cfg.label}
                    </span>

                    <div className="w-full pt-2 border-t border-slate-100 space-y-1.5 font-mono text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">T:</span>
                        <span className="text-slate-700">{h.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">W:</span>
                        <span className="text-indigo-500">{h.windSpeed.toFixed(1)}km/h</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">H:</span>
                        <span className="text-cyan-500">{h.humidity}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Interactive Multi-Axis Chart Card ─── */}
          <div className="academic-panel p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <CloudRain className="w-5 h-5 text-academic-blue" />
                <div>
                  <h2 className="text-sm font-bold font-serif text-academic-blue uppercase tracking-tight">
                    Meteorological Dynamics: {activeStation.shortName}
                  </h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Visualizing Next 24 Hours of Forecast Data
                  </p>
                </div>
              </div>

              {/* Chart selector tabs */}
              <div className="flex items-center bg-slate-100/85 p-1 rounded-xl border border-slate-200/50 shadow-inner gap-1">
                <button
                  onClick={() => setActiveChart('temperature')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                    isTemp 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30 scale-[1.02]' 
                      : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
                  }`}
                >
                  Temperature
                </button>
                <button
                  onClick={() => setActiveChart('wind-humidity')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                    !isTemp 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30 scale-[1.02]' 
                      : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
                  }`}
                >
                  Wind & Humidity
                </button>
              </div>
            </div>

            <div className="h-[400px]">
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ForecastView;
