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

  /* ── Generic hint controller ────────────────────────────────────────────────
     canShow (optional): extra predicate evaluated at show() time.
     If it returns false the hint is silently skipped and rescheduled.        */
  function makeHintController(hintEl, textEl, canShow) {
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
      // Evaluate canShow() at display time — conditions may have changed since scheduling
      if (canShow && !canShow()) { scheduleShow(); return; }
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

    /* Photo section ─────────────────────────────────────────────────────────
       Shows only when:  phase 3 active  AND  a category is expanded
                         AND  items extend below the visible container area.
       canShow() is evaluated at show() time — never at schedule time.        */
    const photoHintEl   = document.getElementById('photo-scroll-hint');
    const photoTextEl   = photoHintEl && photoHintEl.querySelector('.sc-text');
    const photoScrollEl = document.querySelector('.photo-content-scroll');

    const photoCanShow = () => {
      if (!photoScrollEl) return false;
      const accordion  = document.querySelector('.photo-accordion');
      const isExpanded = accordion && accordion.classList.contains('has-open-category');
      const hasOverflow = photoScrollEl.scrollHeight >
        photoScrollEl.clientHeight + photoScrollEl.scrollTop + 32;
      return isExpanded && hasOverflow;
    };

    const photoCtrl = photoHintEl
      ? makeHintController(photoHintEl, photoTextEl, photoCanShow)
      : null;

    if (photoCtrl) {
      // Phase 3 entry/exit
      document.addEventListener('photoPhase3Active',   () => photoCtrl.setSectionActive(true));
      document.addEventListener('photoPhase3Inactive', () => photoCtrl.setSectionActive(false));

      // Accordion open/close — restart idle timer so hint can appear after category expands
      document.addEventListener('photoAccordionChanged', () => photoCtrl.onActivity());

      // Scrolling inside the photo container counts as activity
      if (photoScrollEl) {
        photoScrollEl.addEventListener('scroll', () => photoCtrl.onActivity(), { passive: true });
      }
    }

    const EVENTS = ['scroll', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'click'];
    EVENTS.forEach(evt => {
      window.addEventListener(evt, () => {
        aboutCtrl && aboutCtrl.onActivity();
        introCtrl && introCtrl.onActivity();
        photoCtrl && photoCtrl.onActivity();
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
      photoCtrl && photoCtrl.reset();
    });
  });
})();
