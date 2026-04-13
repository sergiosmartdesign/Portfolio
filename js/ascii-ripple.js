/**
 * ascii-ripple.js — ASCII Glitch Ripple Hover Effect
 *
 * On mouseenter / mousemove, spawns a ripple of ASCII + box-drawing characters
 * that spreads outward from the cursor's character position. The original text
 * is restored naturally as each wave expires — no hard cut on mouseleave.
 *
 * Applied to: body paragraphs only.
 * Excluded:   headings, .paul-rands-quote, data-i18n-html elements, UI labels.
 *
 * No external dependencies. Integrates with i18n.js via the 'languagechanged'
 * CustomEvent so effect text stays in sync after language switches.
 *
 * Adapted from Bastien Cornier's ASCII Glitch Ripple experiment.
 */

(function () {
  'use strict';

  // ── Wave tuning constants ────────────────────────────────────────────────────
  const WAVE_THRESH = 3;   // intensity band that shows glitch chars
  const CHAR_MULT   = 3;   // how fast chars cycle through the charset per distance
  const ANIM_STEP   = 40;  // ms between charset advances (lower = faster churn)
  const WAVE_BUF    = 5;   // extra radius added so the wave fully exits the text

  // Box-drawing + ASCII set — feels right for the VHS / terminal aesthetic
  const DEFAULT_CHARS = '.,·-─~+:;=*┐┌┘┴┬╗╔╝╚╬╠╣╩╦║░▒▓▄▀▌▐■!?&#$@0123456789';

  // ── Core factory ────────────────────────────────────────────────────────────

  /**
   * Attaches the ASCII ripple effect to a single DOM element.
   *
   * @param {HTMLElement} el   — target element (paragraph)
   * @param {object}      opts — overrides for dur / chars / preserveSpaces / spread
   * @returns {{ updateTxt, resetToOrig, destroy }}
   */
  function createASCIIShift(el, opts) {
    let origTxt   = el.textContent;
    let origChars = origTxt.split('');
    let isAnim    = false;
    let cursorPos = 0;
    let waves     = [];
    let animId    = null;
    let isHover   = false;
    let origW     = null;
    let origH     = null;

    const cfg = Object.assign({
      dur:            800,
      chars:          DEFAULT_CHARS,
      preserveSpaces: true,
      spread:         1,
    }, opts);

    // ── Cursor tracking ───────────────────────────────────────────────────────

    const updateCursorPos = (e) => {
      const rect = el.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const len  = origTxt.length;
      const pos  = Math.round((x / rect.width) * len);
      cursorPos  = Math.max(0, Math.min(pos, len - 1));
    };

    // ── Wave management ───────────────────────────────────────────────────────

    const startWave = () => {
      waves.push({ startPos: cursorPos, startTime: Date.now() });
      if (!isAnim) start();
    };

    const cleanupWaves = (t) => {
      waves = waves.filter(w => t - w.startTime < cfg.dur);
    };

    // ── Per-character effect calculation ──────────────────────────────────────

    const calcWaveEffect = (charIdx, t) => {
      let shouldAnim = false;
      let resultChar = origChars[charIdx];

      for (const w of waves) {
        const age     = t - w.startTime;
        const prog    = Math.min(age / cfg.dur, 1);
        const dist    = Math.abs(charIdx - w.startPos);
        const maxDist = Math.max(w.startPos, origChars.length - w.startPos - 1);
        const rad     = (prog * (maxDist + WAVE_BUF)) / cfg.spread;

        if (dist <= rad) {
          shouldAnim = true;
          const intens = Math.max(0, rad - dist);
          if (intens <= WAVE_THRESH && intens > 0) {
            const ci = (dist * CHAR_MULT + Math.floor(age / ANIM_STEP)) % cfg.chars.length;
            resultChar = cfg.chars[ci];
          }
        }
      }

      return { shouldAnim, char: resultChar };
    };

    const genScrambledTxt = (t) =>
      origChars.map((char, i) => {
        if (cfg.preserveSpaces && char === ' ') return ' ';
        const res = calcWaveEffect(i, t);
        return res.shouldAnim ? res.char : char;
      }).join('');

    // ── Animation loop ────────────────────────────────────────────────────────

    const stop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      el.textContent    = origTxt;
      el.style.userSelect = '';
      if (origW !== null) { el.style.width   = ''; origW = null; }
      if (origH !== null) { el.style.height  = ''; origH = null; }
      el.style.overflow = '';
      isAnim = false;
    };

    const start = () => {
      if (isAnim) return;

      // Lock dimensions once to prevent layout reflow as chars change width/height
      if (origW === null) {
        const rect    = el.getBoundingClientRect();
        origW         = rect.width;
        origH         = rect.height;
        el.style.width    = origW + 'px';
        el.style.height   = origH + 'px';
        el.style.overflow = 'hidden';
      }

      // Prevent accidental text selection of scrambled characters
      el.style.userSelect = 'none';
      isAnim = true;

      const animate = () => {
        const t = Date.now();
        cleanupWaves(t);
        if (waves.length === 0) { stop(); return; }
        el.textContent = genScrambledTxt(t);
        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);
    };

    // ── Event handlers ────────────────────────────────────────────────────────

    const handleEnter = (e) => {
      isHover = true;
      updateCursorPos(e);
      startWave();
    };

    const handleMove = (e) => {
      if (!isHover) return;
      const prev = cursorPos;
      updateCursorPos(e);
      if (cursorPos !== prev) startWave();
    };

    const handleLeave = () => {
      isHover = false;
      // No hard stop — active waves expire naturally so the effect trails off
    };

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mousemove',  handleMove);
    el.addEventListener('mouseleave', handleLeave);

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Call after external code changes el.textContent (e.g. i18n language switch).
     * Safe to call while an animation is running — origTxt / origChars are updated
     * and the restored text will be correct when the wave expires.
     */
    const updateTxt = (newTxt) => {
      origTxt   = newTxt;
      origChars = newTxt.split('');
      if (!isAnim) el.textContent = newTxt;
    };

    /** Immediately cancels animation and restores original text. */
    const resetToOrig = () => {
      waves = [];
      stop();
    };

    /** Removes all event listeners and resets the element. */
    const destroy = () => {
      resetToOrig();
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mousemove',  handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };

    return { updateTxt, resetToOrig, destroy };
  }

  // ── Initialisation ───────────────────────────────────────────────────────────

  /**
   * Paragraph selectors that receive the ripple.
   *
   * Deliberately omitted:
   *   • .photo-intro         — data-i18n-html; contains <em>/<span>/<strong>
   *                            textContent replacement would destroy inner elements
   *   • .paul-rands-quote *  — quote, excluded by design
   *   • h1, h2, h3           — headings, excluded by design
   *   • .pgallery-desc       — data-splitting, Splitting.js owns inner DOM
   *   • UI labels / hints    — not body copy
   */
  var PARA_SELECTORS = [
    '#aboutp1',
    '#aboutp2',
    '#aboutp3',
    '#aboutp4',
    '.photo-ig-desc',
    'footer p',
  ];

  function initASCIIRipple() {
    var instances = new Map();

    PARA_SELECTORS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var inst = createASCIIShift(el, { dur: 800, spread: 1 });
      instances.set(el, inst);
    });

    // Sync text when the user switches language.
    // i18n.js sets el.textContent *before* dispatching 'languagechanged',
    // so el.textContent is already the new translated string at this point.
    document.addEventListener('languagechanged', function () {
      instances.forEach(function (inst, el) {
        inst.updateTxt(el.textContent);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initASCIIRipple);

})();
