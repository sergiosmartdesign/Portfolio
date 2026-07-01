/**
 * ios-debug.js — on-device diagnostic overlay for the iOS ticker / preloader-line
 * rendering bug. INERT unless the URL contains ?debug=1 (or #debug). Renders a
 * fixed panel that samples the exact WebKit state we can't see remotely:
 * viewport, media queries (incl. reduced-motion), whether the mobile layout is
 * active, whether the animations are applied, and the live computed opacity of
 * the affected elements. Screenshot it on the iPhone and send it back.
 *
 * Safe for production: does nothing without the flag; purely read-only.
 */
(function () {
  'use strict';
  if (!/[?&#]debug/i.test(location.search + location.hash)) return;

  var panel = document.createElement('div');
  panel.setAttribute('aria-hidden', 'true');
  panel.style.cssText = [
    'position:fixed', 'left:0', 'top:0', 'right:0', 'z-index:2147483647',
    'max-height:60vh', 'overflow:auto', 'background:rgba(0,10,15,0.92)',
    'color:#0ef', 'font:11px/1.35 ui-monospace,Menlo,monospace',
    'padding:8px 10px', 'white-space:pre-wrap', 'pointer-events:auto',
    'border-bottom:2px solid #ff3c00', '-webkit-user-select:text', 'user-select:text'
  ].join(';');
  (document.body || document.documentElement).appendChild(panel);

  function mm(q) { try { return window.matchMedia(q).matches; } catch (e) { return 'ERR'; } }
  function cs(el, prop) {
    if (!el) return '—';
    try { return getComputedStyle(el)[prop]; } catch (e) { return 'ERR'; }
  }
  function supports(p, v) { try { return CSS.supports(p, v); } catch (e) { return 'ERR'; } }

  function sample() {
    var line   = document.querySelector('.preloader-line');
    var lines  = document.querySelectorAll('.preloader-line');
    var tTop   = document.querySelector('.ifm-ticker--top');
    var track  = document.querySelector('.ifm-ticker--top .ifm-ticker-track');
    var frame  = document.querySelector('.intro-frame-mobile');
    var svg    = document.querySelector('.ifm-svg');
    var bd     = (window.App && window.App.BrowserDetect) || {};

    var out = [
      '── iOS DEBUG (?debug) ──  ' + new Date().toLocaleTimeString(),
      'UA: ' + navigator.userAgent,
      'platform: ' + navigator.platform + '  touchPts: ' + navigator.maxTouchPoints,
      'viewport: ' + window.innerWidth + 'x' + window.innerHeight + '  dpr: ' + window.devicePixelRatio,
      '',
      'MQ max-width:768px      = ' + mm('(max-width: 768px)'),
      'MQ hover:none+coarse    = ' + mm('(hover: none) and (pointer: coarse)'),
      'MQ prefers-reduced-mot  = ' + mm('(prefers-reduced-motion: reduce)') + '   <<< key',
      '@supports touch-callout = ' + supports('-webkit-touch-callout', 'none'),
      'App.BrowserDetect isMobile=' + bd.isMobile + ' isTouch=' + bd.isTouch + ' isSafari=' + bd.isSafari,
      '',
      'body.preloading        = ' + (document.body ? document.body.classList.contains('preloading') : '?'),
      'window.makeStaticLine  = ' + (typeof window.makeStaticLine),
      '',
      'PRELOADER LINES: count=' + lines.length,
      '  [0] opacity=' + cs(line, 'opacity') +
        ' anim=' + cs(line, 'animationName') +
        ' transform=' + String(cs(line, 'transform')).slice(0, 30) +
        ' filter=' + cs(line, 'filter') +
        ' willChange=' + cs(line, 'willChange'),
      '',
      'INTRO FRAME: present=' + !!frame + ' svg=' + !!svg,
      '  frame display=' + cs(frame, 'display') + ' filter=' + cs(frame, 'filter'),
      '  svg   filter=' + String(cs(svg, 'filter')).slice(0, 40),
      'TICKER top: present=' + !!tTop,
      '  opacity=' + cs(tTop, 'opacity') + ' anim=' + cs(tTop, 'animationName') + ' mask=' + String(cs(tTop, 'webkitMaskImage') || cs(tTop, 'maskImage')).slice(0, 20),
      '  track anim=' + cs(track, 'animationName') + ' transform=' + String(cs(track, 'transform')).slice(0, 30) + ' willChange=' + cs(track, 'willChange')
    ];
    panel.textContent = out.join('\n');
  }

  sample();
  var n = 0;
  var iv = setInterval(function () { sample(); if (++n > 40) clearInterval(iv); }, 500);
  panel.addEventListener('click', function () { clearInterval(iv); sample(); });
}());
