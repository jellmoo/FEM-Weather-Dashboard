document.addEventListener("DOMContentLoaded", () => {
  const unitsBtn = document.getElementById("unitsBtn");
  const dropdownMenu = document.getElementById("units-dropdown");
  const locationSearchInput = document.getElementById("locationSearch");
  const locationSearchMenu = document.getElementById("searchResults");
  const searchButton = document.getElementById("searchButton");
  const dayButton = document.getElementById("dayBtn");
  const dayMenu = document.getElementById("dayMenu");

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