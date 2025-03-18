import { CanvasUtils } from './utils.js';

export class SimulationRenderer {
  constructor(canvas, particleSystem) {
    this.canvas = canvas;
    this.particleSystem = particleSystem;
    this.animationStarted = false;
    this.renderHandle = null;
    this.lastFrameTime = 0;
  }
  
  start() {
    if (!this.animationStarted) {
      this.animationStarted = true;
      this.lastFrameTime = performance.now();
      this.renderHandle = requestAnimationFrame(this.render.bind(this));
    }
  }
  
  stop() {
    if (this.renderHandle) {
      cancelAnimationFrame(this.renderHandle);
      this.renderHandle = null;
      this.animationStarted = false;
    }
  }
  
  render(timestamp) {
    CanvasUtils.resizeCanvas(this.canvas);
    
    this.particleSystem.update();
    this.particleSystem.render();
    
    this.renderHandle = requestAnimationFrame(this.render.bind(this));
  }
  
  showLoadingMessage() {
    const loadingText = document.createElement('div');
    loadingText.style.position = 'absolute';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translate(-50%, -50%)';
    loadingText.style.color = 'white';
    loadingText.style.fontFamily = 'Arial, sans-serif';
    loadingText.style.fontSize = '24px';
    loadingText.textContent = 'Loading simulation...';
    
    document.body.appendChild(loadingText);
    
    return loadingText;
  }
  
  removeLoadingMessage(loadingText) {
    if (loadingText && loadingText.parentNode) {
      document.body.removeChild(loadingText);
    }
  }
}