/**
 * i18n.js — Language Manager
 *
 * Handles EN/ES switching, applies translations to [data-i18n] elements,
 * and persists the user's choice in localStorage.
 *
 * Load order: must come BEFORE script.js so translations are applied to DOM
 * text before Splitting.js processes [data-splitting] elements.
 *
 * Safe rule: elements with [data-splitting] are never touched here —
 * Splitting.js owns their inner DOM structure.
 */

(function () {
  'use strict';

  // ── TRANSLATIONS ────────────────────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      'footer.rights': '© 2026 All rights reserved',

      'about.p1': 'Senior Art Director & Photographer. Based in Bogotá, Colombia. I approach projects with a global vision, talking with the client to understand their brand and its DNA, focusing on what is the best way to implement an idea for the project, and how to translate it across various media: from web architecture and user experience design, to photography, illustration, and comprehensive branding.',

      'about.p2': 'As a UX/UI designer. My goal is to transform a brand\'s vision into engaging digital and tangible experiences that are clear and authentic. I currently work as an independent freelance professional, helping my clients to tell their stories through design.',

      'about.p3': 'My work is an extension of my lifestyle: I am constantly learning about technology, tendencies, techniques. Always looking for references. I look for aesthetics everywhere, whether in the forms of nature, architecture, urban colors, pop culture or everyday details. I strongly believe that constant learning is the best way to create good design.',

      'about.p4': 'My process begins with listening. It\'s not just about delivering a design, but about co-creating a visual language, that is the way to create good design. By talking with you we can understand your Brand\'s DNA, translating it coherently into any format you need — whether it\'s relaunching your web platform, defining your photographic style, or conceptualizing your entire branding. Let\'s work together to ensure your design doesn\'t just look good, but feels authentic and delivers a tangible impact on your audience.',
    },

    es: {
      'footer.rights': '© 2026 Todos los derechos reservados',

      'about.p1': 'Director de Arte Senior y Fotógrafo. Basado en Bogotá, Colombia. Abordo los proyectos con una visión global, conversando con el cliente para entender su marca y su ADN, enfocándome en la mejor manera de implementar una idea para el proyecto, y cómo traducirla a través de diversos medios: desde arquitectura web y diseño de experiencia de usuario, hasta fotografía, ilustración y branding integral.',

      'about.p2': 'Como diseñador UX/UI. Mi objetivo es transformar la visión de una marca en experiencias digitales y tangibles atractivas, claras y auténticas. Actualmente trabajo como profesional independiente freelance, ayudando a mis clientes a contar sus historias a través del diseño.',

      'about.p3': 'Mi trabajo es una extensión de mi estilo de vida: estoy constantemente aprendiendo sobre tecnología, tendencias y técnicas. Siempre buscando referencias. Busco la estética en todas partes, ya sea en las formas de la naturaleza, la arquitectura, los colores urbanos, la cultura pop o los detalles cotidianos. Creo firmemente que el aprendizaje constante es la mejor manera de crear buen diseño.',

      'about.p4': 'Mi proceso comienza con escuchar. No se trata solo de entregar un diseño, sino de co-crear un lenguaje visual — esa es la manera de crear buen diseño. Al hablar contigo podemos comprender el ADN de tu marca, traduciéndolo coherentemente a cualquier formato que necesites, ya sea relanzando tu plataforma web, definiendo tu estilo fotográfico o conceptualizando todo tu branding. Trabajemos juntos para asegurar que tu diseño no solo se vea bien, sino que se sienta auténtico y genere un impacto tangible en tu audiencia.',
    },
  };

  const STORAGE_KEY = 'portfolio_lang';
  const DEFAULT_LANG = 'en';

  // ── LANGUAGE MANAGER ────────────────────────────────────────────────────────
  const LanguageManager = {
    current: null,

    /**
     * Called once at DOMContentLoaded.
     * Reads saved preference (or falls back to default) and applies it.
     */
    init() {
      const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
      this._apply(saved, false);
      this._setupButtons();
    },

    /**
     * Switches the active language, updates DOM, and persists the choice.
     */
    setLanguage(lang) {
      if (lang === this.current) return;
      this._apply(lang, true);
    },

    // ── Private ──────────────────────────────────────────────────────────────

    _apply(lang, persist) {
      if (!TRANSLATIONS[lang]) return;
      this.current = lang;

      // Update the HTML lang attribute for screen readers / SEO
      document.documentElement.lang = lang;

      // Translate every [data-i18n] element that is NOT managed by Splitting.js
      document.querySelectorAll('[data-i18n]').forEach(el => {
        if (el.hasAttribute('data-splitting')) return; // Splitting.js owns these
        const key = el.getAttribute('data-i18n');
        const value = TRANSLATIONS[lang][key];
        if (value !== undefined) el.textContent = value;
      });

      // Sync button active states
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });

      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch (_) {
          // localStorage blocked (private browsing, storage full) — fail silently
        }
      }
    },

    _setupButtons() {
      // Use event delegation on the container so clicks on Splitting.js char-spans
      // still bubble up and are caught correctly.
      const toggle = document.querySelector('.language-toggle');
      if (!toggle) return;

      toggle.addEventListener('click', e => {
        const btn = e.target.closest('.lang-btn');
        if (btn && btn.dataset.lang) this.setLanguage(btn.dataset.lang);
      });
    },
  };

  // Expose for optional external access (e.g. script.js, future sections)
  window.LanguageManager = LanguageManager;

  // Apply before Splitting.js runs
  document.addEventListener('DOMContentLoaded', () => LanguageManager.init());

})();
