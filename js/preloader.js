/**
 * Preloader — letter-by-letter label + glitch % counter.
 * No external dependencies.
 * Stack (top → bottom): "[ · L O A D I N G · ]" building one char per step,
 * then the % digits.
 */
(function () {
  'use strict';

  // Canonical lives in constants.js — duplicated here intentionally because
  // preloader runs as a classic IIFE before ES module infrastructure loads.
  // If you change the string, update constants.js to match.
  const GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

  /* ── Build DOM ─────────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'preloader';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'presentation');

  const stage = document.createElement('div');
  stage.className = 'preloader-stage';

  /* ── Stage children: label above the line, % counter below it ──────────── */
  // The electric line runs through the viewport center; the stage is a
  // centered column whose gap straddles the line's 50px corridor.
  const labelEl = document.createElement('div');
  labelEl.className = 'preloader-label';

  const pctEl = document.createElement('div');
  pctEl.className = 'preloader-pct';

  stage.appendChild(labelEl);
  stage.appendChild(pctEl);
  overlay.appendChild(stage);

  document.body.prepend(overlay);
  document.body.classList.add('preloading');

  /* ── Electric scan-lines (decorative) ──────────────────────────────────────
     A few static lines sweep the viewport at random — some up, some down — for
     the life of the preloader. Reuses makeStaticLine (static-line.js), which is
     loaded via a DEFERRED script and therefore not defined yet at this point;
     wait for DOMContentLoaded (deferred scripts have run by then, well before
     100%). Degrades to a no-op if static-line.js is unavailable. (Not gated on
     reduced-motion — the loader's particles + glitch text already animate.) */
  (function initScanLines() {
    const start = () => {
      if (typeof window.makeStaticLine !== 'function') return; // graceful no-op

      const layer = document.createElement('div');
      layer.className = 'preloader-lines';
      layer.setAttribute('aria-hidden', 'true');
      overlay.appendChild(layer);

      const LINE_COUNT = 3;
      const fxList = [];
      let stopped = false;

      for (let i = 0; i < LINE_COUNT; i++) {
        const cv = document.createElement('canvas');
        cv.className = 'preloader-line';
        layer.appendChild(cv);

        const fx = window.makeStaticLine(cv, { shadow: false }); // glow via CSS
        fx.show();                       // start the per-frame static jitter
        fxList.push(fx);

        // One pass: random direction + speed; relaunches itself after a random
        // gap so the field of lines never falls into a fixed rhythm.
        const sweep = () => {
          if (stopped) return;
          const dir = Math.random() < 0.5 ? 'plLineUp' : 'plLineDown';
          const dur = 900 + Math.random() * 1400;   // 0.9–2.3s per pass
          cv.style.animation = 'none';
          void cv.offsetWidth;                       // reflow → replay
          cv.style.animation = `${dir} ${dur}ms linear forwards`;
        };
        cv.addEventListener('animationend', () => {
          if (stopped) return;
          setTimeout(sweep, 200 + Math.random() * 900);   // random gap
        });
        setTimeout(sweep, Math.random() * 1200);     // staggered first launch
      }

      // Stop scheduling + cancel the jitter rAFs the moment the loader exits,
      // so nothing keeps running once the overlay is removed.
      window.addEventListener('preloaderExiting', () => {
        stopped = true;
        fxList.forEach(fx => fx.hide());
      }, { once: true });
    };

    if (typeof window.makeStaticLine === 'function') start();
    else window.addEventListener('DOMContentLoaded', start, { once: true });
  }());

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  function makeGlitchSpan(char, charIndex) {
    const span = document.createElement('span');
    span.setAttribute('data-char', char);
    // --char-0 is the real character so it shows after animation settles
    span.style.setProperty('--char-0', '"' + char + '"');
    for (let g = 1; g < 10; g++) {
      const rc = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      span.style.setProperty('--char-' + g, '"' + rc + '"');
    }
    // Small stagger keeps the left→right glitch cascade but lets digits
    // settle quickly between counter ticks (0.08s/char never resolved).
    span.style.setProperty('--pl-delay', (charIndex * 0.03) + 's');
    return span;
  }

  // Build full token list for "[ · X Y % · ]" format
  function buildTokens(n) {
    const digits = (n + '%').split('');
    const inner  = [];
    digits.forEach((c, i) => { if (i > 0) inner.push(' '); inner.push(c); });
    return ['[', ' ', '·', ' '].concat(inner).concat([' ', '·', ' ', ']']);
  }

  /* ── Percentage counter ─────────────────────────────────────────────────── */
  let count      = 0;
  let loadDone   = false;
  let pctRefs    = []; // { val, el } for every non-space token in pctEl

  function buildPct(tokens) {
    pctEl.innerHTML = '';
    pctRefs = [];
    tokens.forEach(token => {
      if (token === ' ') {
        pctEl.appendChild(document.createTextNode('\u00a0'));
      } else {
        const span = makeGlitchSpan(token, pctRefs.length);
        pctEl.appendChild(span);
        pctRefs.push({ val: token, el: span });
      }
    });
  }

  function renderPct(n) {
    const tokens   = buildTokens(n);
    const nonSpace = tokens.filter(t => t !== ' ');

    // Full rebuild when digit count changes (1→2→3 digits)
    if (nonSpace.length !== pctRefs.length) {
      buildPct(tokens);
      return;
    }

    // Smart update: only replace spans whose value changed
    nonSpace.forEach((token, i) => {
      if (token === pctRefs[i].val) return;
      const newSpan = makeGlitchSpan(token, i);
      pctRefs[i].el.replaceWith(newSpan);
      pctRefs[i] = { val: token, el: newSpan };
    });
  }

  renderPct(0);

  /* ── Label build: [] → [·] → [··] → [·L·] → … → [ · L O A D I N G · ] ──── */
  // Each step inserts ONE character (letters land between the two dots);
  // only the newcomer plays the glitch animation — already-revealed chars
  // are frozen on their real glyph via .pl-settled.
  const LABEL_STEPS = (() => {
    const letters = 'LOADING'.split('');
    const steps = [[], ['·'], ['·', '·']];
    letters.forEach((_, i) => {
      steps.push(['·'].concat(letters.slice(0, i + 1), ['·']));
    });
    return steps;
  })();

  function renderLabel(stepIdx) {
    const tokens = ['['].concat(LABEL_STEPS[stepIdx], [']']);
    // Token index of this step's newcomer: first the two dots (idx 1, 2),
    // then each letter lands just before the closing dot (idx stepIdx - 1).
    const newIdx = stepIdx <= 2 ? stepIdx : stepIdx - 1;

    labelEl.innerHTML = '';
    tokens.forEach((tok, i) => {
      if (i > 0) labelEl.appendChild(document.createTextNode('\u00a0'));
      const span = makeGlitchSpan(tok, 0);
      // Step 0 glitches both brackets in; afterwards only the newcomer
      if (stepIdx > 0 && i !== newIdx) span.classList.add('pl-settled');
      labelEl.appendChild(span);
    });
  }

  renderLabel(0);
  let labelStep = 0;
  const labelIv = setInterval(() => {
    labelStep++;
    renderLabel(labelStep);
    if (labelStep >= LABEL_STEPS.length - 1) clearInterval(labelIv);
  }, 160);

  const counterIv = setInterval(() => {
    const ceiling = loadDone ? 100 : 94;
    if (count < ceiling) {
      count++;
      renderPct(count);
    }

    if (count >= 100) {
      clearInterval(counterIv);
      setTimeout(() => {
        // Unpause intro + header animations NOW, while the overlay is still fading.
        // animation-fill-mode:backwards means chars immediately show glitch characters
        // during their 0.5s delay — the glitch is visible through the fading overlay.
        document.body.classList.remove('preloading');
        window.dispatchEvent(new CustomEvent('preloaderExiting'));
        overlay.classList.add('exit');
        overlay.addEventListener('transitionend', () => {
          overlay.remove();
          window.dispatchEvent(new CustomEvent('preloaderDone'));
        }, { once: true });
      }, 400);
    }
  }, 26);

  function onLoad() { loadDone = true; }
  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad, { once: true });
  }

}());
