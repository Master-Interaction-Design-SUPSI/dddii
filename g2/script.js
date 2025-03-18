const CONFIG = {
  width: 1200,
  height: 600,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
};

const AGE_GROUP_COLORS = {
  "0-19": 0xFB9320,
    "20-39": 0xC1295F,
    "40-64": 0x647CEC,
    "65-79": 0x36B335,
    "80+": 0x1DB3D9,
};

const ANIMATION_DURATION = 1000; // animation duration in ms

// Top-level await to load CSV data
const data = await d3.csv("data.csv");
parseData(data);

// Create container elements for two canvases
const visualization = document.getElementById("visualization");

const incineribleContainer = document.createElement("div");
incineribleContainer.id = "incinerable-canvas";
visualization.appendChild(incineribleContainer);

const recyclableContainer = document.createElement("div");
recyclableContainer.id = "recyclable-canvas";
visualization.appendChild(recyclableContainer);

// Create visualizations: one for incinerible waste, one for recyclable waste.
createVisualization("incinerable_weight", "incinerable-canvas");
createVisualization("recyclable_weight", "recyclable-canvas");

////////// TOGGLE LOGIC //////////

const toggle = d3.select("#waste-toggle");

const recyclableCanvas = d3.select("#recyclable-canvas");
const incinerableCanvas = d3.select("#incinerable-canvas");

incinerableCanvas.attr("hidden", true);

toggle.on("click", function () {
  // Check which canvas is currently visible
  if (recyclableCanvas.attr("hidden") === "true") {
    // Show recyclable canvas
    recyclableCanvas.attr("hidden", null);
    incinerableCanvas.attr("hidden", true);

    // Iterate through all districts and layout dots randomly
    data.forEach((districtData) => {
      const dots = districtData.dots; // Get the dots for the current district
      if (dots) {
        layoutDotsRandomly(
          districtData,
          dots,
          districtData.container.width,
          districtData.container.height
        );
      }
    });

    clearSidebar();
  } else {
    // Show incinerable canvas
    recyclableCanvas.attr("hidden", true);
    incinerableCanvas.attr("hidden", null);

    // Iterate through all districts and layout dots randomly
    data.forEach((districtData) => {
      const dots = districtData.dots; // Get the dots for the current district
      if (dots) {
        layoutDotsRandomly(
          districtData,
          dots,
          districtData.container.width,
          districtData.container.height
        );
      }
    });
    clearSidebar();
  }
});

// Clear the sidebar when toggling
function clearSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = ""; // Clear the sidebar
}

//////// END OF TOGGLE LOGIC ////////

// -------------------
// Helper: Create a visualization based on a given metric.
function createVisualization(metric, containerId) {
  // Build treemap layout using the selected metric as the size metric.
  const root = d3.hierarchy({ children: data }).sum((d) => d[metric]);
  d3.treemap().size([CONFIG.width, CONFIG.height]).paddingInner(2)(root);

  // Initialize PIXI application.
  const app = new PIXI.Application({
    width: CONFIG.width,
    height: CONFIG.height,
    backgroundColor: 0xffffff,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  });

  // Append the PIXI canvas to the designated container.
  const container = document.getElementById(containerId);
  container.appendChild(app.view);

  // Create a district container for each leaf node.
  root.leaves().forEach((leaf) => {
    createDistrict(leaf, app);
  });
}

// --- Helper Functions ---

// Parse CSV fields as numbers.
function parseData(data) {
  data.forEach((d) => {
    d.incinerible_weight = +d["incinerible_weight"];
    d.recyclable_weight = +d["recyclable_weight"];
    d["0-19"] = +d["0-19 years old"];
    d["20-39"] = +d["20-39 years old"];
    d["40-64"] = +d["40-64 years old"];
    d["65-79"] = +d["65-79 years old"];
    d["80+"] = +d["80+ years old"];
  });
}

// Create a PIXI container for a district, generate its dots, and attach click interactivity.
function createDistrict(leaf, app) {
  const { x0, y0, x1, y1 } = leaf;
  const districtData = leaf.data;
  const districtWidth = x1 - x0;
  const districtHeight = y1 - y0;
  
  // Create container for the district and position it.
  const districtContainer = new PIXI.Container();
  districtContainer.x = x0;
  districtContainer.y = y0;
  app.stage.addChild(districtContainer);
  PIXI.settings.SORTABLE_CHILDREN = true; // to be able to put labels in front

  
  // Draw district border.
  const border = new PIXI.Graphics();
  border.lineStyle(0, 0x000000);
  border.drawRect(0, 0, districtWidth, districtHeight);
  districtContainer.addChild(border);

  // Add district name label
  const districtLabel = new PIXI.Text(districtData.name_full, {
    fontFamily: "arial",
    fontSize: 12,
    fontWeight: 400,
    fill: 0x000000, // black text
    wordWrap: true,
    wordWrapWidth: districtWidth - 20,
    // backgroundColor: 0xffffff,
    // height: 20,
    // width: 20,
    // zIndex: 100,
  });
  // Center the text within the district
  districtLabel.x = 4; // Small padding from the left
  districtLabel.y = 4; // Small padding from the top
  districtLabel.zIndex = 100;
  districtLabel.alpha = 0.8;
  // districtLabel.backgroundColor = 0xffffff;
  // districtLabel.renderer.background.color = 0xffffff;

  // background for the labels
  const labelBackground = new PIXI.Graphics();
  labelBackground.lineStyle(0.7, 0x000000, 0.5); // 1px black stroke with full opacity
  labelBackground.beginFill(0xffffff, 0.7); // white with 50% opacity
  labelBackground.drawRoundedRect(0, 0, districtLabel.width + 12, districtLabel.height + 8, 4); // 4 is the radius
  labelBackground.endFill();  labelBackground.endFill();
  labelBackground.x = districtLabel.x - 6;
  labelBackground.y = districtLabel.y - 4;
  labelBackground.zIndex = 99;
  labelBackground.borderRadius = 50;

  districtContainer.addChild(labelBackground);
  districtContainer.addChild(districtLabel);

  // Create dots by iterating through age groups so they are created with their proper color.
  const dots = createDots(
    districtContainer,
    districtData,
    districtWidth,
    districtHeight
  );
  districtData.dots = dots;
  districtData.container = districtContainer;
  districtData.ordered = false; // initial state is random scatter

  // toggle layout on click
  districtContainer.interactive = true;
  districtContainer.buttonMode = true;
  districtContainer.on("pointerdown", () => {
    if (districtData.ordered) {
      layoutDotsRandomly(districtData, dots, districtWidth, districtHeight);
      districtData.ordered = false;
    } else {
      layoutDotsAsStackedBar(districtData, dots, districtWidth, districtHeight);
      districtData.ordered = true;
    }

    // Update the sidebar with the district data
    updateSidebar(districtData);
  });

  // // Toggle layout on click.
  // districtContainer.interactive = true;
  // districtContainer.buttonMode = true;
  // districtContainer.on("pointerdown", () => {
  //   if (districtData.ordered) {
  //     layoutDotsRandomly(districtData, dots, districtWidth, districtHeight);
  //     districtData.ordered = false;
  //   } else {
  //     layoutDotsAsStackedBar(districtData, dots, districtWidth, districtHeight);
  //     districtData.ordered = true;
  //   }
  // });
}

// Function to update the sidebar with district data
function updateSidebar(districtData) {
  const sidebar = document.getElementById("sidebar");

  // Check if the district is already in the sidebar
  const existingDistrict = sidebar.querySelector(
    `.district-${districtData.name}`
  );

  if (existingDistrict) {
    // If it exists, remove it (toggle off)
    sidebar.removeChild(existingDistrict);
  } else {
    // Create a new div for the district data
    const districtDiv = document.createElement("div");
    districtDiv.className = `district-${districtData.name}`;
    districtDiv.innerHTML = `
            <h2>${districtData.name_full}</h2>
            <h4>Total population: ${districtData.Total}</h4>
            <ul>
                <li >0-19 year olds: ${districtData["0-19"]}</li>
                <li>20-39 year olds: ${districtData["20-39"]}</li>
                <li>40-64 year olds: ${districtData["40-64"]}</li>
                <li>65-79 year olds: ${districtData["65-79"]}</li>
                <li>80+ year olds: ${districtData["80+"]}</li>
            </ul>

            <h4>Recycling efficiency: ${districtData.recycling_efficiency}</h4>
            <ul id="waste-list">
                <li>Incinerible waste: ${districtData.incinerable_weight} kg</li>
                <li>Recyclable waste: ${districtData.recyclable_weight} kg</li>
            </ul>

        `;
    sidebar.appendChild(districtDiv);
  }
}

// Create dots for each age group so that each is already in its correct color.
function createDots(container, districtData, width, height) {
  const ageGroups = ["0-19", "20-39", "40-64", "65-79", "80+"];
  const dots = [];

  ageGroups.forEach((group) => {
    const groupCount = districtData[group];
    for (let i = 0; i < groupCount; i++) {
      const dot = new PIXI.Graphics();
      dot.beginFill(AGE_GROUP_COLORS[group]);
      dot.drawCircle(0, 0, 2);
      dot.endFill();
      dot.alpha = 0.8;

      // Initial random position within the district.
      dot.x = Math.random() * width;
      dot.y = Math.random() * height;

      container.addChild(dot);
      dots.push(dot);
    }
  });
  return dots;
}

// Animate dots into an ordered, stacked bar layout grouped by age categories.
function layoutDotsAsStackedBar(
  districtData,
  dots,
  districtWidth,
  districtHeight
) {
  const ageGroups = ["0-19", "20-39", "40-64", "65-79", "80+"];
  const targetPositions = [];

  // Calculate total dots to determine proportions
  const totalDots = dots.length;

  // Start positions at 0 (district boundary)
  let currentY = 0;

  ageGroups.forEach((group) => {
    const groupCount = districtData[group];
    if (groupCount === 0) return;

    // Calculate this group's height proportion of total height
    const groupHeight = (groupCount / totalDots) * districtHeight;

    // Calculate dots per row based on district width
    const dotsPerRow = Math.floor(districtWidth / 3); // Reduced spacing between dots
    const dotSpacing = districtWidth / dotsPerRow;

    // Position dots for this group
    let localX = 0;
    let localY = currentY;

    for (let i = 0; i < groupCount; i++) {
      // Add slight randomness while keeping dots within boundaries
      const randomOffsetX = (Math.random() - 0.5) * (dotSpacing * 0.5);
      const randomOffsetY = (Math.random() - 0.5) * (dotSpacing * 0.5);

      let targetX = localX + randomOffsetX;
      let targetY = localY + randomOffsetY;

      // Ensure dots stay within district boundaries
      targetX = Math.max(2, Math.min(districtWidth - 2, targetX));
      targetY = Math.max(
        currentY,
        Math.min(currentY + groupHeight - 2, targetY)
      );

      targetPositions.push({ x: targetX, y: targetY });

      // Move to next position
      localX += dotSpacing;

      // Move to next row if we reach the edge
      if (localX > districtWidth - dotSpacing) {
        localX = 0;
        localY += dotSpacing;
      }
    }

    // Move to next group's starting position
    // Use exact position to avoid gaps
    currentY += groupHeight;
  });

  animateTransition(dots, targetPositions, ANIMATION_DURATION);
}

// Animate dots back to a random scattered layout within the district.
function layoutDotsRandomly(districtData, dots, districtWidth, districtHeight) {
  ////// TROUBLESHOOTING //////
  // Check if dots is an array
  // if (!Array.isArray(dots)) {
  //   console.error("dots should be an array, but got:", dots);
  //   return;  // Stop the function if dots is not an array
  // }

  // Check if dots is empty
  // if (dots.length === 0) {
  //   console.warn("No dots to animate.");
  //   return;  // Stop the function if no dots are present
  // }

  // console.log("dots:", dots);
  // console.log("dots type:", typeof dots);
  // console.log("dots is array?", Array.isArray(dots));
  /////// END OF TROUBLESHOOTING //////

  const targetPositions = dots.map(() => ({
    x: Math.random() * districtWidth,
    y: Math.random() * districtHeight,
  }));

  animateTransition(dots, targetPositions, ANIMATION_DURATION);
}

// Animate the transition of dots from their current to target positions using requestAnimationFrame.
function animateTransition(dots, targetPositions, duration) {
  const startTime = performance.now();
  const startPositions = dots.map((dot) => ({ x: dot.x, y: dot.y }));

  function update() {
    const now = performance.now();
    const t = Math.min((now - startTime) / duration, 1);
    dots.forEach((dot, i) => {
      const startPos = startPositions[i];
      const targetPos = targetPositions[i];
      dot.x = startPos.x + (targetPos.x - startPos.x) * t;
      dot.y = startPos.y + (targetPos.y - startPos.y) * t;
    });
    if (t < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}
