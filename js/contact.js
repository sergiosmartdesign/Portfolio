/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Box-shadow pixel-star field (same technique as the classic pure-CSS
   parallax stars demo). Box-shadow lists are generated at runtime so
   the positions vary each load; the ::after clone at top:2000px provides
   the seamless vertical loop.
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section = document.getElementById('contact');
  const starsEl = document.getElementById('ct-stars');

  if (!section || !starsEl) return;

  /* ── Star colors ──────────────────────────────────────────────────────── */
  const COLORS = [
    '#E9D8A6',   // warm sand  (most stars)
    '#E9D8A6',
    '#E9D8A6',
    '#94D2BD',   // teal — occasional cool star
  ];

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function makeShadows(count, fieldW, fieldH) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      const x     = randInt(0, fieldW);
      const y     = randInt(0, fieldH);
      const color = COLORS[randInt(0, COLORS.length)];
      parts.push(`${x}px ${y}px ${color}`);
    }
    return parts.join(', ');
  }

  /* ── Build / rebuild everything ───────────────────────────────────────── */
  function buildStars() {
    /* Use a generous field wider than any viewport; height 2000px matches
       the CSS animation keyframe end-point for a seamless loop. */
    const W = Math.max(window.innerWidth * 1.2, 1600);
    const H = 2000;

    /* Inject (or replace) the box-shadow style block */
    let styleTag = document.getElementById('ct-stars-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ct-stars-style';
      document.head.appendChild(styleTag);
    }

    const shadowS = makeShadows(700, W, H);
    const shadowM = makeShadows(200, W, H);
    const shadowL = makeShadows(100, W, H);

    /* Both the element and its ::after clone share the same shadow list */
    styleTag.textContent = `
      .ct-s1,
      .ct-s1::after { box-shadow: ${shadowS}; }
      .ct-s2,
      .ct-s2::after { box-shadow: ${shadowM}; }
      .ct-s3,
      .ct-s3::after { box-shadow: ${shadowL}; }
    `;

    /* Rebuild DOM (3 star layers + shooting stars) */
    starsEl.innerHTML = '';
    const frag = document.createDocumentFragment();

    ['ct-s1', 'ct-s2', 'ct-s3'].forEach(cls => {
      const el = document.createElement('div');
      el.className = cls;
      frag.appendChild(el);
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
    resizeTimer = setTimeout(buildStars, 250);
  });
})();
