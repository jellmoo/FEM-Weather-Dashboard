document.addEventListener("DOMContentLoaded", () => {


const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

async function getWeather() {
    try {
        const response = await fetch(url);
        const data = await response.json();

    console.log("Current weather:");
    console.log("Temperature:", data.current.temperature_2m, "°C");
    console.log("Wind speed:", data.current.wind_speed_10m, "km/h");

    console.log("\nHourly forecast:");
    console.log("Times:", data.hourly.time.slice(0, 5)); // first 5 times
    console.log("Temperatures:", data.hourly.temperature_2m.slice(0, 5)); // first 5 temps
  } catch (error) {
    console.error("Error fetching weather:", error);

    }
}
console.log(getWeather())

let unitsBtn = document.getElementById("unitsBtn");
let dropdownMenu = document.getElementById("units-dropdown");
let locationSearchInput = document.getElementById("locationSearch");
let locationSearchMenu = document.getElementById("searchResults"); // add in html

unitsBtn.addEventListener("click", function() {
  // dropdownMenu.style.display = "none";
  if (dropdownMenu.style.display == "flex") {
    dropdownMenu.style.display = "none";
  } else {
    dropdownMenu.style.display = "flex";
  }
});

});

locationSearchInput.addEventListener("keydown", function() {

})