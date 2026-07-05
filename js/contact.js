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
        buildEvaScreen(svg);
        buildMechScreen(svg);
        buildSeparator(svg);
        buildSideArt(svg);
        buildInterfazScreen(svg);
        initGlowBlink(svg);
      })
      .catch(err => console.error('[contact] cockpit SVG failed to load:', err));
  }

  /* Entrance start state: only the holo windshield beam (ct-hide-lines +
     ct-no-colors hide the artwork), then teal glowing wireframe, then color.
     The boot timeline removes these classes in sequence (CSS transitions
     do the smoothing) — works even though the SVG injection is async. */
  if (cockpitEl) {
    cockpitEl.classList.add('ct-lines-teal', 'ct-no-colors', 'ct-hide-lines', 'ct-hide-holo');
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
    return layer;
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

  /* ════════════════════════════════════════════════════════════════════════
     EVA-02 DASHBOARD SCREEN — 9-frame scan flipbook at 8 fps, looping
     ════════════════════════════════════════════════════════════════════════
     The dashboard has a SMALL LANDSCAPE EVA-02 HUD screen to the right of the
     animated flux capacitor — a top-level group (not #Layer_11, not
     #glow_and_blink) whose static panel is frame 1 of the scan. Frames
     images/contact/1..9.svg are a potrace-teal HUD scan of the mech (full body →
     torso → head), already landscape with the same aspect as the slot, so each
     whole frame is dropped into a nested <svg> and meet-fit to the slot (no
     crop). The static panel is hidden and the flipbook plays in its place,
     cross-cut by a CSS step-end opacity flipbook (contact.css). The section-wide
     #contact.ct-paused gate freezes it off-screen; reduced motion holds frame 1.
     (NOTE: the other, portrait EVA with the "EVA-02" word — #glow_and_blink — is
     left untouched.) */
  function buildEvaScreen(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const XLINK = 'http://www.w3.org/1999/xlink';

    // Find the small static EVA HUD: the top-level <g> that isn't the artwork
    // wrapper (#Layer_11, which holds #colors/#lines) nor the labelled portrait
    // EVA (#glow_and_blink). Hide it — frame 1 of the flipbook is its pose.
    const tops = [...svg.children].filter(n => n.tagName === 'g');
    const staticEva = tops.find(g =>
      g.id !== 'glow_and_blink' && !g.querySelector('#colors, #lines'));
    if (staticEva) staticEva.classList.add('ct-eva-static');

    // Screen slot in cockpit viewBox units (the static EVA's measured box,
    // right of the flux capacitor). Landscape, matching the frames' aspect.
    const SX = 603.2, SY = 898.2, SW = 135.7, SH = 88.4;
    // Per-frame native sizes (potrace trims each to its own content box).
    const FRAMES = [
      [894, 584], [836, 590], [836, 586], [878, 586], [840, 584],
      [838, 584], [874, 582], [836, 580], [838, 586],
    ];

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-eva');
    wrap.style.setProperty('--ct-eva-count', FRAMES.length);

    // Tint filter — the frame art is a single flat colour (#94d2bd), loaded via
    // <image> so its fill can't be restyled. This recolours it to #AE2012 by its
    // alpha (feFlood clipped to the source shape), applied only while the scan is
    // playing (gated in CSS: .ct-eva--playing). Injected once per cockpit SVG.
    if (!svg.querySelector('#ct-eva-tint')) {
      const defs  = document.createElementNS(NS, 'defs');
      const filt  = document.createElementNS(NS, 'filter');
      filt.setAttribute('id', 'ct-eva-tint');
      // Glow lives INSIDE this filter (feGaussianBlur + feMerge) — WebKit drops a
      // url(#…) reference filter when it's CSS-chained with drop-shadow(), so the
      // whole effect must be one url() filter. sRGB → the exact #AE2012.
      filt.setAttribute('color-interpolation-filters', 'sRGB');
      filt.setAttribute('x', '-40%'); filt.setAttribute('y', '-40%');
      filt.setAttribute('width', '180%'); filt.setAttribute('height', '180%');
      const flood = document.createElementNS(NS, 'feFlood');
      flood.setAttribute('flood-color', '#AE2012');
      flood.setAttribute('result', 'tint');
      const comp  = document.createElementNS(NS, 'feComposite');
      comp.setAttribute('in', 'tint');
      comp.setAttribute('in2', 'SourceGraphic');
      comp.setAttribute('operator', 'in');
      comp.setAttribute('result', 'red');
      const blur  = document.createElementNS(NS, 'feGaussianBlur');
      blur.setAttribute('in', 'red');
      blur.setAttribute('stdDeviation', '2.5');
      blur.setAttribute('result', 'glow');
      const merge = document.createElementNS(NS, 'feMerge');
      ['glow', 'glow', 'red'].forEach(src => {   // double glow → stronger bloom
        const node = document.createElementNS(NS, 'feMergeNode');
        node.setAttribute('in', src);
        merge.appendChild(node);
      });
      filt.appendChild(flood); filt.appendChild(comp);
      filt.appendChild(blur); filt.appendChild(merge);
      defs.appendChild(filt);
      svg.appendChild(defs);
    }

    FRAMES.forEach(([W, H], i) => {
      const frame = document.createElementNS(NS, 'svg');
      frame.setAttribute('class', i === 0 ? 'ct-eva-frame ct-eva-first' : 'ct-eva-frame');
      frame.setAttribute('x', SX);
      frame.setAttribute('y', SY);
      frame.setAttribute('width', SW);
      frame.setAttribute('height', SH);
      frame.setAttribute('viewBox', `0 0 ${W} ${H}`);     // whole frame, no crop
      frame.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      frame.style.setProperty('--ct-eva-i', i);

      const img = document.createElementNS(NS, 'image');
      img.setAttribute('width', W);
      img.setAttribute('height', H);
      const href = `images/contact/${i + 1}.svg`;
      img.setAttribute('href', href);
      img.setAttributeNS(XLINK, 'xlink:href', href);   // Safari fallback

      frame.appendChild(img);
      wrap.appendChild(frame);
    });

    // Interaction: the panel sits frozen on frame 1 (blinking, see contact.css)
    // until clicked, then the scan flipbook plays; click again to stop. A
    // transparent hit-rect over the slot guarantees the whole panel is clickable
    // (every frame but the first is opacity:0, so they can't catch the pointer)
    // and doubles as the fingertip target for the hover hand.
    const hit = document.createElementNS(NS, 'rect');
    hit.setAttribute('id', 'ct-eva-target');
    hit.setAttribute('x', SX);
    hit.setAttribute('y', SY);
    hit.setAttribute('width', SW);
    hit.setAttribute('height', SH);
    hit.setAttribute('class', 'ct-eva-hit');
    hit.setAttribute('role', 'button');
    hit.setAttribute('tabindex', '0');
    hit.setAttribute('aria-label', 'Toggle the EVA-02 scan animation');

    // Hover hand — reuse the PILOT hands (same size as the form-field hover) and
    // aim a randomly chosen one so its fingertip lands on the EVA panel's centre,
    // exactly like the form/social hand pointers.
    const evaHands   = [
      makeHandPointer(handLeftEl,  '#hand-pointer_invisible',  'eva-l'),
      makeHandPointer(handRightEl, '#handr-pointer_invisible', 'eva-r'),
    ];
    const evaHandEls = [handLeftEl, handRightEl];
    let evaIdx = 0, evaHand = null;
    const toggleEva = () => wrap.classList.toggle('ct-eva--playing');
    const showHand = () => {
      evaIdx  = Math.random() < 0.5 ? 0 : 1;   // random hand each hover
      evaHand = evaHands[evaIdx];
      evaHand.pointAt('ct-eva-target');
    };
    const hideHand = () => { if (evaHand) { evaHand.reset(); evaHand = null; } };
    // Tap, then retreat: the pointing hand flashes its click pose, then BOTH hands
    // slide back off the viewport — so a click never leaves the pointing hand (or a
    // stray second hand from an earlier hover) sitting on the panel.
    const evaTapAndRetreat = () => {
      playHandClick(evaHandEls[evaIdx]);
      clearTimeout(hit._retreatTimer);
      hit._retreatTimer = setTimeout(() => {
        evaHands.forEach(h => h.reset());
        evaHand = null;
      }, 170);
    };
    hit.addEventListener('click', toggleEva);
    hit.addEventListener('pointerdown', evaTapAndRetreat);
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEva(); evaTapAndRetreat(); }
    });
    hit.addEventListener('mouseenter', showHand);
    hit.addEventListener('mouseleave', hideHand);
    hit.addEventListener('focus', showHand);
    hit.addEventListener('blur', hideHand);
    wrap.appendChild(hit);   // last child → renders on top, catches the click

    // Append at root so it renders above the cockpit artwork at the slot's
    // absolute coordinates (the slot group has no transform).
    svg.appendChild(wrap);

    // Amber/orange readout bars just above the EVA panel — give them a slow,
    // intermittent breathing glow (calm). Reuses the artwork-colour soft-mask
    // glow; the custom .ct-eva-bars-glow animation (contact.css) overrides the
    // default breathe with a longer swell-and-rest cycle.
    const hover = svg.querySelector('#hover');
    const glowParent = hover ? hover.parentNode : svg;
    const barsGlow = buildGlowFx(svg, glowParent, 'evabars', 637.9, 850.4, 124.8, 33.8);
    if (barsGlow) barsGlow.classList.add('ct-eva-bars-glow');
  }

  /* ════════════════════════════════════════════════════════════════════════
     SECOND MECH SCREEN — 12-frame rotation flipbook at 4 fps, beside the EVA
     ════════════════════════════════════════════════════════════════════════
     A small rotating mech (images/contact/frame-1..12.svg, 64×128 teal line
     art) sits flush right of the EVA screen at the SAME top and height. Hard-cut
     flipbook at 4 fps (12 × 0.25s = 3s loop), same mechanism as the EVA scan.
     Paused off-screen via #contact.ct-paused; reduced motion holds frame 1. */
  function buildMechScreen(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const XLINK = 'http://www.w3.org/1999/xlink';

    // Slot: right of the EVA (ends x≈738.9), same top & height as the EVA; width
    // from the 64×128 frame aspect so the figure isn't distorted.
    const FW = 64, FH = 128;
    const SY = 898.2, SH = 88.4;
    const SW = SH * (FW / FH);          // 44.2
    const SX = 740;                      // small gap after the EVA panel
    const COUNT = 12;

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-mech');
    wrap.style.setProperty('--ct-mech-count', COUNT);

    for (let i = 0; i < COUNT; i++) {
      const frame = document.createElementNS(NS, 'svg');
      frame.setAttribute('class', i === 0 ? 'ct-mech-frame ct-mech-first' : 'ct-mech-frame');
      frame.setAttribute('x', SX);
      frame.setAttribute('y', SY);
      frame.setAttribute('width', SW.toFixed(1));
      frame.setAttribute('height', SH);
      frame.setAttribute('viewBox', `0 0 ${FW} ${FH}`);
      frame.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      frame.style.setProperty('--ct-mech-i', i);

      const img = document.createElementNS(NS, 'image');
      img.setAttribute('width', FW);
      img.setAttribute('height', FH);
      const href = `images/contact/frame-${i + 1}.svg`;
      img.setAttribute('href', href);
      img.setAttributeNS(XLINK, 'xlink:href', href);   // Safari fallback

      frame.appendChild(img);
      wrap.appendChild(frame);
    }

    svg.appendChild(wrap);
  }

  /* ════════════════════════════════════════════════════════════════════════
     SIDE ART — the animated "time traveller" flipbook, auto-looping
     ════════════════════════════════════════════════════════════════════════
     Right of the rotating mech + separator: the SAME 4-frame flipbook the
     section-transition curtain uses (images/time travel svg/1..4.svg — the
     character working the virtual screens), here looping on its own in the
     dashboard slot. Frames are solid-black art, fetched inline and recoloured
     teal with a soft glow via CSS (.ct-sideart); a hard-cut opacity flipbook
     (contact.css) cycles them. Paused off-screen via #contact.ct-paused;
     reduced motion holds frame 1 (.ct-sideart-first). */
  function buildSideArt(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const COUNT = 4;
    // Slot: after the separator (~x811), inside the brown screen (right edge
    // ≤885), same top & height as the EVA. Frames (~1.11 aspect) fit by width.
    const SX = 812, SY = 898.2, SW = 70, SH = 88.4;

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-sideart-anim');
    wrap.style.setProperty('--ct-sideart-count', COUNT);
    svg.appendChild(wrap);

    for (let i = 1; i <= COUNT; i++) {
      fetch(`images/time%20travel%20svg/${i}.svg`)
        .then(r => r.text())
        .then(text => {
          const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
          const art = doc.documentElement;
          if (art.nodeName !== 'svg') throw new Error('bad SVG payload');
          // Drop inline <style> so the CSS teal recolour wins; strip sizing.
          art.querySelectorAll('style').forEach(s => s.remove());
          art.removeAttribute('id');
          art.removeAttribute('width');
          art.removeAttribute('height');
          art.removeAttribute('style');
          art.setAttribute('class', 'ct-sideart ct-sideart-frame' + (i === 1 ? ' ct-sideart-first' : ''));
          art.style.setProperty('--i', i - 1);   // flipbook slot (delay stagger)
          art.setAttribute('x', SX);
          art.setAttribute('y', SY);
          art.setAttribute('width', SW);
          art.setAttribute('height', SH);
          art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          wrap.appendChild(art);
        })
        .catch(err => console.error('[contact] side art frame failed to load:', i, err));
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     SEPARATOR — 3 small vertical lines between the EVA animations & the side art
     ════════════════════════════════════════════════════════════════════════
     Sits in the gap between the rotating mech (ends x≈784.2) and the side-art
     slot (x850), vertically centred on the EVA height. Teal with a soft glow. */
  function buildSeparator(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const CX = 803;                       // centre of the mech↔side-art gap
    const CY = 898.2 + 88.4 / 2;          // EVA vertical centre
    const H = 46, W = 2, GAP = 7;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ct-sep');
    [-1, 0, 1].forEach(k => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'ct-sep-bar');
      r.setAttribute('x', (CX + k * GAP - W / 2).toFixed(1));
      r.setAttribute('y', (CY - H / 2).toFixed(1));
      r.setAttribute('width', W);
      r.setAttribute('height', H);
      r.setAttribute('rx', 1);
      g.appendChild(r);
    });
    svg.appendChild(g);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERFAZ "SALTO TEMPORAL" SCREEN — 8-frame cross-fade, 1 frame / 2 s
     ════════════════════════════════════════════════════════════════════════
     A second, slower dashboard screen: the portrait jump-prep panel the user
     pasted into the cockpit SVG as a static group marks the slot. Frames
     images/contact/interfaz/1..8.svg cross-dissolve — each holds ~2 s with a
     gentle fade-in/fade-out — and the whole stack carries a teal glow.
     The slot is read LIVE from the pasted panel's box (so repositioning it in
     the SVG just works) and stretched with preserveAspectRatio="none" to match
     it exactly (the cockpit itself renders with PAR=none). The static panel is
     hidden — frame 1 is its content. Paused off-screen via #contact.ct-paused;
     reduced motion holds frame 1. Runs AFTER buildEvaScreen so the EVA static
     is already tagged and this resolves to the interfaz panel alone. */
  function buildInterfazScreen(svg) {
    const NS = 'http://www.w3.org/2000/svg';

    // The remaining plain top-level <g>: no id, not the artwork wrapper
    // (#colors/#lines), and not either EVA group (already classed).
    const tops = [...svg.children].filter(n => n.tagName === 'g');
    const staticPanel = tops.find(g =>
      !g.id &&
      !g.classList.contains('ct-eva') &&
      !g.classList.contains('ct-eva-static') &&
      !g.querySelector('#colors, #lines'));
    if (!staticPanel) return;

    // Slot = the pasted panel's live box (no transform on it; PAR=none below
    // makes the frames fill it identically to the static panel).
    let box;
    try { box = staticPanel.getBBox(); } catch (e) { return; }
    if (!box.width || !box.height) return;
    const SX = box.x, SY = box.y, SW = box.width, SH = box.height;
    staticPanel.classList.add('ct-iz-static');

    // Per-frame native sizes (potrace trims each to its own content box).
    const FRAMES = [
      [468, 880], [448, 868], [440, 858], [446, 866],
      [442, 860], [456, 874], [446, 868], [458, 842],
    ];
    const BANDS = 12;
    const DWELLS = [3000, 5000, 8000];   // random dwell per frame (3 / 5 / 8 s)
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Group a frame's potrace paths into horizontal bands (top→bottom) so they
    // can cascade in on each change (à la the About skills SVG). potrace wraps
    // its paths in <g transform="translate(0,H) scale(0.1,-0.1)">, so a path's
    // on-screen y is tY + sY·(first M y-coord).
    function bandGroup(rootSvg, H) {
      const g = rootSvg.querySelector('g');
      if (!g) return;
      const t   = g.getAttribute('transform') || '';
      const trY = /translate\(\s*[-\d.]+[ ,]+([-\d.]+)/.exec(t);
      const scY = /scale\(\s*[-\d.]+[ ,]+([-\d.]+)/.exec(t);
      const tY = trY ? parseFloat(trY[1]) : 0;
      const sY = scY ? parseFloat(scY[1]) : 1;
      const bandH  = H / BANDS;
      const bucket = new Map();
      [...g.children].filter(n => n.tagName === 'path').forEach(p => {
        const m = /M\s*[-\d.]+[ ,]+([-\d.]+)/.exec(p.getAttribute('d') || '');
        const vy = tY + sY * (m ? parseFloat(m[1]) : 0);
        const k  = Math.max(0, Math.min(BANDS - 1, Math.floor(vy / bandH)));
        (bucket.get(k) || bucket.set(k, []).get(k)).push(p);
      });
      [...bucket.keys()].sort((a, b) => a - b).forEach((k, order) => {
        const bg = document.createElementNS(NS, 'g');
        bg.setAttribute('class', 'ct-iz-band');
        bg.style.setProperty('--band-index', order);
        bucket.get(k)[0].parentNode.insertBefore(bg, bucket.get(k)[0]);
        bucket.get(k).forEach(p => bg.appendChild(p));
      });
    }

    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', 'ct-iz');
    svg.appendChild(wrap);

    const frameEls = new Array(FRAMES.length).fill(null);
    let current = null, idx = 0, started = false, timer = null;

    // Swap the shown frame and replay its band cascade (only one frame lives in
    // the DOM at a time — the 8 inlined frames are ~3k paths, too many to stack).
    function activate(i) {
      const el = frameEls[i];
      if (!el) return;
      if (current && current.parentNode) current.remove();
      current = el;
      el.classList.remove('ct-iz-in');
      wrap.appendChild(el);
      if (!rm) { void el.getBoundingClientRect(); el.classList.add('ct-iz-in'); }
    }

    // Self-rescheduling so each dwell is a fresh random 3 / 5 / 8 s (not a fixed beat).
    function scheduleNext() {
      const delay = DWELLS[Math.floor(Math.random() * DWELLS.length)];
      timer = setTimeout(() => {
        if (section.classList.contains('ct-paused')) { scheduleNext(); return; }  // frozen off-screen
        let next = idx, guard = 0;
        do { next = (next + 1) % FRAMES.length; guard++; }
        while (!frameEls[next] && guard <= FRAMES.length);
        if (frameEls[next]) { idx = next; activate(idx); }
        scheduleNext();
      }, delay);
    }
    function startCycle() { if (!timer) scheduleNext(); }

    FRAMES.forEach(([W, H], i) => {
      fetch(`images/contact/interfaz/${i + 1}.svg`)
        .then(r => r.text())
        .then(text => {
          const art = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
          if (art.nodeName !== 'svg') throw new Error('bad SVG payload');
          art.removeAttribute('id');
          art.removeAttribute('style');
          art.removeAttribute('width');
          art.removeAttribute('height');
          art.setAttribute('class', 'ct-iz-frame');
          art.setAttribute('x', SX.toFixed(1));
          art.setAttribute('y', SY.toFixed(1));
          art.setAttribute('width', SW.toFixed(1));
          art.setAttribute('height', SH.toFixed(1));
          art.setAttribute('viewBox', `0 0 ${W} ${H}`);
          // Keep each frame's true aspect (like the EVA/mech/side-art screens) so
          // the varying potrace-trimmed viewBoxes don't stretch/squish; letterboxes
          // cleanly over the dark panel background.
          art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          bandGroup(art, H);
          frameEls[i] = art;
          // Show the first frame that arrives, then start cycling.
          if (!started) { started = true; idx = i; activate(i); if (!rm) startCycle(); }
        })
        .catch(err => console.error('[contact] interfaz frame failed to load:', i + 1, err));
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     #glow_and_blink LAYER — per-element glow + random blink
     ════════════════════════════════════════════════════════════════════════
     The cockpit's "glow_and_blink" group is a cluster of small dashboard
     indicator lights. Each element gets a soft glow in its OWN colour and an
     independent, JS-randomised blink cadence (random duration + negative delay)
     so the panel reads like a live console of asynchronously flickering lights.
     CSS does the flicker (contact.css); #contact.ct-paused freezes it
     off-screen and reduced motion leaves the lights lit but static. */
  function initGlowBlink(svg) {
    const layer = svg.querySelector('#glow_and_blink');
    if (!layer) return;
    layer.querySelectorAll(':scope > *').forEach(el => {
      // Glow colour = the element's own fill (fallback to site amber).
      let c = '#EE9B00';
      try {
        const f = getComputedStyle(el).fill;
        if (f && f !== 'none' && !/rgba?\(0,\s*0,\s*0/.test(f)) c = f;
      } catch (e) { /* keep fallback */ }
      el.style.setProperty('--bk', c);
      el.style.setProperty('--bk-dur', (2.2 + Math.random() * 3.6).toFixed(2) + 's');
      el.style.setProperty('--bk-delay', '-' + (Math.random() * 6).toFixed(2) + 's');
      el.classList.add('ct-blink-el');
    });
  }

  injectCockpit();

  /* Pilot's hands — injected inline (groups: #color, #left_handline, plus a
     #pointer_invisible fingertip anchor used by the hand-pointer logic).
     Each copy gets its own id prefix and .stN class scope: the cockpit and
     both hands reuse the same Illustrator ids/class names, and inline
     <style> blocks are document-global. */
  function injectHandSvg(handEl, url, prefix, scopeSel, markClass) {
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
        if (markClass) svg.classList.add(...markClass.split(' '));
        handEl.appendChild(svg);
      })
      .catch(err => console.error('[contact] hand SVG failed to load:', url, err));
  }

  const handLeftEl  = section.querySelector('.ct-hand:not(.ct-hand--right)');
  const handRightEl = section.querySelector('.ct-hand--right');

  // Two poses per hand: the resting pose + a "click" pose (fingers pressed). The
  // click pose overlays the normal one (same viewBox) and is flashed on for a
  // beat whenever the hand taps something — see playHandClick(). Distinct id
  // prefixes + its own style scope keep the two inline SVGs from clashing.
  injectHandSvg(handLeftEl,  'images/mano%20izq.svg',        'hand-',   '.ct-hand',        'ct-hand-pose');
  injectHandSvg(handRightEl, 'images/mano%20der.svg',        'handr-',  '.ct-hand--right', 'ct-hand-pose');
  injectHandSvg(handLeftEl,  'images/mano%20izq%20click.svg', 'handlc-', '.ct-hand-pose--click', 'ct-hand-pose ct-hand-pose--click');
  injectHandSvg(handRightEl, 'images/mano%20der%20click.svg', 'handrc-', '.ct-hand-pose--click', 'ct-hand-pose ct-hand-pose--click');

  // Flash the click pose for ~160ms — the hand "taps" whatever it's pointing at.
  function playHandClick(handEl) {
    if (!handEl || !handEl.querySelector('.ct-hand-pose--click')) return;
    handEl.classList.add('is-clicking');
    clearTimeout(handEl._clickTimer);
    handEl._clickTimer = setTimeout(() => handEl.classList.remove('is-clicking'), 160);
  }

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
    // Tap: flash the click pose when pressing a field/button the hand points at.
    form.addEventListener('pointerdown', (e) => {
      if (targetFor(e.target)) playHandClick(handLeftEl);
    });

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

      // Cockpit entrance overlaps the landscape build: the container glitches
      // in while #lines, #colors and #holo are all class-hidden. The glitch
      // runs in a sub-timeline so it can sit at an absolute position while
      // the background tweens keep appending sequentially after it.
      const HOLO_AT = 0.1;
      const holoTl = gsap.timeline({ defaults: { ease: 'none' } });
      glitchIn(holoTl, '.ct-cockpit', 0);
      tl.add(holoTl, HOLO_AT);

      // Cockpit build: the teal wireframe fades in first, then the color art
      // underneath, then the lines settle back to their original colors, and
      // finally the blue holo windshield beam reveals last — all while the
      // landscape finishes behind.
      const holoEnd = HOLO_AT + holoTl.duration();
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-hide-lines'),
              null, holoEnd + 0.3);
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-no-colors'),
              null, holoEnd + 1.3);
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-lines-teal'),
              null, holoEnd + 2.6);
      tl.call(() => cockpitEl && cockpitEl.classList.remove('ct-hide-holo'),
              null, holoEnd + 3.6);

      // Content entrance (fade + form-part stagger + glitch + title) is appended
      // after the landscape/cockpit build so it reveals last. Factored out so a
      // contact nav-button click can replay it on its own — see
      // replayContentEntrance().
      appendContentEntrance(tl, '+=0.08');

    }, section);
  }

  /* Builds the form/content entrance onto a timeline. Shared by the first-run
     bootScene (sequenced after the scene) and by standalone nav re-entry.
     `contentAt` positions where the .ct-content fade starts. */
  function appendContentEntrance(tl, contentAt) {
    // Hide title letters from t=0 so they don't flash before their drop-in.
    // (The button's chars are handled via autoAlpha on the button itself.)
    tl.set('.ct-stack .ct-stack-char', { opacity: 0 }, 0);

    tl.fromTo('.ct-content',
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      contentAt
    );

    // Per-letter glitch scramble on the form text (NEW_MESSAGE, field labels,
    // send) as the content reveals. Skipped under reduced motion so the text
    // just appears statically. See contact.css.
    tl.call(() => {
      if (motionOk()) section.classList.add('ct-glitch-in');
    }, null, '<');

    // Assemble the form piece by piece: header → fields → send → links. Done in
    // GSAP (not CSS) so the form stays visible if GSAP never loads; under
    // reduced motion the parts simply ride the .ct-content fade above.
    if (motionOk()) {
      const formParts = section.querySelectorAll(
        '.ct-form-head, .ct-form-grid .ct-field, .ct-form-foot, .ct-links--mini'
      );
      tl.fromTo(formParts,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 },
        '<0.1'
      );
    }

    appendTitleReveal(tl);
  }

  /* Replays just the content entrance — the synthwave scene + cockpit stay put.
     Needed because bootScene is a one-shot (sceneBoot guard) and the section's
     IntersectionObserver never re-boots, so a nav-button click would otherwise
     land on a static, already-revealed form. On the very first visit it defers
     to bootScene so the scene builds too. */
  function replayContentEntrance() {
    if (typeof gsap === 'undefined') return;
    // We're navigating into the section: clear the off-screen .ct-paused guard
    // up front so its animation-play-state:paused doesn't freeze the glitch /
    // capsule keyframes at frame 0 before the IntersectionObserver catches up.
    section.classList.remove('ct-paused');
    if (!sceneBoot) { bootScene(); return; }
    // Re-arm the CSS-gated pieces (glitch text, capsule grow, DNA fade): drop
    // the gate class and flush a reflow so re-adding it restarts the keyframes.
    section.classList.remove('ct-glitch-in');
    void section.offsetWidth;
    gsap.context(() => {
      appendContentEntrance(gsap.timeline({ defaults: { ease: 'none' } }), 0);
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

  // Replay the entrance when the contact nav button is clicked. NavigationManager
  // dispatches app:navigate (before its instant scrollTo), and the general-rule
  // branch relies on "observer re-entry" that never fires for an already-booted
  // section — so we replay explicitly here, mirroring #art-direction's
  // App.playArtEntranceAnimation() hook. The section is in view a frame later,
  // so the timeline plays right as it lands.
  document.addEventListener('app:navigate', (e) => {
    if (e.detail && e.detail.sectionId === 'contact') replayContentEntrance();
  });

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

    /* TRANSPORT — no server backend yet, so the message is handed off to the
       visitor's mail client as a prefilled email to mail@sergio-ayala.com.
       Swap the body for e.g. fetch('/api/contact', …) once a mail backend exists. */
    const CONTACT_EMAIL = 'mail@sergio-ayala.com';
    function sendTransmission(payload) {
      const subject = `Portfolio contact — ${payload.name}`;
      const body =
        `Name: ${payload.name}\n` +
        `Email: ${payload.email}\n\n` +
        `${payload.message}\n`;
      const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      return wait(1000);
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

  /* Hover-to-glitch on every piece of text in the contact panel. Two modes,
     because the markup is mixed:
       (A) Already split into [data-char] glyphs (title, field labels, send) →
           replay the site's per-letter scramble via a none → glitch-switch
           restart. Self-contained (no GlitchSystem dependency); the global
           .glitch-firing CSS uses !important so it beats the .ct-glitch-in gate.
       (B) Plain text (BOGOTÁ ▸ WORLDWIDE feed, the > READY log line, the
           whatsapp/instagram/linkedin links) isn't split, so a lightweight
           character scramble decodes the text on hover without touching its
           markup or styling. */
  function initFormTextGlitch() {
    const section = document.getElementById('contact');
    if (!section) return;
    if (window.App && window.App.BrowserDetect && window.App.BrowserDetect.isTouch) return;

    const CHARS = (window.GLITCH_CHARS && window.GLITCH_CHARS.length)
      ? window.GLITCH_CHARS
      : '`¡™£¢∞§¶•ªºåß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>'.split('');

    // ── (A) per-letter restart on the split glitch-text elements ──────────
    const fire = el => {
      el.classList.add('glitch-suppressed');
      el.classList.remove('glitch-firing');
      void el.getBoundingClientRect();
      el.classList.add('glitch-firing');
    };
    // Attach unconditionally: Splitting.js (GlitchSystem.initSplitting) runs
    // later, inside LanguageManager.ready — AFTER this IIFE. So the [data-char]
    // glyphs don't exist yet at wire-up time; they do by the time the user
    // hovers, and fire() only toggles classes the global CSS keys off.
    section
      .querySelectorAll('.ct-form-title.glitch-text, .ct-field label.glitch-text, .ct-send.glitch-text')
      .forEach(el => {
        el.addEventListener('mouseenter', () => fire(el));
        el.addEventListener('mouseleave', () => el.classList.remove('glitch-firing'));
      });

    // ── (B) decode-scramble on the plain-text bits ────────────────────────
    const firstTextNode = el => {
      for (const n of el.childNodes) {
        if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) return n;
      }
      return null;
    };

    const attachScramble = el => {
      const node = firstTextNode(el);
      if (!node) return;
      const glyphs = Array.from(node.nodeValue);
      let timer = null;

      const restore = () => {
        if (timer) { clearInterval(timer); timer = null; }
        // Re-read the live original each time so the log line (which contact.js
        // rewrites) restores to whatever it currently says, not a stale capture.
        node.nodeValue = node._ctOriginal;
      };

      el.addEventListener('mouseenter', () => {
        if (timer) return;
        node._ctOriginal = node.nodeValue;
        const original = Array.from(node._ctOriginal);
        let step = 0;
        timer = setInterval(() => {
          step += 1;
          const settled = step * 1.6;            // glyphs lock in left-to-right
          node.nodeValue = original
            .map((c, i) => {
              if (c === ' ' || c === '\n' || c === '\t') return c;
              if (i < settled) return c;
              return CHARS[(Math.random() * CHARS.length) | 0];
            })
            .join('');
          if (settled >= original.length) restore();
        }, 28);
      });
      el.addEventListener('mouseleave', restore);
    };

    section
      .querySelectorAll('.ct-form-feed, .ct-log-text, .ct-links--mini .ct-link')
      .forEach(attachScramble);
  }

  initFormTextGlitch();
})();
