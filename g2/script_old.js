// Set up dimensions
const width = 1200;
const height = 800;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

const app = initializeApp(); // Initialize PIXI app
const container = createContainer(app); // Create a PIXI container


// Age groups and colors (convert to PIXI colors)
const ageGroups = {
    "0-19": 0xFB9320,
    "20-39": 0xC1295F,
    "40-64": 0x1372A1,
    "65-79": 0x247A23,
    "80+": 0x1DB3D9,
};

// Scale factor - 1 dot represents 1 person
const SCALE_FACTOR = 1;


// Initialize PIXI Application
function initializeApp() {
    const app = new PIXI.Application({
        width: width,
        height: height,
        backgroundColor: 0xf5f5f5,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
    });
    document.getElementById('visualization').appendChild(app.view);
    return app;
}

// Create container for districts and dots
function createContainer(app) {
    const container = new PIXI.Container();
    app.stage.addChild(container);
    return container;
}


// Load and process data
function loadData() {
    return d3.csv("data.csv").then(data => {
        data = data.filter(d => d.id !== "");

        // Create treemap data structure
        const treemapData = {
            children: data.map(d => ({
                name: d.name,
                recyclableWaste: +d.recyclable_weight, // Load recyclable waste
                nonRecyclableWaste: +d.incinerable_weight, // Load non-recyclable waste
                value: +d.recyclable_weight // Default to recyclable waste
            }))
        };

        // if (!treemapData) {
        //     console.error("Treemap data is not available.");
        // }
        
        return treemapData;
    });
}

// Create treemap layout
function createTreemap(treemapData, wasteType = "recyclableWaste") {
    if (!treemapData || !treemapData.children) {
        console.error("Invalid treemap data.");
        return null;
    }
    
    const treemap = d3.treemap()
    .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
    .padding(8);
    
    const root = d3.hierarchy(treemapData)
    .sum(d => d[wasteType]); // Set size based on selected waste type
    
    treemap(root);
    
    if (!root || !root.leaves) {
        console.error("Treemap hierarchy could not be created.");
        return null;
    }
    
    return root;
}


// Update treemap when button is clicked
function updateTreemap(wasteType, treemapData) {
    if (!treemapData) {
        console.error("Treemap data is not defined yet.");
        return;
    }

    const updatedRoot = createTreemap(treemapData, wasteType);
    if (!updatedRoot) {
        console.error("Failed to generate updated treemap.");
        return;
    }

    container.removeChildren(); // Clear previous visualization
    console.log("Children count before draw:", container.children.length);
    drawDistricts(container, updatedRoot); // Redraw treemap
}



// Draw districts using PIXI Graphics
function drawDistricts(container, root) {
    const districts = new Map();
    root.leaves().forEach(d => {
        const district = new PIXI.Graphics();
        district.lineStyle(2, 0xFFFFFF);
        district.beginFill(0xFFFFFF, 0.3);
        district.drawRect(
            d.x0 + margin.left,
            d.y0 + margin.top,
            d.x1 - d.x0,
            d.y1 - d.y0
        );
        district.endFill();
        district.alpha = 0.3;

        // Add district label
        const label = new PIXI.Text(`${d.data.name}`, {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: 0x000000,
            backgroundColor: 0xFFFFFF
        });
        label.x = d.x0 + margin.left + 5;
        label.y = d.y0 + margin.top + 5;

        container.addChild(district);
        container.addChild(label);
        districts.set(d.data.name, { graphics: district, data: d });
    });
    return districts;
}


// Event listener for toggle
const wasteToggle = document.getElementById("waste-toggle");
const wasteTypeLabel = document.getElementById("waste-type-label");

wasteToggle.addEventListener("change", () => {
    if (!treemapData) {
        console.error("Treemap data is not loaded yet.");
        return;
    }

    const wasteType = wasteToggle.checked ? "nonRecyclableWaste" : "recyclableWaste";
    wasteTypeLabel.textContent = wasteToggle.checked ? "" : "";

    updateTreemap(wasteType, treemapData);
});



// Load and initialize the treemap
let treemapData;
loadData().then(data => {
    if (!data) {
        console.error("Failed to load data.");
        return;
    }
    
    treemapData = data;
    const root = createTreemap(treemapData);
    if (!root) {
        console.error("Failed to create initial treemap.");
        return;
    }
    
    drawDistricts(container, root);
});


// Create dots using PIXI Graphics
function createDots(container, root) {
    const dots = new Map();
    const dotContainer = new PIXI.Container();
    container.addChild(dotContainer);

    
    root.leaves().forEach(district => {
        Object.entries(district.data.demographics).forEach(([ageGroup, count]) => {
            for (let i = 0; i < count; i++) {
                const dot = new PIXI.Graphics();
                dot.beginFill(ageGroups[ageGroup]);
                dot.drawCircle(0, 0, 2.5);
                dot.endFill();

                // Set initial position
                dot.x = district.x0 + margin.left + Math.random() * (district.x1 - district.x0);
                dot.y = district.y0 + margin.top + Math.random() * (district.y1 - district.y0);

                const dotData = {
                    district: district.data.name,
                    ageGroup: ageGroup,
                    graphics: dot
                };
                dots.set(dot, dotData);
                dotContainer.addChild(dot);
            }
        });
    });
    return dots;
}

// Funzione per aggiornare il contenuto della sidebar
function updateSidebar(selectedDistricts) {
    const sidebarElement = d3.select('#district-details');
    
    // Crea un array per contenere il contenuto della sidebar per tutti i distretti selezionati
    let sidebarContent = '';

    selectedDistricts.forEach(districtObj => {
        const totalPop = d3.sum(districtObj.data.ages, a => a.value);
        const agePercentages = districtObj.data.ages.map(age => ({
            name: age.name,
            percentage: age.value / totalPop,
            value: age.value
        }));

        sidebarContent += `
            <h3>${districtObj.data.name}</h3>
            <div class="detail-section">
                <p><strong>Popolazione Totale:</strong> ${formatNumber(districtObj.data.total)}</p>
                <p><strong>Efficienza del Riciclaggio:</strong> ${formatDecimal(districtObj.data.recycling)}</p>
            </div>
            <div class="detail-section">
                <h4>Distribuzione per Età</h4>
                <table class="age-table">
                    <tr>
                        <th>Gruppo di Età</th>
                        <th>Popolazione</th>
                        <th>Percentuale</th>
                    </tr>
                    ${agePercentages.map(age => `
                        <tr>
                            <td>${age.name}</td>
                            <td>${formatNumber(age.value)}</td>
                            <td>${formatPercent(age.percentage)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    });

    sidebarElement.html(sidebarContent);
}

// Gestisci la selezione del distretto
function handleDistrictSelection(districts, dots) {
    let selectedDistricts = new Set();

    districts.forEach((districtObj, districtName) => {
        const { graphics, data } = districtObj;
        graphics.interactive = true;
        graphics.cursor = 'pointer';

        graphics.on('click', () => {
            if (selectedDistricts.has(districtObj)) {
                // Deseleziona il distretto
                selectedDistricts.delete(districtObj);
            } else {
                // Seleziona il distretto
                selectedDistricts.add(districtObj);
            }
            updateSidebar(Array.from(selectedDistricts)); // Aggiorna la sidebar con tutti i distretti selezionati
            console.log("Distretto Selezionato:", districtName);
            console.log("Dettagli del Gruppo di Età:", districtObj.data.data.demographics);
        });
    });
}

// Main function to initialize and run the visualization
function main() {
    // const app = initializeApp();
    // const container = createContainer(app);

    loadData().then(treemapData => {
        const root = createTreemap(treemapData);
        const districts = drawDistricts(container, root);
        const dots = createDots(container, root);
        handleDistrictSelection(districts, dots);
    });
}

// Run the main function
main();