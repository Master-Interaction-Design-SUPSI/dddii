import { Vector2, Color } from './utils.js';

export class Particle {
  constructor(position, config) {
    this.position = position || new Vector2();
    this.angle = Math.random() * Math.PI * 2;
    this.speed = config.behavior.moveSpeed * (0.8 + Math.random() * 0.4);
    // Always use the same particle color from config without any variation
    this.color = Color.fromArray(config.particle.color);
    this.lastUpdateTime = performance.now();
    this.stuckTime = 0;
    this.boostTime = 0;
    this.lastSensorValue = 1.0;
  }

  update(mapProcessor, deltaTime, canvasWidth, canvasHeight, mousePosition, config) {
    if (!mapProcessor.isValidPosition(this.position.x, this.position.y, canvasWidth, canvasHeight)) {
      this.relocate(mapProcessor, canvasWidth, canvasHeight);
      return;
    }
    
    this.senseTerrain(mapProcessor, canvasWidth, canvasHeight, config);
    this.steer(this.sensorLeft, this.sensorCenter, this.sensorRight, config);
    this.avoidMouse(mousePosition, config);
    this.move(deltaTime, canvasWidth, canvasHeight);
    // No longer calling updateColor to maintain consistent particle color
  }
  
  senseTerrain(mapProcessor, canvasWidth, canvasHeight, config) {
    const sensorDistance = config.behavior.sensorDistance;
    const sensorAngle = config.behavior.sensorAngle;
    
    const leftSensorPos = Vector2.fromAngle(this.angle - sensorAngle, sensorDistance).add(this.position);
    const centerSensorPos = Vector2.fromAngle(this.angle, sensorDistance).add(this.position);
    const rightSensorPos = Vector2.fromAngle(this.angle + sensorAngle, sensorDistance).add(this.position);
    
    this.sensorLeft = mapProcessor.senseTerrainValue(leftSensorPos.x, leftSensorPos.y, canvasWidth, canvasHeight);
    this.sensorCenter = mapProcessor.senseTerrainValue(centerSensorPos.x, centerSensorPos.y, canvasWidth, canvasHeight);
    this.sensorRight = mapProcessor.senseTerrainValue(rightSensorPos.x, rightSensorPos.y, canvasWidth, canvasHeight);
    this.lastSensorValue = mapProcessor.senseTerrainValue(this.position.x, this.position.y, canvasWidth, canvasHeight);
  }

  steer(sensorLeft, sensorCenter, sensorRight, config) {
    const maxSensor = Math.max(sensorLeft, sensorCenter, sensorRight);
    const adherenceMultiplier = maxSensor / 2;
    const leftRightDiff = Math.abs(sensorLeft - sensorRight);
    const steeringStrength = leftRightDiff * adherenceMultiplier;
    const rotSpeed = config.behavior.rotationSpeed;
    
    if (sensorCenter > sensorLeft && sensorCenter > sensorRight) return;
    
    if (sensorLeft > sensorRight) {
      this.angle -= rotSpeed * steeringStrength;
      return;
    }
    
    if (sensorRight > sensorLeft) {
      this.angle += rotSpeed * steeringStrength;
      return;
    }
    
    const randomFactor = 2.0 / Math.max(1, adherenceMultiplier);
    this.angle += (Math.random() - 0.5) * rotSpeed * randomFactor;
  }

  avoidMouse(mousePosition, config) {
    if (!mousePosition.active) return;
    
    const distToMouse = new Vector2(this.position.x, this.position.y)
      .distance(new Vector2(mousePosition.x, mousePosition.y));
    
    if (distToMouse < config.mouse.repulsionRadius) {
      const awayAngle = Math.atan2(
        this.position.y - mousePosition.y,
        this.position.x - mousePosition.x
      );
      
      const angleDiff = awayAngle - this.angle;
      const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      this.angle += normalizedDiff * 0.1;
    }
  }

  move(deltaTime, canvasWidth, canvasHeight) {
    const baseSpeed = this.speed;
    const streetValue = Math.max(0.1, Math.min(20, this.lastSensorValue || 1.0));
    const isOnStreet = streetValue > 1.5;
    
    const speedMultiplier = isOnStreet 
      ? 1.0 + (streetValue / 10)
      : 1.0 / (1.0 + (streetValue / 5));
    
    const adjustedSpeed = baseSpeed * speedMultiplier;
    const movement = Vector2.fromAngle(this.angle, adjustedSpeed);
    this.position = this.position.add(movement);
    
    this.wrapPosition(canvasWidth, canvasHeight);
  }
  
  wrapPosition(canvasWidth, canvasHeight) {
    if (this.position.x < 0) this.position.x = canvasWidth;
    if (this.position.x > canvasWidth) this.position.x = 0;
    if (this.position.y < 0) this.position.y = canvasHeight;
    if (this.position.y > canvasHeight) this.position.y = 0;
  }
  
  relocate(mapProcessor, canvasWidth, canvasHeight) {
    const validPos = mapProcessor.getRandomValidPosition(canvasWidth, canvasHeight);
    
    if (validPos) {
      this.position = new Vector2(validPos.x, validPos.y);
      this.angle = Math.random() * Math.PI * 2;
      this.color = Color.fromArray(mapProcessor.config.particle.color);
      return;
    }
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 4;
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * Math.sqrt(Math.random());
    
    this.position = new Vector2(
      centerX + distance * Math.cos(angle),
      centerY + distance * Math.sin(angle)
    );
    this.angle = Math.random() * Math.PI * 2;
    this.color = Color.fromArray(mapProcessor.config.particle.color);
  }
}