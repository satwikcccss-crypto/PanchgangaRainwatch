import axios from 'axios';

// Coordinates roughly covering the Panchganga Basin (Kolhapur)
const LATITUDE = 16.7;
const LONGITUDE = 74.2;

export const fetchForecast = async (latitude = LATITUDE, longitude = LONGITUDE) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FKolkata&forecast_days=2`;
    const response = await axios.get(url);
    
    if (response.data && response.data.hourly) {
      const { time, precipitation, temperature_2m, relative_humidity_2m, wind_speed_10m, weather_code } = response.data.hourly;
      
      // Map to an array of objects
      const forecastData = time.map((t, index) => ({
        time: new Date(t),
        precipitation: precipitation[index] || 0,
        temperature: temperature_2m[index] || 0,
        humidity: relative_humidity_2m[index] || 0,
        windSpeed: wind_speed_10m[index] || 0,
        weatherCode: weather_code[index] || 0
      }));

      // Filter only future times
      const now = new Date();
      now.setMinutes(0, 0, 0); // truncate to hour
      
      return forecastData.filter(d => d.time >= now);
    }
    return [];
  } catch (error) {
    console.error('[Forecast] Failed to fetch open-meteo forecast:', error);
    return [];
  }
};

export const fetchGridRainfall = async () => {
  // 5x5 grid covering the basin
  const lats = [16.63, 16.66, 16.69, 16.72, 16.76];
  const lngs = [74.19, 74.26, 74.33, 74.40, 74.47];
  const gridPoints = [];
  lats.forEach(lat => {
    lngs.forEach(lng => {
      gridPoints.push({ lat, lng });
    });
  });

  const latitudeQuery = gridPoints.map(p => p.lat).join(',');
  const longitudeQuery = gridPoints.map(p => p.lng).join(',');

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitudeQuery}&longitude=${longitudeQuery}&current=precipitation&timezone=Asia%2FKolkata`;
    const response = await axios.get(url);
    
    if (Array.isArray(response.data)) {
      return response.data.map((item) => ({
        lat: item.latitude,
        lng: item.longitude,
        rainfall: item.current?.precipitation || 0
      }));
    } else if (response.data && response.data.current) {
      return [{
        lat: response.data.latitude,
        lng: response.data.longitude,
        rainfall: response.data.current.precipitation || 0
      }];
    }
    return [];
  } catch (error) {
    console.error('[Forecast] Failed to fetch grid rainfall:', error);
    return [];
  }
};
