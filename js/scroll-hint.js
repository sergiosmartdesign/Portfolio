/**
 * scroll-hint.js — Cyberpunk idle scroll hint for the about section
 *
 * Lifecycle:
 *   INTRO (runs once on first visit to #about):
 *     1. About section starts entering view → wait 1 s.
 *     2. Reveal Paul Rand quote line by line: each line animates in, holds so
 *        it can be read, then the next line animates in, and so on.
 *     3. Once the ending (.ending) appears → wait 3 s → show hint for 3 s → hide.
 *     4. If user scrolls / touches during intro → abort; scroll handler takes over.
 *
 *   REPLAY LOOP (runs indefinitely while about section is active):
 *     After any user activity OR after the animation completes/aborts,
 *     if 1 s passes with no further activity → replay the quote animation from scratch.
 *     This overrides introPlayed so the animation always loops back on idle.
 *
 *   NORMAL LOOP (scroll hint popup, runs indefinitely after intro):
 *     1. First user activity while about section is visible → system is "primed".
 *     2. 3 s idle with section visible → show hint.
 *     3. Hint stays visible for 3 s, then auto-hides.
 *     4. After hiding, 3 s idle → show again. Repeat.
 */

(function () {
  'use strict';

  const IDLE_DELAY        = 3000;  // ms idle before showing scroll hint (normal loop)
  const AUTO_HIDE         = 3000;  // ms hint stays visible
  const INTRO_DELAY       = 1000;  // ms to wait after section enters before animation starts
  const POST_INTRO_WAIT   = 3000;  // ms to wait after ending appears before showing hint
  const STEP_ANIM         = 900;   // ms for each line's slide-in transition
  const STEP_HOLD         = 1600;  // ms to hold each line so it can be read
  const LOAD_GRACE_MS     = 1500;  // ignore browser scroll-restoration scroll events after load
  const QUOTE_REPLAY_DELAY = 1000; // ms of inactivity before replaying the quote animation

  const PAGE_LOAD_TIME  = Date.now();

  let hint             = null;
  let idleTimer        = null;
  let autoHideTimer    = null;
  let quoteReplayTimer = null;
  let isVisible        = false;
  let aboutActive      = false;
  let primed           = false;
  let introPlayed      = false;
  let introRunning     = false;
  let rafId            = null;

  // Quote elements — queried on DOMContentLoaded
  let quoteItems = [];
  let ending     = null;
  let scrollText = null;

  // Typewriter frames for [ · s c r o l l · ]
  const SCROLL_FRAMES = [
    '[ ]',
    '[ · · ]',
    '[ · s · ]',
    '[ · s c · ]',
    '[ · s c r · ]',
    '[ · s c r o · ]',
    '[ · s c r o l · ]',
    '[ · s c r o l l · ]',
  ];
  const FRAME_INTERVAL = 110; // ms between each frame
  let typewriterTimer  = null;

  // ── Typewriter ──────────────────────────────────────────────────────────────

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

  // ── Visibility ──────────────────────────────────────────────────────────────

  function show() {
    if (isVisible || !aboutActive) return;
    isVisible = true;
    hint.removeAttribute('aria-hidden');
    hint.classList.add('visible');
    typewriter();

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
    clearTimeout(typewriterTimer);
    hint.setAttribute('aria-hidden', 'true');
    hint.classList.remove('visible');
  }

  // ── Idle timers ─────────────────────────────────────────────────────────────

  function scheduleShow() {
    clearTimeout(idleTimer);
    if (aboutActive && primed) {
      idleTimer = setTimeout(show, IDLE_DELAY);
    }
  }

  // After QUOTE_REPLAY_DELAY ms of inactivity, replay the quote animation
  function scheduleQuoteReplay() {
    clearTimeout(quoteReplayTimer);
    if (aboutActive) {
      quoteReplayTimer = setTimeout(replayQuote, QUOTE_REPLAY_DELAY);
    }
  }

  // Reset and re-run the quote animation regardless of introPlayed state
  function replayQuote() {
    if (!aboutActive || introRunning) return;
    introPlayed = false;
    if (ending) ending.classList.remove('visible');
    runIntro();
  }

  function onActivity(evt) {
    if (isVisible) return;

    // During intro: scroll / touch means user is taking over — abort cleanly.
    // Exception: ignore scroll events within LOAD_GRACE_MS of page load, which
    // are browser scroll-restoration events, not real user input.
    if (introRunning) {
      if (evt.type === 'scroll' || evt.type === 'touchstart' || evt.type === 'touchmove') {
        if (Date.now() - PAGE_LOAD_TIME < LOAD_GRACE_MS) return;
        abortIntro();
      }
      return;
    }

    if (aboutActive) primed = true;
    scheduleShow();
    scheduleQuoteReplay(); // reset 1s countdown on every user action
  }

  // ── Quote animation helpers ─────────────────────────────────────────────────

  // offset -1  → all items hidden below viewport
  // offset  0  → first item visible
  // offset  1  → second item visible
  // offset  2  → third item visible
  function applyOffset(offset) {
    const ty = -offset * 1.2;
    quoteItems.forEach(li => { li.style.transform = `translateY(${ty}em)`; });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Animate from fromOffset to toOffset over STEP_ANIM ms, then call onDone
  function animateStep(fromOffset, toOffset, onDone) {
    let startTime = null;

    function tick(timestamp) {
      if (!introRunning) return; // aborted mid-step
      if (!startTime) startTime = timestamp;

      const t       = Math.min((timestamp - startTime) / STEP_ANIM, 1);
      const eased   = easeOutCubic(t);
      const current = fromOffset + (toOffset - fromOffset) * eased;

      applyOffset(current);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        applyOffset(toOffset);
        rafId = null;
        onDone();
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  // ── Intro sequence ──────────────────────────────────────────────────────────

  function abortIntro() {
    introRunning = false;
    introPlayed  = true;
    window._quoteIntroActive = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (aboutActive) primed = true;
    scheduleShow();
    scheduleQuoteReplay(); // 1s after abort → replay
  }

  // Reveal one line at a time: animate in → hold → next line → … → ending
  function runStep(stepIndex) {
    if (!introRunning) return;

    const numItems = quoteItems.length;

    if (stepIndex < numItems) {
      // Slide the list so line stepIndex is centred
      const fromOffset = stepIndex - 1;
      const toOffset   = stepIndex;

      animateStep(fromOffset, toOffset, () => {
        // Hold so the user can read this line, then move to next
        setTimeout(() => runStep(stepIndex + 1), STEP_HOLD);
      });

    } else {
      // All lines shown — reveal the ending paragraph
      if (ending) ending.classList.add('visible');
      introRunning = false;
      introPlayed  = true;
      window._quoteIntroActive = false;

      scheduleQuoteReplay(); // 1s after completion → replay

      // Wait then show the scroll hint
      setTimeout(() => {
        if (aboutActive) {
          primed = true;
          show();
        }
      }, POST_INTRO_WAIT);
    }
  }

  function runIntro() {
    if (introPlayed || !quoteItems.length) return;
    introRunning = true;
    window._quoteIntroActive = true;

    // Ensure ending is hidden before the animation starts
    if (ending) ending.classList.remove('visible');

    // Start with all items hidden below (offset -1)
    applyOffset(-1);

    // Wait for the section to settle, then start line by line
    setTimeout(() => {
      if (!introRunning) return;
      runStep(0);
    }, INTRO_DELAY);
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    hint = document.getElementById('scroll-hint');
    if (!hint) return;

    quoteItems = Array.from(document.querySelectorAll('.paul-rands-quote li'));
    ending     = document.querySelector('.paul-rands-quote .ending');
    scrollText = document.querySelector('.sc-text');

    ['scroll', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'click'].forEach(evt => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    const about = document.getElementById('about');
    if (!about) return;

    // Nav button click: reset the intro so it replays from scratch.
    const aboutNavBtn = document.querySelector('a[href="#about"].nav-btn');
    if (aboutNavBtn) {
      aboutNavBtn.addEventListener('click', () => {
        introPlayed  = false;
        introRunning = false;
        window._quoteIntroActive = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        clearTimeout(idleTimer);
        clearTimeout(quoteReplayTimer);
        if (ending) ending.classList.remove('visible');
        quoteItems.forEach(li => { li.style.transform = ''; });
        // If section is already active (no IntersectionObserver re-fire coming), start now
        if (aboutActive) setTimeout(runIntro, 50);
      });
    }

    // bfcache: browser restores page from memory on reload/back-nav — reset intro
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        introPlayed  = false;
        introRunning = false;
        window._quoteIntroActive = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        clearTimeout(quoteReplayTimer);
        if (ending) ending.classList.remove('visible');
        quoteItems.forEach(li => { li.style.transform = ''; });
        if (aboutActive) runIntro();
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        aboutActive = entry.isIntersecting;

        if (!aboutActive) {
          hide();
          clearTimeout(idleTimer);
          clearTimeout(quoteReplayTimer);
          if (introRunning) abortIntro();
          primed       = false;
          introPlayed  = false;
          // Reset quote to hidden state so intro plays fresh on next visit
          if (ending) ending.classList.remove('visible');
          quoteItems.forEach(li => { li.style.transform = ''; });
        } else if (!introPlayed) {
          runIntro();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(about);
  });
})();
