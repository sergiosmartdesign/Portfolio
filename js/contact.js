/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Generates stars and pauses animations when the section is off-screen.
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section = document.getElementById('contact');
  const starsEl = document.getElementById('ct-stars');

  if (!section || !starsEl) return;

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  /* ── Star generation ──────────────────────────────────────────────────── */
  function buildStars() {
    starsEl.innerHTML = '';
    const w     = window.innerWidth;
    const h     = window.innerHeight * 0.65;   // stars only in sky area
    const count = randomInt(42, 90);

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'ct-star';
      star.style.setProperty('--x', `${randomInt(0, w)}px`);
      star.style.setProperty('--y', `${randomInt(0, h)}px`);
      frag.appendChild(star);
    }
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
