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

          if (sectionId === 'photo') {
            e.preventDefault();
            const photoSpacer = document.querySelector('.photo-scroll-spacer');
            if (photoSpacer) {
              // Scroll so the spacer top aligns with viewport top (fully revealed)
              const spacerTop = photoSpacer.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({ top: spacerTop, behavior: 'smooth' });
            }
            this.setActiveButton('photo');
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
          } else {
            introSection.classList.add('paused-animations');

            if (window.ParticleSystem?.pause) window.ParticleSystem.pause();
            if (window.Orb3D?.pause) window.Orb3D.pause();
            if (window.BarcodeAnimation?.stop) window.BarcodeAnimation.stop();
          }
        });
      }, introObserverOptions);

      introObserver.observe(introSection);
    }

    // Shared scroll guard: prevents animations from triggering on initial page load
    let userHasScrolled = false;
    const scrollGuardListener = () => {
      if (window.scrollY > 100) {
        userHasScrolled = true;
        window.removeEventListener('scroll', scrollGuardListener);
      }
    };
    window.addEventListener('scroll', scrollGuardListener);

    // Optimize about section animations - trigger only once when visible
    if (aboutSection) {
      let aboutAnimationTriggered = false;

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
          } else if (!entry.isIntersecting && aboutAnimationTriggered) {
            // Pause animations when scrolled away but keep glitch-active
            aboutSection.classList.add('paused-animations');
          } else if (entry.isIntersecting && aboutAnimationTriggered) {
            // Resume animations when scrolled back into view
            aboutSection.classList.remove('paused-animations');
          }
        });
      }, scrollTriggerOptions);

      aboutObserver.observe(aboutSection);
    }

    // Certificate gallery layer - trigger animation when visible
    if (certGalleryLayer) {
      let certGalleryAnimated = false;

      const certObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !certGalleryAnimated && userHasScrolled) {
            certGalleryLayer.classList.add('visible');
            certGalleryAnimated = true;
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
    const createElementObserver = (elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        let elementAnimated = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !elementAnimated) {
              element.classList.add('element-visible');
              elementAnimated = true;
            }
          });
        }, elementObserverOptions);
        observer.observe(element);
      }
    };

    // Helper function to create class-based observer (for multiple elements with same class)
    const createClassObserver = (className) => {
      const elements = document.querySelectorAll(className);
      elements.forEach((element) => {
        let elementAnimated = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !elementAnimated) {
              element.classList.add('element-visible');
              elementAnimated = true;
            }
          });
        }, elementObserverOptions);
        observer.observe(element);
      });
    };

    // Left column observers
    createElementObserver('abouttitle');
    createClassObserver('#about .about-left p');
    createElementObserver('paulrand-quote');
    createElementObserver('paulrand-author');
    // Note: ID1 SVG observer is set up after SVG conversion in setupID1Observer()

    // Right column observers
    createElementObserver('dnatitle');
    createElementObserver('aboutp4');

    // DNA capsule SVG observer
    const dnaCapsuleSvg = document.getElementById('dnacapsule1');
    if (dnaCapsuleSvg) {
      let capsuleAnimated = false;
      const capsuleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !capsuleAnimated) {
            dnaCapsuleSvg.classList.add('element-visible');
            capsuleAnimated = true;
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
          }
        });
      }, elementObserverOptions);
      rightObserver.observe(aboutRight);
    }

    // Photo section scroll-linked reveal (top-to-bottom wipe)
    const photoSection = document.querySelector('#photo');
    const photoSpacer = document.querySelector('.photo-scroll-spacer');
    if (photoSection && photoSpacer) {
      const updatePhotoReveal = () => {
        const spacerRect = photoSpacer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Animation starts when spacer top enters viewport bottom,
        // ends when spacer top reaches viewport top
        const progress = 1 - (spacerRect.top / viewportHeight);
        const clamped = Math.max(0, Math.min(1, progress));

        // Hide photo section entirely until animation is about to start
        photoSection.style.visibility = clamped > 0 ? 'visible' : 'hidden';

        // clip-path: inset(0 0 <remaining%> 0) — reveals from top to bottom
        const clipBottom = (1 - clamped) * 100;
        photoSection.style.clipPath = `inset(0 0 ${clipBottom}% 0)`;
      };

      window.addEventListener('scroll', updatePhotoReveal, { passive: true });
      updatePhotoReveal();
    }

    // SVG Decorations observers
    createClassObserver('.decoration-bar1');
    createClassObserver('.decoration-bar2');
    createClassObserver('.decoration-certs1');
    createClassObserver('.decoration-vtv1');
    createClassObserver('.decoration-skills');
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
        }
      });
    }, elementObserverOptions);

    id1Observer.observe(id1svg);
  }
}

// Disable browser scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
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

// Scroll to top on full page load (overrides browser scroll restoration)
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Scroll to top before page unload
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});


// ============================================================================
// ABOUT SECTION PIN + PAUL RAND QUOTE REVEAL
// ============================================================================

(function initAboutPin() {
  const wrapper = document.querySelector('.about-pin-wrapper');
  const about = document.getElementById('about');
  const header = document.querySelector('header');
  if (!wrapper || !about || !header) return;

  const quoteItems = document.querySelectorAll('.paul-rands-quote li');
  const ending = document.querySelector('.paul-rands-quote .ending');
  const EXTRA_SCROLL = 800; // pixels of scroll dedicated to the reveal animation

  function measure() {
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
    wrapper.style.height = about.offsetHeight + EXTRA_SCROLL + 'px';
  }

  // Measure on load and resize
  measure();
  window.addEventListener('resize', measure);

  // Build threshold array: one step per item + ending
  const totalSteps = quoteItems.length + 1; // +1 for the ending

  // Items use the first 75% of scroll; ending fades in during the last 25%
  var itemRange = 0.75;
  var numItems = quoteItems.length; // 3

  function onScroll() {
    var wrapperTop = wrapper.offsetTop;
    var scrollY = window.scrollY || window.pageYOffset;

    // How far past the pin point we've scrolled (0–1)
    var pinProgress = Math.max(0, Math.min(1, (scrollY - wrapperTop) / EXTRA_SCROLL));

    // Map item progress: offset goes from -1 (all hidden below) to numItems-1 (last item stays visible)
    // Each item gets equal time in the visible window
    var clampedProgress = Math.min(pinProgress, itemRange);
    var offset = (clampedProgress / itemRange) * (numItems + 1) - 1;
    offset = Math.min(offset, numItems - 1); // cap so last item never scrolls out

    // translateY in em: at offset -1 items are below the window, at 0 item-0 is centered, etc.
    var translateY = -offset * 1.2;
    quoteItems.forEach(function(li) {
      li.style.transform = 'translateY(' + translateY + 'em)';
    });

    // Ending fades in during the last 25%
    if (ending) {
      if (pinProgress >= itemRange) {
        ending.classList.add('visible');
      } else {
        ending.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check
})();
