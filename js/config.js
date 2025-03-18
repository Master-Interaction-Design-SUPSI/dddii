// Helper function to convert hex to RGB (normalized 0-1 values)
function hexToRGB(hex) {
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export const config = {
  // Colors in hex format (for reference)
  colors: {
    background: "0C0950", // Deep blue background
    particle: "261FB3",   // Blue particles
  },
  
  particle: {
    size: 1.0,
    color: hexToRGB("261FB3"), // Set the particle color using hex value
    colorVariation: 0.0,
  },
  
  behavior: {
    moveSpeed: 1.2,
    sensorDistance: 15,
    sensorAngle: Math.PI / 4,
    rotationSpeed: 0.12,
  },
  
  simulation: {
    initialParticles: 20000,
    maxParticles: 100000,
    clickParticles: 1000,
    dragParticles: 1000,
    batchSize: 256,
    useQuadtree: false,
    useInstancing: false,
    gridCellSize: 5,
  },
  
  rescue: {
    stuckThreshold: 1500,
    checkInterval: 120,
    stuckDistanceThreshold: 5,
    boostMultiplier: 1.5,
    boostDuration: 800,
  },
  
  streets: {
    streetThreshold: 50,
    whiteThreshold: 180,
    streetAttractionMultiplier: 8,
    streetExpansion: 1.2,
  },
  
  water: {
    waterMargin: 3,
    waterDetectionRadius: 3,
  },
  
  mouse: {
    repulsionRadius: 100,
    repulsionStrength: 20.0,
    avoidanceSpeed: 2.0,
  },
  
  performance: {
    enableColorTransitions: false,
    useHighQualityRendering: false,
    updateInterval: 1,
    skipSensorUpdates: 2,
    reduceAlphaSampling: true,
    useBitwiseOperations: true,
    parallelUpdate: false,
  }
};