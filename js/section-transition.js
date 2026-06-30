/**
 * Section Transition — interstitial particle wipe between menu navigations.
 *
 * Masks the instant scroll jump done by NavigationManager.goToSection with a
 * ~1.5s cover → reveal: the viewport turns #001219 while a multicolor particle
 * swarm (the same ParticleSystem config as the #preloader) blooms in, the
 * navigation happens fully hidden at the peak, then the overlay fades out to
 * reveal the chosen section.
 *
 * Timeline (1500ms total):
 *   COVER   0–600ms   overlay #001219 fades in (ease-in); particles lag 150ms
 *                     behind so the dark establishes first ("luego a la par").
 *   PEAK    600–~780  particles frozen for the nav reflow, then breathing — the
 *                     scroll jump + entrance triggers (midFn) fire here, hidden.
 *   REVEAL  ~780–1500 overlay fades out (ease-out), revealing the destination.
 *
 * Performance architecture (the reason this stays at 60fps through the jump):
 *   - COMPOSITOR FADES. opacity is animated by CSS transitions, not a main-thread
 *     rAF tween — so the cover keeps gliding on the compositor thread even while
 *     the main thread is stalled doing the navigation reflow. (The old rAF tween
 *     stuttered in lock-step with that reflow; this is the core fix.)
 *   - REFLOW ISOLATION. The heavy work (scroll jump + sticky-section measuring +
 *     entrance triggers + observers) runs while the particle sim is PAUSED, with
 *     a two-frame yield so layout/paint commit before the swarm resumes. The
 *     nav frame gets the whole budget; particles never pile onto it. All of this
 *     is invisible under the fully-opaque cover.
 *   - POOLED. overlay + ParticleSystem are built once on first use, then paused
 *     at rest and resumed per transition (no per-nav grid rebuild / GC). The
 *     canvas is only re-sized when the viewport actually changed (reassigning
 *     canvas.width wipes the bitmap — we avoid that on every nav).
 *   - No external deps; degrades to an immediate midFn() if ParticleSystem is
 *     unavailable. Desktop-only + reduced-motion gating live in the caller.
 *
 * Scan-line overlay:
 *   An electric-static line (shared js/static-line.js look) sweeps bottom→top
 *   across the whole 1.5s, riding ABOVE the cover + particles as a sibling at
 *   z-index 9991. Its travel + fade are a compositor CSS animation
 *   (@keyframes stScanTravel), so they stay smooth through the nav reflow too.
 */
(function () {
  'use strict';

  const COVER_MS       = 600;  // overlay #001219 + particles fade IN
  const HOLD_MS        = 150;  // particles breathe at full before the reveal
  const REVEAL_MS      = 750;  // overlay fades OUT, revealing the destination
  const CANVAS_LEAD_MS = 150;  // particles lag the bg by this much during cover

  // One full bottom→top sweep of the electric-static scan-line spans the whole
  // transition, so it rides over the cover, the hidden nav, AND the reveal.
  const TRAVEL_MS      = COVER_MS + HOLD_MS + REVEAL_MS;  // 1500

  // ease-in (accelerate — respect the user's decision) for the cover,
  // ease-out (decelerate — present the destination calmly) for the reveal.
  // cubic-bezier equivalents of easeInQuad / easeOutCubic, run on the compositor.
  const EASE_IN  = 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
  const EASE_OUT = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

  const wait      = ms => new Promise(r => setTimeout(r, ms));
  // Two animation frames: lets a forced reflow/repaint commit before continuing.
  const twoFrames = () =>
    new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  /**
   * Compositor-driven opacity fade. The transition runs off the main thread, so
   * it stays smooth even while the main thread is busy with the navigation
   * reflow. Resolves on transitionend, with a timeout safety net so a dropped
   * event can never strand the overlay.
   */
  function fade(el, to, durationMs, easing, delayMs = 0) {
    return new Promise(resolve => {
      el.style.transition = `opacity ${durationMs}ms ${easing} ${delayMs}ms`;
      void el.offsetWidth;            // flush: animate from the CURRENT opacity
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = e => {
        if (e.target === el && e.propertyName === 'opacity') done();
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(done, durationMs + delayMs + 100);   // safety net
      requestAnimationFrame(() => { el.style.opacity = String(to); });
    });
  }

  let overlay  = null;
  let canvas   = null;
  let fx       = null;    // pooled ParticleSystem instance
  let scanline = null;    // pooled electric-static scan-line canvas
  let scanFx   = null;    // its makeStaticLine() controller ({ show, hide })
  let running  = false;
  let lastW    = 0, lastH = 0;

  /**
   * Restart the bottom→top scan-line sweep. The electric-static look reuses the
   * shared makeStaticLine() jitter loop (shadow off — the cyan glow is a CSS
   * drop-shadow); the travel itself is a compositor CSS animation (transform +
   * opacity only) so it stays smooth through the navigation reflow.
   */
  function startScanline() {
    if (!scanFx) return;
    scanFx.show();                       // begin the per-frame static jitter
    // Randomise the sweep direction each time: ~half bottom→top, ~half top→bottom.
    const dir = Math.random() < 0.5 ? 'stScanTravel' : 'stScanTravelDown';
    scanline.style.animation = 'none';   // reset, then force a reflow so the…
    void scanline.offsetWidth;           // …animation can replay from the start
    scanline.style.animation = `${dir} ${TRAVEL_MS}ms linear forwards`;
  }

  function stopScanline() {
    if (!scanFx) return;
    scanFx.hide();
    scanline.style.animation = 'none';
  }

  function lazyInit() {
    if (overlay) return true;
    if (typeof ParticleSystem === 'undefined') return false;

    overlay = document.createElement('div');
    overlay.id = 'section-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    // Same multicolor #001219 swarm as the preloader, but pooled — built once,
    // paused at rest, resumed for each transition.
    fx = new ParticleSystem({
      hostId: 'section-transition',
      colorMode: 'multi',
      bgInit: 'rgba(0, 18, 25, 1)',
      bgFade: 'rgba(0, 18, 25, 0.1)',
      inlinePosition: true,
    });
    fx.pause();
    canvas = overlay.querySelector('canvas');
    lastW = window.innerWidth;
    lastH = window.innerHeight;

    // Sibling scan-line above the cover (z-index 9991): kept OUT of the overlay
    // so it stays crisp during the reveal fade instead of dimming with it.
    if (typeof makeStaticLine === 'function') {
      scanline = document.createElement('canvas');
      scanline.id = 'section-transition-scanline';
      scanline.setAttribute('aria-hidden', 'true');
      document.body.appendChild(scanline);
      scanFx = makeStaticLine(scanline, { shadow: false });
    }

    return !!canvas && !fx.destroyed;
  }

  /**
   * Run one cover → (midFn) → reveal cycle. `midFn` performs the real navigation
   * (scroll jump + entrance triggers) while the overlay is fully opaque. Always
   * runs midFn exactly once; resolves when the overlay is gone again.
   */
  async function run(midFn) {
    // Re-entrancy / unsupported fallbacks still navigate, just without the wipe.
    if (running || !lazyInit()) { if (midFn) midFn(); return; }
    running = true;

    // Re-sync the canvas to the viewport only when it actually changed —
    // reassigning canvas.width clears the bitmap, so skip the needless wipe.
    if (window.innerWidth !== lastW || window.innerHeight !== lastH) {
      fx.resize();
      lastW = window.innerWidth;
      lastH = window.innerHeight;
    }

    overlay.classList.add('is-running');
    fx.resume();
    startScanline();   // one bottom→top sweep, spanning the whole transition

    // ── COVER ───────────────────────────────────────────────────────────────
    // #001219 base establishes first; the swarm blooms a beat later.
    await Promise.all([
      fade(overlay, 1, COVER_MS, EASE_IN),
      fade(canvas, 1, COVER_MS - CANVAS_LEAD_MS, EASE_OUT, CANVAS_LEAD_MS),
    ]);

    // ── PEAK: hand the whole frame to the navigation reflow ──────────────────
    // Freeze the swarm, do the heavy scroll jump + entrance triggers, let layout
    // and paint commit, then resume. Fully hidden under the opaque cover.
    fx.pause();
    try { if (midFn) midFn(); } catch (e) { /* never strand the overlay */ }
    await twoFrames();
    fx.resume();
    await wait(HOLD_MS);   // swarm breathes at full before the reveal

    // ── REVEAL ───────────────────────────────────────────────────────────────
    // One compositor fade carries the whole overlay; the canvas rides along as
    // its child at opacity 1 (no separate canvas tween needed here).
    await fade(overlay, 0, REVEAL_MS, EASE_OUT);

    // ── TEARDOWN (pooled: pause, never destroy) ─────────────────────────────
    overlay.classList.remove('is-running');
    canvas.style.transition = 'none';   // reset instantly for the next cover
    canvas.style.opacity    = '0';
    fx.pause();
    stopScanline();
    running = false;
  }

  window.SectionTransition = { run, isRunning: () => running };
})();
