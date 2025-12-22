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
  DNA_GLITCH_DELAY: 500,
  DNA_REVEAL_DELAY: 3000,
  DNA_LETTER_DELAY: 100,
  DNA_START_DELAY: 200, // Start after dnacapsule1.svg animation completes
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

    // Occasional random glitches (stored for cleanup)
    this.dnaGlitchInterval = setInterval(() => {
      const randomSpan = dnaSpans[Math.floor(Math.random() * dnaSpans.length)];
      if (Math.random() > 0.95) {
        glitchSpan(randomSpan, 60);
      }
    }, 500);
  }

  /**
   * Cleanup DNA glitch interval
   */
  cleanupDNAGlitch() {
    if (this.dnaGlitchInterval) {
      clearInterval(this.dnaGlitchInterval);
      this.dnaGlitchInterval = null;
    }
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
    this.header = document.querySelector('header');
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
   * Set active navigation button and update header background
   */
  setActiveButton(sectionId) {
    this.navButtons.forEach(btn => btn.classList.remove('active'));

    const activeButton = this.sectionToButton.get(sectionId);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    // Update header background color
    this.updateHeaderBackground(sectionId);
  }

  /**
   * Update header background based on active section
   */
  updateHeaderBackground(sectionId) {
    if (!this.header) return;

    // Remove all section classes
    this.header.classList.remove(
      'section-intro',
      'section-about',
      'section-web',
      'section-photo',
      'section-illustration',
      'section-experiments',
      'section-contact'
    );

    // Add new section class
    if (sectionId) {
      this.header.classList.add(`section-${sectionId}`);
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

          // Clear active buttons and set intro header when in intro section
          if (scrollPosition < introHeight * 0.7) {
            this.navButtons.forEach(btn => btn.classList.remove('active'));
            this.updateHeaderBackground('intro');
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

    // Detect Safari for performance optimizations
    const isSafari = window.BrowserDetect ? window.BrowserDetect.isSafariBased() : false;

    this.config = {
      squareSize: 40,
      gap: 24,
      columns: isSafari ? 6 : 10,  // Reduced columns on Safari
      columnDelay: 0.3,
      squareDelay: 0.05
    };

    // Cache for mousemove optimization
    this.squarePositions = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.rafId = null;
    this.isMouseMoveActive = false;

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
   * Cache square positions for performance
   */
  cacheSquarePositions() {
    const squares = this.wrapper.querySelectorAll('.item');
    this.squarePositions = Array.from(squares).map(square => {
      const rect = square.getBoundingClientRect();
      return {
        element: square,
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + rect.height / 2 + window.scrollY
      };
    });
  }

  /**
   * Update square rotations (called via RAF)
   */
  updateSquareRotations() {
    if (!this.isMouseMoveActive) return;

    this.squarePositions.forEach(({ element, x, y }) => {
      const diffX = this.mouseX - x;
      const diffY = this.mouseY - y;
      const angle = Math.atan2(diffY, diffX) * 180 / Math.PI;
      element.style.transform = `rotate(${angle}deg)`;
    });

    this.rafId = requestAnimationFrame(() => this.updateSquareRotations());
  }

  /**
   * Setup mousemove effect for squares (RAF-throttled)
   */
  setupMouseMove() {
    // Update mouse position on move
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;

      // Start RAF loop if not already running
      if (!this.isMouseMoveActive) {
        this.isMouseMoveActive = true;
        this.cacheSquarePositions();
        this.updateSquareRotations();
      }
    });

    // Stop RAF loop when mouse leaves
    document.addEventListener('mouseleave', () => {
      this.isMouseMoveActive = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });

    // Recache positions on window resize
    window.addEventListener('resize', () => {
      if (this.isMouseMoveActive) {
        this.cacheSquarePositions();
      }
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
    const certGalleryLayer = document.querySelector('.cert-gallery-layer');

    // Intro section observer - keeps existing behavior
    const introObserverOptions = {
      threshold: 0.2,
      rootMargin: '-100px'
    };

    // About section and other elements - trigger when visible
    const scrollTriggerOptions = {
      threshold: 0.05,  // Trigger when 5% visible
      rootMargin: '0px 0px -10% 0px'  // Trigger slightly before fully visible
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
      }, introObserverOptions);

      introObserver.observe(introSection);
    }

    // Optimize about section animations - trigger only once when visible
    if (aboutSection) {
      let aboutAnimationTriggered = false;
      let userHasScrolled = false;

      // Track if user has scrolled away from top
      const scrollListener = () => {
        if (window.scrollY > 100) {
          userHasScrolled = true;
          window.removeEventListener('scroll', scrollListener);
        }
      };
      window.addEventListener('scroll', scrollListener);

      const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Only trigger animations if user has scrolled AND section is visible
          if (entry.isIntersecting && !aboutAnimationTriggered && userHasScrolled) {
            aboutSection.classList.remove('paused-animations');

            // Add glitch-active class to trigger animations (only once)
            aboutSection.classList.add('glitch-active');
            aboutAnimationTriggered = true;

            // Trigger DNA animations with delays
            if (window.glitchSystem) {
              setTimeout(() => {
                window.glitchSystem.initDNAGlitch();
              }, TIMING.DNA_GLITCH_DELAY);

              setTimeout(() => {
                window.glitchSystem.animateDNAReveal();
              }, TIMING.DNA_REVEAL_DELAY);
            }

            console.log('[Animation Optimizer] About section animations activated');
          } else if (!entry.isIntersecting && aboutAnimationTriggered) {
            // Pause animations when scrolled away but keep glitch-active
            aboutSection.classList.add('paused-animations');
            console.log('[Animation Optimizer] About animations paused');
          } else if (entry.isIntersecting && aboutAnimationTriggered) {
            // Resume animations when scrolled back into view
            aboutSection.classList.remove('paused-animations');
            console.log('[Animation Optimizer] About animations resumed');
          }
        });
      }, scrollTriggerOptions);

      aboutObserver.observe(aboutSection);
    }

    // Certificate gallery layer - trigger animation when visible
    if (certGalleryLayer) {
      let certGalleryAnimated = false;
      let userHasScrolledForGallery = false;

      const galleryScrollListener = () => {
        if (window.scrollY > 100) {
          userHasScrolledForGallery = true;
          window.removeEventListener('scroll', galleryScrollListener);
        }
      };
      window.addEventListener('scroll', galleryScrollListener);

      const certObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !certGalleryAnimated && userHasScrolledForGallery) {
            certGalleryLayer.classList.add('visible');
            certGalleryAnimated = true;
            console.log('[Animation Optimizer] Certificate gallery animations activated');
          }
        });
      }, scrollTriggerOptions);

      certObserver.observe(certGalleryLayer);
    }

    // Individual element observers for about section - animate when in viewport
    const elementObserverOptions = {
      threshold: 0.3,  // Trigger when 30% of element is visible
      rootMargin: '0px 0px -20% 0px'  // Trigger when element is 20% into viewport
    };

    // Helper function to create element observer
    const createElementObserver = (elementId, logMessage) => {
      const element = document.getElementById(elementId);
      if (element) {
        let elementAnimated = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !elementAnimated) {
              element.classList.add('element-visible');
              elementAnimated = true;
              console.log(`[Animation Optimizer] ${logMessage}`);
            }
          });
        }, elementObserverOptions);
        observer.observe(element);
      }
    };

    // Helper function to create class-based observer (for multiple elements with same class)
    const createClassObserver = (className, logMessage) => {
      const elements = document.querySelectorAll(className);
      elements.forEach((element, index) => {
        let elementAnimated = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !elementAnimated) {
              element.classList.add('element-visible');
              elementAnimated = true;
              console.log(`[Animation Optimizer] ${logMessage} ${index + 1}`);
            }
          });
        }, elementObserverOptions);
        observer.observe(element);
      });
    };

    // Left column observers
    createElementObserver('abouttitle', 'About title animation triggered');
    createClassObserver('#about .about-left p', 'Left paragraph animation triggered -');
    createElementObserver('paulrand-quote', 'Paul Rand quote animation triggered');
    createElementObserver('paulrand-author', 'Paul Rand author animation triggered');
    // Note: ID1 SVG observer is set up after SVG conversion in setupID1Observer()

    // Right column observers
    createElementObserver('dnatitle', 'DNA title animation triggered');
    createElementObserver('aboutp4', 'aboutp4 paragraph animation triggered');

    // DNA capsule SVG observer
    const dnaCapsuleSvg = document.getElementById('dnacapsule1');
    if (dnaCapsuleSvg) {
      let capsuleAnimated = false;
      const capsuleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !capsuleAnimated) {
            dnaCapsuleSvg.classList.add('element-visible');
            capsuleAnimated = true;
            console.log('[Animation Optimizer] DNA capsule SVG animation triggered');
          }
        });
      }, elementObserverOptions);
      capsuleObserver.observe(dnaCapsuleSvg);
    }

    // About right column observer (for ::before line)
    const aboutRight = document.querySelector('.about-right');
    if (aboutRight) {
      let rightAnimated = false;
      const rightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !rightAnimated) {
            aboutRight.classList.add('element-visible');
            rightAnimated = true;
            console.log('[Animation Optimizer] About right column line animation triggered');
          }
        });
      }, elementObserverOptions);
      rightObserver.observe(aboutRight);
    }

    // SVG Decorations observers
    createClassObserver('.decoration-bar1', 'Decoration bar1 animation triggered -');
    createClassObserver('.decoration-bar2', 'Decoration bar2 animation triggered -');
    createClassObserver('.decoration-certs1', 'Decoration certs1 animation triggered -');
    createClassObserver('.decoration-vtv1', 'Decoration vtv1 animation triggered -');
    createClassObserver('.decoration-skills', 'Decoration skills animation triggered -');

    // Other sections - trigger animations when visible
    const sectionsToObserve = ['web', 'photo', 'illustration', 'experiments', 'contact'];
    const sectionScrollStates = new Map();

    sectionsToObserve.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        let sectionAnimated = false;
        sectionScrollStates.set(sectionId, { scrolled: false });

        const sectionScrollListener = () => {
          if (window.scrollY > 100) {
            sectionScrollStates.get(sectionId).scrolled = true;
          }
        };
        window.addEventListener('scroll', sectionScrollListener);

        const sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !sectionAnimated && sectionScrollStates.get(sectionId).scrolled) {
              section.classList.add('section-visible');
              sectionAnimated = true;
              window.removeEventListener('scroll', sectionScrollListener);
              console.log(`[Animation Optimizer] ${sectionId} section animations activated`);
            }
          });
        }, scrollTriggerOptions);

        sectionObserver.observe(section);
      }
    });

    console.log('[Animation Optimizer] Initialized scroll-triggered animations for all sections');
  }
}

// ============================================================================
// MASTER INITIALIZATION - Application Entry Point
// ============================================================================

/**
 * Updates the date element with the current date.
 * Format: [· Y Y Y Y · M M · D D ·]
 */
function updateDate() {
  const dateElement = document.querySelector('.date');
  if (dateElement) {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // Split digits with spaces
    const yearSpaced = year.split('').join(' ');
    const monthSpaced = month.split('').join(' ');
    const daySpaced = day.split('').join(' ');

    // Format: [· Y Y Y Y · M M · D D ·]
    dateElement.textContent = `[· ${yearSpaced} · ${monthSpaced} · ${daySpaced} ·]`;
  }
}

// ============================================================================
// ID1 SVG INLINE CONVERTER - Converts img to inline SVG for element animations
// ============================================================================

/**
 * Converts id1svg img tag to inline SVG and adds animation classes
 */
function convertID1SvgToInline() {
  const imgElement = document.getElementById('id1svg');
  if (!imgElement) return;

  const imgURL = imgElement.src;

  fetch(imgURL)
    .then(response => response.text())
    .then(data => {
      // Parse SVG data
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(data, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Copy attributes from img to svg
      const imgWidth = imgElement.getAttribute('width');
      const imgStyle = imgElement.style.cssText;
      const imgClass = imgElement.className;
      const imgId = imgElement.id;

      // Set SVG attributes
      svgElement.setAttribute('id', imgId);
      if (imgClass) svgElement.setAttribute('class', imgClass);
      if (imgWidth) svgElement.setAttribute('width', imgWidth);
      if (imgStyle) svgElement.style.cssText = imgStyle;

      // Add animation classes to internal elements
      const border = svgElement.querySelector('#border');
      const face = svgElement.querySelector('#face');
      const hexagons = svgElement.querySelectorAll('polygon[points*="39.43"], polygon[points*="77.83"], polygon[points*="116.41"], polygon[points*="154.28"]');
      const circles = svgElement.querySelectorAll('circle[cx="27.6"], circle[cx="66"], circle[cx="104.57"]');
      const sideCircles = svgElement.querySelectorAll('circle[cx="49.26"]');
      const stars = svgElement.querySelectorAll('polygon[points*="442.2"], polygon[points*="410.07"], polygon[points*="377.94"], polygon[points*="345.32"], polygon[points*="506.54"], polygon[points*="474.82"]');
      const rects = svgElement.querySelectorAll('rect');

      // Apply classes
      if (border) border.classList.add('id1-border');
      if (face) face.classList.add('id1-face');
      hexagons.forEach((hex, i) => {
        hex.classList.add('id1-hexagon');
        hex.style.setProperty('--hex-index', i);
      });
      circles.forEach((circle, i) => {
        circle.classList.add('id1-circle');
        circle.style.setProperty('--circle-index', i);
      });
      sideCircles.forEach((circle, i) => {
        circle.classList.add('id1-side-circle');
        circle.style.setProperty('--side-circle-index', i);
      });
      stars.forEach((star, i) => {
        star.classList.add('id1-star');
        star.style.setProperty('--star-index', i);
      });
      rects.forEach((rect, i) => {
        rect.classList.add('id1-rect');
        rect.style.setProperty('--rect-index', i);
      });

      // Replace img with inline SVG
      imgElement.parentNode.replaceChild(svgElement, imgElement);

      console.log('[ID1 SVG] Converted to inline SVG with animation classes');

      // Set up observer for ID1 SVG AFTER conversion completes
      setupID1Observer();
    })
    .catch(error => console.error('[ID1 SVG] Error loading SVG:', error));
}

/**
 * Sets up viewport observer for ID1 SVG (called after SVG conversion)
 */
function setupID1Observer() {
  const id1svg = document.getElementById('id1svg');
  if (id1svg) {
    let id1Animated = false;
    const elementObserverOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -20% 0px'
    };

    const id1Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !id1Animated) {
          id1svg.classList.add('element-visible');
          id1Animated = true;
          console.log('[Animation Optimizer] ID1 SVG animation triggered');
        }
      });
    }, elementObserverOptions);

    id1Observer.observe(id1svg);
    console.log('[Animation Optimizer] ID1 SVG observer set up after conversion');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Always scroll to top on page load
  window.scrollTo(0, 0);

  // Update date
  updateDate();

  // Convert ID1 SVG to inline for animations
  convertID1SvgToInline();

  // Ensure intro section is in view
  const introSection = document.getElementById('intro');
  if (introSection) {
    introSection.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  // Initialize all systems
  const glitchSystem = new GlitchSystem();
  const navigationManager = new NavigationManager();
  const squareGridManager = new SquareGridManager();

  // Set initial header background for intro section
  navigationManager.updateHeaderBackground('intro');

  // Initialize animations
  AnimationCoordinator.initCyberPanel();
  AnimationCoordinator.initAnimationOptimizer();

  // Store glitchSystem globally for DNA animation trigger
  window.glitchSystem = glitchSystem;

  // DNA effects will be initialized when about section becomes visible
  // (handled in AnimationCoordinator.initAnimationOptimizer)
});

// Scroll to top before page unload
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
