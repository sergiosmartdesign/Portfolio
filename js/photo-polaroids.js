/**
 * photo-polaroids.js  –  V3
 * Scroll-driven polaroid card gallery for the #photo section.
 *
 * Architecture: alternating SCROLL ↔ BUILD phases
 *
 *   SCROLL_0  →  BUILD row 0  →  SCROLL_1  →  BUILD row 1  →  …  →  BUILD row 6
 *
 * SCROLL phase N:
 *   The overlay and all settled rows translate upward together.
 *   No card animation happens.
 *   Displacement for phase 0 = (winH − activeRowY)  ← clears initial space
 *   Displacement for phase N≥1 = rowHeight           ← shifts one row up
 *
 * BUILD phase for row N:
 *   Overlay and rows are frozen.
 *   Cards enter one-by-one driven by scroll (0.15 rawProgress each).
 *
 * Per-card animation (localT 0 → 1):
 *   0.0 → 0.5  RISE   ease-out cubic, vertical: off-screen bottom → shutterY
 *   0.5 → 1.0  SETTLE ease-in-out cubic, diagonal: shutterY → (finalX, activeRowY)
 *   ≥ 1.0      PLACED tracks _rowY(row, p) — shifts up in later SCROLL phases
 *
 * Position anchors:
 *   activeRowY = winH × 0.60 − cardH/2   (row settles here; above camera)
 *   shutterY   = winH × 0.80 − cardH/2   (ejection point inside camera)
 *
 * No-overlap guarantee:
 *   After SCROLL_0, overlay bottom = winH − scrollDisp_0 = activeRowY exactly.
 *   First card settles at activeRowY → touches but never overlaps overlay.
 */

(function () {
  'use strict';

  /* ── Constants ────────────────────────────────────────────────────────────── */
  var TOTAL_CARDS   = 50;
  var CARDS_PER_ROW = 8;
  var TOTAL_ROWS    = Math.ceil(TOTAL_CARDS / CARDS_PER_ROW); // 7
  var PHASE_START   = 3.0;   // rawProgress when polaroid phase begins
  var PER_CARD      = 0.15;  // rawProgress units dedicated to each card

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
    this.centerX         = 0;
    this.shutterY        = 0;
    this.activeRowY      = 0;
    this.rowHeight       = 0;
    this.phases          = []; // phase table, one entry per row
    this.lastRawProgress = -999;
    this.rafId           = null;

    this._build();
  }

  PolaroidGridManager.prototype._build = function () {
    var container = document.createElement('div');
    container.className = 'photo-polaroid-grid';
    container.setAttribute('aria-hidden', 'true');
    this.photoSection.appendChild(container);
    this.container = container;

    for (var i = 0; i < TOTAL_CARDS; i++) {
      var card = document.createElement('div');
      card.className = 'polaroid-card';
      container.appendChild(card);
      this.cards.push(card);
    }

    this._updateDimensions(); // also calls _computePhases + _setSpacerHeight
    this._initCardPositions();

    var self = this;
    window.addEventListener('resize', function () { self._onResize(); }, { passive: true });
    window.addEventListener('scroll', function () { self._onScroll(); }, { passive: true });
    this._onScroll();
  };

  /* ── Dimensions ───────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._updateDimensions = function () {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    this.cardW  = this.winW * 0.11;
    this.cardH  = this.cardW * (43 / 35);      // true Polaroid 600 ratio
    this.colGap = this.winW * 0.005;
    this.rowGap = this.winH * 0.015;
    this.rowHeight = this.cardH + this.rowGap;

    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].style.width = this.cardW + 'px';
    }

    var totalRowW  = CARDS_PER_ROW * this.cardW + (CARDS_PER_ROW - 1) * this.colGap;
    this.rowStartX = (this.winW - totalRowW) / 2;
    this.centerX   = this.winW / 2 - this.cardW / 2;

    /* Row settles here: card top at 60 % from top of viewport (above camera) */
    this.activeRowY = this.winH * 0.60 - this.cardH / 2;

    /* Ejection point: card top at 80 % (overlapping camera opening) */
    this.shutterY   = this.winH * 0.80 - this.cardH / 2;

    this._computePhases();
  };

  /* ── Phase table ──────────────────────────────────────────────────────────── */
  /**
   * phases[row] = {
   *   scrollStart  : p-value (relative to PHASE_START) where SCROLL phase begins
   *   scrollDur    : rawProgress units consumed by SCROLL phase
   *   scrollDisp   : pixels the overlay moves upward during SCROLL phase
   *   buildStart   : p-value where this row's BUILD phase begins
   *   buildEnd     : p-value where this row's BUILD phase ends
   * }
   */
  PolaroidGridManager.prototype._computePhases = function () {
    this.phases = [];
    var p = 0;

    for (var row = 0; row < TOTAL_ROWS; row++) {
      var cardsInRow = (row === TOTAL_ROWS - 1)
        ? (TOTAL_CARDS - (TOTAL_ROWS - 1) * CARDS_PER_ROW)
        : CARDS_PER_ROW;

      /* SCROLL phase displacement & duration */
      var scrollDisp = (row === 0)
        ? this.winH - this.activeRowY   // initial clearance: push overlay up to activeRowY
        : this.rowHeight;               // subsequent: shift settled rows up by one row

      var scrollDur  = scrollDisp / this.winH; // 1 rawProgress ≡ 1 vh ≡ 100 px (at winH px)
      var buildDur   = cardsInRow * PER_CARD;

      this.phases.push({
        scrollStart : p,
        scrollDur   : scrollDur,
        scrollDisp  : scrollDisp,
        buildStart  : p + scrollDur,
        buildEnd    : p + scrollDur + buildDur
      });

      p += scrollDur + buildDur;
    }

    /* Dynamic spacer height */
    var totalPhaseP = p;
    var spacerVh = (PHASE_START + totalPhaseP + 1.0) * 100;
    this.photoSpacer.style.height = spacerVh + 'vh';
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
    var spacerTop   = this.photoSpacer.getBoundingClientRect().top;
    var rawProgress = 1 - (spacerTop / this.winH);
    this.lastRawProgress = -999;
    this._update(rawProgress);
  };

  /* ── Scroll handling ──────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._onScroll = function () {
    var spacerTop   = this.photoSpacer.getBoundingClientRect().top;
    var rawProgress = 1 - (spacerTop / this.winH);
    if (Math.abs(rawProgress - this.lastRawProgress) < 0.00005) return;
    this.lastRawProgress = rawProgress;
    var self = this;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(function () { self._update(rawProgress); });
  };

  /* ── Overlay offset (cumulative upward translation in px) ─────────────────── */
  PolaroidGridManager.prototype._overlayOffset = function (p) {
    var offset = 0;
    for (var i = 0; i < this.phases.length; i++) {
      var ph = this.phases[i];
      var t  = Math.max(0, Math.min(1, (p - ph.scrollStart) / ph.scrollDur));
      offset += ph.scrollDisp * t;
    }
    return offset;
  };

  /* ── Row Y position (activeRowY, shifts up with each subsequent SCROLL phase) */
  PolaroidGridManager.prototype._rowY = function (row, p) {
    var y = this.activeRowY;
    /* Each SCROLL phase k > row shifts this row up by one rowHeight */
    for (var k = row + 1; k < TOTAL_ROWS; k++) {
      var ph = this.phases[k];
      var t  = Math.max(0, Math.min(1, (p - ph.scrollStart) / ph.scrollDur));
      y -= this.rowHeight * t;
    }
    return y;
  };

  /* Row start x is centred for the last (partial) row, normal for full rows */
  PolaroidGridManager.prototype._rowStartXForRow = function (row, cardsInRow) {
    if (cardsInRow === CARDS_PER_ROW) return this.rowStartX;
    var partialWidth = cardsInRow * this.cardW + (cardsInRow - 1) * this.colGap;
    return (this.winW - partialWidth) / 2;
  };

  /* ── Main update ──────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._update = function (rawProgress) {
    var p = rawProgress - PHASE_START;

    /* Camera: stays at bottom throughout the polaroid phase */
    if (this.camera) {
      if (rawProgress >= PHASE_START) {
        this.camera.classList.add('polaroid-active');
      } else {
        this.camera.classList.remove('polaroid-active');
      }
    }

    /* Overlay: translate upward in sync with SCROLL phases */
    if (this.overlay) {
      if (p > 0) {
        var offset = this._overlayOffset(p);
        this.overlay.style.transform = 'translateY(' + (-offset) + 'px)';
      } else {
        this.overlay.style.transform = '';
      }
    }

    if (p <= 0) {
      if (p < -0.1) this._parkAllCards();
      return;
    }

    for (var i = 0; i < TOTAL_CARDS; i++) {
      this._updateCard(i, p);
    }
  };

  /* ── Per-card update ──────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._updateCard = function (i, p) {
    var card = this.cards[i];
    var row  = Math.floor(i / CARDS_PER_ROW);
    var col  = i % CARDS_PER_ROW;

    var cardsInRow = (row === TOTAL_ROWS - 1)
      ? (TOTAL_CARDS - (TOTAL_ROWS - 1) * CARDS_PER_ROW)
      : CARDS_PER_ROW;

    /* Card's personal window within the BUILD phase for its row */
    var cardStart = this.phases[row].buildStart + col * PER_CARD;
    var localT    = (p - cardStart) / PER_CARD;

    /* Park below viewport until card's moment arrives */
    if (localT < 0) {
      card.style.opacity   = '0';
      card.style.transform = 'translate(' + this.centerX + 'px,' +
        (this.winH + this.cardH + 40) + 'px)';
      card.classList.remove('at-shutter');
      return;
    }

    localT = Math.min(localT, 1);

    var finalRowStartX = this._rowStartXForRow(row, cardsInRow);
    var finalX         = finalRowStartX + col * (this.cardW + this.colGap);
    var finalY         = this._rowY(row, p);

    var x, y, opacity;

    if (localT < 0.5) {
      /* ── RISE: vertical, ease-out cubic, off-screen → shutterY ───────────── */
      var t1  = easeOutCubic(localT / 0.5);
      x       = this.centerX;
      y       = (this.winH + this.cardH + 40) +
                (this.shutterY - (this.winH + this.cardH + 40)) * t1;
      opacity = Math.min(1, t1 * 1.5);
      card.classList.remove('at-shutter');

    } else if (localT < 1) {
      /* ── SETTLE: diagonal up-left, ease-in-out cubic ─────────────────────── */
      var t2  = easeInOutCubic((localT - 0.5) / 0.5);
      x       = this.centerX + (finalX - this.centerX) * t2;
      y       = this.shutterY + (this.activeRowY - this.shutterY) * t2;
      opacity = 1;
      card.classList.toggle('at-shutter', t2 < 0.12);

    } else {
      /* ── PLACED: tracks row's shifting y in later SCROLL phases ───────────── */
      x       = finalX;
      y       = finalY;
      opacity = 1;
      card.classList.remove('at-shutter');
    }

    card.style.opacity   = opacity;
    card.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  };

  /* ── Park all cards below viewport (fast reverse scroll) ─────────────────── */
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
