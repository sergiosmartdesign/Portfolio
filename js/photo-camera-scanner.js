/**
 * photo-camera-scanner.js
 * Glowing beam + particle stream along the visual right edge of the
 * polaroid camera image.  Canvas is position:fixed (body child) so it
 * sits above everything regardless of overflow or clip-path on #photo.
 *
 * Palette: white core → amber #EE9B00 → orange-brown #CA6702
 */
(function () {
  'use strict';

  /* ── tunables ─────────────────────────────────────────────────────────── */
  const TRAVEL_PX        = 260;   // canvas width = max rightward particle travel
  const LIGHT_BAR_WIDTH  = 4;     // beam core half-width, px
  const BASE_FADE_ZONE   = 55;    // vertical fade zone, px
  const BASE_MAX_P       = 600;
  const BASE_INTENSITY   = 0.6;
  const TRANSITION_SPEED = 0.04;
  /* ──────────────────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    const group = document.querySelector('.photo-camera-group');
    const img   = group && group.querySelector('.photo-polaroids-camera');
    if (!group || !img) return;

    /* fixed canvas — child of body, above everything */
    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:fixed;top:0;left:0;pointer-events:none;z-index:999;display:block;';
    document.body.appendChild(canvas);

    const scanner = new CameraScanner(canvas, group, img);

    /* MutationObserver: fires when photo-camera-reveal class changes on img */
    new MutationObserver(() => {
      scanner.setScanningActive(img.classList.contains('photo-camera-reveal'));
    }).observe(img, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', () => scanner.onResize());
  });

  /* ── CameraScanner ───────────────────────────────────────────────────── */
  class CameraScanner {
    constructor(canvas, group, img) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.group  = group;
      this.img    = img;

      this.particles      = [];
      this.count          = 0;
      this.scanningActive = false;
      this.h              = 300;

      /* lerped params */
      this.currentIntensity    = BASE_INTENSITY;
      this.currentMaxParticles = BASE_MAX_P;
      this.currentFadeZone     = BASE_FADE_ZONE;
      this.currentGlowIntensity= 1.0;

      this._buildGradCache();
      this._setupCanvas();
      this._animate();
    }

    /* ── 16 × 16 pre-baked particle sprite (amber palette) ─────────────── */
    _buildGradCache() {
      const gc = document.createElement('canvas');
      gc.width = gc.height = 16;
      const g  = gc.getContext('2d');
      const r  = gc.createRadialGradient(8, 8, 0, 8, 8, 8);
      r.addColorStop(0,    'rgba(255,255,255,1)');
      r.addColorStop(0.2,  'rgba(255,240,180,0.9)');
      r.addColorStop(0.5,  'rgba(238,155,0,0.55)');
      r.addColorStop(0.75, 'rgba(202,103,2,0.25)');
      r.addColorStop(1,    'rgba(202,103,2,0)');
      g.fillStyle = r;
      g.beginPath();
      g.arc(8, 8, 8, 0, Math.PI * 2);
      g.fill();
      this.gradCanvas = gc;
    }

    _setupCanvas() {
      const rect = this.group.getBoundingClientRect();
      /* height: use rect.height from the rotated group's bounding box */
      const h   = rect.height > 10 ? rect.height : 300;
      const dpr = window.devicePixelRatio || 1;

      this.h        = h;
      this.fadeZone = Math.min(BASE_FADE_ZONE, h * 0.15);

      this.canvas.width  = Math.round(TRAVEL_PX * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.canvas.style.width  = TRAVEL_PX + 'px';
      this.canvas.style.height = h + 'px';

      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._positionCanvas(rect);
    }

    _positionCanvas(rect) {
      /* rect.right = visual right edge of the (rotated) camera group */
      this.canvas.style.left = rect.right + 'px';
      this.canvas.style.top  = rect.top   + 'px';
    }

    onResize() {
      this.particles = [];
      this.count     = 0;
      this._setupCanvas();
    }

    /* ── particle factory ──────────────────────────────────────────────── */
    _createParticle() {
      return {
        x:            0,
        y:            Math.random() * this.h,
        vx:           Math.random() * 1.1 + 0.3,
        vy:           (Math.random() - 0.15) * 0.35,
        radius:       Math.random() * 1.2 + 0.4,
        alpha:        Math.random() * 0.5 + 0.5,
        originalAlpha:0,
        life:         1.0,
        decay:        Math.random() * 0.010 + 0.004,
        time:         0,
        twinkleSpeed: Math.random() * 0.07 + 0.02,
        twinkleAmt:   Math.random() * 0.20 + 0.08,
      };
    }

    _updateParticle(p) {
      p.x    += p.vx;
      p.y    += p.vy;
      p.time++;
      p.alpha = p.originalAlpha * p.life
              + Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmt;
      p.life -= p.decay;
      if (p.x > TRAVEL_PX + 10 || p.life <= 0) this._resetParticle(p);
    }

    _resetParticle(p) {
      p.x            = 0;
      p.y            = Math.random() * this.h;
      p.vx           = Math.random() * 1.1 + 0.3;
      p.vy           = (Math.random() - 0.15) * 0.35;
      p.alpha        = Math.random() * 0.5 + 0.5;
      p.originalAlpha= p.alpha;
      p.life         = 1.0;
      p.time         = 0;
    }

    _drawParticle(p) {
      if (p.life <= 0) return;
      const { h, fadeZone, ctx } = this;
      let fade = 1;
      if      (p.y < fadeZone)     fade = p.y / fadeZone;
      else if (p.y > h - fadeZone) fade = (h - p.y) / fadeZone;
      fade = Math.max(0, Math.min(1, fade));
      const a = Math.max(0, Math.min(1, p.alpha * fade));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const r = p.radius * 9;
      ctx.drawImage(this.gradCanvas, p.x - r, p.y - r, r * 2, r * 2);
    }

    /* ── beam: bright core + multi-layer amber/orange glow ─────────────── */
    _drawLightBar() {
      const { ctx, h, fadeZone } = this;
      const lw = LIGHT_BAR_WIDTH;
      const gi = this.currentGlowIntensity;

      /* vertical fade gradient (used at the end with destination-in) */
      const vFade = ctx.createLinearGradient(0, 0, 0, h);
      vFade.addColorStop(0,               'rgba(0,0,0,0)');
      vFade.addColorStop(fadeZone / h,    'rgba(0,0,0,1)');
      vFade.addColorStop(1 - fadeZone / h,'rgba(0,0,0,1)');
      vFade.addColorStop(1,               'rgba(0,0,0,0)');

      ctx.globalCompositeOperation = 'lighter';

      /* ── core: white/warm beam centered on x = 0 ────────────────────── */
      /* Gradient spans -lw..+lw so x=0 (canvas left edge) is at max brightness.
         We draw from x=0 outward — the left half lives behind the camera.        */
      const core = ctx.createLinearGradient(-lw, 0, lw, 0);
      core.addColorStop(0,   'rgba(255,255,255,0)');
      core.addColorStop(0.4, `rgba(255,253,210,${Math.min(1, 0.95 * gi)})`);
      core.addColorStop(0.5, `rgba(255,255,255,${Math.min(1, gi)})`);
      core.addColorStop(0.6, `rgba(255,253,210,${Math.min(1, 0.95 * gi)})`);
      core.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle   = core;
      ctx.fillRect(0, 0, lw * 2, h);           /* right half of the beam */

      /* ── glow 1: amber, 10px spread ────────────────────────────────── */
      const g1 = ctx.createLinearGradient(-lw * 4, 0, lw * 4, 0);
      g1.addColorStop(0,   'rgba(238,155,0,0)');
      g1.addColorStop(0.5, `rgba(238,155,0,${Math.min(1, 0.65 * gi)})`);
      g1.addColorStop(1,   'rgba(238,155,0,0)');
      ctx.globalAlpha = 0.95;
      ctx.fillStyle   = g1;
      ctx.fillRect(0, 0, lw * 8, h);

      /* ── glow 2: orange-brown, 20px spread ─────────────────────────── */
      const g2 = ctx.createLinearGradient(-lw * 8, 0, lw * 8, 0);
      g2.addColorStop(0,   'rgba(202,103,2,0)');
      g2.addColorStop(0.5, `rgba(202,103,2,${Math.min(1, 0.45 * gi)})`);
      g2.addColorStop(1,   'rgba(202,103,2,0)');
      ctx.globalAlpha = 0.80;
      ctx.fillStyle   = g2;
      ctx.fillRect(0, 0, lw * 16, h);

      /* ── glow 3: wide amber halo, 40px spread ──────────────────────── */
      const g3 = ctx.createLinearGradient(-lw * 16, 0, lw * 16, 0);
      g3.addColorStop(0,   'rgba(238,155,0,0)');
      g3.addColorStop(0.5, `rgba(238,155,0,${Math.min(1, 0.20 * gi)})`);
      g3.addColorStop(1,   'rgba(238,155,0,0)');
      ctx.globalAlpha = 0.65;
      ctx.fillStyle   = g3;
      ctx.fillRect(0, 0, lw * 32, h);

      /* ── apply vertical fade via destination-in ─────────────────────── */
      ctx.globalCompositeOperation = 'destination-in';
      ctx.globalAlpha = 1;
      ctx.fillStyle   = vFade;
      ctx.fillRect(0, 0, TRAVEL_PX, h);
    }

    /* ── main render loop ─────────────────────────────────────────────── */
    _render() {
      const { ctx } = this;

      /* fallback: also detect class directly in case MutationObserver missed it */
      const wantsActive = this.img.classList.contains('photo-camera-reveal');
      if (wantsActive !== this.scanningActive) {
        this.setScanningActive(wantsActive);
        return; /* _setupCanvas resets transform; let next frame start fresh */
      }

      /* lerp toward scan / idle targets */
      const targetIntensity = this.scanningActive ? 2.0  : BASE_INTENSITY;
      const targetMaxP      = this.scanningActive ? 2200 : BASE_MAX_P;
      const targetFadeZone  = this.scanningActive ? 30   : BASE_FADE_ZONE;
      const targetGlowI     = this.scanningActive ? 3.0  : 1.0;

      this.currentIntensity    += (targetIntensity - this.currentIntensity)    * TRANSITION_SPEED;
      this.currentMaxParticles += (targetMaxP      - this.currentMaxParticles) * TRANSITION_SPEED;
      this.currentFadeZone     += (targetFadeZone  - this.currentFadeZone)     * TRANSITION_SPEED;
      this.currentGlowIntensity+= (targetGlowI     - this.currentGlowIntensity)* TRANSITION_SPEED;

      const intensity   = this.currentIntensity;
      const maxP        = Math.floor(this.currentMaxParticles);
      this.fadeZone     = this.currentFadeZone;

      /* clear */
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, TRAVEL_PX, this.h);

      /* skip drawing when fully idle */
      if (!this.scanningActive && intensity <= BASE_INTENSITY + 0.02) return;

      /* track camera every frame */
      this._positionCanvas(this.group.getBoundingClientRect());

      /* beam */
      this._drawLightBar();

      /* particles — additive */
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 1; i <= this.count; i++) {
        const p = this.particles[i];
        if (p) { this._updateParticle(p); this._drawParticle(p); }
      }
      ctx.globalAlpha = 1;

      /* spawn */
      if (Math.random() < intensity && this.count < maxP) {
        const p = this._createParticle();
        p.originalAlpha = p.alpha;
        this.count++;
        this.particles[this.count] = p;
      }

      /* cascade spawns at high intensity */
      const ir = intensity / BASE_INTENSITY;
      if (ir > 1.2 && Math.random() < (ir - 1.0) * 1.5 && this.count < maxP) {
        const p = this._createParticle(); p.originalAlpha = p.alpha;
        this.count++; this.particles[this.count] = p;
      }
      if (ir > 1.8 && Math.random() < (ir - 1.8) * 2.0 && this.count < maxP) {
        const p = this._createParticle(); p.originalAlpha = p.alpha;
        this.count++; this.particles[this.count] = p;
      }

      /* cull excess */
      if (this.count > maxP + 200) {
        const excess = Math.min(15, this.count - maxP);
        for (let i = 0; i < excess; i++) delete this.particles[this.count - i];
        this.count -= excess;
      }
    }

    _animate() {
      try {
        this._render();
      } catch (e) {
        /* swallow errors so the loop never dies silently */
        console.error('[CameraScanner]', e);
      }
      requestAnimationFrame(() => this._animate());
    }

    setScanningActive(active) {
      if (active && !this.scanningActive) {
        this._setupCanvas();  /* re-measure now that section is definitely visible */
      }
      this.scanningActive = active;
    }
  }
})();
