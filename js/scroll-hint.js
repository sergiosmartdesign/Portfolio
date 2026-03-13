/**
 * scroll-hint.js — Cyberpunk idle scroll hint for the about section
 *
 * Lifecycle:
 *   1. About section enters view for the first time → do nothing (no timer).
 *   2. User makes any activity while about section is visible → system is "primed".
 *   3. If 5 s pass with no activity (and section is still visible) → show hint.
 *   4. Hint stays visible for 3 s, then auto-hides.
 *   5. After hiding, wait another 5 s idle → show again. Repeat indefinitely.
 */

(function () {
  'use strict';

  const IDLE_DELAY = 5000; // ms idle before showing
  const AUTO_HIDE  = 3000; // ms the hint stays visible before auto-hiding

  let hint          = null;
  let idleTimer     = null;
  let autoHideTimer = null;
  let isVisible     = false;
  let aboutActive   = false;
  let primed        = false; // true only after first user activity in about section

  // ── Visibility ─────────────────────────────────────────────────────────────

  function show() {
    if (isVisible || !aboutActive) return;
    isVisible = true;
    hint.removeAttribute('aria-hidden');
    hint.classList.add('visible');

    // Auto-hide after AUTO_HIDE ms, then restart the idle countdown
    clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      hide();
      scheduleShow();
    }, AUTO_HIDE);
  }

  function hide() {
    if (!isVisible) return;
    isVisible = false;
    clearTimeout(autoHideTimer);
    hint.setAttribute('aria-hidden', 'true');
    hint.classList.remove('visible');
  }

  // ── Idle timer ─────────────────────────────────────────────────────────────

  function scheduleShow() {
    clearTimeout(idleTimer);
    if (aboutActive && primed) {
      idleTimer = setTimeout(show, IDLE_DELAY);
    }
  }

  function onActivity() {
    // While hint is showing, let it complete its AUTO_HIDE cycle — ignore activity
    if (isVisible) return;

    // First activity in the about section primes the system
    if (aboutActive) primed = true;

    scheduleShow();
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    hint = document.getElementById('scroll-hint');
    if (!hint) return;

    ['scroll', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'click'].forEach(evt => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    const about = document.getElementById('about');
    if (!about) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          aboutActive = entry.isIntersecting;

          if (!aboutActive) {
            // Left the section — clean up everything, reset primed
            hide();
            clearTimeout(idleTimer);
            primed = false;
          }
          // Entering the section does NOT start the timer — wait for user activity
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(about);
  });
})();
