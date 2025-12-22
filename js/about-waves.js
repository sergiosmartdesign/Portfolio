/**
 * Wave Animation for Illustration Section
 * ES6 class implementation with warm color palette
 */

class Utils {
  static randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  static mapRange(value, inputMin, inputMax, outputMin, outputMax, clamp) {
    if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
      return outputMin;
    }

    let outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);

    if (clamp) {
      if (outputMax < outputMin) {
        outVal = Math.max(outputMax, Math.min(outputMin, outVal));
      } else {
        outVal = Math.max(outputMin, Math.min(outputMax, outVal));
      }
    }

    return outVal;
  }

  /**
   * Ease-in-out cubic function for smooth animations
   */
  static easeInOutCubic(progress) {
    return progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }
}

// Initialize SimplexNoise with seed
Utils.simplex = new SimplexNoise('warm-waves');

class AboutWaves {
  constructor() {
    // Detect Safari for performance optimizations
    const isSafari = window.BrowserDetect ? window.BrowserDetect.isSafariBased() : false;

    this.config = {
      bgColor: '#1a0000',
      colorSchema: [
        '#9B2226', '#AE2012', '#BB3E03', '#CA6702',
        '#EE9B00', '#E9D8A6', '#ff3c00', '#ff6b35'
      ],
      numOfLayers: 8,
      revealDuration: 1.0,
      revealStagger: 0.3,
      waveAmplitudeMultiplier: 5,
      noiseZoom: 0.025,
      angleIncrement: 0.0005,
      progressIncrement: 0.0008,
      segmentBaseSize: isSafari ? 15 : 10,  // Larger segments = fewer calculations on Safari
      useShadowCanvas: !isSafari  // Disable double buffering on Safari
    };

    // Canvas elements (cached)
    this.canvas = document.getElementById('illustrationCanvas');
    if (!this.canvas) {
      console.warn('[About Waves] Illustration canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    // Conditionally use shadow canvas (disabled on Safari for performance)
    if (this.config.useShadowCanvas) {
      this.shadowCanvas = document.createElement('canvas');
      this.shadowCtx = this.shadowCanvas.getContext('2d');
    } else {
      this.shadowCanvas = this.canvas;
      this.shadowCtx = this.ctx;
    }

    // Animation state
    this.timestamp = 0;
    this.startTime = null;
    this.animationFrame = null;
    this.isAnimating = false;
    this.isReversing = false;

    // Canvas dimensions (cached)
    this.wWidth = 0;
    this.wHeight = 0;
    this.wCenterX = 0;
    this.wCenterY = 0;
    this.wHypot = 0;
    this.wMin = 0;

    // Wave rotation angle
    this.angle = Math.PI * 0.25;

    // Wave layers
    this.layers = [];

    this.init();
  }

  /**
   * Initialize canvas and start animation loop
   */
  init() {
    this.setupCanvas();
    this.setupIntersectionObserver();
    this.attachResizeListener();
    this.update();
  }

  /**
   * Setup canvas dimensions and layers
   */
  setupCanvas() {
    this.canvas.width = this.wWidth = window.innerWidth;
    this.canvas.height = this.wHeight = window.innerHeight;

    // Set shadow canvas size if using separate canvas
    if (this.config.useShadowCanvas && this.shadowCanvas !== this.canvas) {
      this.shadowCanvas.width = this.wWidth;
      this.shadowCanvas.height = this.wHeight;
    }

    this.wCenterX = this.wWidth / 2;
    this.wCenterY = this.wHeight / 2;
    this.wHypot = Math.hypot(this.wWidth, this.wHeight);
    this.wMin = Math.min(this.wWidth, this.wHeight);

    this.layers = this.generateLayers();
  }

  /**
   * Generate wave layers with staggered reveal delays
   */
  generateLayers() {
    const layers = [];
    const { numOfLayers, colorSchema, revealStagger } = this.config;

    for (let lid = 0; lid <= numOfLayers; lid++) {
      layers.push({
        id: lid,
        progress: 1 - (lid / numOfLayers),
        color: colorSchema[lid % colorSchema.length],
        opacity: 0,  // Start invisible
        revealDelay: lid * revealStagger
      });
    }

    return layers;
  }

  /**
   * Setup Intersection Observer for scroll-triggered animations
   */
  setupIntersectionObserver() {
    const illustrationSection = document.getElementById('illustration');
    if (!illustrationSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          this.startRevealAnimation();
        } else if (!entry.isIntersecting || entry.intersectionRatio <= 0.2) {
          this.startExitAnimation();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(illustrationSection);
  }

  /**
   * Attach window resize listener
   */
  attachResizeListener() {
    window.addEventListener('resize', () => this.setupCanvas());
  }

  /**
   * Start the reveal (fade-in) animation
   */
  startRevealAnimation() {
    if (this.isAnimating && !this.isReversing) return;

    this.isAnimating = true;
    this.isReversing = false;

    // Reset all layers to invisible
    this.layers.forEach(layer => { layer.opacity = 0; });
    this.startTime = null;
  }

  /**
   * Start the exit (fade-out) animation
   */
  startExitAnimation() {
    if (this.isAnimating && this.isReversing) return;

    // Only trigger if waves are visible
    const anyVisible = this.layers.some(layer => layer.opacity > 0);
    if (!anyVisible) return;

    this.isAnimating = true;
    this.isReversing = true;
    this.startTime = null;
  }

  /**
   * Calculate layer opacity based on animation progress
   */
  calculateLayerOpacity(layer, elapsedTime) {
    const { revealDuration } = this.config;

    if (this.isReversing) {
      // Reverse animation: fade out from right to left
      const maxDelay = (this.config.numOfLayers - 1) * this.config.revealStagger;
      const reverseDelay = maxDelay - layer.revealDelay;
      const startTime = reverseDelay;
      const endTime = startTime + revealDuration;

      if (elapsedTime < startTime) return layer.opacity;
      if (elapsedTime >= endTime) return 0;

      const progress = (elapsedTime - startTime) / revealDuration;
      return 1 - Utils.easeInOutCubic(progress);
    } else {
      // Forward animation: fade in from left to right
      const startTime = layer.revealDelay;
      const endTime = startTime + revealDuration;

      if (elapsedTime < startTime) return 0;
      if (elapsedTime >= endTime) return 1;

      const progress = (elapsedTime - startTime) / revealDuration;
      return Utils.easeInOutCubic(progress);
    }
  }

  /**
   * Draw a single wave layer
   */
  drawLayer(ctx, layer) {
    if (layer.opacity <= 0) return;

    const { waveAmplitudeMultiplier, noiseZoom, segmentBaseSize } = this.config;
    const segmentCount = Math.round(this.wHypot / segmentBaseSize);
    const segmentSize = this.wHypot / segmentCount;
    const waveAmplitude = segmentSize * waveAmplitudeMultiplier;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(this.wCenterX, this.wCenterY);
    ctx.rotate(this.angle);

    // Build wave path
    ctx.beginPath();
    ctx.moveTo(-this.wHypot / 2, this.wHypot / 2 - (this.wHypot * layer.progress));
    ctx.lineTo(-this.wHypot / 2, this.wHypot / 2);
    ctx.lineTo(this.wHypot / 2, this.wHypot / 2);
    ctx.lineTo(this.wHypot / 2, this.wHypot / 2 - (this.wHypot * layer.progress));

    // Generate wave shape using simplex noise
    for (let sid = 1; sid <= segmentCount; sid++) {
      const noise = Utils.simplex.noise3D(sid * noiseZoom, layer.id * 0.5, this.timestamp);
      const heightOffset = noise * waveAmplitude;

      ctx.lineTo(
        (this.wHypot / 2) - (sid * segmentSize),
        this.wHypot / 2 - (this.wHypot * layer.progress) + heightOffset
      );
    }

    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw all visible layers to the context
   */
  draw(ctx) {
    // Draw background
    ctx.fillStyle = this.config.bgColor;
    ctx.fillRect(0, 0, this.wWidth, this.wHeight);

    // Draw all layers
    this.layers.forEach(layer => this.drawLayer(ctx, layer));
  }

  /**
   * Main animation loop update
   */
  update(t) {
    if (t) {
      // Initialize start time for animation
      if (this.isAnimating && !this.startTime) {
        this.startTime = t;
      }

      this.timestamp = t / 5000;
      this.angle += this.config.angleIncrement;

      let shiftNeeded = false;
      let animationComplete = true;

      // Update layer opacities and progress
      this.layers.forEach(layer => {
        if (this.isAnimating && this.startTime) {
          const elapsedTime = (t - this.startTime) / 1000;
          const newOpacity = this.calculateLayerOpacity(layer, elapsedTime);

          layer.opacity = newOpacity;

          // Check if animation is still in progress
          if ((this.isReversing && newOpacity > 0) || (!this.isReversing && newOpacity < 1)) {
            animationComplete = false;
          }
        }

        // Wave movement
        layer.progress += this.config.progressIncrement;

        // Check if layer needs to wrap around
        if (layer.progress > 1 + (1 / (this.layers.length - 1))) {
          layer.progress = 0;
          shiftNeeded = true;
        }
      });

      // Stop animation flag when complete
      if (this.isAnimating && animationComplete) {
        this.isAnimating = false;
      }

      // Rotate layers array for continuous wave effect
      if (shiftNeeded) {
        this.layers.push(this.layers.shift());
      }

      this.draw(this.shadowCtx);
    }

    // Copy from shadow canvas to main canvas only if using double buffering
    if (this.config.useShadowCanvas && this.shadowCanvas !== this.canvas) {
      this.ctx.clearRect(0, 0, this.wWidth, this.wHeight);
      this.ctx.drawImage(this.shadowCanvas, 0, 0);
    }

    this.animationFrame = window.requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Clean up animation
   */
  destroy() {
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AboutWaves());
} else {
  new AboutWaves();
}
