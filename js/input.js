export class InputHandler {
  constructor(canvas, particleSystem, config) {
    this.canvas = canvas;
    this.particleSystem = particleSystem;
    this.config = config;
    
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.isMouseOnCanvas = false;
    this.isDragging = false;
    this.lastSpawnTime = 0;
    
    // Check if we're on mobile
    this.isMobile = this.checkIfMobile();
    
    this.setupMouseInteraction();
    this.setupKeyboardControls();
  }
  
  // Helper to detect mobile devices
  checkIfMobile() {
    return (window.innerWidth <= 768) || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  setupMouseInteraction() {
    // Track all mouse interactions for full interactivity
    this.canvas.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    
    // Add touch event listeners
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    
    // Disable mouse avoidance effects on mobile by default
    if (this.isMobile) {
      this.particleSystem.mousePosition = {
        x: -1000,
        y: -1000,
        active: false
      };
    }
  }
  
  setupKeyboardControls() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  updateMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
    
    // On mobile devices, never make the mouse position active
    if (this.isMobile) {
      this.particleSystem.mousePosition = {
        x: -1000,
        y: -1000,
        active: false
      };
    } else {
      this.particleSystem.mousePosition = {
        x: this.mouseX,
        y: this.mouseY,
        active: this.isMouseOnCanvas && !this.isDragging
      };
    }
  }
  
  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    this.particleSystem.createParticlesAt(
      clickX,
      clickY,
      this.config.simulation.clickParticles
    );
  }
  
  handleMouseEnter() {
    this.isMouseOnCanvas = true;
  }
  
  handleMouseLeave() {
    this.isMouseOnCanvas = false;
    this.isDragging = false;
    
    this.particleSystem.mousePosition = {
      x: -1000,
      y: -1000,
      active: false
    };
  }
  
  handleMouseMove(event) {
    this.updateMousePosition(event);
    
    if (this.isDragging) {
      const currentTime = Date.now();
      
      if (currentTime - this.lastSpawnTime > 50) {
        this.particleSystem.createParticlesAt(
          this.mouseX,
          this.mouseY,
          this.config.simulation.dragParticles
        );
        
        this.lastSpawnTime = currentTime;
      }
    }
  }
  
  handleMouseDown(event) {
    this.isDragging = true;
    this.updateMousePosition(event);
    this.particleSystem.mousePosition.active = false;
  }
  
  handleMouseUp() {
    this.isDragging = false;
    this.particleSystem.mousePosition.active = this.isMouseOnCanvas;
  }
  
  handleKeyDown(event) {
    switch (event.key) {
      case ' ':
        this.particleSystem.paused = !this.particleSystem.paused;
        return;
        
      case 'c':
        this.particleSystem.particles = [];
        return;
        
      case '+':
      case '=':
        this.addParticles();
        return;
        
      case '-':
        this.removeParticles();
        return;
    }
  }
  
  addParticles() {
    const maxToAdd = 5000;
    const availableSpace = this.config.simulation.maxParticles - this.particleSystem.particles.length;
    if (availableSpace <= 0) return;
    
    const newParticles = Math.min(maxToAdd, availableSpace);
    this.particleSystem.createParticlesAt(
      this.canvas.width / 2,
      this.canvas.height / 2,
      newParticles
    );
  }
  
  removeParticles() {
    const minParticles = 1000;
    if (this.particleSystem.particles.length <= minParticles) return;
    
    const removePercent = 0.1; // Remove 10%
    const newSize = Math.floor(this.particleSystem.particles.length * (1 - removePercent));
    this.particleSystem.particles = this.particleSystem.particles.slice(0, newSize);
  }
  
  handleTouchStart(event) {
    if (!event.touches.length || this.isMobile) return;
    
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    this.particleSystem.createParticlesAt(
      touchX,
      touchY,
      this.config.simulation.clickParticles
    );
  }
  
  handleTouchEnd() {
    // Reset mouse position to avoid stuck avoidance
    this.particleSystem.mousePosition = {
      x: -1000, 
      y: -1000,
      active: false
    };
  }
  
  handleTouchMove(event) {
    if (!event.touches.length) return;
    
    const currentTime = Date.now();
    if (currentTime - this.lastSpawnTime <= 100) return;
    
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    this.particleSystem.createParticlesAt(
      touchX,
      touchY,
      Math.floor(this.config.simulation.dragParticles / 2)
    );
    this.lastSpawnTime = currentTime;
  }
}