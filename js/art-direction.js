/**
 * art-direction.js — Art Direction section entrance + ambient controller.
 *
 * initArtDirectionEntrance(section)
 *   • Scroll-driven letter reveal (clip-path per .art-cell)
 *   • Nav-triggered timed animation (App.playArtEntranceAnimation)
 *   • Background image glitch entrance (.art-bg-image)
 *   • Discipline nav decode (.ad-explore-card .adnav-label) + the
 *     body.ad-section-live gate that drives the skills bar, intro frame
 *     and nav-card entrances
 *   • Viewport gate: pauses ambient CSS animations (letter blink, scanlines,
 *     VHS static) while the section is off-screen
 *
 * Performance: all three scroll-driven behaviours share ONE passive scroll
 * listener, rAF-throttled, reading getBoundingClientRect() once per frame —
 * no per-event forced layout. Subsystems coordinate via the section-scoped
 * CustomEvent('artEntrancePlay') rather than monkey-patching.
 *
 * Accessibility: honors prefers-reduced-motion — letter reveal / bg jump to
 * their end state and text decodes resolve instantly (window.scrambleText).
 *
 * Depends on: lib/scramble.js (window.scrambleText), app-registry.js (App).
 */
(function () {
  'use strict';

  // clip-path wipe applied during the nav-triggered letter entrance.
  // 0.28 s sits between --transition-fast (0.2 s) and --transition-base (0.3 s):
  // snappy enough to feel instant, slow enough for the reveal to be legible.
  const CELL_REVEAL_TRANSITION = 'clip-path 0.28s ease-out';

  // Nav-card decode cadence (matches the previous bespoke scramble loop).
  const NAV_SCRAMBLE = { frameMs: 45, initialDelay: 300, stepMs: 90 };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function initArtDirectionEntrance(section) {
    if (!section) return;

    const cells = [...section.querySelectorAll('.art-cell')];
    if (!cells.length) return;

    const TOTAL = cells.length;
    let playing = false;

    // ── Letter grid ────────────────────────────────────────────────────────────

    // Hide all cells before JS takes over.
    cells.forEach(cell => { cell.style.clipPath = 'inset(0 100% 0 0)'; });

    // Stamp each cell's letter onto its glitch children so CSS ::after can read it.
    cells.forEach(cell => {
      const letter = cell.dataset.letter;
      cell.querySelectorAll('.glitch-r, .glitch-g, .glitch-b').forEach(el => {
        el.dataset.letter = letter;
      });
    });

    const revealAll = () => {
      cells.forEach(c => { c.style.transition = ''; c.style.clipPath = 'inset(0 0% 0 0)'; });
    };

    // Timed animation — used when the nav button is clicked. Dispatches
    // 'artEntrancePlay' so the bg / nav subsystems react independently.
    App.playArtEntranceAnimation = () => {
      if (reducedMotion.matches) {
        revealAll();
        section.dispatchEvent(new CustomEvent('artEntrancePlay', { bubbles: false }));
        return;
      }
      playing = true;
      cells.forEach(cell => {
        cell.style.transition = CELL_REVEAL_TRANSITION;
        cell.style.clipPath   = 'inset(0 100% 0 0)';
      });
      section.dispatchEvent(new CustomEvent('artEntrancePlay', { bubbles: false }));
      cells.forEach((cell, i) => {
        setTimeout(() => {
          cell.style.clipPath = 'inset(0 0% 0 0)';
          if (i === TOTAL - 1) {
            setTimeout(() => {
              cells.forEach(c => { c.style.transition = ''; });
              playing = false;
            }, 320);
          }
        }, i * 120);
      });
    };

    const updateLetters = (rect, vh) => {
      if (playing) return;
      if (reducedMotion.matches) { revealAll(); return; }
      const progress = clamp01((vh - rect.top) / vh);
      cells.forEach((cell, i) => {
        const start = i / TOTAL;
        const end   = (i + 1) / TOTAL;
        const local = clamp01((progress - start) / (end - start));
        cell.style.clipPath = `inset(0 ${((1 - local) * 100).toFixed(2)}% 0 0)`;
      });
    };

    // ── Background image ───────────────────────────────────────────────────────

    const artBgImage = section.querySelector('.art-bg-image');
    let bgPlayed = false;

    const triggerBg = () => {
      if (bgPlayed || !artBgImage) return;
      bgPlayed = true;
      if (reducedMotion.matches) {
        // Skip the glitch entrance — reveal the final state directly.
        artBgImage.style.opacity   = '1';
        artBgImage.style.clipPath  = 'none';
        artBgImage.style.transform = 'none';
      } else {
        artBgImage.classList.add('art-bg-animate');
      }
    };

    const resetBg = () => {
      if (!artBgImage) return;
      bgPlayed = false;
      artBgImage.classList.remove('art-bg-animate');
      artBgImage.style.opacity   = '';
      artBgImage.style.clipPath  = '';
      artBgImage.style.transform = '';
    };

    const updateBg = (rect, vh) => {
      if (bgPlayed) return;
      if ((vh - rect.top) / vh > 0.05) triggerBg();
    };

    // ── Discipline nav decode + ad-section-live gate ─────────────────────────────
    // The nav card (.ad-explore-card inline SVG) is the section navigation. This
    // block owns the body.ad-section-live gate that drives the skills bar, intro
    // frame and nav-card entrances — if the card is removed, that gate must move.

    const navCard   = section.querySelector('.ad-explore-card');
    const navLabels = [...section.querySelectorAll('.ad-explore-card .adnav-label[data-content]')];
    const hasNav    = navCard && navLabels.length;
    let sectionLive = false;

    const triggerSectionLive = () => {
      if (sectionLive) return;
      sectionLive = true;
      document.body.classList.add('ad-section-live');
      navLabels.forEach((label, i) =>
        window.scrambleText(label, { ...NAV_SCRAMBLE, startDelay: i * 120 }));
      setTimeout(() => {
        section.classList.add('ad-intro-animate');
        window.scrambleText(section.querySelector('.iad-header[data-content]'), NAV_SCRAMBLE);
        window.scrambleText(section.querySelector('.iad-footer[data-content]'),
          { ...NAV_SCRAMBLE, startDelay: 200 });
      }, 2000);
    };

    const resetSectionLive = () => {
      if (!hasNav) return;
      sectionLive = false;
      document.body.classList.remove('ad-section-live');
      section.classList.remove('ad-intro-animate');
      section.classList.add('ad-intro-active');
      navLabels.forEach(label => { label.textContent = label.getAttribute('data-content'); });
      ['.iad-header[data-content]', '.iad-footer[data-content]'].forEach(sel => {
        const el = section.querySelector(sel);
        if (el) el.textContent = el.getAttribute('data-content');
      });
    };

    // Nav button — letters play first, then the nav card decodes after they finish.
    const lettersDone = (TOTAL - 1) * 120 + 400;
    section.addEventListener('artEntrancePlay', () => {
      resetBg();
      requestAnimationFrame(triggerBg);
      if (hasNav) {
        resetSectionLive();
        setTimeout(triggerSectionLive, lettersDone);
      }
    });

    // ── Single rAF-throttled scroll loop ─────────────────────────────────────────
    // One rect read per frame, fanned out to every scroll-driven behaviour.

    let ticking = false;

    const onFrame = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const vh   = window.innerHeight;
      updateLetters(rect, vh);
      updateBg(rect, vh);
      // Section is fully in view (top reached the viewport top) → go live.
      if (hasNav && !sectionLive && (vh - rect.top) / vh >= 1) triggerSectionLive();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onFrame);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onFrame(); // initial paint

    // ── Observers ────────────────────────────────────────────────────────────────

    // Reset entrance state when the section fully leaves the viewport so it
    // replays on the next visit.
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) { resetBg(); resetSectionLive(); }
      });
    }, { threshold: 0 }).observe(section);

    // Viewport gate — pause ambient CSS animations (letter blink, scanlines, VHS
    // static) while the section is off-screen. Activates #art-direction
    // .paused-animations in css/styles.css. rootMargin warms up just before entry.
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        section.classList.toggle('paused-animations', !e.isIntersecting);
      });
    }, { rootMargin: '200px 0px' }).observe(section);
  }

  window.initArtDirectionEntrance = initArtDirectionEntrance;
}());
