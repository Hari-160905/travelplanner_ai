const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function getWeatherForCity(city) {
  if (!city || !API_KEY) return null;

  const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Weather unavailable');
  }

  const data = await response.json();
  const current = data.list?.[0];

  if (!current) {
    return null;
  }

  return {
    city: data.city?.name || city,
    icon: current.weather?.[0]?.icon || '01d',
    description: current.weather?.[0]?.description || 'Clear skies',
    temperature: Math.round(current.main?.temp ?? 0),
    humidity: current.main?.humidity ?? 0,
    chanceOfRain: Math.round((current.pop ?? 0) * 100),
    windSpeed: Math.round(current.wind?.speed ?? 0),
  };
}
