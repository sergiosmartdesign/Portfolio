/**
 * Main Application Script
 * Organized into modular ES6 classes for better maintainability
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split(''); // keep in sync with preloader.js

const TIMING = {
  CYBER_PANEL_DELAY: 2000,
  DNA_GLITCH_DELAY: 500,
  DNA_REVEAL_DELAY: 3000,
  DNA_LETTER_DELAY: 100,
  DNA_START_DELAY: 200, // Start after dnacapsule1.svg animation completes
  NAV_SCROLL_DELAY: 100,
  NAV_DEBOUNCE: 50,
  NAV_SCROLL_DURATION: 1600,       // ms — default nav scroll speed
  PHOTO_SCROLL_DURATION: 2800      // ms — slower to let all 3 phases play visibly
};

/**
 * Custom smooth scroll to a Y position with a configurable duration.
 * Uses an ease-in-out cubic curve.
 */
function smoothScrollTo(targetY, duration = TIMING.NAV_SCROLL_DURATION) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

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

    // Observe all sections except intro and photo (#photo is position:fixed,
    // so IntersectionObserver always fires for it at page load — tracked via scroll instead)
    this.sections.forEach(section => {
      if (section.id && section.id !== 'intro' && section.id !== 'photo') {
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
            smoothScrollTo(0);
            this.setActiveButton('intro');
            return;
          }

          if (sectionId === 'photo') {
            e.preventDefault();
            const photoSpacer = document.querySelector('.photo-scroll-spacer');
            if (photoSpacer) {
              // rawProgress=3: all list items revealed (spacerTop + two full viewport heights)
              const spacerTop = photoSpacer.getBoundingClientRect().top + window.scrollY;
              const targetY = spacerTop + window.innerHeight * 2;
              // If coming from above the photo zone, jump there instantly to skip the about section
              if (window.scrollY < spacerTop) {
                window.scrollTo(0, spacerTop);
              }
              smoothScrollTo(targetY, TIMING.PHOTO_SCROLL_DURATION);
            }
            this.setActiveButton('photo');
            history.pushState(null, '', '#photo');
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
          smoothScrollTo(0);
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
            return;
          }
        }

        // Photo section: #photo is position:fixed so IntersectionObserver can't track it.
        // Use the spacer's viewport position to determine if we're in the photo reveal zone.
        const photoSpacer = document.querySelector('.photo-scroll-spacer');
        if (photoSpacer) {
          const spacerRect = photoSpacer.getBoundingClientRect();
          const progress = 1 - (spacerRect.top / window.innerHeight);
          if (progress > 0 && progress <= 1) {
            this.setActiveButton('photo');
            if (location.hash !== '#photo') history.pushState(null, '', '#photo');
          } else if (location.hash === '#photo') {
            history.pushState(null, '', location.pathname);
          }
        }
      }, TIMING.NAV_DEBOUNCE);
    });
  }
}


// ── Handle browser back / forward for #photo ─────────────────────────────
// All other section hashes use native anchors so the browser handles them.
window.addEventListener('popstate', () => {
  if (location.hash === '#photo') {
    const photoSpacer = document.querySelector('.photo-scroll-spacer');
    if (photoSpacer) {
      const spacerTop = photoSpacer.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, spacerTop + window.innerHeight * 2);
    }
  } else if (!location.hash || location.hash === '#intro') {
    window.scrollTo(0, 0);
  }
});

// ============================================================================
// ANIMATION COORDINATOR - Manages intro animations
// ============================================================================

class AnimationCoordinator {
  /**
   * Initialize cyberpunk panel animation
   */
  static initCyberPanel(delay = TIMING.CYBER_PANEL_DELAY) {
    const panel = document.getElementById('introCyberPanel');
    if (!panel) return;

    setTimeout(() => {
      panel.classList.add('active');
    }, delay);
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

            // Don't start JS canvas animations while preloader is still showing
            // (Orb3D is excluded — its CSS animations run freely during preloading)
            if (!document.body.classList.contains('preloading')) {
              if (window.ParticleSystem?.resume) window.ParticleSystem.resume();
              if (window.BarcodeAnimation?.start) window.BarcodeAnimation.start();
            }
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

            // DNA animations fire when #dnatitle enters viewport (see dnaGroupObserver below)
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
        let hasEntered = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              hasEntered = true;
              element.classList.remove('element-exit');
              element.classList.add('element-visible');
            } else if (hasEntered) {
              element.classList.remove('element-visible');
              element.classList.add('element-exit');
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
        let hasEntered = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              hasEntered = true;
              element.classList.remove('element-exit');
              element.classList.add('element-visible');
            } else if (hasEntered) {
              element.classList.remove('element-visible');
              element.classList.add('element-exit');
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
    createElementObserver('aboutp4');

    // dnatitle, dnacapsule1, yellow line (.about-right), and DNA animations:
    // Entry — fires 800ms after #aboutp2 enters viewport (matching its 0.8s slideInFromLeft).
    // Exit  — fires when #dnatitle leaves viewport.
    const dnatitleEl = document.getElementById('dnatitle');
    const dnaCapsule = document.getElementById('dnacapsule1');
    const aboutRight = document.querySelector('.about-right');
    let dnaGroupVisible = false;
    let dnaAnimationsTriggered = false;

    function enterDnaGroup() {
      dnaGroupVisible = true;
      [dnatitleEl, dnaCapsule, aboutRight].forEach(el => {
        if (!el) return;
        el.classList.remove('element-exit');
        el.classList.add('element-visible');
      });
      if (window.glitchSystem && !dnaAnimationsTriggered) {
        dnaAnimationsTriggered = true;
        setTimeout(() => window.glitchSystem.initDNAGlitch(), TIMING.DNA_GLITCH_DELAY);
        setTimeout(() => window.glitchSystem.animateDNAReveal(), TIMING.DNA_REVEAL_DELAY);
      }
    }

    function exitDnaGroup() {
      dnaGroupVisible = false;
      [dnatitleEl, dnaCapsule, aboutRight].forEach(el => {
        if (!el) return;
        el.classList.remove('element-visible');
        el.classList.add('element-exit');
      });
    }

    // Entry trigger — observe #aboutp2, wait for its 0.8s animation to finish
    const aboutp2El = document.getElementById('aboutp2');
    if (aboutp2El) {
      let entryTimer = null;
      const dnaEntryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !dnaGroupVisible) {
            entryTimer = setTimeout(enterDnaGroup, 800);
          } else if (!entry.isIntersecting) {
            clearTimeout(entryTimer);
          }
        });
      }, elementObserverOptions);
      dnaEntryObserver.observe(aboutp2El);
    }

    // Exit trigger — observe #dnatitle leaving viewport
    if (dnatitleEl) {
      const dnaExitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && dnaGroupVisible) {
            exitDnaGroup();
          }
        });
      }, elementObserverOptions);
      dnaExitObserver.observe(dnatitleEl);
    }

    // Photo section scroll-linked reveal (top-to-bottom wipe) + static line
    const photoSection = document.querySelector('#photo');
    const photoSpacer = document.querySelector('.photo-scroll-spacer');
    const staticLineCanvas = document.querySelector('.photo-static-line');

    if (photoSection && photoSpacer && staticLineCanvas) {
      const ctx = staticLineCanvas.getContext('2d');
      let staticAnimationId = null;
      let scrollTimeout = null;

      // Size canvas to full width
      const resizeCanvas = () => {
        staticLineCanvas.width = window.innerWidth;
        staticLineCanvas.height = 4;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Draw electric static line
      const drawStaticLine = () => {
        const w = staticLineCanvas.width;
        const h = staticLineCanvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = '#0ef';
        ctx.shadowColor = '#0ef';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.5;

        ctx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 3) {
          const jitter = (Math.random() - 0.5) * h * 2;
          ctx.lineTo(x, h / 2 + jitter);
        }
        ctx.stroke();

        // Add bright white flicker segments
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 3;
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 3) {
          if (Math.random() > 0.7) {
            const jitter = (Math.random() - 0.5) * h;
            ctx.lineTo(x, h / 2 + jitter);
          } else {
            ctx.moveTo(x, h / 2);
          }
        }
        ctx.stroke();

        staticAnimationId = requestAnimationFrame(drawStaticLine);
      };

      const showStaticLine = () => {
        staticLineCanvas.classList.add('active');
        if (!staticAnimationId) drawStaticLine();
      };

      const hideStaticLine = () => {
        staticLineCanvas.classList.remove('active');
        if (staticAnimationId) {
          cancelAnimationFrame(staticAnimationId);
          staticAnimationId = null;
        }
      };

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

        // Position static line at the reveal edge
        const revealEdgeY = clamped * viewportHeight;
        staticLineCanvas.style.top = `${revealEdgeY - 2}px`;

        // Show static line only while scrolling and photo is visible
        if (clamped > 0 && clamped < 1) {
          showStaticLine();
        } else {
          hideStaticLine();
        }

        // Hide static line when scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(hideStaticLine, 150);
      };

      window.addEventListener('scroll', updatePhotoReveal, { passive: true });
      updatePhotoReveal();
    }

    // About section bottom static line
    const aboutBottomCanvas = document.querySelector('.about-bottom-static-line');
    if (aboutBottomCanvas) {
      const aboutCtx = aboutBottomCanvas.getContext('2d');
      let aboutStaticAnimId = null;
      let aboutScrollTimeout = null;

      const resizeAboutCanvas = () => {
        aboutBottomCanvas.width = window.innerWidth;
        aboutBottomCanvas.height = 4;
      };
      resizeAboutCanvas();
      window.addEventListener('resize', resizeAboutCanvas);

      const drawAboutStaticLine = () => {
        const w = aboutBottomCanvas.width;
        const h = aboutBottomCanvas.height;
        aboutCtx.clearRect(0, 0, w, h);

        aboutCtx.beginPath();
        aboutCtx.strokeStyle = '#0ef';
        aboutCtx.shadowColor = '#0ef';
        aboutCtx.shadowBlur = 6;
        aboutCtx.lineWidth = 1.5;
        aboutCtx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 3) {
          const jitter = (Math.random() - 0.5) * h * 2;
          aboutCtx.lineTo(x, h / 2 + jitter);
        }
        aboutCtx.stroke();

        aboutCtx.beginPath();
        aboutCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        aboutCtx.shadowColor = '#fff';
        aboutCtx.shadowBlur = 3;
        aboutCtx.lineWidth = 1;
        for (let x = 0; x < w; x += 3) {
          if (Math.random() > 0.7) {
            const jitter = (Math.random() - 0.5) * h;
            aboutCtx.lineTo(x, h / 2 + jitter);
          } else {
            aboutCtx.moveTo(x, h / 2);
          }
        }
        aboutCtx.stroke();

        aboutStaticAnimId = requestAnimationFrame(drawAboutStaticLine);
      };

      const aboutSec = document.getElementById('about');

      const showAboutLine = () => {
        aboutBottomCanvas.classList.add('active');
        if (!aboutStaticAnimId) drawAboutStaticLine();
      };

      const hideAboutLine = () => {
        aboutBottomCanvas.classList.remove('active');
        if (aboutStaticAnimId) {
          cancelAnimationFrame(aboutStaticAnimId);
          aboutStaticAnimId = null;
        }
      };

      const updateAboutLine = () => {
        if (!aboutSec) return;
        const bottom = aboutSec.getBoundingClientRect().bottom;
        const inViewport = bottom > 4 && bottom < window.innerHeight - 4;

        if (inViewport) {
          aboutBottomCanvas.style.top = `${bottom - 2}px`;
          showAboutLine();
        } else {
          hideAboutLine();
          return;
        }

        clearTimeout(aboutScrollTimeout);
        aboutScrollTimeout = setTimeout(hideAboutLine, 150);
      };

      window.addEventListener('scroll', updateAboutLine, { passive: true });
      updateAboutLine();
    }

    // About section top static line
    const aboutTopCanvas = document.querySelector('.about-top-static-line');
    if (aboutTopCanvas) {
      const aboutTopCtx = aboutTopCanvas.getContext('2d');
      let aboutTopAnimId = null;
      let aboutTopScrollTimeout = null;

      const resizeAboutTopCanvas = () => {
        aboutTopCanvas.width = window.innerWidth;
        aboutTopCanvas.height = 4;
      };
      resizeAboutTopCanvas();
      window.addEventListener('resize', resizeAboutTopCanvas);

      const drawAboutTopLine = () => {
        const w = aboutTopCanvas.width;
        const h = aboutTopCanvas.height;
        aboutTopCtx.clearRect(0, 0, w, h);

        aboutTopCtx.beginPath();
        aboutTopCtx.strokeStyle = '#0ef';
        aboutTopCtx.shadowColor = '#0ef';
        aboutTopCtx.shadowBlur = 6;
        aboutTopCtx.lineWidth = 1.5;
        aboutTopCtx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 3) {
          const jitter = (Math.random() - 0.5) * h * 2;
          aboutTopCtx.lineTo(x, h / 2 + jitter);
        }
        aboutTopCtx.stroke();

        aboutTopCtx.beginPath();
        aboutTopCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        aboutTopCtx.shadowColor = '#fff';
        aboutTopCtx.shadowBlur = 3;
        aboutTopCtx.lineWidth = 1;
        for (let x = 0; x < w; x += 3) {
          if (Math.random() > 0.7) {
            const jitter = (Math.random() - 0.5) * h;
            aboutTopCtx.lineTo(x, h / 2 + jitter);
          } else {
            aboutTopCtx.moveTo(x, h / 2);
          }
        }
        aboutTopCtx.stroke();

        aboutTopAnimId = requestAnimationFrame(drawAboutTopLine);
      };

      const aboutSecTop = document.getElementById('about');

      const showAboutTopLine = () => {
        aboutTopCanvas.classList.add('active');
        if (!aboutTopAnimId) drawAboutTopLine();
      };

      const hideAboutTopLine = () => {
        aboutTopCanvas.classList.remove('active');
        if (aboutTopAnimId) {
          cancelAnimationFrame(aboutTopAnimId);
          aboutTopAnimId = null;
        }
      };

      const updateAboutTopLine = () => {
        if (!aboutSecTop) return;
        const top = aboutSecTop.getBoundingClientRect().top;
        const inViewport = top > 4 && top < window.innerHeight - 4;

        if (inViewport) {
          aboutTopCanvas.style.top = `${top - 2}px`;
          showAboutTopLine();
        } else {
          hideAboutTopLine();
          return;
        }

        clearTimeout(aboutTopScrollTimeout);
        aboutTopScrollTimeout = setTimeout(hideAboutTopLine, 150);
      };

      window.addEventListener('scroll', updateAboutTopLine, { passive: true });
      updateAboutTopLine();
    }

    // ── Overlap collision star ───────────────────────────────────────────────
    const collisionStar = document.getElementById('line-collision-star');
    const photoLineEl   = document.querySelector('.photo-static-line');
    const aboutLineEl   = document.querySelector('.about-bottom-static-line');

    if (collisionStar) {
      let animating  = false;
      let overlapping = false;

      const checkLineOverlap = () => {
        const aboutEl  = document.getElementById('about');
        const spacerEl = document.querySelector('.photo-scroll-spacer');
        if (!aboutEl || !spacerEl) return;

        const aboutBottom = aboutEl.getBoundingClientRect().bottom;
        const vh = window.innerHeight;

        if (aboutBottom <= 4 || aboutBottom >= vh - 4) { overlapping = false; return; }

        const spacerTop  = spacerEl.getBoundingClientRect().top;
        const progress   = 1 - (spacerTop / vh);
        const clamped    = Math.max(0, Math.min(1, progress));
        if (clamped <= 0 || clamped >= 1) { overlapping = false; return; }

        const revealEdgeY   = clamped * vh;
        const inOverlapZone = Math.abs(aboutBottom - revealEdgeY) < 8;

        if (inOverlapZone && !overlapping && !animating) {
          overlapping = true;
          animating   = true;

          collisionStar.style.top = ((aboutBottom + revealEdgeY) / 2) + 'px';

          // Restart animation cleanly (remove → reflow → add)
          collisionStar.classList.remove('firing');
          void collisionStar.offsetWidth;
          collisionStar.classList.add('firing');

          setTimeout(() => {
            collisionStar.classList.remove('firing');
            animating = false;
          }, 800);

        } else if (!inOverlapZone) {
          overlapping = false;
        }
      };

      window.addEventListener('scroll', checkLineOverlap, { passive: true });
    }

    // SVG Decorations observers
    createClassObserver('.decoration-bar1');
    createClassObserver('.decoration-bar2');
    createClassObserver('.decoration-certs1');
    createClassObserver('.decoration-vtv1');
    // .decoration-skills:
    // Entry — triggered 800ms after #aboutp2 enters viewport (matching its 0.8s animation).
    // Exit  — triggered when the SVG itself leaves the viewport.
    const decorationSkills = document.querySelector('.decoration-skills');
    if (decorationSkills) {
      let skillsShown = false;
      let skillsTimer = null;

      // Entry: observe #aboutp2 as the trigger
      const skillsEntryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !skillsShown) {
            skillsTimer = setTimeout(() => {
              skillsShown = true;
              decorationSkills.classList.remove('element-exit');
              decorationSkills.classList.add('element-visible');
            }, 800);
          } else if (!entry.isIntersecting) {
            clearTimeout(skillsTimer);
          }
        });
      }, elementObserverOptions);
      const skillsTriggerEl = document.getElementById('aboutp2');
      if (skillsTriggerEl) skillsEntryObserver.observe(skillsTriggerEl);

      // Exit: observe the SVG itself — fires only when the element fully leaves the
      // viewport (threshold:0, no rootMargin), so it never exits while still on screen.
      const skillsExitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && skillsShown) {
            skillsShown = false;
            decorationSkills.classList.remove('element-visible');
            decorationSkills.classList.add('element-exit');
          }
        });
      }, { threshold: 0 });
      skillsExitObserver.observe(decorationSkills);
    }
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
    let id1Entered = false;
    const elementObserverOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -20% 0px'
    };

    const id1Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          id1Entered = true;
          id1svg.classList.remove('element-exit');
          id1svg.classList.add('element-visible');
        } else if (id1Entered) {
          id1svg.classList.remove('element-visible');
          id1svg.classList.add('element-exit');
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

  // Initialize scroll-based animation optimizer
  AnimationCoordinator.initAnimationOptimizer();

  // Store glitchSystem globally for DNA animation trigger
  window.glitchSystem = glitchSystem;

  // DNA effects will be initialized when about section becomes visible
  // (handled in AnimationCoordinator.initAnimationOptimizer)

  // When preloader starts fading: activate the cyber panel sidebar immediately
  // (sidebar uses CSS transition, not animation — unaffected by animation-play-state freeze)
  window.addEventListener('preloaderExiting', () => {
    AnimationCoordinator.initCyberPanel(800);
  }, { once: true });

  // After preloader is fully gone: start intro JS canvas animations from scratch
  // (Orb3D is excluded — it has been running since page load, visible above the preloader)
  window.addEventListener('preloaderDone', () => {
    if (window.ParticleSystem?.resume) window.ParticleSystem.resume();
    if (window.BarcodeAnimation?.start) window.BarcodeAnimation.start();
  }, { once: true });
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
    // Yield to scroll-hint.js while the auto-animation is playing
    if (window._quoteIntroActive) return;

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
