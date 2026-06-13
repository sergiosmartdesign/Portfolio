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
  const AMBER  = { f: '#EE9B00', t: '#FFC23D', r: '#B36F00' }; // letters
  const ORANGE = { f: '#CA6702', t: '#EE8A28', r: '#8F4900' }; // brackets
  const PAPER  = { f: '#E9D8A6', t: '#F6ECCB', r: '#BCA877' }; // mid-dots

  // ─── Pixel font (7 rows tall; '#' = cube, '.' = empty) ─────────────────────
  const GLYPHS = {
    '[': { color: ORANGE, rows: ['##', '#.', '#.', '#.', '#.', '#.', '##'] },
    ']': { color: ORANGE, rows: ['##', '.#', '.#', '.#', '.#', '.#', '##'] },
    '.': { color: PAPER,  rows: ['..', '..', '..', '##', '##', '..', '..'] }, // mid-dot
    'b': { color: AMBER,  rows: ['#..', '#..', '##.', '#.#', '#.#', '#.#', '##.'] },
    'l': { color: AMBER,  rows: ['#', '#', '#', '#', '#', '#', '#'] },
    'o': { color: AMBER,  rows: ['...', '...', '###', '#.#', '#.#', '#.#', '###'] },
    'g': { color: AMBER,  rows: ['...', '...', '###', '#.#', '###', '..#', '###'] },
  };

  // Glyph order for "[ · b l o g · ]" — the source string's spaces are expressed
  // by the mid-dots plus inter-glyph gaps, so only drawing glyphs are listed.
  const SEQUENCE = ['[', '.', 'b', 'l', 'o', 'g', '.', ']'];

  let canvas = null;
  let rendered = false;

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

  // ─── Draw the wordmark into the visible canvas ─────────────────────────────
  function paint() {
    if (rendered || !canvas) return;
    const { pixels, maxCol } = buildPixels();
    if (!pixels.length) return;

    canvas.width  = (maxCol + 1) * STEP + MARGIN * 2;
    canvas.height = ROWS * STEP + MARGIN * 2;
    const ctx = canvas.getContext('2d');

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

    rendered = true;
  }

  // ─── Init: paint + reveal when the masthead enters the viewport ────────────
  function init() {
    canvas = document.querySelector('.blog-voxel');
    if (!canvas) return;

    const reveal = () => {
      paint();
      requestAnimationFrame(() => canvas.classList.add('is-in'));
    };

    if (!('IntersectionObserver' in window)) { reveal(); return; }

    const io = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          reveal();
          obs.disconnect();
          break;
        }
      }
    }, { threshold: 0.2 });
    io.observe(canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
