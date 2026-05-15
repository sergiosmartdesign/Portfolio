/**
 * Particle System Animation
 * Modern ES6 class implementation with performance optimizations
 * Original concept by Alex Andrix
 */

// Project color palette — hex converted to {h, s} for HSL; lum varies per particle
const PARTICLE_PALETTE = [
  { h: 191, s: 100 }, // #005F73 dark teal
  { h: 181, s: 88  }, // #0A9396 teal
  { h: 162, s: 38  }, // #94D2BD mint
  { h: 43,  s: 62  }, // #E9D8A6 sand
  { h: 39,  s: 100 }, // #EE9B00 amber
  { h: 29,  s: 97  }, // #CA6702 burnt orange
  { h: 20,  s: 95  }, // #BB3E03 rust
  { h: 5,   s: 81  }, // #AE2012 deep red
  { h: 358, s: 62  }, // #9B2226 dark red
];

class ParticleSystem {
  constructor() {
    // Detect Safari for performance optimizations
    const isSafari = window.BrowserDetect ? window.BrowserDetect.isSafariBased() : false;

    // Configuration constants (optimized for Safari)
    this.config = {
      lifespan: 1000,
      popPerBirth: 1,
      maxPop: isSafari ? 100 : 150,  // Reduced particle count on Safari
      birthFreq: 2,
      gridSize: 8,
      gridRadius: 500,
      attractorRadius: 100,
      springConstant: 8,
      viscosity: 0.4,
      zoom: 1.6,
      targetFPS: isSafari ? 30 : 60  // Throttle to 30fps on Safari
    };

    // Animation state
    this.stepCount = 0;
    this.particles = [];
    this.drawnInLastFrame = 0;
    this.deathCount = 0;
    this.isRunning = true;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.config.targetFPS;

    // Palette cycling — one color active at a time, advances every N frames
    this.paletteIndex = 0;
    this.paletteInterval = 400;

    // Color cache for performance
    this.colorCache = new Map();

    // DOM elements (cached)
    this.canvas = null;
    this.ctx = null;
    this.introSection = null;

    // Canvas dimensions (cached)
    this.width = 0;
    this.height = 0;
    this.xC = 0;
    this.yC = 0;

    // Grid system
    this.grid = [];
    this.gridSteps = 0;
    this.gridMaxIndex = 0;

    this.setup();
    this.startAnimationLoop();
  }

  /**
   * Initial setup - creates canvas and builds motion grid
   */
  setup() {
    this.createCanvas();
    this.buildMotionGrid();
    this.initDraw();
    this.attachResizeListener();
  }

  /**
   * Creates and configures canvas element
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particleCanvas';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Cache canvas dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.xC = this.width / 2;
    this.yC = this.height / 2;

    // Insert as first child of intro section
    this.introSection = document.getElementById('intro');
    if (this.introSection) {
      this.introSection.insertBefore(this.canvas, this.introSection.firstChild);
    }

    // Get context and disable smoothing for sharper particles
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
  }

  /**
   * Builds the radial attraction field grid
   */
  buildMotionGrid() {
    const { gridSize, gridRadius, attractorRadius } = this.config;
    this.gridSteps = Math.floor((gridRadius * 2) / gridSize);
    this.grid = [];

    let spotIndex = 0;
    const edgeMin = -gridRadius;
    const edgeMax = edgeMin + gridSize * (this.gridSteps - 1);

    for (let xx = -gridRadius; xx < gridRadius; xx += gridSize) {
      for (let yy = -gridRadius; yy < gridRadius; yy += gridSize) {
        // Calculate radial field strength
        const r = Math.sqrt(xx * xx + yy * yy);
        const field = r < attractorRadius
          ? (255 / attractorRadius) * r
          : 255 - Math.min(255, (r - attractorRadius) / 2);

        // Determine if this is an edge spot
        const isEdge = xx === edgeMin ? 'left'
          : xx === edgeMax ? 'right'
          : yy === edgeMin ? 'top'
          : yy === edgeMax ? 'bottom'
          : false;

        this.grid.push({
          x: xx,
          y: yy,
          busyAge: 0,
          spotIndex: spotIndex++,
          isEdge,
          field
        });
      }
    }
    this.gridMaxIndex = spotIndex;
  }

  /**
   * Main evolution step - called every frame
   */
  evolve() {
    this.stepCount++;
    if (this.stepCount % this.paletteInterval === 0) {
      this.paletteIndex = (this.paletteIndex + 1) % PARTICLE_PALETTE.length;
    }
    this.updateGridAges();

    // Birth new particles when needed
    if (this.shouldBirthParticles()) {
      this.birthParticle();
    }

    this.moveParticles();
    this.draw();
  }

  /**
   * Increment busy ages for all grid spots
   */
  updateGridAges() {
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].busyAge > 0) {
        this.grid[i].busyAge++;
      }
    }
  }

  /**
   * Check if we should birth new particles this frame
   */
  shouldBirthParticles() {
    return this.stepCount % this.config.birthFreq === 0 &&
           (this.particles.length + this.config.popPerBirth) < this.config.maxPop;
  }

  /**
   * Create a new particle at a random grid spot
   */
  birthParticle() {
    const gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex);
    const gridSpot = this.grid[gridSpotIndex];
    const { x, y } = gridSpot;
    const paletteEntry = PARTICLE_PALETTE[this.paletteIndex];

    this.particles.push({
      hue: paletteEntry.h,
      sat: paletteEntry.s,
      lum: 20 + Math.floor(40 * Math.random()),
      x,
      y,
      xLast: x,
      yLast: y,
      xSpeed: 0,
      ySpeed: 0,
      age: 0,
      ageSinceStuck: 0,
      attractor: {
        oldIndex: gridSpotIndex,
        gridSpotIndex
      },
      name: `particle-${Math.ceil(10000000 * Math.random())}`
    });
  }

  /**
   * Remove a particle by name
   */
  killParticle(particleName) {
    this.particles = this.particles.filter(p => p.name !== particleName);
  }

  /**
   * Update all particle positions using spring physics
   */
  moveParticles() {
    const { springConstant, viscosity, lifespan } = this.config;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Save last position
      p.xLast = p.x;
      p.yLast = p.y;

      // Get current attractor grid spot
      let gridSpot = this.grid[p.attractor.gridSpotIndex];

      // Maybe move attractor to neighboring spot
      if (Math.random() < 0.5) {
        gridSpot = this.updateAttractor(p, gridSpot);
      }

      // Kill stuck particles
      if (p.ageSinceStuck >= 10) {
        this.particles.splice(i, 1);
        continue;
      }

      // Apply spring physics
      this.applySpringPhysics(p, gridSpot, springConstant, viscosity);

      // Age and kill old particles
      p.age++;
      if (p.age > lifespan) {
        this.particles.splice(i, 1);
        this.deathCount++;
      }
    }
  }

  /**
   * Update particle's attractor to best neighboring grid spot
   */
  updateAttractor(particle, currentSpot) {
    if (currentSpot.isEdge) {
      particle.ageSinceStuck++;
      return currentSpot;
    }

    // Get neighbor indices
    const index = particle.attractor.gridSpotIndex;
    const neighbors = [
      this.grid[index - 1],              // top
      this.grid[index + 1],              // bottom
      this.grid[index - this.gridSteps], // left
      this.grid[index + this.gridSteps]  // right
    ];

    // Find best neighbor with chaos factor
    const chaos = 30;
    let maxFieldSpot = neighbors[0];
    let maxValue = maxFieldSpot.field + chaos * Math.random();

    for (let i = 1; i < neighbors.length; i++) {
      const value = neighbors[i].field + chaos * Math.random();
      if (value > maxValue) {
        maxValue = value;
        maxFieldSpot = neighbors[i];
      }
    }

    // Move to new spot if available
    if (maxFieldSpot.busyAge === 0 || maxFieldSpot.busyAge > 15) {
      particle.ageSinceStuck = 0;
      particle.attractor.oldIndex = index;
      particle.attractor.gridSpotIndex = maxFieldSpot.spotIndex;
      maxFieldSpot.busyAge = 1;
      return maxFieldSpot;
    }

    particle.ageSinceStuck++;
    return currentSpot;
  }

  /**
   * Apply spring physics to move particle toward attractor
   */
  applySpringPhysics(particle, attractor, k, visc) {
    const dx = particle.x - attractor.x;
    const dy = particle.y - attractor.y;

    // Spring force (Hooke's law)
    particle.xSpeed += -k * dx;
    particle.ySpeed += -k * dy;

    // Viscosity damping
    particle.xSpeed *= visc;
    particle.ySpeed *= visc;

    // Store distance and speed for rendering
    particle.speed = Math.sqrt(particle.xSpeed * particle.xSpeed + particle.ySpeed * particle.ySpeed);
    particle.dist = Math.sqrt(dx * dx + dy * dy);

    // Update position
    particle.x += 0.1 * particle.xSpeed;
    particle.y += 0.1 * particle.ySpeed;
  }

  /**
   * Initial canvas clear
   */
  initDraw() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw all particles with trails
   */
  draw() {
    this.drawnInLastFrame = 0;
    if (!this.particles.length) return;

    // Fade effect for trails
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Batch drawing operations
    this.particles.forEach(p => {
      this.drawParticle(p);
      this.drawnInLastFrame++;
    });
  }

  /**
   * Get cached color string for particle
   */
  getColor(particle) {
    const h = particle.hue;
    const s = particle.sat;
    const l = particle.lum;
    const cacheKey = `${h}-${s}-${l}`;

    if (!this.colorCache.has(cacheKey)) {
      this.colorCache.set(cacheKey, `hsla(${h}, ${s}%, ${l}%, 1)`);
      // Limit cache size
      if (this.colorCache.size > 100) {
        const firstKey = this.colorCache.keys().next().value;
        this.colorCache.delete(firstKey);
      }
    }

    return this.colorCache.get(cacheKey);
  }

  /**
   * Draw individual particle with trail and attractor
   */
  drawParticle(particle) {
    // Get cached color
    const color = this.getColor(particle);

    // Transform coordinates
    const last = this.dataToCanvasXY(particle.xLast, particle.yLast);
    const now = this.dataToCanvasXY(particle.x, particle.y);

    const attracSpot = this.grid[particle.attractor.gridSpotIndex];
    const attracXY = this.dataToCanvasXY(attracSpot.x, attracSpot.y);

    const oldAttracSpot = this.grid[particle.attractor.oldIndex];
    const oldAttracXY = this.dataToCanvasXY(oldAttracSpot.x, oldAttracSpot.y);

    // Draw particle trail
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.moveTo(last.x, last.y);
    this.ctx.lineTo(now.x, now.y);
    this.ctx.stroke();

    // Draw attractor positions
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
    this.ctx.lineTo(attracXY.x, attracXY.y);
    this.ctx.arc(attracXY.x, attracXY.y, 1.5, 0, 2 * Math.PI, false);
    this.ctx.stroke();
    this.ctx.fill();
  }

  /**
   * Transform data coordinates to canvas coordinates
   */
  dataToCanvasXY(x, y) {
    return {
      x: this.xC + x * this.config.zoom,
      y: this.yC + y * this.config.zoom
    };
  }

  /**
   * Handle window resize
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.xC = this.width / 2;
    this.yC = this.height / 2;
  }

  /**
   * Attach resize event listener
   */
  attachResizeListener() {
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Start the animation loop with FPS throttling
   */
  startAnimationLoop() {
    const frame = (currentTime) => {
      requestAnimationFrame(frame);

      if (!this.isRunning) return;

      // Throttle frame rate for performance (especially on Safari)
      const elapsed = currentTime - this.lastFrameTime;
      if (elapsed < this.frameInterval) return;

      this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
      this.evolve();
    };
    requestAnimationFrame(frame);
  }

  /**
   * Pause the animation
   */
  pause() {
    this.isRunning = false;
  }

  /**
   * Resume the animation
   */
  resume() {
    this.isRunning = true;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem();

  // Expose globally for animation optimizer
  window.ParticleSystem = {
    pause: () => particleSystem.pause(),
    resume: () => particleSystem.resume()
  };
});
