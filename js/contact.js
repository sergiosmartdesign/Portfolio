/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Boot sequence (GSAP timeline, fires once on first intersection):
     stars → mountains → sun → ground → cockpit → content

   Ship cockpit:
     images/ship-cockpit-color.svg is fetch-injected inline into .ct-cockpit
     so internal groups (e.g. the glow-light blink group) can be animated
     with CSS. The windshield is transparent — the scene shows through it.
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section   = document.getElementById('contact');
  const starsEl   = document.getElementById('ct-stars');
  const cockpitEl = section ? section.querySelector('.ct-cockpit') : null;

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
     SHIP COCKPIT — fetch-inject the SVG so internal groups are animatable
     ════════════════════════════════════════════════════════════════════════ */

  let cockpitSvg = null;

  /* The artwork is 3:2. Near-landscape viewports stretch to fill so the
     frame edges always meet the screen edges; portrait viewports scale to
     cover anchored to the bottom so the dashboard stays visible. */
  function updateCockpitAspect() {
    if (!cockpitSvg) return;
    const ar = section.offsetWidth / Math.max(section.offsetHeight, 1);
    cockpitSvg.setAttribute(
      'preserveAspectRatio',
      ar >= 1.05 ? 'none' : 'xMidYMax slice'
    );
  }

  function injectCockpit() {
    if (!cockpitEl) return;
    fetch('images/ship-cockpit-color.svg')
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        cockpitEl.appendChild(svg);
        cockpitSvg = svg;
        updateCockpitAspect();
        buildFluxFx(svg);
        initHoloBlink(svg);
      })
      .catch(err => console.error('[contact] cockpit SVG failed to load:', err));
  }

  /* Entrance start state: only the holo windshield beam (ct-hide-lines +
     ct-no-colors hide the artwork), then teal glowing wireframe, then color.
     The boot timeline removes these classes in sequence (CSS transitions
     do the smoothing) — works even though the SVG injection is async. */
  if (cockpitEl) {
    cockpitEl.classList.add('ct-lines-teal', 'ct-no-colors', 'ct-hide-lines');
  }

  /* Flux capacitor FX — energy pulses traveling the three Y-arms into the
     core ("condensador de flujo", bottom-centre of the dashboard).
     Coordinates are viewBox user units measured off the artwork. */
  function buildFluxFx(svg) {
    const hover  = svg.querySelector('#hover');
    const parent = hover ? hover.parentNode : svg;
    const NS     = 'http://www.w3.org/2000/svg';

    const CENTER = [501.5, 958];
    const KNOBS  = [[457.5, 898], [543.5, 898], [502.5, 1013]];

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ct-flux');

    KNOBS.forEach(([x, y]) => {
      for (let k = 0; k < 2; k++) {          // two pulses per arm = steady flow
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('class', 'ct-flux-dot');
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('r', 5);
        c.style.setProperty('--fx', (CENTER[0] - x) + 'px');
        c.style.setProperty('--fy', (CENTER[1] - y) + 'px');
        if (k) c.style.animationDelay = '-0.45s';
        g.appendChild(c);
      }
    });

    const core = document.createElementNS(NS, 'circle');
    core.setAttribute('class', 'ct-flux-core');
    core.setAttribute('cx', CENTER[0]);
    core.setAttribute('cy', CENTER[1]);
    core.setAttribute('r', 7);
    g.appendChild(core);

    parent.appendChild(g);

    /* Capsule-style breathing glow in the artwork's own colors:
       flux capacitor housing + the 1,000,000 power readout */
    buildGlowFx(svg, parent, 'flux',  415, 815, 185, 209);
    /* Power readout: only the 1,000,000 digits glow — no region glow */
    buildDigitGlow(svg, parent, 588, 890, 315, 102, 'var(--ct-star-color)');
  }

  /* A soft-edged luminance mask: a blurred white rect. Used instead of a
     clipPath because clipping is applied AFTER CSS filters — a hard clip
     rect slices the blurred glow off at its edges. The mask's own blur
     makes the region dissolve out like real emitted light.
     Returns the mask rect so callers can (re)position the region. */
  function buildSoftMask(parent, id, feather) {
    const NS = 'http://www.w3.org/2000/svg';

    const filt = document.createElementNS(NS, 'filter');
    filt.setAttribute('id', id + '-soft');
    /* widen the filter region so the feather isn't clipped by its own box */
    filt.setAttribute('x', '-40%');
    filt.setAttribute('y', '-40%');
    filt.setAttribute('width', '180%');
    filt.setAttribute('height', '180%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', feather);
    filt.appendChild(blur);

    const mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', id);
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('fill', '#fff');
    rect.setAttribute('filter', `url(#${id}-soft)`);
    mask.appendChild(rect);

    parent.appendChild(filt);
    parent.appendChild(mask);
    return rect;
  }

  /* A blurred, screen-blended clone of the artwork limited to a region —
     the region appears to emit light in its original colors, breathing
     like the DNA capsule's glow. Bounded by a soft mask so the glow
     dissolves at the edges. */
  function buildGlowFx(svg, parent, key, x, y, w, h) {
    const NS = 'http://www.w3.org/2000/svg';

    const maskRect = buildSoftMask(parent, 'ct-glow-mask-' + key, 14);
    maskRect.setAttribute('x', x);
    maskRect.setAttribute('y', y);
    maskRect.setAttribute('width', w);
    maskRect.setAttribute('height', h);

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'ct-glow-layer');
    layer.setAttribute('mask', `url(#ct-glow-mask-${key})`);
    ['#colors', '#lines'].forEach(sel => {
      const src = svg.querySelector(sel);
      if (!src) return;
      const clone = src.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      layer.appendChild(clone);
    });

    parent.appendChild(layer);
  }

  /* Power-readout digits — no glowing region: only the number glyphs glow.
     Every small near-black shape whose box sits inside the readout area is
     cloned (a crisp lit copy + a blurred bloom copy), recolored and
     screen-blended, so the digits read as a lit display with a halo while
     the panel around them stays dark. Boxes are measured in the parent's
     user space (via CTM) so nested group transforms can't misplace clones. */
  function buildDigitGlow(svg, parent, x, y, w, h, color) {
    const NS = 'http://www.w3.org/2000/svg';
    const ref = parent.getScreenCTM();
    if (!ref) return;
    const toParent = ref.inverse();
    const maxArea  = w * h * 0.65;        /* bigger = panel background, skip */

    const glyphs = document.createElementNS(NS, 'g');

    ['#colors', '#lines'].forEach(sel => {
      const src = svg.querySelector(sel);
      if (!src) return;
      src.querySelectorAll('path, polygon, rect, circle, polyline').forEach(el => {
        let b, m;
        try { b = el.getBBox(); m = toParent.multiply(el.getScreenCTM()); }
        catch (e) { return; }
        const p1 = new DOMPoint(b.x, b.y).matrixTransform(m);
        const p2 = new DOMPoint(b.x + b.width, b.y + b.height).matrixTransform(m);
        const bx = Math.min(p1.x, p2.x), by = Math.min(p1.y, p2.y);
        const bw = Math.abs(p2.x - p1.x), bh = Math.abs(p2.y - p1.y);
        if (bx < x || by < y || bx + bw > x + w || by + bh > y + h) return;
        if (bw * bh > maxArea) return;
        const f = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(getComputedStyle(el).fill);
        if (!f) return;
        if (0.2126 * f[1] + 0.7152 * f[2] + 0.0722 * f[3] >= 64) return;

        const clone = el.cloneNode(false);
        clone.removeAttribute('id');
        clone.removeAttribute('class');
        clone.setAttribute('transform',
          `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);
        clone.style.fill = color;
        glyphs.appendChild(clone);
      });
    });

    if (!glyphs.childNodes.length) return;

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'ct-glow-layer ct-glow-layer--digits');
    const bloom = glyphs.cloneNode(true);
    bloom.setAttribute('class', 'ct-glow-bloom');
    layer.appendChild(bloom);
    layer.appendChild(glyphs);
    parent.appendChild(layer);
  }

  /* Holo windshield beam — flickers once every 8, 10 or 15 seconds (picked
     at random each cycle). The blink itself is a short CSS steps() flicker;
     skipped while the section is off-screen or under reduced motion, but
     the clock keeps ticking so blinks stay aperiodic. */
  function initHoloBlink(svg) {
    const holo = svg.querySelector('#holo');
    if (!holo) return;
    const DELAYS = [8000, 10000, 15000];
    holo.addEventListener('animationend', () =>
      holo.classList.remove('ct-holo-blink'));
    (function schedule() {
      const wait = DELAYS[Math.floor(Math.random() * DELAYS.length)];
      setTimeout(() => {
        const skip = section.classList.contains('ct-paused') ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!skip) holo.classList.add('ct-holo-blink');
        schedule();
      }, wait);
    })();
  }

  injectCockpit();

  /* Pilot's hands — injected inline (groups: #color, #left_handline, plus a
     #pointer_invisible fingertip anchor used by the hand-pointer logic).
     Each copy gets its own id prefix and .stN class scope: the cockpit and
     both hands reuse the same Illustrator ids/class names, and inline
     <style> blocks are document-global. */
  function injectHandSvg(handEl, url, prefix, scopeSel) {
    if (!handEl) return;
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.querySelectorAll('[id]').forEach(el =>
          el.setAttribute('id', prefix + el.getAttribute('id')));
        svg.removeAttribute('id');
        svg.querySelectorAll('style').forEach(st => {
          st.textContent = st.textContent.replace(/\.st(\d+)\b/g, `${scopeSel} .st$1`);
        });
        handEl.appendChild(svg);
      })
      .catch(err => console.error('[contact] hand SVG failed to load:', url, err));
  }

  const handLeftEl  = section.querySelector('.ct-hand:not(.ct-hand--right)');
  const handRightEl = section.querySelector('.ct-hand--right');

  injectHandSvg(handLeftEl,  'images/mano%20izq.svg', 'hand-',  '.ct-hand');
  injectHandSvg(handRightEl, 'images/mano%20der.svg', 'handr-', '.ct-hand--right');

  /* ════════════════════════════════════════════════════════════════════════
     HAND POINTER — hovering/focusing a form element moves the hand so the
     fingertip (#hand-pointer_invisible) lands on a dashboard hover rect
     ════════════════════════════════════════════════════════════════════════ */

  /* Builds a pointer controller for one hand: pointAt(rectId) translates the
     hand so its fingertip anchor lands on the rect; reset() clears the inline
     transform so the CSS parked state slides the hand back off-screen. */
  /* Glow layer: a clone of the cockpit's #lines group, recolored by CSS and
     soft-masked to the active hover rect — so the line art inside that
     area glows and dissolves out at the edges, independent of how the
     source paths are grouped. The mask rect copies the hover rect's
     attributes (same user-space coordinates, same parent), so it needs no
     recomputation on resize. */
  function buildLitLayer(svg, key) {
    const lines = svg.querySelector('#lines');
    const hover = svg.querySelector('#hover');
    if (!lines || !hover || !hover.parentNode) return null;
    const NS = 'http://www.w3.org/2000/svg';
    const parent = hover.parentNode;

    const maskRect = buildSoftMask(parent, 'ct-lit-mask-' + key, 10);

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'ct-lit-layer');
    layer.setAttribute('mask', `url(#ct-lit-mask-${key})`);
    const clone = lines.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    layer.appendChild(clone);

    parent.appendChild(layer);
    return { layer, maskRect };
  }

  function makeHandPointer(handEl, tipSelector, key) {
    let lit = null;

    /* Glow on the line art under the fingertip — the rect stays invisible */
    function light(rectEl) {
      if (!lit && cockpitSvg) lit = buildLitLayer(cockpitSvg, key);
      if (!lit) return;
      lit.layer.classList.remove('ct-lit-on');
      if (!rectEl) return;
      ['x', 'y', 'width', 'height'].forEach(a =>
        lit.maskRect.setAttribute(a, rectEl.getAttribute(a)));
      lit.layer.classList.add('ct-lit-on');
    }

    function pointAt(rectId) {
      const tip    = section.querySelector(tipSelector);
      const target = section.querySelector('#' + rectId);
      if (!handEl || !tip || !target) return;   // SVGs not injected yet

      light(target);

      const tipBox = tip.getBoundingClientRect();
      const tgtBox = target.getBoundingClientRect();
      const secBox = section.getBoundingClientRect();

      // Fingertip layout position = current position minus the live
      // transform (covers the parked state and mid-transition measurements)
      let ex = 0, ey = 0;
      const tr = getComputedStyle(handEl).transform;
      if (tr && tr !== 'none') {
        const m = new DOMMatrixReadOnly(tr);
        ex = m.e; ey = m.f;
      }
      const restX = tipBox.left + tipBox.width  / 2 - ex;
      const restY = tipBox.top  + tipBox.height / 2 - ey;
      const tgtX  = tgtBox.left + tgtBox.width  / 2;
      // hover4/hover_8 extend below the viewBox — keep the hand on screen
      const tgtY  = Math.min(tgtBox.top + tgtBox.height / 2, secBox.bottom - 40);

      handEl.style.transform =
        `translate(${(tgtX - restX).toFixed(1)}px, ${(tgtY - restY).toFixed(1)}px)`;
    }

    const reset = () => {
      light(null);
      if (handEl) handEl.style.transform = '';
    };

    return { pointAt, reset };
  }

  /* Left hand ← form fields (fixed mapping to the left button column) */
  function initHandPointer() {
    const form = document.getElementById('ct-form');
    if (!form || !handLeftEl) return;

    const ptr = makeHandPointer(handLeftEl, '#hand-pointer_invisible', 'l');

    const HAND_TARGETS = {
      'ct-f-name':  'hover1',
      'ct-f-email': 'hover2',
      'ct-f-msg':   'hover3',
    };
    const SEND_TARGET = 'hover4';

    function targetFor(node) {
      if (!(node instanceof Element)) return null;
      if (node.closest('.ct-send')) return SEND_TARGET;
      const field = node.closest('.ct-field');
      if (!field) return null;
      const input = field.querySelector('input, textarea');
      return (input && HAND_TARGETS[input.id]) || null;
    }

    form.addEventListener('pointerover', (e) => {
      const t = targetFor(e.target);
      if (t) ptr.pointAt(t); else ptr.reset();
    });
    form.addEventListener('pointerleave', ptr.reset);

    /* keyboard parity */
    form.addEventListener('focusin', (e) => {
      const t = targetFor(e.target);
      if (t) ptr.pointAt(t);
    });
    form.addEventListener('focusout', (e) => {
      if (!form.contains(e.relatedTarget)) ptr.reset();
    });
  }

  initHandPointer();

  /* Right hand ← social links (random pick from the right screen cluster) */
  function initRightHandPointer() {
    const nav = section.querySelector('.ct-links--mini');
    if (!nav || !handRightEl) return;

    const ptr = makeHandPointer(handRightEl, '#handr-pointer_invisible', 'r');
    const SCREENS = ['hover_5', 'hover_6', 'hover_7', 'hover_8'];
    let lastLink = null;

    function pointRandom(link) {
      if (link === lastLink) return;        // re-aim only on a new link
      lastLink = link;
      ptr.pointAt(SCREENS[Math.floor(Math.random() * SCREENS.length)]);
    }

    const leave = () => { lastLink = null; ptr.reset(); };

    nav.addEventListener('pointerover', (e) => {
      const link = e.target instanceof Element && e.target.closest('.ct-link');
      if (link) pointRandom(link);
    });
    nav.addEventListener('pointerleave', leave);

    /* keyboard parity */
    nav.addEventListener('focusin', (e) => {
      const link = e.target instanceof Element && e.target.closest('.ct-link');
      if (link) pointRandom(link);
    });
    nav.addEventListener('focusout', (e) => {
      if (!nav.contains(e.relatedTarget)) leave();
    });
  }

  initRightHandPointer();

  /* DNA art inside the capsule next to the form — injected inline so CSS can
     recolor the (black) source paths to the shell's light blue. */
  function injectCapsuleDna() {
    const holder = section.querySelector('.ct-capsule-dna');
    if (!holder) return;
    fetch('images/roptando%201.svg')
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.removeAttribute('style');
        // The numbered top-level groups (1, 2, 3, 3.5, 4 … 8) are rotation
        // frames in document order — tag them so CSS can flipbook-cycle them.
        const frames = Array.from(svg.children).filter(n => n.nodeName === 'g');
        frames.forEach((g, i) => {
          g.classList.add('ct-dna-frame');
          if (i === 0) g.classList.add('ct-dna-first');
          g.style.setProperty('--dna-frame', i);
        });
        svg.style.setProperty('--ct-dna-count', frames.length);
        // Strip ids — Illustrator exports reuse Layer_1 etc. across files
        svg.removeAttribute('id');
        svg.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        holder.appendChild(svg);
        // The poses are scattered around the artboard (only frame 1 sits
        // inside the viewBox) — center each one horizontally and align all
        // platforms to the bottom edge. getBBox needs a rendered element.
        requestAnimationFrame(() => {
          const vb = svg.viewBox.baseVal;
          frames.forEach(g => {
            try {
              const b  = g.getBBox();
              const dx = (vb.width - b.width) / 2 - b.x;
              const dy = vb.height - (b.y + b.height);
              g.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
            } catch (e) { /* not rendered yet — frame keeps source position */ }
          });
        });
      })
      .catch(err => console.error('[contact] capsule DNA failed to load:', err));
  }

  injectCapsuleDna();

  /* ════════════════════════════════════════════════════════════════════════
     STACKED TITLE — per-letter split + staggered reveal
     (local replacement for the lettering.js + TimelineMax reference)
     ════════════════════════════════════════════════════════════════════════ */

  const titleEl    = section.querySelector('.ct-stack');
  const titleBtn   = section.querySelector('.ct-stack-btn');
  const motionOk   = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-hidden', 'true');   // h2 carries an aria-label
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'ct-stack-char';
      span.textContent = ch;
      frag.appendChild(span);
    }
    el.appendChild(frag);
  }

  if (titleEl) {
    titleEl.querySelectorAll('.ct-stack-line').forEach(splitChars);
    if (titleBtn) splitChars(titleBtn);
  }

  /* Appends the letter drop-in + button reveal to a timeline.
     Under reduced motion everything just snaps visible. */
  function appendTitleReveal(tl) {
    if (!titleEl) return;
    const chars = titleEl.querySelectorAll('.ct-stack-char');
    if (!chars.length) return;

    if (!motionOk()) {
      tl.set(chars, { opacity: 1, yPercent: 0 });
      if (titleBtn) tl.set(titleBtn, { autoAlpha: 1 });
      return;
    }

    if (titleBtn) tl.set(titleBtn, { autoAlpha: 0 });
    tl.fromTo(chars,
      { opacity: 0, yPercent: 130 },
      { opacity: 1, yPercent: 0, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.05 }
    );
    if (titleBtn) tl.to(titleBtn, { autoAlpha: 1, duration: 0.2 });
  }

  function replayTitle() {
    if (typeof gsap === 'undefined') return;
    appendTitleReveal(gsap.timeline());
  }

  if (titleBtn) titleBtn.addEventListener('click', replayTitle);

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

      // Cockpit entrance overlaps the landscape build and leads with the
      // holo windshield beam: the container glitches in while #lines and
      // #colors are still class-hidden, so only #holo shows. The glitch
      // runs in a sub-timeline so it can sit at an absolute position while
      // the background tweens keep appending sequentially after it.
      const HOLO_AT = 0.1;
      const holoTl = gsap.timeline({ defaults: { ease: 'none' } });
      glitchIn(holoTl, '.ct-cockpit', 0);
      tl.add(holoTl, HOLO_AT);

      // Cockpit build: holo beam above — then the teal wireframe fades in,
      // the color art underneath, and finally the lines settle back to
      // their original colors, all while the landscape finishes behind.
      const holoEnd = HOLO_AT + holoTl.duration();
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-hide-lines'),
              null, holoEnd + 0.3);
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-no-colors'),
              null, holoEnd + 1.3);
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-lines-teal'),
              null, holoEnd + 2.6);

      // Hide title letters before the content fades in so they don't flash.
      // Scoped to the h2 — the button's chars are handled via autoAlpha on
      // the button element itself.
      tl.set('.ct-stack .ct-stack-char', { opacity: 0 }, 0);

      tl.fromTo('.ct-content',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
        '+=0.08'
      );

      appendTitleReveal(tl);

    }, section);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER
     ════════════════════════════════════════════════════════════════════════ */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.remove('ct-paused');
          if (!sceneBoot) bootScene();
        } else {
          section.classList.add('ct-paused');
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(section);

  window.addEventListener('resize', () => {
    updateCockpitAspect();
    if (!sceneBoot) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStars, 250);
  });

  /* ════════════════════════════════════════════════════════════════════════
     CONTACT FORM — comms-console uplink
     Transport is mocked for now: sendTransmission() resolves after a delay
     and logs the payload. Swap its body for a real endpoint when ready.
     ════════════════════════════════════════════════════════════════════════ */

  function initContactForm() {
    const form      = document.getElementById('ct-form');
    if (!form) return;

    const logText   = form.querySelector('.ct-log-text');
    const srStatus  = document.getElementById('ct-sr-status');
    const sendBtn   = form.querySelector('.ct-send');
    const successEl = document.getElementById('ct-form-success');
    const resetBtn  = form.querySelector('.ct-success-reset');
    const honeypot  = form.querySelector('.ct-hp');

    const fields = [
      { el: document.getElementById('ct-f-name'),  empty: 'ERR: name is required' },
      { el: document.getElementById('ct-f-email'), empty: 'ERR: email is required', invalid: 'ERR: invalid email address' },
      { el: document.getElementById('ct-f-msg'),   empty: 'ERR: message is empty' },
    ];
    if (!sendBtn || !successEl || fields.some(f => !f.el)) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wait = ms => new Promise(r => setTimeout(r, ms));

    /* MOCK TRANSPORT — replace with e.g.
       return fetch('/api/contact', { method: 'POST', body: JSON.stringify(payload), … })
       once a mail backend exists. */
    function sendTransmission(payload) {
      console.info('[contact] mock transmission:', payload);
      return wait(1500);
    }

    function announce(msg) {
      if (srStatus) srStatus.textContent = msg;
    }

    /* Types into the decorative log; instant under reduced motion. */
    let typeToken = 0;
    function typeLog(text, speed = 16) {
      const token = ++typeToken;
      if (!logText) return Promise.resolve();
      if (reducedMotion.matches) {
        logText.textContent = text;
        return Promise.resolve();
      }
      logText.textContent = '';
      return new Promise(resolve => {
        let i = 0;
        (function tick() {
          if (token !== typeToken) return resolve();
          logText.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(tick, speed);
          else resolve();
        })();
      });
    }

    function setFieldError(field, msg) {
      const wrap = field.el.closest('.ct-field');
      if (wrap) {
        wrap.classList.toggle('is-invalid', !!msg);
        const err = wrap.querySelector('.ct-field-err');
        if (err) err.textContent = msg || '';
      }
      field.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    function validate() {
      let firstBad = null;
      fields.forEach(f => {
        let msg = '';
        if (!f.el.value.trim())          msg = f.empty;
        else if (!f.el.checkValidity())  msg = f.invalid || f.empty;
        setFieldError(f, msg);
        if (msg && !firstBad) firstBad = f.el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    fields.forEach(f => {
      f.el.addEventListener('input', () => setFieldError(f, ''));
    });

    let sending = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      if (honeypot && honeypot.value) return;   // bot — drop silently

      if (!validate()) {
        typeLog('> ERROR :: CHECK FIELDS');
        announce('Some fields need attention.');
        return;
      }

      sending = true;
      form.classList.add('is-sending');
      sendBtn.disabled = true;
      announce('Sending message…');

      const payload = {
        name:    fields[0].el.value.trim(),
        email:   fields[1].el.value.trim(),
        message: fields[2].el.value.trim(),
        sentAt:  new Date().toISOString(),
      };

      try {
        await typeLog('> CONNECTING…');
        await wait(reducedMotion.matches ? 0 : 250);
        await typeLog('> SENDING MESSAGE…');
        await sendTransmission(payload);
        await typeLog('> MESSAGE SENT ✓');

        form.classList.add('is-sent');
        successEl.hidden = false;
        announce('Message sent. Expect a reply within 24 hours.');
        const title = successEl.querySelector('.ct-success-title');
        if (title) title.focus();
      } catch (err) {
        console.error('[contact] transmission failed:', err);
        await typeLog('> SEND FAILED — RETRY OR USE EMAIL LINK');
        announce('Sending failed. Please retry or use the email link below.');
      } finally {
        sending = false;
        form.classList.remove('is-sending');
        sendBtn.disabled = form.classList.contains('is-sent');
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        fields.forEach(f => setFieldError(f, ''));
        form.classList.remove('is-sent');
        successEl.hidden = true;
        sendBtn.disabled = false;
        typeLog('> READY');
        announce('');
        fields[0].el.focus();
      });
    }
  }

  initContactForm();
})();
