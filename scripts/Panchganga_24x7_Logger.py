import requests
import csv
import time
import os
from datetime import datetime

# ─── CONFIGURATION ───────────────────────────────────────────────────────────
# Stations matching the dashboard STATIONS registry
STATIONS = [
    {"id": "master_control", "name": "MASTER CONTROL", "channel_id": "2487311", "api_key": "V6X1W6B8X6X1W6B8"},
    {"id": "rukadi",         "name": "RUKADI",         "channel_id": "YOUR_ID",    "api_key": "YOUR_KEY"},
    {"id": "pattan_kodoli",  "name": "PATTAN KODOLI",  "channel_id": "YOUR_ID",    "api_key": "YOUR_KEY"},
    {"id": "ichalkaranji",   "name": "ICHALKARANJI",   "channel_id": "YOUR_ID",    "api_key": "YOUR_KEY"},
    {"id": "nigave_dhumala", "name": "NIGAVE DHUMALA", "channel_id": "YOUR_ID",    "api_key": "YOUR_KEY"},
]

# Field Mapping (ThingSpeak Fields)
FIELDS = {
    'rainfall':        'field1',
    'battery_voltage': 'field2',
    'temperature':     'field3',
    'signal_strength': 'field4'
}

LOG_FILE = "Panchganga_Master_Log.csv"
POLL_INTERVAL_SEC = 300  # 5 Minutes (Standard for Hydrological IoT)

# ─── LOGGING ENGINE ──────────────────────────────────────────────────────────
def initialize_log():
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, mode='w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                "Timestamp_Local", "Station_Name", "Station_ID", 
                "Rainfall_Input", "Battery_V", "Temp_C", "Signal_RSSI"
            ])
        print(f"[INIT] Created new log file: {LOG_FILE}")

def log_reading(row):
    with open(LOG_FILE, mode='a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(row)

def fetch_telemetry(station):
    url = f"https://api.thingspeak.com/channels/{station['channel_id']}/feeds.json"
    params = {'api_key': station['api_key'], 'results': 1}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        feeds = response.json().get('feeds', [])
        
        if not feeds:
            return None
            
        latest = feeds[0]
        return [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            station['name'],
            station['id'],
            latest.get(FIELDS['rainfall'], 0),
            latest.get(FIELDS['battery_voltage'], 'N/A'),
            latest.get(FIELDS['temperature'], 'N/A'),
            latest.get(FIELDS['signal_strength'], 'N/A')
        ]
    except Exception as e:
        print(f"[ERROR] Failed to fetch {station['name']}: {str(e)}")
        return None

def run_logger():
    print("🚀 Panchganga 24/7 Autonomous Data Logger Started")
    print(f"📡 Polling {len(STATIONS)} stations every {POLL_INTERVAL_SEC}s...")
    initialize_log()
    
    while True:
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] Starting batch sync...")
        
        for station in STATIONS:
            if station['channel_id'] == "YOUR_ID":
                # Skip dummy IDs
                continue
                
            reading = fetch_telemetry(station)
            if reading:
                log_reading(reading)
                print(f"  ✅ Saved: {station['name']}")
            time.sleep(1) # Simple rate limit protection
            
        print(f"[{timestamp}] Sync complete. Sleeping for {POLL_INTERVAL_SEC}s.")
        time.sleep(POLL_INTERVAL_SEC)

if __name__ == "__main__":
    try:
        run_logger()
    except KeyboardInterrupt:
        print("\n🛑 Logger stopped by user.")
