/**
 * photo-portfolio.js
 * Interactive photography portfolio list for the #photo section.
 * Sits as an overlay above the WebGL volumetric-light background.
 *
 * Dependencies: gsap.min.js + ScrambleTextPlugin.min.js (loaded before this file)
 */

(function () {
  'use strict';

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
      this.revealedCount       = 0;     // how many allItems have been revealed so far
      this.interactionsEnabled = false; // hover active only when section fully fills viewport

      // Photo scroll hint — idle-timer system (mirrors scroll-hint.js)
      this.photoScrollHint        = document.getElementById('photo-scroll-hint');
      this.photoHintActive        = false; // true while list is filling but not yet complete
      this.photoHintVisible       = false;
      this.photoHintIdleTimer     = null;
      this.photoHintAutoHideTimer = null;
      this.mouseOverOverlay       = false; // true while cursor is inside the photo overlay
      this.cursorTooltip          = null;

      // All revealable elements in DOM order: title, section headers, project items
      this.allItems = [...document.querySelectorAll(
        '.photo-portfolio-title, .photo-section-header, .photo-project-item'
      )];

      // Cache original text for ScrambleText restore
      this.projectItems.forEach(item => {
        const els = item.querySelectorAll('.hover-text');
        this.originalTexts.set(item, Array.from(els).map(el => el.textContent));
      });

      gsap.registerPlugin(ScrambleTextPlugin);

      // Start all revealable elements hidden
      this.allItems.forEach(item => gsap.set(item, { opacity: 0 }));
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

      this.projectList.addEventListener('scroll', () => {
        this.updateScrollFade();
        // Inner-list scroll = user browsing already-visible items → show hint soon
        if (this.photoHintActive && !this.photoHintVisible) this._schedulePhotoHint();
      }, { passive: true });

      // Track whether the cursor is inside the photo overlay so the hint
      // fires with a shorter delay while the user is hovering over the section
      this.overlay.addEventListener('mouseenter', () => { this.mouseOverOverlay = true; });
      this.overlay.addEventListener('mouseleave', () => {
        this.mouseOverOverlay = false;
        this._hideScrollTooltip();
      });

      // Cursor-following scroll tooltip
      const tip = document.createElement('div');
      tip.className = 'photo-cursor-tooltip';
      tip.setAttribute('aria-hidden', 'true');
      tip.textContent = '[ · scroll · complete list to see the photos · ]';
      document.body.appendChild(tip);
      this.cursorTooltip = tip;

      this.overlay.addEventListener('mousemove', (e) => {
        if (this.cursorTooltip) {
          this.cursorTooltip.style.left = `${e.clientX + 20}px`;
          this.cursorTooltip.style.top  = `${e.clientY}px`;
        }
      });

      window.addEventListener('scroll', () => this.updateScroll(), { passive: true });

      // Activity listeners for the photo scroll hint idle timer
      ['scroll', 'mousemove', 'touchstart', 'touchmove'].forEach(evt => {
        window.addEventListener(evt, () => this._onPhotoHintActivity(), { passive: true });
      });

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

      // Rows reveal only in phase 3 (after text has settled at top)
      this.updateRowReveal(newProgress3);
    }

    // ── Row reveal — scroll-driven line-by-line glitch flash ─────────────────
    updateRowReveal(progress) {
      const total = this.allItems.length;

      // Full reset when scrolled out of phase 3
      if (progress <= 0) {
        if (this.revealedCount > 0) {
          this.overlay.style.opacity       = '0';
          this.overlay.style.pointerEvents = 'none';
          this.allItems.forEach(item => {
            gsap.killTweensOf(item);
            gsap.set(item, { opacity: 0 });
          });
          this.revealedCount       = 0;
          this.interactionsEnabled = false;
          this.stopIdleAnimation();
          this.stopIdleTimer();
          if (this.currentActiveIndex !== -1) {
            this.clearActiveStates();
            this.hideBackgroundImage();
          }
          this.photoHintActive  = false;
          this.mouseOverOverlay = false;
          this._hidePhotoHint();
          this._hideScrollTooltip();
        }
        return;
      }

      // How many items should be visible at this scroll position
      const targetCount = Math.ceil(progress * total);

      if (targetCount > this.revealedCount) {
        // Snap overlay on first item and arm the hint idle timer
        if (this.revealedCount === 0) {
          this.overlay.style.opacity       = '1';
          this.overlay.style.pointerEvents = 'auto';
          this.photoHintActive = true;
          this._schedulePhotoHint();
        }
        // Reveal each newly crossed item with a glitch flash,
        // staggered within the incoming batch
        for (let i = this.revealedCount; i < targetCount; i++) {
          this._revealItem(i, i - this.revealedCount);
        }
        this.revealedCount = targetCount;

        // Enable hover interactions only once all items are visible
        if (this.revealedCount >= total && !this.interactionsEnabled) {
          this.interactionsEnabled = true;
          this.photoHintActive = false;
          this._hidePhotoHint();
          this._hideScrollTooltip();
          this.startIdleTimer();
        }
      } else if (targetCount < this.revealedCount) {
        // Scrolling backward: hide items from the last revealed back to targetCount
        const wasFullyRevealed = (this.revealedCount >= total);

        for (let i = this.revealedCount - 1; i >= targetCount; i--) {
          this._hideItem(i, this.revealedCount - 1 - i);
        }
        this.revealedCount = targetCount;

        // Disable interactions if we were fully revealed and now are not
        if (wasFullyRevealed && this.interactionsEnabled) {
          this.interactionsEnabled = false;
          this.stopIdleAnimation();
          if (this.currentActiveIndex !== -1) {
            this.clearActiveStates();
            this.hideBackgroundImage();
          }
          this.stopIdleTimer();
        }
      }
    }

    // ── Photo scroll hint — idle-timer system ────────────────────────────────
    _schedulePhotoHint() {
      clearTimeout(this.photoHintIdleTimer);
      if (this.photoHintActive) {
        // Shorter delay when the cursor is already over the photo section
        const delay = this.mouseOverOverlay ? 800 : 3000;
        this.photoHintIdleTimer = setTimeout(() => this._showPhotoHint(), delay);
      }
    }

    _showPhotoHint() {
      if (!this.photoHintActive || this.photoHintVisible || !this.photoScrollHint) return;
      this.photoHintVisible = true;
      this.photoScrollHint.removeAttribute('aria-hidden');
      this.photoScrollHint.classList.add('visible');
      clearTimeout(this.photoHintAutoHideTimer);
      this.photoHintAutoHideTimer = setTimeout(() => {
        this._hidePhotoHint();
        this._schedulePhotoHint();
      }, 3000);
    }

    _hidePhotoHint() {
      if (!this.photoHintVisible || !this.photoScrollHint) return;
      this.photoHintVisible = false;
      clearTimeout(this.photoHintAutoHideTimer);
      this.photoScrollHint.setAttribute('aria-hidden', 'true');
      this.photoScrollHint.classList.remove('visible');
    }

    _onPhotoHintActivity() {
      if (!this.photoHintActive) return;
      if (this.photoHintVisible) this._hidePhotoHint();
      this._schedulePhotoHint();
    }

    // ── Single-item glitch flash ──────────────────────────────────────────────
    _revealItem(i, batchIndex) {
      const item = this.allItems[i];
      gsap.killTweensOf(item);
      gsap.set(item, { opacity: 0 });
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
    }

    // ── Single-item glitch hide (reverse of _revealItem) ─────────────────────
    _hideItem(i, batchIndex) {
      const item = this.allItems[i];
      gsap.killTweensOf(item);
      gsap.to(item, {
        delay: batchIndex * 0.04,
        keyframes: [
          { opacity: 0.35, duration: 0.02, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.15, duration: 0.03, ease: 'none' },
          { opacity: 0,    duration: 0.04, ease: 'none' },
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
        if (!this.interactionsEnabled) {
          this._showScrollTooltip();
          return;
        }
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
        this._hideScrollTooltip();
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
        // Restore inline opacity so items stay visible once has-active CSS is removed.
        // Without this, items fall back to the CSS base opacity: 0 and become invisible.
        if (this.interactionsEnabled) item.style.opacity = '1';
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
        if (top < fadeZone) {
          item.style.opacity = String(Math.max(0, top / fadeZone));
        } else if (this.interactionsEnabled) {
          // Explicitly restore to 1 — setting '' would expose CSS opacity: 0
          // and make items invisible whenever has-active is not present.
          item.style.opacity = '1';
        }
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

    _showScrollTooltip() {
      if (this.cursorTooltip) this.cursorTooltip.classList.add('visible');
    }

    _hideScrollTooltip() {
      if (this.cursorTooltip) this.cursorTooltip.classList.remove('visible');
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
