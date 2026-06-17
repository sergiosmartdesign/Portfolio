/* ── ad-flipbook.js — Editorial catalog page-turn book ───────────────────────
   A dependency-free CSS-3D flipbook for the Art Direction project modal. Turns
   an ordered array of catalog page images into a book whose leaves rotate around
   a central spine on click / swipe / arrow keys.

   Model: each physical LEAF is double-sided (front + back). Desktop renders a
   two-page SPREAD (leaf i → pages 2i, 2i+1); narrow viewports render SINGLE
   page (leaf i → page i front, page i+1 back) so every page stays legible.
   `cur` is the count of leaves currently turned to the left pile.

   Turned leaves stack left, unturned stack right — a true book. z-index is
   recomputed per state so the visible faces always win, and the actively
   turning leaf is bumped above the whole stack for the duration of its flip.

   Accessibility: honors prefers-reduced-motion (instant page swap, no rotate),
   exposes a live page counter, real <button> controls in the modal tab order,
   and ArrowLeft/Right + Home/End while open.

   Performance: one GPU-composited transform per turn; will-change is added on
   flip-start and dropped on transitionend; faces outside the current ±1 window
   are not painted. No layout reads per frame.

   API:  const fb = new ADFlipbook(stageEl, pageUrls, { label }); … fb.destroy();
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // A4 portrait (210×297) — sensible default until the first page reports its
  // real intrinsic ratio, at which point the book refits.
  const DEFAULT_RATIO = 210 / 297; // width / height
  const SWIPE_PX = 40;
  const FIT_MARGIN = 0.94; // breathing room for drop-shadows inside the stage

  class ADFlipbook {
    constructor(host, pages, opts = {}) {
      this.host  = host;
      this.pages = (pages || []).filter(Boolean);
      this.label = opts.label || 'Catalog';
      this.ratio = DEFAULT_RATIO;
      this.cur   = 0;
      this.animating = false;

      // Mode is chosen once at mount: a spread needs the horizontal room for two
      // pages, so collapse to single page on phones / portrait tablets and when
      // the touch profile says mobile.
      const narrow = window.innerWidth <= 760;
      const mobile = !!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile);
      this.mode = (narrow || mobile) ? 'single' : 'spread';

      this._buildLeaves();
      this._render();
      this._bind();
      this._measureRatio();
      this._fit();
      this._applyState(true);
    }

    // ── Leaf spec ──────────────────────────────────────────────────────────────
    _buildLeaves() {
      const p = this.pages;
      this.leaves = [];
      if (this.mode === 'spread') {
        for (let i = 0; i < p.length; i += 2) {
          this.leaves.push({ front: p[i], back: p[i + 1] || null });
        }
      } else {
        // Single page: adjacent leaves share a page image so a turn reveals the
        // next page underneath. One leaf per page; last leaf has a blank back.
        for (let i = 0; i < p.length; i++) {
          this.leaves.push({ front: p[i], back: p[i + 1] || null });
        }
      }
      this.count = this.leaves.length;
    }

    get maxCur() {
      // Spread can advance until every leaf is turned (cover → last page);
      // single page stops on the last page itself.
      return this.mode === 'spread' ? this.count : this.count - 1;
    }

    // ── DOM ──────────────────────────────────────────────────────────────────
    _render() {
      const el = document.createElement('div');
      el.className = `ad-book ad-book--${this.mode}`;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'page-turn catalog');
      el.setAttribute('aria-label', this.label);

      const leavesHtml = this.leaves.map((lf, i) => `
        <div class="ad-book-leaf" data-leaf="${i}">
          <div class="ad-book-face ad-book-face--front">
            <span class="ad-book-gloss" aria-hidden="true"></span>
            <span class="ad-book-corner" aria-hidden="true"></span>
          </div>
          <div class="ad-book-face ad-book-face--back${lf.back ? '' : ' is-blank'}">
            <span class="ad-book-gloss" aria-hidden="true"></span>
          </div>
        </div>`).join('');

      el.innerHTML = `
        <div class="ad-book-stack">
          ${leavesHtml}
          <span class="ad-book-gutter" aria-hidden="true"></span>
        </div>
        <div class="ad-book-controls">
          <button type="button" class="ad-book-btn ad-book-prev" aria-label="Previous page"><span class="ad-book-chevs" aria-hidden="true"><i>‹</i><i>‹</i><i>‹</i></span></button>
          <span class="ad-book-counter" aria-live="polite"></span>
          <button type="button" class="ad-book-btn ad-book-next" aria-label="Next page"><span class="ad-book-chevs" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></button>
        </div>`;

      this.el       = el;
      this.stack    = el.querySelector('.ad-book-stack');
      this.leafEls  = [...el.querySelectorAll('.ad-book-leaf')];
      this.counter  = el.querySelector('.ad-book-counter');
      this.prevBtn  = el.querySelector('.ad-book-prev');
      this.nextBtn  = el.querySelector('.ad-book-next');

      this.leafEls.forEach((leaf, i) => {
        const front = leaf.querySelector('.ad-book-face--front');
        const back  = leaf.querySelector('.ad-book-face--back');
        front.dataset.src = this.leaves[i].front || '';
        if (this.leaves[i].back) back.dataset.src = this.leaves[i].back;
      });

      this.host.appendChild(el);
    }

    // ── Wiring ─────────────────────────────────────────────────────────────────
    _bind() {
      this.prevBtn.addEventListener('click', e => { e.stopPropagation(); this.go(-1); });
      this.nextBtn.addEventListener('click', e => { e.stopPropagation(); this.go(1); });

      // Click a side of the book to turn that way (the universal book gesture).
      this._suppressClick = false;
      this._onTap = e => {
        if (e.target.closest('.ad-book-btn')) return;
        if (this._suppressClick) { this._suppressClick = false; return; } // was a swipe
        const r = this.stack.getBoundingClientRect();
        this.go(e.clientX < r.left + r.width / 2 ? -1 : 1);
      };
      this.el.addEventListener('click', this._onTap);

      // Swipe (pointer): horizontal drag past threshold turns the page; a small
      // movement falls through to the click handler above as a tap. A real swipe
      // suppresses the click that the browser still synthesises after pointerup.
      this._down = null;
      this._onDown = e => { this._down = e.clientX; };
      this._onUp = e => {
        if (this._down == null) return;
        const dx = e.clientX - this._down;
        this._down = null;
        if (Math.abs(dx) > SWIPE_PX) { this._suppressClick = true; this.go(dx < 0 ? 1 : -1); }
      };
      this.el.addEventListener('pointerdown', this._onDown, { passive: true });
      this.el.addEventListener('pointerup', this._onUp);

      // Arrow / Home / End while the book is in the document.
      this._onKey = e => {
        if (!this.el.isConnected) return;
        if (e.key === 'ArrowRight')      { e.preventDefault(); this.go(1); }
        else if (e.key === 'ArrowLeft')  { e.preventDefault(); this.go(-1); }
        else if (e.key === 'Home')       { e.preventDefault(); this.jump(0); }
        else if (e.key === 'End')        { e.preventDefault(); this.jump(this.maxCur); }
      };
      document.addEventListener('keydown', this._onKey);

      this._onResize = this._debounce(() => { this._fit(); }, 150);
      window.addEventListener('resize', this._onResize, { passive: true });
    }

    // ── Sizing ───────────────────────────────────────────────────────────────
    _measureRatio() {
      if (!this.pages[0]) return;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          this.ratio = img.naturalWidth / img.naturalHeight;
          this._fit();
        }
      };
      img.src = this.pages[0];
    }

    // Fit a book of the page aspect ratio inside the stage's content box.
    _fit() {
      const availW = this.el.clientWidth  * FIT_MARGIN;
      const availH = this.el.clientHeight * FIT_MARGIN;
      if (!availW || !availH) return;

      const pagesAcross = this.mode === 'spread' ? 2 : 1;
      // Height-led, then clamp so the full width still fits.
      let leafH = availH;
      let leafW = leafH * this.ratio;
      if (leafW * pagesAcross > availW) {
        leafW = availW / pagesAcross;
        leafH = leafW / this.ratio;
      }
      this.stack.style.setProperty('--leaf-w', `${leafW.toFixed(2)}px`);
      this.stack.style.setProperty('--leaf-h', `${leafH.toFixed(2)}px`);
    }

    // ── Navigation ─────────────────────────────────────────────────────────────
    go(dir) {
      if (this.animating) return;
      const next = this.cur + (dir > 0 ? 1 : -1);
      if (next < 0 || next > this.maxCur) return;

      // The leaf that physically moves: turning forward flips leaf `cur`;
      // turning back un-flips the leaf we are returning to.
      const leafIdx = dir > 0 ? this.cur : next;
      const leaf = this.leafEls[leafIdx];
      this.cur = next;

      if (reduce.matches || !leaf) {
        this._applyState();
        return;
      }

      this.animating = true;
      leaf.classList.add('is-turning');
      leaf.style.zIndex = String(this.count + 10);
      leaf.style.willChange = 'transform';

      const done = () => {
        leaf.removeEventListener('transitionend', onEnd);
        clearTimeout(safety);
        leaf.classList.remove('is-turning');
        leaf.style.willChange = '';
        this.animating = false;
        this._applyState();
      };
      const onEnd = e => { if (e.propertyName === 'transform') done(); };
      leaf.addEventListener('transitionend', onEnd);
      // Fail-open if transitionend never fires (e.g. interrupted/zero-size).
      const safety = setTimeout(done, 900);

      // Toggle in the next frame so the transition has a start state.
      requestAnimationFrame(() => this._applyState());
    }

    // Instant jump (Home/End) — no per-leaf animation, just resolve to state.
    jump(target) {
      if (this.animating) return;
      this.cur = Math.max(0, Math.min(this.maxCur, target));
      this._applyState();
    }

    // ── State → DOM ──────────────────────────────────────────────────────────
    _applyState(initial) {
      const turning = this.el.querySelector('.ad-book-leaf.is-turning');
      this.leafEls.forEach((leaf, i) => {
        const flipped = i < this.cur;
        leaf.classList.toggle('is-flipped', flipped);
        // Turned leaves pile up on the left (later = higher); unturned pile on
        // the right (the current leaf on top). The turning leaf keeps its bump.
        if (leaf !== turning) {
          leaf.style.zIndex = String(flipped ? i : this.count - i);
        }
        // Top unturned leaf gets the corner-peel affordance.
        leaf.classList.toggle('is-top', i === this.cur && !flipped);
      });

      this._paintWindow();
      this._updateControls();
      if (initial) this._fit();
    }

    // Only the visible spread ±1 leaf carry painted faces.
    _paintWindow() {
      this.leafEls.forEach((leaf, i) => {
        const near = Math.abs(i - this.cur) <= 1;
        leaf.querySelectorAll('.ad-book-face').forEach(face => {
          const src = face.dataset.src;
          if (!src) return;
          const want = near ? `url("${src}")` : '';
          if (face.style.backgroundImage !== want) face.style.backgroundImage = want;
        });
      });
    }

    _updateControls() {
      this.prevBtn.disabled = this.cur <= 0;
      this.nextBtn.disabled = this.cur >= this.maxCur;

      const n = this.pages.length;
      let visible;
      if (this.mode === 'spread') {
        // 0-based page indices on screen at this turn count.
        const right = 2 * this.cur;       // front of leaf `cur`
        const left  = 2 * this.cur - 1;   // back of leaf `cur-1`
        visible = [left, right].filter(x => x >= 0 && x < n);
      } else {
        visible = [this.cur];
      }
      const lo = Math.min(...visible) + 1;
      const hi = Math.max(...visible) + 1;
      const range = lo === hi ? `${this._pad(lo)}` : `${this._pad(lo)}–${this._pad(hi)}`;
      this.counter.textContent = `${range} / ${this._pad(n)}`;
    }

    _pad(n) { return String(n).padStart(2, '0'); }

    _debounce(fn, ms) {
      let t;
      return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    }

    // ── Teardown ───────────────────────────────────────────────────────────────
    destroy() {
      document.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      this.el?.remove();
      this.el = this.stack = this.leafEls = null;
    }
  }

  window.ADFlipbook = ADFlipbook;
}());
