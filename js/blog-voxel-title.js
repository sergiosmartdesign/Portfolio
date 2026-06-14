/**
 * blog-voxel-title.js — isometric voxel wordmark band for the #blog masthead.
 *
 * Renders two wordmarks as chunky isometric pixel cubes and scrolls them in a
 * seamless right-to-left marquee:
 *   • "[ · Dijital | JunkWorks · ]" — the brand (full size, cool/teal palette)
 *   • "[ · blog · ]"                — half size, warm palette
 * Each glyph is a hand-authored 7-row bitmap; every filled pixel is drawn as a
 * small 3D cube (flat front face + sheared top & right faces) on a flat screen
 * grid, so the wordmarks read on a level horizontal baseline — legible — while
 * the per-pixel extrusion gives the isometric voxel look.
 *
 * Colour is assigned per-wordmark by glyph *role* (letter / bracket / dot), so
 * the same glyph can be one colour in "blog" and another in the brand.
 *
 * The masthead centre is a clipping viewport (overflow:hidden). JS paints a
 * "master" canvas per wordmark, then fills a flex track with repeated
 * [brand][blog] units — two identical halves with a uniform per-item gap baked
 * in px — and CSS translates the track 0 → -50% on an infinite loop, so the
 * -50% wrap is seamless (unit[N/2] lands exactly where unit[0] started).
 *
 * Pure canvas 2D, self-contained, CSP-safe (script-src 'self', no eval, no deps).
 * prefers-reduced-motion: a single static [brand][blog] unit, no scroll.
 */
(function () {
  'use strict';

  // ─── Geometry (device px in the canvas backing store; CSS scales for display).
  const STEP   = 40;   // grid cell (cube pitch)
  const FRONT  = 32;   // front-face square edge (STEP − FRONT = inter-cube gap)
  const DEPTH  = 12;   // isometric extrusion length (up-right at 45°)
  const GAP    = 2;    // empty columns between glyphs (even letter-spacing, both marks)
  const ROWS   = 7;    // bitmap height
  const MARGIN = DEPTH + 4; // padding around the wordmark

  // ─── Palette: project tokens only. f = front, t = top (lighter), r = right (darker).
  // Warm set (blog) and a contrasting cool set (brand); both read on paper #E9D8A6.
  const RUST   = { f: '#BB3E03', t: '#E2581A', r: '#7A2802' };
  const INK    = { f: '#070808', t: '#2A2A22', r: '#000000' };
  const ORANGE = { f: '#CA6702', t: '#EE8A28', r: '#8F4900' };
  const PETROL = { f: '#005F73', t: '#0A8090', r: '#00404D' };
  const TEAL   = { f: '#0A9396', t: '#4FB3A8', r: '#06636A' };
  const AMBER  = { f: '#EE9B00', t: '#FFC23D', r: '#B36F00' };

  // ─── Pixel font (7 rows tall; '#' = cube, '.' = empty). Colour is applied per
  //     wordmark, so glyphs carry geometry only. ─────────────────────────────
  const GLYPHS = {
    '[': ['##', '#.', '#.', '#.', '#.', '#.', '##'],
    ']': ['##', '.#', '.#', '.#', '.#', '.#', '##'],
    '|': ['#', '#', '#', '#', '#', '#', '#'],
    '.': ['..', '..', '..', '##', '##', '..', '..'], // mid-dot
    'b': ['#..', '#..', '##.', '#.#', '#.#', '#.#', '##.'],
    'l': ['#', '#', '#', '#', '#', '#', '#'],
    'o': ['...', '...', '###', '#.#', '#.#', '#.#', '###'],
    'g': ['...', '...', '###', '#.#', '###', '..#', '###'],
    'D': ['##.', '#.#', '#.#', '#.#', '#.#', '#.#', '##.'],
    'i': ['#', '.', '#', '#', '#', '#', '#'],
    't': ['.#.', '.#.', '###', '.#.', '.#.', '.#.', '.##'],
    'a': ['...', '...', '##.', '..#', '###', '#.#', '###'],
    'J': ['###', '..#', '..#', '..#', '..#', '#.#', '###'],
    'u': ['...', '...', '#.#', '#.#', '#.#', '#.#', '###'],
    'n': ['...', '...', '##.', '#.#', '#.#', '#.#', '#.#'],
    'k': ['#..', '#..', '#.#', '##.', '##.', '#.#', '#.#'],
    'W': ['#...#', '#...#', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
    'r': ['...', '...', '##.', '#.#', '#..', '#..', '#..'],
    's': ['...', '...', '###', '#..', '###', '..#', '###'],

    // ─── Pixel icons (7 rows; drawn as cubes like the letters) ───────────────
    'gear':     ['.#.#.#.', '.#####.', '##...##', '##...##', '##...##', '.#####.', '.#.#.#.'], // kitbash
    'chip':     ['.#...#.', '#######', '#.....#', '#.....#', '#.....#', '#######', '.#...#.'], // arduino
    'trash':    ['..###..', '#######', '.#####.', '.#.#.#.', '.#.#.#.', '.#.#.#.', '.#####.'], // trash bash
    'cassette': ['#########', '#.......#', '#.##.##.#', '#.##.##.#', '#.......#', '#########', '.#.....#.'], // 90s
    'pad':      ['.......', '.#####.', '#######', '#.#.#.#', '#######', '.#####.', '.......'],  // 90s gamepad
  };

  // ─── Wordmarks: glyph sequence + role→colour palette ───────────────────────
  const BLOG = {
    seq: ['[', '.', 'b', 'l', 'o', 'g', '.', ']'],
    palette: { letter: RUST, bracket: INK, dot: ORANGE },
  };
  const BRAND = {
    seq: ['[', '.', 'D', 'i', 'g', 'i', 't', 'a', 'l', '|',
          'J', 'u', 'n', 'k', 'W', 'o', 'r', 'k', 's', '.', ']'],
    palette: { letter: PETROL, bracket: TEAL, dot: AMBER },
  };

  // Icon strip: pixel icons referencing the brand's themes, each with its own
  // palette colour. Items are [glyphKey, colour]; mid-dots separate them.
  const ICONS = {
    seq: [
      ['gear', INK],     ['.', INK],   // kitbash
      ['chip', TEAL],    ['.', INK],   // arduino
      ['trash', RUST],   ['.', INK],   // trash bash
      ['cassette', AMBER], ['.', INK], // 90s pop culture
      ['pad', ORANGE],                 // 90s gamepad
    ],
    palette: null,
  };

  const roleOf = (ch) =>
    (ch === '[' || ch === ']' || ch === '|') ? 'bracket'
    : (ch === '.') ? 'dot'
    : 'letter';

  // ─── Compose a wordmark's glyph bitmaps into one flat (col,row) pixel grid ──
  function buildPixels(seq, palette) {
    const pixels = [];
    let xOffset = 0;
    let maxCol = 0;

    for (const item of seq) {
      const isPair = Array.isArray(item);          // [glyphKey, colour] (icons / explicit)
      const key    = isPair ? item[0] : item;      // plain char → palette by role
      const rows   = GLYPHS[key];
      if (!rows) continue;
      const w     = Math.max(...rows.map(r => r.length));
      const color = isPair ? item[1] : palette[roleOf(item)];

      rows.forEach((line, row) => {
        for (let gx = 0; gx < line.length; gx++) {
          if (line[gx] === '#') {
            const col = xOffset + gx;
            pixels.push({ col, row, color });
            if (col > maxCol) maxCol = col;
          }
        }
      });
      xOffset += w + GAP;
    }
    return { pixels, maxCol };
  }

  // ─── Draw a wordmark into a given canvas (returns false if nothing to draw) ─
  function paintInto(cv, seq, palette) {
    const { pixels, maxCol } = buildPixels(seq, palette);
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

  // ─── Marquee state ─────────────────────────────────────────────────────────
  // Several stacked rows of the same content, each at its own speed/direction.
  // Under the masthead's isometric tilt they read as parallel diagonal lines.
  const LINES = [
    { speed: 58, reverse: false },
    { speed: 96, reverse: true  },
    { speed: 42, reverse: false },
  ];

  let band        = null;   // column of marquee rows
  let masterBrand = null;   // painted brand canvas (full size)
  let masterIcons = null;   // painted icon strip (full size)
  let masterBlog  = null;   // painted blog canvas (half size)
  let center      = null;   // clipping viewport (.blog-masthead__center)

  function cloneCanvas(master, gap) {
    const cv = document.createElement('canvas');
    cv.className = master.className;          // carries size class(es)
    cv.setAttribute('aria-hidden', 'true');  // decorative duplicate of a labelled master
    cv.width  = master.width;
    cv.height = master.height;
    cv.style.marginInlineEnd = gap + 'px';
    cv.getContext('2d').drawImage(master, 0, 0);
    return cv;
  }

  // Build every row. Row 0 reuses the painted masters (so the labelled originals
  // stay in the DOM and are measurable); the other rows are clones. Each row is
  // two identical halves + a uniform per-item gap, so its -50% wrap is seamless.
  function build(reduced) {
    band.replaceChildren();
    const cfgs = reduced ? LINES.slice(0, 1) : LINES;   // reduced motion → one static row

    const tracks = cfgs.map((cfg) => {
      const t = document.createElement('div');
      t.className = 'blog-voxel-marquee' + (cfg.reverse ? ' is-reverse' : '');
      band.appendChild(t);
      return t;
    });

    // Masters into row 0 as its first unit → measurable.
    tracks[0].append(masterBrand, masterIcons, masterBlog);

    const brandW = masterBrand.getBoundingClientRect().width;
    const iconsW = masterIcons.getBoundingClientRect().width;
    const blogW  = masterBlog.getBoundingClientRect().width;
    if (!brandW || !iconsW || !blogW) return;

    const gap = Math.round(brandW * 0.22);            // breathing space between marks
    masterBrand.style.marginInlineEnd = gap + 'px';
    masterIcons.style.marginInlineEnd = gap + 'px';
    masterBlog.style.marginInlineEnd  = gap + 'px';

    if (reduced) return; // single static row, no scroll (CSS disables the anim)

    const containerW   = center.clientWidth || (brandW + iconsW + blogW);
    const unitW        = brandW + iconsW + blogW + gap * 3; // [brand][icons][blog] + gaps
    const perHalfUnits = Math.max(1, Math.ceil(containerW / unitW) + 1);
    const totalUnits   = perHalfUnits * 2;                  // two identical halves

    cfgs.forEach((cfg, i) => {
      const track = tracks[i];
      for (let u = (i === 0 ? 1 : 0); u < totalUnits; u++) {
        track.appendChild(cloneCanvas(masterBrand, gap));
        track.appendChild(cloneCanvas(masterIcons, gap));
        track.appendChild(cloneCanvas(masterBlog, gap));
      }
      // One -50% step travels exactly one half-track; pace each row by its speed.
      track.style.animationDuration = ((perHalfUnits * unitW) / cfg.speed).toFixed(2) + 's';
      track.style.animationDelay    = (-(i * 3.1)).toFixed(2) + 's'; // desync row starts
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    masterBlog = document.querySelector('.blog-voxel');
    if (!masterBlog) return;
    center = masterBlog.closest('.blog-masthead__center') || masterBlog.parentElement;

    // Existing HTML canvas becomes the half-size "blog" mark.
    masterBlog.classList.add('blog-voxel--half');
    masterBlog.setAttribute('aria-label', 'blog');
    if (!paintInto(masterBlog, BLOG.seq, BLOG.palette)) return;

    // New full-size brand mark.
    masterBrand = document.createElement('canvas');
    masterBrand.className = 'blog-voxel';
    masterBrand.setAttribute('role', 'img');
    masterBrand.setAttribute('aria-label', 'Digital JunkWorks');
    paintInto(masterBrand, BRAND.seq, BRAND.palette);

    // Themed pixel-icon strip (kitbash, arduino, trash, 90s pop culture).
    masterIcons = document.createElement('canvas');
    masterIcons.className = 'blog-voxel';
    masterIcons.setAttribute('role', 'img');
    masterIcons.setAttribute('aria-label', 'kitbash, arduino, trash, 90s pop culture');
    paintInto(masterIcons, ICONS.seq, ICONS.palette);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    band = document.createElement('div');
    band.className = 'blog-voxel-band';
    center.insertBefore(band, masterBlog); // masters are moved into rows by build()

    let started = false;
    const reveal = () => requestAnimationFrame(() =>
      band.querySelectorAll('.blog-voxel-marquee').forEach((t) => t.classList.add('is-in')));

    const start = () => { build(reduce.matches); started = true; reveal(); };

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

    // Rebuild copy-count / pacing on resize so every row stays seamless and full.
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (!started) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { build(reduce.matches); reveal(); }, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
