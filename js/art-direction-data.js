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
      num: '01', cat: 'Web', title: 'Alquería Virtual Event', sub: 'UX/UI para plataforma de evento virtual',
      desc: 'Diseño UX/UI de la plataforma para un evento virtual de Alquería, la compañía láctea colombiana, realizado durante la pandemia por encargo de la agencia <a href="https://www.linkedin.com/in/amparo-sarmiento-066bb76a/" target="_blank" rel="noopener noreferrer">Somos Producciones</a>. El sitio cubre el flujo completo del asistente: registro, login y sala de streaming con chat en vivo. La gráfica parte del universo de la marca para llevar la identidad al entorno digital del evento.',
      specs: [['Scope','Landing · Login · UX/UI'],['Tools','Figma · Photoshop'],['Year','2021'],['Mode','Studio']],
      tags: ['UX/UI','Landing','Virtual Event'],
      bg: 'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-mockup-01-2021.webp',
      images: [
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-mockup-01-2021.webp',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-mockup-02-2021.webp',
        'images/art-direction/Alqueria/sergio-ayala-alqueria-virtual-event-landing-login-2021.webp',
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
      num: '01', cat: 'Identity', title: 'Travels Gourmet', sub: 'Identidad de marca para logística y alimentos',
      desc: 'Identidad completa para una empresa de logística y productos alimenticios con sede en Colombia y Chile: sistema de logo y papelería. El cliente buscaba un diseño simple y corporativo: una paleta neutra apoyada en un juego tipográfico define el tono de la marca y unifica todas las piezas del sistema.',
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
      num: '02', cat: 'Identity', title: 'Cata — Event Manager', sub: 'Tarjeta de presentación y sistema de papelería',
      desc: 'Marca personal para <a href="https://www.linkedin.com/in/catalina-ballesteros-a75a4527/" target="_blank" rel="noopener noreferrer">Catalina Ballesteros</a>, en ese momento organizadora independiente de eventos corporativos. El concepto es colorido y dinámico: un juego tipográfico transforma la "C" en un bombillo encendido, el referente universal de la idea, sobre un fondo de engranajes que representa cómo las ideas de Catalina encajan con las de sus clientes para desarrollar grandes eventos. La clienta buscaba una tarjeta de presentación personal, colorida y con elementos que hicieran referencia a sus ideas y a su trabajo en equipo.',
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
      desc: 'Logo animado que usé como marca de mi antigua página web (hoy fuera de línea). Es un juego de palabras entre mis iniciales y la palabra <em>smart</em>, que a su vez contiene <em>art</em>: la "a" destacada en forma de lápiz es la de mi apellido, Ayala. La pieza ilustra cómo se exprime un cerebro para sacar la idea, dibujada con un trazo continuo que al final se transforma en la "A". Animada cuadro a cuadro en Procreate como parte de mi propio branding.',
      specs: [['Scope','Identity · Motion · Brand'],['Tools','Procreate'],['Year','2019'],['Mode','Personal']],
      tags: ['Identity','Motion','Brand'],
      bg: 'images/art-direction/sergio-ayala-animated-portfolio-logo-art-direction.webp'
    },
    {
      num: '04', cat: 'Identity', title: 'Bon Appétit', sub: 'Diseño de logo para marca de panadería',
      desc: 'Logo para una panadería local. El concepto transforma las iniciales de Bon Appétit, la "B" y la "A", en una espiga de trigo. La clienta buscaba un diseño elegante y artesanal.',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2019'],['Mode','Freelance']],
      tags: ['Logo','Bakery','Food Brand'],
      bg: 'images/art-direction/logos/sergio-ayala-bon-apetit-bakery-logo-design-colombia-2019.webp'
    },
    {
      num: '05', cat: 'Identity', title: 'Ceres', sub: 'Logo para e-commerce de productos naturales',
      desc: 'Logo para un emprendimiento de venta de productos naturales. El símbolo parte de una espiga de trigo que se transforma en un horizonte, evocando un amanecer o atardecer sobre un cultivo. La tipografía custom, de inspiración clásica, remite a Ceres, la diosa romana de la agricultura y las cosechas. El conjunto busca un tono elegante y artesanal, a la vez que moderno.',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2020'],['Mode','Freelance']],
      tags: ['Logo','Organic','E-Commerce'],
      whiteBg: true, // logo has transparency — render on a white surface
      bg: 'images/art-direction/logos/sergio-ayala-ceres-natural-products-ecommerce-logo-2020.webp'
    },
    {
      num: '06', cat: 'Identity', title: 'Magistrado Tocineta', sub: 'Logo/mascota para banda de música experimental',
      desc: 'Logo y mascota para <a href="https://www.instagram.com/magistrado_tocineta_oficial" target="_blank" rel="noopener noreferrer">Magistrado Tocineta</a>, una banda de rock y fusión latina experimental. El personaje es un cerdo corrupto y politiquero, con corbatín de tocino, inspirado en los <em>cartoons</em> vintage de los años 20 y 30, presentado dentro de un sello que parodia el de aprobación de contratos políticos.',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2017'],['Mode','Freelance']],
      tags: ['Logo','Music','Identity'],
      whiteBg: true, // logo has transparency — render on a white surface
      bg: 'images/art-direction/logos/sergio-ayala-magistrado-latin-experimental-music-band-logo-2017.webp'
    },
    {
      num: '07', cat: 'Identity', title: 'Quindiorellanas', sub: 'Identidad, personajes, plantillas para redes y página web',
      desc: 'Identidad para <a href="https://www.instagram.com/quindiorellanas/" target="_blank" rel="noopener noreferrer">Quindiorellanas</a>, un emprendimiento quindiano de cultivo de setas, principalmente orellanas. El logo es un sello de inspiración vintage: un racimo de orellanas dibujado a mano dentro de una insignia circular. La marca luego se expandió hacia el material educativo: se diseñó una plantilla para recetarios ilustrados y los personajes Hugo y Molly, un hongo grande y sabio y una pequeña micelio que aprende de sus enseñanzas. Son diseños simples para presentaciones y capacitaciones dirigidas al público infantil. Además se desarrolló su página web en WordPress y su blog <a href="https://bajoelsombrerofungi.blogspot.com/" target="_blank" rel="noopener noreferrer">Bajo el Sombrero Fungi</a>.',
      specs: [['Scope','Identity · Characters · Web'],['Tools','Illustrator · WordPress'],['Year','2017–2020'],['Mode','Freelance']],
      tags: ['Logo','Characters','Food Brand'],
      whiteBg: true, // logo has transparency — render on a white surface
      bg: 'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-mushroom-brand-logo-colombia-2017.webp',
      images: [
        'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-mushroom-brand-logo-colombia-2017.webp',
        'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-recipe-card-oyster-mushroom-brand-colombia-2020.webp',
        'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-hugo-wise-mushroom-mascot-character-colombia.webp',
        'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-molly-mycelium-mascot-character-colombia.webp'
      ]
    },
    {
      num: '08', cat: 'Identity', title: 'RetroTech', sub: 'Logo para marca de arte con tecnología reciclada',
      desc: 'Logo para RetroTech, un emprendimiento de arte y mobiliario creado a partir de tecnología reciclada. La mascota es un robot ensamblado con piezas recuperadas: cabeza de bombillo, cuerpo de parlante vintage y extremidades de tubo flexible, irradiando rayos eléctricos. El diseño está inspirado en el art déco y la publicidad radial de los años 20, con tipografía de la época y una paleta de dorado sobre negro que refuerzan el espíritu retro de la marca.',
      specs: [['Scope','Logo · Identity'],['Tools','Illustrator'],['Year','2021'],['Mode','Freelance']],
      tags: ['Logo','Sustainable','Identity'],
      bg: 'images/art-direction/logos/sergio-ayala-retrotech-recycled-tech-furniture-brand-logo-2021.webp'
    }
  ],
  // 3D entries carry a `model` (GLB) — the modal stage renders an interactive
  // <model-viewer> for them. An optional `bg` feeds the row hover preview only;
  // the modal backdrop stays the shared discipline image.
  '3d': [
    {
      num: '01', cat: '3D & Motion', title: 'Pikapool', sub: 'Stylized character mashup — interactive 3D model',
      specs: [['Scope','Character · 3D Model'],['Tools','Blender'],['Year','2026'],['Mode','Personal']],
      tags: ['3D','Character','Real-Time'],
      model: 'images/3D/Pikapool-web.glb'
    },
    {
      num: '02', cat: '3D & Motion', title: 'Tib', sub: 'Original character — interactive 3D model',
      specs: [['Scope','Character · 3D Model'],['Tools','Blender'],['Year','2026'],['Mode','Personal']],
      tags: ['3D','Character','Real-Time'],
      model: 'images/3D/Tib-web.glb'
    },
    {
      num: '03', cat: '3D & Motion', title: 'Throg', sub: 'Creature character sculpt — interactive 3D model',
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
  '3d':      '3D & Motion'
};
