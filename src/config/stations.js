/**
 * RAIN GAUGE STATION CONFIGURATION — PanchgangaRaingauge
 * Centre for Climate Change and Sustainability Studies (CCCSS)
 * Shivaji University, Kolhapur
 *
 * Data Source: Tipping-bucket rain gauge via ThingSpeak API
 * Sensor Type: Tipping-bucket rain gauge (0.2 mm / tip — verify on hardware)
 * Coordinates: WGS84 Decimal Degrees
 *
 * ⚠ DEVELOPER NOTE:
 *   1. Replace channelId and apiKey for each station before deployment.
 *   2. Confirm TIP_VOLUME_MM matches your hardware (usually 0.2 or 0.5 mm/tip).
 *   3. Confirm which ThingSpeak field carries rainfall data (default: field1).
 *   4. If ThingSpeak stores cumulative mm (not tip counts), set DATA_MODE = 'cumulative'.
 *      If it stores per-interval mm, set DATA_MODE = 'interval'.
 */

// ─── Hardware Constants ────────────────────────────────────────────────────
export const TIP_VOLUME_MM  = 0.2;   // mm of rainfall per tip — CONFIRM with hardware
export const DATA_MODE      = 'cumulative';  // 'cumulative' | 'interval'
export const POLL_INTERVAL_MS = 60000;       // 60-second refresh

// ─── ThingSpeak Field Mapping ──────────────────────────────────────────────
export const THINGSPEAK_FIELDS = {
  rainfall:        'field1',   // cumulative rainfall (mm) or tip count
  batteryVoltage:  'field2',   // optional
  temperature:     'field3',   // optional ambient temp
  signalStrength:  'field4',   // optional RSSI
};

export const THINGSPEAK_API_BASE = 'https://api.thingspeak.com/channels';

// ─── Station Registry ──────────────────────────────────────────────────────
export const STATIONS = [
  {
    id: 'master_control',
    stationNo: 1,
    name: 'CCCSS Master Control',
    shortName: 'SU-RTDAS-01',
    channelId: '2487311',
    apiKey:    'V6X1W6B8X6X1W6B8',
    sensorType: 'Tipping-Bucket Rain Gauge',
    location: { lat: 16.68115, lng: 74.25431 },
    district: 'Kolhapur',
    authority: 'CCCSS, Shivaji University',
    imageUrl: '/master_control_station_1775374499978.png',
    description: 'Master control rain gauge installed at CCCSS, Shivaji University campus. Primary calibration reference.',
  },
  {
    id: 'rukadi',
    stationNo: 2,
    name: 'Rukadi Station',
    shortName: 'AGRI-RG-02',
    channelId: 'YOUR_CHANNEL_ID_2',
    apiKey:    'YOUR_API_KEY_2',
    sensorType: 'Ultra-Precision Rain Sensor (0.1mm)',
    location: { lat: 16.72827, lng: 74.35814 },
    district: 'Kolhapur',
    authority: 'CCCSS, Shivaji University',
    imageUrl: '/rukadi_station_placeholder_1775374522730.png',
    description: 'Monitoring mid-basin rainfall contributing to the Panchganga mainstream.',
  },
  {
    id: 'pattan_kodoli',
    stationNo: 3,
    name: 'Pattan Kodoli Station',
    shortName: 'PRB-RG-03',
    channelId: 'YOUR_CHANNEL_ID_3',
    apiKey:    'YOUR_API_KEY_3',
    sensorType: 'Tipping-Bucket Rain Gauge',
    location: { lat: 16.650493, lng: 74.365707 },
    district: 'Kolhapur',
    authority: 'CCCSS, Shivaji University',
    imageUrl: '/master_control_station_1775374499978.png',
    description: 'Southern sub-basin rain gauge at Pattan Kodoli.',
  },
  {
    id: 'ichalkaranji',
    stationNo: 4,
    name: 'Ichalkaranji Station',
    shortName: 'IND-RG-04',
    channelId: 'YOUR_CHANNEL_ID_4',
    apiKey:    'YOUR_API_KEY_4',
    sensorType: 'Tipping-Bucket Rain Gauge',
    location: { lat: 16.691702, lng: 74.451817 },
    district: 'Kolhapur',
    authority: 'CCCSS, Shivaji University',
    imageUrl: '/rukadi_station_placeholder_1775374522730.png',
    description: 'Downstream rain gauge at Ichalkaranji industrial node.',
  },
  {
    id: 'nigave_dhumala',
    stationNo: 5,
    name: 'Nigave Dhumala Station',
    shortName: 'HW-RG-05',
    channelId: 'YOUR_CHANNEL_ID_5',
    apiKey:    'YOUR_API_KEY_5',
    sensorType: 'Tipping-Bucket Rain Gauge',
    location: { lat: 16.745585, lng: 74.208378 },
    district: 'Kolhapur',
    authority: 'CCCSS, Shivaji University',
    imageUrl: '/master_control_station_1775374499978.png',
    description: 'Northern sub-basin rain gauge at Nigave Dhumala.',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
export const getStationById   = (id)   => STATIONS.find(s => s.id === id);
export const isPlaceholderKey = (key)  => !key || key.startsWith('YOUR_');
