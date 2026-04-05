import json
from datetime import datetime, timedelta

def calculate_rolling_rainfall(feeds, field='field1', mode='cumulative'):
    """
    Calculates 1h, 3h, 6h, 12h, and 24h rolling rainfall accumulations.
    Strictly follows Indian Standard (IS) hydrological monitoring logic.
    
    :param feeds: List of ThingSpeak feed dictionaries
    :param field: The field name containing rainfall data
    :param mode: 'cumulative' or 'interval'
    :return: Dictionary with windows and their totals in mm
    """
    if not feeds or len(feeds) < 2:
        return {w: 0.0 for w in ['1h', '3h', '6h', '12h', '24h']}

    # Pre-sort feeds by time
    sorted_feeds = sorted(feeds, key=lambda x: datetime.fromisoformat(x['created_at'].replace('Z', '+00:00')))
    now = datetime.now(sorted_feeds[-1]['created_at'].tzinfo if 'Z' not in sorted_feeds[-1]['created_at'] else None)
    if not now: now = datetime.utcnow()

    windows = {
        '1h':  1,
        '3h':  3,
        '6h':  6,
        '12h': 12,
        '24h': 24
    }
    
    results = {}

    for label, hours in windows.items():
        cutoff = sorted_feeds[-1]['created_at'] # simple approximation using last record
        try:
            last_time = datetime.fromisoformat(sorted_feeds[-1]['created_at'].replace('Z', '+00:00'))
        except:
            last_time = datetime.utcnow()
            
        cutoff_time = last_time - timedelta(hours=hours)
        
        # Filter feeds within this window
        window_feeds = [f for f in sorted_feeds if datetime.fromisoformat(f['created_at'].replace('Z', '+00:00')) >= cutoff_time]
        
        if len(window_feeds) < 2:
            results[label] = 0.0
            continue

        total_mm = 0.0
        if mode == 'cumulative':
            # Sum positive increments to handle daily resets at 00:00 or 08:30 (IS standard)
            for i in range(1, len(window_feeds)):
                prev = float(window_feeds[i-1].get(field, 0) or 0)
                curr = float(window_feeds[i].get(field, 0) or 0)
                increment = curr - prev
                if increment > 0:
                    total_mm += increment
        else:
            # Interval mode: sum each reading directly
            total_mm = sum(float(f.get(field, 0) or 0) for f in window_feeds)
            
        results[label] = round(total_mm, 2)

    return results

# Example Usage:
if __name__ == "__main__":
    # Mock feeds for demonstration
    mock_data = [
        {"created_at": "2026-04-05T10:00:00Z", "field1": "10.0"},
        {"created_at": "2026-04-05T11:00:00Z", "field1": "10.5"},
        {"created_at": "2026-04-05T12:00:00Z", "field1": "12.0"},
        {"created_at": "2026-04-05T13:00:00Z", "field1": "15.5"}
    ]
    
    stats = calculate_rolling_rainfall(mock_data, mode='cumulative')
    print("--- IS Rainfall Analytics (Rolling Windows) ---")
    for win, val in stats.items():
        print(f"{win} Window: {val} mm")
