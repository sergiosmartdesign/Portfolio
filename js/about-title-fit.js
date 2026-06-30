/* about-title-fit.js — phone only.
 *
 * Scales the #about "·Hello! I'm Sergio Ayala·" title so its widest line fills
 * the available width of the hero column, left to right. The per-line offsets
 * are expressed in em (responsive.css) so the stacked composition scales with
 * the font-size we set here.
 *
 * Desktop stays byte-for-byte identical: the effect is gated on the ≤768px
 * media query, so on desktop fit() bails before touching any style.
 */
(function () {
  function init() {
    const title = document.getElementById('abouttitle');
    if (!title) return;

    const intro = title.closest('.about-intro') || title.parentElement;
    const lines = title.querySelectorAll(
      '.title-line-1, .title-line-2, .title-line-3, .title-line-4'
    );
    if (!intro || !lines.length) return;

    const mq = window.matchMedia('(max-width: 768px)');

    const fit = () => {
      // Desktop / tablet ≥769px: never touch the title (keep it identical).
      if (!mq.matches) {
        title.style.fontSize = '';
        return;
      }
      const avail = intro.clientWidth;
      if (!avail) return;

      // Measure natural line widths at the CSS base size (font-size:'' resets to it).
      title.style.fontSize = '';
      const base = parseFloat(getComputedStyle(title).fontSize) || 64;
      let widest = 0;
      lines.forEach((l) => { widest = Math.max(widest, l.scrollWidth); });
      if (!widest) return;

      // 0.98 keeps the dots/exclamation overhang a hair inside the edges.
      title.style.fontSize = (base * (avail / widest) * 0.98) + 'px';
    };

    fit();
    // Webfont swap (Funnel Display) changes metrics → refit once it lands.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(fit, 150); };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    // i18n swaps the title text → its width changes → refit.
    window.addEventListener('languagechanged', fit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
