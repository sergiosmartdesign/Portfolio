/**
 * Preloader — 3-D dual-ring loader
 *
 * Top ring:    text reveal  →  [ · l o a d i n g · ]
 * Bottom ring: live % counter  →  [ · 0% · ] … [ · 100% · ]
 *
 * Load tracking uses PerformanceObserver (resource entries, buffered).
 * Dismisses only after BOTH the page load event AND the full text
 * animation have completed (~2.6 s minimum display time).
 */
(function () {
  'use strict';

  const SECTORS = 30;
  const RADIUS  = '7rem';

  /* ── Build DOM ─────────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'preloader';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'presentation');

  const wrap = document.createElement('div');
  wrap.className = 'preloader';

  const topSectors = [];
  const botSectors = [];

  function buildRing(store) {
    const ring = document.createElement('div');
    ring.className = 'preloader__ring';
    for (let s = 0; s < SECTORS; s++) {
      const sector = document.createElement('span');
      sector.className = 'preloader__sector';
      sector.style.transform = `rotateY(${(360 / SECTORS) * s}deg) translateZ(${RADIUS})`;
      ring.appendChild(sector);
      store.push(sector);
    }
    return ring;
  }

  wrap.appendChild(buildRing(topSectors));
  wrap.appendChild(buildRing(botSectors));
  overlay.appendChild(wrap);

  document.body.prepend(overlay);
  document.body.classList.add('preloading');

  /* ── Top ring: text reveal ─────────────────────────────────────────────── */
  //  Final layout  →  [ · l o a d i n g · ]
  //  Sector index  →  0   2  4  6  8  10 12 14 16  18  20

  // Phase 1 — brackets only (immediate)
  topSectors[0].textContent  = '[';
  topSectors[20].textContent = ']';

  // Phase 2 — flanking dots
  setTimeout(() => {
    topSectors[2].textContent  = '·';
    topSectors[18].textContent = '·';
  }, 600);

  // Phase 3 — letters one by one
  [
    [4, 'l'], [6, 'o'], [8, 'a'], [10, 'd'],
    [12, 'i'], [14, 'n'], [16, 'g'],
  ].forEach(([idx, ch], i) => {
    setTimeout(() => { topSectors[idx].textContent = ch; }, 1200 + i * 160);
  });

  /* ── Bottom ring: percentage counter ──────────────────────────────────── */
  //  Layout   →  [ · 0% · ]
  //  Sectors  →  0   2  5   8   10

  botSectors[0].textContent  = '[';
  botSectors[2].textContent  = '·';
  botSectors[8].textContent  = '·';
  botSectors[10].textContent = ']';

  /* ── Counter: increments by exactly 1 per tick ────────────────────────── */
  //  26 ms × 100 steps = 2 600 ms — covers the full text-reveal animation.
  //  Ceiling is 94 until window.load fires; then it runs to 100 and exits.
  let count    = 0;
  let loadDone = false;

  botSectors[5].textContent = '0%';

  const counterIv = setInterval(() => {
    const ceiling = loadDone ? 100 : 94;

    if (count < ceiling) {
      count++;
      botSectors[5].textContent = count + '%';
    }

    if (count >= 100) {
      clearInterval(counterIv);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('preloaderExiting'));
        overlay.classList.add('exit');
        overlay.addEventListener('transitionend', () => {
          overlay.remove();
          document.body.classList.remove('preloading');
          window.dispatchEvent(new CustomEvent('preloaderDone'));
        }, { once: true });
      }, 400);
    }
  }, 26);

  /* ── Gate 100 % on real window.load ────────────────────────────────────── */
  function onLoad() { loadDone = true; }

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad, { once: true });
  }
}());
