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

  function fetchWeather() {
    if (!selectedLocation.latitude || !selectedLocation.longitude) {
      console.warn("No location selected yet.");
      return;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.latitude}&longitude=${selectedLocation.longitude}&current_weather=true&timezone=${selectedLocation.timezone}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("Full weather response:", data);
        console.log("Weather data:", data);

        if (data.current_weather) {
          const temp = data.current_weather.temperature;
          const wind = data.current_weather.windspeed;
          const windUnit = data.current_weather_units.windspeed || "km/h";

          // Update the existing HTML elements with the weather data
          document.getElementById("currentTemperature").textContent = `${temp}°`;
          document.getElementById("windSpeed").textContent = `${wind} ${windUnit}`;
          
          // Update additional current weather data if available
          if (data.current) {
            const feelsLike = data.current.apparent_temperature;
            const humidity = data.current.relative_humidity_2m;
            const precipitation = data.current.precipitation;
            
            if (feelsLike !== undefined) {
              document.getElementById("feelsLikeTemp").textContent = `${feelsLike}°`;
            }
            if (humidity !== undefined) {
              document.getElementById("humidityLevel").textContent = `${humidity}%`;
            }
            if (precipitation !== undefined) {
              document.getElementById("precipitationAmount").textContent = `${precipitation} mm`;
            }
          }
        }
      })
      .catch(error => console.error("Error fetching weather:", error));
  }

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

                // Call fetchWeather after selecting location - THIS WAS MISSING
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