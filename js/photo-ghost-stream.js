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
      this._onCardClick      = null;

      this._cameraEl       = null;
      this._cardLastPhase  = null; // per-card: -1=hidden, 0=entering(t<0.22), 1=visible(t>=0.22)
      this._ejectRafPending = false;
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
    }

    resize() {
      this._updateStreamWidth();
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
      if (this._streamLbOpen) this._streamLbHide?.();
    }

    // Partial deactivation — stops info anim and removes the active CSS class
    // without fully resetting stream state. Used by _cancelChain when the
    // scroll tick will complete the reset on the next frame.
    deactivate() {
      this.stopInfoAnim();
      this._stream?.classList.remove('stream-active');
    }

    startInfoAnim() {
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

    stopInfoAnim() {
      if (this._infoAnimInterval) {
        clearTimeout(this._infoAnimInterval);
        this._infoAnimInterval = null;
      }
      const rightEl = document.querySelector('.pgallery-info-right');
      const leftEl  = document.querySelector('.pgallery-info-left');
      if (rightEl) rightEl.textContent = '';
      if (leftEl)  leftEl.textContent  = '';
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
      const CARD_W       = 195;
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
