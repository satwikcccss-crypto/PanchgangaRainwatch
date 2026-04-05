/**
 * THINGSPEAK API SERVICE — Panchganga Rain Gauge Network
 * Handles all data fetching, parsing, and mock fallback.
 */

import axios from 'axios';
import { STATIONS, THINGSPEAK_FIELDS, THINGSPEAK_API_BASE, isPlaceholderKey } from '../config/stations';
import { classifyRainfall } from '../config/imdThresholds';
import {
  calculateHourlyIntensity,
  calculateInstantaneousRate,
  calculateDailyCumulative,
  buildTimeSeries,
} from '../utils/rainfallCalculations';

const FIELD = THINGSPEAK_FIELDS.rainfall;

// ─── Fetch raw feeds from ThingSpeak ──────────────────────────────────────
const fetchRawFeeds = async (station, results = 200) => {
  const url = `${THINGSPEAK_API_BASE}/${station.channelId}/feeds.json`;
  const response = await axios.get(url, {
    params: { api_key: station.apiKey, results },
    timeout: 12000,
  });
  return response.data.feeds || [];
};

// ─── Parse feeds into dashboard-ready data object ─────────────────────────
const parseFeeds = (feeds, station) => {
  if (!feeds || feeds.length === 0) return generateMockData(station);

  const sorted = [...feeds].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const latest = sorted[0];

  const hourlyIntensity   = calculateHourlyIntensity(feeds, FIELD);
  const instantaneousRate = calculateInstantaneousRate(feeds, FIELD);
  const dailyCumulative   = calculateDailyCumulative(feeds, FIELD);
  const imdLevel          = classifyRainfall(hourlyIntensity);
  const timeSeries        = buildTimeSeries(feeds, FIELD, 6);

  return {
    stationId:          station.id,
    stationName:        station.name,
    timestamp:          latest.created_at || new Date().toISOString(),
    hourlyIntensity,       // mm/hr — used for IMD classification
    instantaneousRate,     // mm/hr — most recent interval rate
    dailyCumulative,       // mm — total today since midnight IST
    rawLatestValue:     parseFloat(latest[FIELD]) || 0,
    imdLevel,
    timeSeries,
    batteryVoltage:     parseFloat(latest[THINGSPEAK_FIELDS.batteryVoltage]) || null,
    temperature:        parseFloat(latest[THINGSPEAK_FIELDS.temperature])    || null,
    signalStrength:     parseFloat(latest[THINGSPEAK_FIELDS.signalStrength]) || null,
    status: 'active',
    isMockData: false,
  };
};

// ─── Fetch one station ─────────────────────────────────────────────────────
export const fetchStation = async (stationId) => {
  const station = STATIONS.find(s => s.id === stationId);
  if (!station) throw new Error(`Station ${stationId} not found`);

  if (isPlaceholderKey(station.channelId)) {
    return generateMockData(station);
  }

  try {
    const feeds = await fetchRawFeeds(station, 200);
    return parseFeeds(feeds, station);
  } catch (error) {
    console.error(`[ThingSpeak] Failed to fetch ${station.name}:`, error.message);
    return { ...generateMockData(station), fetchError: error.message };
  }
};

// ─── Fetch all stations in parallel ───────────────────────────────────────
export const fetchAllStations = async () => {
  const results = await Promise.allSettled(
    STATIONS.map(s => fetchStation(s.id))
  );

  return results.reduce((acc, result, i) => {
    const station = STATIONS[i];
    acc[station.id] = result.status === 'fulfilled'
      ? result.value
      : { ...generateMockData(station), fetchError: result.reason?.message };
    return acc;
  }, {});
};

// ─── Mock data generator (used until ThingSpeak channels are configured) ──
const MOCK_INTENSITIES = {
  master_control:  4.2,   // moderate
  rukadi:          0.8,   // light
  pattan_kodoli:  18.5,   // heavy
  ichalkaranji:    0.0,   // no rain
  nigave_dhumala: 10.2,   // rather heavy
};

const generateMockData = (station) => {
  const baseIntensity = MOCK_INTENSITIES[station.id] ?? 2.0;
  const jitter = (Math.random() - 0.5) * 0.6;
  const hourlyIntensity   = Math.max(0, parseFloat((baseIntensity + jitter).toFixed(2)));
  const instantaneousRate = Math.max(0, parseFloat((hourlyIntensity + (Math.random() - 0.5) * 1.5).toFixed(2)));
  const dailyCumulative   = parseFloat((hourlyIntensity * (6 + Math.random() * 4)).toFixed(2));
  const imdLevel          = classifyRainfall(hourlyIntensity);

  // Synthetic time series for charts
  const now = Date.now();
  const timeSeries = Array.from({ length: 72 }, (_, i) => {
    const minutesAgo = (72 - i) * 5;
    const t = new Date(now - minutesAgo * 60000);
    const angle = (t.getHours() * 60 + t.getMinutes()) / 60 * (Math.PI / 6);
    const sinFactor = Math.max(0, Math.sin(angle) * 0.6 + 0.4);
    const intensity = parseFloat(
      Math.max(0, baseIntensity * sinFactor + (Math.random() - 0.5) * 1.0).toFixed(2)
    );
    return {
      time: t,
      timeLabel: t.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
      increment:  parseFloat((intensity * (5 / 60)).toFixed(3)),
      intensity,
      cumulative: parseFloat((intensity * (minutesAgo / 60)).toFixed(2)),
      rawValue: 0,
    };
  });

  return {
    stationId:        station.id,
    stationName:      station.name,
    timestamp:        new Date().toISOString(),
    hourlyIntensity,
    instantaneousRate,
    dailyCumulative,
    rawLatestValue:   0,
    imdLevel,
    timeSeries,
    batteryVoltage:   parseFloat((11.5 + Math.random() * 1.5).toFixed(2)),
    temperature:      parseFloat((28 + Math.random() * 5).toFixed(1)),
    signalStrength:   Math.floor(55 + Math.random() * 45),
    status: 'active',
    isMockData: true,
  };
};
