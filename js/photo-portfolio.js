/**
 * photo-portfolio.js
 * Interactive photography portfolio list for the #photo section.
 * Sits as an overlay above the WebGL volumetric-light background.
 *
 * Dependencies: gsap.min.js + ScrambleTextPlugin.min.js (loaded before this file)
 */

(function () {
  'use strict';

  // Row 0 reveals at scrollProgress2 = REVEAL_START
  // Row 19 reveals at scrollProgress2 = REVEAL_END
  const REVEAL_START = 0.05;
  const REVEAL_END   = 0.85;

  class PhotoPortfolioManager {
    constructor() {
      this.overlay      = document.querySelector('.photo-portfolio-overlay');
      this.bgImage      = document.getElementById('photoBgImage');
      this.projectList  = document.querySelector('.photo-project-list');
      this.projectItems = document.querySelectorAll('.photo-project-item');
      this.photoSpacer  = document.querySelector('.photo-scroll-spacer');

      if (!this.overlay || !this.bgImage || !this.projectItems.length || !this.photoSpacer) return;

      this.currentActiveIndex = -1;
      this.originalTexts      = new Map();
      this.debounceTimeout    = null;
      this.idleAnimation      = null;
      this.idleTimer          = null;
      this.scrollProgress2    = 0;
      this.scrollProgress3    = 0;

      // Scroll-driven reveal state
      this.revealedItems        = new Set(); // indices of currently visible rows
      this.allRevealedOnce      = false;     // idle timer guard — fires once per full reveal
      this.interactionsEnabled  = false;     // hover image only active when all rows visible

      // All revealable elements in DOM order: title, section headers, project items
      this.allItems = [...document.querySelectorAll(
        '.photo-portfolio-title, .photo-section-header, .photo-project-item'
      )];

      // Pre-compute the scroll threshold for each revealable element
      const total = this.allItems.length;
      this.thresholds = Array.from({ length: total }, (_, i) =>
        REVEAL_START + (i / (total - 1)) * (REVEAL_END - REVEAL_START)
      );

      // Cache original text for ScrambleText restore
      this.projectItems.forEach(item => {
        const els = item.querySelectorAll('.hover-text');
        this.originalTexts.set(item, Array.from(els).map(el => el.textContent));
      });

      gsap.registerPlugin(ScrambleTextPlugin);

      // Start title and section headers hidden — revealed via glitch flash in phase 3
      const titleEl = document.querySelector('.photo-portfolio-title');
      const sectionHeaders = document.querySelectorAll('.photo-section-header');
      if (titleEl) gsap.set(titleEl, { opacity: 0 });
      sectionHeaders.forEach(h => gsap.set(h, { opacity: 0 }));
    }

    init() {
      // Cache layout values — refreshed on resize, never read inside scroll handler.
      this.winH         = window.innerHeight;
      this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;

      window.addEventListener('resize', () => {
        this.winH         = window.innerHeight;
        this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;
      }, { passive: true });

      this.preloadImages();

      this.projectItems.forEach((item, index) => {
        this.addEventListeners(item, index);
      });

      this.projectList.addEventListener('mouseleave', () => {
        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        this.clearActiveStates();
        this.hideBackgroundImage();
        this.startIdleTimer();
        this.updateScrollFade();
      });

      this.projectList.addEventListener('scroll', () => this.updateScrollFade(), { passive: true });

      window.addEventListener('scroll', () => this.updateScroll(), { passive: true });
      this.updateScroll();
    }

    // ── Scroll-driven visibility ─────────────────────────────────────────────
    updateScroll() {
      // Use cached values — no getBoundingClientRect() or window.innerHeight on every scroll.
      const spacerTop   = this.spacerDocTop - window.scrollY;
      const rawProgress = 1 - (spacerTop / this.winH);
      const newProgress2 = Math.max(0, Math.min(1, rawProgress - 1));
      // Phase 3: starts only after text has reached top (rawProgress 2→3)
      const newProgress3 = Math.max(0, Math.min(1, rawProgress - 2));

      const p2Changed = Math.abs(newProgress2 - this.scrollProgress2) >= 0.003;
      const p3Changed = Math.abs(newProgress3 - this.scrollProgress3) >= 0.003;
      if (!p2Changed && !p3Changed) return;

      this.scrollProgress2 = newProgress2;
      this.scrollProgress3 = newProgress3;

      // Overlay fades in with phase 2 (text moving to top)
      this.overlay.style.opacity       = newProgress2;
      this.overlay.style.pointerEvents = newProgress2 > 0 ? 'auto' : 'none';

      // Rows reveal only in phase 3 (after text has settled at top)
      this.updateRowReveal(newProgress3);
    }

    // ── Per-row scroll-scrub reveal ──────────────────────────────────────────
    updateRowReveal(progress) {
      let allRevealed = true;

      this.allItems.forEach((item, i) => {
        const threshold  = this.thresholds[i];
        const shouldShow = progress >= threshold;
        const isShown    = this.revealedItems.has(i);

        if (shouldShow && !isShown) {
          // Threshold crossed scrolling DOWN → glitch flash the row in
          this.revealedItems.add(i);
          this.glitchFlashRow(item);

        } else if (!shouldShow && isShown) {
          // Threshold crossed scrolling UP → instant hide, no animation
          this.revealedItems.delete(i);
          gsap.killTweensOf(item);
          gsap.set(item, { opacity: 0 });
        }

        if (!shouldShow) allRevealed = false;
      });

      // Enable hover interactions and arm idle timer once all rows are visible
      if (allRevealed && !this.allRevealedOnce) {
        this.allRevealedOnce     = true;
        this.interactionsEnabled = true;
        this.startIdleTimer();
      }

      // Disable interactions and reset guard when rows are hidden again
      if (!allRevealed) {
        this.interactionsEnabled = false;
        this.allRevealedOnce     = false;
        // Clean up any active hover state
        if (this.currentActiveIndex !== -1) {
          this.clearActiveStates();
          this.hideBackgroundImage();
        }
      }
    }

    // ── Glitch flash on reveal — mirrors the electric static-line aesthetic ──
    glitchFlashRow(item) {
      gsap.killTweensOf(item);
      gsap.set(item, { opacity: 0 });
      gsap.to(item, {
        keyframes: [
          { opacity: 1,    duration: 0.04, ease: 'none' },
          { opacity: 0.15, duration: 0.03, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.35, duration: 0.02, ease: 'none' },
          { opacity: 1,    duration: 0.05, ease: 'none' },
        ]
      });
    }

    // ── Preload images ───────────────────────────────────────────────────────
    preloadImages() {
      this.projectItems.forEach(item => {
        const url = item.dataset.image;
        if (url) {
          const img = new Image();
          img.src = url;
        }
      });
    }

    // ── Row hover interactions ───────────────────────────────────────────────
    addEventListeners(item, index) {
      const textEls       = item.querySelectorAll('.hover-text');
      const imageUrl      = item.dataset.image;
      const originalTexts = this.originalTexts.get(item);

      item.addEventListener('mouseenter', () => {
        if (!this.interactionsEnabled) return;
        this.stopIdleAnimation();
        this.stopIdleTimer();
        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        if (this.currentActiveIndex === index) return;

        this.clearScrollFade();
        this.updateActiveStates(index);

        textEls.forEach((el, i) => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text: originalTexts[i],
              chars: 'qwerty1337h@ck3r',
              revealDelay: 0.3,
              speed: 0.4
            }
          });
        });

        if (imageUrl) this.showBackgroundImage(imageUrl);
      });

      item.addEventListener('mouseleave', () => {
        this.debounceTimeout = setTimeout(() => {
          textEls.forEach((el, i) => {
            gsap.killTweensOf(el);
            el.textContent = originalTexts[i];
          });
        }, 50);
      });
    }

    // ── Active state management ──────────────────────────────────────────────
    updateActiveStates(activeIndex) {
      this.currentActiveIndex = activeIndex;
      this.projectList.classList.add('has-active');
      this.projectItems.forEach((item, i) => {
        item.classList.toggle('active', i === activeIndex);
      });
    }

    clearActiveStates() {
      this.currentActiveIndex = -1;
      this.projectList.classList.remove('has-active');
      this.projectItems.forEach(item => {
        item.classList.remove('active');
        const textEls       = item.querySelectorAll('.hover-text');
        const originalTexts = this.originalTexts.get(item);
        textEls.forEach((el, i) => {
          gsap.killTweensOf(el);
          el.textContent = originalTexts[i];
        });
      });
      this.startIdleTimer();
    }

    // ── Scroll fade — items near the top of the list dissolve before the subtitle ──
    updateScrollFade() {
      const scrollTop = this.projectList.scrollTop;
      const fadeZone  = 40; // matches one header height
      this.projectItems.forEach(item => {
        const top = item.offsetTop - scrollTop;
        item.style.opacity = top < fadeZone
          ? String(Math.max(0, top / fadeZone))
          : '';
      });
    }

    clearScrollFade() {
      this.projectItems.forEach(item => { item.style.opacity = ''; });
    }

    // ── Background image ─────────────────────────────────────────────────────
    showBackgroundImage(imageUrl) {
      this.bgImage.style.transition      = 'none';
      this.bgImage.style.transform       = 'translate(-50%, -50%) scale(1.12)';
      this.bgImage.style.backgroundImage = `url("${imageUrl}")`;
      this.bgImage.style.opacity         = '1';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.bgImage.style.transition = 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          this.bgImage.style.transform  = 'translate(-50%, -50%) scale(1.0)';
        });
      });
    }

    hideBackgroundImage() {
      this.bgImage.style.opacity = '0';
    }

    // ── Idle animation ───────────────────────────────────────────────────────
    startIdleTimer() {
      this.stopIdleTimer();
      this.idleTimer = setTimeout(() => {
        if (this.currentActiveIndex === -1) this.startIdleAnimation();
      }, 3000);
    }

    stopIdleTimer() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;
      }
    }

    startIdleAnimation() {
      if (this.idleAnimation) return;

      this.idleAnimation = gsap.timeline({ repeat: -1, repeatDelay: 2 });

      const columns = ['photo-title', 'photo-location', 'photo-camera', 'photo-lens', 'photo-year'].map(cls =>
        [...this.projectItems].map(item => item.querySelector('.' + cls))
      );

      const rowDelay      = 0.05;
      const colStartDelay = 0.25;
      const hideShowGap   = this.projectItems.length * rowDelay * 0.5;

      // Counter number pulse
      this.projectItems.forEach((item, rowIdx) => {
        this.idleAnimation.call(() => item.classList.add('counter-hidden'),    [], rowIdx * rowDelay);
        this.idleAnimation.call(() => item.classList.remove('counter-hidden'), [], hideShowGap + rowIdx * rowDelay);
      });

      // Column wave
      columns.forEach((colEls, colIdx) => {
        const colStart = (colIdx + 1) * colStartDelay;
        colEls.forEach((el, rowIdx) => {
          if (!el) return;
          this.idleAnimation.to(el, { duration: 0.1, opacity: 0.05, ease: 'power2.inOut' }, colStart + rowIdx * rowDelay);
        });
        colEls.forEach((el, rowIdx) => {
          if (!el) return;
          this.idleAnimation.to(el, { duration: 0.1, opacity: 1, ease: 'power2.inOut' }, colStart + hideShowGap + rowIdx * rowDelay);
        });
      });
    }

    stopIdleAnimation() {
      if (this.idleAnimation) {
        this.idleAnimation.kill();
        this.idleAnimation = null;
        gsap.set(document.querySelectorAll('.photo-project-data'), { opacity: 1 });
        this.projectItems.forEach(item => item.classList.remove('counter-hidden'));
      }
    }
  }

  function init() {
    const manager = new PhotoPortfolioManager();
    if (manager.overlay) manager.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
