/**
 * art-direction.js — Art Direction section entrance animations.
 *
 * initArtDirectionEntrance(section)
 *   • Scroll-driven letter reveal (clip-path per .art-cell)
 *   • Nav-triggered timed animation (App.playArtEntranceAnimation)
 *   • Background image glitch entrance (.art-bg-image)
 *   • Ad list character scramble (.ad-list / .ad-text-link)
 *
 * Subsystems communicate via CustomEvent('artEntrancePlay') dispatched on
 * the section element — no monkey-patching of App.playArtEntranceAnimation.
 *
 * Depends on: constants.js (window.GLITCH_CHARS)
 */
(function () {
  'use strict';

  // clip-path wipe applied during the nav-triggered letter entrance.
  // 0.28 s sits between --transition-fast (0.2 s) and --transition-base (0.3 s):
  // snappy enough to feel instant, slow enough for the reveal to be legible.
  // ease-out mirrors --easing-ease-out in css/styles.css.
  const CELL_REVEAL_TRANSITION = 'clip-path 0.28s ease-out';

  function initArtDirectionEntrance(section) {
    if (!section) return;

    // ── Letter grid ────────────────────────────────────────────────────────────

    const cells = [...section.querySelectorAll('.art-cell')];
    if (!cells.length) return;

    const TOTAL = cells.length;
    let playing = false;

    // Hide all cells before JS takes over
    cells.forEach(cell => { cell.style.clipPath = 'inset(0 100% 0 0)'; });

    // Stamp each cell's letter onto its glitch child divs so CSS ::after can read it
    cells.forEach(cell => {
      const letter = cell.dataset.letter;
      cell.querySelectorAll('.glitch-r, .glitch-g, .glitch-b').forEach(el => {
        el.dataset.letter = letter;
      });
    });

    // Timed animation — used when nav button is clicked.
    // Dispatches 'artEntrancePlay' so bg / ad-list subsystems react independently.
    App.playArtEntranceAnimation = () => {
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

    // Scroll-driven animation — works in both scroll directions
    const updateEntrance = () => {
      if (playing) return;
      const rect     = section.getBoundingClientRect();
      const vh       = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));

      cells.forEach((cell, i) => {
        const start      = i / TOTAL;
        const end        = (i + 1) / TOTAL;
        const local      = Math.max(0, Math.min(1, (progress - start) / (end - start)));
        cell.style.clipPath = `inset(0 ${((1 - local) * 100).toFixed(2)}% 0 0)`;
      });
    };

    window.addEventListener('scroll', updateEntrance, { passive: true });
    updateEntrance();

    // ── Background image ───────────────────────────────────────────────────────

    const artBgImage = section.querySelector('.art-bg-image');
    if (artBgImage) {
      let bgPlayed = false;

      const triggerBg = () => {
        if (bgPlayed) return;
        bgPlayed = true;
        artBgImage.classList.add('art-bg-animate');
      };

      const resetBg = () => {
        bgPlayed = false;
        artBgImage.classList.remove('art-bg-animate');
      };

      // Scroll: fire as soon as the section starts entering the viewport
      window.addEventListener('scroll', () => {
        if (bgPlayed) return;
        const rect = section.getBoundingClientRect();
        if ((window.innerHeight - rect.top) / window.innerHeight > 0.05) triggerBg();
      }, { passive: true });

      // Nav click: reset then re-trigger on the next frame
      section.addEventListener('artEntrancePlay', () => {
        resetBg();
        requestAnimationFrame(triggerBg);
      });

      // Reset when section leaves viewport so it replays on next visit
      new IntersectionObserver((entries) => {
        entries.forEach(e => { if (!e.isIntersecting) resetBg(); });
      }, { threshold: 0 }).observe(section);
    }

    // ── Ad list scramble ───────────────────────────────────────────────────────

    const adList      = section.querySelector('.ad-list');
    const adListLinks = [...section.querySelectorAll('.ad-text-link')];

    if (adList && adListLinks.length) {
      let adListDone = false;
      const FRAME_MS = 45;

      const scrambleItem = (el, delay) => {
        const finalText = el.getAttribute('data-content');
        const chars     = [...finalText];
        const n         = chars.length;
        const INIT_DELAY = 300;
        const STEP_MS    = 90;
        const resolveAt  = i => INIT_DELAY + i * STEP_MS;
        const maxResolve = resolveAt(n - 1);

        setTimeout(() => {
          let elapsed = 0;
          const tick = () => {
            let out = '';
            for (let i = 0; i < n; i++) {
              out += elapsed >= resolveAt(i)
                ? chars[i]
                : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }
            el.textContent = out;
            elapsed += FRAME_MS;
            if (elapsed <= maxResolve + FRAME_MS) setTimeout(tick, FRAME_MS);
            else el.textContent = finalText;
          };
          tick();
        }, delay);
      };

      const triggerAdList = () => {
        adListDone = true;
        adList.classList.add('ad-list-ready');
        document.body.classList.add('ad-section-live');
        adListLinks.forEach((link, i) => scrambleItem(link, i * 120));
        setTimeout(() => {
          section.classList.add('ad-intro-animate');
          const introHeader = section.querySelector('.iad-header[data-content]');
          const introFooter = section.querySelector('.iad-footer[data-content]');
          if (introHeader) scrambleItem(introHeader, 0);
          if (introFooter) scrambleItem(introFooter, 200);
        }, 2000);
      };

      const resetAdList = () => {
        adListDone = false;
        adList.classList.remove('ad-list-ready');
        document.body.classList.remove('ad-section-live');
        section.classList.remove('ad-intro-animate');
        section.classList.add('ad-intro-active');
        adListLinks.forEach(link => { link.textContent = link.getAttribute('data-content'); });
        ['.iad-header[data-content]', '.iad-footer[data-content]'].forEach(sel => {
          const el = section.querySelector(sel);
          if (el) el.textContent = el.getAttribute('data-content');
        });
      };

      // Nav button — letters play first, then list scrambles after they finish
      const lettersDone = (TOTAL - 1) * 120 + 400;
      section.addEventListener('artEntrancePlay', () => {
        resetAdList();
        setTimeout(triggerAdList, lettersDone);
      });

      // Scroll path — fire once letters are fully revealed (section top at viewport top)
      window.addEventListener('scroll', () => {
        if (adListDone) return;
        const rect = section.getBoundingClientRect();
        if ((window.innerHeight - rect.top) / window.innerHeight >= 1) triggerAdList();
      }, { passive: true });

      // Reset on section exit so the sequence replays on next visit
      new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (!entry.isIntersecting) resetAdList(); });
      }, { threshold: 0 }).observe(section);
    }
  }

  window.initArtDirectionEntrance = initArtDirectionEntrance;
}());
