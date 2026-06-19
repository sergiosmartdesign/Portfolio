/* Illustration snake-leader — amber vintage-Snake connector from each "how to
   explore" info-SVG row to the gallery control it describes. Adapted from the
   intro version in js/inf-bracket.js (same A* orthogonal router + pixel-snake
   renderer); kept standalone so the working intro logic stays untouched. */
(function () {
  const illus = document.getElementById('illustration');
  if (!illus) return;
  const infoSvg = illus.querySelector('.illus-info-svg');
  const svg     = document.getElementById('illus-snake');
  const track   = document.getElementById('illus-snake-track');
  const body    = document.getElementById('illus-snake-body');
  const head    = document.getElementById('illus-snake-head');
  if (!infoSvg || !svg || !track || !body || !head) return;

  // Each how-to row → the control it points at. Row 01 (SCROLL) shows no snake;
  // it reveals the bracketed scroll cue instead (CSS, see illus-snake.css).
  const ROWS = [
    // avoidOver: block everything above that element so the snake routes UNDER it.
    // (.illus-scene is a full-viewport wrapper — the actual cube is .illus-cube.)
    { sel: '#ilsv-row-02', target: '.illus-cta', avoidOver: '.illus-cube' }, // ENTER → button, under the cube
    { sel: '#ilsv-row-03', between: ['.illus-cta-back', '.illus-cta'], avoidOver: '.illus-cube' }, // BACK/NEXT → the gap between the two buttons, under the cube
    { sel: '#ilsv-row-04', target: '.illus-expand-hint', avoidOver: '.illus-cube' }, // THE IMAGE → "click to expand" message under the cube
  ];

  const REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CELL      = 20;   // grid resolution
  const OB_MARGIN = 14;   // obstacle inflation
  const TURN_COST = 4;    // penalty per 90° turn → fewer corners
  const OBSTACLE_SEL = ['.illus-info-svg'];   // don't route back over the panel
  let   snakeRaf = null;

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  // ── A* orthogonal router ────────────────────────────────────────────────────
  function routeOrthogonal(ax, ay, bx, by, extraBlocks) {
    const Wv = window.innerWidth, Hv = window.innerHeight;
    const cols = Math.ceil(Wv / CELL), rows = Math.ceil(Hv / CELL);
    const blocked = new Uint8Array(cols * rows);
    const idx = (cx, cy) => cy * cols + cx;
    const cX = x => clamp(Math.floor(x / CELL), 0, cols - 1);
    const cY = y => clamp(Math.floor(y / CELL), 0, rows - 1);
    const blockRect = (left, top, right, bottom) => {
      const x0 = cX(left), x1 = cX(right), y0 = cY(top), y1 = cY(bottom);
      for (let cy = y0; cy <= y1; cy++)
        for (let cx = x0; cx <= x1; cx++) blocked[idx(cx, cy)] = 1;
    };

    OBSTACLE_SEL.forEach(sel => {
      illus.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        blockRect(r.left - OB_MARGIN, r.top - OB_MARGIN, r.right + OB_MARGIN, r.bottom + OB_MARGIN);
      });
    });
    (extraBlocks || []).forEach(r => blockRect(r.left, r.top, r.right, r.bottom));

    const sCx = cX(ax), sCy = cY(ay), eCx = cX(bx), eCy = cY(by);
    const freeHalo = (cx, cy) => {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) blocked[idx(nx, ny)] = 0;
        }
    };
    freeHalo(sCx, sCy); freeHalo(eCx, eCy);

    const start = idx(sCx, sCy), end = idx(eCx, eCy);
    const DX = [0, 0, 0, -1, 1], DY = [0, -1, 1, 0, 0];
    const key = (cell, dir) => cell * 5 + dir;
    const hOf = cell => Math.abs((cell % cols) - eCx) + Math.abs(((cell / cols) | 0) - eCy);

    const gScore = new Map(), came = new Map();
    const heap = [];
    const push = (f, cell, dir) => {
      heap.push({ f, cell, dir });
      let i = heap.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (heap[p].f <= heap[i].f) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last; let i = 0; const n = heap.length;
        for (;;) { const l = 2*i+1, r = 2*i+2; let m = i;
          if (l < n && heap[l].f < heap[m].f) m = l;
          if (r < n && heap[r].f < heap[m].f) m = r;
          if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; }
      }
      return top;
    };

    gScore.set(key(start, 0), 0);
    push(hOf(start), start, 0);
    let found = null;
    while (heap.length) {
      const cur = pop();
      if (cur.cell === end) { found = cur; break; }
      const ck = key(cur.cell, cur.dir);
      const cg = gScore.get(ck);
      if (cg === undefined || cur.f - hOf(cur.cell) > cg) continue;
      const cx = cur.cell % cols, cy = (cur.cell / cols) | 0;
      for (let d = 1; d <= 4; d++) {
        const nx = cx + DX[d], ny = cy + DY[d];
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const ncell = idx(nx, ny);
        if (blocked[ncell]) continue;
        const turn = (cur.dir !== 0 && cur.dir !== d) ? TURN_COST : 0;
        const ng = cg + 1 + turn, nk = key(ncell, d), prev = gScore.get(nk);
        if (prev === undefined || ng < prev) {
          gScore.set(nk, ng); came.set(nk, ck);
          push(ng + hOf(ncell), ncell, d);
        }
      }
    }
    if (!found) return null;

    const cells = [];
    let k = key(found.cell, found.dir);
    while (k !== undefined) { cells.push((k / 5) | 0); k = came.get(k); }
    cells.reverse();
    return cells.map(c => [ (c % cols) * CELL + CELL / 2, ((c / cols) | 0) * CELL + CELL / 2 ]);
  }

  function simplify(pts) {
    const out = [];
    for (const q of pts) {
      const p = out[out.length - 1];
      if (p && p[0] === q[0] && p[1] === q[1]) continue;
      out.push(q);
    }
    let i = 1;
    while (i < out.length - 1) {
      const a = out[i - 1], b = out[i], c = out[i + 1];
      if ((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1])) out.splice(i, 1);
      else i++;
    }
    return out;
  }

  // ── Show / hide ─────────────────────────────────────────────────────────────
  function show(rowEl, cfg) {
    let t;
    if (cfg.between) {
      // aim at the gap between two elements in the active card (BACK | NEXT)
      const a = illus.querySelector('.illus-section.active ' + cfg.between[0]);
      const b = illus.querySelector('.illus-section.active ' + cfg.between[1]);
      if (!a || !b) { hide(); return; }
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      if (!ra.width || !rb.width) { hide(); return; }
      const lft = ra.left <= rb.left ? ra : rb, rgt = ra.left <= rb.left ? rb : ra;
      const gx = (lft.right + rgt.left) / 2;                          // horizontal centre of the gap
      const gy = (ra.top + ra.bottom + rb.top + rb.bottom) / 4;       // shared vertical centre
      t = { left: gx - 2, right: gx + 2, top: gy - 2, bottom: gy + 2, width: 4, height: 4 };
    } else {
      const target = illus.querySelector(cfg.target);
      if (!target) { hide(); return; }
      t = target.getBoundingClientRect();
    }
    const sv = infoSvg.getBoundingClientRect();
    if (!t.width || !sv.width) { hide(); return; }
    // bail if either end is off-screen (gallery scrolled away)
    if (t.bottom < 0 || t.top > window.innerHeight ||
        sv.bottom < 0 || sv.top > window.innerHeight) { hide(); return; }

    const r  = rowEl.getBoundingClientRect();
    const tx = t.left + t.width / 2, ty = t.top + t.height / 2;
    const pcx = (sv.left + sv.right) / 2, pcy = (sv.top + sv.bottom) / 2;

    // Emerge from the panel edge facing the target; ride the row's height when
    // exiting sideways, the row's x when exiting top/bottom.
    let ax, ay;
    if (Math.abs(tx - pcx) >= Math.abs(ty - pcy)) {
      ax = tx < pcx ? sv.left : sv.right;
      ay = clamp(r.top + r.height / 2, sv.top + 4, sv.bottom - 4);
    } else {
      ay = ty < pcy ? sv.top : sv.bottom;
      ax = clamp(r.left + r.width / 2, sv.left + 4, sv.right - 4);
    }
    // Land on the point of the target nearest the emergence point
    const bx = clamp(ax, t.left, t.right);
    const by = clamp(ay, t.top, t.bottom);

    // avoidOver: block the whole column above the cube (top of viewport → cube
    // bottom) so the snake is forced to route UNDER it, not over it. The cube is
    // 3D-rotated, so its bbox is unreliable — use its true square footprint
    // (untransformed --s size, centred in the viewport by the flex .illus-scene).
    const extraBlocks = [];
    if (cfg.avoidOver) {
      const over = illus.querySelector(cfg.avoidOver);
      const size = over && (over.offsetWidth || over.getBoundingClientRect().width);
      if (size) {
        const half = size / 2;
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        extraBlocks.push({ left: cx - half - OB_MARGIN, top: 0, right: cx + half + OB_MARGIN, bottom: cy + half + OB_MARGIN });
      }
    }

    const route = routeOrthogonal(ax, ay, bx, by, extraBlocks);
    let pts;
    if (route && route.length) {
      const f = route[0], l = route[route.length - 1];
      pts = [[ax, ay], [f[0], ay], ...route, [l[0], by], [bx, by]];
    } else {
      pts = [[ax, ay], [ax, by], [bx, by]];
    }
    const d = simplify(pts)
      .map((p, i) => `${i ? 'L' : 'M'} ${Math.round(p[0])} ${Math.round(p[1])}`)
      .join(' ');

    track.setAttribute('d', d);
    body.setAttribute('d', d);
    if (snakeRaf) { cancelAnimationFrame(snakeRaf); snakeRaf = null; }
    svg.classList.remove('visible');
    void svg.getBoundingClientRect();
    svg.classList.add('visible');

    // Body = chain of square pixels; final gap = full route length so only one
    // body is on the path at a time.
    const len = Math.ceil(body.getTotalLength());
    const SEG = 5, GAP = 4, SEGS = 24;
    const bodyLen = SEG * SEGS + GAP * (SEGS - 1);
    const dash = [];
    for (let i = 0; i < SEGS; i++) dash.push(SEG, i < SEGS - 1 ? GAP : len);
    body.style.strokeDasharray = dash.join(' ');

    const placeHead = (front) => {
      const fr = clamp(front, 0, len);
      const p  = body.getPointAtLength(fr);
      const p2 = body.getPointAtLength(Math.min(len, fr + 1));
      const ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
      head.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`);
    };

    if (REDUCED) {
      body.style.strokeDashoffset = `${-(len - bodyLen)}`;
      placeHead(len);
      head.style.opacity = '1';
      return;
    }

    const period = bodyLen + len;
    const dur    = Math.min(3600, Math.max(1500, Math.round(len / 0.4)));
    const start  = performance.now();
    const frame = (now) => {
      const g = ((now - start) % dur) / dur;
      const offset = bodyLen - g * period;
      body.style.strokeDashoffset = offset;
      const front = bodyLen - offset;
      if (front <= len) { placeHead(front); head.style.opacity = '1'; }
      else { head.style.opacity = '0'; }
      snakeRaf = requestAnimationFrame(frame);
    };
    snakeRaf = requestAnimationFrame(frame);
  }

  function hide() {
    svg.classList.remove('visible');
    if (snakeRaf) { cancelAnimationFrame(snakeRaf); snakeRaf = null; }
    head.style.opacity = '0';
  }

  // ── Two info-panel layouts ──────────────────────────────────────────────────
  // Intro / stop-0 (default): 01 SCROLL · 02 click ENTER   (rows 03/04 hidden via CSS)
  // Gallery (an image shown):  01 SCROLL · 02 BACK/NEXT · 03 THE IMAGE
  //   → drop the ENTER row, shift rows 03/04 up one slot (45 units) and renumber.
  const tunnel = illus.querySelector('.illus-tunnel');
  if (tunnel) {
    const n3 = infoSvg.querySelector('#ilsv-row-03 .ilsv-num');
    const n4 = infoSvg.querySelector('#ilsv-row-04 .ilsv-num');
    const r3 = infoSvg.querySelector('#ilsv-row-03');
    const r4 = infoSvg.querySelector('#ilsv-row-04');
    const SHIFT = 'translate(0 -45)';   // one row height in the 200×257 viewBox
    const sync = () => {
      const inGallery = tunnel.classList.contains('illus-info-revealed') &&
                        !tunnel.classList.contains('illus-stop-zero');
      illus.classList.toggle('illus-gallery-mode', inGallery);
      if (n3) n3.textContent = inGallery ? '· 02 ·' : '· 03 ·';
      if (n4) n4.textContent = inGallery ? '· 03 ·' : '· 04 ·';
      [r3, r4].forEach(r => {
        if (!r) return;
        if (inGallery) r.setAttribute('transform', SHIFT);
        else r.removeAttribute('transform');
      });
    };
    new MutationObserver(sync).observe(tunnel, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  // ── Wire each row (pointer only — desktop gallery) ──────────────────────────
  if (window.matchMedia('(hover: none)').matches) return;
  ROWS.forEach(cfg => {
    const rowEl = infoSvg.querySelector(cfg.sel);
    if (!rowEl) return;
    rowEl.style.cursor = 'pointer';
    rowEl.addEventListener('mouseenter', () => show(rowEl, cfg));
    rowEl.addEventListener('mouseleave', hide);
  });
})();
