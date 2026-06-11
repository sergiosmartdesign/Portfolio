/**
 * Preloader — letter-by-letter label, electric progress line, glitch % counter
 * No external dependencies.
 * Stack (top → bottom): "[ · L O A D I N G · ]" building one char per step,
 * the electric line growing from center in sync with the count, the % digits.
 */
(function () {
  'use strict';

  // Canonical lives in constants.js — duplicated here intentionally because
  // preloader runs as a classic IIFE before ES module infrastructure loads.
  // If you change the string, update constants.js to match.
  const GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

  // Project palette — the electric progress line rolls one of these per load
  const PALETTE = [
    '#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00',
    '#CA6702', '#BB3E03', '#AE2012', '#9B2226'
  ];

  // Reduced motion: the line still grows (it's progress information) but the
  // turbulence is never re-seeded — calm static line instead of a boiling one.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ── Electric progress line ──────────────────────────────────────────────
     One full-width element scaled from a CENTER origin: scaleX(count/100)
     grows both tips symmetrically — center→left and center→right reach the
     viewport borders together at 100%. Reads the same `count` the digits
     render from, so line and number can never drift apart. scaleX is
     compositor-only: the filter output re-rasterizes on seed changes (~13Hz),
     not on the 38Hz counter ticks. */
  // Two random palette colors per load: one for the center bolt, a different
  // one shared by the two border bolts (deliberately not hopping mid-load —
  // color reads as a state change on progress UI)
  const colorCenter = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  let colorBorders;
  do {
    colorBorders = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  } while (colorBorders === colorCenter);

  // Center bolt — grows center → both borders
  const lineEl = document.createElement('div');
  lineEl.className = 'preloader-line preloader-line--center';
  lineEl.style.setProperty('--line-color', colorCenter);
  overlay.appendChild(lineEl);

  // Border bolts — half-width each, origin at their border, growing inward
  // (border → center). Appended after the center bolt so they paint on top.
  const lineLeftEl = document.createElement('div');
  lineLeftEl.className = 'preloader-line preloader-line--left';
  lineLeftEl.style.setProperty('--line-color', colorBorders);
  overlay.appendChild(lineLeftEl);

  const lineRightEl = document.createElement('div');
  lineRightEl.className = 'preloader-line preloader-line--right';
  lineRightEl.style.setProperty('--line-color', colorBorders);
  overlay.appendChild(lineRightEl);

  const lineEls = [lineEl, lineLeftEl, lineRightEl];

  // Displacement filters — scale 48 throws the 2px filament ±24px, filling the
  // element's 50px corridor (see .preloader-line). The low baseFrequency keeps
  // the tall arcs coherent — fine noise at this amplitude shreds the line into
  // dots. Region percentages are moderate because the bbox is the full 50px
  // corridor, not the 2px filament (extreme regions can fail to render).
  // Two instances so the border bolts arc independently from the center bolt
  // instead of cloning its shape where they overlap.
  overlay.insertAdjacentHTML('beforeend',
    '<svg style="position:absolute;width:0;height:0;" aria-hidden="true"><defs>' +
      '<filter id="preloader-electric" colorInterpolationFilters="sRGB" x="-3%" y="-15%" width="106%" height="130%">' +
        '<feTurbulence id="preloader-electric-turb" type="turbulence" baseFrequency="0.018" numOctaves="2" seed="1" result="noise"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="48" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '<filter id="preloader-electric-2" colorInterpolationFilters="sRGB" x="-3%" y="-15%" width="106%" height="130%">' +
        '<feTurbulence id="preloader-electric-turb-2" type="turbulence" baseFrequency="0.018" numOctaves="2" seed="137" result="noise"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="48" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
    '</defs></svg>');
  const lineTurbs = [
    overlay.querySelector('#preloader-electric-turb'),
    overlay.querySelector('#preloader-electric-turb-2')
  ].filter(Boolean);

  document.body.prepend(overlay);
  document.body.classList.add('preloading');

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

  let tick = 0;

  const counterIv = setInterval(() => {
    const ceiling = loadDone ? 100 : 94;
    if (count < ceiling) {
      count++;
      renderPct(count);
      // All three bolts share the same progress: the center one stretches
      // toward the borders, the border pair stretches toward the center.
      const sx = 'scaleX(' + (count / 100) + ')';
      lineEls.forEach(el => { el.style.transform = sx; });
    }

    // Boil the electric lines at ~13Hz (every 3rd 26ms tick). Each filter gets
    // its own random seed so the two colors arc independently. Runs even while
    // count is capped at 94 waiting for the load event, and stops naturally
    // when this interval clears at 100% — the arcs freeze "locked in", then
    // fade out with the overlay.
    if (!reducedMotion && ++tick % 3 === 0) {
      lineTurbs.forEach(t => t.setAttribute('seed', (Math.random() * 500 | 0) + 1));
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
