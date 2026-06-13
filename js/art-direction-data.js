/* ── Art Direction — project catalog & discipline constants ──────────────────
   Pure data, no behaviour. Source of truth for the works list, modal content,
   per-discipline backdrops and labels. ArtWorksPanel (art-direction-panel.js)
   generates all DOM from WORKS_DATA — rows are never authored in HTML.

   Declared as top-level `const`s (global lexical scope) so art-direction-panel.js
   can reference them directly. MUST load before art-direction-panel.js.
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
