/**
 * photo-portfolio.js — orchestrator for the #photo section.
 *
 * Scroll phase 3 (rawProgress 2→3) drives two things:
 *   1. Sequential reveal of intro, cta, and the 4 category buttons.
 *   2. Category buttons expand/collapse their photo lists (accordion, multiple open).
 *
 * Subsystems live in separate files, exposed via window.Photo:
 *   • GhostStream     (photo-ghost-stream.js)  — horizontal card stream + lightbox
 *   • PolaroidReveal  (photo-polaroid.js)       — canvas scratch-off + click
 *   • FlyCaption      (photo-fly-caption.js)    — caption clone that flies to viewport bottom
 *
 * Dependencies: gsap.min.js + ScrambleTextPlugin.min.js (loaded before this file).
 */

(function () {
  'use strict';

  class PhotoPortfolioManager {
    constructor() {
      this.overlay       = document.querySelector('.photo-portfolio-overlay');
      this.contentScroll = document.querySelector('.photo-content-scroll');
      this.bgImage       = document.getElementById('photoBgImage');
      this.photoSpacer   = document.querySelector('.photo-scroll-spacer');
      this.photoSection  = document.getElementById('photo');

      if (!this.overlay || !this.bgImage || !this.photoSpacer) return;

      this.categoryBtns  = document.querySelectorAll('.photo-category-btn');
      this.categoryLists = document.querySelectorAll('.photo-project-list');

      this.openCategories = new Set();
      this.originalTexts  = new Map();
      this.inPhase3       = false;
      this.winH           = 0;
      this.spacerDocTop   = 0;

      // Left-edge bar element — animated separately from staticEls (slide-in vs fade)
      this._barEl    = null;

      // Chain-reveal elements: intro → cta → 4 buttons → polaroids title
      // Populated in init() once DOM is confirmed ready
      this.staticEls     = [];
      this.chainActive   = false;
      this.chainTimers   = [];
      this.reverseActive = false;
      this.reverseTimers = [];

      // Intro animation guard — hover is disabled while the sequential intro plays
      this.introAnimating = false;

      this._titlePalette = ['#005F73','#0A9396','#94D2BD','#E9D8A6','#EE9B00','#CA6702','#BB3E03','#AE2012','#9B2226'];

      // Electric border: count of in-flight animations (open + close + chain).
      // RAF only runs while _borderCount > 0 — zero CPU when idle.
      this.accordion          = document.querySelector('.photo-accordion');
      this._borderCount       = 0;
      this._borderRaf         = null;
      this._borderFrameTick   = 0;
      this._borderTurbulence  = null; // set in init()
      this._borderPaused      = false;

      // Photo bg electric border
      this._photoBorderTurbulence  = null;
      this._photoBorderActive      = false;
      this._photoBorderRaf         = null;
      this._photoBorderFrame       = 0;
      this._photoBorderSettleTimer = null;
      this._photoBorderStopTimer   = null;
      this._photoBorderPaused      = false;

      this._previewVisible = false;

      // Subsystem instances — created in init()
      this.stream  = null;
      this.polaroid = null;
      this.caption  = null;

      // Cache original text for ScrambleText restore
      document.querySelectorAll('.photo-project-item').forEach(item => {
        const els = item.querySelectorAll('.hover-text');
        this.originalTexts.set(item, Array.from(els).map(el => el.textContent));
      });

      // Refresh cache when language switches so hover scramble uses current text
      document.addEventListener('languagechanged', () => this._refreshOriginalTexts());

      gsap.registerPlugin(ScrambleTextPlugin);
    }

    init() {
      this.winH         = window.innerHeight;
      this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;
      this._borderTurbulence      = document.getElementById('accordion-electric-turbulence');
      this._photoBorderTurbulence = document.getElementById('photo-bg-turbulence');

      // Create subsystems
      this.stream  = new window.Photo.GhostStream(
        document.querySelector('.photo-ghost-stream'),
        Array.from(document.querySelectorAll('.photo-ghost-card'))
      );
      this.stream.init();

      this.polaroid = new window.Photo.PolaroidReveal(this);
      this.polaroid.setupClick();

      this.caption = new window.Photo.FlyCaption(this.originalTexts);

      // Chain order: section label → intro text → instagram → cta → camera col → 4 buttons → polaroids label → pgallery title → desc → scroll hint
      const pgalleryTitle    = document.querySelector('.pgallery-title');
      const pgalleryDesc     = document.querySelector('.pgallery-desc');
      const pgalleryHint     = document.querySelector('.pgallery-hint');
      const polLabel         = document.querySelector('.photo-polaroids-label');
      const polDesc          = document.querySelector('.photo-polaroids-desc');
      const polCamera        = document.querySelector('.photo-polaroids-camera');
      const pgalleryInfo     = document.querySelector('.pgallery-info');
      const polBar1          = document.querySelector('.photo-col-bar1');
      this.staticEls = [
        this.overlay.querySelector('.photo-section-label'),
        this.overlay.querySelector('.photo-intro'),
        this.overlay.querySelector('.photo-col-instagram'),
        this.overlay.querySelector('.photo-cta'),
        this.overlay.querySelector('.photo-col-camera'),
        ...this.categoryBtns,
        polBar1,
        polLabel,
        polDesc,
        pgalleryInfo,
        polCamera,
        pgalleryTitle,
        pgalleryDesc,
        pgalleryHint,
      ].filter(Boolean);

      // Set random palette colour on label reveal and on hover
      if (polLabel) {
        polLabel.addEventListener('mouseenter', () => {
          polLabel.style.color = this._titlePalette[Math.floor(Math.random() * this._titlePalette.length)];
        });
      }

      // Start all chain elements hidden
      this.staticEls.forEach(el => gsap.set(el, { opacity: 0 }));

      // Bar: query and park off-screen to the left
      this._barEl = document.querySelector('.photo-section-bar-img');
      if (this._barEl) gsap.set(this._barEl, { opacity: 0, x: -40 });

      this.preloadImages();
      this._setupCategoryButtons();
      this._setupHoverListeners();
      this._setupTitleColorCycle();

      // Debounced resize — getBoundingClientRect forces layout; winH is cheap to update eagerly
      let _resizeTimer = null;
      window.addEventListener('resize', () => {
        this.winH = window.innerHeight;
        this.stream.resize();
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(() => {
          this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;
        }, 100);
      }, { passive: true });

      // Pause all RAF loops when the tab is hidden; resume on return
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this._pauseAllRafs();
        else                 this._resumeAllRafs();
      });

      window.addEventListener('scroll', () => this._updateScroll(), { passive: true });
      this._updateScroll();
    }

    // ── Scroll-driven visibility ─────────────────────────────────────────────
    // Uses a plain boolean so the phase-3 boundary is never missed by a
    // floating-point debounce. Chains fire exactly once per direction change.
    _updateScroll() {
      const spacerTop   = this.spacerDocTop - window.scrollY;
      const rawProgress = 1 - (spacerTop / this.winH);

      // Stream state machine — runs every tick, before the phase-change guard
      this.stream.tick(rawProgress);

      const nowInPhase3 = rawProgress > 2;
      if (nowInPhase3 === this.inPhase3) return;
      this.inPhase3 = nowInPhase3;

      if (nowInPhase3) {
        this._cancelReverse();
        this.overlay.style.opacity       = '1';
        this.overlay.style.pointerEvents = 'auto';
        document.dispatchEvent(new CustomEvent('photoPhase3Active'));
        this._triggerChain();
      } else {
        this._cancelChain();
        this._triggerReverseChain();
      }
    }

    // ── Forward chain: intro → sequential category reveal → bounce-close → tail ──
    _randomTitleColor() {
      const color = this._titlePalette[Math.floor(Math.random() * this._titlePalette.length)];
      document.querySelectorAll('.pgallery-title').forEach(el => {
        el.style.color = color;
      });
    }

    _triggerChain() {
      if (this.chainActive) return;
      this.chainActive = true;
      this.introAnimating = true;
      this._borderStart();
      this.polaroid.init();
      this._randomTitleColor();
      const polLabel = document.querySelector('.photo-polaroids-label');
      if (polLabel) polLabel.style.color = this._titlePalette[Math.floor(Math.random() * this._titlePalette.length)];

      const categoryBtnArray = Array.from(this.categoryBtns);
      const btnSet = new Set(categoryBtnArray);

      // Split staticEls: introEls before first btn, tailEls after last btn
      const firstBtnIdx = this.staticEls.findIndex(el => btnSet.has(el));
      const lastBtnIdx  = this.staticEls.reduce((acc, el, i) => (btnSet.has(el) ? i : acc), -1);
      const introEls    = firstBtnIdx >= 0 ? this.staticEls.slice(0, firstBtnIdx) : [];
      const tailEls     = lastBtnIdx  >= 0 ? this.staticEls.slice(lastBtnIdx + 1) : [];

      const INTRO_STEP = 300;  // ms between intro elements (label → col-text → ig → camera)
      const BTN_GAP    = 150;  // ms from button reveal to first item
      const ITEM_STEP  =  50;  // ms between items within a category
      const CAT_GAP    = 200;  // ms pause between categories
      const REV_STEP   =  25;  // ms between items on close (faster)
      const REV_GAP    =  80;  // ms between category closes
      const TAIL_STEP  = 300;  // ms between tail elements

      // 0. Bar slides in from the left — fires immediately, before any text element
      if (this._barEl) {
        gsap.fromTo(this._barEl,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
        );
      }

      // 1. Reveal intro elements (section label, left col, instagram, camera col)
      introEls.forEach((el, i) => {
        const t = setTimeout(() => this._revealItem(el, 0), i * INTRO_STEP);
        this.chainTimers.push(t);
      });

      let cursor = introEls.length * INTRO_STEP + 250;

      // 2. Sequential category reveal: button → items one by one
      categoryBtnArray.forEach(btn => {
        const accordionItem = btn.closest('.photo-accordion-item');
        const list  = accordionItem?.querySelector('.photo-project-list');
        const items = list ? Array.from(list.querySelectorAll('.photo-project-item')) : [];
        const cat   = btn.dataset.category;

        const btnDelay = cursor;
        const t0 = setTimeout(() => {
          this.openCategories.add(cat);
          btn.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          if (list) list.style.display = 'flex';
          this._revealItem(btn, 0);

          // After layout update, scroll the content container to keep the last item visible
          if (items.length) {
            requestAnimationFrame(() => {
              const cs       = this.contentScroll;
              const lastItem = items[items.length - 1];
              const csRect   = cs.getBoundingClientRect();
              const itemRect = lastItem.getBoundingClientRect();
              const needed   = cs.scrollTop + (itemRect.bottom + 24 - csRect.bottom);
              if (needed > cs.scrollTop) {
                gsap.to(cs, {
                  scrollTop: needed,
                  duration:  (BTN_GAP + items.length * ITEM_STEP) / 1000,
                  ease:      'power1.out',
                  overwrite: 'auto',
                });
              }
            });
          }
        }, btnDelay);
        this.chainTimers.push(t0);

        cursor += BTN_GAP;

        items.forEach((item, idx) => {
          const t = setTimeout(() => this._revealItem(item, 0), cursor + idx * ITEM_STEP);
          this.chainTimers.push(t);
        });

        cursor += items.length * ITEM_STEP + CAT_GAP;
      });

      // Pre-compute total revert duration so we can animate the scroll-back in one pass
      const totalRevertMs = categoryBtnArray.reduce((sum, btn) => {
        const list = btn.closest('.photo-accordion-item')?.querySelector('.photo-project-list');
        const n    = list ? list.querySelectorAll('.photo-project-item').length : 0;
        return sum + n * REV_STEP + 60 + REV_GAP;
      }, 0);

      // Schedule scroll-back to 0 starting the moment the revert begins
      const revertCursorStart = cursor;
      const tRevertScroll = setTimeout(() => {
        gsap.to(this.contentScroll, {
          scrollTop: 0,
          duration:  totalRevertMs / 1000,
          ease:      'power2.inOut',
          overwrite: 'auto',
        });
      }, revertCursorStart);
      this.chainTimers.push(tRevertScroll);

      // 3. Bounce-close: fold each category back in reverse order (faster)
      [...categoryBtnArray].reverse().forEach(btn => {
        const accordionItem = btn.closest('.photo-accordion-item');
        const list  = accordionItem?.querySelector('.photo-project-list');
        const items = list
          ? Array.from(list.querySelectorAll('.photo-project-item')).reverse()
          : [];
        const cat = btn.dataset.category;

        items.forEach((item, idx) => {
          const t = setTimeout(() => this._bounceHideItem(item), cursor + idx * REV_STEP);
          this.chainTimers.push(t);
        });

        const closeAt = cursor + items.length * REV_STEP + 60;
        const tc = setTimeout(() => {
          this.openCategories.delete(cat);
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          if (list) list.style.display = 'none';
          gsap.killTweensOf(btn);
          gsap.fromTo(btn, { y: -5 }, { y: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' });
        }, closeAt);
        this.chainTimers.push(tc);

        cursor = closeAt + REV_GAP;
      });

      // 4. Tail elements: polaroids label → desc → camera → pgallery title → desc → hint
      const tailStart = cursor;
      tailEls.forEach((el, i) => {
        const t = setTimeout(() => this._revealItem(el, 0), tailStart + i * TAIL_STEP);
        this.chainTimers.push(t);
      });
      cursor = tailStart + tailEls.length * TAIL_STEP;

      // Signal the ghost stream to start once the camera slide-in finishes.
      // polCamera is inside tailEls — find its index so the delay is always exact.
      const polCameraEl     = document.querySelector('.photo-polaroids-camera');
      const cameraInTailIdx = tailEls.indexOf(polCameraEl);
      const cameraRevealAt  = tailStart + (cameraInTailIdx >= 0 ? cameraInTailIdx : 2) * TAIL_STEP;
      const tStreamReady    = setTimeout(() => {
        this.stream.canPlay = true;
        this.stream.startInfoAnim();
      }, cameraRevealAt + 720);
      this.chainTimers.push(tStreamReady);

      // Lift the hover guard once the full intro sequence has settled
      const tIntroEnd = setTimeout(() => { this.introAnimating = false; this._borderDone(); }, cursor + 150);
      this.chainTimers.push(tIntroEnd);

      // 5. Secondary effects

      // Marker-draw on col-text highlights (fires 700 ms after chain start — col-text is
      // already visible by then since it appears at 1×INTRO_STEP = 300 ms)
      document.querySelectorAll('.photo-ai-highlight').forEach((hl, i) => {
        const t = setTimeout(() => {
          hl.classList.remove('photo-ai-highlight--animate');
          void hl.offsetWidth;
          hl.classList.add('photo-ai-highlight--animate');
          this._scrambleText(hl);
        }, 700 + i * 300);
        this.chainTimers.push(t);
      });

      // pgallery hint marker fires shortly after the hint element is visible (last tailEl)
      const pgalleryHintEl = document.querySelector('.pgallery-hint');
      if (pgalleryHintEl) {
        const hintDelay = tailStart + (tailEls.length - 1) * TAIL_STEP + 150;
        const t = setTimeout(() => {
          pgalleryHintEl.classList.remove('pgallery-hint--animate');
          void pgalleryHintEl.offsetWidth;
          pgalleryHintEl.classList.add('pgallery-hint--animate');
        }, hintDelay);
        this.chainTimers.push(t);
      }

      // Polaroid hint fires right after the camera column appears
      const hint = document.querySelector('.photo-polaroid-hint');
      if (hint) {
        const cameraEl  = this.overlay.querySelector('.photo-col-camera');
        const cameraIdx = introEls.indexOf(cameraEl);
        const hintDelay = (cameraIdx >= 0 ? cameraIdx : 4) * INTRO_STEP + 300;
        const t = setTimeout(() => {
          hint.classList.remove('reveal');
          void hint.offsetWidth;
          hint.classList.add('reveal');
        }, hintDelay);
        this.chainTimers.push(t);
      }
    }

    _cancelChain() {
      this.caption.clear();
      this.chainTimers.forEach(t => clearTimeout(t));
      this.chainTimers = [];
      this.chainActive = false;
      this.introAnimating = false;
      this._borderCount = 0;
      if (this._borderRaf) { cancelAnimationFrame(this._borderRaf); this._borderRaf = null; }
      if (this.accordion) this.accordion.classList.remove('accordion-animating');
      this.stream.deactivate();

      // Kill tweens and reset transforms on all chain elements
      this.staticEls.forEach(el => {
        gsap.killTweensOf(el);
        gsap.set(el, { y: 0 });
        el.classList.remove('photo-glitch-load');
        el.classList.remove('photo-camera-reveal');
        el.classList.remove('glitch-ready');
      });

      if (this._barEl) {
        gsap.killTweensOf(this._barEl);
        gsap.set(this._barEl, { opacity: 0, x: -40 });
      }

      // Close any categories opened during the sequential intro
      this.openCategories.clear();
      this.categoryBtns.forEach(btn => {
        gsap.killTweensOf(btn);
        gsap.set(btn, { y: 0 });
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
      this.categoryLists.forEach(list => {
        list.style.display = 'none';
        list.querySelectorAll('.photo-project-item').forEach(item => {
          gsap.killTweensOf(item);
          gsap.set(item, { opacity: 0, y: 0 });
        });
      });

      document.querySelectorAll('.photo-ai-highlight').forEach(hl => hl.classList.remove('photo-ai-highlight--animate'));
      document.querySelector('.pgallery-hint')?.classList.remove('pgallery-hint--animate');
      document.querySelector('.photo-polaroid-hint')?.classList.remove('reveal');
      // Stop any in-flight scroll animation and reset position
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
    }

    // ── Reverse chain: hide title → buttons → cta → intro ───────────────────
    _triggerReverseChain() {
      if (this.reverseActive) return;
      this.reverseActive = true;

      // Scroll content back to top as elements hide
      if (this.contentScroll) {
        gsap.to(this.contentScroll, {
          scrollTop: 0,
          duration:  0.6,
          ease:      'power2.out',
          overwrite: 'auto',
        });
      }

      // Bar slides back out to the left as elements hide
      if (this._barEl) {
        gsap.to(this._barEl, { opacity: 0, x: -40, duration: 0.5, ease: 'power2.in' });
      }

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
      // Kill any in-flight hide tweens and scroll animation
      this.staticEls.forEach(el => gsap.killTweensOf(el));
      if (this.contentScroll) gsap.killTweensOf(this.contentScroll);
    }

    // ── Called after reverse chain completes ────────────────────────────────
    _completeReset() {
      this.caption.clear();
      this.reverseActive = false;
      this.reverseTimers = [];

      this.overlay.style.opacity       = '0';
      this.overlay.style.pointerEvents = 'none';

      if (this._barEl) {
        gsap.killTweensOf(this._barEl);
        gsap.set(this._barEl, { opacity: 0, x: -40 });
      }

      this.openCategories.clear();
      this.categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
      this.categoryLists.forEach(list => {
        list.style.display = 'none';
        list.querySelectorAll('.photo-project-item').forEach(item => {
          gsap.killTweensOf(item);
          gsap.set(item, { opacity: 0, y: 0 });
        });
      });
      this._previewVisible       = false;
      this.bgImage.style.opacity = '0';
      this._bgElecOff();
      document.querySelectorAll('.photo-ai-highlight').forEach(hl => hl.classList.remove('photo-ai-highlight--animate'));
      document.querySelector('.pgallery-hint')?.classList.remove('pgallery-hint--animate');
      document.querySelector('.photo-polaroid-hint')?.classList.remove('reveal');
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
      this.polaroid.reset();
      this.stream.deactivate();
    }

    // ── Immediate hard reset (e.g. resize, bfcache) ──────────────────────────
    _fullReset() {
      this.caption.clear();
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
          gsap.set(item, { opacity: 0, y: 0 });
          item.classList.remove('photo-glitch-load');
        });
      });
      this.staticEls.forEach(el => {
        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 0, y: 0 });
        el.classList.remove('photo-glitch-load');
        el.classList.remove('glitch-ready');
      });
      this._previewVisible       = false;
      this.bgImage.style.opacity = '0';
      this._bgElecOff();
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
      this.polaroid.reset();
    }

    // ── RAF visibility pause / resume ────────────────────────────────────────
    _pauseAllRafs() {
      this.stream.pauseRaf();
      if (this._borderRaf && this._borderCount > 0) {
        cancelAnimationFrame(this._borderRaf);
        this._borderRaf    = null;
        this._borderPaused = true;
      }
      if (this._photoBorderRaf && this._photoBorderActive) {
        cancelAnimationFrame(this._photoBorderRaf);
        this._photoBorderRaf    = null;
        this._photoBorderPaused = true;
      }
    }

    _resumeAllRafs() {
      this.stream.resumeRaf();
      if (this._borderPaused && this._borderCount > 0) {
        this._borderPaused    = false;
        this._borderFrameTick = 0;
        this._borderRaf = requestAnimationFrame(() => this._borderAnimTick());
      }
      if (this._photoBorderPaused && this._photoBorderActive) {
        this._photoBorderPaused = false;
        this._photoBorderRaf = requestAnimationFrame(() => this._photoBorderTick());
      }
    }

    // ── Electric border helpers ──────────────────────────────────────────────
    // RAF loop: cycles turbulence seed every 2 frames (~30fps effective) to
    // create the electric flicker. Starts only when something is animating,
    // stops the moment count returns to zero — zero CPU at idle.
    _borderAnimTick() {
      if (this._borderCount <= 0) { this._borderRaf = null; return; }
      this._borderFrameTick++;
      if (this._borderFrameTick % 2 === 0 && this._borderTurbulence) {
        this._borderTurbulence.setAttribute('seed', (Math.random() * 500 | 0) + 1);
      }
      this._borderRaf = requestAnimationFrame(() => this._borderAnimTick());
    }

    _borderStart() {
      this._borderCount++;
      if (this._borderCount === 1 && this.accordion) {
        this.accordion.classList.add('accordion-animating');
        this._borderFrameTick = 0;
        this._borderRaf = requestAnimationFrame(() => this._borderAnimTick());
      }
    }

    _borderDone() {
      this._borderCount = Math.max(0, this._borderCount - 1);
      if (this._borderCount === 0 && this.accordion) {
        this.accordion.classList.remove('accordion-animating');
        // _borderAnimTick stops itself on next frame when count === 0
      }
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
      this._borderStart();
      this.openCategories.add(category);
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      list.style.display = 'flex';

      const items = list.querySelectorAll('.photo-project-item');
      items.forEach((item, i) => {
        gsap.set(item, { opacity: 0 });
        this._revealItem(item, i);
      });
      gsap.delayedCall(Math.max(0.1, (items.length - 1) * 0.04 + 0.33), () => this._borderDone());
    }

    _closeCategory(category, btn, list) {
      this._borderStart();
      this.openCategories.delete(category);
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');

      const items     = list.querySelectorAll('.photo-project-item');
      const lastDelay = (items.length - 1) * 0.03 + 0.13;
      items.forEach((item, i) => this._hideItem(item, items.length - 1 - i));

      gsap.delayedCall(lastDelay, () => {
        if (!this.openCategories.has(category)) list.style.display = 'none';
        this._borderDone();
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
          gsap.set(item, { opacity: 0, y: 0 });
        });
        list.style.display = 'none';
      }
    }

    // ── Glitch flash animations ──────────────────────────────────────────────
    _revealItem(item, batchIndex) {
      if (item.classList.contains('photo-polaroids-camera')) {
        item.classList.remove('photo-camera-reveal');
        void item.offsetWidth;
        item.classList.add('photo-camera-reveal');
        return;
      }

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

      // Fire per-character glitch-switch for Splitting.js elements (e.g. pgallery-desc)
      if (item.hasAttribute('data-splitting')) {
        setTimeout(() => {
          item.classList.remove('glitch-ready');
          void item.offsetWidth;
          item.classList.add('glitch-ready');
        }, glitchDelay);
      }
    }

    _hideItem(item, batchIndex) {
      item.classList.remove('photo-glitch-load');
      item.classList.remove('glitch-ready');
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

    // Used during the intro revert: faster close with a downward spring
    _bounceHideItem(item) {
      item.classList.remove('photo-glitch-load');
      item.classList.remove('glitch-ready');
      gsap.killTweensOf(item);
      gsap.to(item, {
        y:        10,
        opacity:  0,
        duration: 0.18,
        ease:     'back.in(1.5)',
        onComplete: () => gsap.set(item, { y: 0 }),
      });
    }

    // ── Hover interactions ───────────────────────────────────────────────────
    _refreshOriginalTexts() {
      document.querySelectorAll('.photo-project-item').forEach(item => {
        const els = item.querySelectorAll('.hover-text');
        this.originalTexts.set(item, Array.from(els).map(el => el.textContent));
      });

      // Re-translate static prose elements that sit outside the hover/highlight systems
      const tm = App.LanguageManager;
      if (tm) {
        [
          ['.photo-polaroids-desc',  'photo.ui.polaroidsDesc'],
          ['.photo-polaroids-label', 'photo.ui.polaroids'],
        ].forEach(([sel, key]) => {
          const el  = document.querySelector(sel);
          const val = tm.translate(key);
          if (el && val !== undefined) el.textContent = val;
        });
      }

      // If the section is visible, re-trigger highlights on the new innerHTML span
      if (this.inPhase3) {
        document.querySelectorAll('.photo-ai-highlight').forEach(hl => {
          hl.classList.remove('photo-ai-highlight--animate');
          void hl.offsetWidth;
          hl.classList.add('photo-ai-highlight--animate');
          this._scrambleText(hl);
        });
      }
    }

    _setupHoverListeners() {
      document.querySelectorAll('.photo-project-item').forEach(item => {
        this._addHoverListeners(item);
      });
      if (this.overlay) {
        this.overlay.addEventListener('mousemove', e => this._movePreview(e), { passive: true });
      }
    }

    _addHoverListeners(item) {
      const list          = item.closest('.photo-project-list');
      const textEls       = item.querySelectorAll('.hover-text');
      const originalTexts = this.originalTexts.get(item);
      let debounce        = null;

      item.addEventListener('mouseenter', () => {
        if (this.introAnimating) return;  // hover disabled during intro animation
        if (debounce) clearTimeout(debounce);

        // Clear GSAP inline opacities so CSS has-active rule takes over
        list.querySelectorAll('.photo-project-item').forEach(el => {
          el.style.opacity = '';
        });
        list.classList.add('has-active');
        item.classList.add('active');
        item.style.opacity = '0.5';
        this.caption.fly(item);

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
        this.caption.return();
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
      this._previewVisible               = true;
      this.bgImage.style.backgroundImage = `url("${imageUrl}")`;
      this.bgImage.style.opacity         = '1';
      this._bgElecOn();
    }

    hideBackgroundImage() {
      this._previewVisible       = false;
      this.bgImage.style.opacity = '0';
      this._bgElecOff();
    }

    _movePreview(e) {
      if (!this._previewVisible) return;
      const W  = this.bgImage.offsetWidth;
      const H  = this.bgImage.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const OFFSET_X = 24;

      let x = e.clientX + OFFSET_X;
      let y = e.clientY - Math.round(H / 2);

      if (x + W > vw - 8) x = e.clientX - W - OFFSET_X;
      if (y < 8)           y = 8;
      if (y + H > vh - 8)  y = vh - H - 8;

      this.bgImage.style.left = x + 'px';
      this.bgImage.style.top  = y + 'px';
    }

    // ── Polaroids title: pick a new random palette colour on each hover ────────
    _setupTitleColorCycle() {
      document.querySelectorAll('.pgallery-title').forEach(el => {
        el.addEventListener('mouseenter', () => this._randomTitleColor());
      });
    }

    // ── Photo bg electric border ─────────────────────────────────────────────

    _bgElecOn() {
      // Clear any in-flight settle / stop timers so repeated hovers restart cleanly
      if (this._photoBorderSettleTimer) { clearTimeout(this._photoBorderSettleTimer); this._photoBorderSettleTimer = null; }
      if (this._photoBorderStopTimer)   { clearTimeout(this._photoBorderStopTimer);   this._photoBorderStopTimer   = null; }

      this.bgImage.classList.remove('photo-bg-elec-active');
      void this.bgImage.offsetWidth;
      this.bgImage.classList.add('photo-bg-elec-active');

      if (!this._photoBorderActive) {
        this._photoBorderActive = true;
        this._photoBorderFrame  = 0;
        this._photoBorderRaf    = requestAnimationFrame(() => this._photoBorderTick());
      }

      const SETTLE_MS = 620;
      const FADE_MS   = 400;
      this._photoBorderSettleTimer = setTimeout(() => {
        this._photoBorderSettleTimer = null;
        this.bgImage.classList.remove('photo-bg-elec-active');
        this._photoBorderStopTimer = setTimeout(() => {
          this._photoBorderStopTimer  = null;
          this._photoBorderActive     = false;
        }, FADE_MS);
      }, SETTLE_MS);
    }

    _bgElecOff() {
      if (this._photoBorderSettleTimer) { clearTimeout(this._photoBorderSettleTimer); this._photoBorderSettleTimer = null; }
      if (this._photoBorderStopTimer)   { clearTimeout(this._photoBorderStopTimer);   this._photoBorderStopTimer   = null; }
      this.bgImage.classList.remove('photo-bg-elec-active');
      this._photoBorderActive = false;
    }

    _photoBorderTick() {
      if (!this._photoBorderActive) { this._photoBorderRaf = null; return; }
      this._photoBorderFrame++;
      if (this._photoBorderFrame % 3 === 0 && this._photoBorderTurbulence) {
        this._photoBorderTurbulence.setAttribute('seed', (Math.random() * 500 | 0) + 1);
      }
      this._photoBorderRaf = requestAnimationFrame(() => this._photoBorderTick());
    }

    // ── Text scramble — same glitch pattern as art-direction discipline list ──
    _scrambleText(el) {
      const CHARS     = '!<>-_\\/[]{}—=+*^?#∆◊§øΩ†‡';
      const FRAME_MS  = 38;
      const finalText = el.textContent;
      if (!finalText.trim()) return;
      const chars      = [...finalText];
      const n          = chars.length;
      const resolveAt  = i => i * FRAME_MS;
      const maxResolve = resolveAt(n - 1);
      let elapsed = 0;
      const tick = () => {
        let out = '';
        for (let i = 0; i < n; i++) {
          out += elapsed >= resolveAt(i)
            ? chars[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)];
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

}());
