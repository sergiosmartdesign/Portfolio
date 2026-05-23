/**
 * photo-polaroid.js — canvas scratch-off reveal and click-to-activate for the
 * polaroid widget in the #photo section.
 *
 * PolaroidReveal holds a reference to the owning PhotoPortfolioManager so it
 * can read shared state (inPhase3, openCategories, etc.) and call shared
 * helpers without duplicating them.
 *
 * Exposed as window.Photo.PolaroidReveal.
 * Dependencies: gsap + ScrambleTextPlugin (loaded before this file).
 */
(function () {
  'use strict';

  window.Photo = window.Photo || {};

  class PolaroidReveal {
    constructor(manager) {
      this._mgr                 = manager;
      this._polaroidMoveHandler = null;
    }

    // Called by _triggerChain after the camera column is revealed.
    init() {
      const canvas = document.getElementById('polaroidCanvas');
      const photo  = document.getElementById('polaroidPhoto');
      if (!canvas || !photo) return;

      const palette = ['#005F73','#0A9396','#94D2BD','#E9D8A6','#EE9B00','#CA6702','#BB3E03','#AE2012','#9B2226'];
      const frame   = document.querySelector('.photo-polaroid-frame');
      if (frame) frame.style.background = palette[Math.floor(Math.random() * palette.length)];

      const items = Array.from(document.querySelectorAll('.photo-project-item[data-image]'));
      if (!items.length) return;
      const item  = items[Math.floor(Math.random() * items.length)];
      photo.src   = item.dataset.image;

      const nameEl  = document.getElementById('polaroidName');
      const titleEl = item.querySelector('.photo-title');
      if (nameEl) {
        nameEl.textContent = titleEl ? titleEl.textContent.trim() : '';
        nameEl.classList.remove('reveal');
        void nameEl.offsetWidth;
        nameEl.classList.add('reveal');
      }

      const sectionEl  = document.getElementById('polaroidSection');
      const sectionBtn = item.closest('.photo-accordion-item')?.querySelector('.photo-btn-label');
      if (sectionEl) {
        if (sectionBtn) {
          const word   = sectionBtn.textContent.replace(/[·\[\]\s]/g, '').trim().toUpperCase();
          const spaced = word.split('').join(' ');
          sectionEl.textContent = '[ · ' + spaced + ' · ]';
        } else {
          sectionEl.textContent = '';
        }
        sectionEl.classList.remove('reveal');
        void sectionEl.offsetWidth;
        sectionEl.classList.add('reveal');
      }

      // Size canvas bitmap to physical pixels (HiDPI-aware).
      // Deferred to rAF so layout is settled after the overlay becomes visible.
      requestAnimationFrame(() => {
        if (!this._mgr.inPhase3) return;

        const dpr  = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const cssW = rect.width;
        const cssH = rect.height;
        if (!cssW || !cssH) return;

        canvas.width  = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Fill with dark background — this is what gets "scratched off"
        ctx.fillStyle = '#001219';
        ctx.fillRect(0, 0, cssW, cssH);

        if (this._polaroidMoveHandler) {
          canvas.removeEventListener('mousemove', this._polaroidMoveHandler);
        }

        // Erase a soft circle wherever the mouse moves (permanent destination-out)
        this._polaroidMoveHandler = (e) => {
          const r      = canvas.getBoundingClientRect();
          const x      = e.clientX - r.left;
          const y      = e.clientY - r.top;
          const radius = 44;
          ctx.globalCompositeOperation = 'destination-out';
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0,   'rgba(0,0,0,1)');
          grad.addColorStop(0.6, 'rgba(0,0,0,0.85)');
          grad.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        };

        canvas.addEventListener('mousemove', this._polaroidMoveHandler, { passive: true });
      });
    }

    reset() {
      const canvas = document.getElementById('polaroidCanvas');
      if (!canvas) return;
      if (this._polaroidMoveHandler) {
        canvas.removeEventListener('mousemove', this._polaroidMoveHandler);
        this._polaroidMoveHandler = null;
      }
      // Resetting dimensions clears the bitmap automatically
      canvas.width  = 0;
      canvas.height = 0;
      const photo  = document.getElementById('polaroidPhoto');
      if (photo) photo.src = '';
      const nameEl    = document.getElementById('polaroidName');
      if (nameEl) { nameEl.textContent = ''; nameEl.classList.remove('reveal'); }
      const sectionEl = document.getElementById('polaroidSection');
      if (sectionEl) sectionEl.textContent = '';
      const frame  = document.querySelector('.photo-polaroid-frame');
      if (frame) frame.style.background = '';
    }

    // Wire up the click-to-reveal affordance. Queries the DOM internally.
    setupClick() {
      const polaroidReveal = document.querySelector('.photo-polaroid-reveal');
      if (!polaroidReveal) return;
      polaroidReveal.style.cursor = 'pointer';
      polaroidReveal.addEventListener('click', () => this._onPolaroidClick());
    }

    // Activates a list item as the "highlighted" photo (hover state + bg image).
    activateItem(item) {
      const list = item.closest('.photo-project-list');
      if (!list) return;

      const textEls       = item.querySelectorAll('.hover-text');
      const originalTexts = this._mgr.originalTexts.get(item);

      list.querySelectorAll('.photo-project-item').forEach(el => {
        el.classList.remove('active');
        el.style.opacity = '';
      });
      list.classList.add('has-active');
      item.classList.add('active');

      if (originalTexts) {
        textEls.forEach((el, i) => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text:        originalTexts[i],
              chars:       'qwerty1337h@ck3r',
              revealDelay: 0.3,
              speed:       0.4,
            },
          });
        });
      }

      if (item.dataset.image) this._mgr.showBackgroundImage(item.dataset.image);

      if (this._mgr.contentScroll) {
        requestAnimationFrame(() => {
          const csRect   = this._mgr.contentScroll.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();
          const needed   = this._mgr.contentScroll.scrollTop + (itemRect.bottom + 24 - csRect.bottom);
          if (needed > this._mgr.contentScroll.scrollTop) {
            gsap.to(this._mgr.contentScroll, {
              scrollTop: needed,
              duration:  0.5,
              ease:      'power2.out',
              overwrite: 'auto',
            });
          }
        });
      }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _onPolaroidClick() {
      if (this._mgr.introAnimating) return;
      const photoEl = document.getElementById('polaroidPhoto');
      if (!photoEl || !photoEl.src) return;

      const normalize = src => {
        try { return new URL(src, location.href).pathname; } catch { return src; }
      };
      const polaroidPath  = normalize(photoEl.src);
      const matchingItem  = Array.from(
        document.querySelectorAll('.photo-project-item[data-image]')
      ).find(item => normalize(item.dataset.image) === polaroidPath);

      if (!matchingItem) return;

      // Clear the scratch canvas to fully expose the photo
      const canvas = document.getElementById('polaroidCanvas');
      if (canvas && canvas.width && canvas.height) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Re-trigger the caption reveal so name + section are prominently visible
      const nameEl    = document.getElementById('polaroidName');
      const sectionEl = document.getElementById('polaroidSection');
      [nameEl, sectionEl].forEach(el => {
        if (!el) return;
        el.classList.remove('reveal');
        void el.offsetWidth;
        el.classList.add('reveal');
      });

      const accordionItem = matchingItem.closest('.photo-accordion-item');
      const btn  = accordionItem?.querySelector('.photo-category-btn');
      const list = accordionItem?.querySelector('.photo-project-list');
      const cat  = btn?.dataset.category;
      if (!cat || !list || !btn) return;

      const activate = () => this.activateItem(matchingItem);

      if (!this._mgr.openCategories.has(cat)) {
        this._mgr._openCategory(cat, btn, list);
        const n = list.querySelectorAll('.photo-project-item').length;
        setTimeout(activate, n * 40 + 200);
      } else {
        activate();
      }
    }
  }

  window.Photo.PolaroidReveal = PolaroidReveal;
}());
