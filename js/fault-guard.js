/**
 * Fault Guard — global "the page failed to load" fallback.
 *
 * Loads FIRST (non-defer, before preloader.js) so its error handlers are armed
 * before any deferred bundle executes. If the app never boots
 * (window.__SITE_BOOTED__ stays false) within the watchdog window, OR a
 * boot-critical <script>/<link> 404s, OR an uncaught exception/rejection fires
 * during boot, it reveals the #site-fault overlay (black-hole void + a robot
 * chipping stone, "working to fix the error").
 *
 * Once the app has booted, the guard goes dormant: minor runtime errors or a
 * late non-critical bundle 404 never nuke a working page. Image 404s (e.g. the
 * intentional Alquería missing image → black-hole void) are always ignored.
 *
 * No dependencies. Must survive any bundle — even main.css — failing to load,
 * so #site-fault carries its own inline critical CSS in <head>.
 */
(function () {
  'use strict';

  var TIMEOUT_MS = 15000;   // generous: real boot is ~2-4s; >15s ≈ broken
  var faulted = false;

  function booted() { return window.__SITE_BOOTED__ === true; }

  function pickLang() {
    try {
      var saved = localStorage.getItem('portfolio_lang');
      if (saved === 'es' || saved === 'en') return saved;
    } catch (_) {}
    return (navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  function showFault() {
    if (faulted || booted()) return;
    faulted = true;
    var el = document.getElementById('site-fault');
    if (!el) return;
    if (pickLang() === 'es') el.classList.add('sf-es');
    el.hidden = false;
    // Force RAF so the fade-in transition runs from the hidden state.
    requestAnimationFrame(function () { el.classList.add('is-active'); });
    // Tear down a stuck preloader so the fault screen owns the viewport.
    var pre = document.getElementById('preloader');
    if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    document.body.classList.remove('preloading');
    document.documentElement.classList.add('site-faulted');
    var retry = el.querySelector('.sf-retry');
    if (retry) retry.addEventListener('click', function () { location.reload(); });
  }

  // Uncaught script exceptions + failed script/stylesheet loads, during boot.
  window.addEventListener('error', function (e) {
    var t = e && e.target;
    if (t && t !== window && t.tagName) {
      // Resource-load error. Fatal only for scripts/stylesheets — image/media
      // 404s (like the intentional Alquería void) are never fatal.
      if ((t.tagName === 'SCRIPT' || t.tagName === 'LINK') && !booted()) showFault();
      return;
    }
    if (!booted()) showFault();
  }, true);

  window.addEventListener('unhandledrejection', function () {
    if (!booted()) showFault();
  });

  // Watchdog: if the app never declares itself booted, it failed to load.
  window.setTimeout(function () { if (!booted()) showFault(); }, TIMEOUT_MS);
}());
