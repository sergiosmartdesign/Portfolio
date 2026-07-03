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
        const tagGroups = [];
        tagRows.forEach((paths, i) => {
          if (!paths.length) return;
          const g = document.createElementNS(SVG_NS, 'g');
          g.classList.add('id1-tag');
          g.style.setProperty('--tag-index', i);
          paths[0].parentNode.insertBefore(g, paths[0]);
          paths.forEach(p => g.appendChild(p));
          tagGroups[i] = g;
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

        // ── Alternate portraits ──────────────────────────────────────────
        // Hovering a tag row swaps the ID_character portrait for the row's
        // own illustration. Rows: 0 book reader · 1 guitar player ·
        // 2 certified tattoo artist · 3 freelancer · 4 time traveler.
        // Drop a file in and add one entry here when new artwork lands;
        // rows without an entry keep just the amber text hover.
        const ALT_CHARACTERS = {
          0: { name: 'book-reader',   url: 'images/reader.svg' },
          1: { name: 'guitar-player', url: 'images/guitar electric.svg' },
          2: { name: 'tattoo-artist', url: 'images/tattoo.svg' },
          3: { name: 'freelancer',    url: 'images/freelance.svg' },
          4: { name: 'time-traveler', url: 'images/time.svg' },
        };

        // ID_character's portrait frame rect in id1.svg user units —
        // alternates are contain-fitted and centered into this box.
        const FRAME = { x: 324, y: 13.6, w: 208.3, h: 312.5 };

        Object.entries(ALT_CHARACTERS).forEach(([rowIdx, conf]) => {
          const tagGroup = tagGroups[rowIdx];
          if (!tagGroup || !face) return;

          fetch(conf.url)
            .then(r => r.text())
            .then(text => {
              const altRoot = parser.parseFromString(text, 'image/svg+xml').documentElement;
              const vb = (altRoot.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
              if (vb.length !== 4 || vb.some(isNaN)) return;

              const s  = Math.min(FRAME.w / vb[2], FRAME.h / vb[3]);
              const tx = FRAME.x + (FRAME.w - vb[2] * s) / 2 - vb[0] * s;
              const ty = FRAME.y + (FRAME.h - vb[3] * s) / 2 - vb[1] * s;

              const altGroup = document.createElementNS(SVG_NS, 'g');
              altGroup.setAttribute('class', 'id1-alt');
              altGroup.setAttribute('data-alt', conf.name);
              altGroup.setAttribute('transform', `translate(${tx} ${ty}) scale(${s})`);
              Array.from(altRoot.childNodes).forEach(n =>
                altGroup.appendChild(document.importNode(n, true)));
              // Strip ids from imported artwork — avoids document collisions
              altGroup.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

              face.parentNode.insertBefore(altGroup, face.nextSibling);

              tagGroup.addEventListener('mouseenter', () => {
                svgElement.classList.add('id1-alt-on');
                altGroup.classList.add('id1-alt-active');
              });
              tagGroup.addEventListener('mouseleave', () => {
                svgElement.classList.remove('id1-alt-on');
                altGroup.classList.remove('id1-alt-active');
              });
            })
            .catch(err => console.error('[ID1 SVG] alt portrait failed:', conf.url, err));
        });

        _setupID1Observer();
      })
      .catch(error => console.error('[ID1 SVG] Error loading SVG:', error));
  }

  // Called internally after the SVG is injected.
  // #id1svg now lives in the top head beside the title; reveal it off #abouttitle
  // (its in-flow neighbour) so the trigger can't be pushed off-screen by the
  // badge's own size. Chrome's IntersectionObserver clips to the `overflow: clip`
  // boundary, so a stable in-flow proxy is still used rather than the badge itself.
  function _setupID1Observer() {
    const id1svg = document.getElementById('id1svg');
    if (!id1svg) return;

    // Phones (match the responsive.css breakpoint, never the UA flag): the
    // badge and the scroll hint each hide only once 50% OF THE ELEMENT ITSELF
    // is out of the viewport (owner request 2026-07-01). The desktop proxy
    // below keys off #abouttitle, which exits too eagerly on the tall phone
    // column. Observing the elements directly is safe here: the phone #about
    // layout keeps both in normal flow inside the section box, so the
    // overflow:clip caveat (see desktop comment) never clips them.
    if (window.matchMedia('(max-width: 768px)').matches) {
      const halfVisibleToggle = (watchEl, targets, withExit) => {
        let entered = false;
        new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.intersectionRatio >= 0.5) {
              entered = true;
              targets.forEach(t => {
                t.classList.remove('element-exit');
                t.classList.add('element-visible');
              });
            } else if (entered) {
              targets.forEach(t => {
                t.classList.remove('element-visible');
                if (withExit) t.classList.add('element-exit');
              });
            }
          });
        }, { threshold: 0.5 }).observe(watchEl);
      };

      // Badge: element-exit drives its slideUpFade out (styles.css).
      halfVisibleToggle(id1svg, [id1svg], true);

      // Scroll hint (text + chevrons) moves as ONE unit keyed to the arrow —
      // its own observer, decoupled from the badge chain (responsive.css
      // re-keys the reveal to the hint's own class on phones). No exit class:
      // base opacity:0 + the 0.45s transition handles the fade-out.
      const arrow  = document.querySelector('#about .about-id-arrow');
      const scroll = document.querySelector('#about .about-id-scroll');
      if (arrow) halfVisibleToggle(arrow, [arrow, scroll].filter(Boolean), false);
      return;
    }

    const proxyEl =
      document.getElementById('abouttitle') ||
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

  // ── skills.svg — inline conversion + per-row entrance (all viewports) ───
  // (owner request 2026-07-03: entrance like id1's, each element appearing;
  // extended from phones to desktop the same day.)
  // The graphic is an Illustrator export with outlined text: two anonymous
  // top-level <g> columns holding one <path> per glyph, no per-line grouping.
  // Rows are recovered geometrically — cluster each column's direct children
  // by the y of their path's first M command (rows sit ≥7 user units apart;
  // first-point spread within a row is <3.5) — then wrapped in <g
  // class="skills-row"> with a global top-down --row-index across BOTH
  // columns, so the stagger reads as one cascade down the card (desktop
  // cascade CSS in styles.css, phone twin in responsive.css). On any
  // fetch/parse failure the <img> stays and the stock container fade
  // still reveals the full graphic.
  function convertSkillsSvgToInline() {
    const imgElement = document.querySelector('.decoration-skills .skills-svg');
    if (!imgElement || imgElement.tagName !== 'IMG') return;

    fetch(imgElement.src)
      .then(response => response.text())
      .then(data => {
        const svgElement = new DOMParser()
          .parseFromString(data, 'image/svg+xml').documentElement;
        const SVG_ID = 'skillssvg';

        // Same collision hygiene as the id1 conversion: prefix internal ids
        // (Layer_2 is shared across Illustrator exports) and scope the .stN
        // stylesheet before it becomes document-global.
        svgElement.querySelectorAll('[id]').forEach(el =>
          el.setAttribute('id', 'skills-' + el.getAttribute('id')));
        svgElement.querySelectorAll('style').forEach(styleEl => {
          styleEl.textContent = styleEl.textContent
            .replace(/\.st(\d+)\b/g, `#${SVG_ID} .st$1`);
        });
        svgElement.setAttribute('id', SVG_ID);
        svgElement.setAttribute('class', imgElement.className + ' skills-anim');
        svgElement.setAttribute('role', 'img');
        if (imgElement.alt) svgElement.setAttribute('aria-label', imgElement.alt);

        // Named parts: orange card bg first, then the [·Skills·] sidebar
        // (dark column + glyphs) with its full-height rule line.
        const card = svgElement.querySelector('path.st1');
        if (card) card.classList.add('skills-card');
        const sideLine = svgElement.querySelector('line.st3');
        if (sideLine) sideLine.classList.add('skills-side');
        const sideGroup = svgElement.querySelector('#skills-skills');
        if (sideGroup) sideGroup.classList.add('skills-side');

        const firstMY = node => {
          const d = node.tagName === 'path'
            ? node.getAttribute('d')
            : (node.querySelector('path') || { getAttribute: () => '' }).getAttribute('d');
          const m = /^M([\d.-]+)[,\s]([\d.-]+)/.exec(d || '');
          return m ? parseFloat(m[2]) : null;
        };

        const rows = [];
        svgElement.querySelectorAll(':scope > g:not([id])').forEach(column => {
          let current = null;
          Array.from(column.children)
            .map(node => ({ node, y: firstMY(node) }))
            .filter(k => k.y !== null)
            .sort((a, b) => a.y - b.y)
            .forEach(k => {
              if (!current || k.y - current.lastY > 3.5) {
                current = { y0: k.y, lastY: k.y, nodes: [] };
                rows.push(current);
              }
              current.lastY = k.y;
              current.nodes.push(k.node);
            });
        });
        rows.sort((a, b) => a.y0 - b.y0);
        const SVG_NS = 'http://www.w3.org/2000/svg';
        rows.forEach((row, i) => {
          const g = document.createElementNS(SVG_NS, 'g');
          g.setAttribute('class', 'skills-row');
          g.style.setProperty('--row-index', i);
          row.nodes[0].parentNode.insertBefore(g, row.nodes[0]);
          row.nodes.forEach(n => g.appendChild(n));
        });

        imgElement.parentNode.replaceChild(svgElement, imgElement);
        // Flags the container so responsive.css hands the reveal over to the
        // per-part stagger (container paints immediately; parts are hidden
        // until its element-visible arrives from the script.js observer).
        svgElement.closest('.decoration-skills').classList.add('skills-inline');
      })
      .catch(error => console.error('[Skills SVG] Error loading SVG:', error));
  }

  window.convertID1SvgToInline = convertID1SvgToInline;
  window.convertSkillsSvgToInline = convertSkillsSvgToInline;
}());
