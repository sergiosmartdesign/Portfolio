/**
 * ascii-ripple.js — ASCII Glitch Ripple Hover Effect
 *
 * On mouseenter / mousemove, spawns a ripple of ASCII + box-drawing characters
 * spreading outward from the cursor's character position. Original text is
 * restored naturally as each wave expires — no hard cut on mouseleave.
 *
 * Applied to: body paragraphs only.
 * Excluded:   headings, .paul-rands-quote, UI labels/hints.
 *
 * Handles three element types transparently:
 *   • Plain text  (data-i18n)      — textContent only, no inner structure
 *   • HTML markup (data-i18n-html) — saves/restores innerHTML so <em>/<span> survive
 *   • Splitting.js (data-splitting) — saves/restores innerHTML so char-spans survive;
 *                                     script.js re-runs Splitting before our
 *                                     'languagechanged' listener fires, so the
 *                                     rebuilt spans are already in place when we
 *                                     re-capture origHTML.
 *
 * No external dependencies.
 * Adapted from Bastien Cornier's ASCII Glitch Ripple experiment.
 */

(function () {
  'use strict';

  // ── Wave tuning ──────────────────────────────────────────────────────────────
  const WAVE_THRESH = 3;    // intensity band where glitch chars appear
  const CHAR_MULT   = 3;    // how fast chars cycle through charset per distance unit
  const ANIM_STEP   = 40;   // ms between charset index advances (lower = faster churn)
  const WAVE_BUF    = 5;    // extra radius so the wave fully exits the string

  // Box-drawing + ASCII — heavy on VHS / terminal chars, fits the portfolio aesthetic
  const DEFAULT_CHARS = '.,·-─~+:;=*┐┌┘┴┬╗╔╝╚╬╠╣╩╦║░▒▓▄▀▌▐■!?&#$@0123456789';

  // ── Core factory ────────────────────────────────────────────────────────────

  /**
   * Attaches the ASCII ripple effect to a single element.
   *
   * origHTML is always captured from el.innerHTML (browser-encoded), so the
   * innerHTML round-trip is safe for both plain text and markup:
   *   plain text  → browser encodes &→&amp; on read, decodes on write
   *   inner HTML  → round-trips correctly unchanged
   *   Splitting.js spans → same as inner HTML
   *
   * @param {HTMLElement} el
   * @param {object}      opts  — dur / chars / preserveSpaces / spread
   * @returns {{ updateTxt, resetToOrig, destroy }}
   */
  function createASCIIShift(el, opts) {
    let origTxt   = el.textContent;
    let origHTML  = el.innerHTML;       // always innerHTML — safe for all element types
    let origChars = origTxt.split('');
    let isAnim    = false;
    let cursorPos = 0;
    let waves     = [];
    let animId    = null;
    let isHover   = false;
    let lockedW   = null;               // width lock (released in stop)

    const cfg = Object.assign({
      dur:            450,   // ms — shorter so waves expire before they stack heavily
      chars:          DEFAULT_CHARS,
      preserveSpaces: true,
      maxRadius:      22,    // chars — max spread from cursor (~3–4 words each side)
    }, opts);

    // ── Cursor tracking ──────────────────────────────────────────────────────

    const updateCursorPos = (e) => {
      const rect = el.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const len  = origTxt.length;
      const pos  = Math.round((x / rect.width) * len);
      cursorPos  = Math.max(0, Math.min(pos, len - 1));
    };

    // ── Wave management ──────────────────────────────────────────────────────

    const startWave = () => {
      waves.push({ startPos: cursorPos, startTime: Date.now() });
      if (!isAnim) start();
    };

    const cleanupWaves = (t) => {
      waves = waves.filter(w => t - w.startTime < cfg.dur);
    };

    // ── Per-character scramble ───────────────────────────────────────────────

    const calcWaveEffect = (charIdx, t) => {
      let shouldAnim = false;
      let resultChar = origChars[charIdx];

      for (const w of waves) {
        const age  = t - w.startTime;
        const prog = Math.min(age / cfg.dur, 1);
        const dist = Math.abs(charIdx - w.startPos);
        // Fixed-radius wave: expands from 0 → maxRadius over `dur` ms.
        // Does NOT scale to paragraph length, so only surrounding words glitch.
        const rad  = prog * cfg.maxRadius;

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

    // ── Animation loop ───────────────────────────────────────────────────────

    const stop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      // Restore full innerHTML — recovers inner elements (em/span/Splitting.js spans)
      // and correctly decodes plain text that was browser-encoded on capture.
      el.innerHTML        = origHTML;
      el.style.userSelect = '';
      if (lockedW !== null) { el.style.width = ''; lockedW = null; }
      isAnim = false;
    };

    const start = () => {
      if (isAnim) return;

      // Lock width so the element doesn't resize horizontally as chars vary.
      // No height lock — block paragraphs reflow vertically and locking height
      // clips text / causes a visible snap on release.
      if (lockedW === null) {
        lockedW = el.getBoundingClientRect().width;
        el.style.width = lockedW + 'px';
      }

      // Flatten inner markup to plain text so we can replace char-by-char.
      // origHTML is already saved above and will be restored in stop().
      el.textContent      = origTxt;
      el.style.userSelect = 'none';   // prevent selection of scrambled chars
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

    // ── Event handlers ───────────────────────────────────────────────────────

    const handleEnter = (e) => {
      // Re-sync from live DOM before every animation start.
      // This handles language switches (and any external content change)
      // without relying on event-listener ordering or the languagechanged
      // dispatch timing — whatever text is in the element right now is what
      // the effect will animate and restore.
      if (!isAnim) {
        origTxt   = el.textContent;
        origHTML  = el.innerHTML;
        origChars = origTxt.split('');
      }
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
      // Waves expire naturally — no hard stop so the effect trails off smoothly
    };

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mousemove',  handleMove);
    el.addEventListener('mouseleave', handleLeave);

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Sync text + HTML after an external change (e.g. i18n language switch).
     *
     * By the time 'languagechanged' fires:
     *   data-i18n      → el.textContent already updated by i18n.js
     *   data-i18n-html → el.innerHTML   already updated by i18n.js
     *   data-splitting → i18n.js set textContent, then script.js re-ran
     *                    Splitting.js synchronously, so el.innerHTML already
     *                    has the rebuilt char-spans when our listener fires.
     *
     * Safe to call while animation is running — origTxt/origHTML update and
     * the correct new text is restored when the wave expires.
     */
    const updateTxt = (newTxt, newHTML) => {
      origTxt   = newTxt;
      origHTML  = newHTML !== undefined ? newHTML : newTxt;
      origChars = newTxt.split('');
      // No DOM write here — external code (i18n / Splitting.js) already
      // updated the element's display. handleEnter re-syncs on next hover.
    };

    /** Cancels animation immediately and restores original content. */
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
   * Target selectors — body-copy paragraphs only.
   *
   * Deliberately omitted:
   *   h1 / h2 / h3        — headings, excluded by design
   *   .paul-rands-quote   — quote, excluded by design
   *   .photo-cta          — UI instruction label (span inside p, not body copy)
   *   .pgallery-hint      — UI hint
   *   .photo-polaroid-hint — UI hint
   *   p.sc-text           — scroll-hint UI
   *   p.coming-soon__label — placeholder
   *   footer p            — copyright line (too short / legal text)
   */
  var PARA_SELECTORS = [
    '.photo-intro',    // data-i18n-html: <em>/<span>/<strong> recovered via innerHTML restore
    '.photo-ig-desc',
    '.pgallery-desc',  // data-splitting: Splitting.js char-spans recovered via innerHTML restore
    'footer p',
  ];

  function initASCIIRipple() {
    var instances = new Map();

    PARA_SELECTORS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var inst = createASCIIShift(el, { dur: 450, maxRadius: 22 });
      instances.set(el, inst);
    });

    // Re-sync after language switch.
    // script.js adds its 'languagechanged' listener before us (it loads first),
    // so Splitting.js has already rebuilt any char-spans by the time we read
    // el.innerHTML here.
    document.addEventListener('languagechanged', function () {
      instances.forEach(function (inst, el) {
        inst.updateTxt(el.textContent, el.innerHTML);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initASCIIRipple);

})();
