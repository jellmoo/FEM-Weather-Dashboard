document.addEventListener("DOMContentLoaded", () => {
  const unitsBtn = document.getElementById("unitsBtn");
  const dropdownMenu = document.getElementById("units-dropdown");
  const locationSearchInput = document.getElementById("locationSearch");
  const locationSearchMenu = document.getElementById("searchResults");
  const searchButton = document.getElementById("searchButton");
  const dayButton = document.getElementById("dayBtn");
  const dayMenu = document.getElementById("dayMenu");
  const resultsGrid = document.getElementById("resultsGrid");

  let selectedLocation = {
    name: "",
    latitude: null,
    longitude: null,
    timezone: ""
  };

  // map icons weather codes to icon paths
  function getWeatherIcon(code) {
    if (code === 0) return "assets/images/icon-sunny.webp";
    if (code === 1 || code === 2) return "assets/images/icon-partly-cloudy.webp";
    if (code === 3) return "assets/images/icon-overcast.webp";
    if (code === 45 || code === 48) return "assets/images/icon-fog.webp";
    if ([51, 53, 55].includes(code)) return "assets/images/icon-drizzle.webp";
    if ([61, 63, 65, 80, 81, 82].includes(code)) return "assets/images/icon-rain.webp";
    if ([71, 73, 75, 77].includes(code)) return "assets/images/icon-snow.webp";
    if ([95, 96, 99].includes(code)) return "assets/images/icon-storm.webp";
    return "assets/images/icon-sunny.webp"; // fallback
  }

  function fetchWeather() {
    if (!selectedLocation.latitude || !selectedLocation.longitude) {
      console.warn("No location selected yet.");
      return;
    }

    const tz = selectedLocation.timezone || "auto";
    const url = `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${selectedLocation.latitude}` +
      `&longitude=${selectedLocation.longitude}` +
      `&current_weather=true` +
      `&hourly=apparent_temperature,relative_humidity_2m,precipitation,windspeed_10m,temperature_2m,weathercode` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
      `&temperature_unit=celsius` +
      `&wind_speed_unit=kmh` +
      `&precipitation_unit=mm` +
      `&timezone=${encodeURIComponent(tz)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("Full weather response:", data);

        // current weather
        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const wind = Math.round(data.current_weather.windspeed);
          const iconPath = getWeatherIcon(data.current_weather.weathercode);

          document.getElementById("currentTemperature").textContent = `${temp}°`;
          document.getElementById("windSpeed").textContent = `${wind} km/h`;
          document.getElementById("currentWeatherIcon").src = iconPath;
        }

        // hourly weather
        if (data.hourly && Array.isArray(data.hourly.time)) {
          const hourlyContainer = document.getElementById("hourlyForecast");
          hourlyContainer.innerHTML = "";

          for (let i = 0; i < 12; i++) {
            const time = new Date(data.hourly.time[i]).getHours();
            const temp = Math.round(data.hourly.temperature_2m[i]);
            const code = data.hourly.weathercode[i];
            const iconPath = getWeatherIcon(code);

            const item = document.createElement("div");
            item.classList.add("hourly-item");
            item.innerHTML = `
              <div class="hourly-forecast-details">
                <img src="${iconPath}" alt="Weather" class="hourly-weather-icon">
                <time class="hourly-time-label">${time}:00</time>
              </div>
              <span class="hourly-temperature">${temp}°</span>
            `;
            hourlyContainer.appendChild(item);
          }
        }

        // daily weather
        if (data.daily && Array.isArray(data.daily.time)) {
          const dailyContainer = document.getElementById("dailyForecast");
          dailyContainer.innerHTML = "";

          for (let i = 0; i < data.daily.time.length; i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const max = Math.round(data.daily.temperature_2m_max[i]);
            const min = Math.round(data.daily.temperature_2m_min[i]);
            const code = data.daily.weathercode[i];
            const iconPath = getWeatherIcon(code);

            const item = document.createElement("div");
            item.classList.add("daily-item");
            item.innerHTML = `
              <span class="forecast-day-label">${dayName}</span>
              <img src="${iconPath}" alt="Weather" class="daily-forecast-icon">
              <div class="daily-forecast-temps">
                <span class="daily-forecast-temp">${max}°</span>
                <span class="daily-forecast-temp low">${min}°</span>
              </div>
            `;
            dailyContainer.appendChild(item);
          }
        }
      })
      .catch(error => console.error("Error fetching weather:", error));
  }

  // location search
  locationSearchInput.addEventListener("input", (event) => {
    let value = event.target.value.trim();

    if (value !== "") {
      locationSearchMenu.style.display = "flex";

      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=5`)
        .then(response => response.json())
        .then(data => {
          resultsGrid.innerHTML = "";

          if (data.results && data.results.length > 0) {
            data.results.forEach(result => {
              const resultDiv = document.createElement("div");
              resultDiv.classList.add("result-item");
              resultDiv.textContent = `${result.name}, ${result.country}`;

              resultDiv.addEventListener("click", () => {
                console.log("User selected:", result);
                locationSearchInput.value = `${result.name}, ${result.country}`;
                document.getElementById("currentLocation").textContent = `${result.name}, ${result.country}`;
                locationSearchMenu.style.display = "none";

                selectedLocation = {
                  name: result.name,
                  latitude: result.latitude,
                  longitude: result.longitude,
                  timezone: result.timezone
                };

                fetchWeather();
              });

              resultsGrid.appendChild(resultDiv);
            });
          } else {
            resultsGrid.innerHTML = `<div class="result-item no-results">No matches found</div>`;
          }
        })
        .catch(error => console.error("Error:", error));
    } else {
      locationSearchMenu.style.display = "none";
      resultsGrid.innerHTML = "";
    }
  });

  //dropdown menu
  function closeAllMenus() {
    dropdownMenu.style.display = "none";
    dayMenu.style.display = "none";
    locationSearchMenu.style.display = "none";
  }

  function setupMenuToggle(button, menu) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = menu.style.display === "flex";
      closeAllMenus();
      menu.style.display = isOpen ? "none" : "flex";
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.style.display = "none";
      }
    });
  }

  setupMenuToggle(unitsBtn, dropdownMenu);
  setupMenuToggle(dayButton, dayMenu);

  locationSearchInput.addEventListener("keydown", () => {
    locationSearchMenu.style.display = "flex";
  });

  searchButton.addEventListener("click", () => {
    locationSearchMenu.style.display = "none";
  });

  document.addEventListener("click", (event) => {
    if (!locationSearchMenu.contains(event.target) &&
        !locationSearchInput.contains(event.target)) {
      locationSearchMenu.style.display = "none";
    }
  });
});