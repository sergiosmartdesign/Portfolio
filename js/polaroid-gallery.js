/**
 * polaroid-gallery.js
 * Sequential deck-of-cards reveal for the polaroid gallery.
 *
 * Each row of 8 cards animates in two phases driven by .photo-content-scroll
 * scrollTop. Rows are strictly sequential — row N never starts until row N-1
 * has fully settled.
 *
 *   Phase 1  (progress 0 → 0.5) : full deck enters as a unit from below
 *   Phase 2  (progress 0.5 → 1) : deck fans out to final grid positions
 *
 * A dynamic spacer element is appended after .pgallery-grid to extend the
 * scrollable height so that all rows have enough scroll range to animate.
 *
 * Scroll container : .photo-content-scroll  (overflow-y:auto inside #photo)
 * Depends on       : gsap.min.js  (loaded before this file)
 */

(function () {
  'use strict';

  // Per-column deck state, index 0 = leftmost card, 7 = rightmost
  const DECK_ROT = [-8, -5, -3, -1, 1, 3, 5, 8]; // tilt in degrees
  const DECK_Y   = [ 8,  5,  2,  0, 0, 2, 5, 8]; // vertical stagger in pile (px)

  // Scroll pixels allocated to each row's full animation (enter + spread)
  const ROW_SCROLL = 600; // 300 px enter  +  300 px spread

  class PolaroidGallery {
    constructor() {
      this.scroller = document.querySelector('.photo-content-scroll');
      this.grid     = document.querySelector('.pgallery-grid');
      if (!this.scroller || !this.grid) return;

      this.wraps          = [...this.grid.querySelectorAll('.pgallery-wrap')];
      this.rows           = [];
      this.rowActivations = []; // scrollTop at which each row starts animating
      this.spacer         = null;
      this.ready          = false;
    }

    init() {
      for (let i = 0; i < this.wraps.length; i += 8) {
        this.rows.push(this.wraps.slice(i, i + 8));
      }

      this._compute();
      this._ensureSpacer();
      this._update();

      this.scroller.addEventListener('scroll', () => this._update(), { passive: true });
      window.addEventListener('resize', () => {
        this._compute();
        this._ensureSpacer();
        this._update();
      }, { passive: true });
    }

    // ── Per-card offsets + sequential activation scroll positions ─────────────
    // Uses grid geometry only — no transforms need to be cleared before calling.
    _compute() {
      const gridRect     = this.grid.getBoundingClientRect();
      const scrollerRect = this.scroller.getBoundingClientRect();
      const style        = getComputedStyle(this.grid);
      const padL         = parseFloat(style.paddingLeft) || 0;
      const gap          = parseFloat(style.columnGap)   || 0;
      const colW         = (gridRect.width - padL * 2 - gap * 7) / 8;
      const vCenterX     = window.innerWidth / 2;

      // How far each card must travel horizontally to reach viewport center
      this.wraps.forEach((wrap, i) => {
        const col         = i % 8;
        const cardCenterX = gridRect.left + padL + col * (colW + gap) + colW / 2;
        wrap._stackX   = vCenterX - cardCenterX; // + = card is left of center
        wrap._stackRot = DECK_ROT[col];
        wrap._stackY   = DECK_Y[col];
      });

      // scrollTop at which the grid's top edge first enters the visible scroll area
      const gridTopInContent = gridRect.top - scrollerRect.top + this.scroller.scrollTop;
      const activation0      = Math.max(0, gridTopInContent - this.scroller.clientHeight);

      // Each row's entry phase overlaps the previous row's spread phase,
      // so the next deck is already staged the moment the current row settles.
      this.rowActivations = this.rows.map((_, i) => activation0 + i * (ROW_SCROLL / 2));

      this.ready = true;
    }

    // ── Append / resize a spacer so all rows have enough scroll range ─────────
    _ensureSpacer() {
      if (!this.spacer) {
        this.spacer = document.createElement('div');
        this.spacer.setAttribute('aria-hidden', 'true');
        this.grid.after(this.spacer);
      }

      // Reset to 0 first so the current scrollHeight excludes old spacer height
      this.spacer.style.height = '0px';

      // We need scrollTop to be able to reach the end of the last row's animation
      const needed    = this.rowActivations[this.rows.length - 1] + ROW_SCROLL;
      const maxScroll = this.scroller.scrollHeight - this.scroller.clientHeight;
      const extra     = Math.max(0, needed - maxScroll);
      this.spacer.style.height = extra + 'px';
    }

    // ── Drive all rows on every scroll tick ───────────────────────────────────
    _update() {
      if (!this.ready) return;
      const st    = this.scroller.scrollTop;
      const viewH = window.innerHeight;

      this.rows.forEach((row, i) => {
        const p = Math.max(0, Math.min(1, (st - this.rowActivations[i]) / ROW_SCROLL));
        this._applyRow(row, p, viewH);
      });
    }

    // ── Two-phase transform for one row ───────────────────────────────────────
    _applyRow(row, p, viewH) {
      if (p <= 0.5) {
        // ── Phase 1: deck enters as a unit from below the viewport ────────────
        const ep = easeOut(p / 0.5);           // 0 → 1  as  p goes 0 → 0.5
        row.forEach(wrap => {
          gsap.set(wrap, {
            x:        wrap._stackX,             // stays centred on X axis
            y:        viewH * (1 - ep) + wrap._stackY, // slides up from below
            rotation: wrap._stackRot,           // deck tilt unchanged
            scale:    0.85 + 0.15 * ep,         // grows from 0.85 → 1.0
          });
        });
      } else {
        // ── Phase 2: deck fans out to final grid positions ────────────────────
        const ep = easeOut((p - 0.5) / 0.5);   // 0 → 1  as  p goes 0.5 → 1
        row.forEach(wrap => {
          gsap.set(wrap, {
            x:        wrap._stackX   * (1 - ep), // fans left / right
            y:        wrap._stackY   * (1 - ep), // pile stagger fades to 0
            rotation: wrap._stackRot * (1 - ep), // straightens out
            scale:    1,
          });
        });
      }
    }
  }

  // ── Ease helper ──────────────────────────────────────────────────────────
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
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
