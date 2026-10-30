const weatherCodeMap = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Cloudy', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌦️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Heavy rain showers', icon: '🌧️' },
  82: { label: 'Violent rain showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' }
};

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherEmoji = document.getElementById('weatherEmoji');
const locationName = document.getElementById('locationName');
const currentDate = document.getElementById('currentDate');
const currentTemp = document.getElementById('currentTemp');
const weatherCondition = document.getElementById('weatherCondition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const rainChance = document.getElementById('rainChance');
const hourlyForecast = document.getElementById('hourlyForecast');
const dailyForecast = document.getElementById('dailyForecast');
const errorBanner = document.getElementById('errorBanner');

let currentLocation = { latitude: 23.8103, longitude: 90.4125, name: 'Dhaka' };

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove('hidden');
  setTimeout(() => errorBanner.classList.add('hidden'), 4000);
}

function formatTemperature(value) {
  return `${Math.round(value)}°C`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { hour: 'numeric' });
}

function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString([], { weekday: 'short' });
}

function getWeatherMeta(code) {
  return weatherCodeMap[code] || { label: 'Weather', icon: '🌤️' };
}

async function searchCity(query) {
  const sanitizedQuery = query.trim();
  if (!sanitizedQuery) {
    showError('Please enter a city name.');
    return;
  }

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(sanitizedQuery)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) throw new Error('Unable to find the city.');

    const geoData = await geoResponse.json();
    const result = geoData.results?.[0];

    if (!result) {
      throw new Error('No matching city found. Try another city.');
    }

    currentLocation = {
      latitude: result.latitude,
      longitude: result.longitude,
      name: `${result.name}${result.country ? ', ' + result.country : ''}`
    };

    await loadWeather();
  } catch (error) {
    showError(error.message || 'Could not load weather data.');
  }
}

async function loadWeather() {
  const { latitude, longitude } = currentLocation;

  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather service is unavailable right now.');
    }

    const weatherData = await weatherResponse.json();
    renderWeather(weatherData);
  } catch (error) {
    showError(error.message || 'Something went wrong while fetching the forecast.');
  }
}

function renderWeather(data) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  const currentCodeMeta = getWeatherMeta(current.weather_code);

  locationName.textContent = currentLocation.name;
  currentDate.textContent = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  weatherEmoji.textContent = currentCodeMeta.icon;
  currentTemp.textContent = formatTemperature(current.temperature_2m);
  weatherCondition.textContent = currentCodeMeta.label;
  feelsLike.textContent = formatTemperature(current.apparent_temperature);
  humidity.textContent = `${current.relative_humidity_2m}%`;
  windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  rainChance.textContent = `${current.precipitation ?? 0} mm`;

  const nextHours = hourly.time.slice(0, 8).map((time, index) => ({
    time,
    temp: hourly.temperature_2m[index],
    code: hourly.weather_code[index]
  }));

  hourlyForecast.innerHTML = nextHours
    .map(({ time, temp, code }) => {
      const meta = getWeatherMeta(code);
      return `
        <div class="hour-card">
          <div class="time">${formatTime(time)}</div>
          <div class="icon" aria-hidden="true">${meta.icon}</div>
          <div class="temp">${formatTemperature(temp)}</div>
        </div>
      `;
    })
    .join('');

  const dayRows = daily.time.slice(0, 7).map((day, index) => {
    const meta = getWeatherMeta(daily.weather_code[index]);
    return `
      <div class="day-row">
        <div class="day-name">${index === 0 ? 'Today' : formatDay(day)}</div>
        <div class="day-icon" aria-hidden="true">${meta.icon}</div>
        <div class="day-temp">${formatTemperature(daily.temperature_2m_max[index])} / ${formatTemperature(daily.temperature_2m_min[index])}</div>
      </div>
    `;
  });

  dailyForecast.innerHTML = dayRows.join('');
}

searchBtn.addEventListener('click', () => searchCity(cityInput.value));
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchCity(cityInput.value);
  }
});

document.querySelectorAll('.city-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const city = pill.dataset.city;
    cityInput.value = city;
    searchCity(city);
  });
});

loadWeather();
