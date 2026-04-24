/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Generates parallax star layers and pauses animations when off-screen.
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section = document.getElementById('contact');
  const starsEl = document.getElementById('ct-stars');

  if (!section || !starsEl) return;

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randInt(min, max) {
    return Math.floor(rand(min, max));
  }

  /* ── Star generation ──────────────────────────────────────────────────── */
  const LAYERS = [
    { mod: '--far',  count: 90, sizes: ['s','s','s','m'],          durRange: [3.5, 6.0], delayRange: [0, 8] },
    { mod: '--mid',  count: 70, sizes: ['s','s','m','m','l'],       durRange: [2.5, 5.0], delayRange: [0, 7] },
    { mod: '--near', count: 40, sizes: ['m','m','l'],               durRange: [1.8, 3.8], delayRange: [0, 5] },
  ];

  const SHOOTS = [
    { x: '15%', y: '8%',  angle: '-18deg', dur: 7,  delay: 1.2 },
    { x: '60%', y: '5%',  angle: '-26deg', dur: 11, delay: 4.5 },
    { x: '35%', y: '14%', angle: '-14deg', dur: 9,  delay: 8.0 },
    { x: '78%', y: '10%', angle: '-22deg', dur: 13, delay: 2.8 },
  ];

  function buildStars() {
    starsEl.innerHTML = '';
    const w = window.innerWidth;
    const h = window.innerHeight * 0.62;   // sky area only
    const frag = document.createDocumentFragment();

    LAYERS.forEach(({ mod, count, sizes, durRange, delayRange }) => {
      const layer = document.createElement('div');
      layer.className = `ct-stars-layer ct-stars-layer${mod}`;

      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        const size = sizes[randInt(0, sizes.length)];
        star.className = `ct-star ct-star--${size}`;
        star.style.setProperty('--x',     `${randInt(0, w)}px`);
        star.style.setProperty('--y',     `${randInt(0, h)}px`);
        star.style.setProperty('--dur',   `${rand(...durRange).toFixed(2)}s`);
        star.style.setProperty('--delay', `${rand(...delayRange).toFixed(2)}s`);
        layer.appendChild(star);
      }
      frag.appendChild(layer);
    });

    SHOOTS.forEach(({ x, y, angle, dur, delay }) => {
      const shoot = document.createElement('div');
      shoot.className = 'ct-shoot';
      shoot.style.left  = x;
      shoot.style.top   = y;
      shoot.style.setProperty('--angle', angle);
      shoot.style.setProperty('--dur',   `${dur}s`);
      shoot.style.setProperty('--delay', `${delay}s`);
      frag.appendChild(shoot);
    });

    starsEl.appendChild(frag);
  }

  /* ── Pause animations when off-screen (performance) ──────────────────── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        section.classList.toggle('ct-paused', !entry.isIntersecting);
      });
    },
    { threshold: 0.01 }
  );
  observer.observe(section);

  /* ── Init ─────────────────────────────────────────────────────────────── */
  requestAnimationFrame(buildStars);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStars, 200);
  });
})();
