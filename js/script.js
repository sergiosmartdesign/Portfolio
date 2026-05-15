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
    this.initSealGlitch();
    document.addEventListener('languagechanged', () => this._resplitTranslated());
  }

  /**
   * Re-split and re-apply glitch vars on elements translated by i18n
   * Called after languagechanged event so new text gets the full glitch treatment
   */
  _resplitTranslated() {
    const els = Array.from(document.querySelectorAll('[data-i18n-split]'));
    if (!els.length) return;
    const results = window.Splitting({ target: els, by: 'chars' });
    results.forEach(result => {
      result.chars.forEach(char => {
        char.style.setProperty('--count', Math.random() * 5 + 1);
        for (let g = 0; g < 10; g++) {
          const randomChar = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
          char.style.setProperty(`--char-${g}`, `"${randomChar}"`);
        }
      });
    });
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

    // After page-load reveal animation finishes (~2.7s max), suppress the base
    // animation-name so the hover toggle can change it none → glitch-switch.
    // Chrome only restarts animations when animation-name itself changes.
    setTimeout(() => logo.classList.add('logo-reveal-done'), 3000);

    const triggerGlitch = () => {
      // If hovered before timeout fires, add the class immediately so the
      // name-change trick works on first interaction too.
      logo.classList.add('logo-reveal-done');
      logo.classList.remove('logo-glitch-active');
      void logo.getBoundingClientRect(); // flush styles — forces name change to register
      logo.classList.add('logo-glitch-active');
    };

    logo.addEventListener('mouseenter', triggerGlitch);
    logo.addEventListener('mouseleave', () => logo.classList.remove('logo-glitch-active'));
  }

  initSealGlitch() {
    const sealCta = document.getElementById('seal-cta');
    if (!sealCta) return;

    sealCta.addEventListener('mouseenter', function() {
      const chars = this.querySelectorAll('.seal-label [data-char]');
      chars.forEach((char, index) => {
        char.style.animation = 'none';
        void char.offsetWidth;
        char.style.animation = `glitch-switch 0.2s steps(1) ${index * 0.04}s 6 backwards`;
      });
      this.classList.remove('seal-glitch-active');
      void this.offsetWidth;
      this.classList.add('seal-glitch-active');
    });

    sealCta.addEventListener('animationend', function(e) {
      if (e.animationName === 'seal-glitch-burst') {
        this.classList.remove('seal-glitch-active');
      }
    });

    sealCta.addEventListener('mouseleave', function() {
      const chars = this.querySelectorAll('.seal-label [data-char]');
      chars.forEach((char) => {
        char.style.animation = 'none';
        void char.offsetWidth;
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
      'section-art-direction',
      'section-photo',
      'section-illustration',
      'section-blog',
      'section-contact'
    );

    // Add new section class
    if (sectionId) {
      this.header.classList.add(`section-${sectionId}`);
    }
  }

  /**
   * Determine which section owns the viewport right now and set it active.
   * Called on every scroll (debounced) and once at init.
   *
   * Strategy: the "active" section is the last one in DOM order whose top edge
   * is at or above 35% of the viewport AND whose bottom is still on screen.
   * This means the section has entered the upper third of the screen — the user
   * is clearly inside it. "Last in DOM order" means the section furthest down
   * the page wins when two sections overlap (e.g. sticky #about while
   * art-direction is just entering from below).
   *
   * #photo is position:fixed so its DOM rect is always 0 — handled separately
   * via the scroll spacer. #intro has its own clear-all logic.
   */
  detectActiveSection() {
    const scrollY = window.scrollY;
    const vh    = window.innerHeight;

    // ── Intro zone: no nav button active ─────────────────────────────────────
    const introEl = document.getElementById('intro');
    if (introEl && scrollY < introEl.offsetHeight * 0.7) {
      this.navButtons.forEach(btn => btn.classList.remove('active'));
      this.updateHeaderBackground('intro');
      return;
    }

    // ── Normal sections: find the lowest section whose top ≤ 35 % of viewport ─
    const triggerY = vh * 0.35;
    let activeId = null;

    this.sections.forEach(section => {
      if (!section.id || section.id === 'intro' || section.id === 'photo') return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= triggerY && rect.bottom > 0) {
        activeId = section.id; // keep overwriting — last (lowest) match wins
      }
    });

    if (activeId) {
      this.setActiveButton(activeId);
      return;
    }

    // ── Photo zone fallback: no normal section matched the trigger line ───────
    // #photo is position:fixed; spacer measures its depth. Active for the full
    // spacer range (rawProgress 0 → end) — sections after the spacer are caught
    // by the normal loop above before this fallback is reached.
    const photoSpacer = document.querySelector('.photo-scroll-spacer');
    if (photoSpacer) {
      const progress = 1 - photoSpacer.getBoundingClientRect().top / vh;
      if (progress > 0) {
        this.setActiveButton('photo');
        if (location.hash !== '#photo') history.pushState(null, '', '#photo');
        return;
      }
    }
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

          // If the photo section is currently visible and we are navigating
          // away from it, force-hide it immediately before any scroll fires.
          // This prevents updatePhotoReveal from re-animating the clip-path
          // wipe while the browser scrolls to the target.
          if (sectionId !== 'photo') {
            const _photoSpacer = document.querySelector('.photo-scroll-spacer');
            if (_photoSpacer) {
              const _prog = 1 - _photoSpacer.getBoundingClientRect().top / window.innerHeight;
              if (_prog > 0) {
                const _photoEl = document.querySelector('#photo');
                if (_photoEl) {
                  _photoEl.style.visibility = 'hidden';
                  _photoEl.style.clipPath   = 'inset(0 0 100% 0)';
                }
                window._photoNavExit = true;
                setTimeout(() => { window._photoNavExit = false; }, 2000);
              }
            }
          }

          if (sectionId === 'intro') {
            e.preventDefault();
            window.scrollTo(0, 0);
            this.setActiveButton('intro');
            return;
          }

          if (sectionId === 'art-direction') {
            e.preventDefault();
            const artTarget = document.getElementById('art-direction');
            if (artTarget) {
              window.scrollTo(0, artTarget.getBoundingClientRect().top + window.scrollY);
            }
            if (window.playArtEntranceAnimation) window.playArtEntranceAnimation();
            this.setActiveButton('art-direction');
            history.pushState(null, '', '#art-direction');
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
              window.scrollTo(0, targetY);
            }
            this.setActiveButton('photo');
            history.pushState(null, '', '#photo');
            return;
          }

          // General rule: all other sections scroll instantly to their top
          // and activate entrance animations through IntersectionObserver re-entry.
          e.preventDefault();
          const target = document.getElementById(sectionId);
          if (target) {
            window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
          }
          if (window.sectionEnter?.[sectionId]) window.sectionEnter[sectionId]();
          this.setActiveButton(sectionId);
          history.pushState(null, '', `#${sectionId}`);
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
   * Drive nav-active state purely from scroll position.
   * Replaces the old IntersectionObserver approach, which had dead zones due to
   * transition-only firing and sticky #about confusing the intersection math.
   */
  setupScrollHandler() {
    window.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => this.detectActiveSection(), TIMING.NAV_DEBOUNCE);
    });
    // Seed the correct state on page load (e.g. deep-linked URL)
    setTimeout(() => this.detectActiveSection(), 100);
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

      // Info interface container slides in last — fires after social icons (~1500ms).
      // Content line animations are handled separately by initInfoInterfaceLangLoop().
      const infoInterface = document.getElementById('infoInterface');
      if (infoInterface) {
        setTimeout(() => infoInterface.classList.add('active'), 2000);
      }
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
    createElementObserver('about-availability');
    createElementObserver('about-metrics');
    createElementObserver('seal-cta');
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

    // Exit trigger — observe #about itself; fires only when the full section leaves viewport.
    if (aboutSection) {
      const dnaExitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && dnaGroupVisible) {
            exitDnaGroup();
          }
        });
      }, { threshold: 0 });
      dnaExitObserver.observe(aboutSection);
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
        if (window._photoNavExit) return;

        const spacerRect = photoSpacer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Entry: 0→1 as spacer.top descends from viewportH to 0
        const entryProgress = 1 - (spacerRect.top / viewportHeight);
        const entryClamped  = Math.max(0, Math.min(1, entryProgress));

        // Exit: 0→1 over the last viewport of the spacer (spacer.bottom descends from viewportH to 0)
        const exitProgress = Math.max(0, Math.min(1, 1 - (spacerRect.bottom / viewportHeight)));

        if (exitProgress > 0) {
          // Exit phase — clip from the top so #photo slides away as next section enters
          photoSection.style.visibility = exitProgress < 1 ? 'visible' : 'hidden';
          photoSection.style.clipPath = `inset(${exitProgress * 100}% 0 0 0)`;
          staticLineCanvas.style.top  = `${exitProgress * viewportHeight - 2}px`;
          if (exitProgress < 1) {
            showStaticLine();
          } else {
            hideStaticLine();
          }
        } else {
          // Entry phase — reveal from top to bottom
          photoSection.style.visibility = entryClamped > 0 ? 'visible' : 'hidden';
          photoSection.style.clipPath   = `inset(0 0 ${(1 - entryClamped) * 100}% 0)`;
          staticLineCanvas.style.top    = `${entryClamped * viewportHeight - 2}px`;
          if (entryClamped > 0 && entryClamped < 1) {
            showStaticLine();
          } else {
            hideStaticLine();
          }
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

    // Art Direction section bottom static line
    const artDirBottomCanvas = document.querySelector('.art-direction-bottom-static-line');
    if (artDirBottomCanvas) {
      const artDirCtx = artDirBottomCanvas.getContext('2d');
      let artDirAnimId = null;
      let artDirScrollTimeout = null;

      const resizeArtDirCanvas = () => {
        artDirBottomCanvas.width = window.innerWidth;
        artDirBottomCanvas.height = 4;
      };
      resizeArtDirCanvas();
      window.addEventListener('resize', resizeArtDirCanvas);

      const drawArtDirLine = () => {
        const w = artDirBottomCanvas.width;
        const h = artDirBottomCanvas.height;
        artDirCtx.clearRect(0, 0, w, h);

        artDirCtx.beginPath();
        artDirCtx.strokeStyle = '#0ef';
        artDirCtx.shadowColor = '#0ef';
        artDirCtx.shadowBlur = 6;
        artDirCtx.lineWidth = 1.5;
        artDirCtx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 3) {
          const jitter = (Math.random() - 0.5) * h * 2;
          artDirCtx.lineTo(x, h / 2 + jitter);
        }
        artDirCtx.stroke();

        artDirCtx.beginPath();
        artDirCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        artDirCtx.shadowColor = '#fff';
        artDirCtx.shadowBlur = 3;
        artDirCtx.lineWidth = 1;
        for (let x = 0; x < w; x += 3) {
          if (Math.random() > 0.7) {
            const jitter = (Math.random() - 0.5) * h;
            artDirCtx.lineTo(x, h / 2 + jitter);
          } else {
            artDirCtx.moveTo(x, h / 2);
          }
        }
        artDirCtx.stroke();

        artDirAnimId = requestAnimationFrame(drawArtDirLine);
      };

      const artDirSec = document.getElementById('art-direction');

      const showArtDirLine = () => {
        artDirBottomCanvas.classList.add('active');
        if (!artDirAnimId) drawArtDirLine();
      };

      const hideArtDirLine = () => {
        artDirBottomCanvas.classList.remove('active');
        if (artDirAnimId) {
          cancelAnimationFrame(artDirAnimId);
          artDirAnimId = null;
        }
      };

      const updateArtDirLine = () => {
        if (!artDirSec) return;
        const bottom = artDirSec.getBoundingClientRect().bottom;
        const inViewport = bottom > 4 && bottom < window.innerHeight - 4;

        if (inViewport) {
          artDirBottomCanvas.style.top = `${bottom - 2}px`;
          showArtDirLine();
        } else {
          hideArtDirLine();
          return;
        }

        clearTimeout(artDirScrollTimeout);
        artDirScrollTimeout = setTimeout(hideArtDirLine, 150);
      };

      window.addEventListener('scroll', updateArtDirLine, { passive: true });
      updateArtDirLine();
    }

    // Art Direction section — scroll-driven letter entrance
    const artEntranceSection = document.getElementById('art-direction');
    const artEntranceCells   = artEntranceSection
      ? [...artEntranceSection.querySelectorAll('.art-cell')]
      : [];

    if (artEntranceSection && artEntranceCells.length) {
      const TOTAL = artEntranceCells.length;
      let artEntrancePlaying = false;

      // Hide all cells before JS takes over
      artEntranceCells.forEach(cell => { cell.style.clipPath = 'inset(0 100% 0 0)'; });

      // Stamp each cell's letter onto its glitch child divs so CSS ::after can read it
      artEntranceCells.forEach(cell => {
        const letter = cell.dataset.letter;
        cell.querySelectorAll('.glitch-r, .glitch-g, .glitch-b').forEach(el => {
          el.dataset.letter = letter;
        });
      });

      // Timed animation — used when nav button is clicked
      window.playArtEntranceAnimation = () => {
        artEntrancePlaying = true;
        artEntranceCells.forEach(cell => {
          cell.style.transition = 'clip-path 0.28s ease-out';
          cell.style.clipPath   = 'inset(0 100% 0 0)';
        });
        artEntranceCells.forEach((cell, i) => {
          setTimeout(() => {
            cell.style.clipPath = 'inset(0 0% 0 0)';
            if (i === TOTAL - 1) {
              // Restore scroll-driven mode after animation completes
              setTimeout(() => {
                artEntranceCells.forEach(c => { c.style.transition = ''; });
                artEntrancePlaying = false;
              }, 320);
            }
          }, i * 120);
        });
      };

      // Scroll-driven animation — works in both scroll directions
      const updateArtEntrance = () => {
        if (artEntrancePlaying) return;
        const rect     = artEntranceSection.getBoundingClientRect();
        const vh       = window.innerHeight;
        // 0 = section top at viewport bottom, 1 = section top at viewport top
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));

        artEntranceCells.forEach((cell, i) => {
          const start      = i / TOTAL;
          const end        = (i + 1) / TOTAL;
          const local      = Math.max(0, Math.min(1, (progress - start) / (end - start)));
          const rightInset = ((1 - local) * 100).toFixed(2);
          cell.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
        });
      };

      window.addEventListener('scroll', updateArtEntrance, { passive: true });
      updateArtEntrance();
    }

    // Art Direction list — sequenced after letter animation
    const adList      = artEntranceSection ? artEntranceSection.querySelector('.ad-list') : null;
    const adListLinks = artEntranceSection ? [...artEntranceSection.querySelectorAll('.ad-text-link')] : [];

    if (adList && adListLinks.length) {
      let adListDone = false;
      const FRAME_MS = 45;

      // Pure JS scramble — no Splitting.js, no CSS animation restart issues
      const scrambleItem = (el, delay) => {
        const finalText = el.getAttribute('data-content');
        const chars     = [...finalText];
        const n         = chars.length;
        // Each char resolves after: initialDelay + charIndex * stepMs
        const INIT_DELAY = 300;
        const STEP_MS    = 90;
        const resolveAt  = i => INIT_DELAY + i * STEP_MS;
        const maxResolve = resolveAt(n - 1);

        setTimeout(() => {
          let elapsed = 0;
          const tick = () => {
            let out = '';
            for (let i = 0; i < n; i++) {
              if (elapsed >= resolveAt(i)) {
                out += chars[i];
              } else {
                out += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
              }
            }
            el.textContent = out;
            elapsed += FRAME_MS;
            if (elapsed <= maxResolve + FRAME_MS) {
              setTimeout(tick, FRAME_MS);
            } else {
              el.textContent = finalText;
            }
          };
          tick();
        }, delay);
      };

      const triggerAdListGlitch = () => {
        adListDone = true;
        adList.classList.add('ad-list-ready');
        adListLinks.forEach((link, i) => scrambleItem(link, i * 120));
      };

      const resetAdList = () => {
        adListDone = false;
        adList.classList.remove('ad-list-ready');
        adListLinks.forEach(link => {
          link.textContent = link.getAttribute('data-content');
        });
      };

      // Nav button — letters play first, then list scrambles after they finish
      if (window.playArtEntranceAnimation) {
        const _origPlay   = window.playArtEntranceAnimation;
        const cellCount   = artEntranceSection.querySelectorAll('.art-cell').length;
        const lettersDone = (cellCount - 1) * 120 + 400;
        window.playArtEntranceAnimation = () => {
          resetAdList();
          _origPlay();
          setTimeout(triggerAdListGlitch, lettersDone);
        };
      }

      // Scroll path — fire once letters are fully revealed (section top at viewport top)
      const onScrollAdList = () => {
        if (adListDone || !artEntranceSection) return;
        const rect     = artEntranceSection.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / window.innerHeight;
        if (progress >= 1) triggerAdListGlitch();
      };
      window.addEventListener('scroll', onScrollAdList, { passive: true });

      // Reset on section exit so the sequence replays on next visit
      const adListResetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (!entry.isIntersecting) resetAdList(); });
      }, { threshold: 0 });
      adListResetObserver.observe(artEntranceSection);
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
    // Use a looser threshold (0.1) and no negative rootMargin so decorations within
    // #about's sticky viewport reliably trigger on short laptop screens (768–900px height).
    // The generic elementObserverOptions uses -20% bottom margin which pushes bar1 (at
    // top:750px inside #about) below the trigger zone on screens shorter than ~1000px.
    const decorationObserverOptions = { threshold: 0.1, rootMargin: '0px' };
    const createDecorationObserver = (className) => {
      document.querySelectorAll(className).forEach(el => {
        let hasEntered = false;
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              hasEntered = true;
              el.classList.remove('element-exit');
              el.classList.add('element-visible');
            } else if (hasEntered) {
              el.classList.remove('element-visible');
              el.classList.add('element-exit');
            }
          });
        }, decorationObserverOptions);
        obs.observe(el);
      });
    };
    createDecorationObserver('.decoration-bar1');
    createDecorationObserver('.decoration-bar2');
    createDecorationObserver('.decoration-certs1');
    createDecorationObserver('.decoration-vtv1');
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

      // Exit: observe #about itself — fires only when the full section leaves viewport.
      const skillsExitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && skillsShown) {
            skillsShown = false;
            decorationSkills.classList.remove('element-visible');
            decorationSkills.classList.add('element-exit');
          }
        });
      }, { threshold: 0 });
      if (aboutSection) skillsExitObserver.observe(aboutSection);
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
// INFO INTERFACE — HOTSPOT HINTS
// Hovering a step row adds .info-glow to the corresponding header target.
// Transparent <rect> hit areas sit on top of the SVG; pointer-events enabled
// only when badge is .active, so scroll is never blocked during entrance.
// ============================================================================

function initInfoInterfaceHints() {
  const badge = document.getElementById('infoInterface');
  if (!badge) return;

  const targets = {
    nav:    Array.from(document.querySelectorAll('.main-nav .nav-btn:not(.lang-btn):not(.sound-btn)')),
    scroll: Array.from(document.querySelectorAll('.intro-scroll-hint')),
    cta:    Array.from(document.querySelectorAll('.intro-work-cta')),
    sound:  [document.getElementById('sound-toggle')].filter(Boolean),
    lang:   Array.from(document.querySelectorAll('.lang-btn')),
  };

  // Elements with [data-char] children that can play the glitch animation.
  // Marked with .info-hint-suppress after their base page-load animations finish
  // so the hover toggle can change animation-name: none → glitch-switch (the
  // name change is what forces Chrome to restart — same pattern as the logo).
  const glitchEls = [...targets.nav, ...targets.cta, ...targets.lang];
  setTimeout(() => glitchEls.forEach(el => el.classList.add('info-hint-suppress')), 3000);

  const triggerGlitch = (els) => {
    const ready = els.filter(el => el.classList.contains('info-hint-suppress'));
    if (!ready.length) return;
    ready.forEach(el => el.classList.remove('info-hint-glitch'));
    void ready[0].getBoundingClientRect(); // one flush for the whole batch
    ready.forEach(el => el.classList.add('info-hint-glitch'));
  };

  // ── Sound button: scrambling char replaces the icon on hover ──────────────
  const soundBtn = targets.sound[0] ?? null;
  const soundGlitchChars = '!@#$%^&*<>?/|\\[]{}~±§¶•∆∑∏√∞≠≈∫◊ΦΨΩλβγδ'.split('');
  let soundScrambleId = null;

  const soundGlitchSpan = document.createElement('span');
  soundGlitchSpan.className = 'sound-glitch-char';
  soundGlitchSpan.setAttribute('aria-hidden', 'true');
  soundBtn?.appendChild(soundGlitchSpan);

  const startSoundScramble = () => {
    if (!soundBtn) return;
    soundBtn.classList.add('sound-glitching');
    soundGlitchSpan.textContent = soundGlitchChars[Math.floor(Math.random() * soundGlitchChars.length)];
    soundScrambleId = setInterval(() => {
      soundGlitchSpan.textContent = soundGlitchChars[Math.floor(Math.random() * soundGlitchChars.length)];
    }, 80);
  };

  const stopSoundScramble = () => {
    clearInterval(soundScrambleId);
    soundScrambleId = null;
    soundBtn?.classList.remove('sound-glitching');
  };
  // ─────────────────────────────────────────────────────────────────────────

  let activeHint = null;

  const clearHint = (hint) => {
    targets[hint]?.forEach(el => {
      el.classList.remove('info-glow', 'info-hint-glitch');
    });
    if (hint === 'sound') stopSoundScramble();
  };

  const applyHint = (hint) => {
    const els = targets[hint] ?? [];
    els.forEach(el => el.classList.add('info-glow'));
    triggerGlitch(els);
    if (hint === 'sound') startSoundScramble();
  };

  badge.addEventListener('mouseover', (e) => {
    const hotspot = e.target.closest('.inf-hotspot[data-hint]');
    const hint = hotspot?.dataset.hint ?? null;
    if (hint === activeHint) return;
    clearHint(activeHint);
    activeHint = hint;
    applyHint(activeHint);
  });

  badge.addEventListener('mouseleave', () => {
    clearHint(activeHint);
    activeHint = null;
  });
}

// ============================================================================
// INFO INTERFACE — BILINGUAL LOOP
// EN → flicker → ES → flicker → EN … forever.
// Content lines re-animate (staggered entrance) on every language change.
// ============================================================================

function initInfoInterfaceLangLoop() {
  const badge  = document.getElementById('infoInterface');
  if (!badge) return;

  const enGroup = badge.querySelector('#inf-en');
  const esGroup = badge.querySelector('#inf-es');
  if (!enGroup || !esGroup) return;

  const DISPLAY_MS = 6500;   // how long each language stays visible
  const EXIT_MS    = 450;    // duration of the flicker-out animation (must match CSS)

  let currentGroup = enGroup;
  let nextGroup    = esGroup;

  // Restart line animations on a group.
  // --line-offset controls the initial delay before stagger begins.
  function enterGroup(group, lineOffset = '0s') {
    group.style.setProperty('--line-offset', lineOffset);
    group.style.display = '';
    // Force animation restart: remove class → reflow → re-add
    group.classList.remove('inf-lang--entering');
    void group.getBoundingClientRect();
    group.classList.add('inf-lang--entering');
  }

  function doSwitch() {
    const outgoing = currentGroup;
    const incoming = nextGroup;

    // Flicker out the old group
    outgoing.classList.remove('inf-lang--entering');
    outgoing.classList.add('inf-lang--exiting');

    setTimeout(() => {
      // Hide old, reveal new with content entrance
      outgoing.style.display = 'none';
      outgoing.classList.remove('inf-lang--exiting');

      enterGroup(incoming, '0s');

      currentGroup = incoming;
      nextGroup    = outgoing;

      // Schedule the next switch
      setTimeout(doSwitch, DISPLAY_MS);
    }, EXIT_MS);
  }

  // Observe the badge becoming active (set by initCyberPanel)
  const mo = new MutationObserver(() => {
    if (!badge.classList.contains('active')) return;
    mo.disconnect();

    // Trigger EN entrance after the container slides in (0.75s = infoEntrance duration)
    enterGroup(enGroup, '0.75s');

    // Schedule first switch after EN has been visible long enough
    setTimeout(doSwitch, DISPLAY_MS);
  });
  mo.observe(badge, { attributes: true, attributeFilter: ['class'] });
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
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(data, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // --- Chrome fix: prefix all internal IDs to prevent conflicts with existing
      // document IDs (e.g. id="Layer_1-2" is shared with the DNA capsule SVG).
      // Duplicate IDs make Chrome mis-resolve url(#...) gradient/clip references.
      const ID_PREFIX = 'id1-';
      const idMap = {};
      svgElement.querySelectorAll('[id]').forEach(el => {
        const oldId = el.getAttribute('id');
        const newId = ID_PREFIX + oldId;
        idMap[oldId] = newId;
        el.setAttribute('id', newId);
      });

      // Update url(#...) references in presentation attributes
      const rewriteUrlAttr = (el, attrName) => {
        const val = el.getAttribute(attrName);
        if (!val) return;
        const next = val.replace(/url\(#([^)]+)\)/g, (_, id) =>
          `url(#${idMap[id] || id})`
        );
        if (next !== val) el.setAttribute(attrName, next);
      };
      svgElement.querySelectorAll('[fill]').forEach(el => rewriteUrlAttr(el, 'fill'));
      svgElement.querySelectorAll('[stroke]').forEach(el => rewriteUrlAttr(el, 'stroke'));
      svgElement.querySelectorAll('[clip-path]').forEach(el => rewriteUrlAttr(el, 'clip-path'));
      svgElement.querySelectorAll('[filter]').forEach(el => rewriteUrlAttr(el, 'filter'));
      svgElement.querySelectorAll('[mask]').forEach(el => rewriteUrlAttr(el, 'mask'));

      // --- Chrome fix: convert deprecated xlink:href → href for gradient inheritance.
      // Chrome 79+ moved away from the xlink namespace; inlined SVGs with xlink:href
      // on <radialGradient xlink:href="#other-gradient"> fail to inherit stops in Chrome.
      const XLINK_NS = 'http://www.w3.org/1999/xlink';
      svgElement.querySelectorAll('*').forEach(el => {
        const xlinkHref = el.getAttributeNS(XLINK_NS, 'href');
        if (xlinkHref !== null) {
          const refId = xlinkHref.startsWith('#') ? xlinkHref.slice(1) : null;
          const resolved = refId && idMap[refId] ? `#${idMap[refId]}` : xlinkHref;
          el.setAttribute('href', resolved);
          el.removeAttributeNS(XLINK_NS, 'href');
        }
      });

      // Copy identity attributes from the original <img>
      const imgClass = imgElement.className;
      const imgId = imgElement.id;
      svgElement.setAttribute('id', imgId);
      if (imgClass) svgElement.setAttribute('class', imgClass);

      // Add animation classes to internal elements (selectors use prefixed IDs where needed)
      const border = svgElement.querySelector(`#${ID_PREFIX}border`);
      const face   = svgElement.querySelector(`#${ID_PREFIX}face`);
      const hexagons   = svgElement.querySelectorAll('polygon[points*="39.43"], polygon[points*="77.83"], polygon[points*="116.41"], polygon[points*="154.28"]');
      const circles    = svgElement.querySelectorAll('circle[cx="27.6"], circle[cx="66"], circle[cx="104.57"]');
      const sideCircles= svgElement.querySelectorAll('circle[cx="49.26"]');
      const stars      = svgElement.querySelectorAll('polygon[points*="442.2"], polygon[points*="410.07"], polygon[points*="377.94"], polygon[points*="345.32"], polygon[points*="506.54"], polygon[points*="474.82"]');
      const rects      = svgElement.querySelectorAll('rect');

      if (border) border.classList.add('id1-border');
      if (face)   face.classList.add('id1-face');
      hexagons.forEach((hex, i) => { hex.classList.add('id1-hexagon'); hex.style.setProperty('--hex-index', i); });
      circles.forEach((c, i) => { c.classList.add('id1-circle'); c.style.setProperty('--circle-index', i); });
      sideCircles.forEach((c, i) => { c.classList.add('id1-side-circle'); c.style.setProperty('--side-circle-index', i); });
      stars.forEach((s, i) => { s.classList.add('id1-star'); s.style.setProperty('--star-index', i); });
      rects.forEach((r, i) => { r.classList.add('id1-rect'); r.style.setProperty('--rect-index', i); });

      imgElement.parentNode.replaceChild(svgElement, imgElement);

      setupID1Observer();
    })
    .catch(error => console.error('[ID1 SVG] Error loading SVG:', error));
}

/**
 * Sets up viewport observer for ID1 SVG (called after SVG conversion)
 */
function setupID1Observer() {
  const id1svg = document.getElementById('id1svg');
  if (!id1svg) return;

  // #id1svg is positioned with `position: relative; left: 980px; top: -464px`, placing
  // it well outside #about's layout bounds. Because #about has `overflow: clip`, Chrome's
  // IntersectionObserver treats the clip boundary as the intersection root — the element
  // never intersects and stays invisible. Fix: observe a stable in-flow proxy element
  // (#about-availability) and mirror its visibility state onto id1svg.
  const proxyEl =
    document.getElementById('about-availability') ||
    document.getElementById('about');
  if (!proxyEl) return;

  let id1Entered = false;
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
  }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });

  id1Observer.observe(proxyEl);
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

  // Info interface: bilingual loop + hotspot hover hints
  initInfoInterfaceLangLoop();
  initInfoInterfaceHints();

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

  // Sound toggle — wires up the button; actual audio will be hooked in a future pass
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const isActive = soundToggle.classList.toggle('active');
      soundToggle.setAttribute('aria-pressed', String(isActive));
    });
  }

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
    // On reload with #art-direction hash: scroll to section and play full sequence
    if (location.hash === '#art-direction' && window.playArtEntranceAnimation) {
      const artTarget = document.getElementById('art-direction');
      if (artTarget) window.scrollTo(0, artTarget.getBoundingClientRect().top + window.scrollY);
      window.playArtEntranceAnimation();
    }
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
// ABOUT SECTION PIN
// Keeps #about sticky while user scrolls through the extra height.
// Owns all Paul Rand quote animation.
//
// Modes:
//   AUTO-PLAY  — plays on section entry / nav click / reset.
//                Design h3 glitches → each yellow line slides in with glitch
//                and a readable pause → ending glitches in → static display.
//   SCROLL     — user scrolls into the sticky zone during auto-play → abort
//                auto-play and switch to bidirectional scroll-driven control.
//   STATIC     — full quote frozen; 5 s inactivity → resetAnimation().
// ============================================================================

(function initAboutPin() {
  const wrapper        = document.querySelector('.about-pin-wrapper');
  const about          = document.getElementById('about');
  const header         = document.querySelector('header');
  if (!wrapper || !about || !header) return;

  const quoteItems     = Array.from(document.querySelectorAll('.paul-rands-quote li'));
  const ending         = document.querySelector('.paul-rands-quote .ending');
  const quoteContainer = document.querySelector('.paul-rands-quote');
  const quoteH3        = document.querySelector('.paul-rands-quote h3');
  const numItems       = quoteItems.length; // 3

  const EXTRA_SCROLL     = 1200;
  const ENDING_THRESHOLD = (numItems + 0.5) / (numItems + 1); // 0.875
  const INACTIVITY_MS    = 5000;
  const STEP_ANIM        = 900;   // ms for one yellow-line slide-in
  const READABLE_PAUSE   = 1000;  // ms hold after glitch settles

  // ── State ────────────────────────────────────────────────────────────────────

  let lastIndex         = -2;   // last snapped item index (-2 = uninitialised)
  let endingShown       = false;
  let endingTimer       = null;
  let staticMode        = false;
  let inactivityTimer   = null;
  let sectionActive     = false;
  let sectionLeaveTimer = null;

  let autoPlayRunning      = false;
  let autoPlayRafId        = null;
  let autoPlayTimer        = null;
  let introStarted         = false; // prevents re-firing after user takes scroll control
  let programmaticScroll   = false; // true while nav-triggered scroll is in flight
  let programmaticScrollTimer = null;

  // ── Shared helpers ───────────────────────────────────────────────────────────

  function measure() {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', h + 'px');
    wrapper.style.height = about.offsetHeight + EXTRA_SCROLL + 'px';
  }

  function triggerGlitch(el) {
    el.classList.remove('glitch-active');
    void el.offsetWidth;
    el.classList.add('glitch-active');
  }

  function glitchDuration(el) {
    const chars = el.querySelectorAll('[data-char]');
    if (!chars.length) return 500;
    return 500 + (chars.length - 1) * 0.55 * 200;
  }

  function applyOffset(offset) {
    const ty = -offset * 1.2;
    quoteItems.forEach(li => { li.style.transform = `translateY(${ty}em)`; });
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function pinProgress() {
    return Math.max(0, Math.min(1, (window.scrollY - wrapper.offsetTop) / EXTRA_SCROLL));
  }

  // ── Static mode ──────────────────────────────────────────────────────────────

  function onStaticActivity() {
    if (staticMode) startInactivityTimer();
  }

  function startInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => { if (staticMode) resetAnimation(); }, INACTIVITY_MS);
  }

  function showStatic() {
    autoPlayRunning          = false;
    staticMode               = true;
    window._scrollPathActive = true;
    if (quoteContainer) quoteContainer.classList.add('static-display');
    if (ending) ending.classList.add('visible');
    startInactivityTimer();
    ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(ev =>
      window.addEventListener(ev, onStaticActivity, { passive: true }));
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  function abortAutoPlay() {
    autoPlayRunning = false;
    if (autoPlayRafId) { cancelAnimationFrame(autoPlayRafId); autoPlayRafId = null; }
    clearTimeout(autoPlayTimer);
  }

  function resetAnimation() {
    abortAutoPlay();
    clearTimeout(inactivityTimer);
    clearTimeout(sectionLeaveTimer);
    clearTimeout(endingTimer);

    staticMode               = false;
    endingShown              = false;
    lastIndex                = -2;
    introStarted             = false;
    window._scrollPathActive = false;

    if (quoteContainer) quoteContainer.classList.remove('static-display');
    quoteItems.forEach(li => { li.classList.remove('glitch-active'); li.style.transform = ''; });
    if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }

    ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(ev =>
      window.removeEventListener(ev, onStaticActivity));

    if (sectionActive) {
      if (quoteH3) triggerGlitch(quoteH3);
      runIntro(); // nav-scroll will land at pp=0; programmaticScroll guards abort
    }
  }

  // ── Auto-play sequence ───────────────────────────────────────────────────────

  function animateStep(fromOffset, toOffset, onDone) {
    let startTime = null;
    function tick(ts) {
      if (!autoPlayRunning) return;
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / STEP_ANIM, 1);
      applyOffset(fromOffset + (toOffset - fromOffset) * easeOutCubic(t));
      if (t < 1) {
        autoPlayRafId = requestAnimationFrame(tick);
      } else {
        autoPlayRafId = null;
        onDone();
      }
    }
    autoPlayRafId = requestAnimationFrame(tick);
  }

  function runStep(stepIndex) {
    if (!autoPlayRunning) return;

    if (stepIndex < numItems) {
      animateStep(stepIndex - 1, stepIndex, () => {
        if (!autoPlayRunning) return;
        triggerGlitch(quoteItems[stepIndex]);
        lastIndex = stepIndex; // keep scroll-driven in sync
        const settleMs = glitchDuration(quoteItems[stepIndex]);
        autoPlayTimer = setTimeout(() => {
          if (!autoPlayRunning) return;
          autoPlayTimer = setTimeout(() => runStep(stepIndex + 1), READABLE_PAUSE);
        }, settleMs);
      });

    } else {
      // All yellow lines shown — reveal ending.
      endingShown = true;
      if (ending) {
        ending.classList.add('visible');
        triggerGlitch(ending);
        autoPlayTimer = setTimeout(showStatic, glitchDuration(ending));
      } else {
        showStatic();
      }
    }
  }

  function runIntro() {
    if (autoPlayRunning || staticMode) return;
    introStarted    = true;
    autoPlayRunning = true;
    applyOffset(-1);
    lastIndex = -2;
    if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }

    const h3Ms = quoteH3 ? glitchDuration(quoteH3) : 500;
    autoPlayTimer = setTimeout(() => {
      if (!autoPlayRunning) return;
      runStep(0);
    }, h3Ms + READABLE_PAUSE);
  }

  // ── Scroll handler ───────────────────────────────────────────────────────────

  function onScroll() {
    const pp = pinProgress();
    window._scrollPathActive = pp > 0;

    // Only abort auto-play when the user manually scrolls into the sticky zone.
    // Programmatic nav-scroll must not kill the intro it just triggered.
    if (autoPlayRunning) {
      if (pp > 0 && !programmaticScroll) {
        abortAutoPlay(); // user dragged into the zone — take scroll control
        // fall through to scroll-driven
      } else {
        return; // auto-play owns the DOM (nav scroll or not yet in zone)
      }
    }

    if (staticMode) {
      if (pp < ENDING_THRESHOLD) {
        // User scrolled backward past the ending — unlock static mode.
        staticMode  = false;
        endingShown = false;
        if (quoteContainer) quoteContainer.classList.remove('static-display');
        if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
        clearTimeout(inactivityTimer);
        ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(ev =>
          window.removeEventListener(ev, onStaticActivity));
        // Fall through to scroll-driven logic below.
      } else {
        return; // Still past the threshold — keep frozen.
      }
    }

    if (pp === 0) {
      applyOffset(-1); // items below visible slot
      lastIndex = -2;
      return;
    }

    // Scroll-driven mode: map scroll progress to item offset.
    const rawOffset     = pp * (numItems + 1) - 1;
    const clampedOffset = Math.max(-1, Math.min(numItems - 1, rawOffset));
    const currentIndex  = Math.round(clampedOffset); // -1, 0, 1, or 2

    applyOffset(clampedOffset);

    // Glitch fires on index change — forward OR backward.
    if (currentIndex !== lastIndex && currentIndex >= 0 && currentIndex < numItems) {
      triggerGlitch(quoteItems[currentIndex]);
    }
    lastIndex = currentIndex;

    // Ending: show at threshold, hide if user scrolls back before static locks.
    if (pp >= ENDING_THRESHOLD && !endingShown) {
      endingShown = true;
      if (ending) {
        ending.classList.add('visible');
        triggerGlitch(ending);
        endingTimer = setTimeout(showStatic, glitchDuration(ending));
      } else {
        showStatic();
      }
    } else if (pp < ENDING_THRESHOLD && endingShown) {
      clearTimeout(endingTimer);
      endingShown = false;
      if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
    }
  }

  // ── Section observer ─────────────────────────────────────────────────────────

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      sectionActive = entry.isIntersecting;

      if (!sectionActive) {
        clearTimeout(inactivityTimer);
        clearTimeout(sectionLeaveTimer);
        if (autoPlayRunning) abortAutoPlay();
        sectionLeaveTimer = setTimeout(resetAnimation, 5000);
      } else {
        clearTimeout(sectionLeaveTimer);
        if (quoteH3) triggerGlitch(quoteH3);
        if (!introStarted) runIntro(); // only on first entry or after reset
      }
    });
  }, { threshold: 0.05 });

  // ── Nav button / bfcache ─────────────────────────────────────────────────────

  const aboutNavBtn = document.querySelector('a[href="#about"].nav-btn');
  if (aboutNavBtn) {
    aboutNavBtn.addEventListener('click', (e) => {
      e.preventDefault(); // suppress default anchor jump; we control the scroll

      // Mark scroll as programmatic so onScroll won't abort the intro mid-flight.
      programmaticScroll = true;
      clearTimeout(programmaticScrollTimer);
      // NAV_SCROLL_DURATION is 1600 ms; add buffer for observer + first RAF tick.
      programmaticScrollTimer = setTimeout(() => { programmaticScroll = false; }, 2200);

      clearTimeout(sectionLeaveTimer);
      resetAnimation();

      // Scroll to the exact pp=0 position: section sticks at top, intro starts clean.
      const targetY = Math.max(0, wrapper.offsetTop - header.offsetHeight);
      smoothScrollTo(targetY);
    });
  }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) resetAnimation();
  });

  // ── Init ─────────────────────────────────────────────────────────────────────

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', onScroll, { passive: true });
  observer.observe(about);
  onScroll();
})();
