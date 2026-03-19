/**
 * Preloader — 3-D dual-ring loader
 *
 * Top ring:    text reveal  →  [ · l o a d i n g · ]  (sectors 0–10)
 * Bottom ring: live % counter  →  [ · 0% · ]  (sectors 0–4)
 *
 * Characters live on consecutive sectors so the text appears naturally
 * as each sector rotates to face the viewer — no flat overlay needed.
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
  document.body.classList.add('preloader-visible');

  /* ── Top ring: text reveal ─────────────────────────────────────────────── */
  //  Final layout  →  [ · l o a d i n g · ]
  //  11 chars centered at sector 0 (front): start offset = 30 - 5 = 25
  //  Sector index  → 25 26  27 28 29  0  1  2  3   4   5

  // Phase 1 — brackets only (immediate)
  topSectors[25].textContent = '[';
  topSectors[5].textContent  = ']';

  // Phase 2 — flanking dots
  setTimeout(() => {
    topSectors[26].textContent = '·';
    topSectors[4].textContent  = '·';
  }, 600);

  // Phase 3 — letters one by one (l o a d · d i n g), center 'd' at sector 0
  [
    [29, 'a'], [28, 'o'], [27, 'l'],   // left side, outward
    [0,  'd'],                          // center
    [1,  'i'], [2,  'n'], [3,  'g'],   // right side, outward
  ].forEach(([idx, ch], i) => {
    setTimeout(() => { topSectors[idx].textContent = ch; }, 1200 + i * 160);
  });

  /* ── Bottom ring: percentage counter ──────────────────────────────────── */
  //  5 chars centered at sector 0 (front): start offset = 30 - 2 = 28
  //  Layout   →  [ ·  0%  · ]
  //  Sectors  → 28 29   0  1  2

  botSectors[28].textContent = '[';
  botSectors[29].textContent = '·';
  botSectors[1].textContent  = '·';
  botSectors[2].textContent  = ']';

  /* ── Counter: increments by exactly 1 per tick ────────────────────────── */
  //  26 ms × 100 steps = 2 600 ms — covers the full text-reveal animation.
  //  Ceiling is 94 until window.load fires; then it runs to 100 and exits.
  let count    = 0;
  let loadDone = false;

  botSectors[0].textContent = '0%';

  const counterIv = setInterval(() => {
    const ceiling = loadDone ? 100 : 94;

    if (count < ceiling) {
      count++;
      botSectors[0].textContent = count + '%';
    }

    if (count >= 100) {
      clearInterval(counterIv);
      setTimeout(() => {
        // Drop #intro back below the preloader so the fade is visible
        document.body.classList.remove('preloader-visible');
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
