/**
 * blog-vault.js — "VAULT-90s" portal in the blog hero.
 *
 * A 29-frame stop-motion door sequence (frame-01 closed → frame-29 open onto the
 * server tunnel). Frames are pre-rendered WebP stills swapped on a single <img>;
 * frame-01 ships in the HTML as the poster, frames 02–29 are preloaded + decoded
 * when the section approaches the viewport so the first interaction is flicker-free.
 *
 * Interaction model:
 *   - On view:                 opens itself 2s after the section scrolls in and
 *                              stays open on the final frame (plays once).
 *   - Pointer (hover-capable): hover/focus brings the auto-open forward; never closes.
 *   - Click / Enter:           follows the anchor to the post (native <a> behaviour).
 *   - prefers-reduced-motion:  jumps straight to the open frame, no sequence.
 *
 * Single source of truth for the destination URL lives in POST_URL below.
 */
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────────────────────── */
  // TODO: point this at the published post's PUBLIC url once the Ghost site is
  // out of private mode (e.g. https://dijital-junkworks.ghost.io/<post-slug>/).
  const POST_URL    = 'https://dijital-junkworks.ghost.io/';
  const FRAME_COUNT = 29;
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

    /* The door opens itself once and stays open on the final frame. Reduced
       motion gets the same end state without the sequence. */
    let autoOpened = false;
    let autoTimer  = null;
    function autoOpen() {
      if (autoOpened) return;
      autoOpened = true;
      preload();
      if (reduceMotion.matches) {
        current = target = OPEN;
        frame.src = srcOf(OPEN);
        return;
      }
      playTo(OPEN);
    }

    /* ── Pointer / keyboard wiring (hover-capable devices) ──────────────────────
       Hover/focus just brings the auto-open forward; it never closes again.   */
    if (canHover.matches) {
      portal.addEventListener('mouseenter', autoOpen);
      portal.addEventListener('focus', autoOpen);
    }

    /* ── Viewport observer ──────────────────────────────────────────────────────
       Warms the cache, then opens the door automatically 2s after the section
       scrolls into view. Fires once and is left on the open frame.            */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preload();
          if (!autoOpened && autoTimer === null) {
            autoTimer = setTimeout(autoOpen, 2000);
          }
        }
      });
    }, { rootMargin: '0px', threshold: 0.25 });

    observer.observe(portal);

    /* If the user flips reduced-motion on mid-session, snap back to closed. */
    reduceMotion.addEventListener('change', (e) => {
      if (e.matches) {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        current = target = CLOSED;
        frame.src = srcOf(CLOSED);
      }
    });

    /* ── Sidebar vault: the closed door covers the article list. A click opens
       it once (CLOSED→OPEN) and stops on the final frame; then .is-open drops the
       door behind so the articles rise on top. Not automatic, no loop. ───────── */
    (function sidebarReveal() {
      const sidebar = document.querySelector('.blog-sidebar');
      const layer   = document.querySelector('.blog-sidebar__bg');
      const bg      = document.querySelector('.blog-sidebar__bg-frame');
      if (!sidebar || !layer || !bg) return;

      // Reduced motion: skip the sequence — show the open door + reveal the list.
      if (reduceMotion.matches) {
        bg.src = srcOf(OPEN);
        sidebar.classList.add('is-open');
        layer.setAttribute('aria-expanded', 'true');
        return;
      }

      bg.src = srcOf(CLOSED);
      let cur = CLOSED, last = 0, raf = null, state = 'closed'; // closed | opening | open

      function step(now) {
        if (now - last >= FRAME_MS) {
          last = now;
          cur += 1;
          bg.src = srcOf(cur);
          if (cur >= OPEN) {            // stop on the final frame
            raf = null;
            state = 'open';
            sidebar.classList.add('is-open');
            layer.setAttribute('aria-expanded', 'true');
            return;
          }
        }
        raf = requestAnimationFrame(step);
      }

      function openVault() {
        if (state !== 'closed') return;
        state = 'opening';
        preload();
        last = 0;
        raf = requestAnimationFrame(step);
      }

      layer.addEventListener('click', openVault);
      layer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVault(); }
      });
    }());

    if (window.App) App.BlogVault = { open, close };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
