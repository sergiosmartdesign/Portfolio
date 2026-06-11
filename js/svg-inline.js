/**
 * svg-inline.js — converts an <img id="id1svg"> tag to an inline <svg>,
 * prefixes all internal IDs to avoid document-level collisions, and sets up
 * an IntersectionObserver to drive entrance/exit animation classes.
 *
 * Chrome-specific fixes applied:
 *   - ID prefix `id1-` prevents duplicate-ID bugs with shared gradient IDs.
 *   - xlink:href → href conversion for gradient inheritance in Chrome 79+.
 */
(function () {
  'use strict';

  function convertID1SvgToInline() {
    const imgElement = document.getElementById('id1svg');
    if (!imgElement) return;

    const imgURL = imgElement.src;

    fetch(imgURL)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Prefix all internal IDs to prevent conflicts with existing document IDs
        // (e.g. id="Layer_1-2" is shared with the DNA capsule SVG).
        const ID_PREFIX = 'id1-';
        const idMap = {};
        svgElement.querySelectorAll('[id]').forEach(el => {
          const oldId = el.getAttribute('id');
          const newId = ID_PREFIX + oldId;
          idMap[oldId] = newId;
          el.setAttribute('id', newId);
        });

        // Update url(#...) references in presentation attributes
        const rewriteUrlAttr = (el, attrName) => {
          const val = el.getAttribute(attrName);
          if (!val) return;
          const next = val.replace(/url\(#([^)]+)\)/g, (_, id) =>
            `url(#${idMap[id] || id})`
          );
          if (next !== val) el.setAttribute(attrName, next);
        };
        svgElement.querySelectorAll('[fill]').forEach(el => rewriteUrlAttr(el, 'fill'));
        svgElement.querySelectorAll('[stroke]').forEach(el => rewriteUrlAttr(el, 'stroke'));
        svgElement.querySelectorAll('[clip-path]').forEach(el => rewriteUrlAttr(el, 'clip-path'));
        svgElement.querySelectorAll('[filter]').forEach(el => rewriteUrlAttr(el, 'filter'));
        svgElement.querySelectorAll('[mask]').forEach(el => rewriteUrlAttr(el, 'mask'));

        // The current Illustrator export applies gradient fills via a <style>
        // block (.st0 { fill: url(#radial-gradient); }) instead of fill
        // attributes — rewrite url(#...) there too, and scope the generic .stN
        // selectors so they can't collide with other inline SVGs once this
        // stylesheet becomes document-global.
        svgElement.querySelectorAll('style').forEach(styleEl => {
          styleEl.textContent = styleEl.textContent
            .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${idMap[id] || id})`)
            .replace(/\.st(\d+)\b/g, `#${imgElement.id} .st$1`);
        });

        // Convert deprecated xlink:href → href for gradient inheritance in Chrome 79+.
        const XLINK_NS = 'http://www.w3.org/1999/xlink';
        svgElement.querySelectorAll('*').forEach(el => {
          const xlinkHref = el.getAttributeNS(XLINK_NS, 'href');
          if (xlinkHref !== null) {
            const refId = xlinkHref.startsWith('#') ? xlinkHref.slice(1) : null;
            const resolved = refId && idMap[refId] ? `#${idMap[refId]}` : xlinkHref;
            el.setAttribute('href', resolved);
            el.removeAttributeNS(XLINK_NS, 'href');
          }
        });

        // Copy identity attributes from the original <img>
        svgElement.setAttribute('id', imgElement.id);
        if (imgElement.className) svgElement.setAttribute('class', imgElement.className);

        // Add animation classes to internal elements. Selectors match the
        // current Illustrator export: coords rounded to 1 decimal, character
        // group named ID_character, outer card frame has no id (matched by
        // its path data instead).
        const border      = svgElement.querySelector('path[d^="M10.5,239.4"]');
        const face        = svgElement.querySelector(`#${ID_PREFIX}ID_character`);
        const hexagons    = svgElement.querySelectorAll('polygon[points*="39.4 "], polygon[points*="77.8 "], polygon[points*="116.4 "], polygon[points*="154.3 "]');
        const circles     = svgElement.querySelectorAll('circle[cx="27.6"], circle[cx="66"], circle[cx="104.6"]');
        const sideCircles = svgElement.querySelectorAll('circle[cx="49.3"]');
        const stars       = svgElement.querySelectorAll('polygon[points*="442.2 "], polygon[points*="410.1 "], polygon[points*="377.9 "], polygon[points*="345.3 "], polygon[points*="506.5 "], polygon[points*="474.8 "]');
        const rects       = svgElement.querySelectorAll('rect');

        if (border) border.classList.add('id1-border');
        if (face)   face.classList.add('id1-face');
        hexagons.forEach((hex, i)  => { hex.classList.add('id1-hexagon');     hex.style.setProperty('--hex-index', i); });
        circles.forEach((c, i)     => { c.classList.add('id1-circle');         c.style.setProperty('--circle-index', i); });
        sideCircles.forEach((c, i) => { c.classList.add('id1-side-circle');    c.style.setProperty('--side-circle-index', i); });
        stars.forEach((s, i)       => { s.classList.add('id1-star');           s.style.setProperty('--star-index', i); });
        rects.forEach((r, i)       => { r.classList.add('id1-rect');           r.style.setProperty('--rect-index', i); });

        // Group the five role/hobby text rows (outlined glyph paths in five
        // y-bands beside the side circles, x 60–300) into <g class="id1-tag">
        // wrappers so each row is a single hoverable element. Paths within a
        // row are contiguous siblings, so wrapping preserves paint order.
        const SVG_NS    = 'http://www.w3.org/2000/svg';
        const TAG_BANDS = [[200, 217], [230, 245], [259, 273], [286, 301], [315, 330]];
        const tagRows   = TAG_BANDS.map(() => []);
        svgElement.querySelectorAll('path.st18').forEach(p => {
          const m = /^M([\d.]+),([\d.]+)/.exec(p.getAttribute('d') || '');
          if (!m) return;
          const x = parseFloat(m[1]);
          const y = parseFloat(m[2]);
          if (x < 60 || x > 300) return;
          const band = TAG_BANDS.findIndex(([y0, y1]) => y >= y0 && y <= y1);
          if (band !== -1) tagRows[band].push(p);
        });
        tagRows.forEach((paths, i) => {
          if (!paths.length) return;
          const g = document.createElementNS(SVG_NS, 'g');
          g.classList.add('id1-tag');
          g.style.setProperty('--tag-index', i);
          paths[0].parentNode.insertBefore(g, paths[0]);
          paths.forEach(p => g.appendChild(p));
        });

        imgElement.parentNode.replaceChild(svgElement, imgElement);

        // Transparent hit-area rect behind each tag row — the hover target
        // becomes the full row box, not just the thin glyph strokes.
        // getBBox() needs a rendered element, hence after insertion + rAF.
        requestAnimationFrame(() => {
          svgElement.querySelectorAll('g.id1-tag').forEach(g => {
            try {
              const b   = g.getBBox();
              const hit = document.createElementNS(SVG_NS, 'rect');
              hit.setAttribute('class', 'id1-tag-hit');
              hit.setAttribute('x',      b.x - 5);
              hit.setAttribute('y',      b.y - 4);
              hit.setAttribute('width',  b.width + 10);
              hit.setAttribute('height', b.height + 8);
              g.insertBefore(hit, g.firstChild);
            } catch (e) { /* not rendered yet — row stays glyph-hover only */ }
          });
        });

        _setupID1Observer();
      })
      .catch(error => console.error('[ID1 SVG] Error loading SVG:', error));
  }

  // Called internally after the SVG is injected.
  // #id1svg is offset far outside #about's layout — observe a stable in-flow proxy
  // (#about-availability) instead, because Chrome's IntersectionObserver clips to
  // the `overflow: clip` boundary and the element would never intersect otherwise.
  function _setupID1Observer() {
    const id1svg = document.getElementById('id1svg');
    if (!id1svg) return;

    const proxyEl =
      document.getElementById('about-availability') ||
      document.getElementById('about');
    if (!proxyEl) return;

    let id1Entered = false;
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          id1Entered = true;
          id1svg.classList.remove('element-exit');
          id1svg.classList.add('element-visible');
        } else if (id1Entered) {
          id1svg.classList.remove('element-visible');
          id1svg.classList.add('element-exit');
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }).observe(proxyEl);
  }

  window.convertID1SvgToInline = convertID1SvgToInline;
}());
