import { CanvasUtils } from './utils.js';

export class MapProcessor {
  constructor(image, config) {
    this.config = config;
    this.imageData = null;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.validPositions = [];
    this.streetAdherence = 2.0;
    
    if (image) {
      this.processImage(image);
    }
  }

  processImage(image) {
    const imageData = CanvasUtils.extractImageData(image);
    this.mapWidth = image.width;
    this.mapHeight = image.height;
    this.imageData = imageData.data;
    this.buildValidPositionsCache();
    
    return this.imageData;
  }

  buildValidPositionsCache() {
    this.validPositions = [];
    
    for (let y = 0; y < this.mapHeight; y += 2) {
      for (let x = 0; x < this.mapWidth; x += 2) {
        const i = (y * this.mapWidth + x) * 4;
        
        if (i < 0 || i >= this.imageData.length - 3) continue;
        
        const r = this.imageData[i];
        const g = this.imageData[i+1];
        const b = this.imageData[i+2];
        
        if (this.isStreet(r, g, b) && !this.isNearWater(x, y, this.config.water.waterMargin)) {
          this.validPositions.push({ x, y });
        }
      }
    }
    
    return this.validPositions;
  }

  isStreet(r, g, b) {
    const brightness = (r + g + b) / 3;
    return brightness < this.config.streets.streetThreshold;
  }

  isWater(r, g, b) {
    return (r > 180 && g < 100 && b < 100);
  }
  
  isNearWater(mapX, mapY, radius) {
    if (!this.imageData) return false;
    
    const radiusSquared = radius * radius;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        
        const checkX = mapX + dx;
        const checkY = mapY + dy;
        const idx = (checkY * this.mapWidth + checkX) * 4;
        
        if (idx < 0 || idx >= this.imageData.length - 3) continue;
        
        const r = this.imageData[idx];
        const g = this.imageData[idx+1];
        const b = this.imageData[idx+2];
        
        if (this.isWater(r, g, b)) return true;
      }
    }
    
    return false;
  }

  canvasToMapCoordinates(canvasX, canvasY, canvasWidth, canvasHeight) {
    const canvasAspect = canvasWidth / canvasHeight;
    const mapAspect = this.mapWidth / this.mapHeight;
    
    let scale, mapX, mapY, offsetX = 0, offsetY = 0;
    
    if (canvasAspect >= mapAspect) {
      scale = this.mapWidth / canvasWidth;
      mapX = canvasX * scale;
      
      offsetY = (this.mapHeight - (canvasHeight * scale)) / 2;
      mapY = (canvasY * scale) + offsetY;
      
      mapY = Math.max(0, Math.min(this.mapHeight - 1, mapY));
    } else {
      scale = this.mapHeight / canvasHeight;
      mapY = canvasY * scale;
      
      offsetX = (this.mapWidth - (canvasWidth * scale)) / 2;
      mapX = (canvasX * scale) + offsetX;
      
      mapX = Math.max(0, Math.min(this.mapWidth - 1, mapX));
    }
    
    return { x: mapX, y: mapY };
  }
  
  mapToCanvasCoordinates(mapX, mapY, canvasWidth, canvasHeight) {
    const canvasAspect = canvasWidth / canvasHeight;
    const mapAspect = this.mapWidth / this.mapHeight;
    
    let scale, canvasX, canvasY, offsetX = 0, offsetY = 0;
    
    if (canvasAspect >= mapAspect) {
      scale = canvasWidth / this.mapWidth;
      canvasX = mapX * scale;
      
      offsetY = (canvasHeight - (this.mapHeight * scale)) / 2;
      canvasY = (mapY * scale) + offsetY;
    } else {
      scale = canvasHeight / this.mapHeight;
      canvasY = mapY * scale;
      
      offsetX = (canvasWidth - (this.mapWidth * scale)) / 2;
      canvasX = (mapX * scale) + offsetX;
    }
    
    return { x: canvasX, y: canvasY };
  }

  isValidPosition(x, y, canvasWidth, canvasHeight) {
    if (!this.imageData) return true;
    
    // Check canvas boundaries
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return false;
    
    const mapCoords = this.canvasToMapCoordinates(x, y, canvasWidth, canvasHeight);
    const mapX = Math.floor(mapCoords.x);
    const mapY = Math.floor(mapCoords.y);
    
    // Check map boundaries
    if (!this.isValidMapCoord(mapX, mapY)) return false;
    
    const i = (mapY * this.mapWidth + mapX) * 4;
    if (i < 0 || i >= this.imageData.length - 3) return false;
    
    // Position is valid if it's not water
    const r = this.imageData[i];
    const g = this.imageData[i+1];
    const b = this.imageData[i+2];
    return !this.isWater(r, g, b);
  }

  getRandomValidPosition(canvasWidth, canvasHeight) {
    if (this.validPositions.length === 0) return null;
    
    const pos = this.validPositions[Math.floor(Math.random() * this.validPositions.length)];
    
    // Convert from map to canvas coordinates
    return this.mapToCanvasCoordinates(pos.x, pos.y, canvasWidth, canvasHeight);
  }

  senseTerrainValue(x, y, canvasWidth, canvasHeight) {
    if (!this.imageData) return 0.5;
    
    const mapCoords = this.canvasToMapCoordinates(x, y, canvasWidth, canvasHeight);
    const mapX = Math.floor(mapCoords.x);
    const mapY = Math.floor(mapCoords.y);
    
    
    const i = (mapY * this.mapWidth + mapX) * 4;
    if (i < 0 || i >= this.imageData.length - 3) return 0.1;
    
    const r = this.imageData[i];
    const g = this.imageData[i+1];
    const b = this.imageData[i+2];
    
    return this.isStreet(r, g, b) 
      ? this.streetAdherence
      : 0.05 / (this.streetAdherence / 2);
  }
  
  isValidMapCoord(x, y) {
    return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
  }

  setStreetAdherence(value) {
    this.streetAdherence = parseFloat(value);
  }
}