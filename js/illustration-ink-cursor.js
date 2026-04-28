/**
 * Ink cursor effect for the #illustration section.
 * Matches the reference goo cursor mechanics (Eder Anaya, 2018) with
 * portfolio-palette colours and scoped activation via IntersectionObserver.
 * Activates with a fresh random colour each time the section enters view.
 */
(function () {
  'use strict';

  // ── Constants matching the reference exactly ─────────────────────────────────
  const AMOUNT     = 20;
  const SINE_DOTS  = Math.floor(AMOUNT * 0.3);   // 6
  const WIDTH      = 26;                          // dot diameter in px
  const LERP       = 0.35;
  const IDLE_MS    = 150;
  const FILTER_ID  = 'ink-goo-filter';
  const CURSOR_ID  = 'ink-cursor';

  // Portfolio palette — colours with contrast against the #003847 section bg
  const PALETTE = [
    '#94D2BD',  // mint
    '#E9D8A6',  // warm cream
    '#EE9B00',  // amber
    '#CA6702',  // orange-brown
    '#BB3E03',  // rust
    '#AE2012',  // dark red
    '#9B2226',  // deep red
    '#00ffff',  // cyan
  ];

  function pickColor() {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }

  // ── SVG goo filter — reference values ────────────────────────────────────────
  function injectFilter() {
    if (document.getElementById(FILTER_ID)) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('version', '1.1');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    svg.innerHTML = `
      <defs>
        <filter id="${FILTER_ID}">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
            result="goo"/>
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
      </defs>`;
    document.body.appendChild(svg);
  }

  // ── Dot ──────────────────────────────────────────────────────────────────────
  class Dot {
    constructor(index, container) {
      this.index      = index;
      this.x          = 0;
      this.y          = 0;
      // reference formula exactly
      this.scale      = 1 - 0.05 * index;
      this.range      = WIDTH / 2 - (WIDTH / 2) * this.scale + 2;
      this.angleSpeed = 0.05;
      this.angleX     = Math.PI * 2 * Math.random();
      this.angleY     = Math.PI * 2 * Math.random();
      this.lockX      = 0;
      this.lockY      = 0;

      // All dots same DOM size; scale applied via CSS transform so the goo
      // filter sees uniform-radius blobs and merges them correctly
      this.el = document.createElement('span');
      this.el.style.cssText =
        'position:absolute;display:block;' +
        `width:${WIDTH}px;height:${WIDTH}px;` +
        'border-radius:50%;' +
        'transform-origin:center center;' +
        'will-change:transform;';
      container.appendChild(this.el);
    }

    setColor(color) {
      this.el.style.background = color;
    }

    lock() {
      this.lockX  = this.x;
      this.lockY  = this.y;
      this.angleX = Math.PI * 2 * Math.random();
      this.angleY = Math.PI * 2 * Math.random();
    }

    draw(idle) {
      if (idle && this.index > SINE_DOTS) {
        this.angleX += this.angleSpeed;
        this.angleY += this.angleSpeed;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
      }
      // translate positions the dot; scale is applied in-place around its centre
      this.el.style.transform =
        `translate(${this.x}px,${this.y}px) scale(${this.scale})`;
    }
  }

  // ── Main controller ──────────────────────────────────────────────────────────
  class IllustrationInkCursor {
    constructor() {
      this.section   = document.getElementById('illustration');
      if (!this.section) return;

      this.active    = false;
      this.idle      = false;
      this.dots      = [];
      this.mouse     = { x: 0, y: 0 };
      this.rafId     = null;
      this.idleTimer = null;
      this.container = null;

      injectFilter();
      this._buildContainer();
      this._buildDots();
      this._observe();
    }

    _buildContainer() {
      this.container = document.createElement('div');
      this.container.id = CURSOR_ID;
      // mix-blend-mode:difference makes the ink invert whatever is beneath it,
      // matching the reference's visual style; filter applies the goo merge
      this.container.style.cssText =
        'pointer-events:none;' +
        'position:fixed;top:0;left:0;width:0;height:0;' +
        `z-index:9999;` +
        `filter:url(#${FILTER_ID});` +
        'mix-blend-mode:difference;' +
        'display:none;';
      document.body.appendChild(this.container);
    }

    _buildDots() {
      for (let i = 0; i < AMOUNT; i++) {
        this.dots.push(new Dot(i, this.container));
      }
    }

    _applyColor(color) {
      this.dots.forEach(d => d.setColor(color));
    }

    _observe() {
      // #illustration is 600 vh — max intersectionRatio ≈ 0.167, so threshold:0.5
      // can never fire on the section itself. The sticky .illus-tunnel child is
      // always 100 vh in the viewport during scroll, so it reaches ratio 1.0.
      const target = this.section.querySelector('.illus-tunnel') || this.section;
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.intersectionRatio >= 0.5) {
              this._activate();
            } else {
              this._deactivate();
            }
          });
        },
        { threshold: [0, 0.5, 1.0] }
      );
      observer.observe(target);
    }

    _activate() {
      if (this.active) return;
      this.active = true;
      this._applyColor(pickColor());
      this.container.style.display = 'block';
      this._onMove = e => this._handleMove(e.clientX, e.clientY);
      window.addEventListener('mousemove', this._onMove, { passive: true });
      this._startIdleTimer();
      this.rafId = requestAnimationFrame(() => this._frame());
    }

    _deactivate() {
      if (!this.active) return;
      this.active = false;
      this.container.style.display = 'none';
      window.removeEventListener('mousemove', this._onMove);
      clearTimeout(this.idleTimer);
      if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    }

    _handleMove(cx, cy) {
      this.mouse.x = cx - WIDTH / 2;
      this.mouse.y = cy - WIDTH / 2;
      this._resetIdleTimer();
    }

    _startIdleTimer() {
      this.idleTimer = setTimeout(() => {
        this.idle = true;
        this.dots.forEach(d => d.lock());
      }, IDLE_MS);
    }

    _resetIdleTimer() {
      clearTimeout(this.idleTimer);
      this.idle = false;
      this._startIdleTimer();
    }

    _frame() {
      if (!this.active) return;
      let x = this.mouse.x;
      let y = this.mouse.y;
      this.dots.forEach((dot, i, arr) => {
        const next = arr[i + 1] || arr[0];
        dot.x = x;
        dot.y = y;
        dot.draw(this.idle);
        if (!this.idle || i <= SINE_DOTS) {
          const dx = (next.x - dot.x) * LERP;
          const dy = (next.y - dot.y) * LERP;
          x += dx;
          y += dy;
        }
      });
      this.rafId = requestAnimationFrame(() => this._frame());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new IllustrationInkCursor());
  } else {
    new IllustrationInkCursor();
  }
})();
