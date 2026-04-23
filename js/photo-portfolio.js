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

      // Chain-reveal elements: intro → cta → 4 buttons → polaroids title
      // Populated in init() once DOM is confirmed ready
      this.staticEls     = [];
      this.chainActive   = false;
      this.chainTimers   = [];
      this.reverseActive = false;
      this.reverseTimers = [];

      // Intro animation guard — hover is disabled while the sequential intro plays
      this.introAnimating = false;

      // Electric border: count of in-flight animations (open + close + chain)
      this.accordion    = document.querySelector('.photo-accordion');
      this._borderCount = 0;

      // Polaroid reveal state
      this._polaroidMoveHandler = null;

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

      window.addEventListener('resize', () => {
        this.winH         = window.innerHeight;
        this.spacerDocTop = this.photoSpacer.getBoundingClientRect().top + window.scrollY;
      }, { passive: true });

      // Chain order: section label → intro text → instagram → cta → camera col → 4 buttons → polaroids title → polaroids desc → scroll hint
      const pgalleryTitle = document.querySelector('.pgallery-title');
      const pgalleryDesc  = document.querySelector('.pgallery-desc');
      const pgalleryHint  = document.querySelector('.pgallery-hint');
      this.staticEls = [
        this.overlay.querySelector('.photo-section-label'),
        this.overlay.querySelector('.photo-intro'),
        this.overlay.querySelector('.photo-col-instagram'),
        this.overlay.querySelector('.photo-cta'),
        this.overlay.querySelector('.photo-col-camera'),
        ...this.categoryBtns,
        pgalleryTitle,
        pgalleryDesc,
        pgalleryHint
      ].filter(Boolean);

      // Start all chain elements hidden
      this.staticEls.forEach(el => gsap.set(el, { opacity: 0 }));

      this.preloadImages();
      this._setupCategoryButtons();
      this._setupHoverListeners();
      this._setupPolaroidClick();
      this._setupTitleColorCycle();

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
        // Tell the nav to mark photo as active immediately (no scroll-debounce lag)
        document.dispatchEvent(new CustomEvent('photoPhase3Active'));
        this._triggerChain();
      } else {
        this._cancelChain();
        this._triggerReverseChain();
      }
    }

    // ── Forward chain: intro → sequential category reveal → bounce-close → tail ──
    _triggerChain() {
      if (this.chainActive) return;
      this.chainActive = true;
      this.introAnimating = true;
      this._borderStart();
      this._initPolaroid();

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

      // 4. Tail elements: pgallery title → desc → hint
      const tailStart = cursor;
      tailEls.forEach((el, i) => {
        const t = setTimeout(() => this._revealItem(el, 0), tailStart + i * TAIL_STEP);
        this.chainTimers.push(t);
      });
      cursor = tailStart + tailEls.length * TAIL_STEP;

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

      // Polaroid hint + camera reveal after revert finishes
      const hint = document.querySelector('.photo-polaroid-hint');
      if (hint) {
        const t = setTimeout(() => {
          hint.classList.remove('reveal');
          void hint.offsetWidth;
          hint.classList.add('reveal');
        }, tailStart + 200);
        this.chainTimers.push(t);
      }

      const camera = document.querySelector('.photo-camera-deco');
      if (camera) {
        const t = setTimeout(() => camera.classList.add('visible'), tailStart + 400);
        this.chainTimers.push(t);
      }
    }

    _cancelChain() {
      this.chainTimers.forEach(t => clearTimeout(t));
      this.chainTimers = [];
      this.chainActive = false;
      this.introAnimating = false;
      this._borderCount = 0;
      if (this.accordion) this.accordion.classList.remove('accordion-animating');

      // Kill tweens and reset transforms on all chain elements
      this.staticEls.forEach(el => {
        gsap.killTweensOf(el);
        gsap.set(el, { y: 0 });
        el.classList.remove('photo-glitch-load');
        el.classList.remove('glitch-ready');
      });

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
      document.querySelector('.photo-camera-deco')?.classList.remove('visible');
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
          gsap.set(item, { opacity: 0, y: 0 });
        });
      });
      this.bgImage.style.opacity = '0';
      document.querySelectorAll('.photo-ai-highlight').forEach(hl => hl.classList.remove('photo-ai-highlight--animate'));
      document.querySelector('.pgallery-hint')?.classList.remove('pgallery-hint--animate');
      document.querySelector('.photo-polaroid-hint')?.classList.remove('reveal');
      document.querySelector('.photo-camera-deco')?.classList.remove('visible');
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
      this._resetPolaroid();
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
      if (this.contentScroll) {
        gsap.killTweensOf(this.contentScroll);
        this.contentScroll.scrollTop = 0;
      }
      this._resetPolaroid();
    }

    // ── Electric border helpers ──────────────────────────────────────────────
    _borderStart() {
      this._borderCount++;
      if (this._borderCount === 1 && this.accordion) {
        this.accordion.classList.add('accordion-animating');
      }
    }

    _borderDone() {
      this._borderCount = Math.max(0, this._borderCount - 1);
      if (this._borderCount === 0 && this.accordion) {
        this.accordion.classList.remove('accordion-animating');
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
      // If the section is visible, re-trigger highlights on the new innerHTML span
      if (this.inPhase3) {
        document.querySelectorAll('.photo-ai-highlight').forEach(hl => {
          hl.classList.remove('photo-ai-highlight--animate');
          void hl.offsetWidth;
          hl.classList.add('photo-ai-highlight--animate');
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
    }

    hideBackgroundImage() {
      this.bgImage.style.opacity = '0';
      if (this.photoSection) this.photoSection.style.zIndex = '';
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

      // Size canvas bitmap to physical pixels (HiDPI-aware)
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
        // Soft gradient brush — solid centre, fades at edges
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
      const title = document.querySelector('.pgallery-title');
      if (!title) return;

      const palette = [
        '#005F73', '#0A9396', '#94D2BD', '#E9D8A6',
        '#EE9B00', '#CA6702', '#BB3E03', '#AE2012', '#9B2226'
      ];

      title.addEventListener('mouseenter', () => {
        title.style.color = palette[Math.floor(Math.random() * palette.length)];
      });
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
