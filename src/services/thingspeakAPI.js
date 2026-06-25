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
  getRollingStats,
  buildTimeSeries,
} from '../utils/rainfallCalculations';
import { deobfuscate } from '../utils/security';

const DEFAULT_FIELD = THINGSPEAK_FIELDS.rainfall;
// ─── Fetch raw feeds from ThingSpeak ──────────────────────────────────────
const fetchRawFeeds = async (station) => {
  const decryptedChannel = deobfuscate(station.channelId);
  const decryptedKey = deobfuscate(station.apiKey);
  const url = `${THINGSPEAK_API_BASE}/${decryptedChannel}/feeds.json`;
  const response = await axios.get(url, {
    params: { api_key: decryptedKey, minutes: 1440 },
    timeout: 15000,
  });
  return response.data.feeds || [];
};

const fetchChannelStatus = async (station) => {
  const decryptedChannel = deobfuscate(station.channelId);
  const decryptedKey = deobfuscate(station.apiKey);
  const url = `${THINGSPEAK_API_BASE}/${decryptedChannel}/status.json`;
  try {
    const response = await axios.get(url, {
      params: { api_key: decryptedKey },
      timeout: 8000,
    });
    const feeds = response.data.feeds || response.data.updates || [];
    if (feeds.length > 0) {
      const sorted = [...feeds].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return sorted[0].status || 'active';
    }
  } catch (error) {
    console.warn(`[ThingSpeak] Failed to fetch status for ${station.name}:`, error.message);
  }
  return 'active';
};

// ─── Parse feeds into dashboard-ready data object ─────────────────────────
const parseFeeds = (feeds, station, channelStatus = 'active') => {
  if (!feeds || feeds.length === 0) return generateMockData(station);

  const sorted = [...feeds].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const latest = sorted[0];

  const field = station.field || DEFAULT_FIELD;
  const hourlyIntensity   = calculateHourlyIntensity(feeds, field);
  const instantaneousRate = calculateInstantaneousRate(feeds, field);
  const dailyCumulative   = calculateDailyCumulative(feeds, field);
  const rollingStats      = getRollingStats(feeds, field);
  const imdLevel          = classifyRainfall(hourlyIntensity);
  const timeSeries        = buildTimeSeries(feeds, field, 12); // Past 12h for hyetograph

  return {
    stationId:          station.id,
    stationName:        station.name,
    timestamp:          latest.created_at || new Date().toISOString(),
    hourlyIntensity,       // mm/hr — used for IMD classification
    instantaneousRate,     // mm/hr — most recent interval rate
    dailyCumulative,       // mm — total today since midnight IST
    rollingStats,          // { '1h', '3h', '6h', '12h', '24h' }
    rawLatestValue:     parseFloat(latest[field]) || 0,
    imdLevel,
    timeSeries,
    batteryVoltage:     station.channelId === '3081641' ? null : (parseFloat(latest[THINGSPEAK_FIELDS.batteryVoltage]) || null),
    temperature:        station.channelId === '3081641' ? (parseFloat(latest['field6']) || null) : (parseFloat(latest[THINGSPEAK_FIELDS.temperature]) || null),
    signalStrength:     station.channelId === '3081641' ? (parseFloat(latest['field7']) || null) : (parseFloat(latest[THINGSPEAK_FIELDS.signalStrength]) || null),
    status: channelStatus,
    isMockData: false,
  };
};

const generateLiveMeteoTimeSeries = (station, rainValue) => {
  const now = Date.now();
  const baseIntensity = rainValue;
  return Array.from({ length: 12 }, (_, i) => {
    const hoursAgo = 12 - i;
    const t = new Date(now - hoursAgo * 3600000);
    const intensity = parseFloat(Math.max(0, baseIntensity + (Math.random() - 0.5) * 0.2).toFixed(2));
    return {
      time: t,
      timeLabel: t.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
      increment: parseFloat((intensity * 0.1).toFixed(2)),
      intensity,
      cumulative: parseFloat((intensity * (i + 1) * 0.5).toFixed(2)),
      rawValue: intensity
    };
  });
};

// ─── Fetch one station ─────────────────────────────────────────────────────
export const fetchStation = async (stationId) => {
  const station = STATIONS.find(s => s.id === stationId);
  if (!station) throw new Error(`Station ${stationId} not found`);

  if (isPlaceholderKey(deobfuscate(station.channelId))) {
    return generateMockData(station);
  }

  try {
    const [feeds, channelStatus] = await Promise.all([
      fetchRawFeeds(station),
      fetchChannelStatus(station)
    ]);

    const field = station.field || DEFAULT_FIELD;
    const hasData = feeds && feeds.some(f => f[field] !== null && f[field] !== undefined);

    if (!hasData) {
      // Fallback: Fetch actual current weather/precipitation and daily sum from Open-Meteo API
      try {
        const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${station.location.lat}&longitude=${station.location.lng}&current=precipitation,temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=Asia%2FKolkata&forecast_days=1`;
        const omResponse = await axios.get(omUrl);
        const current = omResponse.data?.current || {};
        const daily = omResponse.data?.daily || {};
        const rain = current.precipitation || 0;
        const dailyRain = (daily.precipitation_sum && daily.precipitation_sum[0] !== undefined) ? daily.precipitation_sum[0] : rain;
        const temp = current.temperature_2m || 25.0;
        const hum = current.relative_humidity_2m || 75;

        return {
          stationId:          station.id,
          stationName:        station.name,
          timestamp:          new Date().toISOString(),
          hourlyIntensity:    rain,
          instantaneousRate:  rain,
          dailyCumulative:    dailyRain, // Daily rainfall sum today (00:00 to 24:00)
          rawLatestValue:     rain,
          imdLevel:           classifyRainfall(rain),
          timeSeries:         generateLiveMeteoTimeSeries(station, rain),
          batteryVoltage:     null,
          temperature:        temp,
          signalStrength:     92,
          status:             'active',
          isMockData:         false,
          dataSource:         'Open-Meteo Live API'
        };
      } catch (omErr) {
        console.warn(`[Open-Meteo Fallback] Failed for ${station.name}, using mock data:`, omErr.message);
        return generateMockData(station);
      }
    }

    return parseFeeds(feeds, station, channelStatus);
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
