/**
 * barcode-animation.js — ambient cyberpunk barcode overlay for #intro.
 *
 * Renders full-height vertical bars of stochastic widths (1–8 px) at very
 * low opacity, with individual luminance flicker, a single horizontal scan-
 * band that sweeps top→bottom every ~5 s, and rare amber glitch bursts on
 * wider bars.  Layered via CSS mix-blend-mode:screen above the ParticleSystem
 * canvas so it enriches dark areas without obscuring bright particles or text.
 *
 * Exposes:  App.BarcodeAnimation = { start, stop }
 */
(function () {
  'use strict';

  const isSafari = App.BrowserDetect
    ? App.BrowserDetect.isSafariBased()
    : /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Project colour palette (rgb triples)
  const COL_TEAL  = [10,  147, 150];  // #0A9396
  const COL_MINT  = [148, 210, 189];  // #94D2BD
  const COL_CYAN  = [0,   238, 255];  // #0EEFFF
  const COL_AMBER = [238, 155, 0  ];  // #EE9B00  — glitch accent only

  // Weighted pool: teal appears 3×, mint 2×, cyan 1×
  const BASE_POOL = [COL_TEAL, COL_TEAL, COL_TEAL, COL_MINT, COL_MINT, COL_CYAN];

  const TARGET_FPS  = isSafari ? 16 : 24;
  const FRAME_MS    = 1000 / TARGET_FPS;
  const SCAN_PERIOD = 5200; // ms — one full top-to-bottom sweep

  let canvas = null;
  let ctx    = null;
  let rafId  = null;
  let running  = false;
  let lastTime = 0;

  let W = 0, H = 0;
  let bars = [];
  let scanProgress = 0; // 0..1 normalised vertical position

  // ─── Bar geometry & state ────────────────────────────────────────────────

  function buildBars() {
    bars = [];
    let x = 0;
    while (x < W) {
      const r = Math.random();
      // Width distribution: ~52% 1 px, ~26% 2 px, ~12% 3 px, ~10% 4-8 px
      const w = r < 0.52 ? 1
              : r < 0.78 ? 2
              : r < 0.90 ? 3
              : 4 + Math.floor(Math.random() * 5);

      const gap    = Math.random() < 0.28 ? 1 : 0;    // occasional 1-px gap
      const active = Math.random() < 0.62;             // ~38% of bars are invisible

      bars.push({
        x, w, active,
        col:          BASE_POOL[Math.floor(Math.random() * BASE_POOL.length)],
        baseAlpha:    0.028 + Math.random() * 0.062,   // 0.028..0.09
        phase:        Math.random() * Math.PI * 2,
        flickerHz:    0.7  + Math.random() * 2.3,      // rad/s
        // Glitch state (only relevant for w >= 2)
        glitchPeriod: 1800 + Math.random() * 3500,     // ms between opportunities
        glitchTimer:  Math.random() * 2000,            // stagger initial timing
        glitchOn:     false,
        glitchY:      0,
        glitchH:      0,
      });
      x += w + gap;
    }
  }

  // ─── Canvas lifecycle ────────────────────────────────────────────────────

  function createCanvas() {
    const intro = document.getElementById('intro');
    if (!intro) return false;

    canvas = document.createElement('canvas');
    canvas.id = 'barcodeCanvas';
    canvas.setAttribute('aria-hidden', 'true');

    // Place after particle canvas so it layers above it (z-index in CSS handles order)
    const particleCanvas = intro.querySelector('#particleCanvas');
    if (particleCanvas) {
      particleCanvas.after(canvas);
    } else {
      intro.insertBefore(canvas, intro.firstChild);
    }

    ctx = canvas.getContext('2d');
    resize();
    return true;
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    buildBars();
    scanProgress = 0;
  }

  // ─── Render loop ─────────────────────────────────────────────────────────

  function draw(timestamp) {
    if (!running) return;
    rafId = requestAnimationFrame(draw);

    const elapsed = timestamp - lastTime;
    if (elapsed < FRAME_MS) return;
    lastTime = timestamp - (elapsed % FRAME_MS);

    const t = timestamp * 0.001; // seconds

    // Advance scan line
    scanProgress = (scanProgress + elapsed / SCAN_PERIOD) % 1;
    const scanY = scanProgress * H;

    ctx.clearRect(0, 0, W, H);

    // ── 1. Vertical bars ─────────────────────────────────────────────────
    for (let i = 0; i < bars.length; i++) {
      const b = bars[i];
      if (!b.active) continue;

      // Individual luminance flicker (slow sine)
      const flicker = 0.55 + 0.45 * Math.sin(t * b.flickerHz + b.phase);
      const a = b.baseAlpha * flicker;
      const [r, g, bc] = b.col;

      ctx.fillStyle = `rgba(${r},${g},${bc},${a})`;
      ctx.fillRect(b.x, 0, b.w, H);

      // Glitch burst — one-frame amber flash on wider bars
      if (b.w >= 2) {
        b.glitchTimer -= elapsed;
        if (b.glitchTimer <= 0) {
          b.glitchTimer = b.glitchPeriod + Math.random() * 1200;
          if (Math.random() < 0.42) {
            b.glitchOn = true;
            b.glitchY  = Math.random() * H;
            b.glitchH  = 1 + Math.floor(Math.random() * 6);
          }
        }
        if (b.glitchOn) {
          const [ar, ag, ab] = COL_AMBER;
          ctx.fillStyle = `rgba(${ar},${ag},${ab},0.78)`;
          ctx.fillRect(b.x, b.glitchY, b.w, b.glitchH);
          b.glitchOn = false; // single-frame flash, reset immediately
        }
      }
    }

    // ── 2. Horizontal scan sweep (one gradient, full width) ───────────────
    const bandH    = H * 0.072;
    const bandTop  = Math.max(0, scanY - bandH);
    const bandBot  = Math.min(H, scanY + bandH);
    const sweep    = ctx.createLinearGradient(0, bandTop, 0, bandBot);
    sweep.addColorStop(0,   'rgba(0,238,255,0)');
    sweep.addColorStop(0.5, 'rgba(0,238,255,0.058)');
    sweep.addColorStop(1,   'rgba(0,238,255,0)');
    ctx.fillStyle = sweep;
    ctx.fillRect(0, bandTop, W, bandBot - bandTop);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  function start() {
    if (running) return;
    if (!canvas && !createCanvas()) return;
    running  = true;
    lastTime = 0;
    canvas.style.opacity = '1';
    requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (canvas) canvas.style.opacity = '0';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  window.addEventListener('resize', () => { if (canvas) resize(); }, { passive: true });

  App.BarcodeAnimation = { start, stop };
})();
