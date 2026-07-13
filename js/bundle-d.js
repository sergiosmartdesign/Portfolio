/* bundle-d.js — concatenated app bundle (load order preserved). Sources in git history. */

;
/* ===== photo-ghost-stream.js ===== */
/**
 * photo-ghost-stream.js — horizontal ghost-image stream, info-strip animation,
 * and per-card lightbox for the #photo section.
 *
 * Exposed as window.Photo.GhostStream.
 * Dependencies: gsap + ScrambleTextPlugin (loaded before this file).
 */
(function () {
  'use strict';

  window.Photo = window.Photo || {};

  class GhostStream {
    constructor(streamEl, cards) {
      this._stream          = streamEl;
      this._streamCards     = cards;
      this._streamRotations = [];
      this._cardHidden      = null;

      this._streamPhase    = 'idle';   // 'idle' | 'active'
      this._masterT        = 0;
      this._streamCanPlay  = false;
      this._streamVelocity = 1;        // +1 forward, -1 reverse
      this._introRaf       = null;
      this._introLastTs    = 0;
      this._introPaused    = false;

      this._infoAnimInterval = null;
      this._streamLbOpen     = false;
      this._streamLbHide     = null;
      this._lbResumePlay     = false;
      this._onCardClick      = null;

      this._cameraEl       = null;
      this._cardLastPhase  = null; // per-card: -1=hidden, 0=entering(t<0.22), 1=visible(t>=0.22)
      this._ejectRafPending = false;
      this._ro             = null; // ResizeObserver: re-aligns stream to camera centre
      this._syncRaf        = null;
    }

    get canPlay()      { return this._streamCanPlay; }
    set canPlay(v)     { this._streamCanPlay = v; }
    set onCardClick(fn){ this._onCardClick = fn; }

    init() {
      this._streamRotations = this._streamCards.map(card =>
        parseFloat(getComputedStyle(card).getPropertyValue('--ghost-rotate').trim()) || 0
      );
      const CARD_SPACING   = 0.22;
      this._cardHidden      = new Array(this._streamCards.length).fill(true);
      this._cardLastPhase   = new Array(this._streamCards.length).fill(-1);
      this._revealThreshold = this._streamCards.map((_, i) => i * CARD_SPACING);
      this._cameraEl        = document.querySelector('.photo-polaroids-camera');
      this._updateStreamWidth();
      this._setupInfoStripClicks();
      this._setupStreamLightbox();
      this._setupCameraSync();
    }

    resize() {
      this._updateStreamWidth();
      this._scheduleSync();
    }

    // Called every scroll tick — owns all stream state transitions.
    tick(rawProgress) {
      if (rawProgress < 2) {
        if (this._streamPhase !== 'idle') this.reset();
        return;
      }
      if (this._streamPhase === 'idle') this._enterStreamIntro();
    }

    pauseRaf() {
      if (this._introRaf && this._streamPhase === 'active') {
        cancelAnimationFrame(this._introRaf);
        this._introRaf    = null;
        this._introPaused = true;
        this._introLastTs = 0;
      }
    }

    resumeRaf() {
      if (this._introPaused && this._streamPhase === 'active') {
        this._introPaused = false;
        this._introRaf = requestAnimationFrame(ts => this._introLoop(ts));
      }
    }

    // Full reset — clears all state, stops RAF, hides cards.
    reset() {
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
      this.stopInfoAnim();
      this._stream?.classList.remove('stream-active');
      this._streamCards.forEach(card => {
        card.style.opacity   = '0';
        card.style.transform = 'translateX(0) translateY(-50%) rotate(-90deg)';
      });
      if (this._cardHidden)    this._cardHidden.fill(true);
      if (this._cardLastPhase) this._cardLastPhase.fill(-1);
      // A full reset must leave the stream stopped — drop any pending
      // lightbox-resume so _streamLbHide doesn't flip canPlay back on.
      this._lbResumePlay = false;
      if (this._streamLbOpen) this._streamLbHide?.();
    }

    // Partial deactivation — stops info anim and removes the active CSS class
    // without fully resetting stream state. Used by _cancelChain when the
    // scroll tick will complete the reset on the next frame.
    deactivate() {
      this.stopInfoAnim();
      this._stream?.classList.remove('stream-active');
    }

    // Nav arrows are now inline bracketed-chevron SVGs that pulse via CSS
    // (.pgnav-chev), so the old textContent cascade is no longer needed —
    // writing textContent here would wipe the SVGs. Kept as no-ops so callers
    // in activate()/deactivate() stay valid.
    startInfoAnim() {}

    stopInfoAnim() {
      if (this._infoAnimInterval) {
        clearTimeout(this._infoAnimInterval);
        this._infoAnimInterval = null;
      }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _ejectBounce() {
      if (!this._cameraEl || this._ejectRafPending) return;
      // Batch into a single rAF so multiple same-frame crossings don't stack
      this._ejectRafPending = true;
      requestAnimationFrame(() => {
        this._ejectRafPending = false;
        if (!this._cameraEl) return;
        this._cameraEl.classList.remove('camera-eject');
        void this._cameraEl.offsetWidth;
        this._cameraEl.classList.add('camera-eject');
      });
    }

    _updateStreamWidth() {
      if (this._stream) {
        this._stream.style.setProperty('--ghost-stream-w', this._stream.offsetWidth + 'px');
      }
    }

    // ── Vertical alignment to the camera ──────────────────────────────────────
    // The stream is absolutely positioned inside .photo-col-left; the camera
    // image lives in that column's normal flow. Their centres are anchored to
    // different reference frames (top-down flow vs. bottom of column), so they
    // drift apart whenever the section reflows. We lock them together by
    // measuring the camera's rendered centre and exposing it as --cam-center-y.

    // Nearest positioned ancestor — the containing block for the stream's `top`.
    _streamRef() {
      return this._stream && (this._stream.offsetParent || this._stream.parentElement);
    }

    _syncStreamToCamera() {
      const ref = this._streamRef();
      if (!ref || !this._cameraEl) return;
      // getBoundingClientRect is transform-aware → the rotated camera's true
      // rendered centre. Subtracting the column rect cancels scroll/zoom, so
      // the result is resolution-independent.
      const cam = this._cameraEl.getBoundingClientRect();
      const box = ref.getBoundingClientRect();
      const centerY = (cam.top + cam.height / 2) - box.top;
      this._stream.style.setProperty('--cam-center-y', centerY.toFixed(2) + 'px');
    }

    // Coalesce bursts of layout changes into a single post-layout measurement.
    _scheduleSync() {
      if (this._syncRaf) return;
      this._syncRaf = requestAnimationFrame(() => {
        this._syncRaf = null;
        this._syncStreamToCamera();
      });
    }

    _setupCameraSync() {
      // ResizeObserver catches everything a resize event misses: content/locale
      // reflow growing the column, the camera image loading, % width changes.
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => this._scheduleSync());
        const ref = this._streamRef();
        if (ref)            this._ro.observe(ref);
        if (this._cameraEl) this._ro.observe(this._cameraEl);
      }
      // First accurate measure once the camera image knows its intrinsic height.
      if (this._cameraEl && !this._cameraEl.complete) {
        this._cameraEl.addEventListener('load', () => this._scheduleSync(), { once: true });
      }
      // Web-font swap reflows the description paragraph → column height shifts.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleSync());
      }
      this._scheduleSync();
    }

    _setupInfoStripClicks() {
      const infoLeft  = document.querySelector('.pgallery-info-left');
      const infoRight = document.querySelector('.pgallery-info-right');
      if (infoLeft)  infoLeft.addEventListener('click',  () => { this._streamVelocity = this._streamVelocity === -1 ? 1 : -1; });
      if (infoRight) infoRight.addEventListener('click', () => { this._streamVelocity = this._streamVelocity ===  1 ? -1 : 1; });
    }

    _enterStreamIntro() {
      this._streamPhase    = 'active';
      this._masterT        = 0;
      this._introLastTs    = 0;
      this._streamCanPlay  = false;
      this._streamVelocity = 1;
      this._stream?.classList.add('stream-active');
      this._introRaf = requestAnimationFrame(ts => this._introLoop(ts));
    }

    _introLoop(timestamp) {
      if (this._streamPhase !== 'active') return;

      const INTRO_SPEED = 0.09; // masterT units/s — ~11 s per crossing

      if (this._streamCanPlay) {
        const dt = this._introLastTs ? Math.min((timestamp - this._introLastTs) / 1000, 0.1) : 0;
        this._introLastTs = timestamp;
        this._masterT += this._streamVelocity * INTRO_SPEED * dt;
        this._renderStream(this._masterT);
      }

      this._introRaf = requestAnimationFrame(ts => this._introLoop(ts));
    }

    // Pure renderer — same function regardless of which driver owns masterT.
    // Uses modulo so the stream loops. _cardHidden cache skips DOM writes for
    // cards that were already hidden last frame (~27 of 30 at any moment).
    _renderStream(masterT) {
      if (!this._stream || !this._streamCards.length) return;

      const N            = this._streamCards.length;
      const CARD_SPACING = 0.22;
      const LOOP_LENGTH  = N * CARD_SPACING;
      const CARD_W       = 156;
      const streamW      = parseFloat(
        this._stream.style.getPropertyValue('--ghost-stream-w')
      ) || 500;

      const phase = ((masterT % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;

      for (let i = 0; i < N; i++) {
        const card   = this._streamCards[i];
        const offset = ((phase - i * CARD_SPACING) % LOOP_LENGTH + LOOP_LENGTH) % LOOP_LENGTH;

        if (offset > 1) {
          if (!this._cardHidden[i]) {
            card.style.opacity   = '0';
            card.style.transform = 'translateX(0) translateY(-50%) rotate(-90deg)';
            this._cardHidden[i]  = true;
          }
          this._cardLastPhase[i] = -1;
          continue;
        }

        // Reveal gate: keep hidden until masterT reaches this card's natural
        // entry time — the exact moment the loop brings it to t=0 (entry phase).
        if (masterT < this._revealThreshold[i]) {
          if (!this._cardHidden[i]) {
            card.style.opacity   = '0';
            card.style.transform = 'translateX(0) translateY(-50%) rotate(-90deg)';
            this._cardHidden[i]  = true;
          }
          this._cardLastPhase[i] = -1;
          continue;
        }

        this._cardHidden[i] = false;
        const t        = offset;
        const finalRot = this._streamRotations[i] || 0;
        let x, rot;

        // Camera bounce on every t=0.22 crossing (entry→rotation or reverse)
        const curPhase    = t < 0.22 ? 0 : 1;
        const phaseChange = this._cardLastPhase[i] !== -1 && this._cardLastPhase[i] !== curPhase;
        if (phaseChange) this._ejectBounce();
        this._cardLastPhase[i] = curPhase;

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

    _setupStreamLightbox() {
      // Real scanned polaroids from the travel archive — the full collection.
      // Cards cycle through the set; clicking opens the same scan in the lightbox.
      const POLAROIDS = [
        'Polaroid Amsterdam',
        'Polaroid Avenida Paulista Sao Paulo',
        'Polaroid Barrio Gotico',
        'Polaroid Cabo de la Vela',
        'Polaroid Capadocia',
        'Polaroid Cartagena',
        'Polaroid Catania Sicilia',
        'Polaroid Chichen Itza',
        'Polaroid Coliseo Roma',
        'Polaroid Cudillero',
        'Polaroid El Cocuy Boyaca',
        'Polaroid Guggenheim Bilbao',
        'Polaroid Guggenheim Bilbao Atardecer',
        'Polaroid La Habana',
        'Polaroid Leiden',
        'Polaroid Los Andes Bolivia',
        'Polaroid Madrid Cibeles',
        'Polaroid Milan Duomo',
        'Polaroid Moulin Rouge Paris',
        'Polaroid Palacio de Schonbrunn',
        'Polaroid Ponte Vecchio Florencia',
        'Polaroid Puerta de Brandenburgo',
        'Polaroid San Sebastian Ayuntamiento',
        'Polaroid San Sebastian Isla Santa Clara',
      ];
      const POL_DIR = 'images/photo/Polaroids/';
      this._streamCards.forEach((card, i) => {
        const name = POLAROIDS[i % POLAROIDS.length];
        card.dataset.image = `${POL_DIR}${name}.webp`;
        card.style.backgroundImage    = `url("${POL_DIR}${name}.webp")`;
        card.style.backgroundSize     = 'cover';
        card.style.backgroundPosition = 'center';
        card.dataset.alt = name.replace(/^Polaroid /, '');
      });

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
        // Freeze the stream while the lightbox is open; remember whether it was
        // playing so hide() only resumes what was actually running.
        this._lbResumePlay  = this._streamCanPlay;
        this._streamCanPlay = false;
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
        // Resume the stream exactly where it froze. Resetting the RAF timestamp
        // keeps the first post-resume dt from including the paused time.
        if (this._lbResumePlay) {
          this._introLastTs   = 0;
          this._streamCanPlay = true;
        }
        this._lbResumePlay = false;
        document.body.style.overflow = '';
        setTimeout(() => { if (!this._streamLbOpen) lbImg.src = ''; }, 500);
      };

      // Any click anywhere inside the lightbox (image included) closes it.
      lb.addEventListener('click', () => this._streamLbHide());
      lb.querySelector('.photo-stream-lb-close').addEventListener('click', this._streamLbHide);
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && this._streamLbOpen) this._streamLbHide(); });

      this._streamCards.forEach(card => {
        card.addEventListener('click', () => {
          if (!card.dataset.image) return;

          if (this._onCardClick) {
            const all  = Array.from(document.querySelectorAll('.photo-project-item[data-image]'));
            const item = all.find(el => el.dataset.image === card.dataset.image);
            if (item) {
              const rect = card.getBoundingClientRect();
              this._onCardClick(item, rect);
              return;
            }
          }

          // Fallback to built-in stream lightbox
          lbShow(card.dataset.image, card.dataset.alt || '');
        });
      });
    }
  }

  window.Photo.GhostStream = GhostStream;
}());


;
/* ===== photo-polaroid.js ===== */
/**
 * photo-polaroid.js — canvas scratch-off reveal and click-to-activate for the
 * polaroid widget in the #photo section.
 *
 * PolaroidReveal holds a reference to the owning PhotoPortfolioManager so it
 * can read shared state (inPhase3, openCategories, etc.) and call shared
 * helpers without duplicating them.
 *
 * Exposed as window.Photo.PolaroidReveal.
 * Dependencies: gsap + ScrambleTextPlugin (loaded before this file).
 */
(function () {
  'use strict';

  window.Photo = window.Photo || {};

  class PolaroidReveal {
    constructor(manager) {
      this._mgr                 = manager;
      this._polaroidMoveHandler = null;
    }

    // Called by _triggerChain after the camera column is revealed.
    init() {
      const canvas = document.getElementById('polaroidCanvas');
      const photo  = document.getElementById('polaroidPhoto');
      if (!canvas || !photo) return;

      const palette = ['#005F73','#0A9396','#94D2BD','#E9D8A6','#EE9B00','#CA6702','#BB3E03','#AE2012','#9B2226'];
      const frame   = document.querySelector('.photo-polaroid-frame');
      if (frame) frame.style.background = palette[Math.floor(Math.random() * palette.length)];

      const items = Array.from(document.querySelectorAll('.photo-project-item[data-image]'));
      if (!items.length) return;
      const item  = items[Math.floor(Math.random() * items.length)];
      photo.src   = item.dataset.image;

      const nameEl  = document.getElementById('polaroidName');
      const titleEl = item.querySelector('.photo-title');
      if (nameEl) {
        nameEl.textContent = titleEl ? titleEl.textContent.trim() : '';
        nameEl.classList.remove('reveal');
        void nameEl.offsetWidth;
        nameEl.classList.add('reveal');
      }

      const sectionEl  = document.getElementById('polaroidSection');
      const sectionBtn = item.closest('.photo-accordion-item')?.querySelector('.photo-btn-label');
      if (sectionEl) {
        if (sectionBtn) {
          const word   = sectionBtn.textContent.replace(/[·\[\]\s]/g, '').trim().toUpperCase();
          const spaced = word.split('').join(' ');
          sectionEl.textContent = '[ · ' + spaced + ' · ]';
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
        if (!this._mgr.inPhase3) return;

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

        if (this._polaroidMoveHandler) {
          canvas.removeEventListener('mousemove', this._polaroidMoveHandler);
        }

        // Erase a soft circle wherever the mouse moves (permanent destination-out)
        this._polaroidMoveHandler = (e) => {
          const r      = canvas.getBoundingClientRect();
          const x      = e.clientX - r.left;
          const y      = e.clientY - r.top;
          const radius = 44;
          ctx.globalCompositeOperation = 'destination-out';
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0,   'rgba(0,0,0,1)');
          grad.addColorStop(0.6, 'rgba(0,0,0,0.85)');
          grad.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        };

        canvas.addEventListener('mousemove', this._polaroidMoveHandler, { passive: true });
      });
    }

    reset() {
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

    // Wire up the click-to-reveal affordance. Queries the DOM internally.
    setupClick() {
      const polaroidReveal = document.querySelector('.photo-polaroid-reveal');
      if (!polaroidReveal) return;
      polaroidReveal.style.cursor = 'pointer';
      polaroidReveal.addEventListener('click', () => this._onPolaroidClick());
    }

    // Activates a list item as the "highlighted" photo (hover state + bg image).
    activateItem(item) {
      const list = item.closest('.photo-project-list');
      if (!list) return;

      const textEls       = item.querySelectorAll('.hover-text');
      const originalTexts = this._mgr.originalTexts.get(item);

      list.querySelectorAll('.photo-project-item').forEach(el => {
        el.classList.remove('active');
        el.style.opacity = '';
      });
      list.classList.add('has-active');
      item.classList.add('active');

      if (originalTexts) {
        textEls.forEach((el, i) => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text:        originalTexts[i],
              chars:       'qwerty1337h@ck3r',
              revealDelay: 0.3,
              speed:       0.4,
            },
          });
        });
      }

      if (item.dataset.image) this._mgr.showBackgroundImage(item.dataset.image);

      if (this._mgr.contentScroll) {
        requestAnimationFrame(() => {
          const csRect   = this._mgr.contentScroll.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();
          const needed   = this._mgr.contentScroll.scrollTop + (itemRect.bottom + 24 - csRect.bottom);
          if (needed > this._mgr.contentScroll.scrollTop) {
            gsap.to(this._mgr.contentScroll, {
              scrollTop: needed,
              duration:  0.5,
              ease:      'power2.out',
              overwrite: 'auto',
            });
          }
        });
      }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _onPolaroidClick() {
      const photoEl = document.getElementById('polaroidPhoto');
      if (!photoEl || !photoEl.src) return;

      const normalize = src => {
        try { return new URL(src, location.href).pathname; } catch { return src; }
      };
      const polaroidPath = normalize(photoEl.src);
      const matchingItem = Array.from(
        document.querySelectorAll('.photo-project-item[data-image]')
      ).find(item => normalize(item.dataset.image) === polaroidPath);

      if (!matchingItem) return;

      // Clear the scratch canvas so the photo is fully visible
      const canvas = document.getElementById('polaroidCanvas');
      if (canvas && canvas.width && canvas.height) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Use the polaroid frame's bounding rect as the expand origin
      const frame = document.querySelector('.photo-polaroid-frame');
      const rect  = frame ? frame.getBoundingClientRect() : photoEl.getBoundingClientRect();

      this._mgr._openItemLightbox(matchingItem, rect.left, rect.top, rect.width, rect.height, true);
    }
  }

  window.Photo.PolaroidReveal = PolaroidReveal;
}());


;
/* ===== photo-fly-caption.js ===== */
/**
 * photo-fly-caption.js — flying caption clone that follows the hovered
 * photo-project-item to a fixed position at the bottom of the viewport.
 *
 * Exposed as window.Photo.FlyCaption.
 * Dependencies: gsap + ScrambleTextPlugin (loaded before this file).
 */
(function () {
  'use strict';

  window.Photo = window.Photo || {};

  class FlyCaption {
    // originalTexts — the Map<Element, string[]> built by PhotoPortfolioManager
    constructor(originalTexts) {
      this._originalTexts    = originalTexts;
      this._flyClone         = null;
      this._flySource        = null;
      this._flyReturnTween   = null;
      this._flyReturnTimeout = null;
    }

    fly(item) {
      if (this._flyReturnTimeout) {
        clearTimeout(this._flyReturnTimeout);
        this._flyReturnTimeout = null;
      }

      const rect      = item.getBoundingClientRect();
      const itemHidden = rect.width < 10;

      // When the source item is hidden (inside a collapsed accordion), derive a
      // natural caption width from the left column. Fall back to 55% of viewport.
      const captionW  = itemHidden
        ? (document.querySelector('.photo-col-left')?.getBoundingClientRect().width || window.innerWidth * 0.55)
        : rect.width;

      let targetTop  = Math.round(window.innerHeight * 0.975) - 32;
      const targetLeft = (window.innerWidth - captionW) / 2;

      // Quick-switch: clone exists but is tracking a different item
      if (this._flyClone && this._flySource !== item) {
        this._flySource.style.opacity = '0.25';
        this._flySource.style.zIndex  = '';
        this._flySource = item;
        item.style.opacity = '0.5';
        item.style.zIndex  = '0';

        // Also update width in case the new item has a different rect
        gsap.set(this._flyClone, { width: captionW });

        const numEl = this._flyClone.querySelector('.photo-fly-num');
        if (numEl) numEl.textContent = this._getCounterIndex(item);

        const cloneSpans = this._flyClone.querySelectorAll('.photo-project-data');
        const origTexts  = this._originalTexts.get(item);
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

      // Hidden items start at their final position and fade in — no fly from (0,0).
      const startTop  = itemHidden ? targetTop  : rect.top;
      const startLeft = itemHidden ? targetLeft : rect.left;

      gsap.set(clone, { top: startTop, left: startLeft, width: captionW, opacity: 0 });
      document.body.appendChild(clone);

      // Phones stack the caption as 3 lines (responsive.css) — taller than the
      // desktop single row the fixed targetTop was sized for, so anchor the
      // clone's BOTTOM above the viewport edge instead. Measured after append
      // (needs layout); clone is still opacity:0 here. Desktop path unchanged.
      if (window.matchMedia('(max-width: 768px)').matches) {
        targetTop = window.innerHeight - clone.offsetHeight - 16;
        if (itemHidden) gsap.set(clone, { top: targetTop });
      }
      this._flyClone  = clone;
      this._flySource = item;
      if (!itemHidden) item.style.zIndex = '0';

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

    return() {
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

        // Kill the old tween AND remove its target so orphaned clones don't accumulate.
        if (this._flyReturnTween) {
          const oldEl = this._flyReturnTween.targets()[0];
          this._flyReturnTween.kill();
          this._flyReturnTween = null;
          if (oldEl && oldEl !== clone) oldEl.remove();
        }

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

    clear() {
      if (this._flyReturnTimeout) { clearTimeout(this._flyReturnTimeout); this._flyReturnTimeout = null; }
      if (this._flyReturnTween)   { this._flyReturnTween.kill(); this._flyReturnTween = null; }
      if (this._flyClone)         { this._flyClone.remove(); this._flyClone = null; }
      if (this._flySource)        { this._flySource.style.opacity = ''; this._flySource.style.zIndex = ''; this._flySource = null; }
      // Remove any clones that escaped tracking (orphaned by killed tweens).
      document.querySelectorAll('.photo-caption-fly').forEach(el => el.remove());
    }

    // ── Private ──────────────────────────────────────────────────────────────

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
      numSpan.className   = 'photo-fly-num';
      numSpan.textContent = this._getCounterIndex(item);
      clone.appendChild(numSpan);

      item.querySelectorAll('.photo-project-data').forEach(span => {
        clone.appendChild(span.cloneNode(true));
      });

      return clone;
    }
  }

  window.Photo.FlyCaption = FlyCaption;
}());


;
/* ===== photo-portfolio.js ===== */
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
      this._borderPaused      = false;

      // Photo bg glow border
      this._photoBorderActive      = false;
      this._photoBorderRaf         = null;
      this._photoBorderFrame       = 0;
      this._photoBorderSettleTimer = null;
      this._photoBorderStopTimer   = null;
      this._photoBorderPaused      = false;

      this._previewVisible    = false;
      this._enlargeLabel      = null;
      this._enlargeText       = null;
      this._PREVIEW_W         = 200;
      this._PREVIEW_H         = 260;
      this._previewTargetX    = 0;
      this._previewTargetY    = 0;
      this._previewRafPending = false;

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
      this._enlargeLabel          = document.getElementById('photoEnlargeLabel');
      this._enlargeText           = this._enlargeLabel?.querySelector('.photo-enlarge-text') ?? null;

      // Phones (≤768px): the category accordion and its "Click a category…" cta
      // live in .photo-col-left, but the owner wants them to read *between* the
      // intro paragraph and the Instagram block (both in .photo-col-camera).
      // CSS `order` can't interleave nodes across the two grid items, so move
      // the two into .photo-col-camera, right before .photo-col-instagram →
      // final mobile order: intro → cta → accordion → Instagram. Desktop keeps
      // the two-column layout byte-for-byte. Gate on the SAME max-width:768px as
      // the responsive.css order flip, not the UA flag. (owner 2026-07-05)
      if (window.matchMedia('(max-width: 768px)').matches) {
        const camera = this.overlay.querySelector('.photo-col-camera');
        const ig     = this.overlay.querySelector('.photo-col-instagram');
        const cta    = this.overlay.querySelector('.photo-cta');
        const accord = this.overlay.querySelector('.photo-accordion');
        if (camera && ig && cta && accord) {
          camera.insertBefore(cta, ig);
          camera.insertBefore(accord, ig);
        }

        // Per-row thumbnail: the expanded accordion row is just [number]
        // [title/location], leaving empty space on the right → fill it with a
        // small preview of each photo (from data-image), placed in grid col 3
        // (styled in responsive.css). Mobile-only: these <img> nodes are never
        // created on the frozen desktop build. Lazy so only the open category's
        // visible thumbs decode. (owner 2026-07-05)
        this.overlay.querySelectorAll('.photo-project-item[data-image]').forEach(item => {
          if (item.querySelector('.photo-thumb')) return;
          const img = document.createElement('img');
          img.className = 'photo-thumb';
          img.src       = item.dataset.image;
          img.alt       = '';
          img.setAttribute('aria-hidden', 'true');
          img.setAttribute('draggable', 'false');
          img.loading   = 'lazy';
          img.decoding  = 'async';
          item.appendChild(img);
        });
      }

      // Create subsystems
      this.stream  = new window.Photo.GhostStream(
        document.querySelector('.photo-ghost-stream'),
        Array.from(document.querySelectorAll('.photo-ghost-card'))
      );
      this.stream.init();
      this.stream.onCardClick = (item, rect) =>
        this._openItemLightbox(item, rect.left, rect.top, rect.width, rect.height);

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
      this._setupItemLightbox();

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
        document.dispatchEvent(new CustomEvent('photoPhase3Inactive'));
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

      // Phones: remove the auto "attract" cascade (auto-open each category →
      // reveal its photos → bounce-close). The accordion stays closed and opens
      // only on tap (_openCategory re-reveals its items). Just reveal the
      // (closed) buttons here. Desktop keeps the full cascade in the else below,
      // byte-for-byte unchanged. (owner 2026-07-04, mobile-only via isMobile)
      const isMobile = !!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile);

      if (isMobile) {
        categoryBtnArray.forEach((btn, i) => {
          const t = setTimeout(() => this._revealItem(btn, 0), cursor + i * INTRO_STEP);
          this.chainTimers.push(t);
        });
        cursor += categoryBtnArray.length * INTRO_STEP + 250;
      } else {

      // 2. Sequential category reveal: button → items one by one
      categoryBtnArray.forEach(btn => {
        const accordionItem = btn.closest('.photo-accordion-item');
        const list  = accordionItem?.querySelector('.photo-project-list');
        const items = list ? Array.from(list.querySelectorAll('.photo-project-item')) : [];
        const cat   = btn.dataset.category;

        const btnDelay = cursor;
        const t0 = setTimeout(() => {
          this.openCategories.add(cat);
          this._syncOpenCategoryClass();
          btn.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          if (list) list.style.display = 'flex';
          if (accordionItem) accordionItem.classList.add('list-animating');
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
          this._syncOpenCategoryClass();
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          if (list) list.style.display = 'none';
          if (accordionItem) accordionItem.classList.remove('list-animating');
          gsap.killTweensOf(btn);
          gsap.fromTo(btn, { y: -5 }, { y: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' });
        }, closeAt);
        this.chainTimers.push(tc);

        cursor = closeAt + REV_GAP;
      });

      } // end desktop-only attract cascade (steps 2 + 3)

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

    // ── Item lightbox — fullscreen expand from thumbnail position ───────────

    _setupItemLightbox() {
      const lb = document.createElement('div');
      lb.className = 'photo-item-lightbox';
      lb.setAttribute('aria-hidden', 'true');
      lb.innerHTML = `
        <img class="photo-item-lb-img" alt="">
        <div class="photo-item-lb-border" aria-hidden="true"></div>`;
      document.body.appendChild(lb);
      this._itemLb       = lb;
      this._itemLbImg    = lb.querySelector('.photo-item-lb-img');
      this._itemLbOpen   = false;
      this._itemLbOrigin = { x: 0, y: 0 }; // snapshot of open position for reverse
      lb.addEventListener('click', () => this._closeItemLightbox());
    }

    _openItemLightbox(sourceItem, startX, startY, startW, startH, fromPolaroid = false) {
      if (this._itemLbOpen || !this._itemLb) return;
      this._itemLbOpen = true;
      const w = startW ?? this._PREVIEW_W;
      const h = startH ?? this._PREVIEW_H;
      this._itemLbOrigin      = { x: startX, y: startY, w, h };
      this._itemLbSourceItem  = sourceItem;
      this._itemLbFromPolaroid = fromPolaroid;

      const lb  = this._itemLb;
      const src = sourceItem.dataset.image;
      this._itemLbImg.src = src;

      // Pin at origin position — set ALL inline styles before display:block
      // so the browser commits the start geometry in one layout pass.
      lb.style.left    = startX + 'px';
      lb.style.top     = startY + 'px';
      lb.style.width   = w + 'px';
      lb.style.height  = h + 'px';
      lb.style.opacity = '1';
      lb.style.display = 'block';
      lb.setAttribute('aria-hidden', 'false');

      lb.classList.add('lb-expanding');
      this._startPhotoBorderTick();

      // Force reflow so browser commits start geometry before transition fires.
      void lb.offsetWidth;

      lb.style.left   = '0px';
      lb.style.top    = '0px';
      lb.style.width  = window.innerWidth  + 'px';
      lb.style.height = window.innerHeight + 'px';

      const onExpand = (e) => {
        if (e.propertyName !== 'width') return;
        lb.removeEventListener('transitionend', onExpand);
        lb.classList.remove('lb-expanding');
        this._stopPhotoBorderTick();
        if (this._itemLbSourceItem) this.caption.fly(this._itemLbSourceItem);
      };
      lb.addEventListener('transitionend', onExpand);

      this.hideBackgroundImage();
    }

    _closeItemLightbox() {
      if (!this._itemLbOpen || !this._itemLb) return;
      this._itemLbOpen = false;
      this.caption.clear();

      const lb      = this._itemLb;
      const { x: originX, y: originY, w: originW, h: originH } = this._itemLbOrigin;

      // Activate electric border for the shrink
      lb.classList.add('lb-expanding');
      this._startPhotoBorderTick();

      // Force reflow from current fullscreen state before transitioning
      void lb.offsetWidth;

      // Shrink back to exact origin rect
      lb.style.left   = originX + 'px';
      lb.style.top    = originY + 'px';
      lb.style.width  = originW + 'px';
      lb.style.height = originH + 'px';

      const sourceItem    = this._itemLbSourceItem;
      const fromPolaroid  = this._itemLbFromPolaroid;

      const onShrink = (e) => {
        if (e.propertyName !== 'width') return;
        lb.removeEventListener('transitionend', onShrink);
        lb.classList.remove('lb-expanding');
        this._stopPhotoBorderTick();
        lb.style.display  = 'none';
        lb.style.opacity  = '';
        lb.style.left     = '';
        lb.style.top      = '';
        lb.style.width    = '';
        lb.style.height   = '';
        lb.setAttribute('aria-hidden', 'true');
        this._itemLbImg.src = '';

        if (fromPolaroid && sourceItem) {
          const accordionItem = sourceItem.closest('.photo-accordion-item');
          const btn  = accordionItem?.querySelector('.photo-category-btn');
          const list = accordionItem?.querySelector('.photo-project-list');
          const cat  = btn?.dataset.category;
          if (cat && list && btn) {
            const activate = () => this.polaroid.activateItem(sourceItem);
            if (!this.openCategories.has(cat)) {
              this._openCategory(cat, btn, list);
              const n = list.querySelectorAll('.photo-project-item').length;
              setTimeout(activate, n * 40 + 200);
            } else {
              activate();
            }
          }
        }
      };
      lb.addEventListener('transitionend', onShrink);
    }

    _forceCloseItemLightbox() {
      if (!this._itemLb) return;
      this._itemLbOpen = false;
      this.caption.clear();
      this._itemLb.classList.remove('lb-expanding');
      this._stopPhotoBorderTick();
      // Clone-replace the node to shed any pending transitionend listeners
      const fresh = this._itemLb.cloneNode(true);
      this._itemLb.parentNode?.replaceChild(fresh, this._itemLb);
      this._itemLb    = fresh;
      this._itemLbImg = fresh.querySelector('.photo-item-lb-img');
      fresh.addEventListener('click', () => this._closeItemLightbox());
      fresh.style.display = 'none';
      fresh.style.opacity = '';
      fresh.style.left    = '';
      fresh.style.top     = '';
      fresh.style.width   = '';
      fresh.style.height  = '';
      fresh.setAttribute('aria-hidden', 'true');
      if (this._itemLbImg) this._itemLbImg.src = '';
    }

    _cancelChain() {
      this.caption.clear();
      this.chainTimers.forEach(t => clearTimeout(t));
      this.chainTimers = [];
      this.chainActive = false;
      this.introAnimating = false;
      document.querySelectorAll('.photo-accordion-item.list-animating')
        .forEach(el => el.classList.remove('list-animating'));
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
      this._syncOpenCategoryClass();
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
      this._syncOpenCategoryClass();
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
      if (this._enlargeLabel) this._enlargeLabel.style.opacity = '0';
      this._bgElecOff();
      this._forceCloseItemLightbox();
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
      this._syncOpenCategoryClass();
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
      if (this._enlargeLabel) this._enlargeLabel.style.opacity = '0';
      this._bgElecOff();
      this._forceCloseItemLightbox();
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
    // The electric flow is now driven by the self-animating SVG filter
    // (#accordion-electric, animated feOffset), so this per-frame turbulence
    // re-seeding is obsolete — the tick just ends its RAF chain. Visibility is
    // still toggled via the .accordion-animating class in _borderStart/_borderStop.
    _borderAnimTick() {
      this._borderRaf = null;
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

    _syncOpenCategoryClass() {
      if (this.accordion) {
        const wasOpen = this.accordion.classList.contains('has-open-category');
        const isOpen  = this.openCategories.size > 0;
        this.accordion.classList.toggle('has-open-category', isOpen);
        if (isOpen !== wasOpen) {
          document.dispatchEvent(new CustomEvent('photoAccordionChanged', { detail: { open: isOpen } }));
        }
      }
    }

    _openCategory(category, btn, list) {
      this._borderStart();
      this.openCategories.add(category);
      this._syncOpenCategoryClass();
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
      this._syncOpenCategoryClass();
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
      this._syncOpenCategoryClass();
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

      // Phones: tighten the per-item cascade stagger so the reveal reads as fast
      // as the about / art-direction glitch (owner 2026-07-05). Desktop keeps
      // the original 0.04s / 40ms steps. Paired with the halved photo-glitch-in
      // duration in responsive.css.
      const _mob   = !!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile);
      const _step  = _mob ? 0.012 : 0.04;
      const _gstep = _mob ? 12    : 40;

      gsap.killTweensOf(item);
      gsap.to(item, {
        delay: batchIndex * _step,
        keyframes: [
          { opacity: 1,    duration: 0.04, ease: 'none' },
          { opacity: 0.15, duration: 0.03, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.35, duration: 0.02, ease: 'none' },
          { opacity: 1,    duration: 0.05, ease: 'none' },
        ]
      });

      // Layer the CSS glitch-in animation in sync with the opacity reveal
      const glitchDelay = Math.round(batchIndex * _gstep);
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

        // Phones (≤768px): skip the scramble — mouseenter is unreliable on
        // touch and the mid-scramble text could get stuck; the yellow
        // selected-row highlight (see click handler below) does the job.
        if (!window.matchMedia('(max-width: 768px)').matches) {
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
        }

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

      item.addEventListener('click', (e) => {
        if (!item.dataset.image) return;

        // Phones (≤768px): the row dim/highlight is hover-driven, but touch has
        // no reliable mouseleave — so after the lightbox closes the desktop
        // `has-active` dim (siblings → opacity .25) and the tapped row's inline
        // opacity get stuck, leaving the name/description text invisible. On
        // tap, drop that stuck hover state and instead mark THIS row with a
        // persistent `photo-item-selected` class (yellow highlight in
        // responsive.css) so the selected photo is always readable and clearly
        // flagged. Desktop keeps the hover system untouched. (owner bug 2026-07-05)
        if (window.matchMedia('(max-width: 768px)').matches) {
          const lst = item.closest('.photo-project-list');
          if (lst) {
            lst.classList.remove('has-active');
            lst.querySelectorAll('.photo-project-item').forEach(el => {
              el.classList.remove('active', 'photo-item-selected');
              // Base CSS opacity is 0 (rows show via gsap inline opacity), so
              // restore to 1 like the mouseleave handler does — clearing to ''
              // would drop already-revealed rows back to the hidden base.
              el.style.opacity = '1';
              el.style.zIndex  = '';
            });
          }
          item.classList.add('photo-item-selected');
        }

        const x = this._previewTargetX || e.clientX;
        const y = this._previewTargetY || e.clientY;
        this._openItemLightbox(item, x, y);
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
      this.bgImage.style.transform       = `translate(${this._previewTargetX}px,${this._previewTargetY}px)`;
      this.bgImage.style.backgroundImage = `url("${imageUrl}")`;
      this.bgImage.style.opacity         = '1';
      if (this._enlargeLabel) {
        this._enlargeLabel.style.transform = `translate(${this._previewTargetX}px,${this._previewTargetY + this._PREVIEW_H + 4}px)`;
        this._enlargeLabel.style.opacity   = '1';
      }
      if (this._enlargeText) {
        gsap.killTweensOf(this._enlargeText);
        const enlargeStr = App.LanguageManager?.translate('photo.ui.enlarge') || '· click to enlarge ·';
        gsap.to(this._enlargeText, {
          duration: 0.5,
          scrambleText: { text: enlargeStr, chars: 'qwerty1337h@ck3r', revealDelay: 0.1, speed: 0.5 }
        });
      }
    }

    hideBackgroundImage() {
      this._previewVisible               = false;
      this.bgImage.style.opacity         = '0';
      if (this._enlargeLabel) this._enlargeLabel.style.opacity = '0';
    }

    // Hot path: runs on every mousemove over the overlay.
    // Zero reflows — dimensions cached as constants.
    // RAF-gated — one DOM write per animation frame regardless of event rate.
    // Tracks position even when hidden so showBackgroundImage pre-positions correctly.
    _movePreview(e) {
      const OFFSET_X = 24;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let x = e.clientX + OFFSET_X;
      let y = e.clientY - (this._PREVIEW_H >> 1);

      if (x + this._PREVIEW_W > vw - 8) x = e.clientX - this._PREVIEW_W - OFFSET_X;
      if (y < 8)                          y = 8;
      if (y + this._PREVIEW_H > vh - 8)   y = vh - this._PREVIEW_H - 8;

      this._previewTargetX = x;
      this._previewTargetY = y;

      if (!this._previewVisible || this._previewRafPending) return;
      this._previewRafPending = true;
      requestAnimationFrame(() => {
        const tx = `translate(${this._previewTargetX}px,${this._previewTargetY}px)`;
        this.bgImage.style.transform = tx;
        if (this._enlargeLabel) {
          this._enlargeLabel.style.transform = `translate(${this._previewTargetX}px,${this._previewTargetY + this._PREVIEW_H + 4}px)`;
        }
        this._previewRafPending = false;
      });
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

    _startPhotoBorderTick() {
      if (!this._photoBorderActive) {
        this._photoBorderActive = true;
        this._photoBorderFrame  = 0;
        this._photoBorderRaf = requestAnimationFrame(() => this._photoBorderTick());
      }
    }

    _stopPhotoBorderTick() {
      this._photoBorderActive = false;
    }

    _photoBorderTick() {
      // Flow now driven by the self-animating #photo-bg-electric filter; the
      // per-frame seed cycling is obsolete, so just end the RAF chain.
      this._photoBorderRaf = null;
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


;
/* ===== scroll-hint.js ===== */
/**
 * scroll-hint.js — scroll hint popup only.
 * All Paul Rand quote animation is owned by initAboutPin (script.js).
 * This file handles only the "[ scroll ]" popup shown after idle.
 */

(function () {
  'use strict';

  const IDLE_DELAY     = 3000; // ms idle before showing hint
  const AUTO_HIDE      = 3000; // ms hint stays visible
  const FRAME_INTERVAL = 110;  // ms between typewriter frames

  const SCROLL_FRAMES = [
    '[ ]', '[ · · ]', '[ · s · ]', '[ · s c · ]',
    '[ · s c r · ]', '[ · s c r o · ]', '[ · s c r o l · ]', '[ · s c r o l l · ]',
  ];

  /* ── Generic hint controller ────────────────────────────────────────────────
     canShow (optional): extra predicate evaluated at show() time.
     If it returns false the hint is silently skipped and rescheduled.        */
  function makeHintController(hintEl, textEl, canShow) {
    let idleTimer       = null;
    let autoHideTimer   = null;
    let typewriterTimer = null;
    let isVisible       = false;
    let sectionActive   = false;
    let primed          = false;

    function typewriter() {
      if (!textEl) return;
      clearTimeout(typewriterTimer);
      let frame = 0;
      textEl.textContent = SCROLL_FRAMES[0];
      function next() {
        frame++;
        if (frame < SCROLL_FRAMES.length) {
          textEl.textContent = SCROLL_FRAMES[frame];
          typewriterTimer = setTimeout(next, FRAME_INTERVAL);
        }
      }
      typewriterTimer = setTimeout(next, FRAME_INTERVAL);
    }

    function show() {
      if (isVisible || !sectionActive) return;
      // Evaluate canShow() at display time — conditions may have changed since scheduling
      if (canShow && !canShow()) { scheduleShow(); return; }
      isVisible = true;
      hintEl.removeAttribute('aria-hidden');
      hintEl.classList.add('visible');
      typewriter();
      clearTimeout(autoHideTimer);
      autoHideTimer = setTimeout(() => { hide(); scheduleShow(); }, AUTO_HIDE);
    }

    function hide() {
      if (!isVisible) return;
      isVisible = false;
      clearTimeout(autoHideTimer);
      clearTimeout(typewriterTimer);
      hintEl.setAttribute('aria-hidden', 'true');
      hintEl.classList.remove('visible');
    }

    function scheduleShow() {
      clearTimeout(idleTimer);
      if (sectionActive && primed) idleTimer = setTimeout(show, IDLE_DELAY);
    }

    function onActivity() {
      if (isVisible) hide();
      if (sectionActive) primed = true;
      scheduleShow();
    }

    function setSectionActive(active) {
      sectionActive = active;
      if (!active) {
        hide();
        clearTimeout(idleTimer);
        primed = false;
      } else {
        primed = true;
        scheduleShow();
      }
    }

    function reset() { hide(); primed = false; }

    return { onActivity, setSectionActive, reset };
  }

  /* ── Init ────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {

    /* Photo section ─────────────────────────────────────────────────────────
       Shows only when:  phase 3 active  AND  a category is expanded
                         AND  items extend below the visible container area.
       canShow() is evaluated at show() time — never at schedule time.        */
    const photoHintEl   = document.getElementById('photo-scroll-hint');
    const photoTextEl   = photoHintEl && photoHintEl.querySelector('.sc-text');
    const photoScrollEl = document.querySelector('.photo-content-scroll');

    const photoCanShow = () => {
      if (!photoScrollEl) return false;
      const accordion  = document.querySelector('.photo-accordion');
      const isExpanded = accordion && accordion.classList.contains('has-open-category');
      const hasOverflow = photoScrollEl.scrollHeight >
        photoScrollEl.clientHeight + photoScrollEl.scrollTop + 32;
      return isExpanded && hasOverflow;
    };

    const photoCtrl = photoHintEl
      ? makeHintController(photoHintEl, photoTextEl, photoCanShow)
      : null;

    if (photoCtrl) {
      // Phase 3 entry/exit
      document.addEventListener('photoPhase3Active',   () => photoCtrl.setSectionActive(true));
      document.addEventListener('photoPhase3Inactive', () => photoCtrl.setSectionActive(false));

      // Accordion open/close — restart idle timer so hint can appear after category expands
      document.addEventListener('photoAccordionChanged', () => photoCtrl.onActivity());

      // Scrolling inside the photo container counts as activity
      if (photoScrollEl) {
        photoScrollEl.addEventListener('scroll', () => photoCtrl.onActivity(), { passive: true });
      }
    }

    const EVENTS = ['scroll', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'click'];
    EVENTS.forEach(evt => {
      window.addEventListener(evt, () => {
        photoCtrl && photoCtrl.onActivity();
      }, { passive: true });
    });

    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      photoCtrl && photoCtrl.reset();
    });
  });
})();


;
/* ===== ascii-ripple.js ===== */
/**
 * ascii-ripple.js — ASCII Glitch Ripple Hover Effect
 *
 * On mouseenter / mousemove, spawns a ripple of ASCII + box-drawing characters
 * spreading outward from the cursor's character position. Original text is
 * restored naturally as each wave expires — no hard cut on mouseleave.
 *
 * Applied to: body paragraphs only.
 * Excluded:   headings, .paul-rands-quote, UI labels/hints.
 *
 * Handles three element types transparently:
 *   • Plain text  (data-i18n)      — textContent only, no inner structure
 *   • HTML markup (data-i18n-html) — saves/restores innerHTML so <em>/<span> survive
 *   • Splitting.js (data-splitting) — saves/restores innerHTML so char-spans survive;
 *                                     script.js re-runs Splitting before our
 *                                     'languagechanged' listener fires, so the
 *                                     rebuilt spans are already in place when we
 *                                     re-capture origHTML.
 *
 * No external dependencies.
 * Adapted from Bastien Cornier's ASCII Glitch Ripple experiment.
 */

(function () {
  'use strict';

  // ── Wave tuning ──────────────────────────────────────────────────────────────
  const WAVE_THRESH = 3;    // intensity band where glitch chars appear
  const CHAR_MULT   = 3;    // how fast chars cycle through charset per distance unit
  const ANIM_STEP   = 40;   // ms between charset index advances (lower = faster churn)
  const WAVE_BUF    = 5;    // extra radius so the wave fully exits the string

  // Box-drawing + ASCII — heavy on VHS / terminal chars, fits the portfolio aesthetic
  const DEFAULT_CHARS = '.,·-─~+:;=*┐┌┘┴┬╗╔╝╚╬╠╣╩╦║░▒▓▄▀▌▐■!?&#$@0123456789';

  // ── Core factory ────────────────────────────────────────────────────────────

  /**
   * Attaches the ASCII ripple effect to a single element.
   *
   * origHTML is always captured from el.innerHTML (browser-encoded), so the
   * innerHTML round-trip is safe for both plain text and markup:
   *   plain text  → browser encodes &→&amp; on read, decodes on write
   *   inner HTML  → round-trips correctly unchanged
   *   Splitting.js spans → same as inner HTML
   *
   * @param {HTMLElement} el
   * @param {object}      opts  — dur / chars / preserveSpaces / spread
   * @returns {{ updateTxt, resetToOrig, destroy }}
   */
  function createASCIIShift(el, opts) {
    let origTxt   = el.textContent;
    let origHTML  = el.innerHTML;       // always innerHTML — safe for all element types
    let origChars = origTxt.split('');
    let isAnim    = false;
    let cursorPos = 0;
    let waves     = [];
    let animId    = null;
    let isHover   = false;
    let lockedW   = null;               // width lock (released in stop)

    const cfg = Object.assign({
      dur:            450,   // ms — shorter so waves expire before they stack heavily
      chars:          DEFAULT_CHARS,
      preserveSpaces: true,
      maxRadius:      22,    // chars — max spread from cursor (~3–4 words each side)
    }, opts);

    // ── Cursor tracking ──────────────────────────────────────────────────────

    const updateCursorPos = (e) => {
      const rect = el.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const len  = origTxt.length;
      const pos  = Math.round((x / rect.width) * len);
      cursorPos  = Math.max(0, Math.min(pos, len - 1));
    };

    // ── Wave management ──────────────────────────────────────────────────────

    const startWave = () => {
      waves.push({ startPos: cursorPos, startTime: Date.now() });
      if (!isAnim) start();
    };

    const cleanupWaves = (t) => {
      waves = waves.filter(w => t - w.startTime < cfg.dur);
    };

    // ── Per-character scramble ───────────────────────────────────────────────

    const calcWaveEffect = (charIdx, t) => {
      let shouldAnim = false;
      let resultChar = origChars[charIdx];

      for (const w of waves) {
        const age  = t - w.startTime;
        const prog = Math.min(age / cfg.dur, 1);
        const dist = Math.abs(charIdx - w.startPos);
        // Fixed-radius wave: expands from 0 → maxRadius over `dur` ms.
        // Does NOT scale to paragraph length, so only surrounding words glitch.
        const rad  = prog * cfg.maxRadius;

        if (dist <= rad) {
          shouldAnim = true;
          const intens = Math.max(0, rad - dist);
          if (intens <= WAVE_THRESH && intens > 0) {
            const ci = (dist * CHAR_MULT + Math.floor(age / ANIM_STEP)) % cfg.chars.length;
            resultChar = cfg.chars[ci];
          }
        }
      }

      return { shouldAnim, char: resultChar };
    };

    const genScrambledTxt = (t) =>
      origChars.map((char, i) => {
        if (cfg.preserveSpaces && char === ' ') return ' ';
        const res = calcWaveEffect(i, t);
        return res.shouldAnim ? res.char : char;
      }).join('');

    // ── Animation loop ───────────────────────────────────────────────────────

    const stop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      // Restore full innerHTML — recovers inner elements (em/span/Splitting.js spans)
      // and correctly decodes plain text that was browser-encoded on capture.
      el.innerHTML        = origHTML;
      el.style.userSelect = '';
      if (lockedW !== null) { el.style.width = ''; lockedW = null; }
      isAnim = false;
    };

    const start = () => {
      if (isAnim) return;

      // Lock width so the element doesn't resize horizontally as chars vary.
      // No height lock — block paragraphs reflow vertically and locking height
      // clips text / causes a visible snap on release.
      if (lockedW === null) {
        lockedW = el.getBoundingClientRect().width;
        el.style.width = lockedW + 'px';
      }

      // Flatten inner markup to plain text so we can replace char-by-char.
      // origHTML is already saved above and will be restored in stop().
      el.textContent      = origTxt;
      el.style.userSelect = 'none';   // prevent selection of scrambled chars
      isAnim = true;

      const animate = () => {
        const t = Date.now();
        cleanupWaves(t);
        if (waves.length === 0) { stop(); return; }
        el.textContent = genScrambledTxt(t);
        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);
    };

    // ── Event handlers ───────────────────────────────────────────────────────

    const handleEnter = (e) => {
      // Re-sync from live DOM before every animation start.
      // This handles language switches (and any external content change)
      // without relying on event-listener ordering or the languagechanged
      // dispatch timing — whatever text is in the element right now is what
      // the effect will animate and restore.
      if (!isAnim) {
        origTxt   = el.textContent;
        origHTML  = el.innerHTML;
        origChars = origTxt.split('');
      }
      isHover = true;
      updateCursorPos(e);
      startWave();
    };

    const handleMove = (e) => {
      if (!isHover) return;
      const prev = cursorPos;
      updateCursorPos(e);
      if (cursorPos !== prev) startWave();
    };

    const handleLeave = () => {
      isHover = false;
      // Waves expire naturally — no hard stop so the effect trails off smoothly
    };

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mousemove',  handleMove);
    el.addEventListener('mouseleave', handleLeave);

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Sync text + HTML after an external change (e.g. i18n language switch).
     *
     * By the time 'languagechanged' fires:
     *   data-i18n      → el.textContent already updated by i18n.js
     *   data-i18n-html → el.innerHTML   already updated by i18n.js
     *   data-splitting → i18n.js set textContent, then script.js re-ran
     *                    Splitting.js synchronously, so el.innerHTML already
     *                    has the rebuilt char-spans when our listener fires.
     *
     * Safe to call while animation is running — origTxt/origHTML update and
     * the correct new text is restored when the wave expires.
     */
    const updateTxt = (newTxt, newHTML) => {
      origTxt   = newTxt;
      origHTML  = newHTML !== undefined ? newHTML : newTxt;
      origChars = newTxt.split('');
      // No DOM write here — external code (i18n / Splitting.js) already
      // updated the element's display. handleEnter re-syncs on next hover.
    };

    /** Cancels animation immediately and restores original content. */
    const resetToOrig = () => {
      waves = [];
      stop();
    };

    /** Removes all event listeners and resets the element. */
    const destroy = () => {
      resetToOrig();
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mousemove',  handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };

    return { updateTxt, resetToOrig, destroy };
  }

  // ── Initialisation ───────────────────────────────────────────────────────────

  /**
   * Target selectors — body-copy paragraphs only.
   *
   * Deliberately omitted:
   *   h1 / h2 / h3        — headings, excluded by design
   *   .paul-rands-quote   — quote, excluded by design
   *   .photo-cta          — UI instruction label (span inside p, not body copy)
   *   .pgallery-hint      — UI hint
   *   .photo-polaroid-hint — UI hint
   *   p.sc-text           — scroll-hint UI
   *   p.coming-soon__label — placeholder
   *   footer p            — copyright line (too short / legal text)
   */
  var PARA_SELECTORS = [
    '.photo-intro',    // data-i18n-html: <em>/<span>/<strong> recovered via innerHTML restore
    '.photo-ig-desc',
    '.pgallery-desc',  // data-splitting: Splitting.js char-spans recovered via innerHTML restore
    'footer p',
  ];

  function initASCIIRipple() {
    var instances = new Map();

    PARA_SELECTORS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var inst = createASCIIShift(el, { dur: 450, maxRadius: 22 });
      instances.set(el, inst);
    });

    // Re-sync after language switch.
    // script.js adds its 'languagechanged' listener before us (it loads first),
    // so Splitting.js has already rebuilt any char-spans by the time we read
    // el.innerHTML here.
    document.addEventListener('languagechanged', function () {
      instances.forEach(function (inst, el) {
        inst.updateTxt(el.textContent, el.innerHTML);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initASCIIRipple);

})();


;
/* ===== contact.js ===== */
/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Boot sequence (GSAP timeline, fires once on first intersection):
     stars → mountains → sun → ground → cockpit → content

   Ship cockpit:
     images/ship-cockpit-color.svg is fetch-injected inline into .ct-cockpit
     so internal groups (e.g. the glow-light blink group) can be animated
     with CSS. The windshield is transparent — the scene shows through it.
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section   = document.getElementById('contact');
  const starsEl   = document.getElementById('ct-stars');
  const cockpitEl = section ? section.querySelector('.ct-cockpit') : null;

  if (!section || !starsEl) return;

  section.classList.add('ct-scene--boot');

  /* ── Star colors ──────────────────────────────────────────────────────── */
  const COLORS = ['#E9D8A6', '#E9D8A6', '#E9D8A6', '#94D2BD'];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function makeShadows(count, fieldW, fieldH) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      parts.push(`${randInt(0, fieldW)}px ${randInt(0, fieldH)}px ${COLORS[randInt(0, COLORS.length)]}`);
    }
    return parts.join(', ');
  }

  function buildStars() {
    const W = Math.max(window.innerWidth * 1.2, 1600);
    const H = 2000;
    let styleTag = document.getElementById('ct-stars-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ct-stars-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      .ct-s1, .ct-s1::after { box-shadow: ${makeShadows(700, W, H)}; }
      .ct-s2, .ct-s2::after { box-shadow: ${makeShadows(200, W, H)}; }
      .ct-s3, .ct-s3::after { box-shadow: ${makeShadows(100, W, H)}; }
    `;
    starsEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    ['ct-s1', 'ct-s2', 'ct-s3'].forEach(cls => {
      const el = document.createElement('div');
      el.className = cls;
      frag.appendChild(el);
    });
    starsEl.appendChild(frag);
  }

  /* ════════════════════════════════════════════════════════════════════════
     SHIP COCKPIT — fetch-inject the SVG so internal groups are animatable
     ════════════════════════════════════════════════════════════════════════ */

  let cockpitSvg = null;

  /* The artwork is 3:2. Near-landscape viewports stretch to fill so the
     frame edges always meet the screen edges; portrait viewports scale to
     cover anchored to the bottom so the dashboard stays visible. */
  function updateCockpitAspect() {
    if (!cockpitSvg) return;
    const ar = section.offsetWidth / Math.max(section.offsetHeight, 1);
    cockpitSvg.setAttribute(
      'preserveAspectRatio',
      ar >= 1.05 ? 'none' : 'xMidYMax slice'
    );
  }

  function injectCockpit() {
    if (!cockpitEl) return;
    fetch('images/ship-cockpit-color.svg')
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        cockpitEl.appendChild(svg);
        cockpitSvg = svg;
        updateCockpitAspect();
        buildFluxFx(svg);
        initHoloBlink(svg);
        buildEvaScreen(svg);
        buildMechScreen(svg);
        buildSeparator(svg);
        buildSideArt(svg);
        buildInterfazScreen(svg);
        initGlowBlink(svg);
      })
      .catch(err => console.error('[contact] cockpit SVG failed to load:', err));
  }

  /* Entrance start state: only the holo windshield beam (ct-hide-lines +
     ct-no-colors hide the artwork), then teal glowing wireframe, then color.
     The boot timeline removes these classes in sequence (CSS transitions
     do the smoothing) — works even though the SVG injection is async. */
  if (cockpitEl) {
    cockpitEl.classList.add('ct-lines-teal', 'ct-no-colors', 'ct-hide-lines', 'ct-hide-holo');
  }

  /* Flux capacitor FX — energy pulses traveling the three Y-arms into the
     core ("condensador de flujo", bottom-centre of the dashboard).
     Coordinates are viewBox user units measured off the artwork. */
  function buildFluxFx(svg) {
    const hover  = svg.querySelector('#hover');
    const parent = hover ? hover.parentNode : svg;
    const NS     = 'http://www.w3.org/2000/svg';

    const CENTER = [501.5, 958];
    const KNOBS  = [[457.5, 898], [543.5, 898], [502.5, 1013]];

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ct-flux');

    KNOBS.forEach(([x, y]) => {
      for (let k = 0; k < 2; k++) {          // two pulses per arm = steady flow
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('class', 'ct-flux-dot');
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('r', 5);
        c.style.setProperty('--fx', (CENTER[0] - x) + 'px');
        c.style.setProperty('--fy', (CENTER[1] - y) + 'px');
        if (k) c.style.animationDelay = '-0.45s';
        g.appendChild(c);
      }
    });

    const core = document.createElementNS(NS, 'circle');
    core.setAttribute('class', 'ct-flux-core');
    core.setAttribute('cx', CENTER[0]);
    core.setAttribute('cy', CENTER[1]);
    core.setAttribute('r', 7);
    g.appendChild(core);

    parent.appendChild(g);

    /* Capsule-style breathing glow in the artwork's own colors:
       flux capacitor housing + the 1,000,000 power readout */
    buildGlowFx(svg, parent, 'flux',  415, 815, 185, 209);
    /* Power readout: only the 1,000,000 digits glow — no region glow */
    buildDigitGlow(svg, parent, 588, 890, 315, 102, 'var(--ct-star-color)');
  }

  /* A soft-edged luminance mask: a blurred white rect. Used instead of a
     clipPath because clipping is applied AFTER CSS filters — a hard clip
     rect slices the blurred glow off at its edges. The mask's own blur
     makes the region dissolve out like real emitted light.
     Returns the mask rect so callers can (re)position the region. */
  function buildSoftMask(parent, id, feather) {
    const NS = 'http://www.w3.org/2000/svg';

    const filt = document.createElementNS(NS, 'filter');
    filt.setAttribute('id', id + '-soft');
    /* widen the filter region so the feather isn't clipped by its own box */
    filt.setAttribute('x', '-40%');
    filt.setAttribute('y', '-40%');
    filt.setAttribute('width', '180%');
    filt.setAttribute('height', '180%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', feather);
    filt.appendChild(blur);

    const mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', id);
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('fill', '#fff');
    rect.setAttribute('filter', `url(#${id}-soft)`);
    mask.appendChild(rect);

    parent.appendChild(filt);
    parent.appendChild(mask);
    return rect;
  }

  /* A blurred, screen-blended clone of the artwork limited to a region —
     the region appears to emit light in its original colors, breathing
     like the DNA capsule's glow. Bounded by a soft mask so the glow
     dissolves at the edges. */
  function buildGlowFx(svg, parent, key, x, y, w, h) {
    const NS = 'http://www.w3.org/2000/svg';

    const maskRect = buildSoftMask(parent, 'ct-glow-mask-' + key, 14);
    maskRect.setAttribute('x', x);
    maskRect.setAttribute('y', y);
    maskRect.setAttribute('width', w);
    maskRect.setAttribute('height', h);

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'ct-glow-layer');
    layer.setAttribute('mask', `url(#ct-glow-mask-${key})`);
    ['#colors', '#lines'].forEach(sel => {
      const src = svg.querySelector(sel);
      if (!src) return;
      const clone = src.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      layer.appendChild(clone);
    });

    parent.appendChild(layer);
    return layer;
  }

  /* Power-readout digits — no glowing region: only the number glyphs glow.
     Every small near-black shape whose box sits inside the readout area is
     cloned (a crisp lit copy + a blurred bloom copy), recolored and
     screen-blended, so the digits read as a lit display with a halo while
     the panel around them stays dark. Boxes are measured in the parent's
     user space (via CTM) so nested group transforms can't misplace clones. */
  function buildDigitGlow(svg, parent, x, y, w, h, color) {
    const NS = 'http://www.w3.org/2000/svg';
    const ref = parent.getScreenCTM();
    if (!ref) return;
    const toParent = ref.inverse();
    const maxArea  = w * h * 0.65;        /* bigger = panel background, skip */

    const glyphs = document.createElementNS(NS, 'g');

    ['#colors', '#lines'].forEach(sel => {
      const src = svg.querySelector(sel);
      if (!src) return;
      src.querySelectorAll('path, polygon, rect, circle, polyline').forEach(el => {
        let b, m;
        try { b = el.getBBox(); m = toParent.multiply(el.getScreenCTM()); }
        catch (e) { return; }
        const p1 = new DOMPoint(b.x, b.y).matrixTransform(m);
        const p2 = new DOMPoint(b.x + b.width, b.y + b.height).matrixTransform(m);
        const bx = Math.min(p1.x, p2.x), by = Math.min(p1.y, p2.y);
        const bw = Math.abs(p2.x - p1.x), bh = Math.abs(p2.y - p1.y);
        if (bx < x || by < y || bx + bw > x + w || by + bh > y + h) return;
        if (bw * bh > maxArea) return;
        const f = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(getComputedStyle(el).fill);
        if (!f) return;
        if (0.2126 * f[1] + 0.7152 * f[2] + 0.0722 * f[3] >= 64) return;

        const clone = el.cloneNode(false);
        clone.removeAttribute('id');
        clone.removeAttribute('class');
        clone.setAttribute('transform',
          `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);
        clone.style.fill = color;
        glyphs.appendChild(clone);
      });
    });

    if (!glyphs.childNodes.length) return;

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'ct-glow-layer ct-glow-layer--digits');
    const bloom = glyphs.cloneNode(true);
    bloom.setAttribute('class', 'ct-glow-bloom');
    layer.appendChild(bloom);
    layer.appendChild(glyphs);
    parent.appendChild(layer);
  }

  /* Holo windshield beam — flickers once every 8, 10 or 15 seconds (picked
     at random each cycle). The blink itself is a short CSS steps() flicker;
     skipped while the section is off-screen or under reduced motion, but
     the clock keeps ticking so blinks stay aperiodic. */
  function initHoloBlink(svg) {
    const holo = svg.querySelector('#holo');
    if (!holo) return;
    const DELAYS = [8000, 10000, 15000];
    holo.addEventListener('animationend', () =>
      holo.classList.remove('ct-holo-blink'));
    (function schedule() {
      const wait = DELAYS[Math.floor(Math.random() * DELAYS.length)];
      setTimeout(() => {
        const skip = section.classList.contains('ct-paused') ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!skip) holo.classList.add('ct-holo-blink');
        schedule();
      }, wait);
    })();
  }

  /* ════════════════════════════════════════════════════════════════════════
     EVA-02 DASHBOARD SCREEN — 9-frame scan flipbook at 8 fps, looping
     ════════════════════════════════════════════════════════════════════════
     The dashboard has a SMALL LANDSCAPE EVA-02 HUD screen to the right of the
     animated flux capacitor — a top-level group (not #Layer_11, not
     #glow_and_blink) whose static panel is frame 1 of the scan. Frames
     images/contact/1..9.svg are a potrace-teal HUD scan of the mech (full body →
     torso → head), already landscape with the same aspect as the slot, so each
     whole frame is dropped into a nested <svg> and meet-fit to the slot (no
     crop). The static panel is hidden and the flipbook plays in its place,
     cross-cut by a CSS step-end opacity flipbook (contact.css). The section-wide
     #contact.ct-paused gate freezes it off-screen; reduced motion holds frame 1.
     (NOTE: the other, portrait EVA with the "EVA-02" word — #glow_and_blink — is
     left untouched.) */
  function buildEvaScreen(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const XLINK = 'http://www.w3.org/1999/xlink';

    // Find the small static EVA HUD: the top-level <g> that isn't the artwork
    // wrapper (#Layer_11, which holds #colors/#lines) nor the labelled portrait
    // EVA (#glow_and_blink). Hide it — frame 1 of the flipbook is its pose.
    const tops = [...svg.children].filter(n => n.tagName === 'g');
    const staticEva = tops.find(g =>
      g.id !== 'glow_and_blink' && !g.querySelector('#colors, #lines'));
    if (staticEva) staticEva.classList.add('ct-eva-static');

    // Screen slot in cockpit viewBox units (the static EVA's measured box,
    // right of the flux capacitor). Landscape, matching the frames' aspect.
    const SX = 603.2, SY = 898.2, SW = 135.7, SH = 88.4;
    // Per-frame native sizes (potrace trims each to its own content box).
    const FRAMES = [
      [894, 584], [836, 590], [836, 586], [878, 586], [840, 584],
      [838, 584], [874, 582], [836, 580], [838, 586],
    ];

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-eva');
    wrap.style.setProperty('--ct-eva-count', FRAMES.length);

    // Tint filter — the frame art is a single flat colour (#94d2bd), loaded via
    // <image> so its fill can't be restyled. This recolours it to #AE2012 by its
    // alpha (feFlood clipped to the source shape), applied only while the scan is
    // playing (gated in CSS: .ct-eva--playing). Injected once per cockpit SVG.
    if (!svg.querySelector('#ct-eva-tint')) {
      const defs  = document.createElementNS(NS, 'defs');
      const filt  = document.createElementNS(NS, 'filter');
      filt.setAttribute('id', 'ct-eva-tint');
      // Glow lives INSIDE this filter (feGaussianBlur + feMerge) — WebKit drops a
      // url(#…) reference filter when it's CSS-chained with drop-shadow(), so the
      // whole effect must be one url() filter. sRGB → the exact #AE2012.
      filt.setAttribute('color-interpolation-filters', 'sRGB');
      filt.setAttribute('x', '-40%'); filt.setAttribute('y', '-40%');
      filt.setAttribute('width', '180%'); filt.setAttribute('height', '180%');
      const flood = document.createElementNS(NS, 'feFlood');
      flood.setAttribute('flood-color', '#AE2012');
      flood.setAttribute('result', 'tint');
      const comp  = document.createElementNS(NS, 'feComposite');
      comp.setAttribute('in', 'tint');
      comp.setAttribute('in2', 'SourceGraphic');
      comp.setAttribute('operator', 'in');
      comp.setAttribute('result', 'red');
      const blur  = document.createElementNS(NS, 'feGaussianBlur');
      blur.setAttribute('in', 'red');
      blur.setAttribute('stdDeviation', '2.5');
      blur.setAttribute('result', 'glow');
      const merge = document.createElementNS(NS, 'feMerge');
      ['glow', 'glow', 'red'].forEach(src => {   // double glow → stronger bloom
        const node = document.createElementNS(NS, 'feMergeNode');
        node.setAttribute('in', src);
        merge.appendChild(node);
      });
      filt.appendChild(flood); filt.appendChild(comp);
      filt.appendChild(blur); filt.appendChild(merge);
      defs.appendChild(filt);
      svg.appendChild(defs);
    }

    FRAMES.forEach(([W, H], i) => {
      const frame = document.createElementNS(NS, 'svg');
      frame.setAttribute('class', i === 0 ? 'ct-eva-frame ct-eva-first' : 'ct-eva-frame');
      frame.setAttribute('x', SX);
      frame.setAttribute('y', SY);
      frame.setAttribute('width', SW);
      frame.setAttribute('height', SH);
      frame.setAttribute('viewBox', `0 0 ${W} ${H}`);     // whole frame, no crop
      frame.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      frame.style.setProperty('--ct-eva-i', i);

      const img = document.createElementNS(NS, 'image');
      img.setAttribute('width', W);
      img.setAttribute('height', H);
      const href = `images/contact/${i + 1}.svg`;
      img.setAttribute('href', href);
      img.setAttributeNS(XLINK, 'xlink:href', href);   // Safari fallback

      frame.appendChild(img);
      wrap.appendChild(frame);
    });

    // Interaction: the panel sits frozen on frame 1 (blinking, see contact.css)
    // until clicked, then the scan flipbook plays; click again to stop. A
    // transparent hit-rect over the slot guarantees the whole panel is clickable
    // (every frame but the first is opacity:0, so they can't catch the pointer)
    // and doubles as the fingertip target for the hover hand.
    const hit = document.createElementNS(NS, 'rect');
    hit.setAttribute('id', 'ct-eva-target');
    hit.setAttribute('x', SX);
    hit.setAttribute('y', SY);
    hit.setAttribute('width', SW);
    hit.setAttribute('height', SH);
    hit.setAttribute('class', 'ct-eva-hit');
    hit.setAttribute('role', 'button');
    hit.setAttribute('tabindex', '0');
    hit.setAttribute('aria-label', 'Toggle the EVA-02 scan animation');

    // Hover hand — reuse the PILOT hands (same size as the form-field hover) and
    // aim a randomly chosen one so its fingertip lands on the EVA panel's centre,
    // exactly like the form/social hand pointers.
    const evaHands   = [
      makeHandPointer(handLeftEl,  '#hand-pointer_invisible',  'eva-l'),
      makeHandPointer(handRightEl, '#handr-pointer_invisible', 'eva-r'),
    ];
    const evaHandEls = [handLeftEl, handRightEl];
    let evaIdx = 0, evaHand = null;
    const toggleEva = () => wrap.classList.toggle('ct-eva--playing');
    const showHand = () => {
      evaIdx  = Math.random() < 0.5 ? 0 : 1;   // random hand each hover
      evaHand = evaHands[evaIdx];
      evaHand.pointAt('ct-eva-target');
    };
    const hideHand = () => { if (evaHand) { evaHand.reset(); evaHand = null; } };
    // Tap, then retreat: the pointing hand flashes its click pose, then BOTH hands
    // slide back off the viewport — so a click never leaves the pointing hand (or a
    // stray second hand from an earlier hover) sitting on the panel.
    const evaTapAndRetreat = () => {
      playHandClick(evaHandEls[evaIdx]);
      clearTimeout(hit._retreatTimer);
      hit._retreatTimer = setTimeout(() => {
        evaHands.forEach(h => h.reset());
        evaHand = null;
      }, 170);
    };
    hit.addEventListener('click', toggleEva);
    hit.addEventListener('pointerdown', evaTapAndRetreat);
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEva(); evaTapAndRetreat(); }
    });
    hit.addEventListener('mouseenter', showHand);
    hit.addEventListener('mouseleave', hideHand);
    hit.addEventListener('focus', showHand);
    hit.addEventListener('blur', hideHand);
    wrap.appendChild(hit);   // last child → renders on top, catches the click

    // Append at root so it renders above the cockpit artwork at the slot's
    // absolute coordinates (the slot group has no transform).
    svg.appendChild(wrap);

    // Amber/orange readout bars just above the EVA panel — give them a slow,
    // intermittent breathing glow (calm). Reuses the artwork-colour soft-mask
    // glow; the custom .ct-eva-bars-glow animation (contact.css) overrides the
    // default breathe with a longer swell-and-rest cycle.
    const hover = svg.querySelector('#hover');
    const glowParent = hover ? hover.parentNode : svg;
    const barsGlow = buildGlowFx(svg, glowParent, 'evabars', 637.9, 850.4, 124.8, 33.8);
    if (barsGlow) barsGlow.classList.add('ct-eva-bars-glow');
  }

  /* ════════════════════════════════════════════════════════════════════════
     SECOND MECH SCREEN — 12-frame rotation flipbook at 4 fps, beside the EVA
     ════════════════════════════════════════════════════════════════════════
     A small rotating mech (images/contact/frame-1..12.svg, 64×128 teal line
     art) sits flush right of the EVA screen at the SAME top and height. Hard-cut
     flipbook at 4 fps (12 × 0.25s = 3s loop), same mechanism as the EVA scan.
     Paused off-screen via #contact.ct-paused; reduced motion holds frame 1. */
  function buildMechScreen(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const XLINK = 'http://www.w3.org/1999/xlink';

    // Slot: right of the EVA (ends x≈738.9), same top & height as the EVA; width
    // from the 64×128 frame aspect so the figure isn't distorted.
    const FW = 64, FH = 128;
    const SY = 898.2, SH = 88.4;
    const SW = SH * (FW / FH);          // 44.2
    const SX = 740;                      // small gap after the EVA panel
    const COUNT = 12;

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-mech');
    wrap.style.setProperty('--ct-mech-count', COUNT);

    for (let i = 0; i < COUNT; i++) {
      const frame = document.createElementNS(NS, 'svg');
      frame.setAttribute('class', i === 0 ? 'ct-mech-frame ct-mech-first' : 'ct-mech-frame');
      frame.setAttribute('x', SX);
      frame.setAttribute('y', SY);
      frame.setAttribute('width', SW.toFixed(1));
      frame.setAttribute('height', SH);
      frame.setAttribute('viewBox', `0 0 ${FW} ${FH}`);
      frame.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      frame.style.setProperty('--ct-mech-i', i);

      const img = document.createElementNS(NS, 'image');
      img.setAttribute('width', FW);
      img.setAttribute('height', FH);
      const href = `images/contact/frame-${i + 1}.svg`;
      img.setAttribute('href', href);
      img.setAttributeNS(XLINK, 'xlink:href', href);   // Safari fallback

      frame.appendChild(img);
      wrap.appendChild(frame);
    }

    svg.appendChild(wrap);
  }

  /* ════════════════════════════════════════════════════════════════════════
     SIDE ART — the animated "time traveller" flipbook, auto-looping
     ════════════════════════════════════════════════════════════════════════
     Right of the rotating mech + separator: the SAME 4-frame flipbook the
     section-transition curtain uses (images/time travel svg/1..4.svg — the
     character working the virtual screens), here looping on its own in the
     dashboard slot. Frames are solid-black art, fetched inline and recoloured
     teal with a soft glow via CSS (.ct-sideart); a hard-cut opacity flipbook
     (contact.css) cycles them. Paused off-screen via #contact.ct-paused;
     reduced motion holds frame 1 (.ct-sideart-first). */
  function buildSideArt(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const COUNT = 4;
    // Slot: after the separator (~x811), inside the brown screen (right edge
    // ≤885), same top & height as the EVA. Frames (~1.11 aspect) fit by width.
    const SX = 812, SY = 898.2, SW = 70, SH = 88.4;

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-sideart-anim');
    wrap.style.setProperty('--ct-sideart-count', COUNT);
    svg.appendChild(wrap);

    for (let i = 1; i <= COUNT; i++) {
      fetch(`images/time%20travel%20svg/${i}.svg`)
        .then(r => r.text())
        .then(text => {
          const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
          const art = doc.documentElement;
          if (art.nodeName !== 'svg') throw new Error('bad SVG payload');
          // Drop inline <style> so the CSS teal recolour wins; strip sizing.
          art.querySelectorAll('style').forEach(s => s.remove());
          art.removeAttribute('id');
          art.removeAttribute('width');
          art.removeAttribute('height');
          art.removeAttribute('style');
          art.setAttribute('class', 'ct-sideart ct-sideart-frame' + (i === 1 ? ' ct-sideart-first' : ''));
          art.style.setProperty('--i', i - 1);   // flipbook slot (delay stagger)
          art.setAttribute('x', SX);
          art.setAttribute('y', SY);
          art.setAttribute('width', SW);
          art.setAttribute('height', SH);
          art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          wrap.appendChild(art);
        })
        .catch(err => console.error('[contact] side art frame failed to load:', i, err));
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     SEPARATOR — 3 small vertical lines between the EVA animations & the side art
     ════════════════════════════════════════════════════════════════════════
     Sits in the gap between the rotating mech (ends x≈784.2) and the side-art
     slot (x850), vertically centred on the EVA height. Teal with a soft glow. */
  function buildSeparator(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const CX = 803;                       // centre of the mech↔side-art gap
    const CY = 898.2 + 88.4 / 2;          // EVA vertical centre
    const H = 46, W = 2, GAP = 7;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ct-sep');
    [-1, 0, 1].forEach(k => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'ct-sep-bar');
      r.setAttribute('x', (CX + k * GAP - W / 2).toFixed(1));
      r.setAttribute('y', (CY - H / 2).toFixed(1));
      r.setAttribute('width', W);
      r.setAttribute('height', H);
      r.setAttribute('rx', 1);
      g.appendChild(r);
    });
    svg.appendChild(g);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERFAZ "SALTO TEMPORAL" SCREEN — 8-frame cross-fade, 1 frame / 2 s
     ════════════════════════════════════════════════════════════════════════
     A second, slower dashboard screen: the portrait jump-prep panel the user
     pasted into the cockpit SVG as a static group marks the slot. Frames
     images/contact/interfaz/1..8.svg cross-dissolve — each holds ~2 s with a
     gentle fade-in/fade-out — and the whole stack carries a teal glow.
     The slot is read LIVE from the pasted panel's box (so repositioning it in
     the SVG just works) and stretched with preserveAspectRatio="none" to match
     it exactly (the cockpit itself renders with PAR=none). The static panel is
     hidden — frame 1 is its content. Paused off-screen via #contact.ct-paused;
     reduced motion holds frame 1. Runs AFTER buildEvaScreen so the EVA static
     is already tagged and this resolves to the interfaz panel alone. */
  function buildInterfazScreen(svg) {
    const NS = 'http://www.w3.org/2000/svg';

    // The remaining plain top-level <g>: no id, not the artwork wrapper
    // (#colors/#lines), and not either EVA group (already classed).
    const tops = [...svg.children].filter(n => n.tagName === 'g');
    const staticPanel = tops.find(g =>
      !g.id &&
      !g.classList.contains('ct-eva') &&
      !g.classList.contains('ct-eva-static') &&
      !g.querySelector('#colors, #lines'));
    if (!staticPanel) return;

    // Slot = the pasted panel's live box (no transform on it; PAR=none below
    // makes the frames fill it identically to the static panel).
    let box;
    try { box = staticPanel.getBBox(); } catch (e) { return; }
    if (!box.width || !box.height) return;
    const SX = box.x, SY = box.y, SW = box.width, SH = box.height;
    staticPanel.classList.add('ct-iz-static');

    // Per-frame native sizes (potrace trims each to its own content box).
    const FRAMES = [
      [468, 880], [448, 868], [440, 858], [446, 866],
      [442, 860], [456, 874], [446, 868], [458, 842],
    ];
    const BANDS = 12;
    const DWELLS = [3000, 5000, 8000];   // random dwell per frame (3 / 5 / 8 s)
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Group a frame's potrace paths into horizontal bands (top→bottom) so they
    // can cascade in on each change (à la the About skills SVG). potrace wraps
    // its paths in <g transform="translate(0,H) scale(0.1,-0.1)">, so a path's
    // on-screen y is tY + sY·(first M y-coord).
    function bandGroup(rootSvg, H) {
      const g = rootSvg.querySelector('g');
      if (!g) return;
      const t   = g.getAttribute('transform') || '';
      const trY = /translate\(\s*[-\d.]+[ ,]+([-\d.]+)/.exec(t);
      const scY = /scale\(\s*[-\d.]+[ ,]+([-\d.]+)/.exec(t);
      const tY = trY ? parseFloat(trY[1]) : 0;
      const sY = scY ? parseFloat(scY[1]) : 1;
      const bandH  = H / BANDS;
      const bucket = new Map();
      [...g.children].filter(n => n.tagName === 'path').forEach(p => {
        const m = /M\s*[-\d.]+[ ,]+([-\d.]+)/.exec(p.getAttribute('d') || '');
        const vy = tY + sY * (m ? parseFloat(m[1]) : 0);
        const k  = Math.max(0, Math.min(BANDS - 1, Math.floor(vy / bandH)));
        (bucket.get(k) || bucket.set(k, []).get(k)).push(p);
      });
      [...bucket.keys()].sort((a, b) => a - b).forEach((k, order) => {
        const bg = document.createElementNS(NS, 'g');
        bg.setAttribute('class', 'ct-iz-band');
        bg.style.setProperty('--band-index', order);
        bucket.get(k)[0].parentNode.insertBefore(bg, bucket.get(k)[0]);
        bucket.get(k).forEach(p => bg.appendChild(p));
      });
    }

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-iz');
    svg.appendChild(wrap);

    const frameEls = new Array(FRAMES.length).fill(null);
    let current = null, idx = 0, started = false, timer = null;

    // Swap the shown frame and replay its band cascade (only one frame lives in
    // the DOM at a time — the 8 inlined frames are ~3k paths, too many to stack).
    function activate(i) {
      const el = frameEls[i];
      if (!el) return;
      if (current && current.parentNode) current.remove();
      current = el;
      el.classList.remove('ct-iz-in');
      wrap.appendChild(el);
      if (!rm) { void el.getBoundingClientRect(); el.classList.add('ct-iz-in'); }
    }

    // Self-rescheduling so each dwell is a fresh random 3 / 5 / 8 s (not a fixed beat).
    function scheduleNext() {
      const delay = DWELLS[Math.floor(Math.random() * DWELLS.length)];
      timer = setTimeout(() => {
        if (section.classList.contains('ct-paused')) { scheduleNext(); return; }  // frozen off-screen
        let next = idx, guard = 0;
        do { next = (next + 1) % FRAMES.length; guard++; }
        while (!frameEls[next] && guard <= FRAMES.length);
        if (frameEls[next]) { idx = next; activate(idx); }
        scheduleNext();
      }, delay);
    }
    function startCycle() { if (!timer) scheduleNext(); }

    FRAMES.forEach(([W, H], i) => {
      fetch(`images/contact/interfaz/${i + 1}.svg`)
        .then(r => r.text())
        .then(text => {
          const art = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
          if (art.nodeName !== 'svg') throw new Error('bad SVG payload');
          art.removeAttribute('id');
          art.removeAttribute('style');
          art.removeAttribute('width');
          art.removeAttribute('height');
          art.setAttribute('class', 'ct-iz-frame');
          art.setAttribute('x', SX.toFixed(1));
          art.setAttribute('y', SY.toFixed(1));
          art.setAttribute('width', SW.toFixed(1));
          art.setAttribute('height', SH.toFixed(1));
          art.setAttribute('viewBox', `0 0 ${W} ${H}`);
          // Keep each frame's true aspect (like the EVA/mech/side-art screens) so
          // the varying potrace-trimmed viewBoxes don't stretch/squish; letterboxes
          // cleanly over the dark panel background.
          art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          bandGroup(art, H);
          frameEls[i] = art;
          // Show the first frame that arrives, then start cycling.
          if (!started) { started = true; idx = i; activate(i); if (!rm) startCycle(); }
        })
        .catch(err => console.error('[contact] interfaz frame failed to load:', i + 1, err));
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     #glow_and_blink LAYER — per-element glow + random blink
     ════════════════════════════════════════════════════════════════════════
     The cockpit's "glow_and_blink" group is a cluster of small dashboard
     indicator lights. Each element gets a soft glow in its OWN colour and an
     independent, JS-randomised blink cadence (random duration + negative delay)
     so the panel reads like a live console of asynchronously flickering lights.
     CSS does the flicker (contact.css); #contact.ct-paused freezes it
     off-screen and reduced motion leaves the lights lit but static. */
  function initGlowBlink(svg) {
    const layer = svg.querySelector('#glow_and_blink');
    if (!layer) return;
    layer.querySelectorAll(':scope > *').forEach(el => {
      // Glow colour = the element's own fill (fallback to site amber).
      let c = '#EE9B00';
      try {
        const f = getComputedStyle(el).fill;
        if (f && f !== 'none' && !/rgba?\(0,\s*0,\s*0/.test(f)) c = f;
      } catch (e) { /* keep fallback */ }
      el.style.setProperty('--bk', c);
      el.style.setProperty('--bk-dur', (2.2 + Math.random() * 3.6).toFixed(2) + 's');
      el.style.setProperty('--bk-delay', '-' + (Math.random() * 6).toFixed(2) + 's');
      el.classList.add('ct-blink-el');
    });
  }

  injectCockpit();

  /* Pilot's hands — injected inline (groups: #color, #left_handline, plus a
     #pointer_invisible fingertip anchor used by the hand-pointer logic).
     Each copy gets its own id prefix and .stN class scope: the cockpit and
     both hands reuse the same Illustrator ids/class names, and inline
     <style> blocks are document-global. */
  function injectHandSvg(handEl, url, prefix, scopeSel, markClass) {
    if (!handEl) return;
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.querySelectorAll('[id]').forEach(el =>
          el.setAttribute('id', prefix + el.getAttribute('id')));
        svg.removeAttribute('id');
        svg.querySelectorAll('style').forEach(st => {
          st.textContent = st.textContent.replace(/\.st(\d+)\b/g, `${scopeSel} .st$1`);
        });
        if (markClass) svg.classList.add(...markClass.split(' '));
        handEl.appendChild(svg);
      })
      .catch(err => console.error('[contact] hand SVG failed to load:', url, err));
  }

  const handLeftEl  = section.querySelector('.ct-hand:not(.ct-hand--right)');
  const handRightEl = section.querySelector('.ct-hand--right');

  // Two poses per hand: the resting pose + a "click" pose (fingers pressed). The
  // click pose overlays the normal one (same viewBox) and is flashed on for a
  // beat whenever the hand taps something — see playHandClick(). Distinct id
  // prefixes + its own style scope keep the two inline SVGs from clashing.
  injectHandSvg(handLeftEl,  'images/mano%20izq.svg',        'hand-',   '.ct-hand',        'ct-hand-pose');
  injectHandSvg(handRightEl, 'images/mano%20der.svg',        'handr-',  '.ct-hand--right', 'ct-hand-pose');
  injectHandSvg(handLeftEl,  'images/mano%20izq%20click.svg', 'handlc-', '.ct-hand-pose--click', 'ct-hand-pose ct-hand-pose--click');
  injectHandSvg(handRightEl, 'images/mano%20der%20click.svg', 'handrc-', '.ct-hand-pose--click', 'ct-hand-pose ct-hand-pose--click');

  // Flash the click pose for ~160ms — the hand "taps" whatever it's pointing at.
  function playHandClick(handEl) {
    if (!handEl || !handEl.querySelector('.ct-hand-pose--click')) return;
    handEl.classList.add('is-clicking');
    clearTimeout(handEl._clickTimer);
    handEl._clickTimer = setTimeout(() => handEl.classList.remove('is-clicking'), 160);
  }

  /* ════════════════════════════════════════════════════════════════════════
     HAND POINTER — hovering/focusing a form element moves the hand so the
     fingertip (#hand-pointer_invisible) lands on a dashboard hover rect
     ════════════════════════════════════════════════════════════════════════ */

  /* Builds a pointer controller for one hand: pointAt(rectId) translates the
     hand so its fingertip anchor lands on the rect; reset() clears the inline
     transform so the CSS parked state slides the hand back off-screen. */
  /* Glow layer: a clone of the cockpit's #lines group, recolored by CSS and
     soft-masked to the active hover rect — so the line art inside that
     area glows and dissolves out at the edges, independent of how the
     source paths are grouped. The mask rect copies the hover rect's
     attributes (same user-space coordinates, same parent), so it needs no
     recomputation on resize. */
  function buildLitLayer(svg, key) {
    const lines = svg.querySelector('#lines');
    const hover = svg.querySelector('#hover');
    if (!lines || !hover || !hover.parentNode) return null;
    const NS = 'http://www.w3.org/2000/svg';
    const parent = hover.parentNode;

    const maskRect = buildSoftMask(parent, 'ct-lit-mask-' + key, 10);

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'ct-lit-layer');
    layer.setAttribute('mask', `url(#ct-lit-mask-${key})`);
    const clone = lines.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    layer.appendChild(clone);

    parent.appendChild(layer);
    return { layer, maskRect };
  }

  function makeHandPointer(handEl, tipSelector, key) {
    let lit = null;

    /* Glow on the line art under the fingertip — the rect stays invisible */
    function light(rectEl) {
      if (!lit && cockpitSvg) lit = buildLitLayer(cockpitSvg, key);
      if (!lit) return;
      lit.layer.classList.remove('ct-lit-on');
      if (!rectEl) return;
      ['x', 'y', 'width', 'height'].forEach(a =>
        lit.maskRect.setAttribute(a, rectEl.getAttribute(a)));
      lit.layer.classList.add('ct-lit-on');
    }

    function pointAt(rectId) {
      const tip    = section.querySelector(tipSelector);
      const target = section.querySelector('#' + rectId);
      if (!handEl || !tip || !target) return;   // SVGs not injected yet

      light(target);

      const tipBox = tip.getBoundingClientRect();
      const tgtBox = target.getBoundingClientRect();
      const secBox = section.getBoundingClientRect();

      // Fingertip layout position = current position minus the live
      // transform (covers the parked state and mid-transition measurements)
      let ex = 0, ey = 0;
      const tr = getComputedStyle(handEl).transform;
      if (tr && tr !== 'none') {
        const m = new DOMMatrixReadOnly(tr);
        ex = m.e; ey = m.f;
      }
      const restX = tipBox.left + tipBox.width  / 2 - ex;
      const restY = tipBox.top  + tipBox.height / 2 - ey;
      const tgtX  = tgtBox.left + tgtBox.width  / 2;
      // hover4/hover_8 extend below the viewBox — keep the hand on screen
      const tgtY  = Math.min(tgtBox.top + tgtBox.height / 2, secBox.bottom - 40);

      handEl.style.transform =
        `translate(${(tgtX - restX).toFixed(1)}px, ${(tgtY - restY).toFixed(1)}px)`;
    }

    const reset = () => {
      light(null);
      if (handEl) handEl.style.transform = '';
    };

    return { pointAt, reset };
  }

  /* Left hand ← form fields (fixed mapping to the left button column) */
  function initHandPointer() {
    const form = document.getElementById('ct-form');
    if (!form || !handLeftEl) return;

    const ptr = makeHandPointer(handLeftEl, '#hand-pointer_invisible', 'l');

    const HAND_TARGETS = {
      'ct-f-name':  'hover1',
      'ct-f-email': 'hover2',
      'ct-f-msg':   'hover3',
    };
    const SEND_TARGET = 'hover4';

    function targetFor(node) {
      if (!(node instanceof Element)) return null;
      if (node.closest('.ct-send')) return SEND_TARGET;
      const field = node.closest('.ct-field');
      if (!field) return null;
      const input = field.querySelector('input, textarea');
      return (input && HAND_TARGETS[input.id]) || null;
    }

    form.addEventListener('pointerover', (e) => {
      const t = targetFor(e.target);
      if (t) ptr.pointAt(t); else ptr.reset();
    });
    form.addEventListener('pointerleave', ptr.reset);
    // Tap: flash the click pose when pressing a field/button the hand points at.
    form.addEventListener('pointerdown', (e) => {
      if (targetFor(e.target)) playHandClick(handLeftEl);
    });

    /* keyboard parity */
    form.addEventListener('focusin', (e) => {
      const t = targetFor(e.target);
      if (t) ptr.pointAt(t);
    });
    form.addEventListener('focusout', (e) => {
      if (!form.contains(e.relatedTarget)) ptr.reset();
    });
  }

  initHandPointer();

  /* Right hand ← social links (random pick from the right screen cluster) */
  function initRightHandPointer() {
    const nav = section.querySelector('.ct-links--mini');
    if (!nav || !handRightEl) return;

    const ptr = makeHandPointer(handRightEl, '#handr-pointer_invisible', 'r');
    const SCREENS = ['hover_5', 'hover_6', 'hover_7', 'hover_8'];
    let lastLink = null;

    function pointRandom(link) {
      if (link === lastLink) return;        // re-aim only on a new link
      lastLink = link;
      ptr.pointAt(SCREENS[Math.floor(Math.random() * SCREENS.length)]);
    }

    const leave = () => { lastLink = null; ptr.reset(); };

    nav.addEventListener('pointerover', (e) => {
      const link = e.target instanceof Element && e.target.closest('.ct-link');
      if (link) pointRandom(link);
    });
    nav.addEventListener('pointerleave', leave);

    /* keyboard parity */
    nav.addEventListener('focusin', (e) => {
      const link = e.target instanceof Element && e.target.closest('.ct-link');
      if (link) pointRandom(link);
    });
    nav.addEventListener('focusout', (e) => {
      if (!nav.contains(e.relatedTarget)) leave();
    });
  }

  initRightHandPointer();

  /* DNA art inside the capsule next to the form — injected inline so CSS can
     recolor the (black) source paths to the shell's light blue. */
  function injectCapsuleDna() {
    const holder = section.querySelector('.ct-capsule-dna');
    if (!holder) return;
    fetch('images/roptando%201.svg')
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.removeAttribute('style');
        // The numbered top-level groups (1, 2, 3, 3.5, 4 … 8) are rotation
        // frames in document order — tag them so CSS can flipbook-cycle them.
        const frames = Array.from(svg.children).filter(n => n.nodeName === 'g');
        frames.forEach((g, i) => {
          g.classList.add('ct-dna-frame');
          if (i === 0) g.classList.add('ct-dna-first');
          g.style.setProperty('--dna-frame', i);
        });
        svg.style.setProperty('--ct-dna-count', frames.length);
        // Strip ids — Illustrator exports reuse Layer_1 etc. across files
        svg.removeAttribute('id');
        svg.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        holder.appendChild(svg);
        // The poses are scattered around the artboard (only frame 1 sits
        // inside the viewBox) — center each one horizontally and align all
        // platforms to the bottom edge. getBBox needs a rendered element.
        requestAnimationFrame(() => {
          const vb = svg.viewBox.baseVal;
          frames.forEach(g => {
            try {
              const b  = g.getBBox();
              const dx = (vb.width - b.width) / 2 - b.x;
              const dy = vb.height - (b.y + b.height);
              g.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
            } catch (e) { /* not rendered yet — frame keeps source position */ }
          });
        });
      })
      .catch(err => console.error('[contact] capsule DNA failed to load:', err));
  }

  injectCapsuleDna();

  /* ════════════════════════════════════════════════════════════════════════
     STACKED TITLE — per-letter split + staggered reveal
     (local replacement for the lettering.js + TimelineMax reference)
     ════════════════════════════════════════════════════════════════════════ */

  const titleEl    = section.querySelector('.ct-stack');
  const titleBtn   = section.querySelector('.ct-stack-btn');
  const motionOk   = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-hidden', 'true');   // h2 carries an aria-label
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'ct-stack-char';
      span.textContent = ch;
      frag.appendChild(span);
    }
    el.appendChild(frag);
  }

  if (titleEl) {
    titleEl.querySelectorAll('.ct-stack-line').forEach(splitChars);
    if (titleBtn) splitChars(titleBtn);
  }

  /* Appends the letter drop-in + button reveal to a timeline.
     Under reduced motion everything just snaps visible. */
  function appendTitleReveal(tl) {
    if (!titleEl) return;
    const chars = titleEl.querySelectorAll('.ct-stack-char');
    if (!chars.length) return;

    if (!motionOk()) {
      tl.set(chars, { opacity: 1, yPercent: 0 });
      if (titleBtn) tl.set(titleBtn, { autoAlpha: 1 });
      return;
    }

    if (titleBtn) tl.set(titleBtn, { autoAlpha: 0 });
    tl.fromTo(chars,
      { opacity: 0, yPercent: 130 },
      { opacity: 1, yPercent: 0, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.05 }
    );
    if (titleBtn) tl.to(titleBtn, { autoAlpha: 1, duration: 0.2 });
  }

  function replayTitle() {
    if (typeof gsap === 'undefined') return;
    appendTitleReveal(gsap.timeline());
  }

  if (titleBtn) titleBtn.addEventListener('click', replayTitle);

  /* ════════════════════════════════════════════════════════════════════════
     BOOT SEQUENCE — GSAP timeline
     ════════════════════════════════════════════════════════════════════════ */

  let sceneBoot = false;
  let resizeTimer;

  function glitchIn(tl, target, position, opts = {}) {
    const { withY = false, withScaleY = false } = opts;
    const base = withY      ? { opacity: 0, y: '28%' }
               : withScaleY ? { opacity: 0, scaleY: 0.04, scaleX: 1.08 }
               :               { opacity: 0 };

    tl.set(target, base, position);

    if (withY) {
      tl.to(target, { y: 0, opacity: 0.9, duration: 0.14, ease: 'power2.out' });
      tl.to(target, { opacity: 0.05, duration: 0.07 });
    } else if (withScaleY) {
      tl.to(target, { scaleY: 0.08, scaleX: 1.05, opacity: 0.9, duration: 0.10 });
      tl.to(target, { opacity: 0.1,  duration: 0.06 });
      tl.to(target, { scaleY: 0.42, scaleX: 1, opacity: 1, duration: 0.14 });
      tl.to(target, { opacity: 0.45, duration: 0.07 });
      tl.to(target, { scaleY: 0.78, opacity: 1, duration: 0.12 });
      tl.to(target, { opacity: 0.8,  duration: 0.05 });
      tl.to(target, { scaleY: 1,    opacity: 1, duration: 0.10 });
      return;
    } else {
      tl.to(target, { opacity: 0.88, duration: 0.09 });
      tl.to(target, { opacity: 0.04, duration: 0.06 });
    }
    tl.to(target, { opacity: 1,    duration: 0.10 });
    tl.to(target, { opacity: 0.35, duration: 0.06 });
    tl.to(target, { opacity: 1,    duration: 0.09 });
    tl.to(target, { opacity: 0.65, duration: 0.05 });
    tl.to(target, { opacity: 1,    duration: 0.08 });
  }

  function bootScene() {
    if (sceneBoot || typeof gsap === 'undefined') return;
    sceneBoot = true;

    buildStars();

    gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      glitchIn(tl, '#ct-stars', 0);
      glitchIn(tl, ['.ct-horizon-glow', '.ct-mountains--far'], '+=0.08', { withY: true });
      glitchIn(tl, '.ct-mountains--mid',  '+=0.06', { withY: true });
      glitchIn(tl, '.ct-mountains--near', '+=0.05', { withY: true });
      glitchIn(tl, '.ct-sun',   '+=0.08', { withScaleY: true });
      glitchIn(tl, '.ct-ground','+=0.08', { withY: true });

      // Cockpit entrance overlaps the landscape build: the container glitches
      // in while #lines, #colors and #holo are all class-hidden. The glitch
      // runs in a sub-timeline so it can sit at an absolute position while
      // the background tweens keep appending sequentially after it.
      // Phones: the cockpit is display:none (responsive.css, owner directive
      // 2026-07-10) but its build used to stretch the timeline ~5s, so the
      // title/form appeared over an empty sky long after the landscape. Skip
      // the whole cockpit act — content enters right after the ground.
      const isPhone = !!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile);
      if (!isPhone) {
        const HOLO_AT = 0.1;
        const holoTl = gsap.timeline({ defaults: { ease: 'none' } });
        glitchIn(holoTl, '.ct-cockpit', 0);
        tl.add(holoTl, HOLO_AT);

        // Cockpit build: the teal wireframe fades in first, then the color art
        // underneath, then the lines settle back to their original colors, and
        // finally the blue holo windshield beam reveals last — all while the
        // landscape finishes behind.
        const holoEnd = HOLO_AT + holoTl.duration();
        tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-hide-lines'),
                null, holoEnd + 0.3);
        tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-no-colors'),
                null, holoEnd + 1.3);
        tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-lines-teal'),
                null, holoEnd + 2.6);
        tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-hide-holo'),
                null, holoEnd + 3.6);
      }

      // Content entrance (fade + form-part stagger + glitch + title) is appended
      // after the landscape/cockpit build so it reveals last. Factored out so a
      // contact nav-button click can replay it on its own — see
      // replayContentEntrance().
      appendContentEntrance(tl, '+=0.08');

    }, section);
  }

  /* Builds the form/content entrance onto a timeline. Shared by the first-run
     bootScene (sequenced after the scene) and by standalone nav re-entry.
     `contentAt` positions where the .ct-content fade starts. */
  function appendContentEntrance(tl, contentAt) {
    // Hide title letters from t=0 so they don't flash before their drop-in.
    // (The button's chars are handled via autoAlpha on the button itself.)
    tl.set('.ct-stack .ct-stack-char', { opacity: 0 }, 0);

    tl.fromTo('.ct-content',
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      contentAt
    );

    // Per-letter glitch scramble on the form text (NEW_MESSAGE, field labels,
    // send) as the content reveals. Skipped under reduced motion so the text
    // just appears statically. See contact.css.
    tl.call(() => {
      if (motionOk()) section.classList.add('ct-glitch-in');
    }, null, '<');

    // Assemble the form piece by piece: header → fields → send → links. Done in
    // GSAP (not CSS) so the form stays visible if GSAP never loads; under
    // reduced motion the parts simply ride the .ct-content fade above.
    if (motionOk()) {
      const formParts = section.querySelectorAll(
        '.ct-form-head, .ct-form-grid .ct-field, .ct-form-foot, .ct-links--mini'
      );
      tl.fromTo(formParts,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 },
        '<0.1'
      );
    }

    appendTitleReveal(tl);
  }

  /* Replays just the content entrance — the synthwave scene + cockpit stay put.
     Needed because bootScene is a one-shot (sceneBoot guard) and the section's
     IntersectionObserver never re-boots, so a nav-button click would otherwise
     land on a static, already-revealed form. On the very first visit it defers
     to bootScene so the scene builds too. */
  function replayContentEntrance() {
    if (typeof gsap === 'undefined') return;
    // We're navigating into the section: clear the off-screen .ct-paused guard
    // up front so its animation-play-state:paused doesn't freeze the glitch /
    // capsule keyframes at frame 0 before the IntersectionObserver catches up.
    section.classList.remove('ct-paused');
    if (!sceneBoot) { bootScene(); return; }
    // Re-arm the CSS-gated pieces (glitch text, capsule grow, DNA fade): drop
    // the gate class and flush a reflow so re-adding it restarts the keyframes.
    section.classList.remove('ct-glitch-in');
    void section.offsetWidth;
    gsap.context(() => {
      appendContentEntrance(gsap.timeline({ defaults: { ease: 'none' } }), 0);
    }, section);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER
     ════════════════════════════════════════════════════════════════════════ */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.remove('ct-paused');
          if (!sceneBoot) bootScene();
        } else {
          section.classList.add('ct-paused');
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(section);

  // Replay the entrance when the contact nav button is clicked. NavigationManager
  // dispatches app:navigate (before its instant scrollTo), and the general-rule
  // branch relies on "observer re-entry" that never fires for an already-booted
  // section — so we replay explicitly here, mirroring #art-direction's
  // App.playArtEntranceAnimation() hook. The section is in view a frame later,
  // so the timeline plays right as it lands.
  document.addEventListener('app:navigate', (e) => {
    if (e.detail && e.detail.sectionId === 'contact') replayContentEntrance();
  });

  window.addEventListener('resize', () => {
    updateCockpitAspect();
    if (!sceneBoot) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStars, 250);
  });

  /* ════════════════════════════════════════════════════════════════════════
     CONTACT FORM — comms-console uplink
     Real transport: POSTs to the Cloudflare Pages Function /api/contact, which
     verifies Turnstile and relays via Resend to the site inbox. Success
     is shown only on a backend-confirmed send; otherwise a direct-email link is
     revealed. See web/functions/api/contact.js + DEPLOY-CLOUDFLARE.md.
     ════════════════════════════════════════════════════════════════════════ */

  function initContactForm() {
    const form      = document.getElementById('ct-form');
    if (!form) return;

    const logText   = form.querySelector('.ct-log-text');
    const srStatus  = document.getElementById('ct-sr-status');
    const sendBtn   = form.querySelector('.ct-send');
    const successEl = document.getElementById('ct-form-success');
    const resetBtn  = form.querySelector('.ct-success-reset');
    const honeypot  = form.querySelector('.ct-hp');

    // Bilingual UI strings, resolved at call time from <html lang> so the
    // [EN]/[ES] toggle also covers the typed log lines, validation errors and
    // screen-reader announcements (the static markup is handled by data-i18n /
    // data-i18n-split + locales/*.json).
    const CT_TEXTS = {
      en: {
        ready:       '> READY',
        checkFields: '> ERROR :: CHECK FIELDS',
        connecting:  '> CONNECTING…',
        sendingMsg:  '> SENDING MESSAGE…',
        sent:        '> MESSAGE SENT ✓',
        failed:      '> SEND FAILED — WRITE ME DIRECTLY ↓',
        nameReq:     'ERR: name is required',
        emailReq:    'ERR: email is required',
        emailInv:    'ERR: invalid email address',
        msgReq:      'ERR: message is empty',
        aFields:     'Some fields need attention.',
        aSending:    'Sending message…',
        aSent:       'Message sent. Expect a reply within 24 hours.',
        aFailed:     'Sending failed. Please use the direct email link below.',
      },
      es: {
        ready:       '> LISTO',
        checkFields: '> ERROR :: REVISA LOS CAMPOS',
        connecting:  '> CONECTANDO…',
        sendingMsg:  '> ENVIANDO MENSAJE…',
        sent:        '> MENSAJE ENVIADO ✓',
        failed:      '> FALLÓ EL ENVÍO :: ESCRÍBEME DIRECTO ↓',
        nameReq:     'ERR: el nombre es obligatorio',
        emailReq:    'ERR: el email es obligatorio',
        emailInv:    'ERR: email no válido',
        msgReq:      'ERR: el mensaje está vacío',
        aFields:     'Algunos campos necesitan atención.',
        aSending:    'Enviando mensaje…',
        aSent:       'Mensaje enviado. Te respondo en menos de 24 horas.',
        aFailed:     'El envío falló. Usa el enlace de email directo abajo.',
      },
    };
    const ctT = k => (CT_TEXTS[document.documentElement.lang] || CT_TEXTS.en)[k];

    // Keep the idle log line in the active language when the toggle fires.
    document.addEventListener('languagechanged', () => {
      if (logText && /^> (READY|LISTO)$/.test(logText.textContent.trim())) {
        logText.textContent = ctT('ready');
      }
    });

    const fields = [
      { el: document.getElementById('ct-f-name'),  empty: 'nameReq' },
      { el: document.getElementById('ct-f-email'), empty: 'emailReq', invalid: 'emailInv' },
      { el: document.getElementById('ct-f-msg'),   empty: 'msgReq' },
    ];
    if (!sendBtn || !successEl || fields.some(f => !f.el)) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wait = ms => new Promise(r => setTimeout(r, ms));

    /* ── TRANSPORT ──────────────────────────────────────────────────────────
       POSTs the message to the Cloudflare Pages Function at /api/contact, which
       verifies Turnstile and relays the mail to the site inbox via Resend
       (see web/functions/api/contact.js + DEPLOY-CLOUDFLARE.md). Before Cloudflare
       is live (e.g. on GitHub Pages) that endpoint 404s, so sendTransmission
       throws and the submit handler falls back to the direct email link — the UI
       never claims success unless the backend actually confirms it. */
    const CONTACT_ENDPOINT = '/api/contact';
    // Assembled from parts so the literal address never sits in this source file
    // (scraper obfuscation — matches js/email-guard.js).
    const CONTACT_EMAIL    = ['mail', 'sergio-ayala.com'].join('@');
    /* Cloudflare Turnstile site key. This is the official ALWAYS-PASSES *test*
       key; swap it for the real site key at deploy (see DEPLOY-CLOUDFLARE.md). */
    const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

    const mailFallbackLink = document.getElementById('ct-mail-fallback');

    // ── Turnstile: explicit render, token read on submit ──────────────────
    /* The widget only pairs with the Cloudflare Pages Function backend at
       /api/contact. On GitHub Pages / local dev that endpoint doesn't exist, so
       the widget serves no purpose AND (with the test site key) Cloudflare paints
       its red "For testing only — report to site owner" banner. Skip rendering
       off the production backend; the submit handler already degrades to the
       direct-email fallback when the endpoint is unreachable. */
    function backendAvailable() {
      const h = location.hostname;
      return location.protocol !== 'file:' &&
             !/\.github\.io$/i.test(h) &&
             !/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)$/i.test(h);
    }

    let turnstileWidgetId = null;
    function renderTurnstile() {
      const box = document.getElementById('ct-turnstile');
      if (!box || turnstileWidgetId !== null || !window.turnstile || !backendAvailable()) return;
      try {
        turnstileWidgetId = window.turnstile.render(box, {
          sitekey: TURNSTILE_SITE_KEY,
          theme:   'dark',
          size:    'flexible',
        });
      } catch (_) { /* invalid key or double-render — degrade silently */ }
    }
    function turnstileToken() {
      if (!window.turnstile || turnstileWidgetId === null) return '';
      try { return window.turnstile.getResponse(turnstileWidgetId) || ''; }
      catch (_) { return ''; }
    }
    function resetTurnstile() {
      if (!window.turnstile || turnstileWidgetId === null) return;
      try { window.turnstile.reset(turnstileWidgetId); } catch (_) {}
    }
    // The async api.js fires this once ready (see the ?onload= param on its tag);
    // also attempt an immediate render in case it loaded before this ran.
    window.onloadTurnstileCallback = renderTurnstile;
    renderTurnstile();

    // Prefilled mailto used by the failure fallback link.
    function mailtoHref(payload) {
      const subject = `Portfolio contact — ${payload.name}`;
      const body =
        `Name: ${payload.name}\n` +
        `Email: ${payload.email}\n\n` +
        `${payload.message}\n`;
      return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
             `&body=${encodeURIComponent(body)}`;
    }

    /* Resolves only on a backend-confirmed send; throws otherwise so the submit
       handler can reveal the direct-email fallback. */
    async function sendTransmission(payload) {
      const res = await fetch(CONTACT_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    payload.name,
          email:   payload.email,
          message: payload.message,
          company: honeypot ? honeypot.value : '',
          'cf-turnstile-response': turnstileToken(),
        }),
      });
      if (!res.ok) {
        let detail = '';
        try { detail = (await res.json()).error || ''; } catch (_) {}
        throw new Error(`HTTP ${res.status}${detail ? ' — ' + detail : ''}`);
      }
      return res.json().catch(() => ({ ok: true }));
    }

    function announce(msg) {
      if (srStatus) srStatus.textContent = msg;
    }

    /* Types into the decorative log; instant under reduced motion. */
    let typeToken = 0;
    function typeLog(text, speed = 16) {
      const token = ++typeToken;
      if (!logText) return Promise.resolve();
      if (reducedMotion.matches) {
        logText.textContent = text;
        return Promise.resolve();
      }
      logText.textContent = '';
      return new Promise(resolve => {
        let i = 0;
        (function tick() {
          if (token !== typeToken) return resolve();
          logText.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(tick, speed);
          else resolve();
        })();
      });
    }

    function setFieldError(field, msg) {
      const wrap = field.el.closest('.ct-field');
      if (wrap) {
        wrap.classList.toggle('is-invalid', !!msg);
        const err = wrap.querySelector('.ct-field-err');
        if (err) err.textContent = msg || '';
      }
      field.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    function validate() {
      let firstBad = null;
      fields.forEach(f => {
        let msg = '';
        if (!f.el.value.trim())          msg = ctT(f.empty);
        else if (!f.el.checkValidity())  msg = ctT(f.invalid || f.empty);
        setFieldError(f, msg);
        if (msg && !firstBad) firstBad = f.el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    fields.forEach(f => {
      f.el.addEventListener('input', () => setFieldError(f, ''));
    });

    let sending = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      if (honeypot && honeypot.value) return;   // bot — drop silently

      if (!validate()) {
        typeLog(ctT('checkFields'));
        announce(ctT('aFields'));
        return;
      }

      sending = true;
      form.classList.add('is-sending');
      sendBtn.disabled = true;
      if (mailFallbackLink) mailFallbackLink.hidden = true;
      announce(ctT('aSending'));

      const payload = {
        name:    fields[0].el.value.trim(),
        email:   fields[1].el.value.trim(),
        message: fields[2].el.value.trim(),
        sentAt:  new Date().toISOString(),
      };

      try {
        await typeLog(ctT('connecting'));
        await wait(reducedMotion.matches ? 0 : 250);
        await typeLog(ctT('sendingMsg'));
        await sendTransmission(payload);
        await typeLog(ctT('sent'));

        form.classList.add('is-sent');
        successEl.hidden = false;
        announce(ctT('aSent'));
        const title = successEl.querySelector('.ct-success-title');
        if (title) title.focus();
      } catch (err) {
        console.error('[contact] transmission failed:', err);
        await typeLog(ctT('failed'));
        announce(ctT('aFailed'));
        if (mailFallbackLink) {
          mailFallbackLink.href   = mailtoHref(payload);
          mailFallbackLink.hidden = false;
        }
        resetTurnstile();
      } finally {
        sending = false;
        form.classList.remove('is-sending');
        sendBtn.disabled = form.classList.contains('is-sent');
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        fields.forEach(f => setFieldError(f, ''));
        form.classList.remove('is-sent');
        successEl.hidden = true;
        sendBtn.disabled = false;
        if (mailFallbackLink) mailFallbackLink.hidden = true;
        resetTurnstile();
        typeLog(ctT('ready'));
        announce('');
        fields[0].el.focus();
      });
    }
  }

  initContactForm();

  /* Hover-to-glitch on every piece of text in the contact panel. Two modes,
     because the markup is mixed:
       (A) Already split into [data-char] glyphs (title, field labels, send) →
           replay the site's per-letter scramble via a none → glitch-switch
           restart. Self-contained (no GlitchSystem dependency); the global
           .glitch-firing CSS uses !important so it beats the .ct-glitch-in gate.
       (B) Plain text (BOGOTÁ ▸ WORLDWIDE feed, the > READY log line, the
           whatsapp/instagram/linkedin links) isn't split, so a lightweight
           character scramble decodes the text on hover without touching its
           markup or styling. */
  function initFormTextGlitch() {
    const section = document.getElementById('contact');
    if (!section) return;
    if (window.App && window.App.BrowserDetect && window.App.BrowserDetect.isTouch) return;

    const CHARS = (window.GLITCH_CHARS && window.GLITCH_CHARS.length)
      ? window.GLITCH_CHARS
      : '`¡™£¢∞§¶•ªºåß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>'.split('');

    // ── (A) per-letter restart on the split glitch-text elements ──────────
    const fire = el => {
      el.classList.add('glitch-suppressed');
      el.classList.remove('glitch-firing');
      void el.getBoundingClientRect();
      el.classList.add('glitch-firing');
    };
    // Attach unconditionally: Splitting.js (GlitchSystem.initSplitting) runs
    // later, inside LanguageManager.ready — AFTER this IIFE. So the [data-char]
    // glyphs don't exist yet at wire-up time; they do by the time the user
    // hovers, and fire() only toggles classes the global CSS keys off.
    section
      .querySelectorAll('.ct-form-title.glitch-text, .ct-field label.glitch-text, .ct-send.glitch-text')
      .forEach(el => {
        el.addEventListener('mouseenter', () => fire(el));
        el.addEventListener('mouseleave', () => el.classList.remove('glitch-firing'));
      });

    // ── (B) decode-scramble on the plain-text bits ────────────────────────
    const firstTextNode = el => {
      for (const n of el.childNodes) {
        if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) return n;
      }
      return null;
    };

    const attachScramble = el => {
      const node = firstTextNode(el);
      if (!node) return;
      const glyphs = Array.from(node.nodeValue);
      let timer = null;

      const restore = () => {
        if (timer) { clearInterval(timer); timer = null; }
        // Re-read the live original each time so the log line (which contact.js
        // rewrites) restores to whatever it currently says, not a stale capture.
        node.nodeValue = node._ctOriginal;
      };

      el.addEventListener('mouseenter', () => {
        if (timer) return;
        node._ctOriginal = node.nodeValue;
        const original = Array.from(node._ctOriginal);
        let step = 0;
        timer = setInterval(() => {
          step += 1;
          const settled = step * 1.6;            // glyphs lock in left-to-right
          node.nodeValue = original
            .map((c, i) => {
              if (c === ' ' || c === '\n' || c === '\t') return c;
              if (i < settled) return c;
              return CHARS[(Math.random() * CHARS.length) | 0];
            })
            .join('');
          if (settled >= original.length) restore();
        }, 28);
      });
      el.addEventListener('mouseleave', restore);
    };

    section
      .querySelectorAll('.ct-form-feed, .ct-log-text, .ct-links--mini .ct-link')
      .forEach(attachScramble);
  }

  initFormTextGlitch();
})();


;
/* ===== illustration-ink-cursor.js ===== */
/**
 * Ink cursor effect for the #illustration section.
 * Matches the reference goo cursor mechanics (Eder Anaya, 2018) with
 * portfolio-palette colours and scoped activation via IntersectionObserver.
 * Activates with a fresh random colour each time the section enters view.
 */
(function () {
  'use strict';

  // ── Constants matching the reference exactly ─────────────────────────────────
  const AMOUNT     = 20;
  const SINE_DOTS  = Math.floor(AMOUNT * 0.3);   // 6
  const WIDTH      = 26;                          // dot diameter in px
  const LERP       = 0.35;
  const IDLE_MS    = 150;
  const FILTER_ID  = 'ink-goo-filter';
  const CURSOR_ID  = 'ink-cursor';

  // Portfolio palette — colours with contrast against the #003847 section bg
  const PALETTE = [
    '#94D2BD',  // mint
    '#E9D8A6',  // warm cream
    '#EE9B00',  // amber
    '#CA6702',  // orange-brown
    '#BB3E03',  // rust
    '#AE2012',  // dark red
    '#9B2226',  // deep red
    '#00ffff',  // cyan
  ];

  function pickColor() {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }

  // ── SVG goo filter — reference values ────────────────────────────────────────
  function injectFilter() {
    if (document.getElementById(FILTER_ID)) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('version', '1.1');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    svg.innerHTML = `
      <defs>
        <filter id="${FILTER_ID}">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
            result="goo"/>
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
      </defs>`;
    document.body.appendChild(svg);
  }

  // ── Dot ──────────────────────────────────────────────────────────────────────
  class Dot {
    constructor(index, container) {
      this.index      = index;
      this.x          = 0;
      this.y          = 0;
      // reference formula exactly
      this.scale      = 1 - 0.05 * index;
      this.range      = WIDTH / 2 - (WIDTH / 2) * this.scale + 2;
      this.angleSpeed = 0.05;
      this.angleX     = Math.PI * 2 * Math.random();
      this.angleY     = Math.PI * 2 * Math.random();
      this.lockX      = 0;
      this.lockY      = 0;

      // All dots same DOM size; scale applied via CSS transform so the goo
      // filter sees uniform-radius blobs and merges them correctly
      this.el = document.createElement('span');
      this.el.style.cssText =
        'position:absolute;display:block;' +
        `width:${WIDTH}px;height:${WIDTH}px;` +
        'border-radius:50%;' +
        'transform-origin:center center;' +
        'will-change:transform;';
      container.appendChild(this.el);
    }

    setColor(color) {
      this.el.style.background = color;
    }

    lock() {
      this.lockX  = this.x;
      this.lockY  = this.y;
      this.angleX = Math.PI * 2 * Math.random();
      this.angleY = Math.PI * 2 * Math.random();
    }

    draw(idle) {
      if (idle && this.index > SINE_DOTS) {
        this.angleX += this.angleSpeed;
        this.angleY += this.angleSpeed;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
      }
      // translate positions the dot; scale is applied in-place around its centre
      this.el.style.transform =
        `translate(${this.x}px,${this.y}px) scale(${this.scale})`;
    }
  }

  // ── Main controller ──────────────────────────────────────────────────────────
  class IllustrationInkCursor {
    constructor() {
      this.section   = document.getElementById('illustration');
      if (!this.section) return;

      // Mouse-follow goo cursor is meaningless (and a wasted rAF) on touch
      // devices, and hiding the real cursor on a hybrid touch+mouse device with
      // no replacement looks broken. Skip building it on coarse pointers.
      if (App.BrowserDetect && App.BrowserDetect.isTouch) return;

      this.active    = false;
      this.idle      = false;
      this.inView    = false;   // tunnel ≥ 50% in viewport
      this.handoff   = false;   // frozen cross-dissolve into #contact is running
      this.dots      = [];
      this.mouse     = { x: 0, y: 0 };
      this.rafId     = null;
      this.idleTimer = null;
      this.container = null;

      injectFilter();
      this._buildContainer();
      this._buildDots();
      this._observe();
    }

    _buildContainer() {
      this.container = document.createElement('div');
      this.container.id = CURSOR_ID;
      // mix-blend-mode:difference makes the ink invert whatever is beneath it,
      // matching the reference's visual style; filter applies the goo merge
      this.container.style.cssText =
        'pointer-events:none;' +
        'position:fixed;top:0;left:0;width:0;height:0;' +
        `z-index:9999;` +
        `filter:url(#${FILTER_ID});` +
        'mix-blend-mode:difference;' +
        'display:none;';
      document.body.appendChild(this.container);
    }

    _buildDots() {
      for (let i = 0; i < AMOUNT; i++) {
        this.dots.push(new Dot(i, this.container));
      }
    }

    _applyColor(color) {
      this.dots.forEach(d => d.setColor(color));
    }

    _observe() {
      // #illustration is 600 vh — max intersectionRatio ≈ 0.167, so threshold:0.5
      // can never fire on the section itself. The sticky .illus-tunnel child is
      // always 100 vh in the viewport during scroll, so it reaches ratio 1.0.
      const target = this.section.querySelector('.illus-tunnel') || this.section;
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            this.inView = e.intersectionRatio >= 0.5;
            this._sync();
          });
        },
        { threshold: [0, 0.5, 1.0] }
      );
      observer.observe(target);

      // During the frozen handoff into #contact (illus-cube.js) the tunnel is
      // still pinned ≥ 50% in view, so the observer never releases — but #contact
      // has taken over as the interactive layer and the goo cursor must not bleed
      // over it. Drive activation off both signals instead of intersection alone.
      window.addEventListener('illus:handoff', e => {
        this.handoff = !!(e.detail && e.detail.active);
        this._sync();
      });
    }

    // Cursor is live only while the gallery is both in view AND the foreground
    // layer. _activate/_deactivate are idempotent, so re-running this is cheap.
    _sync() {
      if (this.inView && !this.handoff) this._activate();
      else                              this._deactivate();
    }

    _activate() {
      if (this.active) return;
      this.active = true;
      this._applyColor(pickColor());
      this.container.style.display = 'block';
      this._onMove = e => this._handleMove(e.clientX, e.clientY);
      window.addEventListener('mousemove', this._onMove, { passive: true });
      this._startIdleTimer();
      this.rafId = requestAnimationFrame(() => this._frame());
    }

    _deactivate() {
      if (!this.active) return;
      this.active = false;
      this.container.style.display = 'none';
      window.removeEventListener('mousemove', this._onMove);
      clearTimeout(this.idleTimer);
      if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    }

    _handleMove(cx, cy) {
      this.mouse.x = cx - WIDTH / 2;
      this.mouse.y = cy - WIDTH / 2;
      this._resetIdleTimer();
    }

    _startIdleTimer() {
      this.idleTimer = setTimeout(() => {
        this.idle = true;
        this.dots.forEach(d => d.lock());
      }, IDLE_MS);
    }

    _resetIdleTimer() {
      clearTimeout(this.idleTimer);
      this.idle = false;
      this._startIdleTimer();
    }

    _frame() {
      if (!this.active) return;
      let x = this.mouse.x;
      let y = this.mouse.y;
      this.dots.forEach((dot, i, arr) => {
        const next = arr[i + 1] || arr[0];
        dot.x = x;
        dot.y = y;
        dot.draw(this.idle);
        if (!this.idle || i <= SINE_DOTS) {
          const dx = (next.x - dot.x) * LERP;
          const dy = (next.y - dot.y) * LERP;
          x += dx;
          y += dy;
        }
      });
      this.rafId = requestAnimationFrame(() => this._frame());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new IllustrationInkCursor());
  } else {
    new IllustrationInkCursor();
  }
})();


;
/* ===== illus-cube.js ===== */
(function () {
    'use strict';

    const IMAGES = [
        'images/illustration/sergio-ayala-themberchaud-dnd-dragon-concept-art.webp', // stop 0 — gallery title face; image hidden behind label
        'images/illustration/sergio-ayala-themberchaud-dnd-dragon-concept-art.webp',
        'images/illustration/sergio-ayala-hada-de-los-andes-andean-fairy-illustration-2024.webp',
        'images/illustration/meninas/sergio-ayala-meninas-canido-tarot-illustration-ferrol-2024.webp',
        'images/illustration/sergio-ayala-rocker-ghost-geisha-yurei-illustration-2024.webp',
        'images/illustration/sergio-ayala-mujer-crustaceo-surrealist-mixed-media-2014.webp',
        'images/illustration/faber castell/sergio-ayala-reconciliacion-watercolor-digital-2014.webp',
        'images/illustration/draconic love/sergio-ayala-draconic-love-dragon-illustration-2019.webp',
        'images/illustration/sergio-ayala-colibri-hummingbird-surrealist-mixed-media-2024.webp',
        'images/illustration/sergio-ayala-illustration-muse-mixed-media-2024.webp',
        'images/illustration/sergio-ayala-photography-fujifilm-camera-mixed-media-2024.webp',
        'images/illustration/sergio-ayala-web-design-cyborg-mixed-media-2024.webp',
        'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-hugo-molly-mascot-characters-colombia.webp',
    ];

    const FACE_NAMES = IMAGES.map(src =>
        src.split('/').pop().replace(/\.[^.]+$/, '').toUpperCase()
    );

    // Stop 0 is the section intro (no photo yet) — show the gallery title in the
    // HUD instead of the first image's filename.
    const INTRO_LABEL = '· S e r g i o  A y a l a ·   I L L U S T R A T I O N   -   G A L L E R Y';


    const N            = IMAGES.length;
    const SWAP_RADIUS  = 3;

    const FACE_COLORS = [
        { hex: '#005F73', rgb: '0,95,115'    },
        { hex: '#0A9396', rgb: '10,147,150'  },
        { hex: '#94D2BD', rgb: '148,210,189' },
        { hex: '#E9D8A6', rgb: '233,216,166' },
        { hex: '#EE9B00', rgb: '238,155,0'   },
        { hex: '#CA6702', rgb: '202,103,2'   },
        { hex: '#BB3E03', rgb: '187,62,3'    },
        { hex: '#AE2012', rgb: '174,32,18'   },
        { hex: '#9B2226', rgb: '155,34,38'   },
    ];

    const rand = window.mulberry32(0xA1B2C3D4);

    const STOPS        = buildRandomStops(N);
    const FACE_MAP     = buildFaceMap(STOPS);
    const INTRO_FACE   = FACE_MAP[0]; // physical face shown at stop 0 — reserved for text

    // One color per stop, seeded after buildRandomStops so the sequence is stable
    const STOP_COLORS  = Array.from({ length: N }, () =>
        Math.floor(rand() * FACE_COLORS.length)
    );

    // The original reference uses 3 transition types: pure pitch (drx=±90, dry=0),
    // pure yaw (drx=0, dry=±90), and diagonal (drx=±90, dry=±90).
    // All 8 signed variants are available; each stop randomly picks one,
    // keeping rx in {-90, 0, 90} so faces always land correctly.
    function buildRandomStops(n) {
        const MOVES = [
            { drx: -90, dry:   0 },
            { drx: +90, dry:   0 },
            { drx:   0, dry: -90 },
            { drx:   0, dry: +90 },
            { drx: -90, dry: -90 },
            { drx: +90, dry: +90 },
            { drx: -90, dry: +90 },
            { drx: +90, dry: -90 },
        ];
        const stops = [{ rx: 90, ry: 0 }];
        let rx = 90, ry = 0;
        for (let i = 1; i < n; i++) {
            // At top/bottom (rx=±90) yaw doesn't change the visible face, so force a pitch.
            const atPole = rx === 90 || rx === -90;
            const valid  = MOVES.filter(m => {
                const newRx = rx + m.drx;
                // newRx !== 90 keeps the top face (INTRO_FACE) reserved for stop 0 only,
                // preventing stop 2+ from landing on the same physical face and corrupting
                // the gallery-title label / showing the wrong image on first entry.
                return newRx >= -90 && newRx <= 90 && newRx !== 90 && (!atPole || m.drx !== 0);
            });
            const move = valid[Math.floor(rand() * valid.length)];
            rx += move.drx;
            ry += move.dry;
            stops.push({ rx, ry });
        }
        return stops;
    }

    // Maps each stop index to which of the 6 physical cube faces is visible at that orientation.
    function buildFaceMap(stops) {
        return stops.map(({ rx, ry }) => {
            const rxN = ((rx % 360) + 360) % 360;
            if (rxN === 90)  return 0; // top
            if (rxN === 270) return 5; // bottom
            const ryN = ((ry % 360) + 360) % 360;
            if (ryN === 0)   return 1; // front
            if (ryN === 270) return 2; // right
            if (ryN === 180) return 3; // back
            return 4;                  // left
        });
    }

    const illus = document.getElementById('illustration');
    if (!illus) return;

    // Lock the section in suppressed state immediately — before any RAF frame or
    // updateUI call can trigger the normal card reveal transitions.
    illus.classList.add('illus-intro-active');

    const tunnel         = illus.querySelector('.illus-tunnel');
    const cube           = illus.querySelector('.illus-cube');
    const faces       = [...illus.querySelectorAll('.illus-face')];
    const hudPct      = illus.querySelector('.illus-hud-pct');
    const progFill    = illus.querySelector('.illus-progress-fill');
    const sceneLabel  = illus.querySelector('.illus-scene-label');
    const dots        = [...illus.querySelectorAll('.illus-dot')];
    const strip       = illus.querySelector('.illus-strip');
    const infoSvg     = illus.querySelector('.illus-info-svg');
    const lustEl      = illus.querySelector('.illus-lust-accent');

    // Scale section height to number of images. Scroll progress is normalized to
    // offsetHeight (see _update), so a shorter per-stop height on phones just
    // makes the cube scroll brisker without breaking the choreography.
    // Phone perf mode: skip per-frame writes to HUD nodes hidden by
    // responsive.css, the electric-border driver (its faces are display:none on
    // phones), the Splitting.js glitches on hidden hint/title, and DOM writes
    // while the cube is parked. Desktop path is untouched.
    const IS_MOBILE = !!(App.BrowserDetect && App.BrowserDetect.isMobile);
    const stopVh = IS_MOBILE ? 65 : 100;
    // Reserve a frozen exit band at the very end of the section. The tunnel stays
    // pinned through this band (the section bottom hasn't reached the viewport
    // bottom yet), so while scrolling it the entrance choreography plays in
    // reverse — text/SVG slide back out, the cube shrinks away — leaving only the
    // background before #contact finally scrolls up.
    const EXIT_VH    = stopVh;   // frozen band where illustration content slides out
    const HANDOFF_VH = stopVh;   // frozen band for the cross-dissolve into #contact
    const totalVh    = N * stopVh + EXIT_VH + HANDOFF_VH;
    illus.style.height = totalVh + 'vh';
    // Raw scroll milestones (fractions of the section's scroll range):
    //   [0, GALLERY_END]             cube gallery (progress fed = raw / GALLERY_END)
    //   [GALLERY_END, HANDOFF_START] frozen exit — content slides out, bg only
    //   [HANDOFF_START, 1]           frozen cross-dissolve into #contact
    const GALLERY_END   = (N * stopVh) / totalVh;
    const HANDOFF_START = (N * stopVh + EXIT_VH) / totalVh;
    const contactEl = document.getElementById('contact');

    // ── Scroll-driven cube rotation — phone progressive enhancement ─────────
    // On phones whose engine supports CSS scroll-driven animations, the cube
    // rotation is compiled into a generated @keyframes (one stop per keyframe,
    // offsets baked against GALLERY_END) bound to a view-timeline on
    // #illustration, so it runs entirely on the compositor and stays smooth
    // even when the main thread is busy. JS keeps driving everything else
    // (image swaps, face opacities, UI, entrance/exit/handoff) and simply
    // stops writing cube.style.transform; its smoothing snaps to the raw
    // scroll value so labels/opacities stay in lockstep with the CSS timeline.
    // Engines without support keep the original RAF-driven rotation. Desktop
    // never sees any of this: IS_MOBILE gate + the injected rules live inside
    // a max-width media query. The `contain` range of a view-timeline equals
    // getProgress() for a taller-than-viewport subject (top hits viewport top
    // → bottom hits viewport bottom).
    // window.CSS explicitly: script.js declares a top-level `const CSS = {…}`
    // that shadows the native CSS object for every classic script on the page.
    const SCROLL_DRIVEN = IS_MOBILE && window.CSS && window.CSS.supports &&
        window.CSS.supports('animation-timeline: view()');
    if (SCROLL_DRIVEN) {
        // ≈ the JS easeIO quadratic in-out, applied per keyframe interval.
        const EASE = 'cubic-bezier(0.45, 0, 0.55, 1)';
        const frames = STOPS.map((s, i) =>
            `${((i / (N - 1)) * GALLERY_END * 100).toFixed(4)}% { transform: rotateX(${s.rx}deg) rotateY(${s.ry}deg); }`
        );
        // Hold the last stop through the frozen exit + handoff bands.
        const last = STOPS[N - 1];
        frames.push(`100% { transform: rotateX(${last.rx}deg) rotateY(${last.ry}deg); }`);
        const st = document.createElement('style');
        st.textContent =
            '@media (max-width: 768px) {\n' +
            '  #illustration { view-timeline: --illus-cube-tl block; }\n' +
            `  @keyframes illus-cube-scroll-rotate {\n  ${frames.join('\n  ')}\n  }\n` +
            '  #illustration .illus-cube {\n' +
            `    animation: illus-cube-scroll-rotate ${EASE} both;\n` +
            '    animation-timeline: --illus-cube-tl;\n' +
            '    animation-range: contain 0% contain 100%;\n' +
            '  }\n' +
            '}\n';
        document.head.appendChild(st);
    }

    // Auto-handoff: once the gallery has slid out (raw past GALLERY_END) leaving
    // only the particle background, drive the cross-dissolve into #contact on a
    // timer so a *stopped* scroll never parks the viewport on the bare background.
    // Manual scroll still overrides — the handoff is fed the MAX of the scroll-
    // linked and the time-driven progress, so scrubbing forward/back stays exact.
    const EXIT_HOLD_MS    = 650;   // ≈ the slide-out choreography duration
    const AUTO_HANDOFF_MS = 900;   // cross-dissolve fade duration

    // Stamp face label + scan line into every face.
    // The gallery-title face (stop 0) gets the section descriptor instead of the expand hint.
    faces.forEach((face, fi) => {
        // Only the gallery-title face gets an in-face label (decorative word-art).
        // The "click to expand" hint is rendered as a flat overlay (see expandHint below)
        // so it always appears upright at the visual bottom regardless of cube orientation.
        if (fi === INTRO_FACE) {
            const lbl = document.createElement('div');
            lbl.className = 'illus-face-label illus-face-label--gallery';
            lbl.innerHTML =
                '<span>[ · I N T E R D I M E N S I O N A L</span>' +
                '<span class="illus-gallery-indent">C U B E</span>' +
                '<span class="illus-gallery-indent">G A L L E R Y</span>' +
                '<span class="illus-gallery-indent">O F</span>' +
                '<span class="illus-gallery-indent">T I M E L E S S</span>' +
                '<span class="illus-gallery-indent">A R T · ]</span>';
            face.appendChild(lbl);
        }

        const sl = document.createElement('div');
        sl.className = 'illus-scan-line';
        face.appendChild(sl);
    });

    // Cache gallery label for the top face — counter-rotated in setCubeTransform.
    const topFaceLabel = faces[INTRO_FACE].querySelector('.illus-face-label');

    // Generate additional nav dots
    for (let i = dots.length; i < N; i++) {
        const btn = document.createElement('button');
        btn.className  = 'illus-dot';
        btn.dataset.goto = String(i);
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        illus.querySelector('.illus-strip').appendChild(btn);
    }
    const allDots = [...illus.querySelectorAll('.illus-dot')];

    const allSections = [...illus.querySelectorAll('.illus-section')];

    // Image preloading
    const imageCache = new Map();

    function preloadImage(src) {
        if (imageCache.has(src)) return imageCache.get(src);
        const p = new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => resolve(img);
            img.src = src;
        });
        imageCache.set(src, p);
        return p;
    }

    IMAGES.forEach(src => preloadImage(src));

    const faceImgIdx = new Array(6).fill(-1);
    // Phone-only cache of each face's <img> so updateFaceOpacities doesn't run
    // 6 querySelectors per RAF frame. Written in setFaceImage, read when IS_MOBILE.
    const faceImgEls = new Array(6).fill(null);

    // Returns the CSS transform needed to counter the cube's accumulated rotation
    // so each image always appears right-side-up to the viewer.
    //
    // - Side faces (front/right/left): rotateY never affects the vertical axis → no correction.
    // - Back face: only ever visible at ry≡180°, where the cube's rotateY(180) exactly
    //   cancels the face's own authored rotateY(180) (Ry(180)·Ry(180)=identity) → no
    //   correction. (A scaleX(-1) here would MIRROR an already-correct image.)
    // - Top face (rx=90): accumulated ry tilts the image; correction = rotateZ(-ry).
    // - Bottom face (rx=-90): same but opposite sign → rotateZ(+ry).
    function getFaceCorrection(faceIdx, stopIdx) {
        if (faceIdx === 0 || faceIdx === 5) {
            const ryN  = ((STOPS[stopIdx].ry % 360) + 360) % 360;
            if (ryN === 0) return '';
            const sign = faceIdx === 0 ? -1 : 1;
            const deg  = ((sign * ryN) % 360 + 360) % 360;
            return `rotate(${deg}deg)`;
        }
        return '';
    }

    // Restores the gallery-title label on INTRO_FACE.
    // Called whenever stop 0 reclaims the face, and on nav-button reset.
    function restoreGalleryLabel() {
        const lbl = faces[INTRO_FACE]?.querySelector('.illus-face-label');
        if (!lbl) return;
        lbl.style.opacity = '';
        lbl.className = 'illus-face-label illus-face-label--gallery';
        lbl.innerHTML =
            '<span>[ · I N T E R D I M E N S I O N A L</span>' +
            '<span class="illus-gallery-indent">C U B E</span>' +
            '<span class="illus-gallery-indent">G A L L E R Y</span>' +
            '<span class="illus-gallery-indent">O F</span>' +
            '<span class="illus-gallery-indent">T I M E L E S S</span>' +
            '<span class="illus-gallery-indent">A R T · ]</span>';
    }

    // ── Process thumbnails overlaid on a piece's cube face ────────────────────
    // Some pieces carry extra process/proof images (sketches, press clippings,
    // award certificates). They stack in a column on the side OPPOSITE the text
    // card (card is --right on odd stops, so thumbs go left on odd stops, right
    // on even), ride the same 3D face so they rotate with it, and show only while
    // that face displays the piece. Clicks: thumbs sit outside the cube clickzone
    // so a direct handler works (clickzone hit-test below is a fallback).
    const THUMB_SETS = [
        { match: 'meninas-canido-tarot-illustration', dir: 'images/illustration/meninas/', items: [
            { base: 'sergio-ayala-meninas-canido-tarot-sketch-process-ferrol-2024', alt: 'Meninas de Canido — tarot concept sketch (process) by Sergio Ayala, 2024' },
            { base: 'sergio-ayala-meninas-canido-la-voz-de-galicia-press-2024',      alt: 'Meninas de Canido — featured in La Voz de Galicia, 2024' },
            { base: 'sergio-ayala-holy-vandal-canido-baroque-concept-art-2024',      alt: 'Holy Vandal — Meninas de Canido concept (process) by Sergio Ayala, 2024' },
        ]},
        { match: 'reconciliacion-watercolor-digital', dir: 'images/illustration/faber castell/', items: [
            { base: 'sergio-ayala-reconciliacion-faber-castell-award-certificate-2014', alt: 'Reconciliación — Faber-Castell IV National Drawing Contest certificate, 2014' },
        ]},
        { match: 'draconic-love-dragon-illustration', dir: 'images/illustration/draconic love/', inset: true, items: [
            { base: 'sergio-ayala-draconic-love-tshirt-mockup-2019',        alt: 'Draconic Love — t-shirt merchandise mockup by Sergio Ayala, 2019' },
            { base: 'sergio-ayala-draconic-love-tote-bag-mockup-2019',      alt: 'Draconic Love — tote bag merchandise mockup by Sergio Ayala, 2019' },
            { base: 'sergio-ayala-draconic-love-merchandise-mockup-2019',   alt: 'Draconic Love — merchandise collection mockup by Sergio Ayala, 2019' },
            { base: 'sergio-ayala-draconic-love-merchandise-web-banner-2019', alt: 'Draconic Love — merchandise web banner by Sergio Ayala, 2019' },
        ]},
    ];
    const thumbWraps = [];   // { wrap, stop, face }
    let   thumbEls   = [];
    // Stops whose main image must inset (shrink + hug the far side) so it clears a
    // tall thumb column. Value = the side the thumb column sits on.
    const insetStops = {};   // stop -> 'left' | 'right'
    THUMB_SETS.forEach(set => {
        const stop = IMAGES.findIndex(s => s.includes(set.match));
        if (stop < 0) return;
        const face = FACE_MAP[stop];
        if (set.inset) insetStops[stop] = (stop % 2 === 0 ? 'right' : 'left');
        const wrap = document.createElement('div');
        // Thumbs opposite the text card: card is --right on odd stops → thumbs left;
        // even stops → card left → thumbs right.
        wrap.className = 'illus-face-thumbs' + (stop % 2 === 0 ? ' illus-face-thumbs--right' : '');
        set.items.forEach(t => {
            const el = new Image();
            el.className = 'illus-face-thumb';
            el.src = `${set.dir}${t.base}-thumb.webp`;
            el.alt = t.alt;
            el.loading = 'lazy';
            el.dataset.full = `${set.dir}${t.base}.webp`;
            el.dataset.alt  = t.alt;
            // Click is handled by a capture-phase hit-test on the tunnel (see below),
            // not a per-element handler: Chromium doesn't reliably deliver pointer
            // events to children of a 3D-rotated face (works for the front face only).
            wrap.appendChild(el);
            thumbEls.push(el);
        });
        faces[face].appendChild(wrap);
        thumbWraps.push({ wrap, stop, face });
    });

    async function setFaceImage(faceIdx, imgIdx) {
        if (faceImgIdx[faceIdx] === imgIdx) return;
        faceImgIdx[faceIdx] = imgIdx;

        // Toggle any process-thumbnail column bound to this face by image identity.
        thumbWraps.forEach(tw => {
            if (tw.face === faceIdx) tw.wrap.classList.toggle('is-visible', imgIdx === tw.stop);
        });

        // Stop 0 reclaims the gallery-title face: clear photo and restore title label
        if (faceIdx === INTRO_FACE && imgIdx === 0) {
            const staleImg = faces[INTRO_FACE].querySelector('img.illus-main-img');
            if (staleImg) {
                staleImg.classList.remove('illus-img-enter');
                staleImg.removeAttribute('src');
            }
            restoreGalleryLabel();
            return;
        }

        // A non-0 stop is claiming INTRO_FACE: hide the gallery label so it doesn't
        // show behind the photo. The "click to expand" hint comes from the 2D overlay.
        if (faceIdx === INTRO_FACE && topFaceLabel) {
            topFaceLabel.style.opacity = '0';
        }

        const src = IMAGES[imgIdx];
        await preloadImage(src);
        if (faceImgIdx[faceIdx] !== imgIdx) return;
        let img = faces[faceIdx].querySelector('img.illus-main-img');
        if (!img) { img = new Image(); img.className = 'illus-main-img'; faces[faceIdx].appendChild(img); }
        if (IS_MOBILE) faceImgEls[faceIdx] = img;
        // Release any forwards-fill from a previous scan animation so the per-frame
        // dot-product opacity can take back control of this face's image.
        img.classList.remove('illus-img-enter');
        // Inset the main image when this stop carries a tall thumb column, so the
        // artwork shrinks and hugs the far side instead of overlapping the thumbs.
        img.classList.remove('illus-main-img--inset-left', 'illus-main-img--inset-right');
        if (insetStops[imgIdx]) img.classList.add('illus-main-img--inset-' + insetStops[imgIdx]);
        img.alt = FACE_NAMES[imgIdx] ?? '';
        img.src = src;
        img.style.transform = getFaceCorrection(faceIdx, imgIdx);
    }

    function checkImageSwaps(s) {
        const base = Math.min(N - 1, Math.round(s * (N - 1)));
        // Process stops from nearest outward — first assignment wins per face,
        // so each face always shows the image of the closest stop that uses it.
        const assigned = new Set();
        for (let dist = 0; dist <= SWAP_RADIUS; dist++) {
            for (const offset of (dist === 0 ? [0] : [-dist, dist])) {
                const si = base + offset;
                if (si < 0 || si >= N) continue;
                const f = FACE_MAP[si];
                if (!assigned.has(f)) {
                    assigned.add(f);
                    setFaceImage(f, si);
                }
            }
        }
    }

    // Seed faces near the start
    for (let i = 0; i < Math.min(N, SWAP_RADIUS + 1); i++) setFaceImage(FACE_MAP[i], i);

    // Easing
    const easeIO = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function getProgress(rect) {
        const r     = rect || illus.getBoundingClientRect();
        const total = illus.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        return Math.max(0, Math.min(1, -r.top / total));
    }

    // Current interpolated cube rotation in radians — written by setCubeTransform,
    // read by updateFaceOpacities to compute per-face viewer-facing dot products.
    let _rxRad = Math.PI / 2;
    let _ryRad = 0;

    function setCubeTransform(s) {
        if (STOPS.length < 2) return;
        const t = s * (N - 1);
        const i = Math.min(Math.floor(t), N - 2);
        const f = easeIO(t - i);
        const a = STOPS[i], b = STOPS[i + 1];
        const curRxDeg = a.rx + (b.rx - a.rx) * f;
        const curRyDeg = a.ry + (b.ry - a.ry) * f;
        // Scroll-driven phones: the CSS timeline owns the cube transform; JS
        // still computes the angles below for the label counter-rotation and
        // the per-face opacity dot products.
        if (!SCROLL_DRIVEN) {
            cube.style.transform = `rotateX(${curRxDeg}deg) rotateY(${curRyDeg}deg)`;
        }

        // The gallery label lives inside the top face (INTRO_FACE). Its face transform
        // (rotateX(-90deg)) turns the cube's accumulated ry into a Z-spin on the label,
        // so we counter-rotate each frame to keep the word-art upright.
        // The label uses translateY(-50%) for centering — preserve it in the inline transform.
        // (The click-to-expand hint is a flat 2D overlay and needs no correction.)
        if (topFaceLabel) {
            topFaceLabel.style.transform = `translateY(-50%) rotateZ(${-curRyDeg}deg)`;
        }

        _rxRad = curRxDeg * (Math.PI / 180);
        _ryRad = curRyDeg * (Math.PI / 180);
    }

    // ── Per-face viewer dot products ──────────────────────────────────────────
    // The cube transform is rotateX(rx)·rotateY(ry) ≡ matrix M = Ry·Rx.
    // The viewer direction is +Z. The dot product of face i's outward normal with
    // the viewer equals the z-component of M·n_i. Derived analytically per face:
    //   top    n=(0, 1,0): cos(ry)·sin(rx)
    //   front  n=(0, 0,1): cos(ry)·cos(rx)
    //   right  n=(1, 0,0): −sin(ry)
    //   back   n=(0, 0,−1): −cos(ry)·cos(rx)
    //   left   n=(−1,0,0): sin(ry)
    //   bottom n=(0,−1,0): −cos(ry)·sin(rx)
    // A positive dot means the face is turning toward the viewer; used to drive
    // image opacity organically during rotation, before the face fully lands.
    const _FACE_DOT = [
        (rx, ry) =>  Math.cos(ry) * Math.sin(rx),   // 0: top
        (rx, ry) =>  Math.cos(ry) * Math.cos(rx),   // 1: front
        (rx, ry) => -Math.sin(ry),                  // 2: right
        (rx, ry) => -Math.cos(ry) * Math.cos(rx),   // 3: back
        (rx, ry) =>  Math.sin(ry),                  // 4: left
        (rx, ry) => -Math.cos(ry) * Math.sin(rx),   // 5: bottom
    ];

    function updateFaceOpacities() {
        const rx = _rxRad, ry = _ryRad;
        for (let fi = 0; fi < 6; fi++) {
            const img = IS_MOBILE ? faceImgEls[fi]
                                  : faces[fi]?.querySelector('img.illus-main-img');
            // Skip faces with no image or still running the scan-reveal animation
            // (the animation's fill-mode controls opacity while it is active).
            if (!img || !img.src || img.classList.contains('illus-img-enter')) continue;
            const dot = _FACE_DOT[fi](rx, ry);
            // Power curve: reaches ~76% opacity at dot=0.5 (face at 60° from viewer),
            // giving the image a snappy early-fade feel during the approach.
            img.style.opacity = dot > 0 ? String(Math.pow(dot, 0.4)) : '0';
        }
    }

    let lastStop         = -1;
    let lastLustColorIdx = -1;

    function updateUI(s) {
        // Phone: the whole HUD (pct, progress bar, scene label) is display:none
        // in responsive.css — skip its per-frame DOM writes (they still cost a
        // style recalc on hidden nodes).
        if (!IS_MOBILE) {
            const pct  = Math.round(s * 100);
            hudPct.textContent      = String(pct).padStart(3, '0') + '%';
            progFill.style.width    = pct + '%';
        }

        const stop = Math.min(N - 1, Math.round(s * (N - 1)));
        if (stop === lastStop) return;
        lastStop = stop;

        // Randomise "LUST" accent color on every stop change — pick from palette,
        // never repeat the same color twice in a row.
        if (lustEl && !IS_MOBILE) {
            let idx;
            do { idx = Math.floor(Math.random() * FACE_COLORS.length); }
            while (idx === lastLustColorIdx);
            lastLustColorIdx = idx;
            illus.style.setProperty('--illus-lust-accent', FACE_COLORS[idx].hex);
        }

        const name   = FACE_NAMES[stop] ?? '';
        const spaced = name.split('').join(' ');

        // Phone: the scene label lives in the hidden HUD — skip the write.
        if (!IS_MOBILE) sceneLabel.textContent = stop === 0 ? INTRO_LABEL : name;

        imgGlitchPending = true;
        // Hide the image-name caption on the gallery-title face (stop 0 has no photo)
        tunnel.classList.toggle('illus-stop-zero', stop === 0);
        if (!tunnel.classList.contains('illus-info-revealed')) {
            tunnel.classList.add('illus-info-revealed');
        }
        // Phone: float title, hint/strip sides and nav dots are display:none in
        // responsive.css — skip their DOM work entirely.
        if (!IS_MOBILE) {
            // Float title: entry animation on first reveal from stop 0; hide on return.
            if (stop === 0) {
                titleFloat.classList.remove('illus-title-float--visible');
            } else if (!titleFloat.classList.contains('illus-title-float--visible')) {
                void titleFloat.offsetWidth;
                titleFloat.classList.add('illus-title-float--visible');
            }
            setHintSide(stop);
            allDots.forEach((d, i)  => d.classList.toggle('active', i === stop));
        }
        allSections.forEach((sec, i) => sec.classList.toggle('active', i === stop));
    }

    function gotoSlide(idx) {
        const illusTop = illus.getBoundingClientRect().top + window.scrollY;
        const total    = illus.offsetHeight - window.innerHeight;
        // Stops live in the [0, GALLERY_END] portion of the scroll range; the
        // remainder is the frozen exit band.
        const targetY  = illusTop + (Math.max(0, Math.min(N - 1, idx)) / (N - 1)) * total * GALLERY_END;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    let tgt    = Math.min(getProgress() / GALLERY_END, 1);
    let smooth = tgt;

    function applyFaceColor(stop) {
        const c = FACE_COLORS[STOP_COLORS[stop]];
        tunnel.style.setProperty('--illus-face-color', c.hex);
        tunnel.style.setProperty('--illus-face-rgb', c.rgb);
    }

    // ── Image entry glitch — fires when the face is nearly fully front-facing ─
    // Pending flag is set when the stop changes; the frame loop checks the
    // remaining normalized distance to the target stop and fires once the cube
    // is within ~12% of a stop-unit from landing (≈ 76% through its rotation).
    let imgGlitchPending = false;

    function fireImgGlitch(stop) {
        applyFaceColor(stop);
        const face     = faces[FACE_MAP[stop]];
        const scanLine = face?.querySelector('.illus-scan-line');

        if (stop === 0) {
            // Gallery title face — no image; pulse the scan line as landing feedback
            if (scanLine) {
                scanLine.classList.remove('illus-scan-active');
                void face.offsetWidth;
                scanLine.classList.add('illus-scan-active');
            }
            return;
        }

        // Re-trigger the expand hint and float title glitch on every new image face landing.
        // Phone: the hint stays visible (owner 2026-07-10) so its glitch fires
        // too; the float title is display:none — skip its Splitting.js work.
        triggerExpandHintGlitch();
        if (!IS_MOBILE) triggerTitleFloatGlitch();

        const img = face?.querySelector('img.illus-main-img');
        if (!img) return;

        // If the image faded in organically during the approach rotation (opacity > 0.85),
        // skip the clip-reveal scan — it would clip an already-visible image to black
        // and sweep it back in, which is jarring. The scan LINE still fires for tactile
        // landing feedback. For fast button/dot navigation the image is still dark,
        // so we play the full reveal as before.
        const alreadyVisible = parseFloat(img.style.opacity) > 0.85;

        img.classList.remove('illus-img-enter');
        if (scanLine) scanLine.classList.remove('illus-scan-active');
        void face.offsetWidth;
        if (!alreadyVisible) img.classList.add('illus-img-enter');
        if (scanLine) scanLine.classList.add('illus-scan-active');
    }

    // ── Electric border — scroll-velocity driven ─────────────────────────────
    // Seed is cycled inside the main frame loop (no second RAF needed).
    // elecOff uses a guard so the timeout is only scheduled once per idle entry.
    let elecActive    = false;
    let elecTimer     = null;
    let prevSmooth    = smooth;
    let lastAppliedSmooth = -1;   // phone idle short-circuit (see frame loop)
    let introSeenOnce     = false;  // both stages fired — entrance complete
    let stageContentFired = false;  // Stage A (text + SVG) latched at 40% coverage
    let stageCubeFired    = false;  // Stage B (3D cube) latched at 90% coverage
    let exiting           = false;  // inside the frozen exit band (reverse choreography)
    let handoffActive     = false;  // frozen cross-dissolve into #contact is running
    let autoHandoffStart  = 0;      // ts (ms) the exit band was entered; 0 = idle
    const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function elecOn() {
        if (elecTimer) { clearTimeout(elecTimer); elecTimer = null; }
        if (!elecActive) {
            elecActive = true;
            tunnel.classList.add('illus-electric-active');
        }
    }

    function elecOff() {
        if (elecTimer) return;
        elecTimer = setTimeout(() => {
            elecActive = false;
            elecTimer  = null;
            tunnel.classList.remove('illus-electric-active');
        }, 500);
    }

    const ILLUS_TEXTS = {
        en: { expand: '[ · c l i c k | t o | e x p a n d · ]' },
        es: { expand: '[ · c l i c | p a r a | e x p a n d i r · ]' },
    };


    // Flat 2D overlay — sits outside the 3D cube context so it is always upright
    // and always at the viewer-space bottom of the cube. Hidden at stop 0 via CSS
    // (.illus-stop-zero is toggled by updateUI) so it only shows with an active photo.
    const expandHint = document.createElement('div');
    expandHint.className = 'illus-expand-hint glitch-text subtitle-glitch';
    expandHint.setAttribute('data-splitting', '');
    expandHint.setAttribute('aria-hidden', 'true');
    expandHint.textContent = '[ · c l i c k | t o | e x p a n d · ]';
    tunnel.appendChild(expandHint);

    // Mini floating title — behind cube (z:1), synced with hint HUD side.
    // Inherits --illus-lust-accent from #illustration via illus.style.setProperty.
    const titleFloat = document.createElement('div');
    titleFloat.className = 'illus-title-float illus-title-float--right';
    titleFloat.setAttribute('aria-hidden', 'true');
    titleFloat.innerHTML =
        '<span class="illus-title-float-line" data-splitting>[ · I L</span>' +
        '<span class="illus-title-float-line illus-title-float-lust" data-splitting>L U S T</span>' +
        '<span class="illus-title-float-line illus-title-float-in" data-splitting>R A T</span>' +
        '<span class="illus-title-float-line illus-title-float-in" data-splitting>I O N · ]</span>';
    tunnel.appendChild(titleFloat);

    let titleFloatSplit = false;
    function triggerTitleFloatGlitch() {
        if (!window.Splitting) return;
        if (!titleFloatSplit) {
            titleFloatSplit = true;
            titleFloat.querySelectorAll('[data-splitting]').forEach(span => {
                const results = window.Splitting({ target: span, by: 'chars' });
                results.forEach(result => {
                    result.chars.forEach(char => {
                        char.style.setProperty('--count', String(Math.random() * 5 + 1));
                        for (let g = 0; g < 10; g++) {
                            const r = _GLITCH_CHARS[Math.floor(Math.random() * _GLITCH_CHARS.length)];
                            char.style.setProperty(`--char-${g}`, `"${r}"`);
                        }
                    });
                });
            });
            return;
        }
        titleFloat.classList.add('illus-glitch-reset');
        void titleFloat.offsetWidth;
        titleFloat.classList.remove('illus-glitch-reset');
    }

    let expandHintSplit = false;
    function triggerExpandHintGlitch() {
        if (!window.Splitting) return;
        if (!expandHintSplit) {
            // First call: run Splitting.js once and let the animation start naturally.
            expandHintSplit = true;
            const results = window.Splitting({ target: expandHint, by: 'chars' });
            results.forEach(result => {
                result.chars.forEach(char => {
                    char.style.setProperty('--count', String(Math.random() * 5 + 1));
                    for (let g = 0; g < 10; g++) {
                        const r = _GLITCH_CHARS[Math.floor(Math.random() * _GLITCH_CHARS.length)];
                        char.style.setProperty(`--char-${g}`, `"${r}"`);
                    }
                });
            });
            return;
        }
        // Subsequent calls: restart the CSS animation on [data-char]:after pseudo-elements.
        // Can't set inline styles on pseudo-elements directly — toggle a class on the parent
        // to suppress animation-name, force a reflow, then remove it to re-fire the animation.
        expandHint.classList.add('illus-glitch-reset');
        void expandHint.offsetWidth;
        expandHint.classList.remove('illus-glitch-reset');
    }

    function setHintSide(stop) {
        const hintRight = stop % 2 === 0;
        strip.classList.toggle('illus-strip--right', hintRight);
        strip.classList.toggle('illus-strip--left',  !hintRight);
        if (infoSvg) {
            infoSvg.classList.toggle('illus-info-svg--right', hintRight);
            infoSvg.classList.toggle('illus-info-svg--left',  !hintRight);
        }
        const isVisible = titleFloat.classList.contains('illus-title-float--visible');
        const wasRight  = titleFloat.classList.contains('illus-title-float--right');
        if (isVisible && wasRight !== hintRight) {
            // Side switch while visible — brief crossfade then reposition
            titleFloat.style.cssText = 'opacity:0;transition:opacity 0.15s ease';
            setTimeout(() => {
                titleFloat.classList.toggle('illus-title-float--right', hintRight);
                titleFloat.classList.toggle('illus-title-float--left',  !hintRight);
                titleFloat.style.cssText = '';
            }, 150);
        } else {
            titleFloat.classList.toggle('illus-title-float--right', hintRight);
            titleFloat.classList.toggle('illus-title-float--left',  !hintRight);
        }
    }

    const _GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

    function applyIllusLang(lang) {
        const t = ILLUS_TEXTS[lang] || ILLUS_TEXTS.en;

        const wasExpandSplit = expandHintSplit;
        expandHint.textContent = t.expand;
        expandHintSplit = false;
        if (wasExpandSplit) triggerExpandHintGlitch();

    }

    document.addEventListener('languagechanged', e => {
        applyIllusLang(e.detail.lang);
    });


    function startIntroElecFlicker() {
        const steps = [];
        let elapsed = 80; // start after cube scale-in begins
        while (elapsed < 1400) {
            steps.push(elapsed);
            elapsed += 55 + Math.random() * 130;
        }
        steps.push(elapsed); // final step — always ends off

        steps.forEach((delay, i) => {
            const isLast = i === steps.length - 1;
            const on     = isLast ? false : Math.random() > 0.4;
            setTimeout(() => {
                // Flow is driven by the self-animating #illus-cube-electric filter;
                // only the on/off flicker is toggled here.
                tunnel.classList.toggle('illus-electric-active', on);
            }, delay);
        });
    }

    // Cleanup run on every (re)entry / nav click. The staged entrance itself is
    // driven by viewport coverage in the frame loop (see "Staged scroll-driven
    // entrance"); .illus-intro-active is intentionally left applied as the
    // permanent Stage-0 hold that the stage classes override.
    function resetIntro() {
        elecActive = false;
        if (elecTimer) { clearTimeout(elecTimer); elecTimer = null; }
        tunnel.classList.remove('illus-electric-active');

        // Evict any stale photo and restore the gallery label — always, on every visit
        const titleFaceImg = faces[INTRO_FACE].querySelector('img.illus-main-img');
        if (titleFaceImg) {
            titleFaceImg.classList.remove('illus-img-enter');
            titleFaceImg.removeAttribute('src');
        }
        restoreGalleryLabel();
        faceImgIdx[INTRO_FACE] = -1;
    }

    // Play the full staged entrance (Stage A text/SVG → Stage B cube power-on)
    // on demand, independent of scroll coverage. The menu jumps to the section
    // instantly (coverage hits 100% in a single frame), so the coverage-based
    // trigger would collapse both stages together — this scripts them on a timer
    // so a clicked entry looks identical to a scrolled one.
    let entranceTimer = null;
    function playStagedEntrance() {
        if (entranceTimer) { clearTimeout(entranceTimer); entranceTimer = null; }

        // Re-arm to the bg-only Stage-0 baseline and take over from the
        // coverage-based trigger so it can't double-fire.
        illus.classList.remove('illus-stage-content', 'illus-stage-cube');
        stageContentFired = true;
        stageCubeFired    = false;
        introSeenOnce     = true;
        resetIntro();                       // restore gallery label, evict stale photo
        void illus.offsetWidth;             // restart the stage-content animation cleanly

        // Stage A — text + SVG slide in.
        illus.classList.add('illus-stage-content');

        // Stage B — cube powers on once the content has settled, mirroring the
        // gap the scroll path leaves between 40% and 90% coverage.
        entranceTimer = setTimeout(() => {
            stageCubeFired = true;
            illus.classList.add('illus-stage-cube');
            if (!prefersReducedMotion && !IS_MOBILE) startIntroElecFlicker();
            entranceTimer = null;
        }, 900);
    }

    document.querySelectorAll('a[href="#illustration"]').forEach(btn => {
        btn.addEventListener('click', playStagedEntrance);
    });

    // ── Lightbox ─────────────────────────────────────────────────────────────
    const lb = document.createElement('div');
    lb.className = 'illus-lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
        <div class="illus-lightbox-frame">
            <img class="illus-lightbox-img" alt="">
            <div class="illus-lightbox-border" aria-hidden="true"></div>
            <button class="illus-lightbox-close" aria-label="Close">[ x ]</button>
        </div>`;
    document.body.appendChild(lb);

    const lbImg   = lb.querySelector('.illus-lightbox-img');
    let   lbOpen  = false;
    let   lbElecTimer = null;

    // Phone lightbox layout (owner 2026-07-10): large image on top, the
    // piece's title / description / links below, in a scrollable column.
    // The info is cloned at open time from the stop's hidden .illus-card, so
    // it always reflects the current i18n language. The close button moves out
    // of the (scale-transformed) frame so position:fixed can pin it to the
    // viewport while the column scrolls. Desktop lightbox is untouched.
    let lbInfo = null;
    if (IS_MOBILE) {
        lbInfo = document.createElement('div');
        lbInfo.className = 'illus-lightbox-info';
        lbInfo.hidden = true;
        lb.querySelector('.illus-lightbox-frame').appendChild(lbInfo);
        lb.appendChild(lb.querySelector('.illus-lightbox-close'));
    }

    function fillLbInfo(stop) {
        if (!lbInfo) return;
        lbInfo.innerHTML = '';
        const card = (stop != null && stop >= 1)
            ? illus.querySelector(`.illus-section[data-idx="${stop}"] .illus-card`)
            : null;
        if (!card) { lbInfo.hidden = true; return; }
        [...card.children].forEach(el => {
            if (el.classList.contains('illus-cta-row') ||
                el.classList.contains('illus-h-line')) return;
            const clone = el.cloneNode(true);
            // Flatten any Splitting.js char spans back to plain text — the
            // lightbox reads as a static caption, no per-char glitch runs here.
            if (clone.matches('[data-splitting]')) {
                clone.textContent = clone.textContent;
            }
            clone.querySelectorAll('[data-splitting]').forEach(g => {
                g.textContent = g.textContent;
            });
            lbInfo.appendChild(clone);
        });
        lbInfo.hidden = false;
    }

    // Frame scale animation uses cubic-bezier(0.34, 1.56, 0.64, 1) over 0.5s.
    // The spring overshoots before settling; 620ms covers the full settle window.
    const LB_SETTLE_MS = 620;

    function lbShow(src, alt, stop) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        fillLbInfo(stop);
        lb.scrollTop = 0;
        lb.setAttribute('aria-hidden', 'false');
        lb.classList.add('open');
        lbOpen = true;
        document.body.style.overflow = 'hidden';

        if (lbElecTimer) { clearTimeout(lbElecTimer); lbElecTimer = null; }
        lb.classList.remove('lb-elec-active');
        // Force a style flush so the snap-on transition takes effect immediately
        void lb.offsetWidth;
        lb.classList.add('lb-elec-active');
        lbElecTimer = setTimeout(() => {
            lb.classList.remove('lb-elec-active');
            lbElecTimer = null;
        }, LB_SETTLE_MS);
    }

    function lbHide() {
        if (lbElecTimer) { clearTimeout(lbElecTimer); lbElecTimer = null; }
        lb.classList.remove('lb-elec-active');
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        lbOpen = false;
        document.body.style.overflow = '';
        setTimeout(() => { if (!lbOpen) lbImg.src = ''; }, 500);
    }

    lb.addEventListener('click', e => {
        if (e.target === lb) lbHide();
    });
    lb.querySelector('.illus-lightbox-close').addEventListener('click', lbHide);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lbOpen) lbHide(); });

    // Transparent click zone over cube — opens lightbox on click
    const clickZone = document.createElement('div');
    clickZone.className = 'illus-cube-clickzone';
    clickZone.setAttribute('role', 'button');
    clickZone.setAttribute('tabindex', '0');
    clickZone.setAttribute('aria-label', 'Expand image');
    tunnel.appendChild(clickZone);

    // Capture-phase hit-test for process thumbnails: works regardless of where the
    // thumb projects (in/outside the clickzone) and regardless of 3D pointer quirks,
    // because it tests click coordinates against each visible thumb's rendered rect
    // rather than relying on the event target being the 3D-transformed <img>.
    tunnel.addEventListener('click', (e) => {
        const hit = thumbEls.find(t => {
            if (!t.closest('.illus-face-thumbs')?.classList.contains('is-visible')) return false;
            const r = t.getBoundingClientRect();
            return r.width && e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
        });
        if (hit) { e.stopPropagation(); lbShow(hit.dataset.full, hit.dataset.alt); }
    }, true);

    clickZone.addEventListener('click', () => {
        const stop = Math.max(0, lastStop);
        const img  = faces[FACE_MAP[stop]]?.querySelector('img.illus-main-img');
        if (img?.src) lbShow(img.src, img.alt, stop);
    });
    clickZone.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickZone.click(); }
    });

    window.addEventListener('scroll', () => {
        tgt = Math.min(getProgress() / GALLERY_END, 1);
    }, { passive: true });

    illus.addEventListener('click', e => {
        const btn = e.target.closest('[data-goto]');
        if (!btn) return;
        gotoSlide(parseInt(btn.dataset.goto, 10));
    });

    // ── Handoff to #contact — frozen cross-dissolve ───────────────────────
    // Runs during the HANDOFF band while the section is STILL PINNED, so nothing
    // moves and nothing below scrolls into view. #contact is held as a fixed,
    // fully-opaque backdrop *behind* the section (both pinned by the compositor —
    // no JS transforms, so no scroll jitter); the section's own opacity is scrubbed
    // 1→0 to reveal it. Because contact is opaque and directly behind, there is
    // never a translucent gap that could expose other sections. #contact's own
    // IntersectionObserver fires its entrance as it's revealed. Reversible.
    // wp = cross-dissolve progress 0→1 (caller blends scroll- and time-driven).
    function updateHandoff(wp) {
        if (!contactEl) return false;

        if (wp <= 0) {
            if (handoffActive) {
                handoffActive = false;
                illus.classList.remove('illus-handoff');
                illus.style.removeProperty('opacity');
                contactEl.classList.remove('ct-handoff-in');
                // Tunnel is the interactive layer again — let the goo cursor return.
                window.dispatchEvent(new CustomEvent('illus:handoff', { detail: { active: false } }));
            }
            return false;
        }

        if (!handoffActive) {
            handoffActive = true;
            illus.classList.add('illus-handoff');      // raise section above #contact
            contactEl.classList.add('ct-handoff-in');   // fixed opaque backdrop behind
            // #contact owns input now; the tunnel is still pinned in view, so the
            // goo cursor's IntersectionObserver won't release on its own — tell it.
            window.dispatchEvent(new CustomEvent('illus:handoff', { detail: { active: true } }));
        }
        illus.style.opacity = String(1 - Math.min(1, wp)); // fade section out → reveal #contact
        return true;
    }

    let lastNow = performance.now();

    function frame(now) {
        requestAnimationFrame(frame);

        const bcr = illus.getBoundingClientRect();
        const vh  = window.innerHeight;
        const raw = getProgress(bcr);

        // Frozen cross-dissolve into #contact. Progress is the greater of the
        // scroll-linked amount (raw past HANDOFF_START) and a time-driven auto
        // amount that engages once the gallery has slid out (raw past GALLERY_END
        // + a hold for the slide-out choreography) — so a parked scroll on the
        // bare particle background still completes into #contact on its own.
        const scrollWp = raw > HANDOFF_START
            ? Math.min(1, (raw - HANDOFF_START) / (1 - HANDOFF_START))
            : 0;
        let autoWp = 0;
        if (raw > GALLERY_END) {
            if (!autoHandoffStart) autoHandoffStart = now;
            autoWp = (now - autoHandoffStart - EXIT_HOLD_MS) / AUTO_HANDOFF_MS;
        } else {
            autoHandoffStart = 0;
        }
        const handoff = updateHandoff(Math.max(scrollWp, Math.max(0, Math.min(1, autoWp))));

        // Skip all work when section is well off-screen — cheap early exit.
        // Suspended while the handoff owns the frame so the dissolve can finish;
        // a fully off-screen section also re-arms the staged entrance so the whole
        // sequence replays the next time the section is approached.
        if (!handoff && (bcr.top > vh + 100 || bcr.bottom < -100)) {
            if (introSeenOnce || stageContentFired || exiting) {
                if (entranceTimer) { clearTimeout(entranceTimer); entranceTimer = null; }
                introSeenOnce = stageContentFired = stageCubeFired = exiting = false;
                illus.classList.remove('illus-stage-content', 'illus-stage-cube', 'illus-exiting');
            }
            return;
        }

        const dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow  = now;

        tgt = Math.min(raw / GALLERY_END, 1);   // gallery completes at GALLERY_END

        // ── Frozen exit ───────────────────────────────────────────────────
        // Past GALLERY_END the gallery is finished but the tunnel is still
        // pinned, so the section is frozen in place. Toggle .illus-exiting to
        // play the reverse choreography (content slides out, cube shrinks away,
        // leaving only the background) before the section unpins into #contact.
        const inExitBand = raw > GALLERY_END + 0.001;
        if (inExitBand !== exiting) {
            exiting = inExitBand;
            illus.classList.toggle('illus-exiting', exiting);
        }

        // ── Staged scroll-driven entrance ─────────────────────────────────
        // coverage = the share of the viewport this section occupies as it
        // rises over the photo curtain (bottom-up). It equals the photo
        // reveal's exitProgress, but measured from our own rect so the section
        // stays self-contained. Stage A (text + SVG) latches at 40% coverage,
        // Stage B (the 3D cube) at 90%. Each stage fires once and holds.
        if (!introSeenOnce) {
            const coverage = (window.innerHeight - bcr.top) / window.innerHeight;
            if (!stageContentFired && coverage >= 0.40) {
                stageContentFired = true;
                resetIntro();                       // restore label, evict stale photo
                illus.classList.add('illus-stage-content');
            }
            if (!stageCubeFired && coverage >= 0.90) {
                stageCubeFired = true;
                illus.classList.add('illus-stage-cube');
                if (!prefersReducedMotion && !IS_MOBILE) startIntroElecFlicker();
                introSeenOnce = true;               // entrance complete — latch
            }
        }

        if (SCROLL_DRIVEN) {
            // The CSS timeline rotates the cube off the raw scroll value (native
            // momentum already smooths touch scrolling) — keep the JS state in
            // lockstep so swaps/opacities/glitches don't trail the rotation.
            smooth = tgt;
        } else {
            smooth += (tgt - smooth) * (1 - Math.exp(-dt * 8));
            smooth  = Math.max(0, Math.min(1, smooth));
        }

        // Phone idle short-circuit: snap the asymptotic tail of the ease, then
        // skip every per-frame DOM write while the cube is parked on a stop —
        // no transform/opacity/class churn between scrolls. Desktop unchanged.
        if (IS_MOBILE) {
            if (Math.abs(tgt - smooth) < 0.0004) smooth = tgt;
            if (smooth === lastAppliedSmooth && !imgGlitchPending) return;
            lastAppliedSmooth = smooth;
        }

        // Phone: the electric-border faces are display:none in responsive.css —
        // skip the velocity tracking + class/timer churn that drives them.
        if (!IS_MOBILE) {
            const vel = Math.abs(smooth - prevSmooth);
            prevSmooth = smooth;
            if (vel > 0.0002) { elecOn(); } else if (elecActive) { elecOff(); }
        }

        setCubeTransform(smooth);
        updateFaceOpacities();
        checkImageSwaps(smooth);
        updateUI(smooth);

        // Fire image glitch once the cube face is mostly front-facing.
        // remaining: 0.5 when stop just changed, 0 when fully arrived.
        // Threshold 0.12 ≈ 76% through the landing rotation.
        if (imgGlitchPending && lastStop >= 0) {
            const remaining = Math.abs(smooth - lastStop / (N - 1)) * (N - 1);
            if (remaining < 0.12) {
                imgGlitchPending = false;
                fireImgGlitch(lastStop);
            }
        }
    }

    requestAnimationFrame(frame);

}());

