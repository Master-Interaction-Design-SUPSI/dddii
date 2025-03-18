google.charts.load("current", { packages: ["sankey"] });
google.charts.setOnLoadCallback(initSankeyChart);

// 📌 存储不同年份的 Sankey 数据
const sankeyData = {
  2017: [
    ["Hautes Ecoles", "15-24 y.o.", 1932],
    ["Hautes Ecoles", "25-44 y.o.", 25353],
    ["Hautes Ecoles", "45-64 y.o.", 8879],
    ["Hautes Ecoles", "more than 64 y.o.", 2671],
    ["Professionnelle Supérieure", "15-24 y.o.", 387],
    ["Professionnelle Supérieure", "25-44 y.o.", 3846],
    ["Professionnelle Supérieure", "45-64 y.o.", 3465],
    ["Professionnelle Supérieure", "more than 64 y.o.", 2137],
    ["Formation Générale", "15-24 y.o.", 3490],
    ["Formation Générale", "25-44 y.o.", 4539],
    ["Formation Générale", "45-64 y.o.", 3077],
    ["Formation Générale", "more than 64 y.o.", 1912],
    ["Formation Professionnelle", "15-24 y.o.", 1869],
    ["Formation Professionnelle", "25-44 y.o.", 7062],
    ["Formation Professionnelle", "45-64 y.o.", 6522],
    ["Formation Professionnelle", "more than 64 y.o.", 5400],
    ["Sans formation postobligatoire", "under 15", 20249],
    ["Sans formation postobligatoire", "15-24 y.o.", 7410],
    ["Sans formation postobligatoire", "25-44 y.o.", 8354],
    ["Sans formation postobligatoire", "45-64 y.o.", 9726],
    ["Sans formation postobligatoire", "more than 64 y.o.", 7239],
    ["Unknown", "15-24 y.o.", 3531],
    ["Unknown", "25-44 y.o.", 3320],
    ["Unknown", "45-64 y.o.", 1034],
    ["Unknown", "more than 64 y.o.", 1385],
    ["under 15", "Overall Population", 20249],
    ["15-24 y.o.", "Overall Population", 18618],
    ["25-44 y.o.", "Overall Population", 52475],
    ["45-64 y.o.", "Overall Population", 32703],
    ["more than 64 y.o.", "Overall Population", 20745],
    ["Overall Population", "Total Waste", 69634],
    ["Total Waste", "Incinerable", 35054],
    ["Total Waste", "Paper", 15202],
    ["Total Waste", "Glass", 7590],
    ["Total Waste", "Iron", 2264],
    ["Total Waste", "Vegetabe", 9523],
  ],
  2018: [
    ["Hautes Ecoles", "15-24 y.o.", 2029],
    ["Hautes Ecoles", "25-44 y.o.", 26508],
    ["Hautes Ecoles", "45-64 y.o.", 9268],
    ["Hautes Ecoles", "more than 64 y.o.", 2807],
    ["Professionnelle Supérieure", "15-24 y.o.", 180],
    ["Professionnelle Supérieure", "25-44 y.o.", 3681],
    ["Professionnelle Supérieure", "45-64 y.o.", 3069],
    ["Professionnelle Supérieure", "more than 64 y.o.", 1891],
    ["Formation Générale", "15-24 y.o.", 4438],
    ["Formation Générale", "25-44 y.o.", 4491],
    ["Formation Générale", "45-64 y.o.", 3090],
    ["Formation Générale", "more than 64 y.o.", 1769],
    ["Formation Professionnelle", "15-24 y.o.", 1946],
    ["Formation Professionnelle", "25-44 y.o.", 6580],
    ["Formation Professionnelle", "45-64 y.o.", 7059],
    ["Formation Professionnelle", "more than 64 y.o.", 5898],
    ["Sans formation postobligatoire", "under 15", 20458],
    ["Sans formation postobligatoire", "15-24 y.o.", 6457],
    ["Sans formation postobligatoire", "25-44 y.o.", 7913],
    ["Sans formation postobligatoire", "45-64 y.o.", 9463],
    ["Sans formation postobligatoire", "more than 64 y.o.", 6973],
    ["Unknown", "15-24 y.o.", 3825],
    ["Unknown", "25-44 y.o.", 3297],
    ["Unknown", "45-64 y.o.", 1034],
    ["Unknown", "more than 64 y.o.", 1363],
    ["under 15", "Overall Population", 20458],
    ["15-24 y.o.", "Overall Population", 18875],
    ["25-44 y.o.", "Overall Population", 52470],
    ["45-64 y.o.", "Overall Population", 32984],
    ["more than 64 y.o.", "Overall Population", 20701],
    ["Overall Population", "Total Waste", 69142],
    ["Total Waste", "Incinerable", 34740],
    ["Total Waste", "Paper", 14799],
    ["Total Waste", "Glass", 7487],
    ["Total Waste", "Iron", 2217],
    ["Total Waste", "Vegetable", 9899],
  ],
  2019: [
    ["Hautes Ecoles", "15-24 y.o.", 1788],
    ["Hautes Ecoles", "25-44 y.o.", 26591],
    ["Hautes Ecoles", "45-64 y.o.", 8707],
    ["Hautes Ecoles", "more than 64 y.o.", 3105],
    ["Professionnelle Supérieure", "15-24 y.o.", 315],
    ["Professionnelle Supérieure", "25-44 y.o.", 3663],
    ["Professionnelle Supérieure", "45-64 y.o.", 3585],
    ["Professionnelle Supérieure", "more than 64 y.o.", 1634],
    ["Formation Générale", "15-24 y.o.", 4099],
    ["Formation Générale", "25-44 y.o.", 4673],
    ["Formation Générale", "45-64 y.o.", 3372],
    ["Formation Générale", "more than 64 y.o.", 2040],
    ["Formation Professionnelle", "15-24 y.o.", 2420],
    ["Formation Professionnelle", "25-44 y.o.", 6527],
    ["Formation Professionnelle", "45-64 y.o.", 6760],
    ["Formation Professionnelle", "more than 64 y.o.", 5635],
    ["Sans formation postobligatoire", "under 15", 20433],
    ["Sans formation postobligatoire", "15-24 y.o.", 6251],
    ["Sans formation postobligatoire", "25-44 y.o.", 7580],
    ["Sans formation postobligatoire", "45-64 y.o.", 9987],
    ["Sans formation postobligatoire", "more than 64 y.o.", 6942],
    ["Unknown", "15-24 y.o.", 4033],
    ["Unknown", "25-44 y.o.", 3386],
    ["Unknown", "45-64 y.o.", 1103],
    ["Unknown", "more than 64 y.o.", 1403],
    ["under 15", "Overall Population", 20433],
    ["15-24 y.o.", "Overall Population", 18906],
    ["25-44 y.o.", "Overall Population", 52419],
    ["45-64 y.o.", "Overall Population", 33514],
    ["more than 64 y.o.", "Overall Population", 20759],
    ["Overall Population", "Total Waste", 67046],
    ["Total Waste", "Incinerable", 33462],
    ["Total Waste", "Paper", 13808],
    ["Total Waste", "Glass", 7856],
    ["Total Waste", "Iron", 2126],
    ["Total Waste", "Vegetable", 9793],
  ],
  2020: [
    ["Hautes Ecoles", "15-24 y.o.", 2033],
    ["Hautes Ecoles", "25-44 y.o.", 26746],
    ["Hautes Ecoles", "45-64 y.o.", 10255],
    ["Hautes Ecoles", "more than 64 y.o.", 3540],
    ["Professionnelle Supérieure", "15-24 y.o.", 201],
    ["Professionnelle Supérieure", "25-44 y.o.", 2872],
    ["Professionnelle Supérieure", "45-64 y.o.", 2483],
    ["Professionnelle Supérieure", "more than 64 y.o.", 1779],
    ["Formation Générale", "15-24 y.o.", 3986],
    ["Formation Générale", "25-44 y.o.", 5065],
    ["Formation Générale", "45-64 y.o.", 3319],
    ["Formation Générale", "more than 64 y.o.", 1892],
    ["Formation Professionnelle", "15-24 y.o.", 1729],
    ["Formation Professionnelle", "25-44 y.o.", 7383],
    ["Formation Professionnelle", "45-64 y.o.", 7152],
    ["Formation Professionnelle", "more than 64 y.o.", 6242],
    ["Sans formation postobligatoire", "under 15", 20379],
    ["Sans formation postobligatoire", "15-24 y.o.", 6743],
    ["Sans formation postobligatoire", "25-44 y.o.", 7286],
    ["Sans formation postobligatoire", "45-64 y.o.", 9467],
    ["Sans formation postobligatoire", "more than 64 y.o.", 5851],
    ["Unknown", "15-24 y.o.", 3647],
    ["Unknown", "25-44 y.o.", 2965],
    ["Unknown", "45-64 y.o.", 996],
    ["Unknown", "more than 64 y.o.", 1335],
    ["under 15", "Overall Population", 20379],
    ["15-24 y.o.", "Overall Population", 18353],
    ["25-44 y.o.", "Overall Population", 52316],
    ["45-64 y.o.", "Overall Population", 33673],
    ["more than 64 y.o.", "Overall Population", 20638],
    ["Overall Population", "Total Waste", 63147],
    ["Total Waste", "Incinerable", 31049],
    ["Total Waste", "Paper", 13153],
    ["Total Waste", "Glass", 7211],
    ["Total Waste", "Iron", 2153],
    ["Total Waste", "Vegetable", 9582],
  ],
  2021: [
    ["Hautes Ecoles", "15-24 y.o.", 2143],
    ["Hautes Ecoles", "25-44 y.o.", 27137],
    ["Hautes Ecoles", "45-64 y.o.", 10533],
    ["Hautes Ecoles", "more than 64 y.o.", 3362],
    ["Professionnelle Supérieure", "15-24 y.o.", 71],
    ["Professionnelle Supérieure", "25-44 y.o.", 2745],
    ["Professionnelle Supérieure", "45-64 y.o.", 2403],
    ["Professionnelle Supérieure", "more than 64 y.o.", 1660],
    ["Formation Générale", "15-24 y.o.", 3628],
    ["Formation Générale", "25-44 y.o.", 4381],
    ["Formation Générale", "45-64 y.o.", 3409],
    ["Formation Générale", "more than 64 y.o.", 2253],
    ["Formation Professionnelle", "15-24 y.o.", 2112],
    ["Formation Professionnelle", "25-44 y.o.", 7518],
    ["Formation Professionnelle", "45-64 y.o.", 6947],
    ["Formation Professionnelle", "more than 64 y.o.", 6285],
    ["Sans formation postobligatoire", "under 15", 20502],
    ["Sans formation postobligatoire", "15-24 y.o.", 7091],
    ["Sans formation postobligatoire", "25-44 y.o.", 7336],
    ["Sans formation postobligatoire", "45-64 y.o.", 9603],
    ["Sans formation postobligatoire", "more than 64 y.o.", 5717],
    ["Unknown", "15-24 y.o.", 4229],
    ["Unknown", "25-44 y.o.", 3412],
    ["Unknown", "45-64 y.o.", 1072],
    ["Unknown", "more than 64 y.o.", 1360],
    ["under 15", "Overall Population", 20502],
    ["15-24 y.o.", "Overall Population", 19274],
    ["25-44 y.o.", "Overall Population", 52529],
    ["45-64 y.o.", "Overall Population", 33967],
    ["more than 64 y.o.", "Overall Population", 20638],
    ["Overall Population", "Total Waste", 63536],
    ["Total Waste", "Incinerable", 31664],
    ["Total Waste", "Paper", 13071],
    ["Total Waste", "Glass", 7093],
    ["Total Waste", "Iron", 2159],
    ["Total Waste", "Vegetable", 9549],
  ],
  2022: [
    ["Hautes Ecoles", "15-24 y.o.", 2198],
    ["Hautes Ecoles", "25-44 y.o.", 28174],
    ["Hautes Ecoles", "45-64 y.o.", 10565],
    ["Hautes Ecoles", "more than 64 y.o.", 3871],
    ["Professionnelle Supérieure", "15-24 y.o.", 236],
    ["Professionnelle Supérieure", "25-44 y.o.", 2463],
    ["Professionnelle Supérieure", "45-64 y.o.", 2639],
    ["Professionnelle Supérieure", "more than 64 y.o.", 1865],
    ["Formation Générale", "15-24 y.o.", 3977],
    ["Formation Générale", "25-44 y.o.", 4373],
    ["Formation Générale", "45-64 y.o.", 3293],
    ["Formation Générale", "more than 64 y.o.", 2019],
    ["Formation Professionnelle", "15-24 y.o.", 2313],
    ["Formation Professionnelle", "25-44 y.o.", 8016],
    ["Formation Professionnelle", "45-64 y.o.", 7390],
    ["Formation Professionnelle", "more than 64 y.o.", 5956],
    ["Sans formation postobligatoire", "under 15", 20543],
    ["Sans formation postobligatoire", "15-24 y.o.", 6557],
    ["Sans formation postobligatoire", "25-44 y.o.", 6416],
    ["Sans formation postobligatoire", "45-64 y.o.", 9473],
    ["Sans formation postobligatoire", "more than 64 y.o.", 5544],
    ["Unknown", "15-24 y.o.", 4459],
    ["Unknown", "25-44 y.o.", 3788],
    ["Unknown", "45-64 y.o.", 1238],
    ["Unknown", "more than 64 y.o.", 1442],
    ["under 15", "Overall Population", 20543],
    ["15-24 y.o.", "Overall Population", 19741],
    ["25-44 y.o.", "Overall Population", 53230],
    ["45-64 y.o.", "Overall Population", 34599],
    ["more than 64 y.o.", "Overall Population", 20697],
    ["Overall Population", "Total Waste", 62249],
    ["Total Waste", "Incinerable", 31365],
    ["Total Waste", "Paper", 12500],
    ["Total Waste", "Glass", 7096],
    ["Total Waste", "Iron", 1947],
    ["Total Waste", "Vegetable", 9341],
  ],
};

const recyclingRates = {
  2017: "49.65",
  2018: "49.75",
  2019: "50.09",
  2020: "50.83",
  2021: "50.16",
  2022: "49.61",
};

function updateTrendAnalysis(year) {
    const trendText = document.getElementById("trendText");
    const rate = parseFloat(recyclingRates[year]);
    const prevYear = (parseInt(year) - 1).toString();
    
    let message = `In ${year}, the recycling rate was <strong>${rate.toFixed(2)}%</strong>. `;

    if (!recyclingRates[prevYear]) {
        message += "This is the first recorded data point.";
    } else {
        const prevRate = parseFloat(recyclingRates[prevYear]);
        const change = (rate - prevRate).toFixed(2);
        
        message += change > 0 
            ? `This is an increase of <strong>+${change}%</strong> compared to ${prevYear}. 🚀`
            : change < 0 
                ? `This is a decrease of <strong>${change}%</strong> compared to ${prevYear}. 📉`
                : `No significant change from ${prevYear}. ⚖️`;
    }

    trendText.innerHTML = message;
}

function updateYearlyData(year) {
    const yearlyDataContent = document.getElementById("yearlyDataContent");

    const educationalData = {
        "2017": `
            Sans formation postobligatoire: 49.66%<br>
            Formation Professionnelle: 28.39%<br>
            Formation Générale: 18.09%<br>
            Professionnelle Supérieure: 8.53%<br>
            Hautes Ecoles: 33.69%<br>`,
        
        "2018": `
            Sans formation postobligatoire: 49.75%<br>
            Formation Professionnelle: 26.67%<br>
            Formation Générale: 18.60%<br>
            Professionnelle Supérieure: 7.64%<br>
            Hautes Ecoles: 35.16%<br>`,
        
        "2019": `
            Sans formation postobligatoire: 50.09%<br>
            Formation Professionnelle: 26.59%<br>
            Formation Générale: 18.45%<br>
            Professionnelle Supérieure: 7.95%<br>
            Hautes Ecoles: 34.75%<br>`,
        
        "2020": `
            Sans formation postobligatoire: 50.83%<br>
            Formation Professionnelle: 25.29%<br>
            Formation Générale: 19.40%<br>
            Professionnelle Supérieure: 6.33%<br>
            Hautes Ecoles: 36.69%<br>`,
        
        "2021": `
            Sans formation postobligatoire: 50.16%<br>
            Formation Professionnelle: 25.57%<br>
            Formation Générale: 19.65%<br>
            Professionnelle Supérieure: 5.91%<br>
            Hautes Ecoles: 37.11%<br>`,
        
        "2022": `
            Sans formation postobligatoire: 49.61%<br>
            Formation Professionnelle: 23.85%<br>
            Formation Générale: 20.18%<br>
            Professionnelle Supérieure: 6.14%<br>
            Hautes Ecoles: 38.19%<br>`
    };

    // Updating the content of the yearlyDataContent section
    yearlyDataContent.innerHTML = educationalData[year];
}

function updateTrendAnalysis(year) {
    const trendText = document.getElementById("trendText");
    const rate = parseFloat(recyclingRates[year]);
    const prevYear = (parseInt(year) - 1).toString();
    
    let message = `In ${year}, the recycling rate was <strong>${rate.toFixed(2)}%</strong>. `;

    if (!recyclingRates[prevYear]) {
        message += "This is the first recorded data point.";
    } else {
        const prevRate = parseFloat(recyclingRates[prevYear]);
        const change = (rate - prevRate).toFixed(2);
        
        message += change > 0 
            ? `This is an increase of <strong>+${change}%</strong> compared to ${prevYear}. 🚀`
            : change < 0 
                ? `This is a decrease of <strong>${change}%</strong> compared to ${prevYear}. 📉`
                : `No significant change from ${prevYear}. ⚖️`;
    }

    trendText.innerHTML = message;
    
    // Update the yearly educational data breakdown
    updateYearlyData(year);
}

function getRecyclingColor(rate) {
  // Tightened the range to make small differences more visible
  const MIN_RATE = 49.0;
  const MAX_RATE = 51.0;

  // Convert HSL to Hex helper function
  function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  const percentage = (rate - MIN_RATE) / (MAX_RATE - MIN_RATE);

  // Using the same HSL values as before, but converting to hex
  const hue = 300 + (210 - 220) * percentage;
  const saturation = 15 + (90 - 15) * percentage;
  const lightness = 25 + (45 - 25) * percentage;

  return hslToHex(hue, saturation, lightness);
}

function initSankeyChart() {
  const yearRange = document.getElementById("yearRange");
  const yearLabel = document.getElementById("yearLabel");
  const educationFilter = document.getElementById("educationFilter");
  const wasteFilter = document.getElementById("wasteFilter");
  const downloadButton = document.getElementById("downloadButton");

  // 添加下载按钮事件监听
  downloadButton.addEventListener("click", () => {
    const currentYear = yearRange.value;
    const currentData = sankeyData[currentYear];

    // 转换数据为CSV格式
    const csvRows = [];

    // 添加CSV表头
    csvRows.push(["Source", "Target", "Value"]);

    // 添加数据行
    currentData.forEach((link) => {
      csvRows.push([link[0], link[1], link[2]]);
    });

    // 将数组转换为CSV字符串
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // 创建 Blob 对象
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    // 创建临时下载链接
    const a = document.createElement("a");
    a.href = url;
    a.download = `sankey_data_${currentYear}.csv`;
    document.body.appendChild(a);
    a.click();

    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });

  // 初始绘制
  drawSankeyChart(yearRange.value);
  updateTrendAnalysis(yearRange.value);

  // 使用事件委托优化事件监听
  const handleFilterChange = () => {
    const year = yearRange.value;
    const educationLevel = educationFilter.value;
    const wasteType = wasteFilter.value;

    yearLabel.innerText = year;
    drawSankeyChart(year, educationLevel, wasteType);
    updateTrendAnalysis(year);
  };

  yearRange.addEventListener("input", handleFilterChange);
  educationFilter.addEventListener("change", handleFilterChange);
  wasteFilter.addEventListener("change", handleFilterChange);
}

function drawSankeyChart(year, filterLevel = "all", filterWaste = "all") {
  const data = new google.visualization.DataTable();
  data.addColumn("string", "From");
  data.addColumn("string", "To");
  data.addColumn("number", "Number");

  // Get recycling rate color
  const rate = recyclingRates[year] || 50;
  const totalWasteColor = getRecyclingColor(rate);

  // Helper function to find all connected nodes starting from a source
  function findConnectedNodes(data, startNode) {
    const connectedNodes = new Set([startNode]);
    let changed = true;

    while (changed) {
      changed = false;
      data.forEach(([from, to]) => {
        if (connectedNodes.has(from) && !connectedNodes.has(to)) {
          connectedNodes.add(to);
          changed = true;
        }
      });
    }

    return connectedNodes;
  }

  // Filter the data based on the selected filters
  let filteredData = sankeyData[year];

  if (filterLevel !== "all") {
    // Find all nodes connected to the selected education level
    const connectedNodes = findConnectedNodes(sankeyData[year], filterLevel);
    filteredData = sankeyData[year].filter(
      ([from, to]) => connectedNodes.has(from) && connectedNodes.has(to)
    );
  }

  if (filterWaste !== "all") {
    // Keep all education-to-age and age-to-population flows
    // Only filter waste-related flows
    filteredData = filteredData.filter(([from, to]) => {
      // Keep all education level flows by checking for all possible education categories
      if (
        from === "Hautes Ecoles" ||
        from === "Professionnelle Supérieure" ||
        from === "Formation Générale" ||
        from === "Formation Professionnelle" ||
        from === "Sans formation postobligatoire" ||
        from === "Unknown"
      ) {
        return true;
      }
      // Keep all age group to Overall Population connections
      if (to === "Overall Population") {
        return true;
      }
      // For waste flows, only keep the selected waste type
      if (from === "Total Waste") {
        return to === filterWaste;
      }
      // Keep the Overall Population to Total Waste flow
      if (to === "Total Waste") {
        return true;
      }
      return false;
    });
  }

  data.addRows(
    filteredData.length ? filteredData : [["No Data", "No Match", 1]]
  );

  const nodeColors = {
    // Education levels - Make sure these match exactly with your data
    "Hautes Ecoles": "#1789FC",
    "Professionnelle Supérieure": "#8C4843", // Fixed accent
    "Formation Générale": "rgb(24, 107, 110)", // Fixed accent
    "Formation Professionnelle": "#DBABBE",
    "Sans formation postobligatoire": "#6A994E",
    Unknown: "#EFC88B",

    // Age groups
    "under 15": "#6A994E",
    "15-24 y.o.": "rgb(24, 107, 110)",
    "25-44 y.o.": "#1789FC",
    "45-64 y.o.": "#1789FC",
    "more than 64 y.o.": "#DBABBE",

    // Population and Waste
    "Overall Population": totalWasteColor,
    "Total Waste": totalWasteColor,
    Incinerable: "#CD853F",
    Paper: "#87CEEB",
    Glass: "#98FB98",
    Iron: "#DEB887",
    Vegetable: "#556B2F",
  };

  const options = {
    width: window.innerWidth * 0.75,
    height: window.innerHeight * 0.8,
    sankey: {
      node: {
        label: {
          color: "#FFFFFF",
          fontSize: 16,
        },
        nodePadding: 10,
        interactivity: true,
        colors: Object.values(nodeColors),
      },
      link: {
        colorMode: "source",
      },
    },
  };

  // Create an array of colors in the same order as the nodes appear in the data
  const uniqueNodes = new Set();
  filteredData.forEach((row) => {
    uniqueNodes.add(row[0]);
    uniqueNodes.add(row[1]);
  });

  const colors = Array.from(uniqueNodes).map(
    (node) => nodeColors[node] || "#808080"
  );
  options.sankey.node.colors = colors;

  const chart = new google.visualization.Sankey(
    document.getElementById("sankeyChart")
  );
  chart.draw(data, options);

  // Update background color to black and recycling rate display
  const chartSection = document.getElementById("chart-section");
  const recyclingRateElement = document.getElementById("recyclingRate");

  chartSection.style.background = "rgb(10, 25, 70)";

  recyclingRateElement.innerText = `${recyclingRates[year]}%`;
}

// 使用防抖优化窗口调整事件
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 添加防抖的窗口调整事件监听
window.addEventListener(
  "resize",
  debounce(() => {
    const selectedYear = document.getElementById("yearRange").value;
    drawSankeyChart(selectedYear);
  }, 250)
);
