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
 *              Placed cards are clickable → expand to fill viewport.
 *
 * Expand/collapse:
 *   Clicking a placed card reparents it to #photo (escapes grid's stacking
 *   context + overflow:hidden), scales it to 72 vh tall centered on screen.
 *   A dark backdrop (z:8) appears behind it; an amber [X] button (z:16) closes.
 *   ESC and backdrop-click also close.  Scroll continues during expand.
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
    this.phases          = [];
    this.lastRawProgress = -999;
    this.rafId           = null;

    /* Expand state */
    this.expandedIndex = -1;
    this.expandedCard  = null;
    this.backdrop      = null;
    this.closeBtn      = null;

    this._build();
  }

  PolaroidGridManager.prototype._build = function () {
    /* Grid container */
    var container = document.createElement('div');
    container.className = 'photo-polaroid-grid';
    container.setAttribute('aria-hidden', 'true');
    this.photoSection.appendChild(container);
    this.container = container;

    /* 50 card elements */
    var self = this;
    for (var i = 0; i < TOTAL_CARDS; i++) {
      var card = document.createElement('div');
      card.className = 'polaroid-card';
      container.appendChild(card);
      this.cards.push(card);

      /* Four CSS glitch layers — hover-animated via polar-gl-1/2/3/4 keyframes.
         Must be appended before the click IIFE so nth-child indices are stable. */
      for (var g = 0; g < 4; g++) {
        var glDiv = document.createElement('div');
        glDiv.className = 'polaroid-gl';
        card.appendChild(glDiv);
      }

      /* Click handler — closure captures index */
      (function (idx) {
        self.cards[idx].addEventListener('click', function () {
          self._expandCard(idx);
        });
      })(i);
    }

    /* Backdrop (appended to #photo, outside grid stacking context) */
    var backdrop = document.createElement('div');
    backdrop.className = 'polaroid-expand-backdrop';
    this.photoSection.appendChild(backdrop);
    this.backdrop = backdrop;
    backdrop.addEventListener('click', function () { self._collapseCard(); });

    /* Close button */
    var closeBtn = document.createElement('button');
    closeBtn.className = 'polaroid-expand-close';
    closeBtn.setAttribute('aria-label', 'Close enlarged polaroid');
    closeBtn.textContent = '[ \u00b7 X \u00b7 ]';
    this.photoSection.appendChild(closeBtn);
    this.closeBtn = closeBtn;
    closeBtn.addEventListener('click', function () { self._collapseCard(); });

    /* ESC key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.expandedIndex >= 0) self._collapseCard();
    });

    this._updateDimensions();
    this._initCardPositions();

    window.addEventListener('resize', function () { self._onResize(); }, { passive: true });
    window.addEventListener('scroll', function () { self._onScroll(); }, { passive: true });
    this._onScroll();
  };

  /* ── Dimensions ───────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._updateDimensions = function () {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    this.cardW  = this.winW * 0.11;
    this.cardH  = this.cardW * (43 / 35);
    this.colGap = this.winW * 0.005;
    this.rowGap = this.winH * 0.015;
    this.rowHeight = this.cardH + this.rowGap;

    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].style.width = this.cardW + 'px';
    }

    var totalRowW  = CARDS_PER_ROW * this.cardW + (CARDS_PER_ROW - 1) * this.colGap;
    this.rowStartX = (this.winW - totalRowW) / 2;
    this.centerX   = this.winW / 2 - this.cardW / 2;

    this.activeRowY = this.winH * 0.60 - this.cardH / 2;
    this.shutterY   = this.winH * 0.80 - this.cardH / 2;

    this._computePhases();
  };

  /* ── Phase table ──────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._computePhases = function () {
    this.phases = [];
    var p = 0;

    for (var row = 0; row < TOTAL_ROWS; row++) {
      var cardsInRow = (row === TOTAL_ROWS - 1)
        ? (TOTAL_CARDS - (TOTAL_ROWS - 1) * CARDS_PER_ROW)
        : CARDS_PER_ROW;

      var scrollDisp = (row === 0)
        ? this.winH - this.activeRowY
        : this.rowHeight;

      var scrollDur = scrollDisp / this.winH;
      var buildDur  = cardsInRow * PER_CARD;

      this.phases.push({
        scrollStart : p,
        scrollDur   : scrollDur,
        scrollDisp  : scrollDisp,
        buildStart  : p + scrollDur,
        buildEnd    : p + scrollDur + buildDur
      });

      p += scrollDur + buildDur;
    }

    var spacerVh = (PHASE_START + p + 1.0) * 100;
    this.photoSpacer.style.height = spacerVh + 'vh';
  };

  PolaroidGridManager.prototype._initCardPositions = function () {
    var offY = this.winH + this.cardH + 40;
    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].style.transform    = 'translate(' + this.centerX + 'px,' + offY + 'px)';
      this.cards[i].style.opacity      = '0';
      this.cards[i].style.pointerEvents = '';
      this.cards[i].style.cursor       = '';
    }
  };

  PolaroidGridManager.prototype._onResize = function () {
    /* Close expand without animation on resize to avoid stale dimensions */
    if (this.expandedIndex >= 0) {
      var card = this.expandedCard;
      card.style.transition    = '';
      card.style.zIndex        = '';
      card.style.pointerEvents = '';
      card.style.cursor        = '';
      this.container.appendChild(card);
      this.backdrop.classList.remove('active');
      this.closeBtn.classList.remove('active');
      this.expandedCard  = null;
      this.expandedIndex = -1;
    }

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

  /* ── Overlay offset ───────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._overlayOffset = function (p) {
    var offset = 0;
    for (var i = 0; i < this.phases.length; i++) {
      var ph = this.phases[i];
      var t  = Math.max(0, Math.min(1, (p - ph.scrollStart) / ph.scrollDur));
      offset += ph.scrollDisp * t;
    }
    return offset;
  };

  /* ── Row Y position ───────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._rowY = function (row, p) {
    var y = this.activeRowY;
    for (var k = row + 1; k < TOTAL_ROWS; k++) {
      var ph = this.phases[k];
      var t  = Math.max(0, Math.min(1, (p - ph.scrollStart) / ph.scrollDur));
      y -= this.rowHeight * t;
    }
    return y;
  };

  PolaroidGridManager.prototype._rowStartXForRow = function (row, cardsInRow) {
    if (cardsInRow === CARDS_PER_ROW) return this.rowStartX;
    var partialWidth = cardsInRow * this.cardW + (cardsInRow - 1) * this.colGap;
    return (this.winW - partialWidth) / 2;
  };

  /* ── Main update ──────────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._update = function (rawProgress) {
    var p = rawProgress - PHASE_START;

    if (this.camera) {
      if (rawProgress >= PHASE_START) {
        this.camera.classList.add('polaroid-active');
      } else {
        this.camera.classList.remove('polaroid-active');
      }
    }

    if (this.overlay) {
      if (p > 0) {
        var offset = this._overlayOffset(p);
        this.overlay.style.transform = 'translateY(' + (-offset) + 'px)';
      } else {
        this.overlay.style.transform = '';
      }
    }

    if (p <= 0) {
      if (p < -0.1) {
        if (this.expandedIndex >= 0) this._collapseCard();
        this._parkAllCards();
      }
      return;
    }

    for (var i = 0; i < TOTAL_CARDS; i++) {
      this._updateCard(i, p);
    }
  };

  /* ── Per-card update ──────────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._updateCard = function (i, p) {
    /* Expanded card is managed entirely by expand/collapse — skip JS updates */
    if (i === this.expandedIndex) return;

    var card = this.cards[i];
    var row  = Math.floor(i / CARDS_PER_ROW);
    var col  = i % CARDS_PER_ROW;

    var cardsInRow = (row === TOTAL_ROWS - 1)
      ? (TOTAL_CARDS - (TOTAL_ROWS - 1) * CARDS_PER_ROW)
      : CARDS_PER_ROW;

    var cardStart = this.phases[row].buildStart + col * PER_CARD;
    var localT    = (p - cardStart) / PER_CARD;

    /* Not yet visible — reset ejection flag so it re-fires on forward scroll */
    if (localT < 0) {
      card.style.opacity       = '0';
      card.style.pointerEvents = '';
      card.style.cursor        = '';
      card.style.transform     = 'translate(' + this.centerX + 'px,' +
        (this.winH + this.cardH + 40) + 'px)';
      card.classList.remove('at-shutter');
      card.classList.remove('polaroid-eject-anim');
      delete card.dataset.ejected;
      return;
    }

    localT = Math.min(localT, 1);

    var finalRowStartX = this._rowStartXForRow(row, cardsInRow);
    var finalX         = finalRowStartX + col * (this.cardW + this.colGap);
    var finalY         = this._rowY(row, p);

    var x, y, opacity;

    if (localT < 0.5) {
      /* RISE */
      var t1  = easeOutCubic(localT / 0.5);
      x       = this.centerX;
      y       = (this.winH + this.cardH + 40) +
                (this.shutterY - (this.winH + this.cardH + 40)) * t1;
      opacity = Math.min(1, t1 * 1.5);
      card.style.pointerEvents = '';
      card.style.cursor        = '';
      card.classList.remove('at-shutter');

    } else if (localT < 1) {
      /* SETTLE */
      var t2  = easeInOutCubic((localT - 0.5) / 0.5);
      x       = this.centerX + (finalX - this.centerX) * t2;
      y       = this.shutterY + (this.activeRowY - this.shutterY) * t2;
      opacity = 1;
      card.style.pointerEvents = '';
      card.style.cursor        = '';
      card.classList.toggle('at-shutter', t2 < 0.12);

    } else {
      /* PLACED — clickable; fire ejection bobble once on arrival */
      x       = finalX;
      y       = finalY;
      opacity = 1;
      card.style.pointerEvents = 'auto';
      card.style.cursor        = 'pointer';
      card.classList.remove('at-shutter');

      if (!card.dataset.ejected) {
        card.dataset.ejected = '1';
        card.classList.remove('polaroid-eject-anim');
        void card.offsetWidth;
        card.classList.add('polaroid-eject-anim');
        /* Camera recoil in sync with card ejection */
        if (this.camera) {
          this.camera.classList.remove('camera-eject-anim');
          void this.camera.offsetWidth;
          this.camera.classList.add('camera-eject-anim');
          this.camera.addEventListener('animationend', function onEnd() {
            this.classList.remove('camera-eject-anim');
            this.removeEventListener('animationend', onEnd);
          });
        }
      }
    }

    card.style.opacity   = opacity;
    card.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  };

  /* ── Expand a placed card ─────────────────────────────────────────────────── */
  PolaroidGridManager.prototype._expandCard = function (index) {
    /* Guard: only expand placed cards */
    if (this.cards[index].style.pointerEvents !== 'auto') return;
    /* Guard: don't expand if another is already expanded */
    if (this.expandedIndex >= 0) return;

    var card = this.cards[index];
    var self = this;

    this.expandedIndex = index;
    this.expandedCard  = card;

    /* Capture current transform before reparenting */
    var currentTransform = card.style.transform;

    /* Move card to #photo root — escapes grid's z-index stacking context
       and overflow:hidden.  Coordinate space is identical (both start 0,0). */
    this.photoSection.appendChild(card);
    card.style.transform    = currentTransform;
    card.style.zIndex       = '12';
    card.style.pointerEvents = 'none'; /* disable during flight */
    card.style.cursor       = '';

    /* Show backdrop */
    this.backdrop.classList.add('active');
    this.closeBtn.classList.add('active');

    /* Double rAF ensures transition fires after reparent paint */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var scale = (self.winH * 0.72) / self.cardH;
        var cx    = self.winW / 2 - self.cardW / 2;
        var cy    = self.winH / 2 - self.cardH / 2;
        card.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform  = 'translate(' + cx + 'px,' + cy + 'px) scale(' + scale + ')';
      });
    });
  };

  /* ── Collapse expanded card back to grid ──────────────────────────────────── */
  PolaroidGridManager.prototype._collapseCard = function () {
    if (this.expandedIndex < 0) return;

    var card  = this.expandedCard;
    var index = this.expandedIndex;
    var self  = this;

    /* Compute current correct grid position */
    var row        = Math.floor(index / CARDS_PER_ROW);
    var col        = index % CARDS_PER_ROW;
    var cardsInRow = (row === TOTAL_ROWS - 1)
      ? (TOTAL_CARDS - (TOTAL_ROWS - 1) * CARDS_PER_ROW)
      : CARDS_PER_ROW;
    var finalX = this._rowStartXForRow(row, cardsInRow) + col * (this.cardW + this.colGap);
    var finalY = this._rowY(row, this.lastRawProgress - PHASE_START);

    /* Hide UI immediately */
    this.backdrop.classList.remove('active');
    this.closeBtn.classList.remove('active');

    /* Animate card back to its grid slot */
    card.style.transition = 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.transform  = 'translate(' + finalX + 'px,' + finalY + 'px)';

    /* After animation: return card to grid, restore state */
    setTimeout(function () {
      card.style.transition    = '';
      card.style.zIndex        = '';
      card.style.pointerEvents = 'auto';
      card.style.cursor        = 'pointer';
      self.container.appendChild(card);
      self.expandedCard  = null;
      self.expandedIndex = -1;
    }, 400);
  };

  /* ── Park all cards below viewport ───────────────────────────────────────── */
  PolaroidGridManager.prototype._parkAllCards = function () {
    var offY = this.winH + this.cardH + 40;
    for (var i = 0; i < this.cards.length; i++) {
      if (i === this.expandedIndex) continue; /* managed by collapse */
      this.cards[i].style.opacity       = '0';
      this.cards[i].style.pointerEvents = '';
      this.cards[i].style.cursor        = '';
      this.cards[i].style.transform     = 'translate(' + this.centerX + 'px,' + offY + 'px)';
      this.cards[i].classList.remove('at-shutter');
      this.cards[i].classList.remove('polaroid-eject-anim');
      delete this.cards[i].dataset.ejected;
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
