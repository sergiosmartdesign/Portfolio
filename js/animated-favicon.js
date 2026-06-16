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
