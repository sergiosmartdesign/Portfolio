/**
 * static-line.js — animated canvas "electric static" line factory.
 *
 * makeStaticLine(canvasEl, opts) → { show, hide }
 *   shadow: bool    — draw ctx shadowColor/Blur (false = rely on CSS filter)
 *   throttleEvery: n — keep 1-in-n RAF frames; 1 = no throttle (~60fps)
 *   resizeDebounce: ms — debounce canvas resize (0 = immediate)
 *
 * bindSectionEdge(canvasEl, line, sectionEl, edge)
 *   Wires a line to the top or bottom edge of a section while that edge is
 *   within the visible viewport, hiding it 150 ms after scroll stops.
 */
(function () {
  'use strict';

  function makeStaticLine(canvasEl, {
    shadow = true,
    throttleEvery = 1,
    resizeDebounce = 0,
    vertical = false,        // true → vertical line (4px wide, full viewport height)
  } = {}) {
    const ctx = canvasEl.getContext('2d');
    let animId = null;
    let frameCount = 0;
    let resizeTimer = null;

    const sizeCanvas = () => {
      if (vertical) { canvasEl.width = 4;                 canvasEl.height = window.innerHeight; }
      else          { canvasEl.width = window.innerWidth; canvasEl.height = 4; }
    };
    const resize = () => {
      if (resizeDebounce > 0) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sizeCanvas, resizeDebounce);
      } else {
        sizeCanvas();
      }
    };
    sizeCanvas();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (throttleEvery > 1 && ++frameCount % throttleEvery !== 0) return;

      const w = canvasEl.width;
      const h = canvasEl.height;
      ctx.clearRect(0, 0, w, h);

      // Main cyan jitter trace + a sparser white sparkle pass. A vertical line
      // walks Y and jitters X around the centre axis (w/2); horizontal walks X
      // and jitters Y around h/2.
      const cx = w / 2, cy = h / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#0ef';
      ctx.lineWidth   = 1.5;
      if (shadow) { ctx.shadowColor = '#0ef'; ctx.shadowBlur = 6; }
      if (vertical) {
        ctx.moveTo(cx, 0);
        for (let y = 0; y < h; y += 3) ctx.lineTo(cx + (Math.random() - 0.5) * w * 2, y);
      } else {
        ctx.moveTo(0, cy);
        for (let x = 0; x < w; x += 3) ctx.lineTo(x, cy + (Math.random() - 0.5) * h * 2);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth   = 1;
      if (shadow) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 3; }
      if (vertical) {
        for (let y = 0; y < h; y += 3) {
          if (Math.random() > 0.7) ctx.lineTo(cx + (Math.random() - 0.5) * w, y);
          else                     ctx.moveTo(cx, y);
        }
      } else {
        for (let x = 0; x < w; x += 3) {
          if (Math.random() > 0.7) ctx.lineTo(x, cy + (Math.random() - 0.5) * h);
          else                     ctx.moveTo(x, cy);
        }
      }
      ctx.stroke();
    };

    const show = () => {
      canvasEl.classList.add('active');
      if (!animId) { frameCount = 0; draw(); }
    };

    const hide = () => {
      canvasEl.classList.remove('active');
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    };

    return { show, hide };
  }

  function bindSectionEdge(canvasEl, line, sectionEl, edge) {
    if (!sectionEl) return;
    edge = edge || 'bottom';
    let scrollTimeout = null;
    const update = () => {
      const rect = sectionEl.getBoundingClientRect();
      const pos  = edge === 'bottom' ? rect.bottom : rect.top;
      if (pos > 4 && pos < window.innerHeight - 4) {
        canvasEl.style.top = `${pos - 2}px`;
        line.show();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => line.hide(), 150);
      } else {
        line.hide();
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  window.makeStaticLine  = makeStaticLine;
  window.bindSectionEdge = bindSectionEdge;
}());
