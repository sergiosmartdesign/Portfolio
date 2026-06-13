/**
 * scramble.js — shared text-scramble (decode) animation.
 *
 * window.scrambleText(el, options, onDone)
 *   Cycles each character of `el` through random glyphs, resolving them
 *   left-to-right to the final text. Used by the Art Direction section
 *   (nav card labels, intro header/footer, discipline name, row titles).
 *
 * Options (all optional):
 *   chars        glyph pool — string or array. Default: window.GLITCH_CHARS.
 *   frameMs      tick interval in ms (also default stepMs). Default 40.
 *   startDelay   ms to wait before the scramble begins. Default 0.
 *   initialDelay ms before the FIRST character resolves. Default 0.
 *   stepMs       ms between each character resolving. Default = frameMs.
 *   target       explicit final text; else data-content attr, else textContent.
 *
 * Honors prefers-reduced-motion: resolves instantly to the final text.
 *
 * Depends on: constants.js (window.GLITCH_CHARS) — optional, has a fallback.
 */
(function () {
  'use strict';

  const FALLBACK_CHARS = '!<>-_\\/[]{}—=+*^?#'.split('');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrambleText(el, options = {}, onDone) {
    const done = typeof onDone === 'function' ? onDone : () => {};
    if (!el) { done(); return; }

    const {
      chars = window.GLITCH_CHARS || FALLBACK_CHARS,
      frameMs = 40,
      startDelay = 0,
      initialDelay = 0,
      target,
    } = options;
    const stepMs = options.stepMs ?? frameMs;

    const finalText = target != null
      ? target
      : (el.getAttribute('data-content') || el.textContent || '');
    const glyphs = [...finalText];
    const n = glyphs.length;

    // Reduced motion (or empty string): resolve instantly, no animation.
    if (reducedMotion.matches || n === 0) {
      el.textContent = finalText;
      done();
      return;
    }

    const pool = Array.isArray(chars) ? chars : [...chars];
    const resolveAt = i => initialDelay + i * stepMs;
    const maxResolve = resolveAt(n - 1);

    const run = () => {
      let elapsed = 0;
      const tick = () => {
        let out = '';
        for (let i = 0; i < n; i++) {
          out += elapsed >= resolveAt(i)
            ? glyphs[i]
            : pool[(Math.random() * pool.length) | 0];
        }
        el.textContent = out;
        elapsed += frameMs;
        if (elapsed <= maxResolve + frameMs) {
          setTimeout(tick, frameMs);
        } else {
          el.textContent = finalText;
          done();
        }
      };
      tick();
    };

    if (startDelay > 0) setTimeout(run, startDelay);
    else run();
  }

  window.scrambleText = scrambleText;
}());
