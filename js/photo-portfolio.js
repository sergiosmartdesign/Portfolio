/**
 * photo-portfolio.js
 * Interactive photography portfolio for the #photo section.
 *
 * Scroll phase 3 (rawProgress 2→3) drives two things:
 *   1. Sequential reveal of intro, cta, and the 4 category buttons.
 *   2. Category buttons expand/collapse their photo lists (accordion, multiple open).
 *
 * Dependencies: gsap.min.js + ScrambleTextPlugin.min.js (loaded before this file)
 */

(function () {
  'use strict';

  class PhotoPortfolioManager {
    constructor() {
      this.overlay     = document.querySelector('.photo-portfolio-overlay');
      this.bgImage     = document.getElementById('photoBgImage');
      this.photoSpacer = document.querySelector('.photo-scroll-spacer');

      if (!this.overlay || !this.bgImage || !this.photoSpacer) return;

      this.categoryBtns  = document.querySelectorAll('.photo-category-btn');
      this.categoryLists = document.querySelectorAll('.photo-project-list');

      this.openCategories = new Set();
      this.originalTexts  = new Map();
      this.inPhase3       = false;
      this.winH           = 0;
      this.spacerDocTop   = 0;

      // Chain-reveal elements: intro → cta → 4 buttons → polaroids title
      // Populated in init() once DOM is confirmed ready
      this.staticEls     = [];
      this.chainActive   = false;
      this.chainTimers   = [];
      this.reverseActive = false;
      this.reverseTimers = [];

      // Cache original text for ScrambleText restore
      document.querySelectorAll('.photo-project-item').forEach(item => {
        const els = item.querySelectorAll('.hover-text');
        this.originalTexts.set(item, Array.from(els).map(el => el.textContent));
      });

      gsap.registerPlugin(ScrambleTextPlugin);
    }

    init() {
      this.winH         = window.innerHeight;
      this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;

      window.addEventListener('resize', () => {
        this.winH         = window.innerHeight;
        this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;
      }, { passive: true });

      // Chain order: section label → left col → instagram col → camera col → 4 buttons → polaroids title
      const pgalleryTitle = document.querySelector('.pgallery-title');
      this.staticEls = [
        this.overlay.querySelector('.photo-section-label'),
        this.overlay.querySelector('.photo-col-text'),
        this.overlay.querySelector('.photo-col-instagram'),
        this.overlay.querySelector('.photo-col-camera'),
        ...this.categoryBtns,
        pgalleryTitle
      ].filter(Boolean);

      // Start all chain elements hidden
      this.staticEls.forEach(el => gsap.set(el, { opacity: 0 }));

      this.preloadImages();
      this._setupCategoryButtons();
      this._setupHoverListeners();

      window.addEventListener('scroll', () => this._updateScroll(), { passive: true });
      this._updateScroll();
    }

    // ── Scroll-driven visibility ─────────────────────────────────────────────
    // Uses a plain boolean so the phase-3 boundary is never missed by a
    // floating-point debounce. Chains fire exactly once per direction change.
    _updateScroll() {
      const spacerTop   = this.spacerDocTop - window.scrollY;
      const rawProgress = 1 - (spacerTop / this.winH);
      const nowInPhase3 = rawProgress > 2;

      if (nowInPhase3 === this.inPhase3) return;
      this.inPhase3 = nowInPhase3;

      if (nowInPhase3) {
        this._cancelReverse();
        this.overlay.style.opacity       = '1';
        this.overlay.style.pointerEvents = 'auto';
        this._triggerChain();
      } else {
        this._cancelChain();
        this._triggerReverseChain();
      }
    }

    // ── Forward chain: reveal intro → cta → buttons → title ────────────────
    _triggerChain() {
      if (this.chainActive) return;
      this.chainActive = true;

      this.staticEls.forEach((el, i) => {
        const t = setTimeout(() => this._revealItem(el, 0), i * 300);
        this.chainTimers.push(t);
      });
    }

    _cancelChain() {
      this.chainTimers.forEach(t => clearTimeout(t));
      this.chainTimers = [];
      this.chainActive = false;
      // Kill any in-flight reveal tweens so elements are in a clean state
      this.staticEls.forEach(el => {
        gsap.killTweensOf(el);
        el.classList.remove('photo-glitch-load');
      });
    }

    // ── Reverse chain: hide title → buttons → cta → intro ───────────────────
    _triggerReverseChain() {
      if (this.reverseActive) return;
      this.reverseActive = true;

      const reversed  = [...this.staticEls].reverse();
      const lastDelay = (reversed.length - 1) * 300;

      reversed.forEach((el, i) => {
        const t = setTimeout(() => {
          // Skip elements never revealed — running _hideItem on opacity:0
          // would cause an unwanted flash from 0 → 0.9 → 0
          if (gsap.getProperty(el, 'opacity') > 0) {
            this._hideItem(el, 0);
          }
        }, i * 300);
        this.reverseTimers.push(t);
      });

      // After last hide animation finishes (~200ms), clean up overlay
      const t = setTimeout(() => this._completeReset(), lastDelay + 200);
      this.reverseTimers.push(t);
    }

    _cancelReverse() {
      this.reverseTimers.forEach(t => clearTimeout(t));
      this.reverseTimers = [];
      this.reverseActive = false;
      // Kill any in-flight hide tweens so elements are in a clean state
      this.staticEls.forEach(el => gsap.killTweensOf(el));
    }

    // ── Called after reverse chain completes ────────────────────────────────
    _completeReset() {
      this.reverseActive = false;
      this.reverseTimers = [];

      this.overlay.style.opacity       = '0';
      this.overlay.style.pointerEvents = 'none';

      this.openCategories.clear();
      this.categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
      this.categoryLists.forEach(list => {
        list.style.display = 'none';
        list.querySelectorAll('.photo-project-item').forEach(item => {
          gsap.killTweensOf(item);
          gsap.set(item, { opacity: 0 });
        });
      });
      this.bgImage.style.opacity = '0';
    }

    // ── Immediate hard reset (e.g. resize, bfcache) ──────────────────────────
    _fullReset() {
      this._cancelChain();
      this._cancelReverse();

      this.overlay.style.opacity       = '0';
      this.overlay.style.pointerEvents = 'none';

      this.openCategories.clear();
      this.categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
      this.categoryLists.forEach(list => {
        list.style.display = 'none';
        list.querySelectorAll('.photo-project-item').forEach(item => {
          gsap.killTweensOf(item);
          gsap.set(item, { opacity: 0 });
          item.classList.remove('photo-glitch-load');
        });
      });
      this.staticEls.forEach(el => {
        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 0 });
        el.classList.remove('photo-glitch-load');
      });
      this.bgImage.style.opacity = '0';
    }

    // ── Category button click handlers ───────────────────────────────────────
    _setupCategoryButtons() {
      this.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const category = btn.dataset.category;
          const list = btn.closest('.photo-accordion-item')
                          .querySelector('.photo-project-list');
          if (!list) return;

          if (this.openCategories.has(category)) {
            this._closeCategory(category, btn, list);
          } else {
            this._openCategory(category, btn, list);
          }
        });
      });
    }

    _openCategory(category, btn, list) {
      this.openCategories.add(category);
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      list.style.display = 'flex';

      const items = list.querySelectorAll('.photo-project-item');
      items.forEach((item, i) => {
        gsap.set(item, { opacity: 0 });
        this._revealItem(item, i);
      });
    }

    _closeCategory(category, btn, list) {
      this.openCategories.delete(category);
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');

      const items     = list.querySelectorAll('.photo-project-item');
      const lastDelay = (items.length - 1) * 0.03 + 0.13;
      items.forEach((item, i) => this._hideItem(item, items.length - 1 - i));

      gsap.delayedCall(lastDelay, () => {
        if (!this.openCategories.has(category)) list.style.display = 'none';
      });
    }

    // Immediate close used when scrolling back hides the button
    _forceCloseCategory(category, btn) {
      if (!this.openCategories.has(category)) return;
      this.openCategories.delete(category);
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      const list = btn.closest('.photo-accordion-item')
                      ?.querySelector('.photo-project-list');
      if (list) {
        list.querySelectorAll('.photo-project-item').forEach(item => {
          gsap.killTweensOf(item);
          gsap.set(item, { opacity: 0 });
        });
        list.style.display = 'none';
      }
    }

    // ── Glitch flash animations ──────────────────────────────────────────────
    _revealItem(item, batchIndex) {
      gsap.killTweensOf(item);
      gsap.to(item, {
        delay: batchIndex * 0.04,
        keyframes: [
          { opacity: 1,    duration: 0.04, ease: 'none' },
          { opacity: 0.15, duration: 0.03, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.35, duration: 0.02, ease: 'none' },
          { opacity: 1,    duration: 0.05, ease: 'none' },
        ]
      });

      // Layer the CSS glitch-in animation in sync with the opacity reveal
      const glitchDelay = Math.round(batchIndex * 40);
      setTimeout(() => {
        item.classList.remove('photo-glitch-load');
        void item.offsetWidth; // restart animation if class was already there
        item.classList.add('photo-glitch-load');
        setTimeout(() => item.classList.remove('photo-glitch-load'), 520);
      }, glitchDelay);
    }

    _hideItem(item, batchIndex) {
      item.classList.remove('photo-glitch-load');
      gsap.killTweensOf(item);
      gsap.to(item, {
        delay: batchIndex * 0.03,
        keyframes: [
          { opacity: 0.35, duration: 0.02, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.15, duration: 0.03, ease: 'none' },
          { opacity: 0,    duration: 0.04, ease: 'none' },
        ]
      });
    }

    // ── Hover interactions ───────────────────────────────────────────────────
    _setupHoverListeners() {
      document.querySelectorAll('.photo-project-item').forEach(item => {
        this._addHoverListeners(item);
      });
    }

    _addHoverListeners(item) {
      const list          = item.closest('.photo-project-list');
      const textEls       = item.querySelectorAll('.hover-text');
      const originalTexts = this.originalTexts.get(item);
      let debounce        = null;

      item.addEventListener('mouseenter', () => {
        if (debounce) clearTimeout(debounce);

        // Clear GSAP inline opacities so CSS has-active rule takes over
        list.querySelectorAll('.photo-project-item').forEach(el => {
          el.style.opacity = '';
        });
        list.classList.add('has-active');
        item.classList.add('active');

        textEls.forEach((el, i) => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text:        originalTexts[i],
              chars:       'qwerty1337h@ck3r',
              revealDelay: 0.3,
              speed:       0.4
            }
          });
        });

        if (item.dataset.image) this.showBackgroundImage(item.dataset.image);
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('active');
        list.classList.remove('has-active');

        list.querySelectorAll('.photo-project-item').forEach(el => {
          el.style.opacity = '1';
        });

        debounce = setTimeout(() => {
          textEls.forEach((el, i) => {
            gsap.killTweensOf(el);
            el.textContent = originalTexts[i];
          });
        }, 50);

        this.hideBackgroundImage();
      });
    }

    // ── Image preload + background ───────────────────────────────────────────
    preloadImages() {
      document.querySelectorAll('.photo-project-item').forEach(item => {
        const url = item.dataset.image;
        if (url) { const img = new Image(); img.src = url; }
      });
    }

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
