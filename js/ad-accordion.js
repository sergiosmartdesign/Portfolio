/* ad-accordion.js — PHONE-ONLY category accordion for #art-direction.
 *
 * Replaces the yellow DISCIPLINES SVG card on phones (owner 2026-07-04) with
 * an accordion modeled on the #photo desktop list. The category list simply
 * appears when the section goes live, each label decoded with the shared
 * window.scrambleText glitch (same as nav labels / paragraphs) — no auto
 * open/close cascade. Categories stay closed until tapped; expanding one lists
 * its WORKS_DATA projects; tapping a project opens the works modal (ADPanel).
 *
 * Fully gated on App.BrowserDetect.isMobile — on desktop this file builds
 * nothing and touches nothing. Styling lives in css/responsive.css (≤768px),
 * transparent backgrounds by design (unlike photo's dark plate).
 *
 * Depends on: art-direction-data.js (WORKS_DATA), art-direction-panel.js
 * (window.ADPanel), browser-detect.js, window.scrambleText (lib/scramble.js),
 * optional gsap + App.LanguageManager.
 */
(function () {
  'use strict';

  const DISCS = ['identity', 'web', 'editorial', '3d'];

  // Category button labels (owner 2026-07-04): fixed, language-neutral
  // discipline names in the authored casing. The wide spaced-out look is CSS
  // letter-spacing, not baked spaces, so screen readers still read the word.
  const CAT_LABELS = {
    identity: '· Identity ·',
    web: '· web ·',
    editorial: '· editorial ·',
    '3d': '· 3d & motion ·',
  };

  // ms between consecutive rows appearing when a category expands — slow
  // enough (owner 2026-07-04) that each line's glitch-in reads individually.
  const OPEN_ITEM_STEP = 130;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const t = key => window.App && App.LanguageManager && App.LanguageManager.translate
    ? App.LanguageManager.translate(key)
    : null;

  const workYear = work => {
    const spec = (work.specs || []).find(s => s[0] === 'Year');
    return spec ? spec[1] : '';
  };

  function init() {
    if (!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile)) return;
    const section = document.getElementById('art-direction');
    if (!section || typeof WORKS_DATA === 'undefined') return;
    const anchor = section.querySelector('.ad-explore-card');
    if (!anchor || section.querySelector('.ad-accordion')) return;

    // ── Build DOM ────────────────────────────────────────────────────────────
    const acc = document.createElement('div');
    acc.className = 'ad-accordion';
    acc.setAttribute('aria-label', 'Art direction project categories');

    const entries = []; // { disc, btn, list, items:[{el, work}] }

    DISCS.forEach(disc => {
      const works = WORKS_DATA[disc] || [];
      if (!works.length) return;

      const item = document.createElement('div');
      item.className = 'ad-accordion-item';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'adacc-btn';
      btn.dataset.discipline = disc;
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="adacc-btn-label"></span><span class="adacc-btn-indicator" aria-hidden="true"></span>';

      const list = document.createElement('ul');
      list.className = 'adacc-list';
      list.dataset.discipline = disc;
      list.setAttribute('role', 'list');

      const items = works.map(work => {
        const li = document.createElement('li');
        li.className = 'adacc-item';
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.innerHTML =
          '<span class="adacc-num"></span>' +
          '<span class="adacc-titles"><span class="adacc-title"></span>' +
          '<span class="adacc-sub"></span></span>' +
          '<span class="adacc-year"></span>';
        li.querySelector('.adacc-num').textContent = work.num;
        li.querySelector('.adacc-year').textContent = workYear(work);
        list.appendChild(li);
        return { el: li, work };
      });

      item.appendChild(btn);
      item.appendChild(list);
      acc.appendChild(item);
      entries.push({ disc, btn, list, items });
    });

    anchor.parentNode.insertBefore(acc, anchor);

    // ── i18n — per-project title/sub refreshed on language switch; the
    //    category label itself is fixed (CAT_LABELS), same in both locales ──
    const fillTexts = () => {
      entries.forEach(({ disc, btn, items }) => {
        btn.querySelector('.adacc-btn-label').textContent = CAT_LABELS[disc];
        items.forEach(({ el, work }) => {
          el.querySelector('.adacc-title').textContent =
            t(`ad.${disc}.${work.num}.title`) || work.title;
          el.querySelector('.adacc-sub').textContent =
            t(`ad.${disc}.${work.num}.sub`) || work.sub || '';
        });
      });
    };
    fillTexts();
    document.addEventListener('languagechanged', fillTexts);

    // ── Open / close ─────────────────────────────────────────────────────────
    const showItem = (el, delayMs) => {
      if (reducedMotion.matches || !window.gsap) {
        el.style.opacity = '1';
        return;
      }
      gsap.killTweensOf(el);
      gsap.to(el, {
        delay: delayMs / 1000,
        keyframes: [
          { opacity: 1,    duration: 0.06, ease: 'none' },
          { opacity: 0.12, duration: 0.05, ease: 'none' },
          { opacity: 0.9,  duration: 0.06, ease: 'none' },
          { opacity: 0.3,  duration: 0.04, ease: 'none' },
          { opacity: 1,    duration: 0.07, ease: 'none' },
        ],
      });
    };

    // Same flicker as showItem but resolving to 0 — used to play the open
    // reveal in reverse when a category closes (owner 2026-07-04).
    const hideItemGlitch = (el, delayMs) => {
      if (reducedMotion.matches || !window.gsap) {
        el.style.opacity = '0';
        return;
      }
      gsap.killTweensOf(el);
      gsap.to(el, {
        delay: delayMs / 1000,
        keyframes: [
          { opacity: 0.3,  duration: 0.07, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.12, duration: 0.06, ease: 'none' },
          { opacity: 0.6,  duration: 0.05, ease: 'none' },
          { opacity: 0,    duration: 0.06, ease: 'none' },
        ],
      });
    };

    const openEntry = (entry, itemStepMs) => {
      clearTimeout(entry.closeTimer);
      entry.closing = false;
      entry.btn.classList.add('active');
      entry.btn.setAttribute('aria-expanded', 'true');
      entry.list.style.display = 'flex';
      entry.items.forEach(({ el }, i) => showItem(el, i * itemStepMs));
    };

    const closeEntry = (entry, immediate) => {
      if (immediate) {
        clearTimeout(entry.closeTimer);
        entry.closing = false;
        entry.btn.classList.remove('active');
        entry.btn.setAttribute('aria-expanded', 'false');
        entry.items.forEach(({ el }) => { if (window.gsap) gsap.killTweensOf(el); el.style.opacity = '0'; });
        entry.list.style.display = 'none';
        return;
      }
      // Reverse of the open reveal: the rows glitch out bottom-to-top with the
      // same per-row step, then the category collapses.
      entry.closing = true;
      const n = entry.items.length;
      entry.items.forEach(({ el }, i) => hideItemGlitch(el, (n - 1 - i) * OPEN_ITEM_STEP));
      const total = (n - 1) * OPEN_ITEM_STEP + 300;
      entry.closeTimer = setTimeout(() => {
        entry.closing = false;
        entry.btn.classList.remove('active');
        entry.btn.setAttribute('aria-expanded', 'false');
        entry.list.style.display = 'none';
      }, total);
    };

    const isOpen = entry => entry.btn.classList.contains('active');

    // ── Clicks ───────────────────────────────────────────────────────────────
    entries.forEach(entry => {
      entry.btn.addEventListener('click', () => {
        if (entry.closing) return; // let the reverse-close finish first
        if (isOpen(entry)) closeEntry(entry, false);
        else openEntry(entry, OPEN_ITEM_STEP);
      });

      entry.items.forEach(({ el, work }) => {
        const open = () => {
          const p = window.ADPanel;
          if (!p) return;
          if (p.activeDiscipline !== entry.disc) p.selectDiscipline(entry.disc, true);
          p._openModal(work);
          // The modal detail area is a scroll container on phones; it keeps the
          // previous project's scrollTop, so a new project could open already
          // scrolled to its text. Reset it so every project starts at the top
          // (image → gallery → info). rAF re-reset covers post-layout shifts.
          const content = document.querySelector('#art-direction .ad-pm-content');
          if (content) {
            content.scrollTop = 0;
            requestAnimationFrame(() => { content.scrollTop = 0; });
          }
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
      });
    });

    // ── Label reveal — glitch scramble (owner 2026-07-04) ───────────────────
    // No auto open/close cascade anymore: the category list simply appears,
    // each label decoded with the same window.scrambleText glitch used on the
    // nav labels, modal title and section paragraphs. Categories stay closed
    // until tapped. Fires once when the section goes live (body.ad-section-
    // live, the red-frame gate); resets on leave so it replays on re-entry.
    const glitchable = !!window.scrambleText && !reducedMotion.matches;
    // Failure-safe: only hide labels for the reveal if we can actually glitch
    // them back in — otherwise leave them visible.
    entries.forEach(entry => {
      entry.btn.querySelector('.adacc-btn-label').style.opacity = glitchable ? '0' : '1';
    });

    let revealed = false;
    let revealTimers = [];
    const clearReveal = () => { revealTimers.forEach(clearTimeout); revealTimers = []; };

    const revealLabels = () => {
      if (revealed) return;
      revealed = true;
      entries.forEach((entry, i) => {
        const label = entry.btn.querySelector('.adacc-btn-label');
        if (!glitchable) { label.style.opacity = '1'; return; }
        revealTimers.push(setTimeout(() => {
          label.style.opacity = '1';
          window.scrambleText(label, { frameMs: 45, initialDelay: 0, stepMs: 55 });
        }, i * 150));
      });
    };

    const resetReveal = () => {
      clearReveal();
      revealed = false;
      entries.forEach(entry => {
        closeEntry(entry, true);
        entry.btn.querySelector('.adacc-btn-label').style.opacity = glitchable ? '0' : '1';
      });
    };

    // body.ad-section-live is toggled by art-direction.js — piggyback on it.
    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('ad-section-live')) revealLabels();
      else resetReveal();
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (document.body.classList.contains('ad-section-live')) revealLabels();

    initBottomPin(section);
  }

  // ── Bottom-pin for the #photo curtain ──────────────────────────────────────
  // On phones #art-direction is taller than the viewport, so the desktop
  // top:0 sticky pin would hide the accordion, and leaving it in flow leaves an
  // empty band under the section while the #photo curtain (fixed, clips open
  // from the top) descends. Fix: keep it a NATIVE sticky pin (composited, so no
  // scroll-frame jitter) but offset the sticky top by the section's overflow so
  // its BOTTOM lands at the viewport bottom — it then fills the viewport while
  // the curtain descends over it, with no gap. The offset only depends on the
  // section height, so it's recomputed on resize and whenever the accordion
  // changes height (ResizeObserver) — never per scroll frame.
  function initBottomPin(section) {
    const setTop = () => {
      const overflow = section.offsetHeight - window.innerHeight;
      section.style.setProperty('--ad-pin-top', overflow > 0 ? `${-overflow}px` : '0px');
    };
    setTop();
    window.addEventListener('resize', setTop, { passive: true });
    // Accordion open/close changes offsetHeight; --ad-pin-top only moves the
    // sticky offset (not layout height), so this can't feed back into a loop.
    if (window.ResizeObserver) new ResizeObserver(setTop).observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
