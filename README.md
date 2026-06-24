# 🌧 Panchganga Rain Gauge Monitoring System
### Real-Time Hydrological Command Center | 
**Centre for Climate Change and Sustainability Studies (CCCSS)**  
**Shivaji University, Kolhapur**

---

> [!IMPORTANT]
> **Sponsored Project:** Developed under the **DST–SERB, Govt. of India** funded research project:  
> *"IoT and Geoinformatics Based Flood Monitoring and Prediction System for Panchganga River Basin"*

---

## 🏛 Project Overview
This platform serves as a high-fidelity hydrological command center for monitoring real-time rainfall across the Panchganga River Basin. Utilizing a network of **Tipping-Bucket Rain Gauges (RTDAS)**, the system provides sub-minute telemetry updates to aid in academic research, flood awareness, and hydrological modeling.

### 🚀 Key Features
- **Real-Time Telemetry:** Sub-60s data ingestion via ThingSpeak IoT API.
- **Unified GIS Interface:** Interactive map for spatial context and station-specific status.
- **Professional Hyetographs:** High-resolution Time-Series analysis (Intensity vs. Accumulation).
- **Standards-Compliant:** Rainfall classification based on IMD (India Meteorological Department) thresholds.
- **Dynamic Hydration:** Sophisticated algorithm for computing hourly intensity and daily cumulative totals on the client-side.

---

## 🗺 Monitoring Network (Stations)

| ID | Station Name | Short Code | Position (Lat/Lng) |
|---|---|---|---|
| **01** | **CCCSS Master Control** | CCCSS SU | 16.68115, 74.25431 |
| **02** | **Rukadi Station** | RUKADI | 16.72827, 74.35814 |
| **03** | **Pattan Kodoli** | PATTAN | 16.650493, 74.365707 |
| **04** | **Ichalkaranji** | ICHAL | 16.691702, 74.451817 |
| **05** | **Nigave Dhumala** | NIGAVE | 16.745585, 74.208378 |

---

## 🛠 Technical Methodology

### Rainfall Calculations
The dashboard processes raw tipping-bucket data using the following logic:

- **Hourly Intensity ($mm/hr$):** Sum of all positive depth increments captured in the trailing 60-minute window.
- **Instantaneous Rate ($mm/hr$):** Normalized rate based on the most recent interval between consecutive tips.
- **Daily Cumulative ($mm$):** Running total of all rainfall depth measured since **00:00 IST**.

### Data Classification (IMD Standards)
| Category | Intensity Range | UI Indicator |
|---|---|---|
| **No Rain** | $0$ mm/hr | ⬜ Grey |
| **Light Rain** | $0.1 - 2.4$ mm/hr | 🟢 Green |
| **Moderate** | $2.5 - 7.5$ mm/hr | 🟡 Yellow |
| **Rather Heavy** | $7.6 - 15.5$ mm/hr | 🟠 Orange |
| **Heavy Rain** | $15.6 - 64.4$ mm/hr | 🔴 Red |
| **Very Heavy** | $64.5 - 115.5$ mm/hr | 🟣 Violet |
| **Extremely Heavy** | $> 115.5$ mm/hr | ⚫ Black |

---

## 💻 Developer & Credits

- **Principal Investigators:**  
  - **Dr. S. S. Panhalkar** (Director, CCCSS)  
  - **Dr. G. S. Nivhekar**  
- **Lead Developer:**  
  - **Er. Satwik K. Udupi** (Junior Research Fellow, CCCSS SUK)  

---

## 🔧 Installation & Deployment

1. **Clone & Install:**
   ```bash
   git clone https://github.com/satwikcccss-crypto/PanchgangaRainwatch.git
   npm install
   ```
2. **Configure IO:** Edit `src/config/stations.js` to map your ThingSpeak channels.
3. **Run Dev:** `npm run dev`
4. **Production Build:** `npm run build && npm run deploy`

---

## ⚠ Disclaimer
This dashboard is an academic research product. All data is research-derived. For critical flood decisions and emergency response, always refer to official sources like the **WRD Maharashtra**, **IMD**, and **CWC**.

**Copyright © 2026 CCCSS, Shivaji University Kolhapur. All Rights Reserved.**
