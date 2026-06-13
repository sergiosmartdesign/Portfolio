/**
 * blog-vault.js — "VAULT-90s" portal in the blog hero.
 *
 * A 17-frame stop-motion door sequence (frame-01 closed → frame-17 open onto the
 * server tunnel). Frames are pre-rendered WebP stills swapped on a single <img>;
 * frame-01 ships in the HTML as the poster, frames 02–17 are preloaded + decoded
 * when the section approaches the viewport so the first interaction is flicker-free.
 *
 * Interaction model:
 *   - Pointer (hover-capable): hover/focus opens the doors, leave/blur closes them.
 *   - Touch / no-hover:        opens once when scrolled into view (no hover to rely on).
 *   - Click / Enter:           follows the anchor to the post (native <a> behaviour).
 *   - prefers-reduced-motion:  stays on the closed poster frame, no sequence.
 *
 * Single source of truth for the destination URL lives in POST_URL below.
 */
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────────────────────── */
  // TODO: point this at the published post's PUBLIC url once the Ghost site is
  // out of private mode (e.g. https://dijital-junkworks.ghost.io/<post-slug>/).
  const POST_URL    = 'https://dijital-junkworks.ghost.io/';
  const FRAME_COUNT = 17;
  const FRAME_DIR   = 'images/blog/frames/';
  const FRAME_MS    = 70;   // ~14 fps — reads as deliberate stop-motion
  const CLOSED      = 1;
  const OPEN        = FRAME_COUNT;

  const pad   = (n) => String(n).padStart(2, '0');
  const srcOf = (n) => `${FRAME_DIR}frame-${pad(n)}.webp`;

  function init() {
    const portal = document.querySelector('.blog-vault');
    if (!portal) return;

    const frame = portal.querySelector('.blog-vault__frame');
    if (!frame) return;

    /* Centralise the destination: portal + headline + read-more all point here. */
    document.querySelectorAll('[data-blog-post-link]').forEach((a) => {
      a.setAttribute('href', POST_URL);
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canHover     = window.matchMedia('(hover: hover) and (pointer: fine)');

    let current   = CLOSED;   // frame currently shown
    let target    = CLOSED;   // frame we are animating toward
    let rafId     = null;
    let lastStep  = 0;
    let preloaded = false;

    /* ── Preload + decode frames 02–17 (01 is the HTML poster) ──────────────── */
    function preload() {
      if (preloaded) return;
      preloaded = true;
      for (let i = CLOSED + 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = srcOf(i);
        if (img.decode) img.decode().catch(() => {});
      }
    }

    /* ── Frame sequencer ────────────────────────────────────────────────────── */
    function tick(now) {
      if (current === target) { rafId = null; return; }
      if (now - lastStep >= FRAME_MS) {
        lastStep = now;
        current += current < target ? 1 : -1;
        frame.src = srcOf(current);
      }
      rafId = requestAnimationFrame(tick);
    }

    function playTo(dest) {
      if (reduceMotion.matches) return;
      target = dest;
      if (rafId === null && current !== target) {
        lastStep = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    const open  = () => { preload(); playTo(OPEN); };
    const close = () => playTo(CLOSED);

    /* ── Pointer / keyboard wiring (hover-capable devices) ──────────────────── */
    if (canHover.matches) {
      portal.addEventListener('mouseenter', open);
      portal.addEventListener('mouseleave', close);
      portal.addEventListener('focus', open);
      portal.addEventListener('blur', close);
    }

    /* ── Viewport observer ──────────────────────────────────────────────────────
       Always used to warm the cache; on touch / no-hover it also plays the
       open sequence once so those users still see the reveal. Closes again on
       exit so the gesture can replay on the next scroll-in.                     */
    const playsOnView = !canHover.matches && !reduceMotion.matches;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preload();
          if (playsOnView) {
            // Defer one frame so the preload kicks off first.
            requestAnimationFrame(() => playTo(OPEN));
          }
        } else {
          if (playsOnView) close();
          // Stop any in-flight sequence while off-screen.
          if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        }
      });
    }, { rootMargin: '400px 0px', threshold: 0.01 });

    observer.observe(portal);

    /* If the user flips reduced-motion on mid-session, snap back to closed. */
    reduceMotion.addEventListener('change', (e) => {
      if (e.matches) {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        current = target = CLOSED;
        frame.src = srcOf(CLOSED);
      }
    });

    if (window.App) App.BlogVault = { open, close };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
