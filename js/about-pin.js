/**
 * about-pin.js — #about section sticky pin + Paul Rand quote animation.
 *
 * initAboutPin(smoothScrollTo)
 *   smoothScrollTo is injected by the caller (script.js) so this module
 *   does not need to know about the scroll duration constants defined there.
 *
 * Modes:
 *   AUTO-PLAY — plays on section entry / nav click / reset.
 *               Design h3 glitches → each yellow line slides in with glitch
 *               and a readable pause → ending glitches in → static display.
 *   SCROLL    — user scrolls into the sticky zone during auto-play → abort
 *               auto-play and switch to bidirectional scroll-driven control.
 *   STATIC    — full quote frozen; 5 s inactivity → resetAnimation().
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

    const EXTRA_SCROLL     = 1200;
    const ENDING_THRESHOLD = (numItems + 0.5) / (numItems + 1); // 0.875
    const INACTIVITY_MS    = 5000;
    const STEP_ANIM        = 900;   // ms for one yellow-line slide-in
    const READABLE_PAUSE   = 1000;  // ms hold after glitch settles

    // ── State ──────────────────────────────────────────────────────────────────

    let lastIndex         = -2;   // last snapped item index (-2 = uninitialised)
    let endingShown       = false;
    let endingTimer       = null;
    let staticMode        = false;
    let inactivityTimer   = null;
    let sectionActive     = false;
    let sectionLeaveTimer = null;

    let autoPlayRunning      = false;
    let autoPlayRafId        = null;
    let autoPlayTimer        = null;
    let introStarted         = false; // prevents re-firing after user takes scroll control
    let programmaticScroll   = false; // true while nav-triggered scroll is in flight
    let programmaticScrollTimer = null;

    // ── Shared helpers ─────────────────────────────────────────────────────────

    function measure() {
      const h = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', h + 'px');
      wrapper.style.height = about.offsetHeight + EXTRA_SCROLL + 'px';
    }

    function triggerGlitch(el) {
      el.classList.remove('glitch-active');
      void el.offsetWidth;
      el.classList.add('glitch-active');
    }

    function glitchDuration(el) {
      const chars = el.querySelectorAll('[data-char]');
      if (!chars.length) return 500;
      return 500 + (chars.length - 1) * 0.55 * 200;
    }

    function applyOffset(offset) {
      const ty = -offset * 1.2;
      quoteItems.forEach(li => { li.style.transform = `translateY(${ty}em)`; });
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function pinProgress() {
      return Math.max(0, Math.min(1, (window.scrollY - wrapper.offsetTop) / EXTRA_SCROLL));
    }

    // ── Static mode ────────────────────────────────────────────────────────────

    function onStaticActivity() {
      if (staticMode) startInactivityTimer();
    }

    function startInactivityTimer() {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => { if (staticMode) resetAnimation(); }, INACTIVITY_MS);
    }

    function showStatic() {
      autoPlayRunning          = false;
      staticMode               = true;
      App._scrollPathActive = true;
      if (quoteContainer) quoteContainer.classList.add('static-display');
      if (ending) ending.classList.add('visible');
      startInactivityTimer();
      ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(ev =>
        window.addEventListener(ev, onStaticActivity, { passive: true }));
    }

    // ── Reset ──────────────────────────────────────────────────────────────────

    function abortAutoPlay() {
      autoPlayRunning = false;
      if (autoPlayRafId) { cancelAnimationFrame(autoPlayRafId); autoPlayRafId = null; }
      clearTimeout(autoPlayTimer);
    }

    function resetAnimation() {
      abortAutoPlay();
      clearTimeout(inactivityTimer);
      clearTimeout(sectionLeaveTimer);
      clearTimeout(endingTimer);

      staticMode               = false;
      endingShown              = false;
      lastIndex                = -2;
      introStarted             = false;
      App._scrollPathActive = false;

      if (quoteContainer) quoteContainer.classList.remove('static-display');
      quoteItems.forEach(li => { li.classList.remove('glitch-active'); li.style.transform = ''; });
      if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }

      ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(ev =>
        window.removeEventListener(ev, onStaticActivity));

      if (sectionActive) {
        if (quoteH3) triggerGlitch(quoteH3);
        runIntro(); // nav-scroll will land at pp=0; programmaticScroll guards abort
      }
    }

    // ── Auto-play sequence ─────────────────────────────────────────────────────

    function animateStep(fromOffset, toOffset, onDone) {
      let startTime = null;
      function tick(ts) {
        if (!autoPlayRunning) return;
        if (!startTime) startTime = ts;
        const t = Math.min((ts - startTime) / STEP_ANIM, 1);
        applyOffset(fromOffset + (toOffset - fromOffset) * easeOutCubic(t));
        if (t < 1) {
          autoPlayRafId = requestAnimationFrame(tick);
        } else {
          autoPlayRafId = null;
          onDone();
        }
      }
      autoPlayRafId = requestAnimationFrame(tick);
    }

    function runStep(stepIndex) {
      if (!autoPlayRunning) return;

      if (stepIndex < numItems) {
        animateStep(stepIndex - 1, stepIndex, () => {
          if (!autoPlayRunning) return;
          triggerGlitch(quoteItems[stepIndex]);
          lastIndex = stepIndex;
          const settleMs = glitchDuration(quoteItems[stepIndex]);
          autoPlayTimer = setTimeout(() => {
            if (!autoPlayRunning) return;
            autoPlayTimer = setTimeout(() => runStep(stepIndex + 1), READABLE_PAUSE);
          }, settleMs);
        });

      } else {
        endingShown = true;
        if (ending) {
          ending.classList.add('visible');
          triggerGlitch(ending);
          autoPlayTimer = setTimeout(showStatic, glitchDuration(ending));
        } else {
          showStatic();
        }
      }
    }

    function runIntro() {
      if (autoPlayRunning || staticMode) return;
      introStarted    = true;
      autoPlayRunning = true;
      applyOffset(-1);
      lastIndex = -2;
      if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }

      const h3Ms = quoteH3 ? glitchDuration(quoteH3) : 500;
      autoPlayTimer = setTimeout(() => {
        if (!autoPlayRunning) return;
        runStep(0);
      }, h3Ms + READABLE_PAUSE);
    }

    // ── Scroll handler ─────────────────────────────────────────────────────────

    function onScroll() {
      const pp = pinProgress();
      App._scrollPathActive = pp > 0;

      if (autoPlayRunning) {
        if (pp > 0 && !programmaticScroll) {
          abortAutoPlay();
          // fall through to scroll-driven
        } else {
          return;
        }
      }

      if (staticMode) {
        if (pp < ENDING_THRESHOLD) {
          staticMode  = false;
          endingShown = false;
          if (quoteContainer) quoteContainer.classList.remove('static-display');
          if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
          clearTimeout(inactivityTimer);
          ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(ev =>
            window.removeEventListener(ev, onStaticActivity));
          // fall through to scroll-driven
        } else {
          return;
        }
      }

      if (pp === 0) {
        applyOffset(-1);
        lastIndex = -2;
        return;
      }

      const rawOffset     = pp * (numItems + 1) - 1;
      const clampedOffset = Math.max(-1, Math.min(numItems - 1, rawOffset));
      const currentIndex  = Math.round(clampedOffset);

      applyOffset(clampedOffset);

      if (currentIndex !== lastIndex && currentIndex >= 0 && currentIndex < numItems) {
        triggerGlitch(quoteItems[currentIndex]);
      }
      lastIndex = currentIndex;

      if (pp >= ENDING_THRESHOLD && !endingShown) {
        endingShown = true;
        if (ending) {
          ending.classList.add('visible');
          triggerGlitch(ending);
          endingTimer = setTimeout(showStatic, glitchDuration(ending));
        } else {
          showStatic();
        }
      } else if (pp < ENDING_THRESHOLD && endingShown) {
        clearTimeout(endingTimer);
        endingShown = false;
        if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
      }
    }

    // ── Section observer ───────────────────────────────────────────────────────

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        sectionActive = entry.isIntersecting;

        if (!sectionActive) {
          clearTimeout(inactivityTimer);
          clearTimeout(sectionLeaveTimer);
          if (autoPlayRunning) abortAutoPlay();
          sectionLeaveTimer = setTimeout(resetAnimation, 5000);
        } else {
          clearTimeout(sectionLeaveTimer);
          if (quoteH3) triggerGlitch(quoteH3);
          if (!introStarted) runIntro();
        }
      });
    }, { threshold: 0.05 });

    // ── Nav button / bfcache ───────────────────────────────────────────────────

    const aboutNavBtn = document.querySelector('a[href="#about"].nav-btn');
    if (aboutNavBtn) {
      aboutNavBtn.addEventListener('click', (e) => {
        e.preventDefault();

        programmaticScroll = true;
        clearTimeout(programmaticScrollTimer);
        // NAV_SCROLL_DURATION is 1600 ms; add buffer for observer + first RAF tick.
        programmaticScrollTimer = setTimeout(() => { programmaticScroll = false; }, 2200);

        clearTimeout(sectionLeaveTimer);
        resetAnimation();

        const targetY = Math.max(0, wrapper.offsetTop - header.offsetHeight);
        smoothScrollTo(targetY);
      });
    }

    window.addEventListener('pageshow', (e) => {
      if (e.persisted) resetAnimation();
    });

    // ── Init ───────────────────────────────────────────────────────────────────

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    observer.observe(about);
    onScroll();
  }

  window.initAboutPin = initAboutPin;
}());
