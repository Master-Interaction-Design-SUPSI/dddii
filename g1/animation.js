(function() {
  window.addEventListener("load", function() {
    if (!window.map) {
      console.error("Map not initialized");
      return;
    }

    const animationLayerGroup = L.layerGroup().addTo(window.map);
    let animationTimeouts = [];
    let animationRunning = false; // Stato dell'animazione

    function clearAnimatedRoutes() {
      animationTimeouts.forEach(timerId => clearTimeout(timerId));
      animationTimeouts = [];
      animationLayerGroup.clearLayers();
      animationRunning = false;
    }

    function animateRoute(features) {
      if (animationRunning) {
        clearAnimatedRoutes(); // Se l'animazione è già in corso, la resetta
      }
      animationRunning = true;

      features.forEach((feature, index) => {
        const timerId = setTimeout(() => {
          L.geoJSON(feature, {
            style: {
              color: 'cyan',
              weight: 1,
              opacity: 0.5
            }
          }).addTo(animationLayerGroup);
        }, index * 200); // Velocità dell'animazione
        animationTimeouts.push(timerId);
      });

      // Fermare l'animazione dopo che tutte le rotte sono state mostrate
      setTimeout(() => {
        animationRunning = false;
      }, features.length * 200);
    }

    function loadAndAnimateRoutes() {
      if (window.currentRouteLayer) {
        window.map.removeLayer(window.currentRouteLayer);
        window.currentRouteLayer = null;
      }
      clearAnimatedRoutes();

      const monthAbbrev = (window.months && window.months[window.currentMonthIndex]
                          ? window.months[window.currentMonthIndex]
                          : "January").slice(0, 3);
      const monthFile = `geojson/VE_${monthAbbrev}.geojson`;

      fetch(monthFile)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            animateRoute(data.features);
          } else {
            console.warn("No routes found in file:", monthFile);
          }
        })
        .catch(error => console.error("Error loading geojson file:", error));
    }

    // Listener per la barra spaziatrice per avviare l'animazione
    document.addEventListener("keydown", function(event) {
      if (event.code === "Space") {
        event.preventDefault(); // Evita lo scrolling della pagina con la barra spaziatrice
        loadAndAnimateRoutes();
      }
    });

    // Listener per i pulsanti "prevMonth" e "nextMonth" per cancellare l'animazione
    document.getElementById("prevMonth").addEventListener("click", function() {
      clearAnimatedRoutes(); // Cancella l'animazione quando si cambia mese
    });

    document.getElementById("nextMonth").addEventListener("click", function() {
      clearAnimatedRoutes(); // Cancella l'animazione quando si cambia mese
    });

  });
})();
