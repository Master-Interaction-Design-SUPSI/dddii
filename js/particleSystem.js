import { Particle } from './particle.js';
import { Vector2, Color, randomInRange } from './utils.js';

export class ParticleSystem {
  constructor(gl, webgl, numParticles, config) {
    this.gl = gl;
    this.webgl = webgl;
    this.config = config;
    this.paused = false;
    
    this.particles = [];
    this.mapProcessor = null;
    this.mousePosition = { x: -1000, y: -1000, active: false };
    
    this.positionBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();
    
    if (numParticles > 0) {
      this.initParticles(numParticles);
    }
  }
  
  initParticles(count) {
    this.particles = [];
    
    const width = this.gl.canvas.width;
    const height = this.gl.canvas.height;
    
    for (let i = 0; i < count; i++) {
      const position = new Vector2(
        Math.random() * width,
        Math.random() * height
      );
      
      const particle = new Particle(position, this.config);
      
      if (!this.mapProcessor || this.mapProcessor.isValidPosition(position.x, position.y, width, height)) {
        this.particles.push(particle);
      }
    }
    
    this.fillRemainingParticles(count);
  }
  
  fillRemainingParticles(targetCount) {
    if (!this.mapProcessor || this.particles.length >= targetCount) return;
    
    const remaining = targetCount - this.particles.length;
    const width = this.gl.canvas.width;
    const height = this.gl.canvas.height;
    
    let attempts = 0;
    const maxAttempts = remaining * 2;
    
    while (this.particles.length < targetCount && attempts < maxAttempts) {
      attempts++;
      
      const position = new Vector2(
        Math.random() * width,
        Math.random() * height
      );
      
      if (this.mapProcessor.isValidPosition(position.x, position.y, width, height)) {
        const particle = new Particle(position, this.config);
        this.particles.push(particle);
      }
    }
  }
  
  async loadMapData(image) {
    const { MapProcessor } = await import('./mapProcessor.js');
    this.mapProcessor = new MapProcessor(image, this.config);
    this.mapProcessor.setStreetAdherence(2.8);
    
    // Store original map dimensions for aspect ratio calculation
    this.originalMapWidth = this.mapProcessor.mapWidth;
    this.originalMapHeight = this.mapProcessor.mapHeight;
    
    // Force canvas resize to apply the aspect ratio clipping now that we have the map dimensions
    const canvas = this.gl.canvas;
    const { CanvasUtils } = await import('./utils.js');
    CanvasUtils.resizeCanvas(canvas);
    
    this.placeParticlesOnStreets(this.config.simulation.initialParticles);
    
    // Reset all particle colors to ensure consistency
    this.resetParticleColors();
  }
  
  placeParticlesOnStreets(count) {
    if (!this.mapProcessor) return;
    
    this.particles = [];
    
    const width = this.gl.canvas.width;
    const height = this.gl.canvas.height;
    
    const streetParticles = Math.floor(count * 0.7);
    const randomParticles = count - streetParticles;
    
    for (let i = 0; i < streetParticles; i++) {
      const validPos = this.mapProcessor.getRandomValidPosition(width, height);
      
      if (validPos) {
        const position = new Vector2(validPos.x, validPos.y);
        const particle = new Particle(position, this.config);
        this.particles.push(particle);
      }
    }
    
    for (let i = 0; i < randomParticles; i++) {
      const position = new Vector2(
        Math.random() * width,
        Math.random() * height
      );
      
      if (this.mapProcessor.isValidPosition(position.x, position.y, width, height)) {
        const particle = new Particle(position, this.config);
        this.particles.push(particle);
      }
    }
    
    // Reset colors to ensure consistent appearance
    this.resetParticleColors();
  }
  
  update() {
    if (this.paused) return;
    
    const deltaTime = 1.0;
    
    for (const particle of this.particles) {
      particle.update(
        this.mapProcessor,
        deltaTime,
        this.gl.canvas.width,
        this.gl.canvas.height,
        this.mousePosition,
        this.config
      );
    }
  }
  
  createParticlesAt(x, y, count) {
    this.removeParticles(count);
    this.addParticlesNearPoint(x, y, count);
    this.enforceMaxParticles();
  }
  
  removeParticles(count) {
    if (this.particles.length < count) return;
    
    const indicesToRemove = new Set();
    while (indicesToRemove.size < count) {
      const randomIndex = Math.floor(Math.random() * this.particles.length);
      indicesToRemove.add(randomIndex);
    }
    
    this.particles = this.particles.filter((_, index) => !indicesToRemove.has(index));
  }
  
  addParticlesNearPoint(x, y, count) {
    const width = this.gl.canvas.width;
    const height = this.gl.canvas.height;
    let created = 0;
    let attempts = 0;
    
    // Try to create particles at the click point
    while (created < count && attempts < count * 2) {
      attempts++;
      
      const radius = Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const position = new Vector2(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      );
      
      if (!this.mapProcessor || this.mapProcessor.isValidPosition(position.x, position.y, width, height)) {
        this.particles.push(new Particle(position, this.config));
        created++;
      }
    }
    
    // If we couldn't create all particles at click point, add remaining at random valid positions
    if (created >= count || !this.mapProcessor) return;
    
    const remaining = count - created;
    for (let i = 0; i < remaining; i++) {
      const validPos = this.mapProcessor.getRandomValidPosition(width, height);
      if (!validPos) continue;
      
      const position = new Vector2(validPos.x, validPos.y);
      this.particles.push(new Particle(position, this.config));
    }
  }
  
  enforceMaxParticles() {
    const maxParticles = this.config.simulation.maxParticles;
    if (this.particles.length <= maxParticles) return;
    
    this.particles = this.particles.slice(0, maxParticles);
  }
  
  updateParticleSpeed(newSpeed) {
    const speedRatio = newSpeed / this.config.behavior.moveSpeed;
    
    this.config.behavior.moveSpeed = newSpeed;
    
    for (const particle of this.particles) {
      particle.speed = particle.speed * speedRatio;
    }
  }
  
  resetParticleColors() {
    const configColor = Color.fromArray(this.config.particle.color);
    
    for (const particle of this.particles) {
      particle.color = configColor;
    }
  }
  
  render() {
    const gl = this.gl;
    const webgl = this.webgl;
    
    // Get background color from config (format is "0C0950")
    const bgHex = this.config.colors.background;
    const bgR = parseInt(bgHex.substring(0, 2), 16) / 255;
    const bgG = parseInt(bgHex.substring(2, 4), 16) / 255;
    const bgB = parseInt(bgHex.substring(4, 6), 16) / 255;
    
    gl.clearColor(bgR, bgG, bgB, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    if (this.particles.length === 0) {
      return;
    }
    
    gl.useProgram(webgl.program);
    
    gl.uniform2f(webgl.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(webgl.uniformLocations.time, performance.now() / 1000.0);
    
    const particleSize = this.config.particle.size * 5.0;
    gl.uniform1f(webgl.uniformLocations.pointSize, particleSize);
    
    const positions = new Float32Array(this.particles.length * 2);
    const colors = new Float32Array(this.particles.length * 3);
    
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const posIndex = i * 2;
      const colorIndex = i * 3;
      
      positions[posIndex] = particle.position.x;
      positions[posIndex + 1] = particle.position.y;
      
      colors[colorIndex] = particle.color.r;
      colors[colorIndex + 1] = particle.color.g;
      colors[colorIndex + 2] = particle.color.b;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(webgl.attribLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(webgl.attribLocations.position);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(webgl.attribLocations.color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(webgl.attribLocations.color);
    
    gl.drawArrays(gl.POINTS, 0, this.particles.length);
  }
}