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

  let hint            = null;
  let scrollText      = null;
  let idleTimer       = null;
  let autoHideTimer   = null;
  let typewriterTimer = null;
  let isVisible       = false;
  let aboutActive     = false;
  let primed          = false;

  const SCROLL_FRAMES = [
    '[ ]', '[ · · ]', '[ · s · ]', '[ · s c · ]',
    '[ · s c r · ]', '[ · s c r o · ]', '[ · s c r o l · ]', '[ · s c r o l l · ]',
  ];

  function typewriter() {
    if (!scrollText) return;
    clearTimeout(typewriterTimer);
    let frame = 0;
    scrollText.textContent = SCROLL_FRAMES[0];
    function next() {
      frame++;
      if (frame < SCROLL_FRAMES.length) {
        scrollText.textContent = SCROLL_FRAMES[frame];
        typewriterTimer = setTimeout(next, FRAME_INTERVAL);
      }
    }
    typewriterTimer = setTimeout(next, FRAME_INTERVAL);
  }

  function show() {
    if (isVisible || !aboutActive) return;
    isVisible = true;
    hint.removeAttribute('aria-hidden');
    hint.classList.add('visible');
    typewriter();
    clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => { hide(); scheduleShow(); }, AUTO_HIDE);
  }

  function hide() {
    if (!isVisible) return;
    isVisible = false;
    clearTimeout(autoHideTimer);
    clearTimeout(typewriterTimer);
    hint.setAttribute('aria-hidden', 'true');
    hint.classList.remove('visible');
  }

  function scheduleShow() {
    clearTimeout(idleTimer);
    if (aboutActive && primed) idleTimer = setTimeout(show, IDLE_DELAY);
  }

  function onActivity() {
    if (isVisible) return;
    if (aboutActive) primed = true;
    scheduleShow();
  }

  document.addEventListener('DOMContentLoaded', () => {
    hint = document.getElementById('scroll-hint');
    if (!hint) return;

    scrollText = document.querySelector('.sc-text');

    ['scroll', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'click'].forEach(evt => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    const about = document.getElementById('about');
    if (!about) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        aboutActive = entry.isIntersecting;
        if (!aboutActive) {
          hide();
          clearTimeout(idleTimer);
          primed = false;
        }
      });
    }, { threshold: 0.05 });

    observer.observe(about);

    window.addEventListener('pageshow', (e) => {
      if (e.persisted) { hide(); primed = false; }
    });
  });
})();
