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

  const IDLE_DELAY          = 3000;  // ms idle before showing scroll hint (normal loop)
  const AUTO_HIDE           = 3000;  // ms hint stays visible
  const STEP_ANIM           = 900;   // ms for each line's slide-in transition
  const READABLE_PAUSE      = 1000;  // ms of clean readable time after each glitch resolves
  const LOAD_GRACE_MS       = 1500;  // ignore browser scroll-restoration scroll events after load
  const QUOTE_REPLAY_DELAY  = 1000;  // ms of inactivity before replaying (activity-triggered)
  const POST_COMPLETE_DELAY = 5000;  // ms freeze after ending glitch resolves before auto-replay

  const PAGE_LOAD_TIME  = Date.now();

  let hint              = null;
  let idleTimer         = null;
  let autoHideTimer     = null;
  let quoteReplayTimer  = null;
  let postCompleteTimer = null;
  let sectionLeaveTimer = null;
  let isVisible         = false;
  let aboutActive      = false;
  let primed           = false;
  let introPlayed      = false;
  let introRunning     = false;
  let rafId            = null;

  // Quote elements — queried on DOMContentLoaded
  let quoteItems = [];
  let ending     = null;
  let quoteH3    = null;
  let scrollText = null;

  function triggerGlitch(el) {
    el.classList.remove('glitch-active');
    void el.offsetWidth;
    el.classList.add('glitch-active');
  }

  // Returns how long (ms) the glitch animation takes to fully resolve for el.
  // Formula: 500ms delay + (lastCharIndex × 0.55 iterations × 200ms per iteration)
  function glitchDuration(el) {
    const chars = el.querySelectorAll('[data-char]');
    if (!chars.length) return 500;
    return 500 + (chars.length - 1) * 0.55 * 200;
  }

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

  // After QUOTE_REPLAY_DELAY ms of inactivity, replay the quote animation.
  // Does not schedule if the scroll path is actively driving the items.
  function scheduleQuoteReplay() {
    clearTimeout(quoteReplayTimer);
    clearTimeout(postCompleteTimer);
    if (aboutActive && !window._scrollPathActive) {
      quoteReplayTimer = setTimeout(replayQuote, QUOTE_REPLAY_DELAY);
    }
  }

  // Reset and re-run the quote animation regardless of introPlayed state
  function replayQuote() {
    if (!aboutActive || introRunning || window._scrollPathActive) return;
    clearTimeout(postCompleteTimer);
    clearTimeout(sectionLeaveTimer);
    introPlayed = false;
    quoteItems.forEach(li => li.classList.remove('glitch-active'));
    if (ending) {
      ending.classList.remove('visible');
      ending.classList.remove('glitch-active');
    }
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
      // Scroll path took over — stop immediately without scheduling a replay
      if (window._scrollPathActive) {
        introRunning = false;
        window._quoteIntroActive = false;
        rafId = null;
        return;
      }
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
    clearTimeout(postCompleteTimer);
    clearTimeout(sectionLeaveTimer);
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (aboutActive) primed = true;
    scheduleShow();
    scheduleQuoteReplay(); // 1s after abort → replay
  }

  // Reveal one line at a time: slide in → glitch → wait for resolve → readable pause → next
  function runStep(stepIndex) {
    if (!introRunning) return;

    const numItems = quoteItems.length;

    if (stepIndex < numItems) {
      const fromOffset = stepIndex - 1;
      const toOffset   = stepIndex;

      animateStep(fromOffset, toOffset, () => {
        triggerGlitch(quoteItems[stepIndex]);
        // Wait for this line's glitch to fully resolve, then hold for reading
        const settleMs = glitchDuration(quoteItems[stepIndex]);
        setTimeout(() => {
          if (!introRunning) return;
          setTimeout(() => runStep(stepIndex + 1), READABLE_PAUSE);
        }, settleMs);
      });

    } else {
      // All yellow lines shown and frozen — reveal the ending paragraph
      if (ending) {
        ending.classList.add('visible');
        triggerGlitch(ending);
      }
      introRunning = false;
      introPlayed  = true;
      window._quoteIntroActive = false;

      // Wait for ending glitch to resolve, then hold POST_COMPLETE_DELAY before replay
      const endingMs = ending ? glitchDuration(ending) : 0;
      clearTimeout(postCompleteTimer);
      postCompleteTimer = setTimeout(() => {
        if (aboutActive) replayQuote();
      }, endingMs + POST_COMPLETE_DELAY);

      // Show scroll hint shortly after ending glitch resolves
      setTimeout(() => {
        if (aboutActive) { primed = true; show(); }
      }, endingMs + 1000);
    }
  }

  function runIntro() {
    if (introPlayed || !quoteItems.length) return;
    introRunning = true;
    window._quoteIntroActive = true;

    if (ending) ending.classList.remove('visible');
    if (quoteH3) triggerGlitch(quoteH3);

    applyOffset(-1);

    // Wait for "Design" glitch to fully resolve, then hold READABLE_PAUSE before first yellow line
    const h3Ms = quoteH3 ? glitchDuration(quoteH3) : 500;
    setTimeout(() => {
      if (!introRunning) return;
      runStep(0);
    }, h3Ms + READABLE_PAUSE);
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    hint = document.getElementById('scroll-hint');
    if (!hint) return;

    quoteItems = Array.from(document.querySelectorAll('.paul-rands-quote li'));
    ending     = document.querySelector('.paul-rands-quote .ending');
    quoteH3    = document.querySelector('.paul-rands-quote h3');
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
        if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
        quoteItems.forEach(li => { li.style.transform = ''; li.classList.remove('glitch-active'); });
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
        if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
        quoteItems.forEach(li => { li.style.transform = ''; li.classList.remove('glitch-active'); });
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
          clearTimeout(postCompleteTimer);
          if (introRunning) abortIntro();
          primed = false;

          // 5s grace: if user returns within 5s, keep frozen state.
          // After 5s away, reset so animation replays fresh on next entry.
          clearTimeout(sectionLeaveTimer);
          sectionLeaveTimer = setTimeout(() => {
            introPlayed = false;
            if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
            quoteItems.forEach(li => { li.style.transform = ''; li.classList.remove('glitch-active'); });
          }, 5000);

        } else {
          clearTimeout(sectionLeaveTimer); // user returned — cancel the reset
          if (!introPlayed) runIntro();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(about);
  });
})();
