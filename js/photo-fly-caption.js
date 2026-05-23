/**
 * photo-fly-caption.js — flying caption clone that follows the hovered
 * photo-project-item to a fixed position at the bottom of the viewport.
 *
 * Exposed as window.Photo.FlyCaption.
 * Dependencies: gsap + ScrambleTextPlugin (loaded before this file).
 */
(function () {
  'use strict';

  window.Photo = window.Photo || {};

  class FlyCaption {
    // originalTexts — the Map<Element, string[]> built by PhotoPortfolioManager
    constructor(originalTexts) {
      this._originalTexts    = originalTexts;
      this._flyClone         = null;
      this._flySource        = null;
      this._flyReturnTween   = null;
      this._flyReturnTimeout = null;
    }

    fly(item) {
      if (this._flyReturnTimeout) {
        clearTimeout(this._flyReturnTimeout);
        this._flyReturnTimeout = null;
      }

      const rect       = item.getBoundingClientRect();
      const targetTop  = Math.round(window.innerHeight * 0.975) - 32;
      const targetLeft = (window.innerWidth - rect.width) / 2;

      // Quick-switch: clone exists but is tracking a different item
      if (this._flyClone && this._flySource !== item) {
        this._flySource.style.opacity = '0.25';
        this._flySource.style.zIndex  = '';
        this._flySource = item;
        item.style.opacity = '0.5';
        item.style.zIndex  = '0';

        const numEl = this._flyClone.querySelector('.photo-fly-num');
        if (numEl) numEl.textContent = this._getCounterIndex(item);

        const cloneSpans = this._flyClone.querySelectorAll('.photo-project-data');
        const origTexts  = this._originalTexts.get(item);
        const srcSpans   = item.querySelectorAll('.photo-project-data');
        cloneSpans.forEach((el, i) => {
          gsap.killTweensOf(el);
          const target = (origTexts && origTexts[i]) ? origTexts[i]
                       : (srcSpans[i] ? srcSpans[i].textContent : '');
          gsap.to(el, {
            duration: 0.5,
            scrambleText: { text: target, chars: 'qwerty1337h@ck3r', revealDelay: 0.1, speed: 0.5 }
          });
        });
        return;
      }

      if (this._flyClone) return; // same item already tracked

      const clone = this._buildFlyClone(item);
      gsap.set(clone, { top: rect.top, left: rect.left, width: rect.width, opacity: 0 });
      document.body.appendChild(clone);
      this._flyClone  = clone;
      this._flySource = item;
      item.style.zIndex = '0';

      clone.classList.add('photo-glitch-load');
      setTimeout(() => { if (this._flyClone === clone) clone.classList.remove('photo-glitch-load'); }, 520);

      gsap.to(clone, {
        top:      targetTop,
        left:     targetLeft,
        opacity:  1,
        duration: 0.42,
        ease:     'power3.out',
      });
    }

    return() {
      if (!this._flyClone) return;

      this._flyReturnTimeout = setTimeout(() => {
        this._flyReturnTimeout = null;
        if (!this._flyClone) return;

        const clone  = this._flyClone;
        const source = this._flySource;
        this._flyClone  = null;
        this._flySource = null;

        const rect = source ? source.getBoundingClientRect() : null;
        if (!rect) { clone.remove(); return; }

        if (source) source.style.zIndex = '';
        if (this._flyReturnTween) this._flyReturnTween.kill();
        this._flyReturnTween = gsap.to(clone, {
          top:      rect.top,
          left:     rect.left,
          width:    rect.width,
          opacity:  0,
          duration: 0.32,
          ease:     'power2.in',
          onComplete: () => { clone.remove(); this._flyReturnTween = null; }
        });
      }, 0);
    }

    clear() {
      if (this._flyReturnTimeout) { clearTimeout(this._flyReturnTimeout); this._flyReturnTimeout = null; }
      if (this._flyReturnTween)   { this._flyReturnTween.kill(); this._flyReturnTween = null; }
      if (this._flyClone)         { this._flyClone.remove(); this._flyClone = null; }
      if (this._flySource)        { this._flySource.style.opacity = ''; this._flySource.style.zIndex = ''; this._flySource = null; }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _getCounterIndex(item) {
      const list = item.closest('.photo-project-list');
      if (!list) return '01';
      const items = Array.from(list.querySelectorAll('.photo-project-item'));
      return String(items.indexOf(item) + 1).padStart(2, '0');
    }

    _buildFlyClone(item) {
      const clone = document.createElement('li');
      clone.className = 'photo-project-item photo-caption-fly';

      const numSpan = document.createElement('span');
      numSpan.className   = 'photo-fly-num';
      numSpan.textContent = this._getCounterIndex(item);
      clone.appendChild(numSpan);

      item.querySelectorAll('.photo-project-data').forEach(span => {
        clone.appendChild(span.cloneNode(true));
      });

      return clone;
    }
  }

  window.Photo.FlyCaption = FlyCaption;
}());
