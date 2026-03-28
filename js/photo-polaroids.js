/**
 * photo-polaroids.js
 * Scroll-driven polaroid card gallery for the #photo section.
 *
 * rawProgress phase map (extends photo-portfolio.js phases 0–3):
 *   Phase 3 → 10: 50 border-only polaroid cards animate in 7 rows of 8
 *                 (last row has 2 cards: 50 − 6×8 = 2)
 *
 * Per-row scroll budget: 1.0 rawProgress unit (= 100 vh of scroll)
 *   0.0 → 0.8: 8 cards build in succession (each card = 0.1 units)
 *   0.8 → 1.0: completed rows shift up to make room for the next row
 *
 * Per-card animation (localT 0 → 1):
 *   0.0 → 0.5  RISE   — ease-out cubic, vertical only
 *              Card moves from below viewport to "shutter Y" (≈62 % from top)
 *              passing behind the polaroid camera (camera z:4 > card z:3).
 *   0.5 → 1.0  SETTLE — ease-in-out cubic, diagonal up-left
 *              Card moves from shutter position to its column slot in the
 *              active row (≈40 % from top).  After settling, the card's y
 *              tracks rowY(row, p) which shifts upward as later rows build.
 *
 * Camera: gains the .polaroid-active class (keeps it at bottom) whenever
 * rawProgress ≥ 3, independently of the portfolio overlay state.
 *
 * Portfolio overlay: fades out over the first 30 % of polaroid phase so the
 * gallery can use the full viewport.  Fades back in on reverse scroll.
 */

(function () {
  'use strict';

  /* ── Constants ────────────────────────────────────────────────────────────── */
  var TOTAL_CARDS  = 50;
  var CARDS_PER_ROW = 8;
  var TOTAL_ROWS   = Math.ceil(TOTAL_CARDS / CARDS_PER_ROW); // 7
  var PHASE_START  = 3.0;  // rawProgress when polaroid phase begins
  var ROW_PHASE    = 1.5;  // rawProgress units per row (= 150 vh of scroll)
  var BUILD_PHASE  = 1.2;  // rawProgress for building one row (8 × 0.15)
  var SHIFT_PHASE  = 0.3;  // rawProgress for the row-shift transition

  /* ── Easing ───────────────────────────────────────────────────────────────── */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Manager ──────────────────────────────────────────────────────────────── */
  function PolaroidGridManager() {
    this.photoSpacer  = document.querySelector('.photo-scroll-spacer');
    this.photoSection = document.getElementById('photo');
    this.camera       = document.querySelector('.photo-camera-deco');
    this.overlay      = document.querySelector('.photo-portfolio-overlay');

    if (!this.photoSpacer || !this.photoSection) return;

    this.cards           = [];
    this.container       = null;
    this.winW            = 0;
    this.winH            = 0;
    this.cardW           = 0;
    this.cardH           = 0;
    this.colGap          = 0;
    this.rowGap          = 0;
    this.rowStartX       = 0;
    this.centerX         = 0;   // x where card is centered during rise/shutter
    this.shutterY        = 0;   // y (card top) at shutter position (62 % from top)
    this.activeRowY      = 0;   // y (card top) for the actively-building row
    this.lastRawProgress = -999;
    this.rafId           = null;

    this._build();
  }

  PolaroidGridManager.prototype._build = function () {
    /* Container */
    var container = document.createElement('div');
    container.className = 'photo-polaroid-grid';
    container.setAttribute('aria-hidden', 'true');
    this.photoSection.appendChild(container);
    this.container = container;

    /* 50 card elements */
    for (var i = 0; i < TOTAL_CARDS; i++) {
      var card = document.createElement('div');
      card.className = 'polaroid-card';
      container.appendChild(card);
      this.cards.push(card);
    }

    this._updateDimensions();
    /* Start all cards parked below viewport (invisible) */
    this._initCardPositions();

    var self = this;
    window.addEventListener('resize', function () { self._onResize(); }, { passive: true });
    window.addEventListener('scroll', function () { self._onScroll(); }, { passive: true });
    this._onScroll(); // sync to current scroll position on load
  };

  /* ── Dimensions ───────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._updateDimensions = function () {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    /* Card is 11 vw wide; true Polaroid 600 ratio 35:43 */
    this.cardW  = this.winW * 0.11;
    this.cardH  = this.cardW * (43 / 35);
    this.colGap = this.winW * 0.005;
    this.rowGap = this.winH * 0.015;

    /* Apply width to cards (height flows from aspect-ratio CSS) */
    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].style.width = this.cardW + 'px';
    }

    /* Row x start so 8 cards are centred horizontally */
    var totalRowW  = CARDS_PER_ROW * this.cardW + (CARDS_PER_ROW - 1) * this.colGap;
    this.rowStartX = (this.winW - totalRowW) / 2;

    /* Horizontal centre (card's left edge when centred) */
    this.centerX = this.winW / 2 - this.cardW / 2;

    /* Shutter Y: card top at 62 % — overlaps with upper edge of the camera */
    this.shutterY = this.winH * 0.62 - this.cardH / 2;

    /* Active row Y: card top at 38 % — above camera, below header */
    this.activeRowY = this.winH * 0.38 - this.cardH / 2;
  };

  PolaroidGridManager.prototype._initCardPositions = function () {
    var offY = this.winH + this.cardH + 40;
    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].style.transform = 'translate(' + this.centerX + 'px,' + offY + 'px)';
      this.cards[i].style.opacity   = '0';
    }
  };

  PolaroidGridManager.prototype._onResize = function () {
    this._updateDimensions();
    /* Redraw immediately at current scroll position */
    var spacerTop    = this.photoSpacer.getBoundingClientRect().top;
    var rawProgress  = 1 - (spacerTop / this.winH);
    this.lastRawProgress = -999; // force full redraw
    this._update(rawProgress);
  };

  /* ── Scroll handling ──────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._onScroll = function () {
    var spacerTop   = this.photoSpacer.getBoundingClientRect().top;
    var rawProgress = 1 - (spacerTop / this.winH);

    /* Skip if virtually unchanged */
    if (Math.abs(rawProgress - this.lastRawProgress) < 0.00005) return;
    this.lastRawProgress = rawProgress;

    var self = this;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(function () { self._update(rawProgress); });
  };

  /* ── Main update ──────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._update = function (rawProgress) {
    var p = rawProgress - PHASE_START; // polaroid-local progress (0 = phase start)

    /* ── Camera: stays at bottom throughout photo section ─────────────────── */
    if (rawProgress >= PHASE_START && this.camera) {
      this.camera.classList.add('polaroid-active');
    } else if (rawProgress < PHASE_START && this.camera) {
      this.camera.classList.remove('polaroid-active');
    }

    /* ── Portfolio overlay: slide upward as rows accumulate ──────────────── */
    if (this.overlay) {
      if (p > 0) {
        /* Shift matches exactly how far row-0 has moved up.
           This means the overlay stays put while row 1 builds, then rises
           in sync with each subsequent row-shift — accordion open or closed. */
        var overlayShift = this.activeRowY - this._rowY(0, p);
        this.overlay.style.transform = 'translateY(' + (-overlayShift) + 'px)';
      } else {
        /* Back in portfolio phase — let photo-portfolio.js manage opacity;
           reset any transform we applied. */
        this.overlay.style.transform = '';
      }
    }

    /* ── Nothing to do until we reach the polaroid phase ─────────────────── */
    if (p <= 0) {
      /* Ensure all cards are parked if user has scrolled back */
      if (p < -0.1) this._parkAllCards();
      return;
    }

    /* ── Per-card update ─────────────────────────────────────────────────── */
    for (var i = 0; i < TOTAL_CARDS; i++) {
      this._updateCard(i, p);
    }
  };

  /* ── Card position calculation ────────────────────────────────────────────── */
  PolaroidGridManager.prototype._updateCard = function (i, p) {
    var card = this.cards[i];
    var row  = Math.floor(i / CARDS_PER_ROW);
    var col  = i % CARDS_PER_ROW;

    /* Last row only has TOTAL_CARDS − (TOTAL_ROWS − 1) × CARDS_PER_ROW = 2 cards */
    var cardsInRow = (row === TOTAL_ROWS - 1)
      ? (TOTAL_CARDS - (TOTAL_ROWS - 1) * CARDS_PER_ROW)
      : CARDS_PER_ROW;

    /* Phase window for this card within its row's build phase */
    var perCard     = BUILD_PHASE / CARDS_PER_ROW;          // 0.15
    var phaseStart  = row * ROW_PHASE + col * perCard;       // e.g. row1 col3 = 1.3
    var localT      = (p - phaseStart) / perCard;            // 0→1

    /* ── Card not yet visible: park below viewport ─────────────────────── */
    if (localT < 0) {
      card.style.opacity = '0';
      card.style.transform = 'translate(' + this.centerX + 'px,' +
        (this.winH + this.cardH + 40) + 'px)';
      card.classList.remove('at-shutter');
      return;
    }

    localT = Math.min(localT, 1);

    /* Final x position (column slot) */
    var finalRowStartX = this._rowStartXForRow(row, cardsInRow);
    var finalX         = finalRowStartX + col * (this.cardW + this.colGap);

    /* Final y position: shifts upward as subsequent rows are added */
    var finalY = this._rowY(row, p);

    var x, y, opacity;

    if (localT < 0.5) {
      /* ── RISE: vertical, ease-out cubic ───────────────────────────────── */
      var t1   = easeOutCubic(localT / 0.5);
      x        = this.centerX;
      y        = (this.winH + this.cardH + 40) + (this.shutterY - this.winH - this.cardH - 40) * t1;
      opacity  = Math.min(1, t1 * 1.5);

      card.classList.remove('at-shutter');

    } else if (localT < 1) {
      /* ── SETTLE: diagonal up-left, ease-in-out cubic ──────────────────── */
      var t2  = easeInOutCubic((localT - 0.5) / 0.5);
      x       = this.centerX + (finalX - this.centerX) * t2;
      y       = this.shutterY + (this.activeRowY - this.shutterY) * t2;
      opacity = 1;

      /* Shutter glow at the moment the card is centred (t2 ≈ 0) */
      card.classList.toggle('at-shutter', t2 < 0.12);

    } else {
      /* ── PLACED: tracks row's shifting y ──────────────────────────────── */
      x       = finalX;
      y       = finalY;
      opacity = 1;
      card.classList.remove('at-shutter');
    }

    card.style.opacity   = opacity;
    card.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  };

  /* ── Row y-position (shifts upward as later rows start) ───────────────────── */
  PolaroidGridManager.prototype._rowY = function (row, p) {
    var y = this.activeRowY;
    /* For each row k that follows row, contribute a shift when k starts building.
       Row k-1 finishes building at: (k-1)*ROW_PHASE + BUILD_PHASE = k*ROW_PHASE - SHIFT_PHASE */
    for (var k = row + 1; k < TOTAL_ROWS; k++) {
      var shiftStart    = k * ROW_PHASE - SHIFT_PHASE;  // e.g. ROW_PHASE=1.5: k=1→1.2, k=2→2.7
      var shiftProgress = Math.max(0, Math.min(1, (p - shiftStart) / SHIFT_PHASE));
      y -= shiftProgress * (this.cardH + this.rowGap);
    }
    return y;
  };

  /* Row start x is centred for the last (partial) row, normal for full rows */
  PolaroidGridManager.prototype._rowStartXForRow = function (row, cardsInRow) {
    if (cardsInRow === CARDS_PER_ROW) return this.rowStartX;
    var partialWidth = cardsInRow * this.cardW + (cardsInRow - 1) * this.colGap;
    return (this.winW - partialWidth) / 2;
  };

  /* ── Park all cards below viewport (called on fast reverse scroll) ─────────── */
  PolaroidGridManager.prototype._parkAllCards = function () {
    var offY = this.winH + this.cardH + 40;
    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].style.opacity   = '0';
      this.cards[i].style.transform = 'translate(' + this.centerX + 'px,' + offY + 'px)';
      this.cards[i].classList.remove('at-shutter');
    }
  };

  /* ── Init ─────────────────────────────────────────────────────────────────── */
  function init() {
    new PolaroidGridManager();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
