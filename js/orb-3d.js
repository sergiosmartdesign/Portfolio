/**
 * 3D Particle Orb Animation
 * ES6 class implementation with optimized CSS generation
 */

class Orb3D {
  constructor() {
    // Detect Safari for performance optimizations
    const isSafari = window.BrowserDetect ? window.BrowserDetect.isSafariBased() : false;

    this.config = {
      total: isSafari ? 150 : 300,  // Reduced particle count on Safari
      orbSize: 100,
      particleSize: 2,
      animationTime: 14,
      baseHue: 180,
      baseDelay: 0,
      delayIncrement: 0.01,
      hueShift: 40
    };

    // Cache DOM elements
    this.introSection = null;
    this.orbWrap = null;

    this.init();
  }

  /**
   * Initialize the orb by creating HTML and CSS
   */
  init() {
    this.introSection = document.getElementById('intro');
    if (!this.introSection) {
      console.warn('[3D Orb] Intro section not found');
      return;
    }

    this.createOrbHTML();
    this.generateOrbCSS();
  }

  /**
   * Create the orb container and particle elements
   */
  createOrbHTML() {
    // Create wrapper
    this.orbWrap = document.createElement('div');
    this.orbWrap.className = 'orb-wrap';
    this.orbWrap.id = 'orb3d';

    // Create all particles in a document fragment for better performance
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.config.total; i++) {
      const particle = document.createElement('div');
      particle.className = 'orb-particle';
      fragment.appendChild(particle);
    }
    this.orbWrap.appendChild(fragment);

    // Insert as second child (after particle canvas)
    const firstChild = this.introSection.firstChild;
    if (firstChild && firstChild.nextSibling) {
      this.introSection.insertBefore(this.orbWrap, firstChild.nextSibling);
    } else {
      this.introSection.appendChild(this.orbWrap);
    }
  }

  /**
   * Generate optimized CSS animations for all particles
   */
  generateOrbCSS() {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'orb-3d-animations';

    // Build CSS rules array for batch processing
    const cssRules = [];

    for (let i = 1; i <= this.config.total; i++) {
      const { particleCSS, keyframeCSS } = this.generateParticleAnimation(i);
      cssRules.push(particleCSS, keyframeCSS);
    }

    // Single DOM write for all CSS
    styleSheet.textContent = cssRules.join('\n');
    document.head.appendChild(styleSheet);
  }

  /**
   * Generate CSS for individual particle
   */
  generateParticleAnimation(index) {
    const { animationTime, baseDelay, delayIncrement, orbSize, baseHue, hueShift, total } = this.config;

    // Random rotation angles
    const zAngle = this.randomInt(0, 360);
    const yAngle = this.randomInt(0, 360);

    // Calculate hue gradient
    const hue = ((hueShift / total * index) + baseHue) % 360;

    // Staggered delay
    const delay = (baseDelay + index * delayIncrement).toFixed(2);

    // Particle-specific styles
    const particleCSS = `.orb-particle:nth-child(${index}) {` +
      `animation: orbit${index} ${animationTime}s infinite;` +
      `animation-delay: ${delay}s;` +
      `background-color: hsla(${hue}, 100%, 50%, 1);` +
      `}`;

    // Keyframe animation with four stages: fade in, form orb, hold, explode
    const keyframeCSS = `@keyframes orbit${index} {` +
      `20% { opacity: 1; }` +  // Fade in complete
      `30% {` +  // Form orb
        `transform: rotateZ(${-zAngle}deg) rotateY(${yAngle}deg) ` +
        `translateX(${orbSize}px) rotateZ(${zAngle}deg);` +
      `}` +
      `80% {` +  // Hold orb
        `transform: rotateZ(${-zAngle}deg) rotateY(${yAngle}deg) ` +
        `translateX(${orbSize}px) rotateZ(${zAngle}deg);` +
        `opacity: 1;` +
      `}` +
      `100% {` +  // Explode outward
        `transform: rotateZ(${-zAngle}deg) rotateY(${yAngle}deg) ` +
        `translateX(${orbSize * 3}px) rotateZ(${zAngle}deg);` +
      `}` +
      `}`;

    return { particleCSS, keyframeCSS };
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pause the orb animation
   */
  pause() {
    if (this.orbWrap) {
      this.orbWrap.style.animationPlayState = 'paused';
    }
  }

  /**
   * Resume the orb animation
   */
  resume() {
    if (this.orbWrap) {
      this.orbWrap.style.animationPlayState = 'running';
    }
  }
}

// Initialize when DOM is ready
(() => {
  const init = () => {
    const orb = new Orb3D();

    // Expose pause/resume methods globally
    window.Orb3D = {
      pause: () => orb.pause(),
      resume: () => orb.resume()
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
