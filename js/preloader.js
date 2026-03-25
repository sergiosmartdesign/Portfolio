/**
 * Preloader — equalizer bar animation + glitch text overlay
 * No external dependencies.
 */
(function () {
  'use strict';

  const GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split(''); // keep in sync with script.js

  // Palette colors arranged symmetrically: cool teal outside → warm red/maroon centre
  const BAR_COLORS = [
    '#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00',
    '#CA6702', '#BB3E03', '#AE2012', '#9B2226',
    '#AE2012', '#BB3E03', '#CA6702', '#EE9B00', '#E9D8A6', '#94D2BD'
  ];

  // Stagger: 0 s at the centre bar (index 7), ±0.2 s per step toward edges
  const DELAYS = [1.4, 1.2, 1.0, 0.8, 0.6, 0.4, 0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4];

  /* ── Build DOM ─────────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'preloader';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'presentation');

  const stage = document.createElement('div');
  stage.className = 'preloader-stage';

  /* ── Bars ──────────────────────────────────────────────────────────────── */
  const barsEl = document.createElement('div');
  barsEl.className = 'preloader-bars';

  BAR_COLORS.forEach((color, i) => {
    const bar = document.createElement('span');
    bar.style.background = color;
    bar.style.animationDelay = DELAYS[i] + 's';
    barsEl.appendChild(bar);
  });

  /* ── Text overlay ──────────────────────────────────────────────────────── */
  const textEl = document.createElement('div');
  textEl.className = 'preloader-text';

  const labelEl = document.createElement('div');
  labelEl.className = 'preloader-label';

  // Build "[ · l o a d i n g · ]" as individual glitch char spans
  const LABEL = '[ · l o a d i n g · ]';
  LABEL.split('').forEach((char, i) => {
    if (char === ' ') {
      labelEl.appendChild(document.createTextNode('\u00a0'));
      return;
    }
    labelEl.appendChild(makeGlitchSpan(char, i));
  });

  const pctEl = document.createElement('div');
  pctEl.className = 'preloader-pct';

  textEl.appendChild(labelEl);
  textEl.appendChild(pctEl);
  stage.appendChild(barsEl);
  stage.appendChild(textEl);
  overlay.appendChild(stage);

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
    // stagger delay: label chars fan out, pct chars use index 0–2
    span.style.setProperty('--pl-delay', (charIndex * 0.08) + 's');
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
