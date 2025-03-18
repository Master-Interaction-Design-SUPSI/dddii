import { WebGLRenderer } from './webgl.js';
import { ParticleSystem } from './particleSystem.js';
import { InputHandler } from './input.js';
import { SimulationRenderer } from './renderer.js';
import { CanvasUtils } from './utils.js';
import { config } from './config.js';

const simulationConfig = JSON.parse(JSON.stringify(config));
simulationConfig.simulation.initialParticles = 15000;

class SiteBackgroundSimulation {
  constructor() {
    this.canvas = document.getElementById('glCanvas');
    this.gl = null;
    this.webglRenderer = null;
    this.particleSystem = null;
    this.inputHandler = null;
    this.simulationRenderer = null;
    this.loadingText = null;
  }

  async initialize() {
    this.setupCanvas();
    this.initializeWebGL();
    await this.initializeRenderers();
    this.initializeParticleSystem();
    this.initializeInputHandling();
    this.loadMap();
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    Object.defineProperty(this.canvas, 'particleSystem', {
      configurable: true,
      writable: true,
      value: null
    });
  }

  initializeWebGL() {
    this.gl = this.canvas.getContext('webgl2');
    
    if (!this.gl) {
      console.error('WebGL 2 not supported');
      throw new Error('WebGL 2 not supported');
    }
    
    this.gl.clearColor(0.15, 0.0, 0.59, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  async initializeRenderers() {
    this.webglRenderer = await new WebGLRenderer(this.gl).init();
  }

  initializeParticleSystem() {
    this.particleSystem = new ParticleSystem(this.gl, this.webglRenderer, 0, simulationConfig);
    this.canvas.particleSystem = this.particleSystem;
    
    this.simulationRenderer = new SimulationRenderer(this.canvas, this.particleSystem);
  }

  initializeInputHandling() {
    this.inputHandler = new InputHandler(this.canvas, this.particleSystem, simulationConfig);
  }

  loadMap() {
    const mapImage = new Image();
    
    mapImage.onload = async () => {
      requestAnimationFrame(async () => {
        await this.particleSystem.loadMapData(mapImage);
        
        // Start the simulation
        this.simulationRenderer.start();
      });
    };
    
    mapImage.onerror = (err) => {
      console.error("Error loading map image:", err);
      
      requestAnimationFrame(() => {
        this.particleSystem.initParticles(simulationConfig.simulation.initialParticles);
        this.simulationRenderer.start();
      });
    };
    
    mapImage.src = 'map.BMP?v=' + Date.now();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const simulation = new SiteBackgroundSimulation();
    await simulation.initialize();
  } catch (error) {
    console.error('Error initializing simulation:', error);
  }
});