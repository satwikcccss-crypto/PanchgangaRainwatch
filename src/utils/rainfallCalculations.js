/**
 * RAINFALL CALCULATION ENGINE
 * Panchganga Rain Gauge Network — CCCSS, Shivaji University
 *
 * ⚠ IMPORTANT — HOW TIPPING BUCKET DATA WORKS ON THINGSPEAK:
 *
 *  MODE: 'cumulative' (default)
 *    ThingSpeak stores cumulative mm since last reset (usually midnight IST).
 *    Each record = total mm so far today.
 *    Increment = current_reading - previous_reading (ignore negatives = daily reset)
 *
 *  MODE: 'interval'
 *    ThingSpeak stores mm fallen in that specific logging interval.
 *    Sum the last N records directly for cumulative.
 *
 * All calculations derive from POSITIVE increments only to handle:
 *   • Daily resets (cumulative counter goes back to 0 at midnight)
 *   • Spurious negative readings from sensor noise
 */

import { DATA_MODE, TIP_VOLUME_MM } from '../config/stations';

/**
 * Extract mm increment from two sequential ThingSpeak feeds
 * @param {string|number} prevVal — previous field value
 * @param {string|number} currVal — current field value
 * @returns {number} — mm fallen between readings (always ≥ 0)
 */
const safeIncrement = (prevVal, currVal) => {
  const prev = parseFloat(prevVal) || 0;
  const curr = parseFloat(currVal) || 0;
  const diff = curr - prev;
  return diff > 0 ? diff : 0; // skip negatives (daily reset / noise)
};

/**
 * Convert tip counts to mm (only used if sensor sends raw tip counts)
 */
export const tipsToMm = (tipCount) => tipCount * TIP_VOLUME_MM;

/**
 * Calculate hourly rainfall intensity (mm/hr)
 * Sums all positive increments in the past 60 minutes.
 *
 * @param {Array} feeds — ThingSpeak feed array [{created_at, field1, ...}]
 * @param {string} field — ThingSpeak field name (default: 'field1')
 * @returns {number} — hourly intensity in mm/hr
 */
export const calculateHourlyIntensity = (feeds, field = 'field1') => {
  if (!feeds || feeds.length < 2) return 0;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Filter + sort ascending by timestamp
  const recent = feeds
    .filter(f => new Date(f.created_at) >= oneHourAgo && f[field] != null)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (recent.length < 2) return 0;

  if (DATA_MODE === 'cumulative') {
    let total = 0;
    for (let i = 1; i < recent.length; i++) {
      total += safeIncrement(recent[i - 1][field], recent[i][field]);
    }
    return parseFloat(total.toFixed(2));
  } else {
    // interval mode: each record already IS mm for that interval, sum directly
    return parseFloat(
      recent.reduce((sum, f) => sum + (parseFloat(f[field]) || 0), 0).toFixed(2)
    );
  }
};

/**
 * Calculate instantaneous rainfall rate (mm/hr)
 * Uses the two most recent records to derive a per-hour rate.
 *
 * @param {Array} feeds — sorted descending (latest first) ThingSpeak feeds
 * @param {string} field — ThingSpeak field name
 * @returns {number} — instantaneous rate in mm/hr
 */
export const calculateInstantaneousRate = (feeds, field = 'field1') => {
  if (!feeds || feeds.length < 2) return 0;

  const sorted = [...feeds].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const latest   = sorted[0];
  const previous = sorted[1];

  if (!latest[field] || !previous[field]) return 0;

  const mmIncrement = DATA_MODE === 'cumulative'
    ? safeIncrement(previous[field], latest[field])
    : parseFloat(latest[field]) || 0;

  if (mmIncrement === 0) return 0;

  const t1 = new Date(previous.created_at);
  const t2 = new Date(latest.created_at);
  const intervalHrs = (t2 - t1) / (1000 * 3600);

  if (intervalHrs <= 0) return 0;

  return parseFloat((mmIncrement / intervalHrs).toFixed(2));
};

/**
 * Calculate daily cumulative rainfall (mm)
 * Sums all positive increments since midnight IST.
 *
 * @param {Array} feeds — all feeds for today
 * @param {string} field
 * @returns {number} — total mm since midnight IST
 */
export const calculateDailyCumulative = (feeds, field = 'field1') => {
  if (!feeds || feeds.length < 1) return 0;

  const nowIST = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const midnightIST = new Date(nowIST);
  midnightIST.setHours(0, 0, 0, 0);

  const todayFeeds = feeds
    .filter(f => {
      const t = new Date(new Date(f.created_at).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      return t >= midnightIST && f[field] != null;
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (DATA_MODE === 'cumulative') {
    if (todayFeeds.length === 0) return 0;
    // last reading - first reading of the day (handles midnight reset)
    const first = parseFloat(todayFeeds[0][field]) || 0;
    const last  = parseFloat(todayFeeds[todayFeeds.length - 1][field]) || 0;
    return parseFloat(Math.max(0, last - first).toFixed(2));
  } else {
    return parseFloat(
      todayFeeds.reduce((s, f) => s + (parseFloat(f[field]) || 0), 0).toFixed(2)
    );
  }
};

/**
 * Build time-series array for the chart
 * Returns [{time, intensity, cumulative}] for the past `hoursBack` hours
 *
 * @param {Array} feeds
 * @param {string} field
 * @param {number} hoursBack
 */
export const buildTimeSeries = (feeds, field = 'field1', hoursBack = 6) => {
  if (!feeds || feeds.length < 2) return [];

  const cutoff = new Date(Date.now() - hoursBack * 3600 * 1000);
  const sorted = feeds
    .filter(f => new Date(f.created_at) >= cutoff && f[field] != null)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const result = [];
  let runningCumulative = 0;

  for (let i = 1; i < sorted.length; i++) {
    const increment = DATA_MODE === 'cumulative'
      ? safeIncrement(sorted[i - 1][field], sorted[i][field])
      : parseFloat(sorted[i][field]) || 0;

    const t1 = new Date(sorted[i - 1].created_at);
    const t2 = new Date(sorted[i].created_at);
    const intervalHrs = (t2 - t1) / (1000 * 3600);
    const intensity = intervalHrs > 0
      ? parseFloat((increment / intervalHrs).toFixed(2))
      : 0;

    runningCumulative += increment;

    result.push({
      time: new Date(sorted[i].created_at),
      timeLabel: new Date(sorted[i].created_at).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }),
      increment: parseFloat(increment.toFixed(2)),
      intensity,                                         // mm/hr (instantaneous)
      cumulative: parseFloat(runningCumulative.toFixed(2)),
      rawValue: parseFloat(sorted[i][field]) || 0,
    });
  }

  return result;
};
