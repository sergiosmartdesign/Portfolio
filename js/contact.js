/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Star field: box-shadow pixel-stars generated at runtime.

   Boot sequence (first intersection only):
     0ms   — stars glitch-flicker in
     260ms — mountain silhouettes glitch-rise
     460ms — sun CRT scanline power-on
     680ms — ground grid materialises
     880ms — large palm glitch-teleport
     1020ms — small palm glitch-teleport
     1100ms — contact text fades up
     1280ms — DeLorean flies in from top-left corner

   DeLorean state machine:
     hidden    → invisible at the left-edge of the top-left sky
     entering  → banks in diagonally top-left → centre-bottom (ct-del-arrive)
     idle      → gentle synthwave hover (ct-del-idle)
     departing → flux capacitor charge + right-bank sky launch (ct-del-depart)
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section  = document.getElementById('contact');
  const starsEl  = document.getElementById('ct-stars');
  const delorean = section ? section.querySelector('.ct-delorean')    : null;
  const flashEl  = section ? section.querySelector('.ct-flash')       : null;
  const sceneEl  = section ? section.querySelector('.ct-scene')       : null;

  if (!section || !starsEl) return;

  /* ── Apply boot class immediately so all elements start hidden ─────────── */
  /* Class goes on #contact so descendants including .ct-content are matched. */
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

  /* ── Build / rebuild star field ───────────────────────────────────────── */
  function buildStars() {
    const W = Math.max(window.innerWidth * 1.2, 1600);
    const H = 2000;

    let styleTag = document.getElementById('ct-stars-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ct-stars-style';
      document.head.appendChild(styleTag);
    }

    const shadowS = makeShadows(700, W, H);
    const shadowM = makeShadows(200, W, H);
    const shadowL = makeShadows(100, W, H);

    styleTag.textContent = `
      .ct-s1, .ct-s1::after { box-shadow: ${shadowS}; }
      .ct-s2, .ct-s2::after { box-shadow: ${shadowM}; }
      .ct-s3, .ct-s3::after { box-shadow: ${shadowL}; }
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

  const DEL_STATES = ['hidden', 'entering', 'idle', 'departing'];
  let delState     = 'hidden';
  let sectionVisible = false;

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

    /* Scene flash fires at the pre-launch power surge — 45% × 1.8s ≈ 810ms */
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

  /* ── Nav buttons immediately trigger departure ────────────────────────── */
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('href') !== '#contact' && delState === 'idle') {
        delDepart();
      }
    });
  });

  /* ════════════════════════════════════════════════════════════════════════
     BOOT SEQUENCE — runs once on first intersection
     Reveals scene elements in order: stars → mountains → sun → ground
     → palms → content → delorean entrance
     ════════════════════════════════════════════════════════════════════════ */

  let sceneBoot = false;

  function reveal(selector, cls) {
    const el = section.querySelector(selector);
    if (el) el.classList.add(cls);
  }

  function bootScene() {
    if (sceneBoot) return;
    sceneBoot = true;

    /* Stars — first: build them now so they exist when the reveal fires */
    buildStars();
    requestAnimationFrame(() => {
      starsEl.classList.add('ct-r--stars');
    });

    /* Mountains */
    setTimeout(() => {
      reveal('.ct-sky', 'ct-r--mountains');
    }, 260);

    /* Sun */
    setTimeout(() => {
      reveal('.ct-sun', 'ct-r--sun');
    }, 460);

    /* Ground grid */
    setTimeout(() => {
      reveal('.ct-ground', 'ct-r--ground');
    }, 680);

    /* Large palm */
    setTimeout(() => {
      reveal('.ct-palm--lg', 'ct-r--palm');
    }, 880);

    /* Small palm */
    setTimeout(() => {
      reveal('.ct-palm--sm', 'ct-r--palm');
    }, 1020);

    /* Contact text */
    setTimeout(() => {
      reveal('.ct-content', 'ct-r--content');
    }, 1100);

    /* DeLorean — flies in from top-left after scene is established */
    setTimeout(delEnter, 1280);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER
     ════════════════════════════════════════════════════════════════════════ */

  let resizeTimer;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sectionVisible = true;
          section.classList.remove('ct-paused');

          if (!sceneBoot) {
            bootScene();
          } else if (delState === 'hidden') {
            /* Subsequent visit: skip scene animation, just fly the car in */
            setTimeout(delEnter, 350);
          }
        } else {
          sectionVisible = false;
          if (delState === 'idle') {
            delDepart();
            /* ct-paused set by animationend once departure completes */
          } else if (delState === 'hidden') {
            section.classList.add('ct-paused');
          }
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(section);

  /* ── Star rebuild on resize ───────────────────────────────────────────── */
  /* Stars are built in bootScene on first intersection; only rebuild after */
  window.addEventListener('resize', () => {
    if (!sceneBoot) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStars, 250);
  });
})();
