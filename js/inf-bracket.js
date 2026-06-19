(function () {
  // selector: element to read left/width from
  // yRef: 'topline' → Y comes from .panel-line--top bottom; 'self' → Y comes from the element itself
  const TARGETS = {
    nav:   { selector: '.main-nav',        yRef: 'topline' },
    cta:   { selector: '.intro-work-cta',  yRef: 'self'    },
    sound: { selector: '.sound-btn',       yRef: 'topline' },
    lang:  { selector: '.language-toggle', yRef: 'topline' },
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

    const route = routeOrthogonal(ax, ay, bx, by);
    let pts;
    if (route && route.length) {
      const f = route[0], l = route[route.length - 1];
      // orthogonal stubs snapping the grid route to the exact A / B points
      pts = [[ax, ay], [f[0], ay], ...route, [l[0], by], [bx, by]];
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
