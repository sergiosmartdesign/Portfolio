/* ad-accordion.js — PHONE-ONLY category accordion for #art-direction.
 *
 * Replaces the yellow DISCIPLINES SVG card on phones (owner 2026-07-04) with
 * an accordion modeled on the #photo desktop list: categories auto-cascade
 * open/closed once when the section goes live, then behave as a click
 * accordion. Expanding a category lists its WORKS_DATA projects; tapping a
 * project opens the existing works modal (via window.ADPanel).
 *
 * Fully gated on App.BrowserDetect.isMobile — on desktop this file builds
 * nothing and touches nothing. Styling lives in css/responsive.css (≤768px),
 * transparent backgrounds by design (unlike photo's dark plate).
 *
 * Depends on: art-direction-data.js (WORKS_DATA), art-direction-panel.js
 * (window.ADPanel), browser-detect.js, optional gsap + App.LanguageManager.
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
          { opacity: 1,    duration: 0.04, ease: 'none' },
          { opacity: 0.15, duration: 0.03, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 1,    duration: 0.05, ease: 'none' },
        ],
      });
    };

    const hideItem = (el, delayMs) => {
      if (reducedMotion.matches || !window.gsap) {
        el.style.opacity = '0';
        return;
      }
      gsap.killTweensOf(el);
      gsap.to(el, { delay: delayMs / 1000, opacity: 0, duration: 0.12, ease: 'none' });
    };

    const openEntry = (entry, itemStepMs) => {
      entry.btn.classList.add('active');
      entry.btn.setAttribute('aria-expanded', 'true');
      entry.list.style.display = 'flex';
      entry.items.forEach(({ el }, i) => showItem(el, i * itemStepMs));
    };

    const closeEntry = (entry, immediate) => {
      entry.btn.classList.remove('active');
      entry.btn.setAttribute('aria-expanded', 'false');
      if (immediate) {
        entry.items.forEach(({ el }) => { if (window.gsap) gsap.killTweensOf(el); el.style.opacity = '0'; });
        entry.list.style.display = 'none';
        return;
      }
      entry.items.forEach(({ el }, i) => hideItem(el, i * 25));
      setTimeout(() => {
        if (!entry.btn.classList.contains('active')) entry.list.style.display = 'none';
      }, entry.items.length * 25 + 160);
    };

    const isOpen = entry => entry.btn.classList.contains('active');

    // ── Clicks ───────────────────────────────────────────────────────────────
    entries.forEach(entry => {
      entry.btn.addEventListener('click', () => {
        if (chainActive) return; // don't fight the attract cycle
        if (isOpen(entry)) closeEntry(entry, false);
        else openEntry(entry, 45);
      });

      entry.items.forEach(({ el, work }) => {
        const open = () => {
          const p = window.ADPanel;
          if (!p) return;
          if (p.activeDiscipline !== entry.disc) p.selectDiscipline(entry.disc, true);
          p._openModal(work);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
      });
    });

    // ── Attract chain — auto open/close cascade, photo-style ────────────────
    // Runs once each time the section goes live (body.ad-section-live, the
    // same gate as the red frame); resets for a replay when the section fully
    // leaves. Skipped under reduced motion (accordion just sits closed).
    let chainActive = false;
    let chainPlayed = false;
    let chainTimers = [];
    const clearChain = () => { chainTimers.forEach(clearTimeout); chainTimers = []; };

    const runChain = () => {
      if (chainActive || chainPlayed || reducedMotion.matches) return;
      chainActive = true;
      chainPlayed = true;

      const BTN_GAP = 150, ITEM_STEP = 55, CAT_GAP = 220, REV_STEP = 25, REV_GAP = 90;
      let cursor = 1800; // let the letter wipe / intro text get ahead first

      entries.forEach(entry => {
        chainTimers.push(setTimeout(() => openEntry(entry, ITEM_STEP), cursor));
        cursor += BTN_GAP + entry.items.length * ITEM_STEP + CAT_GAP;
      });

      [...entries].reverse().forEach(entry => {
        const closeAt = cursor;
        chainTimers.push(setTimeout(() => {
          entry.items.forEach(({ el }, i) => hideItem(el, (entry.items.length - 1 - i) * REV_STEP));
          setTimeout(() => {
            entry.btn.classList.remove('active');
            entry.btn.setAttribute('aria-expanded', 'false');
            entry.list.style.display = 'none';
            if (window.gsap) {
              gsap.killTweensOf(entry.btn);
              gsap.fromTo(entry.btn, { y: -5 }, { y: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' });
            }
          }, entry.items.length * REV_STEP + 80);
        }, closeAt));
        cursor += entry.items.length * REV_STEP + 80 + REV_GAP;
      });

      chainTimers.push(setTimeout(() => { chainActive = false; }, cursor + 200));
    };

    const resetChain = () => {
      clearChain();
      chainActive = false;
      chainPlayed = false;
      entries.forEach(entry => closeEntry(entry, true));
    };

    // body.ad-section-live is toggled by art-direction.js — piggyback on it.
    const bodyObserver = new MutationObserver(() => {
      const live = document.body.classList.contains('ad-section-live');
      if (live) runChain();
      else resetChain();
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (document.body.classList.contains('ad-section-live')) runChain();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
