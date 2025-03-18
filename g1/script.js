// script.js

// Carica i dati CSV relativi al peso
const data_weight = await d3.csv("./assets/weight.csv");

// Al caricamento della pagina mostra la visualizzazione a livello città
window.addEventListener("load", () => {
  updateSidePanelCity(data_weight, window.currentMonthIndex);
});

const dates = data_weight.map((d) => d.date).sort((a, b) => d3.ascending(a, b));
const dateSet = [...new Set(dates)];
const totalDates = dateSet.length;
console.log(dateSet);

const maxGlass = d3.max(data_weight, (d) => +d.glass);
const glassScale = d3.scaleLinear().domain([0, maxGlass]).range([0, 200]);

// ---------------------------
// FUNZIONE: Visualizzazione a livello di CITTÀ
// Aggrega tutti i dati senza filtrare per distretto
// ---------------------------
function updateSidePanelCity(data, currentMonthIndex) {
  const sidePanel = document.querySelector(".side-panel #feature-info");
  sidePanel.innerHTML = `<svg id="waste-chart"></svg>`;
  
  const monthsShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Aggregazione dei dati per l'intera città
  const monthlyData = monthsShort.map((month, index) => {
    const filtered = data.filter(
      (d) => new Date(d.date).getMonth() === index
    );
    return {
      month: month,
      glass: d3.sum(filtered, (d) => +d.glass),
    };
  });
  
  const kmData = [
    { date: "2023-01", km: 1385.67 },
    { date: "2023-02", km: 1500.02 },
    { date: "2023-03", km: 2402.8 },
    { date: "2023-04", km: 1778.41 },
    { date: "2023-05", km: 1829.49 },
    { date: "2023-06", km: 2128.97 },
    { date: "2023-07", km: 902.18 },
    { date: "2023-08", km: 2102.06 },
    { date: "2023-09", km: 1291.45 },
    { date: "2023-10", km: 1360.86 },
    { date: "2023-11", km: 1165.14 },
    { date: "2023-12", km: 955.51 },
  ];
  
  const kmMonthlyData = monthsShort.map((month, index) => {
    const filtered = kmData.find(
      (d) => new Date(d.date + "-01").getMonth() === index
    );
    return {
      month: month,
      km: filtered ? filtered.km : 0,
    };
  });
  
  const panelWidth = sidePanel.clientWidth;
  const panelHeight = 200;
  const svg = d3.select("#waste-chart")
    .attr("width", panelWidth)
    .attr("height", panelHeight);
  
  const margin = { top: 30, right: 40, bottom: 30, left: 50 },
        width = panelWidth - margin.left - margin.right,
        height = panelHeight - margin.top - margin.bottom;
  
  svg.selectAll("*").remove();
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand().domain(monthsShort).range([0, width]).padding(0.1);
  const y = d3.scaleLinear()
    .domain([0, d3.max(monthlyData, (d) => d.glass)])
    .nice()
    .range([height, 0]);
  
  const yKm = d3.scaleLinear()
    .domain([0, d3.max(kmMonthlyData, (d) => d.km)])
    .nice()
    .range([height, 0]);
  
  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).tickValues([0, d3.max(monthlyData, (d) => d.glass)]));
  
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(45)")
    .attr("dx", "0.5em")
    .attr("dy", "0.5em")
    .style("text-anchor", "start");
  
  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).tickValues([0, d3.max(monthlyData, (d) => d.glass)]))
    .selectAll("text")
    .style("fill", function(d) {
      return d === d3.max(monthlyData, d => d.glass) ? "rgba(255, 255, 255, 0.05)" : "white";
    });
  
  g.append("g")
    .attr("class", "y-axis-right")
    .attr("transform", `translate(${width}, 0)`)
    .call(d3.axisRight(yKm).tickValues([d3.max(kmMonthlyData, (d) => d.km)]))
    .selectAll("text")
    .attr("transform", "translate(0, 0)")
    .style("text-anchor", "start")
    .attr("dx", "0.5em");
  
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "rgba(0, 255, 255, 0.8)")
    .text("Glass Weight (kg)");
  
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", width + margin.right - 10)
    .attr("x", -height / 2)
    .attr("dy", "0.5em")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "white")
    .text("Vehicle Route (km)");
  
  g.selectAll(".bar")
    .data(monthlyData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.month))
    .attr("y", (d) => y(d.glass))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.glass))
    .attr("fill", (d) => {
      return monthsShort.indexOf(d.month) === currentMonthIndex
        ? "rgba(0, 255, 255, 0.8)"
        : "rgba(0, 255, 255, 0.3)";
    });
  
  const line = d3.line()
    .x((d) => x(d.month) + x.bandwidth() / 2)
    .y((d) => yKm(d.km));
  
  g.append("path")
    .datum(kmMonthlyData)
    .attr("fill", "none")
    .attr("stroke", "rgba(255,255,255,0.7)")
    .attr("stroke-width", 1.5)
    .attr("d", line);
  
  g.append("circle")
    .attr("cx", x(monthsShort[currentMonthIndex]) + x.bandwidth() / 2)
    .attr("cy", yKm(kmMonthlyData[currentMonthIndex].km))
    .attr("r", 3)
    .attr("fill", "white")
    .attr("stroke", "rgba(255,255,255,0.4)")
    .attr("stroke-width", 1);
  
  sidePanel.innerHTML += `<h3 id="month" style="font-size: 13px; color: white; font-weight: normal;">
    <span id="monthCurrent">${monthsShort[currentMonthIndex]}</span> City Insight</h3>`;
  sidePanel.innerHTML += `
    <p id="waste-weight" style="color: white;">
      <span style="display: inline-block; width: 12px; height: 12px; background-color: cyan; margin-right: 5px;"></span> 
      <span id="wasteWeightCurrent">${monthlyData[currentMonthIndex].glass}</span> kg of glass collected
    </p>`;
  sidePanel.innerHTML += ` 
    <p id="km" style="color: white;">
      <span style="display: inline-block; width: 13px; height: 2px; background-color: white; margin-right: 5px;"></span>
      <span id="kmCurrent">${kmData[currentMonthIndex].km}</span> km run by truck
    </p>`;
}
  
// ---------------------------
// FUNZIONE: Visualizzazione a livello di DISTRETTO
// ---------------------------
function updateSidePanelDistrict(feature, data) {
  const sidePanel = document.querySelector(".side-panel #feature-info");
  sidePanel.innerHTML = `<svg id="waste-chart"></svg>`;
  
  const neighbourhood_id = feature.properties.id;
  const neighbourhood_data = data_weight.filter(
    (d) => +d["id "] === +neighbourhood_id
  );
  
  const monthsShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const monthlyData = monthsShort.map((month, index) => {
    const filtered = neighbourhood_data.filter(
      (d) => new Date(d.date).getMonth() === index
    );
    return {
      month: month,
      glass: d3.sum(filtered, (d) => +d.glass),
    };
  });
  
  const panelWidth = sidePanel.clientWidth;
  const panelHeight = 200;
  const svg = d3.select("#waste-chart")
    .attr("width", panelWidth)
    .attr("height", panelHeight);
  
  const margin = { top: 20, right: 40, bottom: 30, left: 50 },
        width = panelWidth - margin.left - margin.right,
        height = panelHeight - margin.top - margin.bottom;
  
  svg.selectAll("*").remove();
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand().domain(monthsShort).range([0, width]).padding(0.1);
  const y = d3.scaleLinear()
    .domain([0, d3.max(monthlyData, (d) => d.glass)])
    .nice()
    .range([height, 0]);
  
  g.append("g")
    .attr("class", "x-axis") 
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(45)")
    .attr("dx", "0.5em")
    .attr("dy", "0.5em")
    .style("text-anchor", "start");
  
  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).tickValues([0, d3.max(monthlyData, (d) => d.glass)]));
  
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "rgba(0,255,255,0.8)")
    .text("Glass Weight (kg)");
  
  g.selectAll(".bar")
    .data(monthlyData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.month))
    .attr("y", (d) => y(d.glass))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.glass))
    .attr("fill", "rgba(0, 255, 255, 0.3)");
  
  sidePanel.innerHTML += `<h3 id="month" style="font-size: 13px; font-weight: normal; color: white;"><span id="monthCurrent">2023</span> Insight</h3>`;


  sidePanel.innerHTML += ` 
  <div id="svg_bubble"></div>
`;
 
  const container = d3.select("#svg_bubble")
   // Append the SVG string to the #svg_bubble div
  container.html(bubbleChartData);

  const bubbleSvg = container.select("svg")
  .attr("width", 350)  // Set the width
  .attr("height", null) // Let the height adjust automatically based on the aspect ratio
  .attr("viewBox", "0 0 500 300"); // Optional: you can set the viewBox if your SVG has a specific size
  const layers = bubbleSvg.selectAll("g");
  const layerArray = layers.nodes();
  console.log(layerArray.map((d) => d.getAttribute("data-name")));

  const selectedLayer = layerArray.filter((d) => +d.getAttribute("data-name") === +neighbourhood_id)[0]


  layers.remove();
  bubbleSvg.append(() => selectedLayer);
  
  container.append('img')
  .attr('src', './assets/amount-recycled-glass-legend.png')
  .attr('alt', 'Recycled Glass Legend')
  .attr('width', 100  )  // Optional: set the image width
  .attr('height', 60); // Optional: set the image height


}


// ---------------------------
// MAPPA E LAYER
// ---------------------------
let map = L.map("map", {
  center: [46.53, 6.64],
  zoom: 13.1,
  zoomControl: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  dragging: false,
});

window.map = map; // Rende la mappa accessibile globalmente
  
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap &copy; CARTO",
  subdomains: "abcd",
  maxZoom: 20,
}).addTo(map);
  
// Variabili globali per gestire i layer
let districtLayers = [];
let currentZoomedDistrict = null;
window.currentRouteLayer = null;  // Rendi il layer del tracciato completo globale
let ecopointsLayer = null; // Layer per gli ecopoint
  
// Caricamento dei distretti
fetch("lausanne_quartiers.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: function (feature) {
        return {
          color: "rgba(173, 216, 230, 0.5)",
          weight: 1,
          fillOpacity: 0.3,
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties.name) {
          layer.on("click", function () {
            if (currentZoomedDistrict === layer) {
              // ZOOM OUT: visualizzazione città
              map.setView([46.53, 6.64], 13.1, { animate: true });
              currentZoomedDistrict = null;
              districtLayers.forEach((l) => l.setStyle({ fillOpacity: 0.3 }));
              document.getElementById("districtName").innerText = "";
              document.getElementById("prevMonth").style.display = "block";
              document.getElementById("nextMonth").style.display = "block";
              document.getElementById("monthLabel").style.display = "block";
              let monthFile = `geojson/VE_${months[currentMonthIndex].slice(0, 3)}.geojson`;
              updateRoutes(monthFile);
              updateSidePanelCity(data_weight, currentMonthIndex);
              if (ecopointsLayer) {
                map.removeLayer(ecopointsLayer);
                ecopointsLayer = null;
              }
            } else {
              // ZOOM IN: visualizzazione distretto
              map.fitBounds(layer.getBounds(), { animate: true, padding: [20, 20] });
              currentZoomedDistrict = layer;
              districtLayers.forEach((l) =>
                l.setStyle({ fillOpacity: l === layer ? 0.6 : 0.1 })
              );
              document.getElementById("districtName").innerText = feature.properties.name;
              document.getElementById("prevMonth").style.display = "none";
              document.getElementById("nextMonth").style.display = "none";
              document.getElementById("monthLabel").style.display = "none";
              if (window.currentRouteLayer) {
                map.removeLayer(window.currentRouteLayer);
                window.currentRouteLayer = null;
              }
              updateSidePanelDistrict(feature, data_weight);
              loadEcopointsForDistrict(feature, layer);
            }
          });
  
          districtLayers.push(layer);
          function animateOpacity(layer, start, end, duration) {
            let startTime;
            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              let progress = (timestamp - startTime) / duration;
              if (progress < 1) {
                let opacity =
                  start + (end - start) * (progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress);
                layer.setStyle({ fillOpacity: opacity });
                requestAnimationFrame(step);
              } else {
                layer.setStyle({ fillOpacity: end });
              }
            }
            requestAnimationFrame(step);
          }
          layer.on({
            mouseover: function () {
              if (!currentZoomedDistrict) {
                animateOpacity(layer, layer.options.fillOpacity, 0.8, 300);
                document.getElementById("districtName").innerText = feature.properties.name;
              }
            },
            mouseout: function () {
              if (!currentZoomedDistrict) {
                animateOpacity(layer, layer.options.fillOpacity, 0.3, 300);
                document.getElementById("districtName").innerText = "";
              }
            },
          });
        }
      },
    }).addTo(map);
  })
  .catch((error) => console.error("Error loading Lausanne map:", error));
  
// ---------------------------
// ROUTES E CONTROLLI MENSILI
// ---------------------------
document.getElementById("toggleDescriptionBtn").addEventListener("click", function () {
  var descriptionText = document.getElementById("descriptionText");
  var toggleButton = document.getElementById("toggleDescriptionBtn");
  if (descriptionText.style.display === "none") {
    descriptionText.style.display = "block";
    toggleButton.innerText = "◀";
  } else {
    descriptionText.style.display = "none";
    toggleButton.innerText = "▶";
  }
});
  
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let currentMonthIndex = 0;
window.months = months;
window.currentMonthIndex = currentMonthIndex;
  
// Replace the updateRoutes function in script.js with this version

function updateRoutes(geojsonFile) {
  const fadeOutPromise = new Promise((resolve) => {
    if (window.currentRouteLayer) {
      let opacity = window.currentRouteLayer.options.opacity || 1;
      function fadeOut() {
        if (opacity > 0.1) {
          opacity -= 0.05;
          if (window.currentRouteLayer) {
            window.currentRouteLayer.setStyle({ opacity: opacity });
            requestAnimationFrame(fadeOut);
          }
        } else {
          if (window.currentRouteLayer) {
            map.removeLayer(window.currentRouteLayer);
            window.currentRouteLayer = null;
          }
          resolve();
        }
      }
      fadeOut();
    } else {
      resolve();
    }
  });

  fadeOutPromise.then(() => {
    fetch(geojsonFile)
      .then((response) => response.json())
      .then((data) => {
        window.currentRouteLayer = L.geoJSON(data, {
          style: {
            color: "cyan",
            weight: 0.3,
            opacity: 0
          }
        }).addTo(map);

        let opacity = 0;
        function fadeIn() {
          if (opacity < 0.8 && window.currentRouteLayer) {
            opacity += 0.05;
            window.currentRouteLayer.setStyle({ opacity: opacity });
            requestAnimationFrame(fadeIn);
          }
        }
        fadeIn();
      })
      .catch((error) => {
        console.error("Error loading route:", error);
        window.currentRouteLayer = null;
      });
  });
}

function changeMonth(direction) {
  currentMonthIndex += direction;
  if (currentMonthIndex < 0) {
    currentMonthIndex = 11;
  } else if (currentMonthIndex > 11) {
    currentMonthIndex = 0;
  }
  
  let monthLabel = document.getElementById("monthLabel");
  monthLabel.classList.add("fade-out");
  
  setTimeout(() => {
    monthLabel.innerText = months[currentMonthIndex];
    monthLabel.classList.remove("fade-out");
    monthLabel.classList.add("fade-in");
  }, 200);
  
  let monthFile = `geojson/VE_${months[currentMonthIndex].slice(0, 3)}.geojson`;
  updateRoutes(monthFile);
}
  
document.getElementById("prevMonth").addEventListener("click", function () {
  changeMonth(-1);
  updateSidePanelCity(data_weight, currentMonthIndex);
});
document.getElementById("nextMonth").addEventListener("click", function () {
  changeMonth(1);
  updateSidePanelCity(data_weight, currentMonthIndex);
});
  
updateRoutes("geojson/VE_Jan.geojson");
  
function filter_data(feature, data_weight) {
  const neighbourhood_id = feature.properties.id;
  const neighbourhood_data = data_weight.filter((d) => +d["id "] === +neighbourhood_id);
  const neighbourhood_data_with_date = neighbourhood_data.map((d) => ({
    id: +d["id "],
    date: new Date(d.date),
    glass: +d.glass,
    paper: +d.paper,
    iron: +d.iron,
    incinerable: +d.incinerable,
    vegetable: +d.vegetable,
  }));
  const current_month_data = neighbourhood_data_with_date.filter(
    (d) => d.date.getMonth() === currentMonthIndex
  );
  const total_for_current_month = current_month_data.reduce(
    (acc, d) => {
      acc.glass += +d.glass;
      acc.paper += +d.paper;
      acc.iron += +d.iron;
      acc.incinerable += +d.incinerable;
      acc.vegetable += +d.vegetable;
      return acc;
    },
    { glass: 0, paper: 0, iron: 0, incinerable: 0, vegetable: 0 }
  );
  return total_for_current_month;
}
  
// ---------------------------
// FUNZIONE: Carica gli ECOPOINT per il distretto
// ---------------------------
function pointInPolygon(point, polygon) {
  let x = point.lng, y = point.lat;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].lng, yi = polygon[i].lat;
    let xj = polygon[j].lng, yj = polygon[j].lat;
    let intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function loadEcopointsForDistrict(districtFeature, districtLayer) {
  fetch("geojson/ecopoints.geojson")
    .then((response) => response.json())
    .then((data) => {
      let polygonLatLngs = districtLayer.getLatLngs();
      if (Array.isArray(polygonLatLngs[0][0])) {
        polygonLatLngs = polygonLatLngs[0][0];
      } else {
        polygonLatLngs = polygonLatLngs[0];
      }
      
      let filteredFeatures = data.features.filter((ep) => {
        let coords = ep.geometry.coordinates;
        let point = L.latLng(coords[1], coords[0]);
        return pointInPolygon(point, polygonLatLngs);
      });
      
      ecopointsLayer = L.geoJSON(
        { type: "FeatureCollection", features: filteredFeatures },
        {
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "rgb(60,230,70)",
              color: "rgb(60,230,70)",
              weight: 1,
              opacity: 1,
              fillOpacity: 1,
            }).bindPopup("Ecopoint: " + (feature.properties.name || "N/A"));
          },
        }
      );
      ecopointsLayer.addTo(map);
    })
    .catch((error) => console.error("Error loading ecopoints:", error));
}


// Make updateSidePanelCity function global
window.updateSidePanelCity = updateSidePanelCity;

// Make data_weight global
window.data_weight = data_weight;

document.getElementById("aboutButton").addEventListener("click", function() {
    window.location.href = "about/about.html"; // Assumendo che il file about.html sia nella cartella "about"
});
