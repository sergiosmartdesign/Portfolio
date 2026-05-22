/**
 * script.js — application coordinator.
 * Business logic lives in focused modules; this file wires them together.
 */

import { makeStaticLine, bindSectionEdge }   from './static-line.js';
import { convertID1SvgToInline }             from './svg-inline.js';
import { initArtDirectionEntrance }          from './art-direction.js';
import { initAboutPin }                      from './about-pin.js';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split(''); // keep in sync with preloader.js

// Navigation exit flag — set true for 2 s when nav jumps away from #photo
// so the photo reveal scroll handler ignores the programmatic scroll.
let _photoNavExit = false;

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

// JS mirrors of :root CSS variables in css/styles.css.
// When updating either side, update both.
const CSS = {
  transitionFast: '0.2s',    // --transition-fast / --duration-quick
  glitchStagger:   0.04,     // --glitch-stagger on .main-nav .nav-btn (line ~1149)
  easingEaseOut:  'ease-out', // --easing-ease-out
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
   * Add glitch animation to logo on hover.
   * Delegates to GlitchSystem.triggerGlitch() — same mechanism as info-hints.
   */
  initLogoGlitch() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    // Suppress the page-load reveal after it finishes so the first hover gets
    // a clean name-change restart (none → glitch-switch). If the user hovers
    // before the timeout, triggerGlitch() adds glitch-suppressed on-demand.
    setTimeout(() => logo.classList.add('glitch-suppressed'), 3000);

    logo.addEventListener('mouseenter', () => GlitchSystem.triggerGlitch(logo));
    logo.addEventListener('mouseleave', () => logo.classList.remove('glitch-firing'));
  }

  /**
   * Trigger a fresh glitch animation on a single element.
   * Adds glitch-suppressed (animation-name: none) if absent, then does a
   * remove → getBoundingClientRect() flush → add of glitch-firing so Chrome
   * always sees the animation-name change from none → glitch-switch.
   */
  static triggerGlitch(el) {
    el.classList.add('glitch-suppressed');
    el.classList.remove('glitch-firing');
    void el.getBoundingClientRect();
    el.classList.add('glitch-firing');
  }

  /**
   * Trigger glitch on multiple elements with a single reflow flush.
   * Filters to elements that actually contain [data-char] children.
   */
  static triggerGlitchBatch(els) {
    const capable = els.filter(el => el.querySelector('[data-char]'));
    if (!capable.length) return;
    capable.forEach(el => {
      el.classList.add('glitch-suppressed');
      el.classList.remove('glitch-firing');
    });
    void capable[0].getBoundingClientRect();
    capable.forEach(el => el.classList.add('glitch-firing'));
  }

  initSealGlitch() {
    const sealCta = document.getElementById('seal-cta');
    if (!sealCta) return;

    sealCta.addEventListener('mouseenter', function() {
      const chars = this.querySelectorAll('.seal-label [data-char]');
      chars.forEach((char, index) => {
        char.style.animation = 'none';
        void char.offsetWidth;
        char.style.animation = `glitch-switch ${CSS.transitionFast} steps(1) ${index * CSS.glitchStagger}s 6 backwards`;
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
    this.hamburger  = document.getElementById('hamburger-btn');
    this.drawer     = document.getElementById('main-nav');
    this.backdrop   = document.getElementById('nav-backdrop');
    this._boundKeydown = this._handleKeydown.bind(this);

    this.buildSectionMap();
    this.setupClickHandlers();
    this.setupScrollHandler();
    this.setupMobileNav();
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

    const sectionClasses = [
      'section-intro',
      'section-about',
      'section-art-direction',
      'section-photo',
      'section-illustration',
      'section-contact'
    ];

    // Remove all section classes from header and body
    this.header.classList.remove(...sectionClasses);
    document.body.classList.remove(...sectionClasses);

    // Add new section class to both
    if (sectionId) {
      this.header.classList.add(`section-${sectionId}`);
      document.body.classList.add(`section-${sectionId}`);
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
                _photoNavExit = true;
                setTimeout(() => { _photoNavExit = false; }, 2000);
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
            if (App.playArtEntranceAnimation) App.playArtEntranceAnimation();
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

  setupMobileNav() {
    if (!this.hamburger || !this.drawer || !this.backdrop) return;

    this.hamburger.addEventListener('click', () => this.toggleDrawer());
    this.backdrop.addEventListener('click',  () => this.closeDrawer());

    // Close on any nav link click
    this.drawer.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeDrawer());
    });
  }

  toggleDrawer() {
    const isOpen = this.drawer.classList.contains('is-open');
    isOpen ? this.closeDrawer() : this.openDrawer();
  }

  openDrawer() {
    this.drawer.classList.add('is-open');
    this.backdrop.classList.add('is-visible');
    document.body.classList.add('nav-open');
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.hamburger.setAttribute('aria-label', 'Close navigation menu');
    document.addEventListener('keydown', this._boundKeydown);
    // Move focus into drawer
    const firstFocusable = this._getFocusable()[0];
    if (firstFocusable) firstFocusable.focus();
  }

  closeDrawer() {
    this.drawer.classList.remove('is-open');
    this.backdrop.classList.remove('is-visible');
    document.body.classList.remove('nav-open');
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.hamburger.setAttribute('aria-label', 'Open navigation menu');
    document.removeEventListener('keydown', this._boundKeydown);
    this.hamburger.focus();
  }

  _getFocusable() {
    return Array.from(
      this.drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.closest('[hidden]'));
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') {
      this.closeDrawer();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = this._getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
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
// SECTION ANIMATION INIT — one plain function per domain
// ============================================================================

function initCyberPanel(delay = TIMING.CYBER_PANEL_DELAY) {
  const panel = document.getElementById('introCyberPanel');
  if (!panel) return;

  setTimeout(() => {
    panel.classList.add('active');

    // Info interface slides in last — after social icons (~1500 ms).
    const infoInterface = document.getElementById('infoInterface');
    if (infoInterface) {
      setTimeout(() => infoInterface.classList.add('active'), 2000);
    }
  }, delay);
}

// Pause/resume canvas animations when #intro leaves / re-enters the viewport.
function initIntroObserver() {
  const introSection = document.getElementById('intro');
  if (!introSection) return;

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        introSection.classList.remove('paused-animations');

        // Don't start JS canvas animations while preloader is still showing
        // (Orb3D is excluded — its CSS animations run freely during preloading)
        if (!document.body.classList.contains('preloading')) {
          if (App.ParticleSystem?.resume) App.ParticleSystem.resume();
          if (App.BarcodeAnimation?.start) App.BarcodeAnimation.start();
        }
      } else {
        introSection.classList.add('paused-animations');

        if (App.ParticleSystem?.pause) App.ParticleSystem.pause();
        if (App.Orb3D?.pause) App.Orb3D.pause();
        if (App.BarcodeAnimation?.stop) App.BarcodeAnimation.stop();
      }
    });
  }, { threshold: 0.2, rootMargin: '-100px' }).observe(introSection);
}

// Scroll-triggered animations for the #about section:
// section glitch-active, cert gallery, per-element visibility, DNA group, SVG decorations.
function initAboutAnimations() {
  const aboutSection     = document.getElementById('about');
  const certGalleryLayer = document.querySelector('.cert-gallery-layer');

  const scrollTriggerOptions   = { threshold: 0.05, rootMargin: '0px 0px -10% 0px' };
  const elementObserverOptions = { threshold: 0.3,  rootMargin: '0px 0px -20% 0px' };

  // Scroll guard — prevents scroll-triggered animations from firing on page load.
  let userHasScrolled = false;
  const scrollGuardListener = () => {
    if (window.scrollY > 100) {
      userHasScrolled = true;
      window.removeEventListener('scroll', scrollGuardListener);
    }
  };
  window.addEventListener('scroll', scrollGuardListener);

  // About section — one-time glitch-active + pause-resume on re-entry.
  if (aboutSection) {
    let aboutAnimationTriggered = false;

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !aboutAnimationTriggered && userHasScrolled) {
          aboutSection.classList.remove('paused-animations');
          aboutSection.classList.add('glitch-active');
          aboutAnimationTriggered = true;
        } else if (!entry.isIntersecting && aboutAnimationTriggered) {
          aboutSection.classList.add('paused-animations');
        } else if (entry.isIntersecting && aboutAnimationTriggered) {
          aboutSection.classList.remove('paused-animations');
        }
      });
    }, scrollTriggerOptions).observe(aboutSection);
  }

  // Certificate gallery — reveal once on first scroll-into-view.
  if (certGalleryLayer) {
    let certGalleryAnimated = false;

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !certGalleryAnimated && userHasScrolled) {
          certGalleryLayer.classList.add('visible');
          certGalleryAnimated = true;
        }
      });
    }, scrollTriggerOptions).observe(certGalleryLayer);
  }

  // Per-element visibility toggle (element-visible / element-exit).
  const createVisibilityObserver = (targets) => {
    targets.forEach(element => {
      let hasEntered = false;
      new IntersectionObserver((entries) => {
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
      }, elementObserverOptions).observe(element);
    });
  };

  createVisibilityObserver([
    document.getElementById('abouttitle'),
    ...document.querySelectorAll('#about .about-left p'),
    document.getElementById('about-availability'),
    document.getElementById('about-metrics'),
    document.getElementById('seal-cta'),
    document.getElementById('paulrand-quote'),
    document.getElementById('paulrand-author'),
    document.getElementById('aboutp4'),
  ].filter(Boolean));
  // Note: ID1 SVG observer is set up after SVG conversion — see svg-inline.js

  // DNA group — dnatitle + dnacapsule1 + .about-right yellow line.
  // Entry fires 800 ms after #aboutp2 enters viewport (matching its slideInFromLeft delay).
  // Exit fires when #about fully leaves the viewport.
  const dnatitleEl = document.getElementById('dnatitle');
  const dnaCapsule = document.getElementById('dnacapsule1');
  const aboutRight = document.querySelector('.about-right');
  let dnaGroupVisible       = false;
  let dnaAnimationsTriggered = false;

  const enterDnaGroup = () => {
    dnaGroupVisible = true;
    [dnatitleEl, dnaCapsule, aboutRight].forEach(el => {
      if (!el) return;
      el.classList.remove('element-exit');
      el.classList.add('element-visible');
    });
    if (App.glitchSystem && !dnaAnimationsTriggered) {
      dnaAnimationsTriggered = true;
      setTimeout(() => App.glitchSystem.initDNAGlitch(),    TIMING.DNA_GLITCH_DELAY);
      setTimeout(() => App.glitchSystem.animateDNAReveal(), TIMING.DNA_REVEAL_DELAY);
    }
  };

  const exitDnaGroup = () => {
    dnaGroupVisible = false;
    [dnatitleEl, dnaCapsule, aboutRight].forEach(el => {
      if (!el) return;
      el.classList.remove('element-visible');
      el.classList.add('element-exit');
    });
  };

  const aboutp2El = document.getElementById('aboutp2');
  if (aboutp2El) {
    let entryTimer = null;
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !dnaGroupVisible) {
          entryTimer = setTimeout(enterDnaGroup, 800);
        } else if (!entry.isIntersecting) {
          clearTimeout(entryTimer);
        }
      });
    }, elementObserverOptions).observe(aboutp2El);
  }

  if (aboutSection) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && dnaGroupVisible) exitDnaGroup();
      });
    }, { threshold: 0 }).observe(aboutSection);
  }

  // SVG decoration bars — looser threshold so they trigger reliably on short screens
  // (the -20% rootMargin in elementObserverOptions pushes bar1 off-screen at ~900 px height).
  const decorationObserverOptions = { threshold: 0.1, rootMargin: '0px' };
  const createDecorationObserver = (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      let hasEntered = false;
      new IntersectionObserver((entries) => {
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
      }, decorationObserverOptions).observe(el);
    });
  };

  createDecorationObserver('.decoration-bar1');
  createDecorationObserver('.decoration-bar2');
  createDecorationObserver('.decoration-certs1');
  createDecorationObserver('.decoration-vtv1');

  // .decoration-skills: same entry/exit pair pattern as the DNA group.
  const decorationSkills = document.querySelector('.decoration-skills');
  if (decorationSkills) {
    let skillsShown = false;
    let skillsTimer = null;

    const skillsTriggerEl = document.getElementById('aboutp2');
    if (skillsTriggerEl) {
      new IntersectionObserver((entries) => {
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
      }, elementObserverOptions).observe(skillsTriggerEl);
    }

    if (aboutSection) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && skillsShown) {
            skillsShown = false;
            decorationSkills.classList.remove('element-visible');
            decorationSkills.classList.add('element-exit');
          }
        });
      }, { threshold: 0 }).observe(aboutSection);
    }
  }
}

// Scroll-linked clip-path reveal for #photo + static line + collision star.
function initPhotoReveal() {
  const photoSection     = document.querySelector('#photo');
  const photoSpacer      = document.querySelector('.photo-scroll-spacer');
  const staticLineCanvas = document.querySelector('.photo-static-line');

  if (photoSection && photoSpacer && staticLineCanvas) {
    // shadow: false — CSS filter on the canvas handles the glow
    // throttleEvery: 4 — ~15 fps; flicker is imperceptible above 12 fps
    const { show: showStaticLine, hide: hideStaticLine } =
      makeStaticLine(staticLineCanvas, { shadow: false, throttleEvery: 4, resizeDebounce: 100 });
    let scrollTimeout = null;

    const updatePhotoReveal = () => {
      if (_photoNavExit) return;

      const spacerRect     = photoSpacer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Entry: 0→1 as spacer.top descends from viewportH to 0
      const entryProgress = 1 - (spacerRect.top / viewportHeight);
      const entryClamped  = Math.max(0, Math.min(1, entryProgress));

      // Exit: 0→1 over the last viewport of the spacer (spacer.bottom → 0)
      const exitProgress = Math.max(0, Math.min(1, 1 - (spacerRect.bottom / viewportHeight)));

      if (exitProgress > 0) {
        photoSection.style.visibility = exitProgress < 1 ? 'visible' : 'hidden';
        photoSection.style.clipPath   = `inset(${exitProgress * 100}% 0 0 0)`;
        staticLineCanvas.style.top    = `${exitProgress * viewportHeight - 2}px`;
        exitProgress < 1 ? showStaticLine() : hideStaticLine();
      } else {
        photoSection.style.visibility = entryClamped > 0 ? 'visible' : 'hidden';
        photoSection.style.clipPath   = `inset(0 0 ${(1 - entryClamped) * 100}% 0)`;
        staticLineCanvas.style.top    = `${entryClamped * viewportHeight - 2}px`;
        (entryClamped > 0 && entryClamped < 1) ? showStaticLine() : hideStaticLine();
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(hideStaticLine, 150);
    };

    // RAF-gate: coalesce scroll events into one layout read+write per frame.
    let _photoRevealPending = false;
    const schedulePhotoReveal = () => {
      if (_photoRevealPending) return;
      _photoRevealPending = true;
      requestAnimationFrame(() => { _photoRevealPending = false; updatePhotoReveal(); });
    };

    window.addEventListener('scroll', schedulePhotoReveal, { passive: true });
    updatePhotoReveal();
  }

  // Collision star — fires when the about-bottom static line meets the photo reveal edge.
  const collisionStar = document.getElementById('line-collision-star');
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

      const spacerTop = spacerEl.getBoundingClientRect().top;
      const clamped   = Math.max(0, Math.min(1, 1 - spacerTop / vh));
      if (clamped <= 0 || clamped >= 1) { overlapping = false; return; }

      const revealEdgeY   = clamped * vh;
      const inOverlapZone = Math.abs(aboutBottom - revealEdgeY) < 8;

      if (inOverlapZone && !overlapping && !animating) {
        overlapping = true;
        animating   = true;
        collisionStar.style.top = ((aboutBottom + revealEdgeY) / 2) + 'px';

        collisionStar.classList.remove('firing');
        void collisionStar.offsetWidth; // force reflow to restart CSS animation
        collisionStar.classList.add('firing');

        setTimeout(() => { collisionStar.classList.remove('firing'); animating = false; }, 800);
      } else if (!inOverlapZone) {
        overlapping = false;
      }
    };

    window.addEventListener('scroll', checkLineOverlap, { passive: true });
  }
}

// Animated static lines at section edges (about top/bottom, art-direction bottom).
function initStaticLines() {
  const aboutEl = document.getElementById('about');

  const aboutBottomCanvas = document.querySelector('.about-bottom-static-line');
  if (aboutBottomCanvas) {
    bindSectionEdge(aboutBottomCanvas, makeStaticLine(aboutBottomCanvas), aboutEl, 'bottom');
  }

  const aboutTopCanvas = document.querySelector('.about-top-static-line');
  if (aboutTopCanvas) {
    bindSectionEdge(aboutTopCanvas, makeStaticLine(aboutTopCanvas), aboutEl, 'top');
  }

  const artDirBottomCanvas = document.querySelector('.art-direction-bottom-static-line');
  if (artDirBottomCanvas) {
    bindSectionEdge(artDirBottomCanvas, makeStaticLine(artDirBottomCanvas),
      document.getElementById('art-direction'), 'bottom');
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
    scroll: Array.from(document.querySelectorAll('.intro-scroll-hint--on-info')),
    cta:    Array.from(document.querySelectorAll('.intro-work-cta')),
    sound:  [document.getElementById('sound-toggle')].filter(Boolean),
    lang:   Array.from(document.querySelectorAll('.lang-btn')),
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
    targets[hint]?.forEach(el => el.classList.remove('info-glow', 'glitch-firing'));
    if (hint === 'sound') stopSoundScramble();
  };

  const applyHint = (hint) => {
    const els = targets[hint] ?? [];
    els.forEach(el => el.classList.add('info-glow'));
    // GlitchSystem.triggerGlitchBatch adds glitch-suppressed on-demand (no
    // timeout race) and internally filters to elements with [data-char] children.
    GlitchSystem.triggerGlitchBatch(els);
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

// Disable browser scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Runs fn(), logs a labelled error and continues if it throws.
// Keeps every subsystem independent: one broken DOM element can't block navigation.
function safeInit(label, fn) {
  try { return fn(); }
  catch (e) { console.error(`[init:${label}]`, e); }
}

window.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  safeInit('date',       updateDate);
  safeInit('svg-inline', convertID1SvgToInline);
  safeInit('lang-loop',  initInfoInterfaceLangLoop);
  safeInit('info-hints', initInfoInterfaceHints);

  const introSection = document.getElementById('intro');
  if (introSection) introSection.scrollIntoView({ behavior: 'instant', block: 'start' });

  const glitchSystem      = safeInit('GlitchSystem',      () => new GlitchSystem());
  const navigationManager = safeInit('NavigationManager', () => new NavigationManager());
  if (navigationManager) navigationManager.updateHeaderBackground('intro');
  initIntroObserver();
  initAboutAnimations();
  initPhotoReveal();
  initStaticLines();
  initArtDirectionEntrance(document.getElementById('art-direction'));
  if (glitchSystem) App.glitchSystem = glitchSystem;

  safeInit('sound-toggle', () => {
    const soundToggle = document.getElementById('sound-toggle');
    if (!soundToggle) return;
    soundToggle.addEventListener('click', () => {
      const isActive = soundToggle.classList.toggle('active');
      soundToggle.setAttribute('aria-pressed', String(isActive));
    });
  });

  // sidebar uses CSS transition — unaffected by animation-play-state freeze
  window.addEventListener('preloaderExiting', () => {
    initCyberPanel(800);
  }, { once: true });

  // Orb3D excluded — runs since page load, visible above the preloader
  window.addEventListener('preloaderDone', () => {
    if (App.ParticleSystem?.resume)    App.ParticleSystem.resume();
    if (App.BarcodeAnimation?.start)   App.BarcodeAnimation.start();
    if (location.hash === '#art-direction' && App.playArtEntranceAnimation) {
      safeInit('art-entrance-hash', () => {
        const artTarget = document.getElementById('art-direction');
        if (artTarget) window.scrollTo(0, artTarget.getBoundingClientRect().top + window.scrollY);
        App.playArtEntranceAnimation();
      });
    }
  }, { once: true });
});

window.addEventListener('load',         () => window.scrollTo(0, 0));
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

// About section pin (→ about-pin.js). smoothScrollTo injected to avoid circular import.
safeInit('about-pin', () => initAboutPin(smoothScrollTo));
