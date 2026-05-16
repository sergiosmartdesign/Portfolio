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
  const label   = document.getElementById('inf-bracket-label');

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

  // ── Show / hide ─────────────────────────────────────────────────────────
  function show(hint) {
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

    bracket.style.left = `${Math.round(rect.left)}px`;
    bracket.style.top  = `${Math.round(yRect.bottom + GAP)}px`;
    // Force animation restart: remove, reflow, add
    bracket.classList.remove('visible');
    void bracket.getBoundingClientRect();
    bracket.classList.add('visible');
  }

  function hide() {
    bracket.classList.remove('visible');
  }

  document.querySelectorAll('.inf-hotspot').forEach(spot => {
    spot.addEventListener('mouseenter', () => show(spot.dataset.hint));
    spot.addEventListener('mouseleave', hide);
  });
})();
