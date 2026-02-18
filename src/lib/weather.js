/**
 * OpenWeather API Integration
 * Fetches real-time weather data for destinations
 */

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// City name to OpenWeather city ID mapping (major tourist destinations)
const CITY_IDS = {
  'shimla': 1256237,
  'manali': 1264976,
  'ladakh': 1264976, // Uses Leh
  'leh': 1264976,
  'kashmir': 1255634, // Srinagar
  'srinagar': 1255634,
  'gulmarg': 1255634,
  'pahalgam': 1255634,
  'auli': 1278083, // Uses Joshimath
  'jaipur': 1269515,
  'udaipur': 1253986,
  'jaisalmer': 1269570,
  'jodhpur': 1268865,
  'goa': 1271157,
  'kerala': 1269843, // Kochi
  'kochi': 1269843,
  'munnar': 1262331,
  'alleppey': 1278987,
  'switzerland': 2657896, // Zurich
  'zurich': 2657896,
  'iceland': 3413829, // Reykjavik
  'reykjavik': 3413829,
  'dubai': 292223,
  'maldives': 1282027, // Male
  'male': 1282027,
  'thailand': 1609350, // Bangkok
  'bangkok': 1609350,
  'bali': 1645528, // Denpasar
  'denpasar': 1645528,
  'singapore': 1880252,
  'vietnam': 1581130, // Hanoi
  'hanoi': 1581130,
  'delhi': 1273294,
  'mumbai': 1275339,
  'bangalore': 1277333,
  'chennai': 1264527,
  'kolkata': 1275004,
  'hyderabad': 1269843,
  'pune': 1259229,
  'ahmedabad': 1279233
};

// Cache for weather data (30 minutes)
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get current weather for a destination
 */
export async function getCurrentWeather(destinationId) {
  const cityId = CITY_IDS[destinationId.toLowerCase()];
  
  if (!cityId) {
    console.warn(`No city ID found for ${destinationId}`);
    return null;
  }

  // Check cache
  const cacheKey = `weather-${destinationId}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');
    return getSimulatedWeather(destinationId);
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?id=${cityId}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    const weatherData = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      visibility: data.visibility / 1000, // Convert to km
      pressure: data.main.pressure,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString()
    };

    // Cache the result
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getSimulatedWeather(destinationId);
  }
}

/**
 * Get 5-day forecast for a destination
 */
export async function getWeatherForecast(destinationId) {
  const cityId = CITY_IDS[destinationId.toLowerCase()];
  
  if (!cityId || !OPENWEATHER_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?id=${cityId}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Group by day and get daily highs/lows
    const dailyForecast = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          temps: [],
          descriptions: [],
          icons: []
        };
      }
      dailyForecast[date].temps.push(item.main.temp);
      dailyForecast[date].descriptions.push(item.weather[0].description);
      dailyForecast[date].icons.push(item.weather[0].icon);
    });

    // Process daily data
    const forecast = Object.entries(dailyForecast).slice(0, 5).map(([date, data]) => ({
      date,
      high: Math.round(Math.max(...data.temps)),
      low: Math.round(Math.min(...data.temps)),
      description: data.descriptions[Math.floor(data.descriptions.length / 2)],
      icon: data.icons[Math.floor(data.icons.length / 2)]
    }));

    return forecast;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
}

/**
 * Get weather icon URL
 */
export function getWeatherIconUrl(iconCode, size = '2x') {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}

/**
 * Determine current season based on month and location
 */
export function getCurrentSeason(destinationId) {
  const month = new Date().getMonth() + 1; // 1-12
  const destId = destinationId.toLowerCase();
  
  // Hill stations (Himachal, Kashmir, Uttarakhand)
  const hillStations = ['shimla', 'manali', 'ladakh', 'leh', 'kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'auli', 'nainital', 'mussoorie'];
  
  if (hillStations.includes(destId)) {
    if (month >= 12 || month <= 2) return { season: 'Winter', type: 'winter' };
    if (month >= 6 && month <= 9) return { season: 'Monsoon', type: 'monsoon' };
    return { season: 'Summer', type: 'summer' };
  }
  
  // Rajasthan, Gujarat (Desert)
  const desert = ['jaipur', 'udaipur', 'jaisalmer', 'jodhpur', 'bikaner'];
  if (desert.includes(destId)) {
    if (month >= 4 && month <= 6) return { season: 'Summer', type: 'summer' };
    if (month >= 7 && month <= 9) return { season: 'Monsoon', type: 'monsoon' };
    return { season: 'Winter', type: 'winter' };
  }
  
  // Kerala, Goa, Coastal
  const coastal = ['goa', 'kerala', 'kochi', 'munnar', 'alleppey'];
  if (coastal.includes(destId)) {
    if (month >= 6 && month <= 9) return { season: 'Monsoon', type: 'monsoon' };
    if (month >= 3 && month <= 5) return { season: 'Summer', type: 'summer' };
    return { season: 'Winter', type: 'winter' };
  }
  
  // Default for India
  if (month >= 3 && month <= 5) return { season: 'Summer', type: 'summer' };
  if (month >= 6 && month <= 9) return { season: 'Monsoon', type: 'monsoon' };
  return { season: 'Winter', type: 'winter' };
}

/**
 * Simulated weather data when API is not available
 */
function getSimulatedWeather(destinationId) {
  const destId = destinationId.toLowerCase();
  const season = getCurrentSeason(destId);
  
  // Base temperatures by season
  const baseTemps = {
    summer: { temp: 32, feelsLike: 35 },
    winter: { temp: 18, feelsLike: 16 },
    monsoon: { temp: 26, feelsLike: 28 }
  };
  
  // Adjust for destination type
  let adjustment = 0;
  const hillStations = ['shimla', 'manali', 'ladakh', 'leh', 'kashmir', 'auli'];
  const coldPlaces = ['switzerland', 'iceland'];
  const hotPlaces = ['jaisalmer', 'dubai'];
  
  if (hillStations.includes(destId)) adjustment = -15;
  else if (coldPlaces.includes(destId)) adjustment = -10;
  else if (hotPlaces.includes(destId)) adjustment = +8;
  
  const base = baseTemps[season.type];
  
  return {
    temperature: base.temp + adjustment,
    feelsLike: base.feelsLike + adjustment,
    humidity: season.type === 'monsoon' ? 85 : 60,
    description: season.type === 'summer' ? 'clear sky' : season.type === 'monsoon' ? 'light rain' : 'few clouds',
    icon: season.type === 'summer' ? '01d' : season.type === 'monsoon' ? '10d' : '02d',
    windSpeed: 3.5,
    visibility: 10,
    pressure: 1013,
    sunrise: '06:30 AM',
    sunset: '06:45 PM',
    updatedAt: new Date().toISOString(),
    isSimulated: true
  };
}

/**
 * Get weather-appropriate packing suggestions
 */
export function getPackingSuggestions(destinationId, weather) {
  const season = getCurrentSeason(destinationId);
  const suggestions = [];
  
  if (season.type === 'winter' || weather.temperature < 15) {
    suggestions.push('Warm jackets and thermals');
    suggestions.push('Woolen socks and gloves');
    suggestions.push('Sturdy boots for snow');
  }
  
  if (season.type === 'summer' || weather.temperature > 30) {
    suggestions.push('Light cotton clothes');
    suggestions.push('Sunscreen and sunglasses');
    suggestions.push('Hat or cap');
  }
  
  if (season.type === 'monsoon') {
    suggestions.push('Umbrella and raincoat');
    suggestions.push('Waterproof bags');
    suggestions.push('Quick-dry clothes');
  }
  
  suggestions.push('Comfortable walking shoes');
  suggestions.push('Personal medications');
  
  return suggestions;
}

export default {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherIconUrl,
  getCurrentSeason,
  getPackingSuggestions
};
