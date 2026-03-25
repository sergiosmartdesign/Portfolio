/**
 * polaroid-gallery.js
 * Each row of 8 polaroid cards starts as a stacked deck at the horizontal
 * center of the viewport and fans out to its final grid positions as the
 * internal scroll container brings it into view.
 *
 * Scroll container: .photo-content-scroll (overflow-y: auto inside #photo)
 * Depends on: gsap.min.js (loaded before this file)
 */

(function () {
  'use strict';

  // Rotation of each card in the stacked deck, by column index 0–7.
  // Negative = tilted left (left-group cards), positive = tilted right.
  const DECK_ROT = [-8, -5, -3, -1, 1, 3, 5, 8];

  // Subtle vertical stagger inside the pile (px) — outermost cards sit higher
  // so the deck looks slightly fanned even before spreading.
  const DECK_Y = [8, 5, 2, 0, 0, 2, 5, 8];

  class PolaroidGallery {
    constructor() {
      this.scroller = document.querySelector('.photo-content-scroll');
      this.grid     = document.querySelector('.pgallery-grid');

      if (!this.scroller || !this.grid) return;

      this.wraps = [...this.grid.querySelectorAll('.pgallery-wrap')];
      this.rows  = [];   // array of 8-card arrays
      this.ready = false;
    }

    init() {
      // Group wraps into rows of 8
      for (let i = 0; i < this.wraps.length; i += 8) {
        this.rows.push(this.wraps.slice(i, i + 8));
      }

      this._computeOffsets();
      this._update();

      this.scroller.addEventListener('scroll', () => this._update(), { passive: true });
      window.addEventListener('resize', () => {
        this._computeOffsets();
        this._update();
      }, { passive: true });
    }

    // ── Calculate each card's horizontal distance from viewport center ───────
    // Uses grid geometry so no transforms need to be cleared before measuring.
    _computeOffsets() {
      const gridRect = this.grid.getBoundingClientRect();
      const style    = getComputedStyle(this.grid);
      const padL     = parseFloat(style.paddingLeft)  || 0;
      const gap      = parseFloat(style.columnGap)    || 0;
      const colW     = (gridRect.width - padL * 2 - gap * 7) / 8;
      const vCenterX = window.innerWidth / 2;

      this.wraps.forEach((wrap, i) => {
        const col         = i % 8;
        const cardCenterX = gridRect.left + padL + col * (colW + gap) + colW / 2;

        // stackX > 0  → card must move right to reach center (card is left of center)
        // stackX < 0  → card must move left  to reach center (card is right of center)
        wrap._stackX   = vCenterX - cardCenterX;
        wrap._stackRot = DECK_ROT[col];
        wrap._stackY   = DECK_Y[col];
      });

      this.ready = true;
    }

    // ── Drive all rows on every scroll tick ──────────────────────────────────
    _update() {
      if (!this.ready) return;
      const viewH = window.innerHeight;

      this.rows.forEach(row => {
        const p = this._rowProgress(row[0], viewH);
        this._applyRow(row, p);
      });
    }

    // ── Scroll progress for a single row: 0 = stacked, 1 = fully spread ─────
    // Starts when the row's vertical center crosses the viewport bottom edge.
    // Completes when the row's vertical center reaches 50% up the viewport.
    _rowProgress(firstWrap, viewH) {
      const rect    = firstWrap.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      // (viewH - centerY) / (viewH * 0.5)
      //   = 0 when centerY == viewH  (row just entering from below)
      //   = 1 when centerY == viewH/2 (row at mid-screen)
      const p = (viewH - centerY) / (viewH * 0.5);
      return Math.max(0, Math.min(1, p));
    }

    // ── Apply transforms for all 8 cards at the given progress value ─────────
    _applyRow(row, p) {
      const ep = 1 - Math.pow(1 - p, 3); // ease-out cubic

      row.forEach(wrap => {
        gsap.set(wrap, {
          x:        wrap._stackX   * (1 - ep),
          y:        wrap._stackY   * (1 - ep),
          rotation: wrap._stackRot * (1 - ep),
        });
      });
    }
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────
  function init() {
    const gallery = new PolaroidGallery();
    if (gallery.grid) gallery.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
