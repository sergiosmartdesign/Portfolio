/**
 * i18n.js — Language Manager
 *
 * Loads translations from locales/{lang}.json dynamically.
 * The default locale (EN) fetch starts immediately at script parse time so it
 * is in-flight before DOMContentLoaded fires. App.LanguageManager.ready is a
 * Promise that resolves after both DOMContentLoaded and the default locale
 * fetch complete — consumers that need translations before running (e.g.
 * Splitting.js in script.js) must chain off .ready instead of DOMContentLoaded.
 *
 * Non-default locales are lazy-fetched the first time setLanguage() is called
 * for that locale, then cached for the session.
 *
 * Safe rule: elements with [data-splitting] are never touched here —
 * Splitting.js owns their inner DOM structure.
 *
 * After applying translations, dispatches a 'languagechanged' CustomEvent
 * on document so other modules (e.g. photo-portfolio.js) can refresh caches.
 */

(function () {
  'use strict';

  const STORAGE_KEY  = 'portfolio_lang';
  const DEFAULT_LANG = 'en';
  const LOCALES_PATH = 'locales/';

  // Per-session translation cache: { en: {...}, es: {...} }
  const _cache = Object.create(null);

  // Resolved once: DOMContentLoaded fired AND default locale loaded.
  let _resolveReady;
  const _ready = new Promise(resolve => { _resolveReady = resolve; });

  // ── Locale loading ──────────────────────────────────────────────────────────

  function _fetchLocale(lang) {
    if (_cache[lang]) return Promise.resolve();
    return fetch(LOCALES_PATH + lang + '.json')
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(data => { _cache[lang] = data; })
      .catch(err => console.error('[i18n] Failed to load ' + lang + '.json:', err));
  }

  // Start the default locale fetch immediately — before DOMContentLoaded —
  // so it is likely resolved by the time the DOM is ready.
  const _defaultFetch = _fetchLocale(DEFAULT_LANG);

  // ── Language Manager ────────────────────────────────────────────────────────

  const LanguageManager = {
    current: null,

    /**
     * Promise that resolves after DOMContentLoaded + default locale fetch.
     * Chain off this instead of DOMContentLoaded when translations must be
     * in the DOM before your code runs (e.g. before Splitting.js).
     */
    ready: _ready,

    /**
     * Called internally after both DOM and default locale are ready.
     */
    init() {
      const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
      this._apply(saved, false);
      this._setupButtons();
      _resolveReady();
    },

    /**
     * Switches the active language. Fetches the locale file if not cached.
     */
    setLanguage(lang) {
      if (lang === this.current) return;
      _fetchLocale(lang).then(() => this._apply(lang, true));
    },

    /**
     * Synchronous translation lookup (reads from in-memory cache).
     */
    translate(key) {
      return _cache[this.current]?.[key];
    },

    // ── Private ──────────────────────────────────────────────────────────────

    _apply(lang, persist) {
      if (!_cache[lang]) return;
      this.current = lang;

      document.documentElement.lang = lang;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        if (el.hasAttribute('data-splitting')) return;
        const value = _cache[lang][el.getAttribute('data-i18n')];
        if (value !== undefined) el.textContent = value;
      });

      document.querySelectorAll('[data-i18n-split]').forEach(el => {
        const value = _cache[lang][el.getAttribute('data-i18n-split')];
        if (value !== undefined) el.textContent = value;
      });

      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const value = _cache[lang][el.getAttribute('data-i18n-html')];
        if (value !== undefined) el.innerHTML = value;
      });

      document.querySelectorAll('.lang-btn').forEach(btn => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      document.dispatchEvent(new CustomEvent('languagechanged', { detail: { lang } }));

      if (persist) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
      }
    },

    _setupButtons() {
      const toggle = document.querySelector('.language-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', e => {
        const btn = e.target.closest('.lang-btn');
        if (btn && btn.dataset.lang) this.setLanguage(btn.dataset.lang);
      });
    },
  };

  App.LanguageManager = LanguageManager;

  // Wait for both the DOM and the default locale, then boot.
  Promise.all([
    new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve)),
    _defaultFetch,
  ]).then(() => LanguageManager.init());

}());
