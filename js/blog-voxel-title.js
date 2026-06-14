/**
 * blog-voxel-title.js — isometric voxel wordmark for the #blog masthead.
 *
 * Renders the nav label "[ · b l o g · ]" as chunky isometric pixel cubes.
 * Each glyph is a hand-authored 7-row bitmap; every filled pixel is drawn as a
 * small 3D cube (flat front face + sheared top & right faces) on a flat screen
 * grid, so the wordmark reads on a level horizontal baseline — legible — while
 * the per-pixel extrusion gives the isometric voxel look.
 *
 * Why hand-rolled rather than obelisk.js: obelisk's camera is locked to a 2:1
 * ground projection, which makes any horizontal word cascade steeply down-right
 * — unbalanced for a centred masthead. Drawing the cubes ourselves keeps the
 * baseline flat and gives full control over shading, sizing and crispness.
 *
 * Pure canvas 2D, self-contained, CSP-safe (script-src 'self', no eval, no deps).
 * Exposes nothing global; self-initialises and reveals when the masthead scrolls
 * into view (respects prefers-reduced-motion via the CSS transition).
 */
(function () {
  'use strict';

  // ─── Geometry (device px in the canvas backing store; CSS scales for display).
  // Sized generously so the downscaled result stays crisp on HiDPI screens.
  const STEP  = 40;   // grid cell (cube pitch)
  const FRONT = 32;   // front-face square edge (STEP − FRONT = inter-cube gap)
  const DEPTH = 12;   // isometric extrusion length (up-right at 45°)
  const GAP   = 1;    // empty columns inserted between glyphs
  const ROWS  = 7;    // bitmap height
  const MARGIN = DEPTH + 4; // padding around the wordmark

  // Per-colour cube faces: f = front, t = top (lighter), r = right (darker).
  // Project palette only (front = token; top/right are tints of the same hue),
  // chosen to contrast on the paper (#E9D8A6) masthead band.
  const RUST   = { f: '#BB3E03', t: '#E2581A', r: '#7A2802' }; // letters — rust  (--b-rust)
  const INK    = { f: '#070808', t: '#2A2A22', r: '#000000' }; // brackets — ink  (--b-bg)
  const ORANGE = { f: '#CA6702', t: '#EE8A28', r: '#8F4900' }; // mid-dots — orange (--b-orange)

  // ─── Pixel font (7 rows tall; '#' = cube, '.' = empty) ─────────────────────
  const GLYPHS = {
    '[': { color: INK,    rows: ['##', '#.', '#.', '#.', '#.', '#.', '##'] },
    ']': { color: INK,    rows: ['##', '.#', '.#', '.#', '.#', '.#', '##'] },
    '.': { color: ORANGE, rows: ['..', '..', '..', '##', '##', '..', '..'] }, // mid-dot
    'b': { color: RUST,   rows: ['#..', '#..', '##.', '#.#', '#.#', '#.#', '##.'] },
    'l': { color: RUST,   rows: ['#', '#', '#', '#', '#', '#', '#'] },
    'o': { color: RUST,   rows: ['...', '...', '###', '#.#', '#.#', '#.#', '###'] },
    'g': { color: RUST,   rows: ['...', '...', '###', '#.#', '###', '..#', '###'] },
  };

  // Glyph order for "[ · b l o g · ]" — the source string's spaces are expressed
  // by the mid-dots plus inter-glyph gaps, so only drawing glyphs are listed.
  const SEQUENCE = ['[', '.', 'b', 'l', 'o', 'g', '.', ']'];

  const SPEED = 75;   // marquee scroll speed in CSS px/second

  // ─── Compose the glyph bitmaps into one flat (col,row) pixel grid ───────────
  function buildPixels() {
    const pixels = [];
    let xOffset = 0;
    let maxCol = 0;

    for (const ch of SEQUENCE) {
      const glyph = GLYPHS[ch];
      if (!glyph) continue;
      const w = Math.max(...glyph.rows.map(r => r.length));

      glyph.rows.forEach((line, row) => {
        for (let gx = 0; gx < line.length; gx++) {
          if (line[gx] === '#') {
            const col = xOffset + gx;
            pixels.push({ col, row, color: glyph.color });
            if (col > maxCol) maxCol = col;
          }
        }
      });
      xOffset += w + GAP;
    }
    return { pixels, maxCol };
  }

  // ─── Draw the wordmark into a given canvas (returns false if nothing to draw) ─
  function paintInto(cv) {
    const { pixels, maxCol } = buildPixels();
    if (!pixels.length) return false;

    cv.width  = (maxCol + 1) * STEP + MARGIN * 2;
    cv.height = ROWS * STEP + MARGIN * 2;
    const ctx = cv.getContext('2d');

    const ox = MARGIN;
    const oy = MARGIN + DEPTH; // headroom for the upward extrusion of the top row
    const dx = DEPTH, dy = -DEPTH;

    const quad = (pts, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
    };

    // Painter's order: top rows (farther) first, then downward; left→right.
    pixels.sort((a, b) => (a.row - b.row) || (a.col - b.col));

    for (const p of pixels) {
      const x0 = ox + p.col * STEP;
      const y0 = oy + p.row * STEP;
      const x1 = x0 + FRONT;
      const y1 = y0 + FRONT;
      const c = p.color;

      // top face (sheared up-right)
      quad([[x0, y0], [x1, y0], [x1 + dx, y0 + dy], [x0 + dx, y0 + dy]], c.t);
      // right face
      quad([[x1, y0], [x1, y1], [x1 + dx, y1 + dy], [x1 + dx, y0 + dy]], c.r);
      // front face
      ctx.fillStyle = c.f;
      ctx.fillRect(x0, y0, FRONT, FRONT);
    }

    return true;
  }

  // ─── Marquee builder ───────────────────────────────────────────────────────
  // Fills `track` with enough wordmark copies to seamlessly loop: two identical
  // halves, each wide enough to cover the viewport, with a uniform per-item gap
  // baked into every copy (so the -50% CSS wrap is gap-continuous).
  let track  = null;   // the scrolling flex track
  let master = null;   // the painted source canvas (track's first child)
  let center = null;   // clipping viewport (.blog-masthead__center)

  function build() {
    const itemW = master.getBoundingClientRect().width;
    if (!itemW) return;
    const containerW = center.clientWidth || itemW;
    const gap     = Math.round(itemW * 0.45);   // breathing space between repeats
    const perHalf = Math.max(2, Math.ceil(containerW / (itemW + gap)) + 1);
    const total   = perHalf * 2;

    // Reset to just the master, then (re)build the clones.
    while (track.children.length > 1) track.removeChild(track.lastChild);
    master.style.marginInlineEnd = gap + 'px';

    for (let i = 1; i < total; i++) {
      const cv = document.createElement('canvas');
      cv.className = 'blog-voxel';
      cv.setAttribute('aria-hidden', 'true');   // decorative duplicate of the labelled master
      cv.width  = master.width;
      cv.height = master.height;
      cv.style.marginInlineEnd = gap + 'px';
      cv.getContext('2d').drawImage(master, 0, 0);
      track.appendChild(cv);
    }

    // One full -50% step travels exactly one half-track; pace it by SPEED.
    track.style.animationDuration = ((perHalf * (itemW + gap)) / SPEED).toFixed(2) + 's';
  }

  // ─── Init: paint, then either a static title (reduced motion) or the band ───
  function init() {
    master = document.querySelector('.blog-voxel');
    if (!master) return;
    center = master.closest('.blog-masthead__center') || master.parentElement;
    if (!paintInto(master)) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Reduced motion: keep the single, centred, static wordmark (original behaviour).
    if (reduce.matches) {
      requestAnimationFrame(() => master.classList.add('is-in'));
      return;
    }

    // Wrap the master in the scrolling track.
    track = document.createElement('div');
    track.className = 'blog-voxel-marquee';
    center.insertBefore(track, master);
    track.appendChild(master);

    const start = () => {
      build();
      requestAnimationFrame(() => track.classList.add('is-in'));
    };

    if (!('IntersectionObserver' in window)) {
      start();
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { start(); obs.disconnect(); break; }
        }
      }, { threshold: 0.2 });
      io.observe(center);
    }

    // Rebuild copy-count / pacing on resize so the loop stays seamless and full.
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (!track.classList.contains('is-in')) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
