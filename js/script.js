/**
 * Main Application Script
 * Organized into modular ES6 classes for better maintainability
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

const TIMING = {
  CYBER_PANEL_DELAY: 2000,
  BARCODE_START_DELAY: 2000,
  BARCODE_LOOP_INTERVAL: 4000,
  DNA_GLITCH_DELAY: 500,
  DNA_REVEAL_DELAY: 3000,
  DNA_LETTER_DELAY: 100,
  DNA_START_DELAY: 500,
  NAV_SCROLL_DELAY: 100,
  NAV_DEBOUNCE: 50
};

// ============================================================================
// GLITCH SYSTEM - Manages all glitch effects
// ============================================================================

class GlitchSystem {
  constructor() {
    this.glitchChars = GLITCH_CHARS;
    this.initSplitting();
    this.initLogoGlitch();
  }

  /**
   * Initialize Splitting.js for all glitch text elements
   */
  initSplitting() {
    const results = window.Splitting({
      target: '.glitch-text',
      by: 'chars'
    });

    results.forEach(result => {
      const chars = result.chars;
      if (!result.el.classList.contains('reveal--0')) {
        result.el.classList.add('reveal--0');
      }

      chars.forEach(char => {
        char.style.setProperty('--count', Math.random() * 5 + 1);
        for (let g = 0; g < 10; g++) {
          const randomChar = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
          char.style.setProperty(`--char-${g}`, `"${randomChar}"`);
        }
      });
    });

    // Initialize ScrollOut for scroll-based animations
    window.ScrollOut({ targets: '.glitch-text' });
  }

  /**
   * Add glitch animation to logo on hover
   */
  initLogoGlitch() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    logo.addEventListener('mouseenter', function() {
      const chars = this.querySelectorAll('[data-char]');
      chars.forEach((char, index) => {
        char.style.animation = 'none';
        void char.offsetWidth;  // Force reflow
        char.style.animation = `glitch-switch 0.2s steps(1) ${index * 0.05}s ${10} backwards`;
      });
    });

    logo.addEventListener('mouseleave', function() {
      const chars = this.querySelectorAll('[data-char]');
      chars.forEach((char) => {
        char.style.animation = 'none';
        void char.offsetWidth;  // Force reflow
        char.style.animation = '';
      });
    });
  }

  /**
   * Initialize DNA text glitch effect
   */
  initDNAGlitch() {
    const dnaSpans = document.querySelectorAll('.scene .text span');
    if (!dnaSpans.length) return;

    // Store original text for each span
    const originalTexts = new Map();
    dnaSpans.forEach(span => originalTexts.set(span, span.textContent));

    // Glitch a single span temporarily
    const glitchSpan = (span, duration = 100) => {
      const originalText = originalTexts.get(span);
      const glitchText = Array.from(originalText)
        .map(char => {
          if (char === ' ' || char === '·' || char === '-') return char;
          return Math.random() > 0.5 ? char : this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
        })
        .join('');

      span.textContent = glitchText;
      setTimeout(() => { span.textContent = originalText; }, duration);
    };

    // Initial load glitch with staggered timing
    dnaSpans.forEach((span, index) => {
      setTimeout(() => {
        let glitchCount = 0;
        const maxGlitches = Math.floor(Math.random() * 5) + 3;

        const glitchInterval = setInterval(() => {
          glitchSpan(span, 80);
          glitchCount++;
          if (glitchCount >= maxGlitches) {
            clearInterval(glitchInterval);
          }
        }, 150);
      }, index * 50);
    });

    // Occasional random glitches
    setInterval(() => {
      const randomSpan = dnaSpans[Math.floor(Math.random() * dnaSpans.length)];
      if (Math.random() > 0.95) {
        glitchSpan(randomSpan, 60);
      }
    }, 500);
  }

  /**
   * Animate DNA text reveal letter by letter
   */
  animateDNAReveal() {
    const masteringText = document.querySelector('.text[style*="--text: 0"]');
    const brandDNAText = document.querySelector('.text[style*="--text: 2"]');

    if (!masteringText || !brandDNAText) return;

    const masteringSpans = Array.from(masteringText.querySelectorAll('span'));
    const brandDNASpans = Array.from(brandDNAText.querySelectorAll('span'));

    setTimeout(() => {
      // Animate "Mastering" forward
      masteringSpans.forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('revealed');
        }, index * TIMING.DNA_LETTER_DELAY);
      });

      // Animate "Your Brand's DNA" backward
      brandDNASpans.reverse().forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('revealed');
        }, index * TIMING.DNA_LETTER_DELAY);
      });
    }, TIMING.DNA_START_DELAY);
  }
}

// ============================================================================
// NAVIGATION MANAGER - Handles section navigation and active states
// ============================================================================

class NavigationManager {
  constructor() {
    this.navButtons = document.querySelectorAll('.main-nav .nav-btn');
    this.sections = document.querySelectorAll('main section');
    this.sectionToButton = new Map();
    this.scrollTimeout = null;

    this.init();
  }

  /**
   * Initialize navigation system
   */
  init() {
    this.buildSectionMap();
    this.setupIntersectionObserver();
    this.setupClickHandlers();
    this.setupScrollHandler();
  }

  /**
   * Build map of section IDs to navigation buttons
   */
  buildSectionMap() {
    this.navButtons.forEach(btn => {
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sectionId = href.substring(1);
        this.sectionToButton.set(sectionId, btn);
      }
    });
  }

  /**
   * Set active navigation button
   */
  setActiveButton(sectionId) {
    this.navButtons.forEach(btn => btn.classList.remove('active'));

    const activeButton = this.sectionToButton.get(sectionId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  /**
   * Setup Intersection Observer for section detection
   */
  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId !== 'intro') {
            this.setActiveButton(sectionId);
          }
        }
      });
    };

    this.observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections except intro
    this.sections.forEach(section => {
      if (section.id && section.id !== 'intro') {
        this.observer.observe(section);
      }
    });
  }

  /**
   * Setup click handlers for navigation buttons
   */
  setupClickHandlers() {
    // Navigation button clicks
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          const sectionId = href.substring(1);

          if (sectionId === 'intro') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.setActiveButton('intro');
            return;
          }

          setTimeout(() => {
            this.setActiveButton(sectionId);
          }, TIMING.NAV_SCROLL_DELAY);
        }
      });
    });

    // Logo click handler
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        const href = logo.getAttribute('href');
        if (href === '#intro') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.setActiveButton('intro');
        }
      });
    }
  }

  /**
   * Setup scroll handler for intro section
   */
  setupScrollHandler() {
    window.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const introSection = document.getElementById('intro');

        if (introSection) {
          const introHeight = introSection.offsetHeight;

          // Clear active buttons when in intro section
          if (scrollPosition < introHeight * 0.7) {
            this.navButtons.forEach(btn => btn.classList.remove('active'));
          }
        }
      }, TIMING.NAV_DEBOUNCE);
    });
  }
}

// ============================================================================
// SQUARE GRID MANAGER - Manages rotating squares in contact section
// ============================================================================

class SquareGridManager {
  constructor() {
    this.wrapper = document.querySelector('.wrapper');
    this.contactSection = document.querySelector('#contact');

    if (!this.wrapper || !this.contactSection) return;

    this.config = {
      squareSize: 40,
      gap: 24,
      columns: 10,
      columnDelay: 0.3,
      squareDelay: 0.05
    };

    this.init();
  }

  /**
   * Initialize square grid
   */
  init() {
    this.generateSquares();
    this.setupMouseMove();
    this.setupExitAnimation();
  }

  /**
   * Calculate animation delay for a square
   */
  calculateDelay(col, row, rows, reverse = false) {
    const { columnDelay, squareDelay } = this.config;

    if (reverse) {
      // Reverse animation
      if (col < 5) {
        return (col * columnDelay) + ((rows - 1 - row) * squareDelay);
      } else {
        return (col * columnDelay) + (row * squareDelay);
      }
    } else {
      // Forward animation
      if (col < 5) {
        return (col * columnDelay) + (row * squareDelay);
      } else {
        return (col * columnDelay) + ((rows - 1 - row) * squareDelay);
      }
    }
  }

  /**
   * Generate all square elements
   */
  generateSquares() {
    const { squareSize, gap, columns } = this.config;
    const totalSquareSize = squareSize + gap;
    const rows = Math.ceil(window.innerHeight / totalSquareSize) + 2;
    const totalSquares = columns * rows;

    this.wrapper.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < totalSquares; i++) {
      const square = document.createElement('div');
      square.className = 'item';

      const col = i % columns;
      const row = Math.floor(i / columns);
      const delay = this.calculateDelay(col, row, rows);

      square.style.animationDelay = `${delay}s`;

      square.addEventListener('animationend', () => {
        square.style.animation = 'none';
        square.style.opacity = '1';
      }, { once: true });

      fragment.appendChild(square);
    }

    this.wrapper.appendChild(fragment);
    this.rows = rows;
  }

  /**
   * Setup mousemove effect for squares
   */
  setupMouseMove() {
    document.addEventListener('mousemove', (e) => {
      const squares = this.wrapper.querySelectorAll('.item');
      const mouseX = e.pageX;
      const mouseY = e.pageY;

      squares.forEach(square => {
        const rect = square.getBoundingClientRect();
        const sqrX = rect.left + rect.width / 2 + window.scrollX;
        const sqrY = rect.top + rect.height / 2 + window.scrollY;

        const diffX = mouseX - sqrX;
        const diffY = mouseY - sqrY;
        const angle = Math.atan2(diffY, diffX) * 180 / Math.PI;

        square.style.transform = `rotate(${angle}deg)`;
      });
    });
  }

  /**
   * Setup exit animation for contact section
   */
  setupExitAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          this.activateExitAnimation();
        } else if (entry.isIntersecting) {
          this.deactivateExitAnimation();
        }
      });
    }, { threshold: 0.1, rootMargin: '0px' });

    observer.observe(this.contactSection);
  }

  /**
   * Activate exit animation (squares disappear)
   */
  activateExitAnimation() {
    const squares = this.wrapper.querySelectorAll('.item');
    const { columns } = this.config;

    squares.forEach((square, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const delay = this.calculateDelay(col, row, this.rows, true);

      square.style.animationDelay = `${delay}s`;
    });

    this.wrapper.classList.add('exit');
  }

  /**
   * Deactivate exit animation (squares reappear)
   */
  deactivateExitAnimation() {
    const squares = this.wrapper.querySelectorAll('.item');
    const { columns } = this.config;

    this.wrapper.classList.remove('exit');

    squares.forEach((square, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const delay = this.calculateDelay(col, row, this.rows, false);

      square.style.opacity = '0';
      square.style.animation = 'none';
      void square.offsetWidth;  // Force reflow
      square.style.animation = `squareAppear 0.6s ease-out ${delay}s forwards`;

      square.addEventListener('animationend', () => {
        square.style.animation = 'none';
        square.style.opacity = '1';
      }, { once: true });
    });
  }
}

// ============================================================================
// ANIMATION COORDINATOR - Manages intro animations
// ============================================================================

class AnimationCoordinator {
  /**
   * Initialize cyberpunk panel animation
   */
  static initCyberPanel() {
    const panel = document.getElementById('introCyberPanel');
    if (!panel) return;

    setTimeout(() => {
      panel.classList.add('active');
    }, TIMING.CYBER_PANEL_DELAY);
  }

  /**
   * Initialize animation performance optimizer
   */
  static initAnimationOptimizer() {
    const introSection = document.getElementById('intro');
    const aboutSection = document.getElementById('about');

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '50px'
    };

    // Optimize intro animations
    if (introSection) {
      const introObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            introSection.classList.remove('paused-animations');

            if (window.ParticleSystem?.resume) window.ParticleSystem.resume();
            if (window.Orb3D?.resume) window.Orb3D.resume();
            if (window.BarcodeAnimation?.start) window.BarcodeAnimation.start();

            console.log('[Animation Optimizer] Intro animations resumed');
          } else {
            introSection.classList.add('paused-animations');

            if (window.ParticleSystem?.pause) window.ParticleSystem.pause();
            if (window.Orb3D?.pause) window.Orb3D.pause();
            if (window.BarcodeAnimation?.stop) window.BarcodeAnimation.stop();

            console.log('[Animation Optimizer] Intro animations paused');
          }
        });
      }, observerOptions);

      introObserver.observe(introSection);
    }

    // Optimize about section animations
    if (aboutSection) {
      const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            aboutSection.classList.remove('paused-animations');
            console.log('[Animation Optimizer] About animations resumed');
          } else {
            aboutSection.classList.add('paused-animations');
            console.log('[Animation Optimizer] About animations paused');
          }
        });
      }, observerOptions);

      aboutObserver.observe(aboutSection);
    }

    console.log('[Animation Optimizer] Initialized for intro and about sections');
  }
}

// ============================================================================
// MASTER INITIALIZATION - Application Entry Point
// ============================================================================

/**
 * Updates the date element with the current date.
 */
function updateDate() {
  const dateElement = document.querySelector('.date');
  if (dateElement) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    dateElement.textContent = `${year}.${month}.${day}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Always scroll to top on page load
  window.scrollTo(0, 0);

  // Update date
  updateDate();

  // Ensure intro section is in view
  const introSection = document.getElementById('intro');
  if (introSection) {
    introSection.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  // Initialize all systems
  const glitchSystem = new GlitchSystem();
  const navigationManager = new NavigationManager();
  const squareGridManager = new SquareGridManager();

  // Initialize animations
  AnimationCoordinator.initCyberPanel();
  AnimationCoordinator.initAnimationOptimizer();

  // Initialize DNA effects with delays
  setTimeout(() => {
    glitchSystem.initDNAGlitch();
  }, TIMING.DNA_GLITCH_DELAY);

  setTimeout(() => {
    glitchSystem.animateDNAReveal();
  }, TIMING.DNA_REVEAL_DELAY);
});

// Scroll to top before page unload
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
