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
 *   App.ParticleSystem           {pause(), resume()}
 *   App.Orb3D                    {pause(), resume()}
 *   App.BarcodeAnimation         {start(), stop()}
 *   App.LanguageManager          {init(), setLanguage(), …}
 *   App.certCube                 {goto(), next(), prev()}         — devtools only
 *   App.glitchSystem             {initDNAGlitch(), animateDNAReveal(), …} — devtools only
 *   App.playArtEntranceAnimation ()                               — set by art-direction.js
 *   App._scrollPathActive        boolean                          — set by about-pin.js
 */
(function () {
  'use strict';

  window.App = Object.create(null);
}());
