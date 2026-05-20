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
      this._barEl        = null;

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

      // Polaroid reveal state
      this._polaroidMoveHandler = null;

      // Ghost stream
      this._stream              = null;
      this._streamCards         = [];
      this._streamRotations     = [];
      this._cardHidden          = null;     // per-card boolean cache; true = last write was hidden
      this._streamPhase         = 'idle';   // 'idle' | 'active'
      this._masterT             = 0;
      this._introRaf            = null;
      this._introLastTs         = 0;        // previous frame timestamp for delta calc
      this._streamCanPlay       = false;    // set true by _triggerChain after camera lands
      this._streamVelocity      = 1;        // +1 forward, -1 reverse
      this._infoAnimInterval    = null;

      // Visibility pause/resume — RAF loops must not run in background tabs
      this._introPaused       = false;
      this._borderPaused      = false;
      this._photoBorderPaused = false;

      // Photo bg electric border
      this._photoBorderTurbulence  = null;
      this._photoBorderActive      = false;
      this._photoBorderRaf         = null;
      this._photoBorderFrame       = 0;
      this._photoBorderSettleTimer = null;
      this._photoBorderStopTimer   = null;

      // Flying caption clone
      this._flyClone         = null;
      this._flySource        = null;
      this._flyReturnTween   = null;
      this._flyReturnTimeout = null;

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
      this._stream      = document.querySelector('.photo-ghost-stream');
      this._streamCards = Array.from(document.querySelectorAll('.photo-ghost-card'));
      this._streamRotations = this._streamCards.map(card =>
        parseFloat(getComputedStyle(card).getPropertyValue('--ghost-rotate').trim()) || 0
      );
      this._cardHidden = new Array(this._streamCards.length).fill(true);
      this._updateStreamWidth();

      // Debounced resize — getBoundingClientRect forces layout; winH is cheap to update eagerly
      let _resizeTimer = null;
      window.addEventListener('resize', () => {
        this.winH = window.innerHeight;
        this._updateStreamWidth();
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(() => {
          this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;
        }, 100);
      }, { passive: true });

      // Pause all RAF loops when the tab is hidden; resume on return
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this._pauseAllRafs();
        } else {
          this._resumeAllRafs();
        }
      });

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

      // Info strip click handlers — left reverses stream, right plays forward
      const infoLeft  = document.querySelector('.pgallery-info-left');
      const infoRight = document.querySelector('.pgallery-info-right');
      if (infoLeft)  infoLeft.addEventListener('click',  () => { this._streamVelocity = this._streamVelocity === -1 ? 1 : -1; });
      if (infoRight) infoRight.addEventListener('click', () => { this._streamVelocity = this._streamVelocity ===  1 ? -1 : 1; });

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
      this._setupPolaroidClick();
      this._setupTitleColorCycle();
      this._setupStreamLightbox();

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
      this._tickStream(rawProgress);

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
      this._initPolaroid();
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
      const tStreamReady    = setTimeout(() => { this._streamCanPlay = true; this._startInfoAnim(); }, cameraRevealAt + 720);
      this.chainTimers.push(tStreamReady);

      // Lift the hover guard once the full intro sequence has settled
      const tIntroEnd = setTimeout(() => { this.introAnimating = false; this._borderDone(); }, cursor + 150);
      this.chainTimers.push(tIntroEnd);

      // (stream-active is managed by _enterStreamIntro / _resetStream)

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
      this._clearFlyClone();
      this.chainTimers.forEach(t => clearTimeout(t));
      this.chainTimers = [];
      this.chainActive = false;
      this.introAnimating = false;
      this._borderCount = 0;
      if (this._borderRaf) { cancelAnimationFrame(this._borderRaf); this._borderRaf = null; }
      if (this.accordion) this.accordion.classList.remove('accordion-animating');
      this._stopInfoAnim();
      this._stream?.classList.remove('stream-active');

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
      this._clearFlyClone();
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
      this.bgImage.style.opacity = '0';
      this._bgElecOff();
      document.querySelectorAll('.photo-ai-highlight').forEach(hl => hl.classList.remove('photo-ai-highlight--animate'));
      document.querySelector('.pgallery-hint')?.classList.remove('pgallery-hint--animate');
      document.querySelector('.photo-polaroid-hint')?.classList.remove('reveal');
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
      this._resetPolaroid();
      this._stream?.classList.remove('stream-active');
    }

    // ── Immediate hard reset (e.g. resize, bfcache) ──────────────────────────
    _fullReset() {
      this._clearFlyClone();
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
      this.bgImage.style.opacity = '0';
      this._bgElecOff();
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
      this._resetPolaroid();
    }

    // ── Ghost stream ─────────────────────────────────────────────────────────
    _updateStreamWidth() {
      if (this._stream) {
        this._stream.style.setProperty('--ghost-stream-w', this._stream.offsetWidth + 'px');
      }
    }

    // ── Ghost stream state machine ───────────────────────────────────────────
    //
    //   IDLE ──(rawProgress≥2)──▶ INTRO ──(first scroll)──▶ INTERACTIVE
    //     ◀──────────────────────────────(rawProgress<2)──────────────────
    //
    // _masterT is the single value that drives all card rendering.
    // In INTRO it grows via RAF; in INTERACTIVE it derives from rawProgress.
    // A decaying offset at handoff prevents any visible jump.

    // Called every scroll tick — owns all stream state transitions.
    _tickStream(rawProgress) {
      if (rawProgress < 2) {
        if (this._streamPhase !== 'idle') this._resetStream();
        return;
      }
      if (this._streamPhase === 'idle') this._enterStreamIntro();
    }

    _enterStreamIntro() {
      this._streamPhase     = 'active';
      this._masterT         = 0;
      this._introLastTs     = 0;
      this._streamCanPlay   = false;
      this._streamVelocity  = 1;
      this._stream?.classList.add('stream-active');
      this._introRaf = requestAnimationFrame(ts => this._introLoop(ts));
    }

    _introLoop(timestamp) {
      if (this._streamPhase !== 'active') return;

      const INTRO_SPEED = 0.09; // masterT units/s — ~11 s per crossing

      if (this._streamCanPlay) {
        const dt      = this._introLastTs ? Math.min((timestamp - this._introLastTs) / 1000, 0.1) : 0;
        this._introLastTs = timestamp;
        this._masterT += this._streamVelocity * INTRO_SPEED * dt;
        this._renderStream(this._masterT);
      }

      this._introRaf = requestAnimationFrame(ts => this._introLoop(ts));
    }

    _resetStream() {
      this._streamPhase    = 'idle';
      this._masterT        = 0;
      this._introLastTs    = 0;
      this._streamCanPlay  = false;
      this._streamVelocity = 1;
      this._introPaused    = false;
      if (this._introRaf) {
        cancelAnimationFrame(this._introRaf);
        this._introRaf = null;
      }
      this._stopInfoAnim();
      this._stream?.classList.remove('stream-active');
      this._streamCards.forEach(card => {
        card.style.opacity   = '0';
        card.style.transform = 'translateX(0) translateY(-50%) rotate(-90deg)';
      });
      // Sync cache so next _renderStream skips redundant writes for already-hidden cards
      if (this._cardHidden) this._cardHidden.fill(true);
      if (this._streamLbOpen) this._streamLbHide?.();
    }

    // Pure renderer — same function regardless of which driver owns masterT.
    // Uses modulo so the stream loops: after the last card exits, card 0 re-enters.
    // Works in both directions: increasing masterT = forward, decreasing = backward.
    // _cardHidden cache skips DOM writes for cards that were already set to hidden last frame
    // (~27 of 30 cards at any moment), cutting style-write overhead by ~90%.
    _renderStream(masterT) {
      if (!this._stream || !this._streamCards.length) return;

      const N            = this._streamCards.length;
      const CARD_SPACING = 0.22;
      const LOOP_LENGTH  = N * CARD_SPACING;
      const CARD_W       = 232;
      const streamW      = parseFloat(
        this._stream.style.getPropertyValue('--ghost-stream-w')
      ) || 500;

      const phase = ((masterT % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;

      for (let i = 0; i < N; i++) {
        const card   = this._streamCards[i];
        const offset = ((phase - i * CARD_SPACING) % LOOP_LENGTH + LOOP_LENGTH) % LOOP_LENGTH;

        if (offset > 1) {
          // Skip DOM write if card was already hidden last frame
          if (!this._cardHidden[i]) {
            card.style.opacity   = '0';
            card.style.transform = 'translateX(0) translateY(-50%) rotate(-90deg)';
            this._cardHidden[i]  = true;
          }
          continue;
        }

        this._cardHidden[i] = false;

        const t        = offset;
        const finalRot = this._streamRotations[i] || 0;
        let x, rot;

        if (t < 0.22) {
          const p = t / 0.22;
          x   = p * (streamW * 0.22 - 51);
          rot = -90;
        } else if (t < 0.75) {
          const p = (t - 0.22) / 0.53;
          x   = (streamW * 0.22 - 51) + p * ((streamW * 0.75 - 174) - (streamW * 0.22 - 51));
          rot = -90 + p * (finalRot + 90);
        } else {
          const p = (t - 0.75) / 0.25;
          x   = (streamW * 0.75 - 174) + p * ((streamW - CARD_W) - (streamW * 0.75 - 174));
          rot = finalRot;
        }

        card.style.opacity   = t < 0.03 ? String(t / 0.03) : '1';
        card.style.transform = `translateX(${x}px) translateY(-50%) rotate(${rot}deg)`;
      }
    }

    // ── RAF visibility pause / resume ────────────────────────────────────────
    _pauseAllRafs() {
      if (this._introRaf && this._streamPhase === 'active') {
        cancelAnimationFrame(this._introRaf);
        this._introRaf   = null;
        this._introPaused = true;
        this._introLastTs = 0; // reset so resumed loop doesn't jump by hidden-tab duration
      }
      if (this._borderRaf && this._borderCount > 0) {
        cancelAnimationFrame(this._borderRaf);
        this._borderRaf   = null;
        this._borderPaused = true;
      }
      if (this._photoBorderRaf && this._photoBorderActive) {
        cancelAnimationFrame(this._photoBorderRaf);
        this._photoBorderRaf   = null;
        this._photoBorderPaused = true;
      }
    }

    _resumeAllRafs() {
      if (this._introPaused && this._streamPhase === 'active') {
        this._introPaused = false;
        this._introRaf = requestAnimationFrame(ts => this._introLoop(ts));
      }
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
        this._flyCaption(item);

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
        this._returnCaption();
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
      if (this.photoSection) this.photoSection.style.zIndex = '1001';
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
      this._bgElecOn();
    }

    hideBackgroundImage() {
      this.bgImage.style.opacity = '0';
      if (this.photoSection) this.photoSection.style.zIndex = '';
      this._bgElecOff();
    }

    // ── Polaroids title: random colour cycle on hover ────────────────────────
    // ── Polaroid reveal: canvas scratch-off ──────────────────────────────────
    _initPolaroid() {
      const canvas = document.getElementById('polaroidCanvas');
      const photo  = document.getElementById('polaroidPhoto');
      if (!canvas || !photo) return;

      // Random palette colour for the polaroid frame background
      const palette = ['#005F73','#0A9396','#94D2BD','#E9D8A6','#EE9B00','#CA6702','#BB3E03','#AE2012','#9B2226'];
      const frame   = document.querySelector('.photo-polaroid-frame');
      if (frame) frame.style.background = palette[Math.floor(Math.random() * palette.length)];

      // Pick a random image + title from the accordion list
      const items = Array.from(document.querySelectorAll('.photo-project-item[data-image]'));
      if (!items.length) return;
      const item  = items[Math.floor(Math.random() * items.length)];
      photo.src   = item.dataset.image;

      // Populate caption with the photo title and trigger marker animation
      const nameEl  = document.getElementById('polaroidName');
      const titleEl = item.querySelector('.photo-title');
      if (nameEl) {
        nameEl.textContent = titleEl ? titleEl.textContent.trim() : '';
        nameEl.classList.remove('reveal');
        void nameEl.offsetWidth;
        nameEl.classList.add('reveal');
      }

      // Section label — formatted as [ · A N I M A L S · ]
      const sectionEl  = document.getElementById('polaroidSection');
      const sectionBtn = item.closest('.photo-accordion-item')?.querySelector('.photo-btn-label');
      if (sectionEl) {
        if (sectionBtn) {
          const word = sectionBtn.textContent.replace(/[·\[\]\s]/g, '').trim().toUpperCase();
          const spaced = word.split('').join(' ');
          sectionEl.textContent = '[ \u00b7 ' + spaced + ' \u00b7 ]';
        } else {
          sectionEl.textContent = '';
        }
        sectionEl.classList.remove('reveal');
        void sectionEl.offsetWidth;
        sectionEl.classList.add('reveal');
      }

      // Size canvas bitmap to physical pixels (HiDPI-aware).
      // Deferred to rAF so layout is settled after the overlay becomes visible.
      requestAnimationFrame(() => {
        if (!this.inPhase3) return;

        const dpr  = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const cssW = rect.width;
        const cssH = rect.height;
        if (!cssW || !cssH) return;

        canvas.width  = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Fill with dark background — this is what gets "scratched off"
        ctx.fillStyle = '#001219';
        ctx.fillRect(0, 0, cssW, cssH);

        // Remove any leftover listener from a previous visit
        if (this._polaroidMoveHandler) {
          canvas.removeEventListener('mousemove', this._polaroidMoveHandler);
        }

        // Erase a soft circle wherever the mouse moves (permanent destination-out)
        this._polaroidMoveHandler = (e) => {
          const r = canvas.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          const radius = 44;
          ctx.globalCompositeOperation = 'destination-out';
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0,    'rgba(0,0,0,1)');
          grad.addColorStop(0.6,  'rgba(0,0,0,0.85)');
          grad.addColorStop(1,    'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        };

        canvas.addEventListener('mousemove', this._polaroidMoveHandler, { passive: true });
      });
    }

    _resetPolaroid() {
      const canvas = document.getElementById('polaroidCanvas');
      if (!canvas) return;
      if (this._polaroidMoveHandler) {
        canvas.removeEventListener('mousemove', this._polaroidMoveHandler);
        this._polaroidMoveHandler = null;
      }
      // Resetting dimensions clears the bitmap automatically
      canvas.width  = 0;
      canvas.height = 0;
      const photo  = document.getElementById('polaroidPhoto');
      if (photo) photo.src = '';
      const nameEl    = document.getElementById('polaroidName');
      if (nameEl) { nameEl.textContent = ''; nameEl.classList.remove('reveal'); }
      const sectionEl = document.getElementById('polaroidSection');
      if (sectionEl) sectionEl.textContent = '';
      const frame  = document.querySelector('.photo-polaroid-frame');
      if (frame) frame.style.background = '';
    }

    // ── Polaroid reveal photo: click to open matching item ──────────────────
    _setupPolaroidClick() {
      const polaroidReveal = document.querySelector('.photo-polaroid-reveal');
      if (!polaroidReveal) return;
      polaroidReveal.style.cursor = 'pointer';
      polaroidReveal.addEventListener('click', () => {
        if (this.introAnimating) return;
        const photoEl = document.getElementById('polaroidPhoto');
        if (!photoEl || !photoEl.src) return;

        const normalize = (src) => {
          try { return new URL(src, location.href).pathname; } catch { return src; }
        };
        const polaroidPath = normalize(photoEl.src);

        const matchingItem = Array.from(
          document.querySelectorAll('.photo-project-item[data-image]')
        ).find(item => normalize(item.dataset.image) === polaroidPath);

        if (!matchingItem) return;

        // Clear the scratch canvas to fully expose the photo
        const canvas = document.getElementById('polaroidCanvas');
        if (canvas && canvas.width && canvas.height) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Re-trigger the caption reveal so name + section are prominently visible
        const nameEl    = document.getElementById('polaroidName');
        const sectionEl = document.getElementById('polaroidSection');
        [nameEl, sectionEl].forEach(el => {
          if (!el) return;
          el.classList.remove('reveal');
          void el.offsetWidth;   // force reflow so the animation restarts
          el.classList.add('reveal');
        });

        const accordionItem = matchingItem.closest('.photo-accordion-item');
        const btn  = accordionItem?.querySelector('.photo-category-btn');
        const list = accordionItem?.querySelector('.photo-project-list');
        const cat  = btn?.dataset.category;
        if (!cat || !list || !btn) return;

        const activate = () => this._activatePolaroidItem(matchingItem);

        if (!this.openCategories.has(cat)) {
          this._openCategory(cat, btn, list);
          const n = list.querySelectorAll('.photo-project-item').length;
          setTimeout(activate, n * 40 + 200);
        } else {
          activate();
        }
      });
    }

    _activatePolaroidItem(item) {
      const list = item.closest('.photo-project-list');
      if (!list) return;

      const textEls       = item.querySelectorAll('.hover-text');
      const originalTexts = this.originalTexts.get(item);

      // Clear any previously active item in the same list
      list.querySelectorAll('.photo-project-item').forEach(el => {
        el.classList.remove('active');
        el.style.opacity = '';
      });
      list.classList.add('has-active');
      item.classList.add('active');

      // ScrambleText on hover-text elements
      if (originalTexts) {
        textEls.forEach((el, i) => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text: originalTexts[i],
              chars: 'qwerty1337h@ck3r',
              revealDelay: 0.3,
              speed: 0.4,
            },
          });
        });
      }

      if (item.dataset.image) this.showBackgroundImage(item.dataset.image);

      // Scroll to reveal the item
      if (this.contentScroll) {
        requestAnimationFrame(() => {
          const csRect   = this.contentScroll.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();
          const needed   = this.contentScroll.scrollTop + (itemRect.bottom + 24 - csRect.bottom);
          if (needed > this.contentScroll.scrollTop) {
            gsap.to(this.contentScroll, {
              scrollTop: needed,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        });
      }
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

      // Snap on — same reflow trick as the illustration lightbox
      this.bgImage.classList.remove('photo-bg-elec-active');
      void this.bgImage.offsetWidth;
      this.bgImage.classList.add('photo-bg-elec-active');

      // Start seed cycling if not already running
      if (!this._photoBorderActive) {
        this._photoBorderActive = true;
        this._photoBorderFrame  = 0;
        this._photoBorderRaf    = requestAnimationFrame(() => this._photoBorderTick());
      }

      // After settle window: remove class → CSS fades border out over 0.4s
      const SETTLE_MS = 620;
      const FADE_MS   = 400;
      this._photoBorderSettleTimer = setTimeout(() => {
        this._photoBorderSettleTimer = null;
        this.bgImage.classList.remove('photo-bg-elec-active');
        // Stop the RAF once the fade is complete — zero CPU after that
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

    // ── Flying caption clone ─────────────────────────────────────────────────

    _getCounterIndex(item) {
      const list = item.closest('.photo-project-list');
      if (!list) return '01';
      const items = Array.from(list.querySelectorAll('.photo-project-item'));
      return String(items.indexOf(item) + 1).padStart(2, '0');
    }

    _buildFlyClone(item) {
      const clone = document.createElement('li');
      clone.className = 'photo-project-item photo-caption-fly';

      const numSpan = document.createElement('span');
      numSpan.className = 'photo-fly-num';
      numSpan.textContent = this._getCounterIndex(item);
      clone.appendChild(numSpan);

      item.querySelectorAll('.photo-project-data').forEach(span => {
        clone.appendChild(span.cloneNode(true));
      });

      return clone;
    }

    _flyCaption(item) {
      if (this._flyReturnTimeout) {
        clearTimeout(this._flyReturnTimeout);
        this._flyReturnTimeout = null;
      }

      const rect      = item.getBoundingClientRect();
      const nav       = document.querySelector('header');
      const navH      = nav ? nav.offsetHeight : 70;
      const targetTop = Math.round(window.innerHeight * 0.975) - 32;
      const targetLeft = (window.innerWidth - rect.width) / 2;

      // Quick-switch: clone already exists for a different item
      if (this._flyClone && this._flySource !== item) {
        this._flySource.style.opacity = '0.25';
        this._flySource.style.zIndex  = '';
        this._flySource = item;
        item.style.opacity = '0.5';
        item.style.zIndex  = '0';

        const numEl = this._flyClone.querySelector('.photo-fly-num');
        if (numEl) numEl.textContent = this._getCounterIndex(item);

        const cloneSpans = this._flyClone.querySelectorAll('.photo-project-data');
        const origTexts  = this.originalTexts.get(item);
        const srcSpans   = item.querySelectorAll('.photo-project-data');
        cloneSpans.forEach((el, i) => {
          gsap.killTweensOf(el);
          const target = (origTexts && origTexts[i]) ? origTexts[i]
                       : (srcSpans[i] ? srcSpans[i].textContent : '');
          gsap.to(el, {
            duration: 0.5,
            scrambleText: { text: target, chars: 'qwerty1337h@ck3r', revealDelay: 0.1, speed: 0.5 }
          });
        });
        return;
      }

      if (this._flyClone) return; // same item already tracked

      const clone = this._buildFlyClone(item);
      gsap.set(clone, { top: rect.top, left: rect.left, width: rect.width, opacity: 0 });
      document.body.appendChild(clone);
      this._flyClone  = clone;
      this._flySource = item;
      item.style.zIndex = '0';

      clone.classList.add('photo-glitch-load');
      setTimeout(() => { if (this._flyClone === clone) clone.classList.remove('photo-glitch-load'); }, 520);

      gsap.to(clone, {
        top:      targetTop,
        left:     targetLeft,
        opacity:  1,
        duration: 0.42,
        ease:     'power3.out',
      });
    }

    _returnCaption() {
      if (!this._flyClone) return;

      this._flyReturnTimeout = setTimeout(() => {
        this._flyReturnTimeout = null;
        if (!this._flyClone) return;

        const clone  = this._flyClone;
        const source = this._flySource;
        this._flyClone  = null;
        this._flySource = null;

        const rect = source ? source.getBoundingClientRect() : null;
        if (!rect) { clone.remove(); return; }

        if (source) source.style.zIndex = '';
        if (this._flyReturnTween) this._flyReturnTween.kill();
        this._flyReturnTween = gsap.to(clone, {
          top:      rect.top,
          left:     rect.left,
          width:    rect.width,
          opacity:  0,
          duration: 0.32,
          ease:     'power2.in',
          onComplete: () => { clone.remove(); this._flyReturnTween = null; }
        });
      }, 0);
    }

    _clearFlyClone() {
      if (this._flyReturnTimeout) { clearTimeout(this._flyReturnTimeout); this._flyReturnTimeout = null; }
      if (this._flyReturnTween)   { this._flyReturnTween.kill(); this._flyReturnTween = null; }
      if (this._flyClone)         { this._flyClone.remove(); this._flyClone = null; }
      if (this._flySource)        { this._flySource.style.opacity = ''; this._flySource.style.zIndex = ''; this._flySource = null; }
    }

    // ── Info strip animation ─────────────────────────────────────────────────
    _startInfoAnim() {
      const rightEl = document.querySelector('.pgallery-info-right');
      const leftEl  = document.querySelector('.pgallery-info-left');
      if (!rightEl || !leftEl) return;

      const rightStates = ['', '>', '>>', '>>>'];
      const leftStates  = ['', '<', '<<', '<<<'];
      const STEP_DELAY  = 500;
      const LOOP_PAUSE  = 2200;
      let step = 0;

      const tick = () => {
        rightEl.textContent = rightStates[step];
        leftEl.textContent  = leftStates[step];
        step = (step + 1) % rightStates.length;
        this._infoAnimInterval = setTimeout(tick, step === 0 ? LOOP_PAUSE : STEP_DELAY);
      };

      tick();
    }

    _stopInfoAnim() {
      if (this._infoAnimInterval) {
        clearTimeout(this._infoAnimInterval);
        this._infoAnimInterval = null;
      }
      const rightEl = document.querySelector('.pgallery-info-right');
      const leftEl  = document.querySelector('.pgallery-info-left');
      if (rightEl) rightEl.textContent = '';
      if (leftEl)  leftEl.textContent  = '';
    }

    // ── Ghost stream lightbox ────────────────────────────────────────────────
    _setupStreamLightbox() {
      // Distribute photo data across cards by cycling through all accordion items
      const photoItems = Array.from(document.querySelectorAll('.photo-project-item[data-image]'));
      this._streamCards.forEach((card, i) => {
        const item = photoItems[i % photoItems.length];
        if (!item) return;
        card.dataset.image = item.dataset.image;
        card.style.backgroundImage    = `url("${item.dataset.image}")`;
        card.style.backgroundSize     = 'cover';
        card.style.backgroundPosition = 'center';
        const titleEl = item.querySelector('.photo-title');
        card.dataset.alt = titleEl ? titleEl.textContent.trim() : '';
      });

      // Build lightbox — same structure as illus-lightbox
      const lb = document.createElement('div');
      lb.className = 'photo-stream-lightbox';
      lb.setAttribute('aria-hidden', 'true');
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.innerHTML = `
        <div class="photo-stream-lb-frame">
          <img class="photo-stream-lb-img" alt="">
          <div class="photo-stream-lb-border" aria-hidden="true"></div>
          <button class="photo-stream-lb-close" aria-label="Close">[ x ]</button>
        </div>`;
      document.body.appendChild(lb);

      const lbImg = lb.querySelector('.photo-stream-lb-img');
      this._streamLbOpen = false;
      let lbTimer = null;
      const LB_SETTLE_MS = 620;

      const lbShow = (src, alt) => {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lb.setAttribute('aria-hidden', 'false');
        lb.classList.add('open');
        this._streamLbOpen = true;
        document.body.style.overflow = 'hidden';

        if (lbTimer) { clearTimeout(lbTimer); lbTimer = null; }
        lb.classList.remove('lb-elec-active');
        void lb.offsetWidth;
        lb.classList.add('lb-elec-active');
        lbTimer = setTimeout(() => {
          lb.classList.remove('lb-elec-active');
          lbTimer = null;
        }, LB_SETTLE_MS);
      };

      this._streamLbHide = () => {
        if (lbTimer) { clearTimeout(lbTimer); lbTimer = null; }
        lb.classList.remove('lb-elec-active', 'open');
        lb.setAttribute('aria-hidden', 'true');
        this._streamLbOpen = false;
        document.body.style.overflow = '';
        setTimeout(() => { if (!this._streamLbOpen) lbImg.src = ''; }, 500);
      };

      lb.addEventListener('click', e => { if (e.target === lb) this._streamLbHide(); });
      lb.querySelector('.photo-stream-lb-close').addEventListener('click', this._streamLbHide);
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && this._streamLbOpen) this._streamLbHide(); });

      // Wire click on each card
      this._streamCards.forEach(card => {
        card.addEventListener('click', () => {
          if (!card.dataset.image) return;
          lbShow(card.dataset.image, card.dataset.alt || '');
        });
      });
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

})();
