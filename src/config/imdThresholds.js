/**
 * IMD RAINFALL INTENSITY CLASSIFICATION
 * Source: India Meteorological Department (IMD), Pune
 *
 * Thresholds are based on hourly rainfall intensity (mm/hr).
 * Used across all CCCSS Panchganga Basin rain gauge stations.
 *
 * Reference: IMD Standard Operating Procedure for Rainfall Warning Criteria
 */

export const IMD_LEVELS = {
  no_rain: {
    id: 'no_rain',
    label: 'No Rain',
    labelMr: 'पाऊस नाही',
    minMmHr: 0,
    maxMmHr: 0.0,
    color: '#94a3b8',
    bgColor: 'rgba(148,163,184,0.1)',
    borderColor: 'rgba(148,163,184,0.3)',
    icon: '⬜',
    priority: 0,
    description: 'No measurable rainfall',
    descriptionMr: 'कोणताही मापन करण्यायोग्य पाऊस नाही',
    actions: [],
  },
  light: {
    id: 'light',
    label: 'Light Rain',
    labelMr: 'हलका पाऊस',
    minMmHr: 0.1,
    maxMmHr: 2.4,
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.3)',
    icon: '🟢',
    priority: 1,
    description: 'Light rainfall — no immediate action required',
    descriptionMr: 'हलका पाऊस — तात्काळ कारवाई आवश्यक नाही',
    actions: ['Monitor conditions', 'Update station logs'],
  },
  moderate: {
    id: 'moderate',
    label: 'Moderate Rain',
    labelMr: 'मध्यम पाऊस',
    minMmHr: 2.5,
    maxMmHr: 7.5,
    color: '#eab308',
    bgColor: 'rgba(234,179,8,0.1)',
    borderColor: 'rgba(234,179,8,0.3)',
    icon: '🟡',
    priority: 2,
    description: 'Moderate rainfall — watch for localised ponding',
    descriptionMr: 'मध्यम पाऊस — स्थानिक जलसाठ्याकडे लक्ष द्या',
    actions: [
      'Monitor basin runoff',
      'Alert downstream water-level stations',
      'Check drainage clearance',
    ],
  },
  rather_heavy: {
    id: 'rather_heavy',
    label: 'Rather Heavy',
    labelMr: 'जड पाऊस',
    minMmHr: 7.6,
    maxMmHr: 15.5,
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.1)',
    borderColor: 'rgba(249,115,22,0.3)',
    icon: '🟠',
    priority: 3,
    description: 'Rather heavy rain — activate preliminary flood watch',
    descriptionMr: 'जड पाऊस — प्राथमिक पूर निगराणी सुरू करा',
    actions: [
      'Activate flood watch',
      'Alert local authorities',
      'Monitor tributaries closely',
      'Prepare evacuation routes',
    ],
  },
  heavy: {
    id: 'heavy',
    label: 'Heavy Rain',
    labelMr: 'अति जड पाऊस',
    minMmHr: 15.6,
    maxMmHr: 64.4,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
    icon: '🔴',
    priority: 4,
    description: 'Heavy rain — HIGH ALERT. Flood risk significant.',
    descriptionMr: 'अति जड पाऊस — उच्च सतर्कता. पूराचा धोका महत्त्वपूर्ण.',
    actions: [
      'Issue Red Alert',
      'Alert WRD Maharashtra / CWC',
      'Prepare evacuations for low-lying areas',
      'Close flood-prone river crossings',
      'Activate Emergency Operations Centre',
    ],
  },
  very_heavy: {
    id: 'very_heavy',
    label: 'Very Heavy',
    labelMr: 'अत्यंत जड पाऊस',
    minMmHr: 64.5,
    maxMmHr: 115.5,
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.1)',
    borderColor: 'rgba(168,85,247,0.3)',
    icon: '🟣',
    priority: 5,
    description: 'Very heavy rain — EXTREME ALERT. Imminent flood risk.',
    descriptionMr: 'अत्यंत जड पाऊस — अत्यंत सतर्कता. तात्काळ पूराचा धोका.',
    actions: [
      'Issue Purple / Extreme Alert',
      'Immediate evacuation of flood-prone zones',
      'Coordinate with NDRF / SDRF',
      'Suspend all non-essential river crossings',
    ],
  },
  extreme: {
    id: 'extreme',
    label: 'Extremely Heavy',
    labelMr: 'अत्यंत धोकादायक पाऊस',
    minMmHr: 115.6,
    maxMmHr: Infinity,
    color: '#1e293b',
    bgColor: 'rgba(30,41,59,0.1)',
    borderColor: 'rgba(30,41,59,0.4)',
    icon: '⚫',
    priority: 6,
    description: 'Extremely heavy rain — CATASTROPHIC RISK. EVACUATE NOW.',
    descriptionMr: 'अत्यंत धोकादायक पाऊस — आत्ता स्थलांतर करा.',
    actions: [
      'EVACUATE IMMEDIATELY',
      'All-agency emergency response',
      'NDRF rapid deployment',
      'Do not enter flood zones',
    ],
  },
};

/**
 * Classify rainfall intensity (mm/hr) → IMD level key
 * @param {number} mmPerHr — Hourly rainfall intensity in mm/hr
 * @returns {string} — key of IMD_LEVELS
 */
export const classifyRainfall = (mmPerHr) => {
  if (!mmPerHr || mmPerHr <= 0)    return 'no_rain';
  if (mmPerHr <= 2.4)              return 'light';
  if (mmPerHr <= 7.5)              return 'moderate';
  if (mmPerHr <= 15.5)             return 'rather_heavy';
  if (mmPerHr <= 64.4)             return 'heavy';
  if (mmPerHr <= 115.5)            return 'very_heavy';
  return 'extreme';
};

/**
 * Get IMD config object for a given rainfall intensity
 */
export const getIMDConfig = (mmPerHr) => {
  const key = classifyRainfall(mmPerHr);
  return IMD_LEVELS[key] || IMD_LEVELS.no_rain;
};

/**
 * Get IMD config by key
 */
export const getIMDConfigByKey = (key) => IMD_LEVELS[key] || IMD_LEVELS.no_rain;

/**
 * Determine the highest alert across multiple stations
 */
export const getNetworkAlertLevel = (stationDataMap) => {
  if (!stationDataMap || typeof stationDataMap !== 'object') return 'no_rain';
  let maxPriority = 0;
  let maxKey = 'no_rain';
  Object.values(stationDataMap).forEach(d => {
    if (!d || !d.imdLevel) return;
    const cfg = IMD_LEVELS[d.imdLevel];
    if (cfg && cfg.priority > maxPriority) {
      maxPriority = cfg.priority;
      maxKey = d.imdLevel;
    }
  });
  return maxKey;
};

// Emergency contacts (same as Floodwatch for consistency)
export const EMERGENCY_CONTACTS = [
  { name: 'Flood Control Room',   phone: '1070',          available: '24x7' },
  { name: 'Police Control Room',  phone: '100',           available: '24x7' },
  { name: 'Disaster Management',  phone: '108',           available: '24x7' },
  { name: 'WRD Maharashtra',      phone: '022-22027990',  available: 'Office Hours' },
  { name: 'IMD Pune',             phone: '020-25535435',  available: 'Office Hours' },
];

export const ALERT_FORM_URL = 'https://forms.gle/GAZjQs2jCN8zafsWA'; // update if needed
