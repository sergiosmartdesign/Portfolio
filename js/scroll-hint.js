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

  /* ── Generic hint controller ─────────────────────────────────────────────── */
  function makeHintController(hintEl, textEl) {
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

    /* About section — fixed overlay */
    const aboutHintEl = document.getElementById('scroll-hint');
    const aboutTextEl = aboutHintEl && aboutHintEl.querySelector('.sc-text');
    const aboutCtrl   = aboutHintEl ? makeHintController(aboutHintEl, aboutTextEl) : null;

    /* Intro section — inline element */
    const introHintEl = document.querySelector('.intro-scroll-hint');
    const introTextEl = introHintEl && introHintEl.querySelector('.sc-text');
    const introCtrl   = introHintEl ? makeHintController(introHintEl, introTextEl) : null;

    const EVENTS = ['scroll', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'click'];
    EVENTS.forEach(evt => {
      window.addEventListener(evt, () => {
        aboutCtrl && aboutCtrl.onActivity();
        introCtrl && introCtrl.onActivity();
      }, { passive: true });
    });

    /* Observe about section */
    if (aboutCtrl) {
      const about = document.getElementById('about');
      if (about) {
        new IntersectionObserver(entries => {
          entries.forEach(e => aboutCtrl.setSectionActive(e.isIntersecting));
        }, { threshold: 0.05 }).observe(about);
      }
    }

    /* Observe intro section */
    if (introCtrl) {
      const intro = document.getElementById('intro');
      if (intro) {
        new IntersectionObserver(entries => {
          entries.forEach(e => introCtrl.setSectionActive(e.isIntersecting));
        }, { threshold: 0.05 }).observe(intro);
      }
    }

    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      aboutCtrl && aboutCtrl.reset();
      introCtrl && introCtrl.reset();
    });
  });
})();
