/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Boot sequence (GSAP timeline, fires once on first intersection):
     stars → mountains → sun → ground → palms → content → DeLorean

   DeLorean state machine:
     hidden    → off-screen top-left
     entering  → banks diagonally from top-left to ground (ct-del-arrive)
     idle      → gentle hover (ct-del-idle)
     departing → flux charge + right-bank sky launch (ct-del-depart)
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section  = document.getElementById('contact');
  const starsEl  = document.getElementById('ct-stars');
  const delorean = section ? section.querySelector('.ct-delorean')       : null;
  const flashEl  = section ? section.querySelector('.ct-flash')          : null;

  if (!section || !starsEl) return;

  /* ── Apply boot class immediately — hides all elements before GSAP runs ── */
  section.classList.add('ct-scene--boot');

  /* ── Star colors ──────────────────────────────────────────────────────── */
  const COLORS = ['#E9D8A6', '#E9D8A6', '#E9D8A6', '#94D2BD'];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function makeShadows(count, fieldW, fieldH) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      parts.push(`${randInt(0, fieldW)}px ${randInt(0, fieldH)}px ${COLORS[randInt(0, COLORS.length)]}`);
    }
    return parts.join(', ');
  }

  function buildStars() {
    const W = Math.max(window.innerWidth * 1.2, 1600);
    const H = 2000;
    let styleTag = document.getElementById('ct-stars-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ct-stars-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      .ct-s1, .ct-s1::after { box-shadow: ${makeShadows(700, W, H)}; }
      .ct-s2, .ct-s2::after { box-shadow: ${makeShadows(200, W, H)}; }
      .ct-s3, .ct-s3::after { box-shadow: ${makeShadows(100, W, H)}; }
    `;
    starsEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    ['ct-s1', 'ct-s2', 'ct-s3'].forEach(cls => {
      const el = document.createElement('div');
      el.className = cls;
      frag.appendChild(el);
    });
    starsEl.appendChild(frag);
  }

  /* ════════════════════════════════════════════════════════════════════════
     DELOREAN STATE MACHINE
     ════════════════════════════════════════════════════════════════════════ */

  const DEL_STATES   = ['hidden', 'entering', 'idle', 'departing'];
  let   delState     = 'hidden';
  let   sectionVisible = false;

  function delSetState(next) {
    if (!delorean || !DEL_STATES.includes(next) || delState === next) return;
    delorean.classList.remove(...DEL_STATES.map(s => 'ct-del--' + s));
    delState = next;
    delorean.classList.add('ct-del--' + next);
  }

  function delEnter() {
    if (delState !== 'hidden') return;
    delSetState('entering');
  }

  function delDepart() {
    if (delState !== 'idle') return;
    delSetState('departing');
    if (flashEl) {
      setTimeout(() => {
        flashEl.classList.add('ct-flash--active');
        flashEl.addEventListener('animationend', () => {
          flashEl.classList.remove('ct-flash--active');
        }, { once: true });
      }, 810);
    }
  }

  if (delorean) {
    delorean.addEventListener('animationend', (e) => {
      if (e.animationName === 'ct-del-arrive' && delState === 'entering') {
        requestAnimationFrame(() => {
          delSetState('idle');
          if (!sectionVisible) requestAnimationFrame(delDepart);
        });
      } else if (e.animationName === 'ct-del-depart' && delState === 'departing') {
        delSetState('hidden');
        if (!sectionVisible) section.classList.add('ct-paused');
      }
    });
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('href') !== '#contact' && delState === 'idle') delDepart();
    });
  });

  /* ════════════════════════════════════════════════════════════════════════
     BOOT SEQUENCE — GSAP timeline
     Inline styles set by GSAP override CSS cascade cleanly; no fill-mode fights.
     ════════════════════════════════════════════════════════════════════════ */

  let sceneBoot = false;
  let resizeTimer;

  /* Helper: build a glitch sequence on one element inside the timeline.
     Rapid opacity flickers then locks at 1. Returns time consumed. */
  function glitchIn(tl, target, position, opts = {}) {
    const { withY = false, withScaleY = false } = opts;
    const base = withY    ? { opacity: 0, y: '28%' }
               : withScaleY ? { opacity: 0, scaleY: 0.04, scaleX: 1.08 }
               : { opacity: 0 };

    tl.set(target, base, position);

    if (withY) {
      tl.to(target, { y: 0, opacity: 0.9, duration: 0.14, ease: 'power2.out' });
      tl.to(target, { opacity: 0.05, duration: 0.07 });
    } else if (withScaleY) {
      tl.to(target, { scaleY: 0.08, scaleX: 1.05, opacity: 0.9, duration: 0.10 });
      tl.to(target, { opacity: 0.1, duration: 0.06 });
      tl.to(target, { scaleY: 0.42, scaleX: 1, opacity: 1, duration: 0.14 });
      tl.to(target, { opacity: 0.45, duration: 0.07 });
      tl.to(target, { scaleY: 0.78, opacity: 1, duration: 0.12 });
      tl.to(target, { opacity: 0.8, duration: 0.05 });
      tl.to(target, { scaleY: 1, opacity: 1, duration: 0.10 });
      return;
    } else {
      tl.to(target, { opacity: 0.88, duration: 0.09 });
      tl.to(target, { opacity: 0.04, duration: 0.06 });
    }

    tl.to(target, { opacity: 1, duration: 0.10 });
    tl.to(target, { opacity: 0.35, duration: 0.06 });
    tl.to(target, { opacity: 1, duration: 0.09 });
    tl.to(target, { opacity: 0.65, duration: 0.05 });
    tl.to(target, { opacity: 1, duration: 0.08 });
  }

  function bootScene() {
    if (sceneBoot || typeof gsap === 'undefined') return;
    sceneBoot = true;

    buildStars();

    gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      /* 1 — STARS: VHS static burst */
      glitchIn(tl, '#ct-stars', 0);

      /* 2 — FAR MOUNTAINS: rise from horizon */
      glitchIn(tl, ['.ct-horizon-glow', '.ct-mountains--far'], '+=0.08', { withY: true });

      /* 3 — MID MOUNTAINS: dramatic peaks staggered in */
      glitchIn(tl, '.ct-mountains--mid', '+=0.06', { withY: true });

      /* 4 — NEAR MOUNTAINS: foreground foothills snap in last */
      glitchIn(tl, '.ct-mountains--near', '+=0.05', { withY: true });

      /* 5 — SUN: CRT scanline power-on */
      glitchIn(tl, '.ct-sun', '+=0.08', { withScaleY: true });

      /* 6 — GROUND GRID: snap in from horizon */
      glitchIn(tl, '.ct-ground', '+=0.08', { withY: true });

      /* 7 — CONTENT: smooth fade-slide up */
      tl.fromTo('.ct-content',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
        '+=0.08'
      );

      /* 8 — DELOREAN: flies in from top-left after scene is established */
      tl.call(delEnter, null, '+=0.18');

    }, section);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER
     ════════════════════════════════════════════════════════════════════════ */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sectionVisible = true;
          section.classList.remove('ct-paused');
          if (!sceneBoot) {
            bootScene();
          } else if (delState === 'hidden') {
            setTimeout(delEnter, 350);
          }
        } else {
          sectionVisible = false;
          if (delState === 'idle') {
            delDepart();
          } else if (delState === 'hidden') {
            section.classList.add('ct-paused');
          }
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(section);

  window.addEventListener('resize', () => {
    if (!sceneBoot) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStars, 250);
  });
})();
