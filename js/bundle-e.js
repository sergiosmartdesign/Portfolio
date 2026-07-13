/* bundle-e.js — concatenated app bundle (load order preserved). Sources in git history. */

;
/* ===== inf-bracket.js ===== */
(function () {
  // selector: element to read left/width from
  // yRef: 'topline' → Y comes from .panel-line--top bottom; 'self' → Y comes from the element itself
  const TARGETS = {
    nav:   { selector: '.main-nav',        yRef: 'topline' },
    cta:   { selector: '.intro-work-cta',  yRef: 'self'    },
    // sound + lang anchor to the control itself → bracket sits just below the
    // button. approach:'right' forces the snake to travel right along the bottom
    // first, then climb to the control, instead of shooting straight to the top.
    sound: { selector: '.sound-btn',       yRef: 'self', approach: 'right' },
    lang:  { selector: '.language-toggle', yRef: 'self', approach: 'right' },
    // 'scroll' intentionally omitted — handled by the scroll-hint clone
  };

  // Each word as an array: [char, isBold] pairs. Dots are dim, letters bold.
  const LABEL_CHARS = {
    en: [['·',false],['h',true],['e',true],['r',true],['e',true],['·',false]],
    es: [['·',false],['a',true],['q',true],['u',true],['í',true],['·',false]],
  };

  const topLineEl = document.querySelector('.panel-line--top');

  const ARM_H    = 16;  // height of vertical arms
  const CAP_W    = 10;  // length of horizontal caps at arm tops
  const NUB_D    = 9;   // depth of center nub below arm baseline
  const NUB_R    = 5;   // curve radius at nub
  const CORNER_R = 5;   // curve radius at bottom corners
  const GAP      = 10;  // px gap between element bottom and bracket top

  const CHEV_HW  = 10;  // chevron half-width
  const CHEV_D   = 8;   // chevron depth (height of V)
  const CHEV_GAP = 4;   // gap from nub tip to first chevron
  const CHEV_SP  = 9;   // spacing between the two chevrons (start-to-start)

  const NUB_TIP  = ARM_H + NUB_D;
  const SVG_H    = NUB_TIP + CHEV_GAP + CHEV_SP + CHEV_D + 4;
  const LABEL_Y  = SVG_H + 14; // below second chevron base

  const bracket = document.getElementById('inf-bracket');
  const svg     = document.getElementById('inf-bracket-svg');
  const path    = document.getElementById('inf-bracket-path');
  const chev1   = document.getElementById('inf-bracket-chev1');
  const chev2   = document.getElementById('inf-bracket-chev2');
  const label     = document.getElementById('inf-bracket-label');
  const leaderSvg = document.getElementById('inf-leader');
  const ldTrack   = document.getElementById('inf-leader-track');
  const ldSnake   = document.getElementById('inf-leader-snake');
  const ldHead    = document.getElementById('inf-leader-head');
  let   snakeRaf  = null;

  if (!bracket || !svg || !path || !chev1 || !chev2) return;

  // ── Language sync — mirrors info SVG lang loop ──────────────────────────
  let currentLang = 'en';

  function applyLabelChars(lang) {
    if (!label) return;
    const spans = label.querySelectorAll('.ibl');
    const chars = LABEL_CHARS[lang] || LABEL_CHARS.en;
    spans.forEach((sp, i) => {
      if (!chars[i]) return;
      sp.textContent = chars[i][0];
      sp.setAttribute('font-weight', chars[i][1] ? 'bold' : 'normal');
    });
  }

  function setLang(lang) {
    if (lang === currentLang || !label) return;
    currentLang = lang;
    label.classList.remove('lang-flicker');
    void label.getBoundingClientRect();
    label.classList.add('lang-flicker');
    applyLabelChars(lang);
  }

  const esGroup = document.getElementById('inf-es');
  if (esGroup) {
    new MutationObserver(() => {
      setLang(esGroup.style.display === 'none' ? 'en' : 'es');
    }).observe(esGroup, { attributes: true, attributeFilter: ['style'] });
  }

  // ── SVG path builders ───────────────────────────────────────────────────
  function buildPath(W) {
    const mid = W / 2;
    return [
      `M ${CAP_W},0`,
      `L 0,0`,
      `L 0,${ARM_H - CORNER_R}`,
      `Q 0,${ARM_H} ${CORNER_R},${ARM_H}`,
      `L ${mid - NUB_R},${ARM_H}`,
      `Q ${mid},${ARM_H} ${mid},${NUB_TIP}`,
      `Q ${mid},${ARM_H} ${mid + NUB_R},${ARM_H}`,
      `L ${W - CORNER_R},${ARM_H}`,
      `Q ${W},${ARM_H} ${W},${ARM_H - CORNER_R}`,
      `L ${W},0`,
      `L ${W - CAP_W},0`,
    ].join(' ');
  }

  // tip at top (startY), base at startY + CHEV_D → chevron points upward
  function chevPoints(cx, startY) {
    return `${cx - CHEV_HW},${startY + CHEV_D} ${cx},${startY} ${cx + CHEV_HW},${startY + CHEV_D}`;
  }

  // ── Leader line — orthogonal "snake" router ─────────────────────────────────
  // Connects the right edge of the hovered card line (A) to the bracket's
  // here/aquí caption (B) with right-angle segments only, pathfinding around
  // the hero content (A* on a coarse grid, with a turn penalty so it prefers
  // long straight runs). All coords in viewport px.
  const REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CELL      = 20;   // grid resolution
  const OB_MARGIN = 14;   // obstacle inflation (keep clear of content)
  const TURN_COST = 4;    // penalty per 90° turn → fewer, cleaner corners
  const OBSTACLE_SEL = [
    '#main-title', '.intro-otw-link', '.intro-work-cta',
    '.social-media-icons', '.info-interface',
  ];

  function routeOrthogonal(ax, ay, bx, by) {
    const Wv = window.innerWidth, Hv = window.innerHeight;
    const cols = Math.ceil(Wv / CELL), rows = Math.ceil(Hv / CELL);
    const blocked = new Uint8Array(cols * rows);
    const idx   = (cx, cy) => cy * cols + cx;
    const clamp = (v, max) => (v < 0 ? 0 : v > max ? max : v);
    const cX = x => clamp(Math.floor(x / CELL), cols - 1);
    const cY = y => clamp(Math.floor(y / CELL), rows - 1);

    OBSTACLE_SEL.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x0 = cX(r.left - OB_MARGIN), x1 = cX(r.right + OB_MARGIN);
        const y0 = cY(r.top - OB_MARGIN),  y1 = cY(r.bottom + OB_MARGIN);
        for (let cy = y0; cy <= y1; cy++)
          for (let cx = x0; cx <= x1; cx++) blocked[idx(cx, cy)] = 1;
      });
    });

    const sCx = cX(ax), sCy = cY(ay), eCx = cX(bx), eCy = cY(by);
    // free a 3×3 halo around endpoints so A* can escape obstacle cells
    const freeHalo = (cx, cy) => {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) blocked[idx(nx, ny)] = 0;
        }
    };
    freeHalo(sCx, sCy); freeHalo(eCx, eCy);

    const start = idx(sCx, sCy), end = idx(eCx, eCy);
    const DX = [0, 0, 0, -1, 1], DY = [0, -1, 1, 0, 0];   // 0 none,1 up,2 down,3 left,4 right
    const key = (cell, dir) => cell * 5 + dir;
    const hOf = cell => Math.abs((cell % cols) - eCx) + Math.abs(((cell / cols) | 0) - eCy);

    const gScore = new Map(), came = new Map();
    const heap = [];                                       // min-heap on f
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
      if (cg === undefined || cur.f - hOf(cur.cell) > cg) continue;   // stale entry
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

  // collapse duplicate + collinear points so the path is pure right angles
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

  function drawLeader(hint, bLeft, bTop, W) {
    if (!leaderSvg || !ldTrack || !ldSnake || !ldHead) return;
    const srcGroup = document.getElementById('inf-' + currentLang);
    const src = srcGroup && srcGroup.querySelector(`[data-hint="${hint}"]`);
    if (!src) { hideLeader(); return; }
    const s = src.getBoundingClientRect();
    if (!s.width) { hideLeader(); return; }

    const ax = s.right;                 // emerge from the end of the glyphs
    const ay = s.top + s.height / 2;
    const bx = bLeft + W / 2;           // bracket caption is centred on the target
    const by = bTop + LABEL_Y - 6;      // land on the here/aquí caption

    // approach:'right' — the snake must visibly leave the panel heading RIGHT,
    // then climb to the control. The row sits inside the info panel (an A*
    // obstacle), so A* would otherwise escape upward first. Force a horizontal
    // exit past the panel's right edge, then pathfind right-along then up.
    const approach = (TARGETS[hint] || {}).approach;
    let route, startX = ax;
    if (approach === 'right') {
      const panel = document.querySelector('.info-interface');
      const panelRight = panel ? panel.getBoundingClientRect().right : ax;
      startX = Math.min(bx - CELL, panelRight + 30);   // clear of the panel
      const r1 = routeOrthogonal(startX, ay, bx, ay);  // run right
      const r2 = routeOrthogonal(bx, ay, bx, by);      // then climb
      route = (r1 && r2) ? r1.concat(r2)
            : routeOrthogonal(startX, ay, bx, by);     // fallback from exit point
    } else {
      route = routeOrthogonal(ax, ay, bx, by);
    }
    let pts;
    if (route && route.length) {
      const f = route[0], l = route[route.length - 1];
      // orthogonal stubs snapping the grid route to the exact A / B points;
      // [startX, ay] forces the rightward exit before any climb.
      pts = [[ax, ay], [startX, ay], [f[0], ay], ...route, [l[0], by], [bx, by]];
    } else {
      pts = [[ax, ay], [ax, by], [bx, by]];   // fallback L if fully walled off
    }
    const d = simplify(pts)
      .map((p, i) => `${i ? 'L' : 'M'} ${Math.round(p[0])} ${Math.round(p[1])}`)
      .join(' ');

    ldTrack.setAttribute('d', d);
    ldSnake.setAttribute('d', d);
    if (snakeRaf) { cancelAnimationFrame(snakeRaf); snakeRaf = null; }
    leaderSvg.classList.remove('visible');
    void leaderSvg.getBoundingClientRect();
    leaderSvg.classList.add('visible');

    // Snake body = 24 square pixels (5px) with 4px gaps; final gap = full route
    // length so only one short body is ever on the path at a time.
    const len  = Math.ceil(ldSnake.getTotalLength());
    const SEG = 5, GAP = 4, SEGS = 24;
    const body = SEG * SEGS + GAP * (SEGS - 1);   // 68px
    const dash = [];
    for (let i = 0; i < SEGS; i++) dash.push(SEG, i < SEGS - 1 ? GAP : len);
    ldSnake.style.strokeDasharray = dash.join(' ');

    // Place the pixel head at distance `front` along the route, facing travel
    const placeHead = (front) => {
      const f = Math.max(0, Math.min(len, front));
      const p  = ldSnake.getPointAtLength(f);
      const p2 = ldSnake.getPointAtLength(Math.min(len, f + 1));
      const ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
      ldHead.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`);
    };

    if (REDUCED) {                                // parked at the bracket, no motion
      ldSnake.style.strokeDashoffset = `${-(len - body)}`;
      placeHead(len);
      ldHead.style.opacity = '1';
      return;
    }

    // One clock drives both: body offset body→-len (front 0→len+body), head
    // rides the leading edge while it's on the path, hides as the tail exits.
    const period = body + len;
    const dur    = Math.min(3600, Math.max(1500, Math.round(len / 0.4)));
    const start  = performance.now();
    const frame = (now) => {
      const g = ((now - start) % dur) / dur;
      const offset = body - g * period;
      ldSnake.style.strokeDashoffset = offset;
      const front = body - offset;                // = g * period
      if (front <= len) { placeHead(front); ldHead.style.opacity = '1'; }
      else { ldHead.style.opacity = '0'; }
      snakeRaf = requestAnimationFrame(frame);
    };
    snakeRaf = requestAnimationFrame(frame);
  }

  function hideLeader() {
    if (!leaderSvg) return;
    leaderSvg.classList.remove('visible');
    if (snakeRaf) { cancelAnimationFrame(snakeRaf); snakeRaf = null; }
    if (ldHead) ldHead.style.opacity = '0';
  }

  // ── Show / hide ─────────────────────────────────────────────────────────
  function show(hint) {
    hideLeader();
    const config = TARGETS[hint];
    if (!config) return;
    const target = document.querySelector(config.selector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const yEl   = config.yRef === 'topline' && topLineEl ? topLineEl : target;
    const yRect = yEl.getBoundingClientRect();
    const W     = Math.round(rect.width);
    const cx    = W / 2;

    svg.setAttribute('width',   W);
    svg.setAttribute('height',  SVG_H);
    svg.setAttribute('viewBox', `0 0 ${W} ${SVG_H}`);
    path.setAttribute('d', buildPath(W));

    const c1y = NUB_TIP + CHEV_GAP;
    const c2y = c1y + CHEV_SP;
    chev1.setAttribute('points', chevPoints(cx, c1y));
    chev2.setAttribute('points', chevPoints(cx, c2y));

    if (label) {
      label.setAttribute('x', cx);
      label.setAttribute('y', LABEL_Y);
      applyLabelChars(currentLang);
    }

    const bLeft = Math.round(rect.left);
    const bTop  = Math.round(yRect.bottom + GAP);
    bracket.style.left = `${bLeft}px`;
    bracket.style.top  = `${bTop}px`;
    // Force animation restart: remove, reflow, add
    bracket.classList.remove('visible');
    void bracket.getBoundingClientRect();
    bracket.classList.add('visible');

    drawLeader(hint, bLeft, bTop, W);
  }

  function hide() {
    bracket.classList.remove('visible');
    hideLeader();
  }

  document.querySelectorAll('.inf-hotspot').forEach(spot => {
    spot.addEventListener('mouseenter', () => show(spot.dataset.hint));
    spot.addEventListener('mouseleave', hide);
  });
})();


;
/* ===== illus-snake.js ===== */
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


;
/* ===== animated-favicon.js ===== */
/* ─────────────────────────────────────────────────────────────────────────
   Animated favicon — funnel-display "type-in" loop
   []  →  [··]  →  [·A·]  →  [·r·]  →  …  →  [·n·]  →  (loop)

   Canvas-rendered + favicon-href swap (the only animated-favicon technique
   with broad support). Throttled to STEP_MS, pauses on hidden tabs, and
   honours prefers-reduced-motion. Browsers that ignore dynamic favicons
   (notably iOS Safari) fall back to the static SVG icon in index.html.
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const WORD     = 'Art-Direction';       // ← edit to change the spelled-out word
  const SIZE     = 64;                     // canvas px (browser downscales to 16/32)
  const LETTER_MS = 520;                   // hold per letter (slow enough to read)
  const START_MS  = 800;                   // longer beat on the empty "[]" frame
  const DOTS_MS   = 420;                   // the "[··]" warm-up frame
  const END_MS    = 1100;                  // pause on the last letter before looping
  const BG       = '#001219';              // site dark teal
  const FG       = '#EE9B00';              // brand amber
  const FONT     = '"Funnel Display", sans-serif';

  // Frame sequence:  []  ·  [··]  ·  [·<letter>·] for each character.
  const frames = ['[]', '[··]'].concat(
    WORD.split('').map(function (ch) { return '[·' + ch + '·]'; })
  );

  // Safari (incl. iOS) reliably renders the favicon declared in the HTML at
  // parse time, but ignores/flakes on favicons swapped in dynamically by JS.
  // So leave its static SVG favicon ([·_·]) untouched and don't animate.
  var BD = window.App && window.App.BrowserDetect;
  if (BD && BD.isSafariBased()) return;

  const canvas  = document.createElement('canvas');
  canvas.width  = canvas.height = SIZE;
  const ctx     = canvas.getContext('2d');

  // One dedicated icon link; remove any others so the browser isn't ambiguous.
  function ensureLink() {
    document.querySelectorAll('link[rel~="icon"]').forEach(function (l) {
      if (l.dataset.animFav !== '1') l.remove();
    });
    let link = document.querySelector('link[data-anim-fav="1"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.dataset.animFav = '1';
      document.head.appendChild(link);
    }
    return link;
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function draw(link, text) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // rounded app-icon background
    ctx.fillStyle = BG;
    roundRect(ctx, 0, 0, SIZE, SIZE, SIZE * 0.22);
    ctx.fill();

    // fit text to width — short frames render big, longer frames shrink (funnel feel)
    const maxW = SIZE * 0.84;
    let fontSize = SIZE * 0.66;
    ctx.font = '800 ' + fontSize + 'px ' + FONT;
    const w = ctx.measureText(text).width;
    if (w > maxW) {
      fontSize *= maxW / w;
      ctx.font = '800 ' + fontSize + 'px ' + FONT;
    }

    ctx.fillStyle = FG;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, SIZE / 2, SIZE / 2 + fontSize * 0.04);

    link.href = canvas.toDataURL('image/png');
  }

  const link = ensureLink();
  let i = 0;
  let timer = null;

  // how long to hold each frame: long beat at the start, slow letters,
  // and a clear pause on the final letter before the loop restarts.
  function holdFor(index) {
    if (index === 0) return START_MS;               // "[]"
    if (index === 1) return DOTS_MS;                // "[··]"
    if (index === frames.length - 1) return END_MS; // last letter
    return LETTER_MS;                               // every other letter
  }

  function tick() {
    draw(link, frames[i]);
    const hold = holdFor(i);
    i = (i + 1) % frames.length;
    timer = setTimeout(tick, hold);
  }

  function start() {
    if (timer) return;
    tick();
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
  }

  function boot() {
    // reduced motion: draw a single static frame, never loop
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(link, '[·A·]');
      return;
    }
    start();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  }

  // wait for the display font so glyph metrics & shapes are correct
  if (document.fonts && document.fonts.load) {
    document.fonts.load('800 40px "Funnel Display"').then(boot, boot);
  } else {
    boot();
  }
})();

