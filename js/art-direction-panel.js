/* ── Art Direction — discipline selector + works list ────────────────────────
   Data-driven: WORKS_DATA is the source of truth.
   DOM rows are always generated from it — never authored in HTML.
   ─────────────────────────────────────────────────────────────────────────── */

const WORKS_DATA = {
  web: [
    {
      num: '01', cat: 'Web', title: 'Alquería Virtual Event', sub: 'UX/UI for virtual event platform',
      specs: [['Scope','Landing · Login · UX/UI'],['Tools','Figma · Photoshop'],['Year','2021'],['Mode','Studio']],
      tags: ['UX/UI','Landing','Virtual Event'],
      bg: 'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-mockup-01-2021.webp',
      images: [
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-mockup-01-2021.webp',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-mockup-02-2021.webp',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-login-2021.webp',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-streaming-2021.webp',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-homepage-screen-2021.jpg',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-login-screen-2021.jpg',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-streaming-screen-2021.jpg',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-streaming-logos-screen-2021.jpg'
      ]
    },
    {
      num: '02', cat: 'Web', title: 'Siemens Couch Party', sub: 'New Year virtual event, Siemens Healthineers',
      specs: [['Scope','Landing · Email · Motion'],['Tools','Figma · After Effects'],['Year','2020'],['Mode','Agency']],
      tags: ['Virtual Event','Motion','Email Design'],
      bg: 'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-virtual-event-mockup-2020.webp',
      images: [
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-virtual-event-mockup-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-virtual-new-year-event-landing-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-invitation-email-animated-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-save-the-date-animated-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-virtual-event-logo-animated-2020logo.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-login-animation-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-save-the-date-animation-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-menu-animation-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-email-animation-02-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-email-animation-03-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-web-experience-2020.jpg',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-welcome-kit-2020.jpg'
      ]
    },
    {
      num: '03', cat: 'Web', title: 'Siemens Together Land', sub: 'Virtual event platform, Siemens Healthineers',
      specs: [['Scope','Landing · Email · Motion'],['Tools','Figma · After Effects'],['Year','2021'],['Mode','Agency']],
      tags: ['Virtual Event','Motion','Landing'],
      bg: 'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-virtual-event-mockup-01-2021.webp',
      images: [
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-virtual-event-mockup-01-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-virtual-event-mockup-02-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-event-animated-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-invitation-email-animated-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-poster-2021.png'
      ]
    },
    {
      num: '04', cat: 'Web', title: 'CAF-LIF Contest', sub: 'Entrepreneurship contest landing page',
      specs: [['Scope','Landing · UX · Art Direction'],['Tools','Figma · Photoshop'],['Year','2020'],['Mode','Freelance']],
      tags: ['Landing','Contest','Innovation'],
      whiteBg: true, // artwork has transparency — render on a white surface
      bg: 'images/art-direction/caflif/sergio-ayala-caf-lif-entrepreneurship-contest-landing-mockup-2020.webp',
      images: [
        'images/art-direction/caflif/sergio-ayala-caf-lif-entrepreneurship-contest-landing-mockup-2020.webp',
        'images/art-direction/caflif/sergio-ayala-caf-lif-entrepreneurship-contest-landing-2020.webp'
      ]
    },
    {
      num: '05', cat: 'Web', title: 'Reality Shift', sub: 'Platzi × Lovable AI contest website',
      specs: [['Scope','Web Design · UI · AI Build'],['Tools','Lovable · Figma'],['Year','2025'],['Mode','Contest']],
      tags: ['AI Build','Web','Contest'],
      bg: 'images/art-direction/reality shift/sergio-ayala-reality-shift-lovable-platzi-contest-website-2025.webp',
      images: [
        'images/art-direction/reality shift/sergio-ayala-reality-shift-lovable-platzi-contest-website-2025.webp',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-lovable-platzi-contest-website-detail-2025.png'
      ]
    },
    {
      num: '06', cat: 'Web', title: 'Global Trading Website', sub: 'Web design for food ingredients brand',
      specs: [['Scope','Web Design · UI · Responsive'],['Tools','Figma · Photoshop'],['Year','2021'],['Mode','Client']],
      tags: ['Web','Responsive','Brand'],
      bg: 'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-design-desktop-mobile-2021.webp'
    },
    {
      num: '07', cat: 'Web', title: 'Siemens — Pollaya', sub: 'Copa América prediction game for Siemens employees',
      specs: [['Scope','Web Design · UI · Game'],['Tools','Figma · Photoshop'],['Year','2021'],['Mode','Agency']],
      tags: ['Web','Game','UX/UI'],
      bg: 'images/art-direction/Sieemens/pollaya/sergio-ayala-siemens-healthineers-pollaya-copa-america-dashboard-2021.png',
      images: [
        'images/art-direction/Sieemens/pollaya/sergio-ayala-siemens-healthineers-pollaya-copa-america-dashboard-2021.png',
        'images/art-direction/Sieemens/pollaya/sergio-ayala-siemens-healthineers-pollaya-copa-america-registro-2021.png'
      ]
    }
  ],
  editorial: [
    {
      num: '01', cat: 'Editorial', title: 'Global Trading — General Catalog', sub: 'Product catalog for Alimentec food fair',
      specs: [['Scope','Print · Catalog · Layout'],['Tools','InDesign · Illustrator'],['Year','2026'],['Mode','Client']],
      tags: ['Print','Catalog','Food Industry'],
      bg: 'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-01-2026.webp',
      images: [
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-01-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-02-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-03-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-04-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-05-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-06-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-07-2026.webp',
        'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-08-2026.webp'
      ]
    },
    {
      num: '02', cat: 'Editorial', title: 'Global Trading — Bakery Catalog', sub: 'Specialty catalog for baking ingredients',
      specs: [['Scope','Print · Catalog · Layout'],['Tools','InDesign · Illustrator'],['Year','2026'],['Mode','Client']],
      tags: ['Print','Bakery','Catalog'],
      bg: 'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-01-2026.webp',
      images: [
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-01-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-02-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-03-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-04-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-05-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-06-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-07-2026.webp',
        'images/art-direction/Global trading de col/panificacion catalogo/sergio-ayala-global-trading-panificacion-catalog-page-08-2026.webp'
      ]
    },
    {
      num: '03', cat: 'Editorial', title: 'Global Trading — Trade Fair Print', sub: 'Flyer & lightbox banner for Alimentec',
      specs: [['Scope','Flyer · Large Format'],['Tools','Illustrator · Photoshop'],['Year','2026'],['Mode','Client']],
      tags: ['Print','Large Format','Trade Fair'],
      bg: 'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-lightbox-banner-2026.webp',
      images: [
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-lightbox-banner-2026.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-kitchen-brothers-flyer-2026.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-booth-photo-2026.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-event-photo-2026.png',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-product-info-sheet-2026.png'
      ]
    }
  ],
  identity: [
    {
      num: '01', cat: 'Identity', title: 'Travels Gourmet', sub: 'Full brand identity for culinary tourism',
      desc: 'Complete identity for a culinary tourism venture operating between Colombia and Chile — logo system, stationery and print collateral built around a warm gastronomic palette. The mark pairs travel iconography with kitchen craft, extended across <a href="#" target="_blank" rel="noopener noreferrer">letterhead</a> and a <a href="#" target="_blank" rel="noopener noreferrer">presentation folder</a>.',
      specs: [['Scope','Logo · Stationery · Print'],['Tools','Illustrator · InDesign'],['Year','2020'],['Mode','Freelance']],
      tags: ['Logo','Identity','Print'],
      whiteBg: true, // artwork has transparency — render on a white surface
      bg: 'images/art-direction/travels gourmet/sergio-ayala-travels-gourmet-logo-brand-identity-colombia-chile.webp',
      images: [
        'images/art-direction/travels gourmet/sergio-ayala-travels-gourmet-logo-brand-identity-colombia-chile.webp',
        'images/art-direction/travels gourmet/sergio-ayala-travels-gourmet-letterhead-brand-identity-colombia-chile.webp',
        'images/art-direction/travels gourmet/sergio-ayala-travels-gourmet-presentation-folder-brand-identity-colombia-chile.webp',
        'images/art-direction/travels gourmet/sergio-ayala-travels-gourmet-presentation-folder-mockup-brand-identity-2020.png',
        'images/art-direction/travels gourmet/sergio-ayala-travels-gourmet-letterhead-mockup-brand-identity-2020.png'
      ]
    },
    {
      num: '02', cat: 'Identity', title: 'Cata — Event Manager', sub: 'Business card & stationery system',
      specs: [['Scope','Business Card · Stationery'],['Tools','Illustrator · InDesign'],['Year','2021'],['Mode','Freelance']],
      tags: ['Stationery','Print','Identity'],
      bg: 'images/art-direction/Cata/sergio-ayala-event-manager-business-card-design-2021.webp',
      images: [
        'images/art-direction/Cata/sergio-ayala-event-manager-business-card-design-2021.webp',
        'images/art-direction/Cata/sergio-ayala-event-manager-business-card-mockup-2021.webp'
      ]
    },
    {
      num: '03', cat: 'Identity', title: 'Animated Personal Logo', sub: '169-frame brand animation, 8 seconds',
      specs: [['Scope','Identity · Motion · Brand'],['Tools','After Effects · Illustrator'],['Year','2019'],['Mode','Personal']],
      tags: ['Identity','Motion','Brand'],
      bg: 'images/art-direction/sergio-ayala-animated-portfolio-logo-art-direction.webp'
    },
    {
      num: '04', cat: 'Identity', title: 'Bon Appétit', sub: 'Logo design for bakery food brand',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2019'],['Mode','Freelance']],
      tags: ['Logo','Bakery','Food Brand'],
      bg: 'images/art-direction/logos/sergio-ayala-bon-apetit-bakery-logo-design-colombia-2019.webp'
    },
    {
      num: '05', cat: 'Identity', title: 'Ceres', sub: 'Logo for natural products e-commerce',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2020'],['Mode','Freelance']],
      tags: ['Logo','Organic','E-Commerce'],
      whiteBg: true, // logo has transparency — render on a white surface
      bg: 'images/art-direction/logos/sergio-ayala-ceres-natural-products-ecommerce-logo-2020.webp'
    },
    {
      num: '06', cat: 'Identity', title: 'Magistrado', sub: 'Logo for Latin experimental music band',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2017'],['Mode','Freelance']],
      tags: ['Logo','Music','Identity'],
      whiteBg: true, // logo has transparency — render on a white surface
      bg: 'images/art-direction/logos/sergio-ayala-magistrado-latin-experimental-music-band-logo-2017.webp'
    },
    {
      num: '07', cat: 'Identity', title: 'Quindiorellanas', sub: 'Logo for mushroom food startup',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2017'],['Mode','Freelance']],
      tags: ['Logo','Startup','Food Brand'],
      whiteBg: true, // logo has transparency — render on a white surface
      bg: 'images/art-direction/logos/sergio-ayala-quindiorellanas-mushroom-brand-logo-colombia-2017.webp'
    },
    {
      num: '08', cat: 'Identity', title: 'RetroTech', sub: 'Logo for recycled tech furniture brand',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2022'],['Mode','Freelance']],
      tags: ['Logo','Sustainable','Identity'],
      bg: 'images/art-direction/logos/sergio-ayala-retrotech-recycled-tech-furniture-brand-logo-2022.webp'
    }
  ],
  // 3D entries carry a `model` (GLB) — the modal stage renders an interactive
  // <model-viewer> for them. An optional `bg` feeds the row hover preview only;
  // the modal backdrop stays the shared discipline image.
  '3d': [
    {
      num: '01', cat: '3D', title: 'Pikapool', sub: 'Stylized character mashup — interactive 3D model',
      specs: [['Scope','Character · 3D Model'],['Tools','Blender'],['Year','2026'],['Mode','Personal']],
      tags: ['3D','Character','Real-Time'],
      model: 'images/3D/Pikapool-web.glb'
    },
    {
      num: '02', cat: '3D', title: 'Tib', sub: 'Original character — interactive 3D model',
      specs: [['Scope','Character · 3D Model'],['Tools','Blender'],['Year','2026'],['Mode','Personal']],
      tags: ['3D','Character','Real-Time'],
      model: 'images/3D/Tib-web.glb'
    },
    {
      num: '03', cat: '3D', title: 'Throg', sub: 'Creature character sculpt — interactive 3D model',
      specs: [['Scope','Character · 3D Model'],['Tools','Blender'],['Year','2026'],['Mode','Personal']],
      tags: ['3D','Character','Real-Time'],
      bg: 'images/art-direction/3d/sergio-ayala-throg-3d-character-sculpt-2026.png',
      model: 'images/3D/Throg-web.glb'
    }
  ]
};

// Shown in the project modal when an entry has no `desc` yet.
// `desc` is an HTML string — inline <a> tags become linked words in the paragraph.
const AD_PM_DESC_PLACEHOLDER =
  'Short description of the brief, the concept and the craft behind this project — ' +
  'mockup copy for now. References like <a href="#" target="_blank" rel="noopener noreferrer">linked words</a> ' +
  'and <a href="#" target="_blank" rel="noopener noreferrer">related work</a> sit inline within the paragraph.';

// Shared modal backdrop per discipline — when set, the full-bleed background
// behind the deco frame uses this image for every project in the category
// (and stays fixed while thumbnails swap the stage image).
const DISCIPLINE_BACKDROPS = {
  identity:  'images/sergio-ayala-identity-projects-backdrop-art-direction.webp',
  web:       'images/sergio-ayala-web-projects-backdrop-art-direction.webp',
  editorial: 'images/sergio-ayala-editorial-projects-backdrop-art-direction.webp',
  '3d':      'images/sergio-ayala-3d-projects-backdrop-art-direction.webp'
};

// Display labels — '3d' can't be derived by capitalising the key.
const DISCIPLINE_LABELS = {
  identity:  'Identity',
  web:       'Web',
  editorial: 'Editorial',
  '3d':      '3D'
};

class ArtWorksPanel {
    constructor() {
        this.panel    = document.querySelector('#art-direction .ad-works-panel');
        if (!this.panel) return;

        this.table         = this.panel.querySelector('.ad-works-table');
        this.discName      = this.panel.querySelector('.ad-works-disc-name');
        this.section       = document.getElementById('art-direction');
        this.navSvg        = document.querySelector('#art-direction .ad-explore-card .ad-nav-svg');
        this.navItems      = [...document.querySelectorAll('#art-direction .ad-explore-card .adnav-cat[data-discipline]')];

        this.activeDiscipline = null;
        this._transitioning   = false;

        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            const choose = () => {
                this._dismissIntro();
                this.selectDiscipline(item.dataset.discipline);
            };
            item.addEventListener('click', choose);
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose();
                }
            });
        });

        // Show intro card; pre-populate identity data silently so first click is instant
        if (this.section) this.section.classList.add('ad-intro-active');
        this.panel.classList.add('ad-works-ready');
        this._initModal();
        this._initRowPreview();
        this.selectDiscipline('identity', true);
    }

    _dismissIntro() {
        if (this.section) this.section.classList.remove('ad-intro-active');
    }

    // ── Discipline selection ──────────────────────────────────────────────────

    selectDiscipline(key, immediate = false) {
        if (this._transitioning || key === this.activeDiscipline) return;
        if (!WORKS_DATA[key]) return;

        this._transitioning   = true;
        this.activeDiscipline = key;

        // Discipline contains 3D models — start fetching the viewer bundle now
        // so the modal opens without a library-download stall.
        if (WORKS_DATA[key].some(w => w.model)) this._ensureModelViewer();

        if (!immediate) {
            // First real selection ends the nav card's attract cycle — the
            // amber highlight becomes a pure active-state indicator.
            this.navSvg?.classList.add('has-active');
            this.navItems.forEach(item => {
                const active = item.dataset.discipline === key;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-pressed', String(active));
            });
        }

        const activeSpan = this.navItems
            .find(item => item.dataset.discipline === key)
            ?.querySelector('.adnav-label');

        const label = `· ${DISCIPLINE_LABELS[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))} ·`;

        if (immediate) {
            this._renderRows(key);
            this._animateRowsIn();
            if (this.discName) this.discName.textContent = label;
            return;
        }

        let tableReady   = false;
        let scrambleDone = false;

        const tryAnimate = () => {
            if (!tableReady || !scrambleDone) return;
            this.table.style.opacity = '';
            this._animateRowsIn();
        };

        this.table.classList.add('is-leaving');
        setTimeout(() => {
            this._renderRows(key);
            this.table.classList.remove('is-leaving');
            this.table.style.opacity = '0';
            tableReady = true;
            tryAnimate();
        }, 160);

        this._scrambleText(activeSpan, () => {
            scrambleDone = true;
            tryAnimate();
        });

        if (this.discName) this._scrambleText(this.discName, null, label);
    }

    // ── Scramble animation ────────────────────────────────────────────────────

    _scrambleText(el, onDone, overrideTarget) {
        if (!el) { onDone?.(); return; }
        const CHARS     = '!<>-_\\/[]{}—=+*^?#∆◊§øΩ†‡';
        const FRAME_MS  = 38;
        const finalText = overrideTarget || el.getAttribute('data-content') || el.textContent;
        const chars     = [...finalText];
        const n         = chars.length;
        const resolveAt = i => i * FRAME_MS;
        const maxResolve = resolveAt(n - 1);
        let elapsed = 0;
        const tick = () => {
            let out = '';
            for (let i = 0; i < n; i++) {
                out += elapsed >= resolveAt(i)
                    ? chars[i]
                    : CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            el.textContent = out;
            elapsed += FRAME_MS;
            if (elapsed <= maxResolve + FRAME_MS) {
                setTimeout(tick, FRAME_MS);
            } else {
                el.textContent = finalText;
                onDone?.();
            }
        };
        tick();
    }

    // ── Row rendering ─────────────────────────────────────────────────────────

    _renderRows(key) {
        const works = WORKS_DATA[key];

        if (!works.length) {
            this.table.innerHTML = `
            <div class="ad-works-empty" aria-live="polite">
                <span class="ad-works-empty-text">· s e l e c t i o n &nbsp;i n &nbsp;p r o g r e s s ·</span>
            </div>`;
            return;
        }

        this.table.innerHTML = works.map(w => {
            const scope = w.specs.find(s => s[0] === 'Scope')?.[1] ?? '—';
            const tools = w.specs.find(s => s[0] === 'Tools')?.[1] ?? '—';
            const year  = w.specs.find(s => s[0] === 'Year')?.[1]  ?? '—';
            return `
            <div class="ad-work-item" role="listitem" tabindex="0" aria-label="Open ${w.title}">
                <span class="ad-work-data ad-work-title">${w.title}</span>
                <span class="ad-work-data ad-work-scope">${scope}</span>
                <span class="ad-work-data ad-work-tools">${tools}</span>
                <span class="ad-work-data ad-work-year">${year}</span>
            </div>`;
        }).join('');

        this.table.querySelectorAll('.ad-work-item').forEach((row, i) => {
            row.addEventListener('click', () => this._openModal(works[i]));
            row.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._openModal(works[i]);
                }
            });
            row.addEventListener('mouseenter', () => {
                const titleEl = row.querySelector('.ad-work-title');
                if (titleEl) this._scrambleText(titleEl);
                if (works[i].bg) this._showRowPreview(works[i].bg, works[i].whiteBg);
            });
            row.addEventListener('mouseleave', () => this._hideRowPreview());
        });
    }

    _animateRowsIn() {
        const rows = [...this.table.querySelectorAll('.ad-work-item')];
        if (!rows.length) {
            // Empty discipline — still un-hide the table so the empty state shows.
            this.table.style.opacity = '1';
            this._transitioning = false;
            return;
        }

        rows.forEach((row, i) => {
            row.style.setProperty('--row-index', i);
            row.classList.add('ad-row-entering');
        });
        void this.table.offsetWidth; // flush CSSOM so entering state is computed

        rows.forEach(row => {
            row.classList.remove('ad-row-entering');
            row.classList.add('ad-row-visible');
        });

        // Cleanup after the last row's transition ends.
        // Last stagger delay: 20ms + (n-1) * 60ms. Duration: --duration-quick (200ms).
        const lastDelay = 20 + (rows.length - 1) * 60;
        setTimeout(() => {
            rows.forEach(r => {
                r.classList.remove('ad-row-visible');
                r.style.removeProperty('--row-index');
            });
            this._transitioning = false;
        }, lastDelay + 220); // 200 = --duration-quick, 20 = settle buffer

        this.table.style.opacity = '1';
    }

    // ── Floating row preview ──────────────────────────────────────────────────

    _initRowPreview() {
        this._preview          = document.getElementById('adRowPreview');
        this._previewVisible   = false;
        this._previewTargetX   = 0;
        this._previewTargetY   = 0;
        this._previewRafPending = false;
        this._PREVIEW_W        = 200;
        this._PREVIEW_H        = 260;

        const zone = document.querySelector('#art-direction .ad-works-zone');
        if (zone) {
            zone.addEventListener('mousemove', e => this._moveRowPreview(e), { passive: true });
        }
    }

    _showRowPreview(imageUrl, whiteBg = false) {
        if (!this._preview) return;
        this._preview.classList.toggle('is-white', !!whiteBg);
        this._preview.style.backgroundImage = `url('${imageUrl}')`;
        this._preview.style.transform       = `translate(${this._previewTargetX}px,${this._previewTargetY}px)`;
        this._preview.style.opacity         = '1';
        this._preview.classList.add('is-visible');
        this._previewVisible = true;
    }

    _hideRowPreview() {
        if (!this._preview) return;
        this._preview.style.opacity = '0';
        this._preview.classList.remove('is-visible');
        this._previewVisible = false;
    }

    _moveRowPreview(e) {
        const OFFSET_X = 24;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let x = e.clientX + OFFSET_X;
        let y = e.clientY - (this._PREVIEW_H >> 1);

        if (x + this._PREVIEW_W > vw - 8) x = e.clientX - this._PREVIEW_W - OFFSET_X;
        if (y < 8)                         y = 8;
        if (y + this._PREVIEW_H > vh - 8)  y = vh - this._PREVIEW_H - 8;

        this._previewTargetX = x;
        this._previewTargetY = y;

        if (!this._previewVisible || this._previewRafPending) return;
        this._previewRafPending = true;
        requestAnimationFrame(() => {
            this._preview.style.transform = `translate(${this._previewTargetX}px,${this._previewTargetY}px)`;
            this._previewRafPending = false;
        });
    }

    // ── Modal ─────────────────────────────────────────────────────────────────

    _initModal() {
        this.modal     = document.querySelector('#art-direction .ad-project-modal');
        if (!this.modal) return;

        this.modalBg     = this.modal.querySelector('.ad-pm-bg');
        this.modalStage  = this.modal.querySelector('.ad-pm-stage');
        this.modalStageImg = this.modal.querySelector('.ad-pm-stage-img');
        this.modalNum    = this.modal.querySelector('.ad-pm-num');
        this.modalCat    = this.modal.querySelector('.ad-pm-cat');
        this.modalTitle  = this.modal.querySelector('.ad-pm-title');
        this.modalSub    = this.modal.querySelector('.ad-pm-sub');
        this.modalDesc   = this.modal.querySelector('.ad-pm-desc');
        this.modalSpecs  = this.modal.querySelector('.ad-pm-specs');
        this.modalTags   = this.modal.querySelector('.ad-pm-tags');
        this.modalThumbs = this.modal.querySelector('.ad-pm-thumbs');
        this.modalClose  = this.modal.querySelector('.ad-pm-close');
        this._triggerEl  = null;

        this.modalClose.addEventListener('click', () => this._closeModal());

        this.modal.addEventListener('click', e => {
            if (e.target === this.modal || e.target.classList.contains('ad-pm-backdrop')) {
                this._closeModal();
            }
        });

        document.addEventListener('keydown', e => {
            if (!this.modal.classList.contains('is-open')) return;

            if (e.key === 'Escape') {
                this._closeModal();
                return;
            }

            if (e.key === 'Tab') {
                const focusable = Array.from(
                    this.modal.querySelectorAll(
                        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    )
                ).filter(el => el.offsetParent !== null);

                if (!focusable.length) { e.preventDefault(); return; }

                const first = focusable[0];
                const last  = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    _openModal(work) {
        if (!this.modal) return;

        this._triggerEl = document.activeElement;

        this.modal.classList.toggle('is-white-media', !!work.whiteBg);
        this._fixedBackdrop = DISCIPLINE_BACKDROPS[this.activeDiscipline] ?? null;

        if (this.modalBg) {
            const backdrop = this._fixedBackdrop || work.bg;
            this.modalBg.style.backgroundImage = backdrop ? `url('${backdrop}')` : 'none';
        }

        // Stage media — interactive 3D model or static image
        clearTimeout(this._mvTeardownTimer);
        this._teardownModelViewer();
        if (work.model) this._mountModelViewer(work);

        if (this.modalStageImg) {
            if (work.bg && !work.model) {
                this.modalStageImg.src = work.bg;
                this.modalStageImg.alt = `${work.title} — project image`;
            } else {
                this.modalStageImg.removeAttribute('src');
                this.modalStageImg.alt = '';
            }
        }

        this.modalNum.textContent   = work.num;
        this.modalCat.textContent   = `· ${work.cat.toUpperCase()} ·`;
        this.modalTitle.textContent = work.title;
        this.modalSub.textContent   = work.sub;

        if (this.modalDesc) {
            this.modalDesc.innerHTML = work.desc ?? AD_PM_DESC_PLACEHOLDER;
        }

        this.modalSpecs.innerHTML = work.specs.map(([k, v]) => `
            <div class="ad-pm-spec-row">
                <span class="ad-pm-spec-key">${k}</span>
                <span class="ad-pm-spec-val">${v}</span>
            </div>`).join('');

        this.modalTags.innerHTML = work.tags.map(t => `
            <span class="ad-pm-tag"><span class="ad-pm-dot"></span>${t}</span>`).join('');

        if (this.modalThumbs) {
            const imgs = work.images;
            if (imgs && imgs.length > 1) {
                this.modalThumbs.innerHTML = imgs.map((src, i) =>
                    `<div class="ad-pm-thumb${i === 0 ? ' is-active' : ''}" role="listitem"
                          style="background-image:url('${src}')"
                          tabindex="0"
                          aria-label="Image ${i + 1} of ${imgs.length}"></div>`
                ).join('');
                this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((thumb, i) => {
                    thumb.addEventListener('click', () => this._switchModalImage(imgs[i], i));
                    thumb.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this._switchModalImage(imgs[i], i);
                        }
                    });
                });
            } else {
                this.modalThumbs.innerHTML = '';
            }
        }

        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => this.modalClose.focus());
    }

    _switchModalImage(src, index) {
        if (this.modalBg && !this._fixedBackdrop) {
            this.modalBg.style.backgroundImage = `url('${src}')`;
        }
        if (this.modalStageImg) {
            this.modalStageImg.src = src;
        }
        if (this.modalThumbs) {
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((t, i) => {
                t.classList.toggle('is-active', i === index);
            });
        }
    }

    _closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this._triggerEl?.focus();
        this._triggerEl = null;
        // Free the WebGL context once the fade-out (0.22s) has finished.
        this._mvTeardownTimer = setTimeout(() => this._teardownModelViewer(), 240);
    }

    // ── 3D model stage ────────────────────────────────────────────────────────

    // Lazy-load the self-hosted <model-viewer> bundle on first need.
    // The Draco decoder location must be configured before the module runs —
    // the default points at Google's CDN, which this site's CSP blocks.
    _ensureModelViewer() {
        const DRACO_PATH = 'js/lib/draco/';
        const Defined = customElements.get('model-viewer');
        if (Defined) {
            // Module already evaluated (e.g. loaded eagerly elsewhere) — the
            // global-object config was consumed at eval time with the CDN
            // default; repoint the decoder via the class's static setter.
            Defined.dracoDecoderLocation = DRACO_PATH;
            return;
        }
        if (this._mvRequested) return;
        this._mvRequested = true;
        self.ModelViewerElement = Object.assign(self.ModelViewerElement || {}, {
            dracoDecoderLocation: DRACO_PATH
        });
        const s = document.createElement('script');
        s.type = 'module';
        s.src  = 'js/lib/model-viewer.min.js';
        document.head.appendChild(s);
    }

    _mountModelViewer(work) {
        if (!this.modalStage) return;
        this._ensureModelViewer();
        const mv = document.createElement('model-viewer');
        mv.className = 'ad-pm-model';
        mv.setAttribute('src', work.model);
        mv.setAttribute('alt', `${work.title} — interactive 3D model`);
        mv.setAttribute('loading', 'eager');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('auto-rotate-delay', '0');
        mv.setAttribute('rotation-per-second', '32deg');
        mv.setAttribute('shadow-intensity', '1');
        mv.setAttribute('touch-action', 'pan-y');

        // Reveal sequence: the red deco frame draws first; the model fades in
        // only once the GLB has loaded AND the frame has had time to appear —
        // so a cached model still enters after the frame, never before.
        // Fail-open: on 'error' or a stalled load (10s), reveal anyway so the
        // stage can never be stranded invisible.
        const frameDrawn = new Promise(r => setTimeout(r, 900));
        const modelReady = new Promise(r => {
            mv.addEventListener('load',  r, { once: true });
            mv.addEventListener('error', e => {
                console.warn('[ad-3d] model failed to load:', work.model, e.detail);
                r();
            }, { once: true });
            setTimeout(r, 10000);
        });
        Promise.all([frameDrawn, modelReady]).then(() => mv.classList.add('is-loaded'));

        this.modalStage.classList.add('has-model');
        this.modalStage.appendChild(mv);
    }

    _teardownModelViewer() {
        if (!this.modalStage) return;
        this.modalStage.classList.remove('has-model');
        this.modalStage.querySelector('.ad-pm-model')?.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArtWorksPanel();
});
