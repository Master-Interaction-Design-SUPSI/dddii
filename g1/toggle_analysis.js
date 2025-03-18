(function() {
    window.addEventListener('load', function() {
        if (!window.map) {
            console.error('Map not initialized');
            return;
        }

        const monthNav = document.getElementById('monthNavigation');
        
        let toggleBtn = document.getElementById('toggleViewBtn');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'toggleViewBtn';
            toggleBtn.textContent = 'Monthly';
            monthNav.appendChild(toggleBtn);
        }

        // Stile del pulsante
        toggleBtn.style.marginLeft = '10px';
        toggleBtn.style.fontSize = '14px';
        toggleBtn.style.padding = '8px 15px';
        toggleBtn.style.borderRadius = '15px';
        toggleBtn.style.background = 'rgb(71, 71, 71)';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.transition = '0.3s';



        // Initialize states for both views
        window.currentViewMode = 'Monthly';
        const dailyLayerGroup = L.layerGroup().addTo(window.map);
        let dailyFeatures = [];
        let currentDayIndex = 0;
        let storedMonthIndex = 0;

        function clearAllRouteLayers() {
            return new Promise((resolve) => {
                if (window.currentRouteLayer) {
                    window.map.removeLayer(window.currentRouteLayer);
                    window.currentRouteLayer = null;
                }
                dailyLayerGroup.clearLayers();
                resolve();
            });
        }

        function loadMonthlyRoute() {
            const monthAbbrev = window.months[window.currentMonthIndex].slice(0, 3);
            const monthFile = `geojson/VE_${monthAbbrev}.geojson`;
            
            return clearAllRouteLayers().then(() => {
                return fetch(monthFile)
                    .then(response => response.json())
                    .then(data => {
                        window.currentRouteLayer = L.geoJSON(data, {
                            style: {
                                color: 'cyan',
                                weight: 0.3,
                                opacity: 0.8
                            }
                        }).addTo(window.map);
                        
                        document.getElementById('monthLabel').innerText = window.months[window.currentMonthIndex];
                        storedMonthIndex = window.currentMonthIndex;
                    })
                    .catch(error => {
                        console.error('Error loading monthly route:', error);
                        window.currentRouteLayer = null;
                    });
            });
        }

        function displayDailyRoute() {
            dailyLayerGroup.clearLayers();
            
            if (dailyFeatures.length > 0 && currentDayIndex >= 0 && currentDayIndex < dailyFeatures.length) {
                const routeLayer = L.geoJSON(dailyFeatures[currentDayIndex], {
                    style: {
                        color: 'cyan',
                        weight: 1.5,
                        opacity: 0.8
                    }
                }).addTo(dailyLayerGroup);
                
                document.getElementById('monthLabel').innerText =
                ` ${currentDayIndex + 1}  ${window.months[window.currentMonthIndex]}`;
            }
        }

        function loadDailyFeatures() {
            return clearAllRouteLayers().then(() => {
                const monthAbbrev = window.months[window.currentMonthIndex].slice(0, 3);
                const monthFile = `geojson/VE_${monthAbbrev}.geojson`;

                return fetch(monthFile)
                    .then(response => response.json())
                    .then(data => {
                        dailyFeatures = data.features;
                        if (dailyFeatures.length > 0) {
                            displayDailyRoute();
                        } else {
                            console.warn('No features found for daily routes');
                        }
                    })
                    .catch(error => {
                        console.error('Error loading daily features:', error);
                        dailyFeatures = [];
                    });
            });
        }

        // Override navigation handlers in script.js
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');

        prevBtn.replaceWith(prevBtn.cloneNode(true));
        nextBtn.replaceWith(nextBtn.cloneNode(true));

        const newPrevBtn = document.getElementById('prevMonth');
        const newNextBtn = document.getElementById('nextMonth');

        newPrevBtn.addEventListener('click', function(e) {
            if (window.currentViewMode === 'Daily') {
                if (currentDayIndex > 0) {
                    currentDayIndex--;
                    displayDailyRoute();
                }
            } else {
                window.currentMonthIndex = (window.currentMonthIndex - 1 + 12) % 12;
                loadMonthlyRoute();
                if (typeof window.updateSidePanelCity === 'function') {
                    window.updateSidePanelCity(window.data_weight, window.currentMonthIndex);
                }
            }
        });

        newNextBtn.addEventListener('click', function(e) {
            if (window.currentViewMode === 'Daily') {
                if (currentDayIndex < dailyFeatures.length - 1) {
                    currentDayIndex++;
                    displayDailyRoute();
                }
            } else {
                window.currentMonthIndex = (window.currentMonthIndex + 1) % 12;
                loadMonthlyRoute();
                if (typeof window.updateSidePanelCity === 'function') {
                    window.updateSidePanelCity(window.data_weight, window.currentMonthIndex);
                }
            }
        });

        toggleBtn.addEventListener('click', function() {
            if (window.currentViewMode === 'Monthly') {
                window.currentViewMode = 'Daily';
                toggleBtn.textContent = 'Daily';
                loadDailyFeatures();
            } else {
                window.currentViewMode = 'Monthly';
                toggleBtn.textContent = 'Monthly';
                loadMonthlyRoute();
            }
        });

        loadMonthlyRoute();
    });
})();
