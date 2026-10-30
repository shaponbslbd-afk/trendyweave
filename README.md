# TrendyWeave Weather Dashboard

A simple weather dashboard built with vanilla HTML, CSS, and JavaScript. It fetches current and forecast data from the public Open-Meteo API.

## Features

- Search weather by city
- Quick-access buttons for popular cities
- Current temperature, humidity, wind speed, and precipitation
- 8-hour hourly forecast
- 7-day daily forecast
- No API key required

## Run locally

Because this is a static site, you can serve it with any simple HTTP server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Project files

- `index.html` — dashboard layout
- `styles.css` — dashboard styling
- `script.js` — weather fetching and rendering logic

## API used

- Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com
- Open-Meteo Forecast API: https://api.open-meteo.com

This project is designed to run entirely in the browser and does not require a backend or API key.
