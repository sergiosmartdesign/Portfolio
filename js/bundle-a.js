/* bundle-a.js — concatenated app bundle (load order preserved). Sources in git history. */

;
/* ===== app-registry.js ===== */
/**
 * app-registry.js — single namespace for inter-module communication.
 *
 * Replaces 11 scattered window.* globals with one documented object.
 * Must be the first <script> on the page so every subsequent module
 * can read and write App.* safely.
 *
 * Vendor globals (window.Splitting, window.ScrollOut) are intentionally
 * excluded — they follow third-party library convention and are not
 * produced by this codebase.
 *
 * Contract (all slots are optional-chained at read sites):
 *
 *   App.BrowserDetect            {isSafari, isIOS, isSafariBased(), getPerformanceTier()}
 *   App.ParticleSystem           {pause(), resume(), destroy()}   — intro swarm (preloader instance is self-managed)
 *   App.Orb3D                    {pause(), resume()}
 *   App.BarcodeAnimation         {start(), stop()}
 *   App.LanguageManager          {init(), setLanguage(), …}
 *   App.certCube                 {goto(), next(), prev()}         — devtools only
 *   App.glitchSystem             {initDNAGlitch(), animateDNAReveal(), …} — devtools only
 *   App.playArtEntranceAnimation ()                               — set by art-direction.js
 *   App._scrollPathActive        boolean                          — legacy/unused; about-pin.js no longer scroll-jacks
 */
(function () {
  'use strict';

  window.App = Object.create(null);
}());


;
/* ===== browser-detect.js ===== */
/**
 * Browser Detection Utility
 * Lightweight detection for Safari/iOS to enable performance optimizations
 */

const BrowserDetect = {
  // Safari detection (excludes Chrome which also contains "Safari" in UA)
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),

  // iOS detection
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,

  // Coarse-pointer / touch device with no real hover (computed once at load).
  // Single source of truth for capability-gated mobile behavior in other modules.
  isTouch: window.matchMedia('(hover: none) and (pointer: coarse)').matches,

  // Mobile-layout viewport — tracks the CSS ≤768px breakpoint. Evaluated once at
  // load (consumers read it during init), matching how this module is used.
  isMobile: window.matchMedia('(max-width: 768px)').matches,

  // Combined check for any Safari-based browser
  isSafariBased: function() {
    return this.isSafari || this.isIOS;
  },

  // Performance tier (for adaptive quality). Phones fall to 'low' so canvas /
  // particle consumers that respect the tier scale down for battery + jank.
  getPerformanceTier: function() {
    if (this.isIOS || this.isMobile) return 'low';
    if (this.isSafari) return 'medium';
    return 'high';
  }
};

App.BrowserDetect = BrowserDetect;


;
/* ===== email-guard.js ===== */
/**
 * Email obfuscation guard
 * ---------------------------------------------------------------------------
 * Keeps the contact address out of the static HTML/JSON so scraper bots can't
 * harvest it, while assembling it at runtime so humans use it normally.
 *
 * Opt an element in with the `data-eml` attribute:
 *   <a data-eml> …                       → sets href="mailto:<addr>"
 *   <a data-eml data-eml-subject="Hi"> … → adds ?subject=Hi
 *   <span data-eml data-eml-text></span> → sets textContent to the address
 *
 * Re-runs on the i18n `languagechanged` event, because that re-injects the
 * innerHTML of [data-i18n-html] nodes (which would wipe an assembled href).
 *
 * NOTE: the schema.org JSON-LD keeps the address in plaintext on purpose — it
 * is SEO metadata that good bots (Google) need. That is the accepted trade-off.
 */
(function () {
  // Split so the literal address never appears in this source file either.
  var ADDR = ['mail', 'sergio-ayala.com'].join('@');

  function apply(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-eml]').forEach(function (el) {
      if (el.tagName === 'A') {
        var subj = el.getAttribute('data-eml-subject');
        el.setAttribute(
          'href',
          'mailto:' + ADDR + (subj ? '?subject=' + encodeURIComponent(subj) : '')
        );
      }
      if (el.hasAttribute('data-eml-text')) {
        el.textContent = ADDR;
      }
    });
  }

  if (document.readyState !== 'loading') apply();
  else document.addEventListener('DOMContentLoaded', function () { apply(); });

  // i18n swaps overwrite innerHTML (and it dispatches on `document`, not window)
  // → restore the assembled hrefs/text after every render, including the first.
  document.addEventListener('languagechanged', function () { apply(); });
})();

