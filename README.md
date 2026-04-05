# 🌧 Panchganga Rain Gauge Dashboard

**Real-time tipping-bucket rain gauge monitoring for the Panchganga River Basin**  
Developed by: **Centre for Climate Change and Sustainability Studies (CCCSS), Shivaji University, Kolhapur**  
Project: DST–SERB Sponsored — *IoT & Geoinformatics Based Flood Monitoring System*

---

## 🗺 Stations

| No. | Name | Latitude | Longitude |
|-----|------|----------|-----------|
| 1 | CCCSS Master Control (SU Campus) | 16.68115 | 74.25431 |
| 2 | Rukadi | 16.72827 | 74.35814 |
| 3 | Pattan Kodoli | 16.650493 | 74.365707 |
| 4 | Ichalkaranji | 16.691702 | 74.451817 |
| 5 | Nigave Dhumala | 16.745585 | 74.208378 |

---

## 🔧 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure ThingSpeak channels
Edit `src/config/stations.js` — fill in `channelId` and `apiKey` for each station:
```js
{
  id: 'master_control',
  channelId: 'YOUR_ACTUAL_CHANNEL_ID',  // ← replace
  apiKey:    'YOUR_READ_API_KEY',        // ← replace
}
```

### 3. Confirm hardware constants
Edit `src/config/stations.js`:
```js
export const TIP_VOLUME_MM = 0.2;    // mm per tip — confirm with hardware
export const DATA_MODE = 'cumulative'; // 'cumulative' | 'interval'
```

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to GitHub Pages
```bash
npm run deploy
```

---

## 📊 Rainfall Calculations

| Metric | How it's calculated |
|--------|---------------------|
| **Hourly Intensity** (mm/hr) | Sum of positive increments in last 60 minutes |
| **Instantaneous Rate** (mm/hr) | Latest increment ÷ time interval × 3600 |
| **Daily Cumulative** (mm) | Total positive increments since midnight IST |

> ⚠ All calculations handle daily reset (cumulative counter → 0 at midnight) and sensor noise by ignoring negative increments.

---

## 🎨 IMD Classification

| Category | Intensity | Colour |
|----------|-----------|--------|
| No Rain | 0 mm/hr | ⬜ Grey |
| Light | 0.1–2.4 mm/hr | 🟢 Green |
| Moderate | 2.5–7.5 mm/hr | 🟡 Yellow |
| Rather Heavy | 7.6–15.5 mm/hr | 🟠 Orange |
| Heavy | 15.6–64.4 mm/hr | 🔴 Red |
| Very Heavy | 64.5–115.5 mm/hr | 🟣 Violet |
| Extremely Heavy | >115.5 mm/hr | ⚫ Black |

---

## 🔗 Integration with CCCSS Dashboard

Embed in the CCCSS-SUK-dashboard via iframe:
```html
<iframe
  src="https://satwikcccss-crypto.github.io/PanchgangaRaingauge/"
  width="100%" height="100%"
  frameborder="0"
  title="Panchganga Rain Gauge Dashboard"
/>
```

---

## ⚠ Disclaimer
This dashboard is under active development. All data is academic and research-derived for awareness purposes only. Official flood decisions must be based on IMD / WRD / CWC authoritative sources.
