/**
 * about-pin.js — #about Paul Rand quote: self-running, looping reveal.
 *
 * initAboutPin(smoothScrollTo)
 *   smoothScrollTo is injected by the caller (script.js) so this module
 *   does not need to know about the scroll duration constants defined there.
 *
 * The section no longer hijacks the scroll. The quote plays itself:
 *   Design h3 glitches → each yellow line slides into the 1-line window with a
 *   glitch and a readable pause → ending glitches in → the full quote holds →
 *   the sequence loops. The loop is paused whenever the section is offscreen
 *   (IntersectionObserver) and is skipped entirely under prefers-reduced-motion.
 */
(function () {
  'use strict';

  function initAboutPin(smoothScrollTo) {
    const wrapper        = document.querySelector('.about-pin-wrapper');
    const about          = document.getElementById('about');
    const header         = document.querySelector('header');
    if (!wrapper || !about || !header) return;

    const quoteItems     = Array.from(document.querySelectorAll('.paul-rands-quote li'));
    const ending         = document.querySelector('.paul-rands-quote .ending');
    const quoteContainer = document.querySelector('.paul-rands-quote');
    const quoteH3        = document.querySelector('.paul-rands-quote blockquote p');
    const numItems       = quoteItems.length; // 3

    const STEP_ANIM      = 900;   // ms for one yellow-line slide-in
    const READABLE_PAUSE = 1000;  // ms hold after a line's glitch settles
    const END_HOLD       = 2800;  // ms the full quote stays before looping
    const LOOP_GAP       = 600;   // ms blank-ish beat before the reveal restarts

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── State ──────────────────────────────────────────────────────────────────

    let lastIndex     = -2;     // last snapped item index (-2 = uninitialised)
    let endingShown   = false;
    let sectionActive = false;
    let running       = false;  // a reveal sequence is in flight
    let rafId         = null;
    let stepTimer     = null;   // single owned timeout for the whole sequence

    if (App) App._scrollPathActive = false; // legacy flag; no readers remain

    // ── Helpers ──────────────────────────────────────────────────────────────

    function measure() {
      document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    }

    function triggerGlitch(el) {
      if (!el) return;
      el.classList.remove('glitch-active');
      void el.offsetWidth;
      el.classList.add('glitch-active');
    }

    function glitchDuration(el) {
      if (!el) return 500;
      const chars = el.querySelectorAll('[data-char]');
      if (!chars.length) return 500;
      return 500 + (chars.length - 1) * 0.55 * 200;
    }

    function applyOffset(offset) {
      const ty = -offset * 1.2;
      quoteItems.forEach(li => { li.style.transform = `translateY(${ty}em)`; });
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    // ── Sequence ────────────────────────────────────────────────────────────

    function animateStep(fromOffset, toOffset, onDone) {
      let startTime = null;
      function tick(ts) {
        if (!running) return;
        if (!startTime) startTime = ts;
        const t = Math.min((ts - startTime) / STEP_ANIM, 1);
        applyOffset(fromOffset + (toOffset - fromOffset) * easeOutCubic(t));
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
          onDone();
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function runStep(stepIndex) {
      if (!running) return;

      if (stepIndex < numItems) {
        animateStep(stepIndex - 1, stepIndex, () => {
          if (!running) return;
          triggerGlitch(quoteItems[stepIndex]);
          lastIndex = stepIndex;
          const settleMs = glitchDuration(quoteItems[stepIndex]);
          stepTimer = setTimeout(() => {
            if (!running) return;
            stepTimer = setTimeout(() => runStep(stepIndex + 1), READABLE_PAUSE);
          }, settleMs);
        });

      } else {
        // Full quote: reveal the ending, hold, then loop.
        endingShown = true;
        if (ending) {
          ending.classList.add('visible');
          triggerGlitch(ending);
          stepTimer = setTimeout(loopRestart, glitchDuration(ending) + END_HOLD);
        } else {
          stepTimer = setTimeout(loopRestart, END_HOLD);
        }
      }
    }

    function runIntro() {
      if (running || !sectionActive) return;
      running     = true;
      endingShown = false;
      lastIndex   = -2;
      if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
      applyOffset(-1);
      triggerGlitch(quoteH3);

      const h3Ms = glitchDuration(quoteH3);
      stepTimer = setTimeout(() => {
        if (!running) return;
        runStep(0);
      }, h3Ms + READABLE_PAUSE);
    }

    function loopRestart() {
      running = false;
      if (!sectionActive) return;
      stepTimer = setTimeout(runIntro, LOOP_GAP);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      clearTimeout(stepTimer);
    }

    // ── Static (reduced-motion / fallback) ────────────────────────────────────

    function showStaticQuote() {
      stop();
      if (quoteContainer) quoteContainer.classList.add('static-display');
      if (ending) ending.classList.add('visible');
      applyOffset(numItems - 1);
    }

    // ── Section observer — play while visible, pause while not ─────────────────

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        sectionActive = entry.isIntersecting;
        if (prefersReducedMotion) return;

        if (sectionActive) {
          if (!running) runIntro();
        } else {
          stop();
        }
      });
    }, { threshold: 0.05 });

    // ── Nav button / bfcache ───────────────────────────────────────────────────

    const aboutNavBtn = document.querySelector('a[href="#about"].nav-btn');
    if (aboutNavBtn) {
      aboutNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetY = Math.max(0, wrapper.offsetTop - header.offsetHeight);
        smoothScrollTo(targetY);
        // Restart the reveal from the top so a nav-in always sees the intro.
        if (!prefersReducedMotion) { stop(); endingShown = false; runIntro(); }
      });
    }

    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      if (prefersReducedMotion) { showStaticQuote(); return; }
      stop();
      if (sectionActive) runIntro();
    });

    // ── Init ───────────────────────────────────────────────────────────────────

    wrapper.style.height = '';      // release the old scroll-pin extra height
    measure();
    window.addEventListener('resize', measure);

    if (prefersReducedMotion) {
      showStaticQuote();
    } else {
      observer.observe(about);
    }
  }

  window.initAboutPin = initAboutPin;
}());
