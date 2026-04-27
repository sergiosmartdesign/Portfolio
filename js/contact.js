/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Boot sequence (GSAP timeline, fires once on first intersection):
     stars → mountains → sun → ground → content → DeLorean

   DeLorean state machine:
     hidden    → off-screen (CSS transform)
     entering  → banks diagonally from top-left (ct-del-arrive CSS anim)
     tracking  → spring-physics mouse following (GSAP rAF loop)
     departing → high-speed GSAP exit to top-right
     exploding → asteroid hit → particle burst → re-enters after delay
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section  = document.getElementById('contact');
  const starsEl  = document.getElementById('ct-stars');
  const delorean = section ? section.querySelector('.ct-delorean')  : null;
  const flashEl  = section ? section.querySelector('.ct-flash')     : null;
  const aCanvas  = section ? section.querySelector('.ct-asteroids') : null;
  const actx     = aCanvas  ? aCanvas.getContext('2d')              : null;

  if (!section || !starsEl) return;

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

  const DEL_STATES = ['hidden', 'entering', 'tracking', 'departing', 'exploding'];
  let   delState   = 'hidden';
  let   sectionVisible = false;

  function delSetState(next) {
    if (!delorean || !DEL_STATES.includes(next) || delState === next) return;
    delorean.classList.remove(...DEL_STATES.map(s => 'ct-del--' + s));
    delState = next;
    delorean.classList.add('ct-del--' + next);
  }

  /* ── Mouse-tracking spring physics ───────────────────────────────────── */
  let rafId        = null;
  let mouseX       = 0,  mouseY       = 0;
  let curX         = 0,  curY         = 0;
  let velX         = 0,  velY         = 0;
  let mouseAnchorX = 0,  mouseAnchorY = 0;

  const SPRING   = 0.055;
  const FRICTION = 0.80;

  function onMouseMove(e) {
    const rect = section.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) - mouseAnchorX;
    mouseY = (e.clientY - rect.top)  - mouseAnchorY;
  }

  function onMouseLeave() { mouseX = 0; mouseY = 0; }

  function trackingTick() {
    const t  = performance.now() * 0.001;
    const hX = Math.sin(t * 0.55 + 1.2) * 3;
    const hY = Math.sin(t * 0.90) * 7 + Math.sin(t * 1.3 + 0.8) * 2.5;

    velX += (mouseX + hX - curX) * SPRING;
    velY += (mouseY + hY - curY) * SPRING;
    velX *= FRICTION;
    velY *= FRICTION;
    curX += velX;
    curY += velY;

    const bank = Math.max(-24, Math.min(24, velX * 1.6));
    gsap.set(delorean, { x: curX, y: curY, rotation: bank });

    rafId = requestAnimationFrame(trackingTick);
  }

  function startTracking() {
    const carRect     = delorean.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    mouseAnchorX = carRect.left + carRect.width  / 2 - sectionRect.left;
    mouseAnchorY = carRect.top  + carRect.height / 2 - sectionRect.top;
    curX = 0; curY = 0; velX = 0; velY = 0;
    mouseX = 0; mouseY = 0;
    section.addEventListener('mousemove', onMouseMove, { passive: true });
    section.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(trackingTick);
  }

  function stopTracking() {
    section.removeEventListener('mousemove', onMouseMove);
    section.removeEventListener('mouseleave', onMouseLeave);
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ════════════════════════════════════════════════════════════════════════
     ASTEROID SYSTEM
     3-D perspective: each asteroid has (x, y, z); z decreases toward viewer.
     Screen pos = vanishingPoint + (x, y) * FOV / z
     Screen radius = baseRadius * FOV / z
     ════════════════════════════════════════════════════════════════════════ */

  const AFOV      = 420;   // perspective field-of-view scale
  const AZFAR     = 900;   // spawn depth
  const AZNEAR    = 30;    // near clip / collision threshold depth
  const ASPEED_LO = 150;   // z-units per second (slow)
  const ASPEED_HI = 420;   // z-units per second (fast)

  let asteroids    = [];
  let particles    = [];
  let aRafId       = null;
  let aLastTime    = 0;
  let nextSpawn    = Infinity;
  let reenterTimer = null;

  function resizeACanvas() {
    if (!aCanvas) return;
    aCanvas.width  = section.offsetWidth;
    aCanvas.height = section.offsetHeight;
  }

  function makeAsteroid(aimed) {
    const cw  = aCanvas ? aCanvas.width  : section.offsetWidth;
    const ch  = aCanvas ? aCanvas.height : section.offsetHeight;
    const vpX = cw * 0.5;
    const vpY = ch * 0.28;   // vanishing point in upper sky area

    const radius = 5 + Math.random() * 22;
    const speed  = ASPEED_LO + Math.random() * (ASPEED_HI - ASPEED_LO);

    let x, y;
    if (aimed) {
      /* Aim so the asteroid arrives near the DeLorean's current position */
      const dsx = mouseAnchorX + curX;
      const dsy = mouseAnchorY + curY;
      x = (dsx - vpX) * AZNEAR / AFOV + (Math.random() - 0.5) * 22;
      y = (dsy - vpY) * AZNEAR / AFOV + (Math.random() - 0.5) * 22;
    } else {
      /* Random — wide spread so most pass by harmlessly */
      x = (Math.random() - 0.5) * cw * 1.5;
      y = (Math.random() - 0.5) * ch * 0.95;
    }

    /* Crater map (normalised -1..1 coords) */
    const craters = Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 0.62;
      return { cx: Math.cos(a) * d, cy: Math.sin(a) * d, cr: 0.10 + Math.random() * 0.18 };
    });

    return {
      x, y, z: AZFAR, speed, radius,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 3.0,
      craters,
      onFire: Math.random() < 0.42,
      trail: [],
      alive: true,
    };
  }

  function spawnBurst() {
    const count  = Math.random() < 0.28 ? 2 : 1;
    const hasHit = Math.random() < 0.38;
    for (let i = 0; i < count; i++) {
      asteroids.push(makeAsteroid(i === 0 && hasHit));
    }
  }

  /* Draw a single asteroid centred at canvas origin (caller does translate/rotate) */
  function drawAsteroid(ctx, sr, craters) {
    /* Rocky body — radial gradient lit from upper-left */
    const lg = ctx.createRadialGradient(
      -sr * 0.30, -sr * 0.35, sr * 0.04,
       0,          0,          sr
    );
    lg.addColorStop(0,    '#3d3120');
    lg.addColorStop(0.55, '#1c1610');
    lg.addColorStop(1,    '#090604');
    ctx.beginPath();
    ctx.arc(0, 0, sr, 0, Math.PI * 2);
    ctx.fillStyle = lg;
    ctx.fill();

    /* Amber synthwave rim light */
    const rg = ctx.createRadialGradient(0, 0, sr * 0.68, 0, 0, sr);
    rg.addColorStop(0, 'rgba(238,155,0,0)');
    rg.addColorStop(1, 'rgba(238,155,0,0.22)');
    ctx.fillStyle = rg;
    ctx.fill();

    /* Impact craters (only when large enough to see) */
    if (sr > 11) {
      for (const c of craters) {
        const cs = c.cr * sr;
        const cg = ctx.createRadialGradient(
          c.cx * sr - cs * 0.3, c.cy * sr - cs * 0.3, 0,
          c.cx * sr,             c.cy * sr,             cs
        );
        cg.addColorStop(0, 'rgba(0,0,0,0.60)');
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(c.cx * sr, c.cy * sr, cs, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
      }
    }
  }

  /* Fire trail — drawn in screen space before the asteroid body */
  function drawFireTrail(ctx, trail) {
    for (let i = 0; i < trail.length; i++) {
      const p  = trail[i];
      const tf = i / trail.length;           /* 0 = oldest tail, 1 = head */
      const tr = p.sr * (0.18 + tf * 0.55);
      const g  = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, tr * 2.2);
      g.addColorStop(0,   `rgba(255,210,60,${tf * 0.75})`);
      g.addColorStop(0.4, `rgba(238,80,0,${tf * 0.45})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, Math.max(tr * 2.2, 0.5), 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  /* Fire glow corona — drawn centred at origin inside the asteroid's save/restore */
  function drawFireGlow(ctx, sr) {
    const flicker = 0.88 + Math.sin(performance.now() * 0.009) * 0.12;
    const gr = sr * 2.1 * flicker;
    const g  = ctx.createRadialGradient(0, -sr * 0.15, 0, 0, 0, gr);
    g.addColorStop(0,    'rgba(255,220,80,0.60)');
    g.addColorStop(0.25, 'rgba(238,90,0,0.38)');
    g.addColorStop(0.6,  'rgba(160,18,0,0.16)');
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, gr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  /* Spawn canvas-space particles at the explosion point */
  function spawnExplosion(sx, sy) {
    /* Bright flash disc */
    particles.push({ flash: true, x: sx, y: sy, life: 0.42, elapsed: 0 });

    /* Shrapnel + fire shards */
    const COLS = ['#EE9B00', '#CA6702', '#BB3E03', '#FF8800', '#FFD700', '#ffffff', '#ff4400'];
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 70 + Math.random() * 340;
      particles.push({
        x:  sx + (Math.random() - 0.5) * 24,
        y:  sy + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 100,   /* slight upward bias */
        r:  1.5 + Math.random() * 6.5,
        color: COLS[Math.floor(Math.random() * COLS.length)],
        life:    0.5 + Math.random() * 1.1,
        elapsed: 0,
      });
    }
  }

  function asteroidTick(now) {
    if (!actx || !aCanvas) return;

    const dt  = Math.min((now - aLastTime) / 1000, 0.08);
    aLastTime = now;

    const cw  = aCanvas.width;
    const ch  = aCanvas.height;
    const vpX = cw  * 0.5;
    const vpY = ch  * 0.28;

    actx.clearRect(0, 0, cw, ch);

    /* ── Spawn ──────────────────────────────────────────────────────────── */
    if (delState === 'tracking' && now >= nextSpawn) {
      spawnBurst();
      nextSpawn = now + 2000 + Math.random() * 2400;
    }

    /* ── Asteroids ──────────────────────────────────────────────────────── */
    const dsx  = mouseAnchorX + curX;
    const dsy  = mouseAnchorY + curY;
    const delR = 36;   /* DeLorean collision radius in canvas-px */

    asteroids = asteroids.filter(a => a.alive);

    for (const a of asteroids) {
      a.z        -= a.speed * dt;
      a.rotation += a.rotSpeed * dt;

      if (a.z <= 1) { a.alive = false; continue; }

      const scale = AFOV / a.z;
      const sx = vpX + a.x * scale;
      const sy = vpY + a.y * scale;
      const sr = a.radius * scale;

      /* Off-screen cull */
      if (sx + sr < -30 || sx - sr > cw + 30 ||
          sy + sr < -30 || sy - sr > ch + 30 || sr > 600) {
        a.alive = false; continue;
      }

      /* Collision — only check when asteroid is close */
      if (delState === 'tracking' && a.z < 120) {
        if (Math.hypot(sx - dsx, sy - dsy) < sr * 0.65 + delR) {
          a.alive = false;
          delExplode(sx, sy);
          continue;
        }
      }

      const alpha = Math.min(1, (AZFAR - a.z) / 100);

      /* Fire trail (screen space, before body) */
      if (a.onFire && a.trail.length > 1) {
        actx.save();
        actx.globalAlpha = alpha;
        drawFireTrail(actx, a.trail);
        actx.restore();
      }

      /* Asteroid body + optional fire glow */
      actx.save();
      actx.translate(sx, sy);
      actx.rotate(a.rotation);
      actx.globalAlpha = alpha;
      if (a.onFire) drawFireGlow(actx, Math.max(sr, 0.8));
      drawAsteroid(actx, Math.max(sr, 0.8), a.craters);
      actx.restore();

      /* Append current screen position to trail */
      if (a.onFire) {
        a.trail.push({ sx, sy, sr });
        if (a.trail.length > 20) a.trail.shift();
      }
    }

    /* ── Particles ──────────────────────────────────────────────────────── */
    particles = particles.filter(p => p.elapsed < p.life);

    for (const p of particles) {
      p.elapsed += dt;
      const t = Math.min(p.elapsed / p.life, 1);

      if (p.flash) {
        /* Expanding radial bloom */
        const fr = (1 - t) * 130;
        if (fr > 0) {
          const fg = actx.createRadialGradient(p.x, p.y, 0, p.x, p.y, fr);
          fg.addColorStop(0,   `rgba(255,230,120,${0.9 * (1 - t)})`);
          fg.addColorStop(0.3, `rgba(238,100,0,${0.55 * (1 - t)})`);
          fg.addColorStop(1,   'rgba(0,0,0,0)');
          actx.beginPath();
          actx.arc(p.x, p.y, fr, 0, Math.PI * 2);
          actx.fillStyle = fg;
          actx.fill();
        }
        continue;
      }

      p.x  += p.vx * dt;
      p.vy += 290 * dt;   /* gravity */
      p.y  += p.vy * dt;

      const radius = Math.max(p.r * (1 - t * 0.45), 0.5);
      actx.globalAlpha = Math.pow(1 - t, 1.5) * 0.93;
      actx.beginPath();
      actx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      actx.fillStyle = p.color;
      actx.fill();
    }

    actx.globalAlpha = 1;
    aRafId = requestAnimationFrame(asteroidTick);
  }

  function startAsteroidLoop() {
    if (!actx) return;
    resizeACanvas();
    if (!aRafId) {
      aLastTime = performance.now();
      aRafId    = requestAnimationFrame(asteroidTick);
    }
  }

  function stopAsteroidLoop() {
    if (aRafId) { cancelAnimationFrame(aRafId); aRafId = null; }
    asteroids = [];
    particles = [];
    if (actx && aCanvas) actx.clearRect(0, 0, aCanvas.width, aCanvas.height);
  }

  /* ════════════════════════════════════════════════════════════════════════
     EXPLOSION — asteroid hits DeLorean
     ════════════════════════════════════════════════════════════════════════ */

  function delExplode(hitSX, hitSY) {
    if (delState !== 'tracking') return;
    stopTracking();
    delSetState('exploding');

    /* Quick shake then implode */
    const ox = curX, oy = curY;
    gsap.timeline({ overwrite: true })
      .to(delorean, { x: ox - 10, y: oy + 6,  duration: 0.05, ease: 'none' })
      .to(delorean, { x: ox + 12, y: oy - 5,  duration: 0.05 })
      .to(delorean, { x: ox - 8,  y: oy + 4,  duration: 0.05 })
      .to(delorean, { x: ox + 5,  y: oy - 3,  duration: 0.05 })
      .to(delorean, { scale: 0, opacity: 0, rotation: 18,
                      x: ox, y: oy, duration: 0.30, ease: 'power3.in' });

    spawnExplosion(hitSX, hitSY);

    clearTimeout(reenterTimer);
    reenterTimer = setTimeout(() => {
      particles = [];
      if (actx && aCanvas) actx.clearRect(0, 0, aCanvas.width, aCanvas.height);
      gsap.set(delorean, { clearProps: 'all' });
      delSetState('hidden');
      nextSpawn = performance.now() + 2800;   /* pause asteroids while re-entering */
      if (sectionVisible) setTimeout(delEnter, 700);
    }, 2300);
  }

  /* ════════════════════════════════════════════════════════════════════════
     ENTRY / DEPARTURE
     ════════════════════════════════════════════════════════════════════════ */

  function delEnter() {
    if (delState !== 'hidden') return;
    delSetState('entering');
  }

  function delDepart() {
    if (delState !== 'tracking') return;
    stopTracking();
    stopAsteroidLoop();
    delSetState('departing');

    if (flashEl) {
      setTimeout(() => {
        flashEl.classList.add('ct-flash--active');
        flashEl.addEventListener('animationend', () => {
          flashEl.classList.remove('ct-flash--active');
        }, { once: true });
      }, 280);
    }

    gsap.to(delorean, {
      x: curX + 380, y: curY - 820,
      scale: 0.02, rotation: 42, opacity: 0,
      duration: 0.82, ease: 'power4.in', overwrite: true,
      onComplete: () => {
        gsap.set(delorean, { clearProps: 'all' });
        delSetState('hidden');
        if (!sectionVisible) section.classList.add('ct-paused');
      }
    });
  }

  if (delorean) {
    delorean.addEventListener('animationend', (e) => {
      if (e.animationName === 'ct-del-arrive' && delState === 'entering') {
        requestAnimationFrame(() => {
          delSetState('tracking');
          startTracking();
          startAsteroidLoop();
          nextSpawn = performance.now() + 1800;  /* first rock after 1.8 s */
          if (!sectionVisible) requestAnimationFrame(delDepart);
        });
      }
    });
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('href') !== '#contact' && delState === 'tracking') delDepart();
    });
  });

  /* ════════════════════════════════════════════════════════════════════════
     BOOT SEQUENCE — GSAP timeline
     ════════════════════════════════════════════════════════════════════════ */

  let sceneBoot = false;
  let resizeTimer;

  function glitchIn(tl, target, position, opts = {}) {
    const { withY = false, withScaleY = false } = opts;
    const base = withY      ? { opacity: 0, y: '28%' }
               : withScaleY ? { opacity: 0, scaleY: 0.04, scaleX: 1.08 }
               :               { opacity: 0 };

    tl.set(target, base, position);

    if (withY) {
      tl.to(target, { y: 0, opacity: 0.9, duration: 0.14, ease: 'power2.out' });
      tl.to(target, { opacity: 0.05, duration: 0.07 });
    } else if (withScaleY) {
      tl.to(target, { scaleY: 0.08, scaleX: 1.05, opacity: 0.9, duration: 0.10 });
      tl.to(target, { opacity: 0.1,  duration: 0.06 });
      tl.to(target, { scaleY: 0.42, scaleX: 1, opacity: 1, duration: 0.14 });
      tl.to(target, { opacity: 0.45, duration: 0.07 });
      tl.to(target, { scaleY: 0.78, opacity: 1, duration: 0.12 });
      tl.to(target, { opacity: 0.8,  duration: 0.05 });
      tl.to(target, { scaleY: 1,    opacity: 1, duration: 0.10 });
      return;
    } else {
      tl.to(target, { opacity: 0.88, duration: 0.09 });
      tl.to(target, { opacity: 0.04, duration: 0.06 });
    }
    tl.to(target, { opacity: 1,    duration: 0.10 });
    tl.to(target, { opacity: 0.35, duration: 0.06 });
    tl.to(target, { opacity: 1,    duration: 0.09 });
    tl.to(target, { opacity: 0.65, duration: 0.05 });
    tl.to(target, { opacity: 1,    duration: 0.08 });
  }

  function bootScene() {
    if (sceneBoot || typeof gsap === 'undefined') return;
    sceneBoot = true;

    buildStars();

    gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      glitchIn(tl, '#ct-stars', 0);
      glitchIn(tl, ['.ct-horizon-glow', '.ct-mountains--far'], '+=0.08', { withY: true });
      glitchIn(tl, '.ct-mountains--mid',  '+=0.06', { withY: true });
      glitchIn(tl, '.ct-mountains--near', '+=0.05', { withY: true });
      glitchIn(tl, '.ct-sun',   '+=0.08', { withScaleY: true });
      glitchIn(tl, '.ct-ground','+=0.08', { withY: true });

      tl.fromTo('.ct-content',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
        '+=0.08'
      );

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
          if (delState === 'tracking') {
            delDepart();
          } else if (delState === 'exploding') {
            /* Section left during explosion — abort cleanly */
            clearTimeout(reenterTimer);
            stopAsteroidLoop();
            gsap.killTweensOf(delorean);
            gsap.set(delorean, { clearProps: 'all' });
            delSetState('hidden');
            section.classList.add('ct-paused');
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
    resizeTimer = setTimeout(() => { buildStars(); resizeACanvas(); }, 250);
  });
})();
