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

      // Scroll-driven reveal state
      this.revealedItems   = new Set(); // indices of currently visible rows
      this.allRevealedOnce = false;     // idle timer guard — fires once per full reveal

      // Pre-compute the scroll threshold for each row
      const total = this.projectItems.length;
      this.thresholds = Array.from({ length: total }, (_, i) =>
        REVEAL_START + (i / (total - 1)) * (REVEAL_END - REVEAL_START)
      );

      // Cache original text for ScrambleText restore
      this.projectItems.forEach(item => {
        const els = item.querySelectorAll('.hover-text');
        this.originalTexts.set(item, Array.from(els).map(el => el.textContent));
      });

      gsap.registerPlugin(ScrambleTextPlugin);
    }

    init() {
      this.preloadImages();

      this.projectItems.forEach((item, index) => {
        this.addEventListeners(item, index);
      });

      this.projectList.addEventListener('mouseleave', () => {
        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        this.clearActiveStates();
        this.hideBackgroundImage();
        this.startIdleTimer();
      });

      window.addEventListener('scroll', () => this.updateScroll(), { passive: true });
      this.updateScroll();
    }

    // ── Scroll-driven visibility ─────────────────────────────────────────────
    updateScroll() {
      const spacerTop    = this.photoSpacer.getBoundingClientRect().top;
      const rawProgress  = 1 - (spacerTop / window.innerHeight);
      const newProgress2 = Math.max(0, Math.min(1, rawProgress - 1));

      if (Math.abs(newProgress2 - this.scrollProgress2) < 0.003) return;

      this.scrollProgress2 = newProgress2;

      // Overlay container fades with phase 2
      this.overlay.style.opacity       = newProgress2;
      this.overlay.style.pointerEvents = newProgress2 > 0 ? 'auto' : 'none';

      this.updateRowReveal(newProgress2);
    }

    // ── Per-row scroll-scrub reveal ──────────────────────────────────────────
    updateRowReveal(progress) {
      let allRevealed = true;

      this.projectItems.forEach((item, i) => {
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

      // Once all rows are visible, arm the idle timer (once per full reveal)
      if (allRevealed && !this.allRevealedOnce) {
        this.allRevealedOnce = true;
        this.startIdleTimer();
      }

      // Reset guard so idle timer can re-trigger on the next full reveal
      if (!allRevealed) this.allRevealedOnce = false;
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
        this.stopIdleAnimation();
        this.stopIdleTimer();
        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        if (this.currentActiveIndex === index) return;

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

    // ── Background image ─────────────────────────────────────────────────────
    showBackgroundImage(imageUrl) {
      this.bgImage.style.transition      = 'none';
      this.bgImage.style.transform       = 'translate(-50%, -50%) scale(1.12)';
      this.bgImage.style.backgroundImage = `url(${imageUrl})`;
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

      const columns = ['photo-artist', 'photo-album', 'photo-category', 'photo-label', 'photo-year'].map(cls =>
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
