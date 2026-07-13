/* audio-engine.js — SonicPalette (sample player)
   ────────────────────────────────────────────────────────────────────────────
   Plays authored WAV files for the portfolio's UI, decoded through the Web
   Audio API so playback is low-latency, overlappable, pan-able and identical on
   Windows / macOS / Linux.

   HOW TO ADD SOUNDS — just drop WAV files into  web/audio/ui/  named by what
   they do (see web/audio/ui/README.md for the full list). Canonical names:

       hover boton <section>.wav     ← plays when hovering a menu item
       click menu  <section>.wav     ← plays when clicking a menu item

   where <section> ∈ { about, art direction, photography, illustration, contact }

   Missing files simply don't play (404 → silent), so the site works before any
   file exists and lights up as you add them. Nothing else needs editing; to
   remap a name, edit FILE_FOR() below.

   Robust unlock (see SOUND-DOSSIER): created from a real gesture, warmed up with
   a silent buffer, and recovers from Safari's `interrupted` state.

   Debug: open the site with  ?audiodebug  (or run SonicPalette.debug()) to show
   an on-screen HUD of the audio state + last file played — the fastest way to
   see WHY something is or isn't sounding on a given machine.

   API: SonicPalette.play(key,opts) · .toggle() · .setEnabled(b) · .isEnabled()
        · .unlock() · .debug()
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var BASE = 'audio/ui/';                 // folder (relative to index.html)
  var STORE_KEY = 'ssd-sound';
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  var enabled = (function () {
    try { return localStorage.getItem(STORE_KEY) !== 'off'; } catch (e) { return true; }
  })();

  // Menu href → human section token used in filenames.
  var SECTION = {
    '#about': 'about',
    '#art-direction': 'art direction',
    '#photo': 'photography',
    '#illustration': 'illustration',
    '#contact': 'contact'
  };

  // Event key → WAV base-name (without .wav). Edit here to remap.
  function FILE_FOR(action, section) {
    if (action === 'hover') return 'hover boton ' + section;
    if (action === 'click') return 'click menu ' + section;
    return action + ' ' + section;
  }

  var ctx = null, master = null, limiter = null;
  var buffers = {};   // name → AudioBuffer | null(missing) | 'loading'
  var lastFile = '—';

  function ensureCtx() {
    if (ctx) return ctx;
    ctx = new AC();
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -4; limiter.knee.value = 6; limiter.ratio.value = 12;
    limiter.attack.value = 0.003; limiter.release.value = 0.18;
    master = ctx.createGain(); master.gain.value = 1.0;
    master.connect(limiter); limiter.connect(ctx.destination);
    ctx.addEventListener && ctx.addEventListener('statechange', function () {
      if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
    });
    return ctx;
  }

  // ── Sample loading ──────────────────────────────────────────────────────────
  function decode(arrbuf) {
    return new Promise(function (resolve, reject) {
      // Safari historically needs the callback form; try promise then fall back.
      var p;
      try { p = ctx.decodeAudioData(arrbuf, resolve, reject); } catch (e) { p = null; }
      if (p && typeof p.then === 'function') p.then(resolve, reject);
    });
  }

  function loadBuffer(name) {
    if (name in buffers && buffers[name] !== 'loading') return Promise.resolve(buffers[name]);
    if (buffers[name] === 'loading') return Promise.resolve(null);
    buffers[name] = 'loading';
    var url = BASE + encodeURIComponent(name) + '.wav';
    return fetch(url).then(function (r) {
      if (!r.ok) { buffers[name] = null; return null; }         // missing → silent
      return r.arrayBuffer().then(decode).then(function (buf) {
        buffers[name] = buf; return buf;
      });
    }).catch(function () { buffers[name] = null; return null; });
  }

  // ── Playback ────────────────────────────────────────────────────────────────
  var lastPlay = 0;
  function playFile(name, opts) {
    if (!enabled) return;
    ensureCtx();
    if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
    var now = ctx.currentTime;
    if (now - lastPlay < 0.05) return;      // throttle rapid re-triggers
    lastPlay = now;
    opts = opts || {};

    var buf = buffers[name];
    if (buf === undefined || buf === 'loading') {   // first time → load then play
      loadBuffer(name).then(function (b) { if (b) start(b, opts, name); });
      return;
    }
    if (buf) start(buf, opts, name);
  }

  function start(buf, opts, name) {
    lastFile = name + '  ✓';
    var src = ctx.createBufferSource();
    src.buffer = buf;
    if (opts.rate) src.playbackRate.value = opts.rate;
    if (opts.detune && src.detune) src.detune.value = opts.detune;
    var g = ctx.createGain(); g.gain.value = opts.gain == null ? 1 : opts.gain;
    var node = src;
    node.connect(g);
    if (opts.pan && ctx.createStereoPanner) {
      var pan = ctx.createStereoPanner(); pan.pan.value = opts.pan;
      g.connect(pan); pan.connect(master);
    } else {
      g.connect(master);
    }
    src.start();
  }

  // Public play() accepts an event key ("hover:#about") or a raw filename.
  function play(key, opts) {
    if (!enabled) return;
    if (key && key.indexOf(':') > 0) {
      var parts = key.split(':');
      var section = SECTION[parts[1]] || parts[1];
      playFile(FILE_FOR(parts[0], section), opts);
    } else {
      playFile(key, opts);
    }
  }

  // ── Unlock (gesture + warm-up) + preload ────────────────────────────────────
  var warmed = false;
  function warmup() {
    if (warmed) return; warmed = true;
    try {
      var b = ctx.createBuffer(1, 1, 22050);
      var s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination);
      (s.start || s.noteOn).call(s, 0);
    } catch (e) { warmed = false; }
  }
  function preload() {
    // Warm the cache for every menu hover/click so the first play has no delay.
    Object.keys(SECTION).forEach(function (href) {
      loadBuffer(FILE_FOR('hover', SECTION[href]));
      loadBuffer(FILE_FOR('click', SECTION[href]));
    });
  }
  function unlock() {
    ensureCtx();
    if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
    warmup();
    preload();
  }
  ['pointerdown', 'mousedown', 'touchend', 'keydown', 'click'].forEach(function (ev) {
    window.addEventListener(ev, unlock, { once: true, passive: true });
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && ctx && ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
  });

  // ── Preference + toggle ─────────────────────────────────────────────────────
  function setEnabled(on) {
    enabled = !!on;
    try { localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
    if (enabled) unlock();
    return enabled;
  }
  function toggle() { return setEnabled(!enabled); }
  function syncButton() {
    var b = document.getElementById('sound-toggle'); if (!b) return;
    b.classList.toggle('active', enabled);
    b.setAttribute('aria-pressed', String(enabled));
  }

  // ── Menu wiring: hover + click per section ──────────────────────────────────
  function bindNav() {
    document.querySelectorAll('#main-nav .nav-btn').forEach(function (btn) {
      if (btn._sonicBound) return; btn._sonicBound = true;
      var href = btn.getAttribute('href');
      var section = SECTION[href]; if (!section) return;
      btn.addEventListener('mouseenter', function () { playFile(FILE_FOR('hover', section)); }, { passive: true });
      // pointerdown (not click) so the sound fires immediately, before navigation.
      btn.addEventListener('pointerdown', function () { playFile(FILE_FOR('click', section)); }, { passive: true });
    });
  }
  function init() { bindNav(); syncButton(); if (/[?&]audiodebug/.test(location.search)) showHUD(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('languagechanged', bindNav);

  // ── Debug HUD ───────────────────────────────────────────────────────────────
  var hud = null;
  function showHUD() {
    if (hud) return;
    hud = document.createElement('div');
    hud.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;font:11px/1.5 monospace;' +
      'background:rgba(0,0,0,.85);color:#5ff;padding:6px 10px;border:1px solid #5ff;border-radius:4px;pointer-events:none;white-space:pre';
    document.body.appendChild(hud);
    setInterval(function () {
      var loaded = Object.keys(buffers).filter(function (k) { return buffers[k] && buffers[k] !== 'loading'; }).length;
      var missing = Object.keys(buffers).filter(function (k) { return buffers[k] === null; }).length;
      hud.textContent =
        'SonicPalette  ' + (enabled ? 'ON' : 'MUTED') +
        '\nctx: ' + (ctx ? ctx.state : 'not-created') +
        '\nfiles loaded: ' + loaded + '   missing(404): ' + missing +
        '\nlast: ' + lastFile;
    }, 200);
  }

  window.SonicPalette = {
    play: play, toggle: toggle, setEnabled: setEnabled,
    isEnabled: function () { return enabled; }, unlock: unlock, debug: showHUD,
    get _ctx() { return ctx; }, get _master() { return master; }, get _buffers() { return buffers; }
  };
})();
