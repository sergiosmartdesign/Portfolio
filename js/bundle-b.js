/* bundle-b.js — concatenated app bundle (load order preserved). Sources in git history. */

;
/* ===== art-direction-data.js ===== */
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
      num: '02', cat: 'Web', title: 'Siemens Couch Party', sub: 'Evento virtual de fin de año para Siemens Healthineers',
      desc: 'Dirección de arte para Couch Party, la celebración virtual de fin de año de Siemens Healthineers durante la pandemia, por encargo de la agencia <a href="https://www.linkedin.com/company/moments-lab/" target="_blank" rel="noopener noreferrer">Moments Lab</a>. El concepto lleva la fiesta a la sala de cada empleado: un letrero de neón sobre una pared de ladrillo ambienta la landing del evento, que integró streaming en vivo, chat, playlist y un menú de cena y coctelería a cargo de un chef y un mixólogo invitados, entregado en la casa de cada asistente. El sistema se extendió a logo animado, correos de invitación y save the date animados, y las piezas del kit de bienvenida.',
      specs: [['Scope','Landing · Email · Motion'],['Tools','Figma · After Effects'],['Year','2020'],['Mode','Agency']],
      tags: ['Virtual Event','Motion','Email Design'],
      bg: 'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-virtual-event-mockup-2020.webp',
      images: [
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-virtual-event-mockup-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-virtual-new-year-event-landing-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-virtual-event-logo-animated-2020logo.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-save-the-date-animated-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-invitation-email-animated-2020.webp',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-email-animation-03-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-menu-animation-2020.gif',
        'images/art-direction/Sieemens/couch party/sergio-ayala-siemens-healthineers-couch-party-welcome-kit-2020.jpg'
      ]
    },
    {
      num: '03', cat: 'Web', title: 'Siemens Together Land', sub: 'Experiencia virtual para Siemens Healthineers',
      desc: 'Dirección de arte para Together Land Evening, una noche virtual de premios, juegos y risas para los empleados de Siemens Healthineers, desarrollada nuevamente con la agencia <a href="https://www.linkedin.com/company/moments-lab/" target="_blank" rel="noopener noreferrer">Moments Lab</a>. El universo gráfico es un collage de stickers: bocas riendo a carcajadas, tornamesas y patrones retro sobre un azul vibrante. El sistema cubrió el key visual del evento, el save the date y los correos animados, y la campaña de expectativa en redes, con acceso a la plataforma mediante un PIN.',
      specs: [['Scope','Landing · Email · Motion'],['Tools','Figma · After Effects'],['Year','2021'],['Mode','Agency']],
      tags: ['Virtual Event','Motion','Landing'],
      bg: 'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-virtual-event-mockup-01-2021.webp',
      images: [
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-virtual-event-mockup-01-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-virtual-event-mockup-02-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-event-animated-2021.webp',
        'images/art-direction/Sieemens/together land/sergio-ayala-siemens-healthineers-together-land-invitation-email-animated-2021.webp'
      ]
    },
    {
      num: '04', cat: 'Web', title: 'CAF-LIF Contest', sub: 'Landing para el Demo Day del laboratorio CAF',
      desc: 'Landing para el Demo Day del L.i.F., el Laboratorio de Inclusión Financiera de CAF, el banco de desarrollo de América Latina, por encargo de <a href="https://www.linkedin.com/company/corporaci-n-ventures/" target="_blank" rel="noopener noreferrer">Corporación Ventures</a>. La página recibía a los emprendimientos preseleccionados y reunía las bases del concurso, los proyectos finalistas y los ganadores, con acceso directo al evento virtual de la semifinal y la final. La gráfica retoma los puntos de color del logo del laboratorio y los convierte en círculos que acompañan el recorrido sobre un fondo oscuro.',
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
      num: '05', cat: 'Web', title: 'Reality Shift', sub: 'Web app con IA para el concurso Platzi × Lovable',
      desc: 'Reality Shift es una web app que parte de una pregunta: ¿qué hubiera pasado si hubieras tomado una decisión diferente? La IA genera escenarios alternativos de tu vida a partir de un recorrido en tres pasos sobre tu mentalidad, tu contexto y tus metas, y los visualiza como una línea de tiempo interactiva con cartas de tarot. Diseñé la identidad y la interfaz, un mapa estelar con constelaciones zodiacales y un logo de neón retro, y construí el producto con Lovable para el concurso de Platzi.',
      specs: [['Scope','Web Design · UI · AI Build'],['Tools','Lovable · Figma'],['Year','2025'],['Mode','Contest']],
      tags: ['AI Build','Web','Contest'],
      bg: 'images/art-direction/reality shift/sergio-ayala-reality-shift-lovable-platzi-contest-website-2025.webp',
      images: [
        'images/art-direction/reality shift/sergio-ayala-reality-shift-lovable-platzi-contest-website-2025.webp',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-lovable-platzi-contest-website-detail-2025.png',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-ai-web-app-login-screen-2025.webp',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-ai-web-app-onboarding-welcome-2025.webp',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-ai-web-app-personality-mindset-form-2025.webp',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-ai-web-app-life-context-form-2025.webp',
        'images/art-direction/reality shift/sergio-ayala-reality-shift-ai-web-app-destiny-avatar-generator-2025.webp'
      ]
    },
    {
      num: '06', cat: 'Web', title: 'Global Trading Website', sub: 'Sitio web para comercializadora de alimentos',
      desc: 'Diseño del sitio web de <a href="https://www.instagram.com/globaltradingdecolombia/" target="_blank" rel="noopener noreferrer">Global Trading de Colombia</a>, comercializadora de ingredientes alimenticios, principalmente frutos secos, semillas y granos para abastecer negocios. El sitio, bilingüe y en versiones de escritorio y móvil sobre la paleta naranja de la marca, organizaba el catálogo de productos por categorías e incluía un sistema de SEO para optimizar su búsqueda en motores como Google. Es un cliente con el que he trabajado en varios frentes: sus catálogos y piezas impresas para la feria Alimentec están en la disciplina Editorial.',
      specs: [['Scope','Web Design · SEO · Responsive'],['Tools','WordPress · Photoshop · Illustrator'],['Year','2021'],['Mode','Freelance']],
      tags: ['Web','Responsive','Brand'],
      bg: 'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-design-desktop-mobile-2021.webp',
      images: [
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-design-desktop-mobile-2021.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-home-desktop-mobile-2021.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-desktop-mockup-nut-butters-2021.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-mobile-mockup-seeds-2021.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-website-laptop-mockup-alimentec-2021.webp'
      ]
    }
  ],
  editorial: [
    {
      num: '01', cat: 'Editorial', title: 'Catálogos Global Trading 2026', sub: 'Catálogos general y de panificación para Alimentec',
      desc: 'Pareja de catálogos para <a href="https://www.instagram.com/globaltradingdecolombia/" target="_blank" rel="noopener noreferrer">Global Trading de Colombia</a>, diseñados en conjunto para la feria Alimentec 2026: un catálogo general del portafolio y uno especializado en panificación y repostería. Ambos comparten el mismo sistema editorial bajo el lema "Ingredientes que inspiran creación": retículas de producto numeradas con presentaciones y gramajes, fotografía sobre fondo oscuro y la paleta naranja y azul de la marca, presente también en <a href="https://www.linkedin.com/company/globaltradingdecolombia/" target="_blank" rel="noopener noreferrer">LinkedIn</a>. Selecciona cada catálogo en las miniaturas para hojearlo.',
      specs: [['Scope','Print · Catalog · Layout'],['Tools','InDesign · Illustrator'],['Year','2026'],['Mode','Freelance']],
      tags: ['Print','Catalog','Food Industry'],
      bg: 'images/art-direction/Global trading de col/catalogo general/sergio-ayala-global-trading-catalogo-general-page-01-2026.webp',
      // Two books in one project — the modal thumb strip becomes a catalog
      // selector (cover per catalog) and swaps the flipbook on click.
      catalogs: [
        {
          label: 'Catálogo General',
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
          label: 'Catálogo de Panificación',
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
        }
      ]
    },
    {
      num: '02', cat: 'Editorial', title: 'Flyer y Pendón Alimentec', sub: 'Impresos para la feria Alimentec 2026',
      desc: 'Piezas impresas para el stand de <a href="https://www.instagram.com/globaltradingdecolombia/" target="_blank" rel="noopener noreferrer">Global Trading de Colombia</a> en la feria Alimentec 2026: un pendón lightbox de gran formato con el mensaje "Ingredientes para la industria de alimentos" y el flyer de The Kitchen Contest, un show de cocina en vivo de The Kitchen Brothers con recetas preparadas con los productos de la marca. La gráfica lleva el sistema de los catálogos al espacio físico de la feria, donde estas piezas recibieron a los visitantes del stand.',
      specs: [['Scope','Flyer · Large Format'],['Tools','Illustrator · Photoshop'],['Year','2026'],['Mode','Freelance']],
      tags: ['Print','Large Format','Trade Fair'],
      noFlip: true, // loose fair pieces, not a catalog — standard image + thumbs modal
      bg: 'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-lightbox-banner-2026.webp',
      images: [
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-lightbox-banner-2026.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-lightbox-banner-booth-photo-2026.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-kitchen-brothers-flyer-2026.webp',
        'images/art-direction/Global trading de col/sergio-ayala-global-trading-alimentec-kitchen-contest-flyer-handout-2026.webp'
      ]
    },
    {
      num: '03', cat: 'Editorial', title: 'Catálogo Global Trading 2021', sub: 'Catálogo de productos, frutos secos y semillas',
      navBelow: true, // landscape pages fill the stage width — arrows under the book
      desc: 'Catálogo de productos de <a href="https://www.instagram.com/globaltradingdecolombia/" target="_blank" rel="noopener noreferrer">Global Trading de Colombia</a>, una pieza extra que la marca encargó junto al sitio web. Sus 20 páginas organizan el portafolio de frutos secos, semillas, granos y demás ingredientes por categorías, con la misma gráfica del sitio: tipografía manuscrita, paleta naranja y fotografía de producto, en línea con la identidad que la marca proyecta también en <a href="https://www.linkedin.com/company/globaltradingdecolombia/" target="_blank" rel="noopener noreferrer">LinkedIn</a>. El diseño del sitio web se encuentra en la disciplina Web.',
      specs: [['Scope','Print · Catalog · Layout'],['Tools','InDesign · Illustrator'],['Year','2021'],['Mode','Freelance']],
      tags: ['Print','Catalog','Food Industry'],
      bg: 'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-01.webp',
      images: [
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-01.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-02.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-03.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-04.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-05.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-06.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-07.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-08.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-09.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-10.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-11.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-12.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-13.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-14.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-15.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-16.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-17.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-18.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-19.webp',
        'images/art-direction/Global trading de col/catalogo productos/sergio-ayala-global-trading-catalogo-productos-page-20.webp'
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
      num: '01', cat: '3D & Motion', title: 'Pikapool', sub: 'Mashup esculpido por encargo para impresión 3D',
      desc: 'Encargo de un cliente particular: un mashup de Pikachu y Deadpool esculpido en ZBrush para impresión 3D. El personaje combina la silueta y las orejas del Pokémon con el traje, las armas y la actitud del mercenario, con detalles como el cinturón de pokebola, las pistolas y la katana. El modelo de esta página es el mismo sculpt optimizado para verlo en 360° directamente en el navegador.',
      specs: [['Scope','Character · 3D Print'],['Tools','ZBrush'],['Year','2026'],['Mode','Freelance']],
      tags: ['3D','Character','3D Print'],
      bg: 'images/art-direction/3d/sergio-ayala-pikapool-3d-character-turntable-2026.webp',
      model: 'images/3D/Pikapool-web.glb'
    },
    {
      num: '02', cat: '3D & Motion', title: 'Tib', sub: 'Personaje esculpido por encargo para impresión 3D',
      desc: 'Tib es un tiburón cartoon esculpido en ZBrush por encargo de un cliente particular para impresión 3D. La pieza se construyó alrededor de su expresión: la sonrisa cargada de dientes y la mirada desafiante debían leerse igual de bien en pantalla que en la figura impresa. Puedes examinar el modelo en 360° aquí mismo.',
      specs: [['Scope','Character · 3D Print'],['Tools','ZBrush'],['Year','2026'],['Mode','Freelance']],
      tags: ['3D','Character','3D Print'],
      bg: 'images/art-direction/3d/sergio-ayala-tib-3d-character-turntable-2026.webp',
      model: 'images/3D/Tib-web.glb'
    },
    {
      num: '03', cat: '3D & Motion', title: 'Throg', sub: 'La rana Thor de Marvel, esculpida para impresión 3D',
      desc: 'La versión rana de Thor en Marvel, esculpida en ZBrush por encargo de un cliente particular para impresión 3D. Casco alado, discos en el peto y anatomía de guerrero anfibio, presentados en gris neutro para que el volumen y el detalle hablen por sí solos.',
      specs: [['Scope','Character · 3D Print'],['Tools','ZBrush'],['Year','2026'],['Mode','Freelance']],
      tags: ['3D','Character','3D Print'],
      bg: 'images/art-direction/3d/sergio-ayala-throg-3d-character-turntable-2026.webp',
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


;
/* ===== ad-flipbook.js ===== */
/* ── ad-flipbook.js — Editorial catalog page-turn book ───────────────────────
   A dependency-free CSS-3D flipbook for the Art Direction project modal. Turns
   an ordered array of catalog page images into a book whose leaves rotate around
   a central spine on click / swipe / arrow keys.

   Model: each physical LEAF is double-sided (front + back). Desktop renders a
   two-page SPREAD (leaf i → pages 2i, 2i+1); narrow viewports render SINGLE
   page (leaf i → page i front, page i+1 back) so every page stays legible.
   `cur` is the count of leaves currently turned to the left pile.

   Turned leaves stack left, unturned stack right — a true book. z-index is
   recomputed per state so the visible faces always win, and the actively
   turning leaf is bumped above the whole stack for the duration of its flip.

   Accessibility: honors prefers-reduced-motion (instant page swap, no rotate),
   exposes a live page counter, real <button> controls in the modal tab order,
   and ArrowLeft/Right + Home/End while open.

   Performance: one GPU-composited transform per turn; will-change is added on
   flip-start and dropped on transitionend; faces outside the current ±1 window
   are not painted. No layout reads per frame.

   API:  const fb = new ADFlipbook(stageEl, pageUrls, { label }); … fb.destroy();
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // A4 portrait (210×297) — sensible default until the first page reports its
  // real intrinsic ratio, at which point the book refits.
  const DEFAULT_RATIO = 210 / 297; // width / height
  const SWIPE_PX = 40;
  const FIT_MARGIN = 0.94; // breathing room for drop-shadows inside the stage

  class ADFlipbook {
    constructor(host, pages, opts = {}) {
      this.host  = host;
      this.pages = (pages || []).filter(Boolean);
      this.label = opts.label || 'Catalog';
      this.ratio = DEFAULT_RATIO;
      this.cur   = 0;
      this.animating = false;

      // Mode is chosen once at mount: a spread needs the horizontal room for two
      // pages, so collapse to single page on phones / portrait tablets and when
      // the touch profile says mobile.
      const narrow = window.innerWidth <= 760;
      const mobile = !!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile);
      this.mode = (narrow || mobile) ? 'single' : 'spread';

      this._buildLeaves();
      this._render();
      this._bind();
      this._measureRatio();
      this._fit();
      this._applyState(true);
    }

    // ── Leaf spec ──────────────────────────────────────────────────────────────
    _buildLeaves() {
      const p = this.pages;
      this.leaves = [];
      if (this.mode === 'spread') {
        for (let i = 0; i < p.length; i += 2) {
          this.leaves.push({ front: p[i], back: p[i + 1] || null });
        }
      } else {
        // Single page: adjacent leaves share a page image so a turn reveals the
        // next page underneath. One leaf per page; last leaf has a blank back.
        for (let i = 0; i < p.length; i++) {
          this.leaves.push({ front: p[i], back: p[i + 1] || null });
        }
      }
      this.count = this.leaves.length;
    }

    get maxCur() {
      // Spread can advance until every leaf is turned (cover → last page);
      // single page stops on the last page itself.
      return this.mode === 'spread' ? this.count : this.count - 1;
    }

    // ── DOM ──────────────────────────────────────────────────────────────────
    _render() {
      const el = document.createElement('div');
      el.className = `ad-book ad-book--${this.mode}`;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'page-turn catalog');
      el.setAttribute('aria-label', this.label);

      const leavesHtml = this.leaves.map((lf, i) => `
        <div class="ad-book-leaf" data-leaf="${i}">
          <div class="ad-book-face ad-book-face--front">
            <span class="ad-book-gloss" aria-hidden="true"></span>
            <span class="ad-book-corner" aria-hidden="true"></span>
          </div>
          <div class="ad-book-face ad-book-face--back${lf.back ? '' : ' is-blank'}">
            <span class="ad-book-gloss" aria-hidden="true"></span>
          </div>
        </div>`).join('');

      el.innerHTML = `
        <div class="ad-book-stack">
          ${leavesHtml}
          <span class="ad-book-gutter" aria-hidden="true"></span>
        </div>
        <div class="ad-book-controls">
          <button type="button" class="ad-book-btn ad-book-prev" aria-label="Previous page"><span class="ad-book-chevs" aria-hidden="true"><i>‹</i><i>‹</i><i>‹</i></span></button>
          <span class="ad-book-counter" aria-live="polite"></span>
          <button type="button" class="ad-book-btn ad-book-next" aria-label="Next page"><span class="ad-book-chevs" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></button>
        </div>`;

      this.el       = el;
      this.stack    = el.querySelector('.ad-book-stack');
      this.leafEls  = [...el.querySelectorAll('.ad-book-leaf')];
      this.counter  = el.querySelector('.ad-book-counter');
      this.prevBtn  = el.querySelector('.ad-book-prev');
      this.nextBtn  = el.querySelector('.ad-book-next');

      this.leafEls.forEach((leaf, i) => {
        const front = leaf.querySelector('.ad-book-face--front');
        const back  = leaf.querySelector('.ad-book-face--back');
        front.dataset.src = this.leaves[i].front || '';
        if (this.leaves[i].back) back.dataset.src = this.leaves[i].back;
      });

      this.host.appendChild(el);
    }

    // ── Wiring ─────────────────────────────────────────────────────────────────
    _bind() {
      this.prevBtn.addEventListener('click', e => { e.stopPropagation(); this.go(-1); });
      this.nextBtn.addEventListener('click', e => { e.stopPropagation(); this.go(1); });

      // Click a side of the book to turn that way (the universal book gesture).
      this._suppressClick = false;
      this._onTap = e => {
        if (e.target.closest('.ad-book-btn')) return;
        if (this._suppressClick) { this._suppressClick = false; return; } // was a swipe
        const r = this.stack.getBoundingClientRect();
        this.go(e.clientX < r.left + r.width / 2 ? -1 : 1);
      };
      this.el.addEventListener('click', this._onTap);

      // Swipe (pointer): horizontal drag past threshold turns the page; a small
      // movement falls through to the click handler above as a tap. A real swipe
      // suppresses the click that the browser still synthesises after pointerup.
      this._down = null;
      this._onDown = e => { this._down = e.clientX; };
      this._onUp = e => {
        if (this._down == null) return;
        const dx = e.clientX - this._down;
        this._down = null;
        if (Math.abs(dx) > SWIPE_PX) { this._suppressClick = true; this.go(dx < 0 ? 1 : -1); }
      };
      this.el.addEventListener('pointerdown', this._onDown, { passive: true });
      this.el.addEventListener('pointerup', this._onUp);

      // Arrow / Home / End while the book is in the document.
      this._onKey = e => {
        if (!this.el.isConnected) return;
        if (e.key === 'ArrowRight')      { e.preventDefault(); this.go(1); }
        else if (e.key === 'ArrowLeft')  { e.preventDefault(); this.go(-1); }
        else if (e.key === 'Home')       { e.preventDefault(); this.jump(0); }
        else if (e.key === 'End')        { e.preventDefault(); this.jump(this.maxCur); }
      };
      document.addEventListener('keydown', this._onKey);

      this._onResize = this._debounce(() => { this._fit(); }, 150);
      window.addEventListener('resize', this._onResize, { passive: true });
    }

    // ── Sizing ───────────────────────────────────────────────────────────────
    _measureRatio() {
      if (!this.pages[0]) return;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          this.ratio = img.naturalWidth / img.naturalHeight;
          this._fit();
        }
      };
      img.src = this.pages[0];
    }

    // Fit a book of the page aspect ratio inside the stage's content box.
    _fit() {
      const availW = this.el.clientWidth  * FIT_MARGIN;
      const availH = this.el.clientHeight * FIT_MARGIN;
      if (!availW || !availH) return;

      const pagesAcross = this.mode === 'spread' ? 2 : 1;
      // Height-led, then clamp so the full width still fits.
      let leafH = availH;
      let leafW = leafH * this.ratio;
      if (leafW * pagesAcross > availW) {
        leafW = availW / pagesAcross;
        leafH = leafW / this.ratio;
      }
      this.stack.style.setProperty('--leaf-w', `${leafW.toFixed(2)}px`);
      this.stack.style.setProperty('--leaf-h', `${leafH.toFixed(2)}px`);
    }

    // ── Navigation ─────────────────────────────────────────────────────────────
    go(dir) {
      if (this.animating) return;
      const next = this.cur + (dir > 0 ? 1 : -1);
      if (next < 0 || next > this.maxCur) return;

      // The leaf that physically moves: turning forward flips leaf `cur`;
      // turning back un-flips the leaf we are returning to.
      const leafIdx = dir > 0 ? this.cur : next;
      const leaf = this.leafEls[leafIdx];
      this.cur = next;

      if (reduce.matches || !leaf) {
        this._applyState();
        return;
      }

      this.animating = true;
      leaf.classList.add('is-turning');
      leaf.style.zIndex = String(this.count + 10);
      leaf.style.willChange = 'transform';

      const done = () => {
        leaf.removeEventListener('transitionend', onEnd);
        clearTimeout(safety);
        leaf.classList.remove('is-turning');
        leaf.style.willChange = '';
        this.animating = false;
        this._applyState();
      };
      const onEnd = e => { if (e.propertyName === 'transform') done(); };
      leaf.addEventListener('transitionend', onEnd);
      // Fail-open if transitionend never fires (e.g. interrupted/zero-size).
      const safety = setTimeout(done, 900);

      // Toggle in the next frame so the transition has a start state.
      requestAnimationFrame(() => this._applyState());
    }

    // Instant jump (Home/End) — no per-leaf animation, just resolve to state.
    jump(target) {
      if (this.animating) return;
      this.cur = Math.max(0, Math.min(this.maxCur, target));
      this._applyState();
    }

    // ── State → DOM ──────────────────────────────────────────────────────────
    _applyState(initial) {
      const turning = this.el.querySelector('.ad-book-leaf.is-turning');
      this.leafEls.forEach((leaf, i) => {
        const flipped = i < this.cur;
        leaf.classList.toggle('is-flipped', flipped);
        // Turned leaves pile up on the left (later = higher); unturned pile on
        // the right (the current leaf on top). The turning leaf keeps its bump.
        if (leaf !== turning) {
          leaf.style.zIndex = String(flipped ? i : this.count - i);
        }
        // Top unturned leaf gets the corner-peel affordance.
        leaf.classList.toggle('is-top', i === this.cur && !flipped);
      });

      this._paintWindow();
      this._updateControls();
      if (initial) this._fit();
    }

    // Only the visible spread ±1 leaf carry painted faces.
    _paintWindow() {
      this.leafEls.forEach((leaf, i) => {
        const near = Math.abs(i - this.cur) <= 1;
        leaf.querySelectorAll('.ad-book-face').forEach(face => {
          const src = face.dataset.src;
          if (!src) return;
          const want = near ? `url("${src}")` : '';
          if (face.style.backgroundImage !== want) face.style.backgroundImage = want;
        });
      });
    }

    _updateControls() {
      this.prevBtn.disabled = this.cur <= 0;
      this.nextBtn.disabled = this.cur >= this.maxCur;

      const n = this.pages.length;
      let visible;
      if (this.mode === 'spread') {
        // 0-based page indices on screen at this turn count.
        const right = 2 * this.cur;       // front of leaf `cur`
        const left  = 2 * this.cur - 1;   // back of leaf `cur-1`
        visible = [left, right].filter(x => x >= 0 && x < n);
      } else {
        visible = [this.cur];
      }
      const lo = Math.min(...visible) + 1;
      const hi = Math.max(...visible) + 1;
      const range = lo === hi ? `${this._pad(lo)}` : `${this._pad(lo)}–${this._pad(hi)}`;
      this.counter.textContent = `${range} / ${this._pad(n)}`;
    }

    _pad(n) { return String(n).padStart(2, '0'); }

    _debounce(fn, ms) {
      let t;
      return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    }

    // ── Teardown ───────────────────────────────────────────────────────────────
    destroy() {
      document.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      this.el?.remove();
      this.el = this.stack = this.leafEls = null;
    }
  }

  window.ADFlipbook = ADFlipbook;
}());


;
/* ===== art-direction-panel.js ===== */
/* ── Art Direction — discipline selector + works list ────────────────────────
   ArtWorksPanel wires the inline-SVG nav card (.ad-explore-card) to the works
   table, the cursor-following row preview and the full-screen project modal
   (static image or interactive <model-viewer> for 3D entries).

   Data-driven: the catalog + discipline constants live in art-direction-data.js
   (WORKS_DATA, DISCIPLINE_BACKDROPS, DISCIPLINE_LABELS, AD_PM_DESC_PLACEHOLDER).
   DOM rows are always generated from WORKS_DATA — never authored in HTML.

   Depends on (load order in index.html):
     • art-direction-data.js  — WORKS_DATA + discipline constants
     • lib/scramble.js        — window.scrambleText
   ─────────────────────────────────────────────────────────────────────────── */

// Glyph pool + cadence for the panel's scramble effect (discipline name, row
// titles). Distinct from the nav-card decode in art-direction.js.
const AD_PANEL_SCRAMBLE = { chars: '!<>-_\\/[]{}—=+*^?#∆◊§øΩ†‡', frameMs: 38 };

// Glyph pool for the modal text's Splitting.js char-cycle glitch — mirrors the
// site-wide GLITCH_CHARS used on headings (script.js).
const AD_PM_GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

// Owner 2026-07-03: the modal title lands on a DIFFERENT portfolio-palette
// color on every open (never repeating the previous one). All four read
// comfortably over the dark #001219 backdrop images; the split glyphs pick
// the value up via --ad-pm-title-color in art-direction-panel.css.
const AD_PM_TITLE_COLORS = ['#EE9B00', '#94D2BD', '#E9D8A6', '#CA6702'];

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
        this._modalWork       = null;

        // WORKS_DATA copy is authored in Spanish (the fallback); English lives
        // in locales/en.json under ad.<discipline>.<num>.<field>. Re-render the
        // translatable copy whenever the language toggle fires.
        document.addEventListener('languagechanged', () => this._onLanguageChanged());

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

    // ── Scramble helper ───────────────────────────────────────────────────────
    // Thin wrapper over the shared window.scrambleText with the panel's glyph
    // pool + cadence. Honors prefers-reduced-motion inside scrambleText.
    _scrambleText(el, onDone, overrideTarget) {
        window.scrambleText(el, {
            chars:   AD_PANEL_SCRAMBLE.chars,
            frameMs: AD_PANEL_SCRAMBLE.frameMs,
            target:  overrideTarget,
        }, onDone);
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

        const label = `· ${this._discLabel(key)} ·`;

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

    // ── i18n ──────────────────────────────────────────────────────────────────

    // A missing key (es locale, or locale not loaded yet) returns undefined —
    // callers fall back to the Spanish string in WORKS_DATA, so copy can never
    // render blank.
    _trKey(disc, num, field) {
        return App.LanguageManager?.translate(`ad.${disc}.${num}.${field}`);
    }

    // Discipline display label (works heading, modal category) — translated
    // when the locale carries ad.disc.<key>, else the static label constant.
    _discLabel(key) {
        return App.LanguageManager?.translate(`ad.disc.${key}`)
            ?? DISCIPLINE_LABELS[key]
            ?? (key.charAt(0).toUpperCase() + key.slice(1));
    }

    _onLanguageChanged() {
        // Rows re-render in place (skip mid-transition — the next discipline
        // switch renders in the new language anyway).
        if (this.activeDiscipline && !this._transitioning) {
            this._renderRows(this.activeDiscipline);
        }
        if (this.activeDiscipline && this.discName) {
            this.discName.textContent = `· ${this._discLabel(this.activeDiscipline)} ·`;
        }

        const work = this._modalWork;
        if (!work || !this.modal?.classList.contains('is-open')) return;

        const disc = this.activeDiscipline;
        this.modalCat.textContent   = `· ${this._discLabel(disc).toUpperCase()} ·`;
        this.modalTitle.textContent = this._trKey(disc, work.num, 'title') ?? work.title;
        this.modalSub.textContent   = this._trKey(disc, work.num, 'sub')   ?? work.sub;
        this._glitchSplit(this.modalCat);
        this._glitchSplit(this.modalTitle);
        this._glitchSplit(this.modalSub);
        if (this.modalDesc) {
            this.modalDesc.innerHTML = this._trKey(disc, work.num, 'desc') ?? work.desc ?? AD_PM_DESC_PLACEHOLDER;
            this._glitchCopy(this.modalDesc);
        }
        if (Array.isArray(work.catalogs) && this.modalThumbs) {
            const ofWord = App.LanguageManager?.translate('ad.of') ?? 'de';
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((thumb, i) => {
                const label = this._trKey(disc, work.num, `catalog.${i}`) ?? work.catalogs[i]?.label ?? '';
                thumb.title = label;
                thumb.setAttribute('aria-label', `${label} (${i + 1} ${ofWord} ${work.catalogs.length})`);
            });
        }
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
            const title = this._trKey(key, w.num, 'title') ?? w.title;
            const scope = w.specs.find(s => s[0] === 'Scope')?.[1] ?? '—';
            const tools = w.specs.find(s => s[0] === 'Tools')?.[1] ?? '—';
            const year  = w.specs.find(s => s[0] === 'Year')?.[1]  ?? '—';
            return `
            <div class="ad-work-item" role="listitem" tabindex="0" aria-label="Open ${title}">
                <span class="ad-work-data ad-work-title">${title}</span>
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
                // Title glitch/scramble on hover disabled for now (froze on
                // rapid re-hover, leaving the name unreadable). Preview kept.
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
        // Missing-image void: a 404 on the stage image reveals the black-hole
        // placeholder; a successful load clears it. Src assignments elsewhere
        // pre-clear .has-void so a stale void never bleeds into the next image.
        if (this.modalStageImg) {
            this.modalStageImg.addEventListener('error', () => {
                if (this.modalStageImg.getAttribute('src')) {
                    this.modalStage.classList.add('has-void');
                }
            });
            this.modalStageImg.addEventListener('load', () => {
                this.modalStage.classList.remove('has-void');
            });
        }
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

        // Click anywhere closes the modal — except on genuinely interactive
        // controls: description links, the thumbnail strip, the orbitable 3D
        // stage and the flipbook (both need their own gestures), and the close
        // button (its own handler above). Everything else — backdrop, photo,
        // text, specs — dismisses.
        this.modal.addEventListener('click', e => {
            if (e.target.closest(
                'a[href], .ad-pm-thumb, .ad-pm-close, .ad-pm-stage.has-model, .ad-pm-stage.has-book, .ad-book'
            )) {
                return;
            }
            this._closeModal();
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

        // Auto-close a left-open project when the section scrolls out of view —
        // otherwise the full-bleed overlay (and any live model-viewer WebGL
        // context) bleeds over the sections below.
        if (this.section && 'IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (!e.isIntersecting && this.modal.classList.contains('is-open')) {
                        this._closeModal();
                    }
                });
            }, { threshold: 0 }).observe(this.section);
        }

        // Menu navigation jumps instantly and may not trip the observer above —
        // close the project on any nav selection (NavigationManager fires this).
        document.addEventListener('app:navigate', () => {
            if (this.modal.classList.contains('is-open')) this._closeModal();
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

        // Stage media — flipbook (editorial catalogs) · 3D model · static image
        clearTimeout(this._mvTeardownTimer);
        this._teardownModelViewer();
        this._teardownFlipbook();

        const hasCatalogs = Array.isArray(work.catalogs) && work.catalogs.length > 0;
        const useFlip = this.activeDiscipline === 'editorial'
            && !work.noFlip // loose print pieces opt out — standard image + thumbs
            && (hasCatalogs || (Array.isArray(work.images) && work.images.length > 1))
            && !!window.ADFlipbook;

        if (work.model) this._mountModelViewer(work);
        else if (useFlip) this._mountFlipbook(work);

        if (this.modalStageImg) {
            this.modalStage.classList.remove('has-void');
            if (work.bg && !work.model && !useFlip) {
                this.modalStageImg.src = work.bg;
                this.modalStageImg.alt = `${work.title} — project image`;
            } else {
                this.modalStageImg.removeAttribute('src');
                this.modalStageImg.alt = '';
            }
        }
        this.modal.classList.toggle('is-flipbook', useFlip);

        this._modalWork = work;
        const disc = this.activeDiscipline;
        this.modalNum.textContent   = work.num;
        this.modalCat.textContent   = `· ${this._discLabel(disc).toUpperCase()} ·`;
        this.modalTitle.textContent = this._trKey(disc, work.num, 'title') ?? work.title;
        this.modalSub.textContent   = this._trKey(disc, work.num, 'sub')   ?? work.sub;

        // Rotate the title color BEFORE the split so the fresh glyphs settle
        // on it. Language re-renders (_refreshModalContent) deliberately keep
        // the current color: same project, same open.
        this.modalTitle.style.setProperty('--ad-pm-title-color', this._nextTitleColor());

        // Re-split on each open so the fresh [data-char] pseudo-elements re-fire
        // the glitch-switch char-cycle (keyframes in styles.css). The plain-text
        // assignment above wipes any prior split, so Splitting starts clean.
        this._glitchSplit(this.modalCat);
        this._glitchSplit(this.modalTitle);
        this._glitchSplit(this.modalSub);

        if (this.modalDesc) {
            this.modalDesc.innerHTML = this._trKey(disc, work.num, 'desc') ?? work.desc ?? AD_PM_DESC_PLACEHOLDER;
            this._glitchCopy(this.modalDesc);
        }

        this.modalSpecs.innerHTML = work.specs.map(([k, v]) => `
            <div class="ad-pm-spec-row">
                <span class="ad-pm-spec-key">${k}</span>
                <span class="ad-pm-spec-val">${v}</span>
            </div>`).join('');

        this.modalTags.innerHTML = work.tags.map(t => `
            <span class="ad-pm-tag"><span class="ad-pm-dot"></span>${t}</span>`).join('');

        if (this.modalThumbs && useFlip && hasCatalogs) {
            // Multi-catalog project — the thumb strip becomes a catalog
            // selector: one cover per book, click swaps the flipbook.
            const ofWord = App.LanguageManager?.translate('ad.of') ?? 'de';
            this.modalThumbs.innerHTML = work.catalogs.map((cat, i) => {
                const label = this._trKey(disc, work.num, `catalog.${i}`) ?? cat.label;
                return `<div class="ad-pm-thumb${i === 0 ? ' is-active' : ''}" role="listitem"
                      style="background-image:url('${cat.images[0]}')"
                      tabindex="0" title="${label}"
                      aria-label="${label} (${i + 1} ${ofWord} ${work.catalogs.length})"></div>`;
            }).join('');
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((thumb, i) => {
                const pick = () => this._switchCatalog(work, i);
                thumb.addEventListener('click', pick);
                thumb.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        pick();
                    }
                });
            });
        } else if (this.modalThumbs && useFlip) {
            // The flipbook carries its own page navigation — no thumb strip.
            this.modalThumbs.innerHTML = '';
        } else if (this.modalThumbs) {
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

    // Run Splitting.js on an element and seed each char with 10 random glyphs so
    // the CSS glitch-switch animation has frames to cycle through before settling
    // on the real character. Same recipe as GlitchSystem.initSplitting (script.js).
    // Next palette color for the modal title — random, but never the one the
    // previous open landed on ("siempre un color diferente").
    _nextTitleColor() {
        let c;
        do {
            c = AD_PM_TITLE_COLORS[Math.floor(Math.random() * AD_PM_TITLE_COLORS.length)];
        } while (c === this._lastTitleColor && AD_PM_TITLE_COLORS.length > 1);
        this._lastTitleColor = c;
        return c;
    }

    // about-style glitch entrance for the desc paragraph (owner 2026-07-03,
    // same tempo as #about's copy — tuning + char wave in the panel css).
    // The innerHTML was just rewritten: Splitting's memo (el['🍌']) points at
    // the stale, detached chars, so drop it before re-splitting; then the
    // suppress → flush → fire dance (GlitchSystem.triggerGlitch's) restarts
    // the wave on every open / language re-render.
    _glitchCopy(el) {
        if (!el || !window.Splitting) return;
        delete el['🍌'];
        this._glitchSplit(el);
        el.classList.add('glitch-suppressed');
        el.classList.remove('glitch-firing');
        void el.offsetWidth;
        el.classList.add('glitch-firing');
    }

    _glitchSplit(el) {
        if (!el || !window.Splitting) return;
        const results = window.Splitting({ target: el, by: 'chars' });
        results.forEach(result => {
            result.chars.forEach(char => {
                char.style.setProperty('--count', String(Math.random() * 5 + 1));
                for (let g = 0; g < 10; g++) {
                    const r = AD_PM_GLITCH_CHARS[Math.floor(Math.random() * AD_PM_GLITCH_CHARS.length)];
                    char.style.setProperty(`--char-${g}`, `"${r}"`);
                }
            });
        });
    }

    _switchModalImage(src, index) {
        if (this.modalBg && !this._fixedBackdrop) {
            this.modalBg.style.backgroundImage = `url('${src}')`;
        }
        if (this.modalStageImg) {
            this.modalStage.classList.remove('has-void');
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
        this._triggerEl?.focus({ preventScroll: true });
        this._triggerEl = null;
        this._modalWork = null;
        this._teardownFlipbook();
        // Free the WebGL context once the fade-out (0.22s) has finished.
        this._mvTeardownTimer = setTimeout(() => this._teardownModelViewer(), 240);
    }

    // ── Flipbook stage — editorial catalogs (js/ad-flipbook.js) ─────────────────

    _mountFlipbook(work, catalogIndex = 0) {
        if (!this.modalStage || !window.ADFlipbook) return;
        const cat = Array.isArray(work.catalogs) && work.catalogs.length
            ? work.catalogs[Math.min(catalogIndex, work.catalogs.length - 1)]
            : null;
        this.modalStage.classList.add('has-book');
        // Landscape books fill the stage width — flanking arrows would sit on
        // the pages, so these works drop the control row below the book.
        this.modalStage.classList.toggle('nav-below', !!work.navBelow);
        const disc     = this.activeDiscipline;
        const title    = this._trKey(disc, work.num, 'title') ?? work.title;
        const catLabel = cat
            ? (this._trKey(disc, work.num, `catalog.${catalogIndex}`) ?? cat.label)
            : null;
        this._flipbook = new ADFlipbook(this.modalStage, cat ? cat.images : work.images, {
            label: cat ? `${title} — ${catLabel}` : `${title} — catalog`,
        });
    }

    // Swap the mounted book for another catalog of the same work (multi-catalog
    // projects); the thumb strip acts as the selector.
    _switchCatalog(work, index) {
        this._teardownFlipbook();
        this._mountFlipbook(work, index);
        if (this.modalThumbs) {
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((t, i) => {
                t.classList.toggle('is-active', i === index);
            });
        }
    }

    _teardownFlipbook() {
        if (this._flipbook) { this._flipbook.destroy(); this._flipbook = null; }
        this.modalStage?.classList.remove('has-book', 'nav-below');
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
    // Instance exposed for the phone-only accordion (js/ad-accordion.js),
    // which drives selectDiscipline/_openModal directly. Inert on desktop.
    window.ADPanel = new ArtWorksPanel();
});


;
/* ===== ad-accordion.js ===== */
/* ad-accordion.js — PHONE-ONLY category accordion for #art-direction.
 *
 * Replaces the yellow DISCIPLINES SVG card on phones (owner 2026-07-04) with
 * an accordion modeled on the #photo desktop list. The category list simply
 * appears when the section goes live, each label decoded with the shared
 * window.scrambleText glitch (same as nav labels / paragraphs) — no auto
 * open/close cascade. Categories stay closed until tapped; expanding one lists
 * its WORKS_DATA projects; tapping a project opens the works modal (ADPanel).
 *
 * Fully gated on App.BrowserDetect.isMobile — on desktop this file builds
 * nothing and touches nothing. Styling lives in css/main.css (≤768px),
 * transparent backgrounds by design (unlike photo's dark plate).
 *
 * Depends on: art-direction-data.js (WORKS_DATA), art-direction-panel.js
 * (window.ADPanel), browser-detect.js, window.scrambleText (lib/scramble.js),
 * optional gsap + App.LanguageManager.
 */
(function () {
  'use strict';

  const DISCS = ['identity', 'web', 'editorial', '3d'];

  // Category button labels (owner 2026-07-04): fixed, language-neutral
  // discipline names in the authored casing. The wide spaced-out look is CSS
  // letter-spacing, not baked spaces, so screen readers still read the word.
  const CAT_LABELS = {
    identity: '· Identity ·',
    web: '· web ·',
    editorial: '· editorial ·',
    '3d': '· 3d & motion ·',
  };

  // ms between consecutive rows appearing when a category expands — slow
  // enough (owner 2026-07-04) that each line's glitch-in reads individually.
  const OPEN_ITEM_STEP = 130;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const t = key => window.App && App.LanguageManager && App.LanguageManager.translate
    ? App.LanguageManager.translate(key)
    : null;

  const workYear = work => {
    const spec = (work.specs || []).find(s => s[0] === 'Year');
    return spec ? spec[1] : '';
  };

  function init() {
    if (!(window.App && App.BrowserDetect && App.BrowserDetect.isMobile)) return;
    const section = document.getElementById('art-direction');
    if (!section || typeof WORKS_DATA === 'undefined') return;
    const anchor = section.querySelector('.ad-explore-card');
    if (!anchor || section.querySelector('.ad-accordion')) return;

    // ── Build DOM ────────────────────────────────────────────────────────────
    const acc = document.createElement('div');
    acc.className = 'ad-accordion';
    acc.setAttribute('aria-label', 'Art direction project categories');

    const entries = []; // { disc, btn, list, items:[{el, work}] }

    DISCS.forEach(disc => {
      const works = WORKS_DATA[disc] || [];
      if (!works.length) return;

      const item = document.createElement('div');
      item.className = 'ad-accordion-item';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'adacc-btn';
      btn.dataset.discipline = disc;
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="adacc-btn-label"></span><span class="adacc-btn-indicator" aria-hidden="true"></span>';

      const list = document.createElement('ul');
      list.className = 'adacc-list';
      list.dataset.discipline = disc;
      list.setAttribute('role', 'list');

      const items = works.map(work => {
        const li = document.createElement('li');
        li.className = 'adacc-item';
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.innerHTML =
          '<span class="adacc-num"></span>' +
          '<span class="adacc-titles"><span class="adacc-title"></span>' +
          '<span class="adacc-sub"></span></span>' +
          '<span class="adacc-year"></span>';
        li.querySelector('.adacc-num').textContent = work.num;
        li.querySelector('.adacc-year').textContent = workYear(work);
        // Per-row thumbnail (owner 2026-07-05): fill the empty space to the
        // right of the title/sub with the project's cover image, mirroring the
        // #photo accordion. work.bg is the cover for every discipline (identity/
        // web/editorial = mockups, 3d = character turntable webp). Placed in the
        // last grid column (styled in responsive.css). This whole file is
        // isMobile-gated, so desktop never gets these nodes.
        if (work.bg) {
          const img = document.createElement('img');
          img.className = 'adacc-thumb';
          img.src       = work.bg;
          img.alt       = '';
          img.setAttribute('aria-hidden', 'true');
          img.setAttribute('draggable', 'false');
          img.loading   = 'lazy';
          img.decoding  = 'async';
          li.appendChild(img);
        }
        list.appendChild(li);
        return { el: li, work };
      });

      item.appendChild(btn);
      item.appendChild(list);
      acc.appendChild(item);
      entries.push({ disc, btn, list, items });
    });

    anchor.parentNode.insertBefore(acc, anchor);

    // ── i18n — per-project title/sub refreshed on language switch; the
    //    category label itself is fixed (CAT_LABELS), same in both locales ──
    const fillTexts = () => {
      entries.forEach(({ disc, btn, items }) => {
        btn.querySelector('.adacc-btn-label').textContent = CAT_LABELS[disc];
        items.forEach(({ el, work }) => {
          el.querySelector('.adacc-title').textContent =
            t(`ad.${disc}.${work.num}.title`) || work.title;
          el.querySelector('.adacc-sub').textContent =
            t(`ad.${disc}.${work.num}.sub`) || work.sub || '';
        });
      });
    };
    fillTexts();
    document.addEventListener('languagechanged', fillTexts);

    // ── Open / close ─────────────────────────────────────────────────────────
    const showItem = (el, delayMs) => {
      if (reducedMotion.matches || !window.gsap) {
        el.style.opacity = '1';
        return;
      }
      gsap.killTweensOf(el);
      gsap.to(el, {
        delay: delayMs / 1000,
        keyframes: [
          { opacity: 1,    duration: 0.06, ease: 'none' },
          { opacity: 0.12, duration: 0.05, ease: 'none' },
          { opacity: 0.9,  duration: 0.06, ease: 'none' },
          { opacity: 0.3,  duration: 0.04, ease: 'none' },
          { opacity: 1,    duration: 0.07, ease: 'none' },
        ],
      });
    };

    // Same flicker as showItem but resolving to 0 — used to play the open
    // reveal in reverse when a category closes (owner 2026-07-04).
    const hideItemGlitch = (el, delayMs) => {
      if (reducedMotion.matches || !window.gsap) {
        el.style.opacity = '0';
        return;
      }
      gsap.killTweensOf(el);
      gsap.to(el, {
        delay: delayMs / 1000,
        keyframes: [
          { opacity: 0.3,  duration: 0.07, ease: 'none' },
          { opacity: 0.9,  duration: 0.04, ease: 'none' },
          { opacity: 0.12, duration: 0.06, ease: 'none' },
          { opacity: 0.6,  duration: 0.05, ease: 'none' },
          { opacity: 0,    duration: 0.06, ease: 'none' },
        ],
      });
    };

    const openEntry = (entry, itemStepMs) => {
      clearTimeout(entry.closeTimer);
      entry.closing = false;
      entry.btn.classList.add('active');
      entry.btn.setAttribute('aria-expanded', 'true');
      entry.list.style.display = 'flex';
      entry.items.forEach(({ el }, i) => showItem(el, i * itemStepMs));
    };

    const closeEntry = (entry, immediate) => {
      if (immediate) {
        clearTimeout(entry.closeTimer);
        entry.closing = false;
        entry.btn.classList.remove('active');
        entry.btn.setAttribute('aria-expanded', 'false');
        entry.items.forEach(({ el }) => { if (window.gsap) gsap.killTweensOf(el); el.style.opacity = '0'; });
        entry.list.style.display = 'none';
        return;
      }
      // Reverse of the open reveal: the rows glitch out bottom-to-top with the
      // same per-row step, then the category collapses.
      entry.closing = true;
      const n = entry.items.length;
      entry.items.forEach(({ el }, i) => hideItemGlitch(el, (n - 1 - i) * OPEN_ITEM_STEP));
      const total = (n - 1) * OPEN_ITEM_STEP + 300;
      entry.closeTimer = setTimeout(() => {
        entry.closing = false;
        entry.btn.classList.remove('active');
        entry.btn.setAttribute('aria-expanded', 'false');
        entry.list.style.display = 'none';
      }, total);
    };

    const isOpen = entry => entry.btn.classList.contains('active');

    // ── Clicks ───────────────────────────────────────────────────────────────
    entries.forEach(entry => {
      entry.btn.addEventListener('click', () => {
        if (entry.closing) return; // let the reverse-close finish first
        if (isOpen(entry)) closeEntry(entry, false);
        else openEntry(entry, OPEN_ITEM_STEP);
      });

      entry.items.forEach(({ el, work }) => {
        const open = () => {
          const p = window.ADPanel;
          if (!p) return;
          if (p.activeDiscipline !== entry.disc) p.selectDiscipline(entry.disc, true);
          p._openModal(work);
          // The modal detail area is a scroll container on phones; it keeps the
          // previous project's scrollTop, so a new project could open already
          // scrolled to its text. Reset it so every project starts at the top
          // (image → gallery → info). rAF re-reset covers post-layout shifts.
          const content = document.querySelector('#art-direction .ad-pm-content');
          if (content) {
            content.scrollTop = 0;
            requestAnimationFrame(() => { content.scrollTop = 0; });
          }
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
      });
    });

    // ── Label reveal — glitch scramble (owner 2026-07-04) ───────────────────
    // No auto open/close cascade anymore: the category list simply appears,
    // each label decoded with the same window.scrambleText glitch used on the
    // nav labels, modal title and section paragraphs. Categories stay closed
    // until tapped. Fires once when the section goes live (body.ad-section-
    // live, the red-frame gate); resets on leave so it replays on re-entry.
    const glitchable = !!window.scrambleText && !reducedMotion.matches;
    // Failure-safe: only hide labels for the reveal if we can actually glitch
    // them back in — otherwise leave them visible.
    entries.forEach(entry => {
      entry.btn.querySelector('.adacc-btn-label').style.opacity = glitchable ? '0' : '1';
    });

    let revealed = false;
    let revealTimers = [];
    const clearReveal = () => { revealTimers.forEach(clearTimeout); revealTimers = []; };

    const revealLabels = () => {
      if (revealed) return;
      revealed = true;
      entries.forEach((entry, i) => {
        const label = entry.btn.querySelector('.adacc-btn-label');
        if (!glitchable) { label.style.opacity = '1'; return; }
        revealTimers.push(setTimeout(() => {
          label.style.opacity = '1';
          window.scrambleText(label, { frameMs: 45, initialDelay: 0, stepMs: 55 });
        }, i * 150));
      });
    };

    const resetReveal = () => {
      clearReveal();
      revealed = false;
      entries.forEach(entry => {
        closeEntry(entry, true);
        entry.btn.querySelector('.adacc-btn-label').style.opacity = glitchable ? '0' : '1';
      });
    };

    // body.ad-section-live is toggled by art-direction.js — piggyback on it.
    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('ad-section-live')) revealLabels();
      else resetReveal();
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (document.body.classList.contains('ad-section-live')) revealLabels();

    initBottomPin(section);
  }

  // ── Bottom-pin for the #photo curtain ──────────────────────────────────────
  // On phones #art-direction is taller than the viewport, so the desktop
  // top:0 sticky pin would hide the accordion, and leaving it in flow leaves an
  // empty band under the section while the #photo curtain (fixed, clips open
  // from the top) descends. Fix: keep it a NATIVE sticky pin (composited, so no
  // scroll-frame jitter) but offset the sticky top by the section's overflow so
  // its BOTTOM lands at the viewport bottom — it then fills the viewport while
  // the curtain descends over it, with no gap. The offset only depends on the
  // section height, so it's recomputed on resize and whenever the accordion
  // changes height (ResizeObserver) — never per scroll frame.
  function initBottomPin(section) {
    const setTop = () => {
      const overflow = section.offsetHeight - window.innerHeight;
      section.style.setProperty('--ad-pin-top', overflow > 0 ? `${-overflow}px` : '0px');
    };
    setTop();
    window.addEventListener('resize', setTop, { passive: true });
    // Accordion open/close changes offsetHeight; --ad-pin-top only moves the
    // sticky offset (not layout height), so this can't feed back into a loop.
    if (window.ResizeObserver) new ResizeObserver(setTop).observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());


;
/* ===== particle-system.js ===== */
/**
 * Particle System Animation
 * Modern ES6 class implementation with performance optimizations
 * Original concept by Alex Andrix
 *
 * Three instances run (see the DOMContentLoaded block at the bottom):
 *  - #preloader: every particle wears a different palette color (round-robin);
 *    destroyed for good when `preloaderDone` fires and the overlay is removed.
 *  - #intro: the whole swarm wears ONE palette color, hopping to a different
 *    random palette color every 6s; paused/resumed by the intro
 *    IntersectionObserver in script.js via App.ParticleSystem.
 *  - #illus-tunnel: background swarm for the illustration cube gallery,
 *    same single-color/hop config as #intro; paused/resumed by its own
 *    IntersectionObserver on #illustration below.
 */

// Project color palette — hex converted to {h, s} for HSL; lum varies per particle
const PARTICLE_PALETTE = [
  { h: 191, s: 100 }, // #005F73 dark teal
  { h: 181, s: 88  }, // #0A9396 teal
  { h: 162, s: 38  }, // #94D2BD mint
  { h: 43,  s: 62  }, // #E9D8A6 sand
  { h: 39,  s: 100 }, // #EE9B00 amber
  { h: 29,  s: 97  }, // #CA6702 burnt orange
  { h: 20,  s: 95  }, // #BB3E03 rust
  { h: 5,   s: 81  }, // #AE2012 deep red
  { h: 358, s: 62  }, // #9B2226 dark red
];

class ParticleSystem {
  constructor(options = {}) {
    this.opts = Object.assign({
      hostId: 'intro',          // element the canvas is injected into (as first child)
      canvasId: '',             // optional id (intro uses #particleCanvas for its CSS)
      // 'single': whole swarm wears one palette color, hopping to a different
      //           random color every colorHopMs.
      // 'multi':  each particle takes the next palette color at birth.
      colorMode: 'single',
      colorHopMs: 6000,
      bgInit: 'rgba(0, 0, 0, 1)',      // initial canvas fill
      bgFade: 'rgba(0, 0, 0, 0.1)',    // per-frame fade (trail dissolve)
      inlinePosition: false,    // set position:absolute/inset inline (no CSS rule)
      maxPop: null,             // override the desktop particle count (e.g. a lighter
                                // swarm for the short-lived nav-transition overlay)
      // Optional per-instance phone tuning (only applied when isMobile). Lets one
      // swarm shrink further on phones without touching desktop or other swarms.
      maxPopMobile: null,       // override particle count on phones
      zoomMobile: null,         // override spatial spread on phones (smaller = tighter)
    }, options);

    // Detect Safari for performance optimizations
    const isSafari = App.BrowserDetect ? App.BrowserDetect.isSafariBased() : false;
    // Phones get a smaller swarm for battery / fill-rate (desktop unchanged).
    const isMobile = App.BrowserDetect ? App.BrowserDetect.isMobile : false;

    // Configuration constants (optimized for Safari)
    this.config = {
      lifespan: 1000,
      popPerBirth: 1,
      maxPop: isMobile ? 60 : (this.opts.maxPop != null ? this.opts.maxPop
                                : (isSafari ? 100 : 150)),  // smaller on phones / Safari
      birthFreq: 2,
      gridSize: 8,
      gridRadius: 500,
      attractorRadius: 100,
      springConstant: 8,
      viscosity: 0.4,
      zoom: 1.6,
      targetFPS: isSafari ? 30 : 60  // Throttle to 30fps on Safari
    };

    // Per-instance phone overrides (desktop untouched — guarded by isMobile).
    if (isMobile) {
      if (this.opts.maxPopMobile != null) this.config.maxPop = this.opts.maxPopMobile;
      if (this.opts.zoomMobile  != null) this.config.zoom   = this.opts.zoomMobile;
    }

    // Animation state
    this.stepCount = 0;
    this.particles = [];
    this.drawnInLastFrame = 0;
    this.deathCount = 0;
    this.isRunning = true;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.config.targetFPS;

    // 'multi' mode: each birth takes the next palette color in turn
    this.birthCount = 0;
    // 'single' mode: index of the color the whole swarm currently wears
    this.colorIndex = Math.floor(Math.random() * PARTICLE_PALETTE.length);
    this.colorTimer = null;

    // Set when the host is gone — stops the rAF loop permanently
    this.destroyed = false;

    // Color cache for performance
    this.colorCache = new Map();

    // DOM elements (cached)
    this.canvas = null;
    this.ctx = null;
    this.host = null;

    // Canvas dimensions (cached)
    this.width = 0;
    this.height = 0;
    this.xC = 0;
    this.yC = 0;

    // Grid system
    this.grid = [];
    this.gridSteps = 0;
    this.gridMaxIndex = 0;

    this.setup();
    if (!this.destroyed) {
      this.startAnimationLoop();
      if (this.opts.colorMode === 'single') {
        this.colorTimer = setInterval(() => this.hopColor(), this.opts.colorHopMs);
      }
    }
  }

  /**
   * 'single' mode: pick a different random palette color and recolor the
   * living swarm so the switch reads as one clean hop (births follow suit).
   */
  hopColor() {
    let next;
    do {
      next = Math.floor(Math.random() * PARTICLE_PALETTE.length);
    } while (next === this.colorIndex && PARTICLE_PALETTE.length > 1);
    this.colorIndex = next;

    const { h, s } = PARTICLE_PALETTE[next];
    this.particles.forEach(p => { p.hue = h; p.sat = s; });
  }

  /**
   * Initial setup - creates canvas and builds motion grid
   */
  setup() {
    if (!this.createCanvas()) {
      // Preloader already gone (or absent) — nothing to animate, ever.
      this.destroyed = true;
      return;
    }
    this.buildMotionGrid();
    this.initDraw();
    this.attachResizeListener();
  }

  /**
   * Creates and configures canvas element
   */
  createCanvas() {
    // Bail cleanly if the host element doesn't exist (or is already gone)
    this.host = document.getElementById(this.opts.hostId);
    if (!this.host) return false;

    this.canvas = document.createElement('canvas');
    if (this.opts.canvasId) this.canvas.id = this.opts.canvasId;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Hosts without a CSS rule for the canvas get inline positioning
    // (e.g. the preloader overlay — canvas under the z-index:1 stage)
    if (this.opts.inlinePosition) {
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.pointerEvents = 'none';
    }

    // Cache canvas dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.xC = this.width / 2;
    this.yC = this.height / 2;

    // Insert as first child so the host's content paints above it
    this.host.insertBefore(this.canvas, this.host.firstChild);

    // Get context and disable smoothing for sharper particles
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    return true;
  }

  /**
   * Builds the radial attraction field grid
   */
  buildMotionGrid() {
    const { gridSize, gridRadius, attractorRadius } = this.config;
    this.gridSteps = Math.floor((gridRadius * 2) / gridSize);
    this.grid = [];

    // Only spots a particle has actually occupied ever carry busyAge > 0, so we
    // track them here and age just those (see updateGridAges). Without this the
    // age pass scans the full ~15,625-spot grid every frame — wasted budget that
    // shows up as jank when a heavy reflow shares the frame (the nav transition).
    this.busySpots = new Set();

    let spotIndex = 0;
    const edgeMin = -gridRadius;
    const edgeMax = edgeMin + gridSize * (this.gridSteps - 1);

    for (let xx = -gridRadius; xx < gridRadius; xx += gridSize) {
      for (let yy = -gridRadius; yy < gridRadius; yy += gridSize) {
        // Calculate radial field strength
        const r = Math.sqrt(xx * xx + yy * yy);
        const field = r < attractorRadius
          ? (255 / attractorRadius) * r
          : 255 - Math.min(255, (r - attractorRadius) / 2);

        // Determine if this is an edge spot
        const isEdge = xx === edgeMin ? 'left'
          : xx === edgeMax ? 'right'
          : yy === edgeMin ? 'top'
          : yy === edgeMax ? 'bottom'
          : false;

        this.grid.push({
          x: xx,
          y: yy,
          busyAge: 0,
          spotIndex: spotIndex++,
          isEdge,
          field
        });
      }
    }
    this.gridMaxIndex = spotIndex;
  }

  /**
   * Main evolution step - called every frame
   */
  evolve() {
    this.stepCount++;
    this.updateGridAges();

    // Birth new particles when needed
    if (this.shouldBirthParticles()) {
      this.birthParticle();
    }

    this.moveParticles();
    this.draw();
  }

  /**
   * Increment busy ages for all grid spots
   */
  updateGridAges() {
    // Equivalent to "for every spot with busyAge > 0, busyAge++" — but only the
    // touched spots are ever in that set, so this skips the full-grid scan.
    for (const spot of this.busySpots) spot.busyAge++;
  }

  /**
   * Check if we should birth new particles this frame
   */
  shouldBirthParticles() {
    return this.stepCount % this.config.birthFreq === 0 &&
           (this.particles.length + this.config.popPerBirth) < this.config.maxPop;
  }

  /**
   * Create a new particle at a random grid spot
   */
  birthParticle() {
    const gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex);
    const gridSpot = this.grid[gridSpotIndex];
    const { x, y } = gridSpot;
    // 'multi': round-robin so the full palette is always on screen at once.
    // 'single': every birth wears the swarm's current color.
    const paletteEntry = this.opts.colorMode === 'multi'
      ? PARTICLE_PALETTE[this.birthCount++ % PARTICLE_PALETTE.length]
      : PARTICLE_PALETTE[this.colorIndex];

    this.particles.push({
      hue: paletteEntry.h,
      sat: paletteEntry.s,
      lum: 20 + Math.floor(40 * Math.random()),
      x,
      y,
      xLast: x,
      yLast: y,
      xSpeed: 0,
      ySpeed: 0,
      age: 0,
      ageSinceStuck: 0,
      attractor: {
        oldIndex: gridSpotIndex,
        gridSpotIndex
      },
      name: `particle-${Math.ceil(10000000 * Math.random())}`
    });
  }

  /**
   * Remove a particle by name
   */
  killParticle(particleName) {
    this.particles = this.particles.filter(p => p.name !== particleName);
  }

  /**
   * Update all particle positions using spring physics
   */
  moveParticles() {
    const { springConstant, viscosity, lifespan } = this.config;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Save last position
      p.xLast = p.x;
      p.yLast = p.y;

      // Get current attractor grid spot
      let gridSpot = this.grid[p.attractor.gridSpotIndex];

      // Maybe move attractor to neighboring spot
      if (Math.random() < 0.5) {
        gridSpot = this.updateAttractor(p, gridSpot);
      }

      // Kill stuck particles
      if (p.ageSinceStuck >= 10) {
        this.particles.splice(i, 1);
        continue;
      }

      // Apply spring physics
      this.applySpringPhysics(p, gridSpot, springConstant, viscosity);

      // Age and kill old particles
      p.age++;
      if (p.age > lifespan) {
        this.particles.splice(i, 1);
        this.deathCount++;
      }
    }
  }

  /**
   * Update particle's attractor to best neighboring grid spot
   */
  updateAttractor(particle, currentSpot) {
    if (currentSpot.isEdge) {
      particle.ageSinceStuck++;
      return currentSpot;
    }

    // Get neighbor indices
    const index = particle.attractor.gridSpotIndex;
    const neighbors = [
      this.grid[index - 1],              // top
      this.grid[index + 1],              // bottom
      this.grid[index - this.gridSteps], // left
      this.grid[index + this.gridSteps]  // right
    ];

    // Find best neighbor with chaos factor
    const chaos = 30;
    let maxFieldSpot = neighbors[0];
    let maxValue = maxFieldSpot.field + chaos * Math.random();

    for (let i = 1; i < neighbors.length; i++) {
      const value = neighbors[i].field + chaos * Math.random();
      if (value > maxValue) {
        maxValue = value;
        maxFieldSpot = neighbors[i];
      }
    }

    // Move to new spot if available
    if (maxFieldSpot.busyAge === 0 || maxFieldSpot.busyAge > 15) {
      particle.ageSinceStuck = 0;
      particle.attractor.oldIndex = index;
      particle.attractor.gridSpotIndex = maxFieldSpot.spotIndex;
      maxFieldSpot.busyAge = 1;
      this.busySpots.add(maxFieldSpot);   // now needs per-frame ageing
      return maxFieldSpot;
    }

    particle.ageSinceStuck++;
    return currentSpot;
  }

  /**
   * Apply spring physics to move particle toward attractor
   */
  applySpringPhysics(particle, attractor, k, visc) {
    const dx = particle.x - attractor.x;
    const dy = particle.y - attractor.y;

    // Spring force (Hooke's law)
    particle.xSpeed += -k * dx;
    particle.ySpeed += -k * dy;

    // Viscosity damping
    particle.xSpeed *= visc;
    particle.ySpeed *= visc;

    // Store distance and speed for rendering
    particle.speed = Math.sqrt(particle.xSpeed * particle.xSpeed + particle.ySpeed * particle.ySpeed);
    particle.dist = Math.sqrt(dx * dx + dy * dy);

    // Update position
    particle.x += 0.1 * particle.xSpeed;
    particle.y += 0.1 * particle.ySpeed;
  }

  /**
   * Initial canvas clear
   */
  initDraw() {
    this.ctx.fillStyle = this.opts.bgInit;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw all particles with trails
   */
  draw() {
    this.drawnInLastFrame = 0;
    if (!this.particles.length) return;

    // Fade effect for trails — fades toward the host's background color
    this.ctx.fillStyle = this.opts.bgFade;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Batch drawing operations
    this.particles.forEach(p => {
      this.drawParticle(p);
      this.drawnInLastFrame++;
    });
  }

  /**
   * Get cached color string for particle
   */
  getColor(particle) {
    const h = particle.hue;
    const s = particle.sat;
    const l = particle.lum;
    const cacheKey = `${h}-${s}-${l}`;

    if (!this.colorCache.has(cacheKey)) {
      this.colorCache.set(cacheKey, `hsla(${h}, ${s}%, ${l}%, 1)`);
      // Limit cache size
      if (this.colorCache.size > 100) {
        const firstKey = this.colorCache.keys().next().value;
        this.colorCache.delete(firstKey);
      }
    }

    return this.colorCache.get(cacheKey);
  }

  /**
   * Draw individual particle with trail and attractor
   */
  drawParticle(particle) {
    // Get cached color
    const color = this.getColor(particle);

    // Transform coordinates inline (no per-particle {x,y} allocations — at
    // maxPop this loop ran ~36k times/sec and the garbage churned the GC).
    const xC = this.xC, yC = this.yC, z = this.config.zoom;
    const lastX = xC + particle.xLast * z, lastY = yC + particle.yLast * z;
    const nowX  = xC + particle.x     * z, nowY  = yC + particle.y     * z;

    const attracSpot    = this.grid[particle.attractor.gridSpotIndex];
    const oldAttracSpot = this.grid[particle.attractor.oldIndex];
    const attracX    = xC + attracSpot.x    * z, attracY    = yC + attracSpot.y    * z;
    const oldAttracX = xC + oldAttracSpot.x * z, oldAttracY = yC + oldAttracSpot.y * z;

    const ctx = this.ctx;

    // Draw particle trail
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(nowX, nowY);
    ctx.stroke();

    // Draw attractor positions
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;
    ctx.moveTo(oldAttracX, oldAttracY);
    ctx.lineTo(attracX, attracY);
    ctx.arc(attracX, attracY, 1.5, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();
  }

  /**
   * Transform data coordinates to canvas coordinates
   */
  dataToCanvasXY(x, y) {
    return {
      x: this.xC + x * this.config.zoom,
      y: this.yC + y * this.config.zoom
    };
  }

  /**
   * Handle window resize
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.xC = this.width / 2;
    this.yC = this.height / 2;
  }

  /**
   * Attach resize event listener
   */
  attachResizeListener() {
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Start the animation loop with FPS throttling
   */
  startAnimationLoop() {
    const frame = (currentTime) => {
      if (this.destroyed) return; // overlay gone — stop scheduling for good
      requestAnimationFrame(frame);

      if (!this.isRunning) return;

      // Throttle frame rate for performance (especially on Safari)
      const elapsed = currentTime - this.lastFrameTime;
      if (elapsed < this.frameInterval) return;

      this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
      this.evolve();
    };
    requestAnimationFrame(frame);
  }

  /**
   * Pause the animation
   */
  pause() {
    this.isRunning = false;
  }

  /**
   * Resume the animation
   */
  resume() {
    this.isRunning = true;
  }

  /**
   * Permanently stop — the rAF loop ends and never restarts.
   * Called when the canvas host (e.g. the preloader overlay) is removed.
   */
  destroy() {
    this.destroyed = true;
    this.isRunning = false;
    if (this.colorTimer) {
      clearInterval(this.colorTimer);
      this.colorTimer = null;
    }
  }
}

// Initialize when DOM is ready. The preloader overlay exists from the first
// line of <body> until ~100%, so it's always present at DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  // Preloader swarm — all 9 palette colors at once; dies with the overlay
  const preloaderParticles = new ParticleSystem({
    hostId: 'preloader',
    colorMode: 'multi',
    bgInit: 'rgba(0, 18, 25, 1)',   // matches the overlay bg (#001219)
    bgFade: 'rgba(0, 18, 25, 0.1)',
    inlinePosition: true,
    // Phones: thin + tighten the multicolor swarm so it reads as a subtle
    // backdrop, not a busy full-screen field (desktop unchanged: 60 / 1.6).
    maxPopMobile: 40,
    zoomMobile: 1.25,
  });
  window.addEventListener('preloaderDone', () => preloaderParticles.destroy(), { once: true });

  // Intro swarm — one palette color at a time, hops to a different random
  // color every 6s. Uses #particleCanvas so the existing CSS rule applies.
  const introParticles = new ParticleSystem({
    hostId: 'intro',
    canvasId: 'particleCanvas',
    colorMode: 'single',
    colorHopMs: 6000,
  });

  // Illustration swarm — background for the cube gallery, injected into the
  // sticky .illus-tunnel viewport (canvas styled by #illus-particle-canvas in
  // illus-cube.css). Starts paused; its own observer wakes it only while the
  // section is on screen.
  const illusParticles = new ParticleSystem({
    hostId: 'illus-tunnel',
    canvasId: 'illus-particle-canvas',
    colorMode: 'single',
    colorHopMs: 6000,
    bgInit: 'rgba(0, 18, 25, 1)',   // matches --illus-bg (#001219)
    bgFade: 'rgba(0, 18, 25, 0.1)',
  });
  const illusSection = document.getElementById('illustration');
  if (illusSection && !illusParticles.destroyed) {
    illusParticles.pause();
    new IntersectionObserver(entries => {
      entries[0].isIntersecting ? illusParticles.resume() : illusParticles.pause();
    }, { threshold: 0 }).observe(illusSection);
  }

  // Registry points at the intro instance — its pause/resume is driven by
  // the intro IntersectionObserver in script.js. The preloader instance
  // and the illustration instance manage their own lifecycles above.
  App.ParticleSystem = {
    pause: () => introParticles.pause(),
    resume: () => introParticles.resume(),
    destroy: () => introParticles.destroy()
  };
});


;
/* ===== section-transition.js ===== */
/**
 * Section Transition — interstitial particle wipe between menu navigations.
 *
 * Masks the instant scroll jump done by NavigationManager.goToSection with a
 * ~1.5s cover → reveal: the viewport turns #001219 while a multicolor particle
 * swarm (the same ParticleSystem config as the #preloader) blooms in, the
 * navigation happens fully hidden at the peak, then the overlay fades out to
 * reveal the chosen section.
 *
 * Timeline (1500ms total):
 *   COVER   0–600ms   overlay #001219 fades in (ease-in); particles lag 150ms
 *                     behind so the dark establishes first ("luego a la par").
 *   PEAK    600–~780  particles frozen for the nav reflow, then breathing — the
 *                     scroll jump + entrance triggers (midFn) fire here, hidden.
 *   REVEAL  ~780–1500 overlay fades out (ease-out), revealing the destination.
 *
 * Performance architecture (the reason this stays at 60fps through the jump):
 *   - COMPOSITOR FADES. opacity is animated by CSS transitions, not a main-thread
 *     rAF tween — so the cover keeps gliding on the compositor thread even while
 *     the main thread is stalled doing the navigation reflow. (The old rAF tween
 *     stuttered in lock-step with that reflow; this is the core fix.)
 *   - REFLOW ISOLATION. The heavy work (scroll jump + sticky-section measuring +
 *     entrance triggers + observers) runs while the particle sim is PAUSED, with
 *     a two-frame yield so layout/paint commit before the swarm resumes. The
 *     nav frame gets the whole budget; particles never pile onto it. All of this
 *     is invisible under the fully-opaque cover.
 *   - POOLED. overlay + ParticleSystem are built once on first use, then paused
 *     at rest and resumed per transition (no per-nav grid rebuild / GC). The
 *     canvas is only re-sized when the viewport actually changed (reassigning
 *     canvas.width wipes the bitmap — we avoid that on every nav).
 *   - No external deps; degrades to an immediate midFn() if ParticleSystem is
 *     unavailable. Desktop-only + reduced-motion gating live in the caller.
 *
 * Scan-line overlay:
 *   An electric-static line (shared js/static-line.js look) sweeps bottom→top
 *   across the whole 1.5s, riding ABOVE the cover + particles as a sibling at
 *   z-index 9991. Its travel + fade are a compositor CSS animation
 *   (@keyframes stScanTravel), so they stay smooth through the nav reflow too.
 */
(function () {
  'use strict';

  const COVER_MS       = 460;  // overlay #001219 + particles fade IN
  const HOLD_MS        = 320;  // bg+particles+figure hold at full before the reveal
  const REVEAL_MS      = 520;  // overlay fades OUT, revealing the destination
  const CANVAS_LEAD_MS = 110;  // particles lag the bg by this much during cover

  // One full bottom→top sweep of the electric-static scan-line spans the whole
  // transition, so it rides over the cover, the hidden nav, AND the reveal.
  const TRAVEL_MS      = COVER_MS + HOLD_MS + REVEAL_MS;  // 1500

  // ease-in (accelerate — respect the user's decision) for the cover,
  // ease-out (decelerate — present the destination calmly) for the reveal.
  // cubic-bezier equivalents of easeInQuad / easeOutCubic, run on the compositor.
  const EASE_IN  = 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
  const EASE_OUT = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

  const wait      = ms => new Promise(r => setTimeout(r, ms));
  // Two animation frames: lets a forced reflow/repaint commit before continuing.
  const twoFrames = () =>
    new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  /**
   * Compositor-driven opacity fade. The transition runs off the main thread, so
   * it stays smooth even while the main thread is busy with the navigation
   * reflow. Resolves on transitionend, with a timeout safety net so a dropped
   * event can never strand the overlay.
   */
  function fade(el, to, durationMs, easing, delayMs = 0) {
    return new Promise(resolve => {
      el.style.transition = `opacity ${durationMs}ms ${easing} ${delayMs}ms`;
      void el.offsetWidth;            // flush: animate from the CURRENT opacity
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = e => {
        if (e.target === el && e.propertyName === 'opacity') done();
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(done, durationMs + delayMs + 100);   // safety net
      requestAnimationFrame(() => { el.style.opacity = String(to); });
    });
  }

  let overlay  = null;
  let canvas   = null;
  let fx       = null;    // pooled ParticleSystem instance
  let scanline = null;    // pooled electric-static scan-line canvas
  let scanFx   = null;    // its makeStaticLine() controller ({ show, hide })
  let traveler = null;    // pooled flipbook container
  let running  = false;
  let lastW    = 0, lastH = 0;

  const travelerFrames = [];      // the 4 stacked .st-frame elements
  const FRAME_MS = 140;           // per-frame hold for the walk-cycle loop
  let frameTimer = null;
  let frameIdx   = 0;

  // Advance the flipbook: exactly one frame carries .is-active at a time.
  function startFlipbook() {
    if (!travelerFrames.length) return;
    stopFlipbook();
    frameIdx = 0;
    travelerFrames.forEach((f, i) => f.classList.toggle('is-active', i === 0));
    frameTimer = setInterval(() => {
      travelerFrames[frameIdx].classList.remove('is-active');
      frameIdx = (frameIdx + 1) % travelerFrames.length;
      travelerFrames[frameIdx].classList.add('is-active');
    }, FRAME_MS);
  }

  function stopFlipbook() {
    if (frameTimer) { clearInterval(frameTimer); frameTimer = null; }
  }

  /**
   * Restart the bottom→top scan-line sweep. The electric-static look reuses the
   * shared makeStaticLine() jitter loop (shadow off — the cyan glow is a CSS
   * drop-shadow); the travel itself is a compositor CSS animation (transform +
   * opacity only) so it stays smooth through the navigation reflow.
   */
  function startScanline() {
    if (!scanFx) return;
    scanFx.show();                       // begin the per-frame static jitter
    // Randomise the sweep direction each time: ~half bottom→top, ~half top→bottom.
    const dir = Math.random() < 0.5 ? 'stScanTravel' : 'stScanTravelDown';
    scanline.style.animation = 'none';   // reset, then force a reflow so the…
    void scanline.offsetWidth;           // …animation can replay from the start
    scanline.style.animation = `${dir} ${TRAVEL_MS}ms linear forwards`;
  }

  function stopScanline() {
    if (!scanFx) return;
    scanFx.hide();
    scanline.style.animation = 'none';
  }

  function lazyInit() {
    if (overlay) return true;
    if (typeof ParticleSystem === 'undefined') return false;

    overlay = document.createElement('div');
    overlay.id = 'section-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    // Same multicolor #001219 swarm as the preloader, but pooled — built once,
    // paused at rest, resumed for each transition.
    fx = new ParticleSystem({
      hostId: 'section-transition',
      colorMode: 'multi',
      bgInit: 'rgba(0, 18, 25, 1)',
      bgFade: 'rgba(0, 18, 25, 0.1)',
      inlinePosition: true,
      // lighter than the 150 desktop default — it only lives ~1.4s; phones get
      // roughly half again (mobile enabled 2026-07-03, smaller thermal budget).
      maxPop: window.matchMedia('(max-width: 768px)').matches ? 48 : 80,
    });
    fx.pause();
    canvas = overlay.querySelector('canvas');
    lastW = window.innerWidth;
    lastH = window.innerHeight;

    // Glowing "time traveler" figure at the centre of the swarm's vortex (the
    // particles orbit a radial field ~320px wide at the canvas centre). Child of
    // the overlay so it fades with the cover/reveal; painted above the particle
    // canvas but below the scan-lines. It's a 4-frame flipbook: each frame is an
    // inlined SVG (solid-black art, recoloured + glowed by CSS) stacked in the
    // same box; run() cycles which one is visible for a looping walk.
    traveler = document.createElement('div');
    traveler.className = 'st-traveler';
    traveler.setAttribute('aria-hidden', 'true');
    overlay.appendChild(traveler);

    for (let i = 1; i <= 4; i++) {
      const frame = document.createElement('div');
      frame.className = 'st-frame';
      traveler.appendChild(frame);
      travelerFrames.push(frame);
      fetch(`images/time%20travel%20svg/${i}.svg`)
        .then(r => r.text())
        .then(txt => { frame.innerHTML = txt.replace(/<\?xml[^>]*\?>/i, ''); })
        .catch(() => { /* a missing frame just drops from the loop */ });
    }

    // Sibling scan-line above the cover (z-index 9991): kept OUT of the overlay
    // so it stays crisp during the reveal fade instead of dimming with it.
    if (typeof makeStaticLine === 'function') {
      scanline = document.createElement('canvas');
      scanline.id = 'section-transition-scanline';
      scanline.setAttribute('aria-hidden', 'true');
      document.body.appendChild(scanline);
      scanFx = makeStaticLine(scanline, { shadow: false });
    }

    return !!canvas && !fx.destroyed;
  }

  /**
   * Run one cover → (midFn) → reveal cycle. `midFn` performs the real navigation
   * (scroll jump + entrance triggers) while the overlay is fully opaque. Always
   * runs midFn exactly once; resolves when the overlay is gone again.
   */
  async function run(midFn) {
    // Re-entrancy / unsupported fallbacks still navigate, just without the wipe.
    if (running || !lazyInit()) { if (midFn) midFn(); return; }
    running = true;

    // Re-sync the canvas to the viewport only when it actually changed —
    // reassigning canvas.width clears the bitmap, so skip the needless wipe.
    if (window.innerWidth !== lastW || window.innerHeight !== lastH) {
      fx.resize();
      lastW = window.innerWidth;
      lastH = window.innerHeight;
    }

    overlay.classList.add('is-running');
    fx.resume();
    startScanline();   // one bottom→top sweep, spanning the whole transition
    startFlipbook();   // loop the 4-frame walk cycle (fades in with the figure)

    // ── COVER ───────────────────────────────────────────────────────────────
    // #001219 base establishes first; the swarm blooms a beat later.
    await Promise.all([
      fade(overlay, 1, COVER_MS, EASE_IN),
      fade(canvas, 1, COVER_MS - CANVAS_LEAD_MS, EASE_OUT, CANVAS_LEAD_MS),
    ]);

    // ── PEAK: hand the whole frame to the navigation reflow ──────────────────
    // Freeze the swarm, do the heavy scroll jump + entrance triggers, let layout
    // and paint commit, then resume. Fully hidden under the opaque cover.
    fx.pause();
    try { if (midFn) midFn(); } catch (e) { /* never strand the overlay */ }
    await twoFrames();
    fx.resume();
    await wait(HOLD_MS);   // swarm breathes at full before the reveal

    // ── REVEAL ───────────────────────────────────────────────────────────────
    // One compositor fade carries the whole overlay; the canvas rides along as
    // its child at opacity 1 (no separate canvas tween needed here).
    await fade(overlay, 0, REVEAL_MS, EASE_OUT);

    // ── TEARDOWN (pooled: pause, never destroy) ─────────────────────────────
    overlay.classList.remove('is-running');
    canvas.style.transition = 'none';   // reset instantly for the next cover
    canvas.style.opacity    = '0';
    fx.pause();
    stopScanline();
    stopFlipbook();
    running = false;
  }

  window.SectionTransition = { run, isRunning: () => running };
})();


;
/* ===== orb-3d.js ===== */
/**
 * 3D Particle Orb Animation
 * ES6 class implementation with optimized CSS generation
 */

class Orb3D {
  constructor() {
    // Detect Safari for performance optimizations
    const isSafari = App.BrowserDetect ? App.BrowserDetect.isSafariBased() : false;

    this.config = {
      total: isSafari ? 150 : 300,  // Reduced particle count on Safari
      orbSize: 100,
      particleSize: 2,
      animationTime: 14,
      baseHue: 180,
      baseDelay: 0,
      delayIncrement: 0.01,
      hueShift: 40
    };

    // Cache DOM elements
    this.introSection = null;
    this.orbWrap = null;

    this.init();
  }

  /**
   * Initialize the orb by creating HTML and CSS
   */
  init() {
    this.introSection = document.getElementById('intro');
    if (!this.introSection) {
      console.warn('[3D Orb] Intro section not found');
      return;
    }

    this.createOrbHTML();
    this.generateOrbCSS();
  }

  /**
   * Create the orb container and particle elements
   */
  createOrbHTML() {
    // Create wrapper
    this.orbWrap = document.createElement('div');
    this.orbWrap.className = 'orb-wrap';
    this.orbWrap.id = 'orb3d';

    // Create all particles in a document fragment for better performance
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.config.total; i++) {
      const particle = document.createElement('div');
      particle.className = 'orb-particle';
      fragment.appendChild(particle);
    }
    this.orbWrap.appendChild(fragment);

    // Insert as second child (after particle canvas)
    const firstChild = this.introSection.firstChild;
    if (firstChild && firstChild.nextSibling) {
      this.introSection.insertBefore(this.orbWrap, firstChild.nextSibling);
    } else {
      this.introSection.appendChild(this.orbWrap);
    }
  }

  /**
   * Generate optimized CSS animations for all particles
   */
  generateOrbCSS() {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'orb-3d-animations';

    // Build CSS rules array for batch processing
    const cssRules = [];

    for (let i = 1; i <= this.config.total; i++) {
      const { particleCSS, keyframeCSS } = this.generateParticleAnimation(i);
      cssRules.push(particleCSS, keyframeCSS);
    }

    // Single DOM write for all CSS
    styleSheet.textContent = cssRules.join('\n');
    document.head.appendChild(styleSheet);
  }

  /**
   * Generate CSS for individual particle
   */
  generateParticleAnimation(index) {
    const { animationTime, baseDelay, delayIncrement, orbSize, baseHue, hueShift, total } = this.config;

    // Random rotation angles
    const zAngle = this.randomInt(0, 360);
    const yAngle = this.randomInt(0, 360);

    // Calculate hue gradient
    const hue = ((hueShift / total * index) + baseHue) % 360;

    // Staggered delay
    const delay = (baseDelay + index * delayIncrement).toFixed(2);

    // Particle-specific styles
    const particleCSS = `.orb-particle:nth-child(${index}) {` +
      `animation: orbit${index} ${animationTime}s infinite;` +
      `animation-delay: ${delay}s;` +
      `background-color: hsla(${hue}, 100%, 50%, 1);` +
      `}`;

    // Keyframe animation with four stages: fade in, form orb, hold, explode
    const keyframeCSS = `@keyframes orbit${index} {` +
      `20% { opacity: 1; }` +  // Fade in complete
      `30% {` +  // Form orb
        `transform: rotateZ(${-zAngle}deg) rotateY(${yAngle}deg) ` +
        `translateX(${orbSize}px) rotateZ(${zAngle}deg);` +
      `}` +
      `80% {` +  // Hold orb
        `transform: rotateZ(${-zAngle}deg) rotateY(${yAngle}deg) ` +
        `translateX(${orbSize}px) rotateZ(${zAngle}deg);` +
        `opacity: 1;` +
      `}` +
      `100% {` +  // Explode outward
        `transform: rotateZ(${-zAngle}deg) rotateY(${yAngle}deg) ` +
        `translateX(${orbSize * 3}px) rotateZ(${zAngle}deg);` +
      `}` +
      `}`;

    return { particleCSS, keyframeCSS };
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pause the orb animation
   */
  pause() {
    if (this.orbWrap) {
      this.orbWrap.style.animationPlayState = 'paused';
    }
  }

  /**
   * Resume the orb animation
   */
  resume() {
    if (this.orbWrap) {
      this.orbWrap.style.animationPlayState = 'running';
    }
  }
}

// Initialize when DOM is ready
(() => {
  const init = () => {
    const orb = new Orb3D();

    // Expose pause/resume methods globally
    App.Orb3D = {
      pause: () => orb.pause(),
      resume: () => orb.resume()
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


;
/* ===== i18n.js ===== */
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
    // no-cache: always revalidate with the server (304 when unchanged) —
    // locale json has no ?v= cache-bust, and a heuristically-cached stale
    // copy silently drops every key added since (WebKit bit us here).
    return fetch(LOCALES_PATH + lang + '.json', { cache: 'no-cache' })
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
      // Only the default locale is prefetched at parse time — a saved
      // non-default language must be fetched here or _apply() silently
      // no-ops and the page boots untranslated (long-standing es bug).
      const boot = () => {
        if (_cache[saved]) this._apply(saved, false);
        else if (_cache[DEFAULT_LANG]) this._apply(DEFAULT_LANG, false);
        this._setupButtons();
        _resolveReady();
      };
      if (_cache[saved]) boot();
      else _fetchLocale(saved).then(boot);
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


;
/* ===== barcode-animation.js ===== */
/**
 * barcode-animation.js — ambient cyberpunk barcode overlay for #intro.
 *
 * Renders full-height vertical bars of stochastic widths (1–8 px) at very
 * low opacity, with individual luminance flicker, a single horizontal scan-
 * band that sweeps top→bottom every ~5 s, and rare amber glitch bursts on
 * wider bars.  Layered via CSS mix-blend-mode:screen above the ParticleSystem
 * canvas so it enriches dark areas without obscuring bright particles or text.
 *
 * Exposes:  App.BarcodeAnimation = { start, stop }
 */
(function () {
  'use strict';

  const isSafari = App.BrowserDetect
    ? App.BrowserDetect.isSafariBased()
    : /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Project colour palette (rgb triples)
  const COL_TEAL  = [10,  147, 150];  // #0A9396
  const COL_MINT  = [148, 210, 189];  // #94D2BD
  const COL_CYAN  = [0,   238, 255];  // #0EEFFF
  const COL_AMBER = [238, 155, 0  ];  // #EE9B00  — glitch accent only

  // Weighted pool: teal appears 3×, mint 2×, cyan 1×
  const BASE_POOL = [COL_TEAL, COL_TEAL, COL_TEAL, COL_MINT, COL_MINT, COL_CYAN];

  const TARGET_FPS  = isSafari ? 16 : 24;
  const FRAME_MS    = 1000 / TARGET_FPS;
  const SCAN_PERIOD = 5200; // ms — one full top-to-bottom sweep

  let canvas = null;
  let ctx    = null;
  let rafId  = null;
  let running  = false;
  let lastTime = 0;

  let W = 0, H = 0;
  let bars = [];
  let scanProgress = 0; // 0..1 normalised vertical position

  // ─── Bar geometry & state ────────────────────────────────────────────────

  function buildBars() {
    bars = [];
    let x = 0;
    while (x < W) {
      const r = Math.random();
      // Width distribution: ~52% 1 px, ~26% 2 px, ~12% 3 px, ~10% 4-8 px
      const w = r < 0.52 ? 1
              : r < 0.78 ? 2
              : r < 0.90 ? 3
              : 4 + Math.floor(Math.random() * 5);

      const gap    = Math.random() < 0.28 ? 1 : 0;    // occasional 1-px gap
      const active = Math.random() < 0.62;             // ~38% of bars are invisible

      bars.push({
        x, w, active,
        col:          BASE_POOL[Math.floor(Math.random() * BASE_POOL.length)],
        baseAlpha:    0.028 + Math.random() * 0.062,   // 0.028..0.09
        phase:        Math.random() * Math.PI * 2,
        flickerHz:    0.7  + Math.random() * 2.3,      // rad/s
        // Glitch state (only relevant for w >= 2)
        glitchPeriod: 1800 + Math.random() * 3500,     // ms between opportunities
        glitchTimer:  Math.random() * 2000,            // stagger initial timing
        glitchOn:     false,
        glitchY:      0,
        glitchH:      0,
      });
      x += w + gap;
    }
  }

  // ─── Canvas lifecycle ────────────────────────────────────────────────────

  function createCanvas() {
    const intro = document.getElementById('intro');
    if (!intro) return false;

    canvas = document.createElement('canvas');
    canvas.id = 'barcodeCanvas';
    canvas.setAttribute('aria-hidden', 'true');

    // Place after particle canvas so it layers above it (z-index in CSS handles order)
    const particleCanvas = intro.querySelector('#particleCanvas');
    if (particleCanvas) {
      particleCanvas.after(canvas);
    } else {
      intro.insertBefore(canvas, intro.firstChild);
    }

    ctx = canvas.getContext('2d');
    resize();
    return true;
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    buildBars();
    scanProgress = 0;
  }

  // ─── Render loop ─────────────────────────────────────────────────────────

  function draw(timestamp) {
    if (!running) return;
    rafId = requestAnimationFrame(draw);

    const elapsed = timestamp - lastTime;
    if (elapsed < FRAME_MS) return;
    lastTime = timestamp - (elapsed % FRAME_MS);

    const t = timestamp * 0.001; // seconds

    // Advance scan line
    scanProgress = (scanProgress + elapsed / SCAN_PERIOD) % 1;
    const scanY = scanProgress * H;

    ctx.clearRect(0, 0, W, H);

    // ── 1. Vertical bars ─────────────────────────────────────────────────
    for (let i = 0; i < bars.length; i++) {
      const b = bars[i];
      if (!b.active) continue;

      // Individual luminance flicker (slow sine)
      const flicker = 0.55 + 0.45 * Math.sin(t * b.flickerHz + b.phase);
      const a = b.baseAlpha * flicker;
      const [r, g, bc] = b.col;

      ctx.fillStyle = `rgba(${r},${g},${bc},${a})`;
      ctx.fillRect(b.x, 0, b.w, H);

      // Glitch burst — one-frame amber flash on wider bars
      if (b.w >= 2) {
        b.glitchTimer -= elapsed;
        if (b.glitchTimer <= 0) {
          b.glitchTimer = b.glitchPeriod + Math.random() * 1200;
          if (Math.random() < 0.42) {
            b.glitchOn = true;
            b.glitchY  = Math.random() * H;
            b.glitchH  = 1 + Math.floor(Math.random() * 6);
          }
        }
        if (b.glitchOn) {
          const [ar, ag, ab] = COL_AMBER;
          ctx.fillStyle = `rgba(${ar},${ag},${ab},0.78)`;
          ctx.fillRect(b.x, b.glitchY, b.w, b.glitchH);
          b.glitchOn = false; // single-frame flash, reset immediately
        }
      }
    }

    // ── 2. Horizontal scan sweep (one gradient, full width) ───────────────
    const bandH    = H * 0.072;
    const bandTop  = Math.max(0, scanY - bandH);
    const bandBot  = Math.min(H, scanY + bandH);
    const sweep    = ctx.createLinearGradient(0, bandTop, 0, bandBot);
    sweep.addColorStop(0,   'rgba(0,238,255,0)');
    sweep.addColorStop(0.5, 'rgba(0,238,255,0.058)');
    sweep.addColorStop(1,   'rgba(0,238,255,0)');
    ctx.fillStyle = sweep;
    ctx.fillRect(0, bandTop, W, bandBot - bandTop);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  function start() {
    if (running) return;
    if (!canvas && !createCanvas()) return;
    running  = true;
    lastTime = 0;
    canvas.style.opacity = '1';
    requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (canvas) canvas.style.opacity = '0';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  window.addEventListener('resize', () => { if (canvas) resize(); }, { passive: true });

  App.BarcodeAnimation = { start, stop };
})();


;
/* ===== constants.js ===== */
/**
 * constants.js — shared application-wide constants.
 *
 * NOTE: preloader.js keeps a verbatim copy of GLITCH_CHARS because it runs
 * as a classic IIFE before any module infrastructure is available. If you
 * change the string here, update preloader.js line 8 to match.
 */
(function () {
  'use strict';

  window.GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');
}());


;
/* ===== static-line.js ===== */
/**
 * static-line.js — animated canvas "electric static" line factory.
 *
 * makeStaticLine(canvasEl, opts) → { show, hide }
 *   shadow: bool    — draw ctx shadowColor/Blur (false = rely on CSS filter)
 *   throttleEvery: n — keep 1-in-n RAF frames; 1 = no throttle (~60fps)
 *   resizeDebounce: ms — debounce canvas resize (0 = immediate)
 *
 * bindSectionEdge(canvasEl, line, sectionEl, edge)
 *   Wires a line to the top or bottom edge of a section while that edge is
 *   within the visible viewport, hiding it 150 ms after scroll stops.
 */
(function () {
  'use strict';

  function makeStaticLine(canvasEl, {
    shadow = true,
    throttleEvery = 1,
    resizeDebounce = 0,
    vertical = false,        // true → vertical line (4px wide, full viewport height)
  } = {}) {
    const ctx = canvasEl.getContext('2d');
    let animId = null;
    let frameCount = 0;
    let resizeTimer = null;

    const sizeCanvas = () => {
      if (vertical) { canvasEl.width = 4;                 canvasEl.height = window.innerHeight; }
      else          { canvasEl.width = window.innerWidth; canvasEl.height = 4; }
    };
    const resize = () => {
      if (resizeDebounce > 0) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sizeCanvas, resizeDebounce);
      } else {
        sizeCanvas();
      }
    };
    sizeCanvas();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (throttleEvery > 1 && ++frameCount % throttleEvery !== 0) return;

      const w = canvasEl.width;
      const h = canvasEl.height;
      ctx.clearRect(0, 0, w, h);

      // Main cyan jitter trace + a sparser white sparkle pass. A vertical line
      // walks Y and jitters X around the centre axis (w/2); horizontal walks X
      // and jitters Y around h/2.
      const cx = w / 2, cy = h / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#0ef';
      ctx.lineWidth   = 1.5;
      if (shadow) { ctx.shadowColor = '#0ef'; ctx.shadowBlur = 6; }
      if (vertical) {
        ctx.moveTo(cx, 0);
        for (let y = 0; y < h; y += 3) ctx.lineTo(cx + (Math.random() - 0.5) * w * 2, y);
      } else {
        ctx.moveTo(0, cy);
        for (let x = 0; x < w; x += 3) ctx.lineTo(x, cy + (Math.random() - 0.5) * h * 2);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth   = 1;
      if (shadow) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 3; }
      if (vertical) {
        for (let y = 0; y < h; y += 3) {
          if (Math.random() > 0.7) ctx.lineTo(cx + (Math.random() - 0.5) * w, y);
          else                     ctx.moveTo(cx, y);
        }
      } else {
        for (let x = 0; x < w; x += 3) {
          if (Math.random() > 0.7) ctx.lineTo(x, cy + (Math.random() - 0.5) * h);
          else                     ctx.moveTo(x, cy);
        }
      }
      ctx.stroke();
    };

    const show = () => {
      canvasEl.classList.add('active');
      if (!animId) { frameCount = 0; draw(); }
    };

    const hide = () => {
      canvasEl.classList.remove('active');
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    };

    return { show, hide };
  }

  function bindSectionEdge(canvasEl, line, sectionEl, edge) {
    if (!sectionEl) return;
    edge = edge || 'bottom';
    let scrollTimeout = null;
    const update = () => {
      const rect = sectionEl.getBoundingClientRect();
      const pos  = edge === 'bottom' ? rect.bottom : rect.top;
      if (pos > 4 && pos < window.innerHeight - 4) {
        canvasEl.style.top = `${pos - 2}px`;
        line.show();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => line.hide(), 150);
      } else {
        line.hide();
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  window.makeStaticLine  = makeStaticLine;
  window.bindSectionEdge = bindSectionEdge;
}());


;
/* ===== svg-inline.js ===== */
/**
 * svg-inline.js — converts an <img id="id1svg"> tag to an inline <svg>,
 * prefixes all internal IDs to avoid document-level collisions, and sets up
 * an IntersectionObserver to drive entrance/exit animation classes.
 *
 * Chrome-specific fixes applied:
 *   - ID prefix `id1-` prevents duplicate-ID bugs with shared gradient IDs.
 *   - xlink:href → href conversion for gradient inheritance in Chrome 79+.
 */
(function () {
  'use strict';

  function convertID1SvgToInline() {
    const imgElement = document.getElementById('id1svg');
    if (!imgElement) return;

    const imgURL = imgElement.src;

    fetch(imgURL)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Prefix all internal IDs to prevent conflicts with existing document IDs
        // (e.g. id="Layer_1-2" is shared with the DNA capsule SVG).
        const ID_PREFIX = 'id1-';
        const idMap = {};
        svgElement.querySelectorAll('[id]').forEach(el => {
          const oldId = el.getAttribute('id');
          const newId = ID_PREFIX + oldId;
          idMap[oldId] = newId;
          el.setAttribute('id', newId);
        });

        // Update url(#...) references in presentation attributes
        const rewriteUrlAttr = (el, attrName) => {
          const val = el.getAttribute(attrName);
          if (!val) return;
          const next = val.replace(/url\(#([^)]+)\)/g, (_, id) =>
            `url(#${idMap[id] || id})`
          );
          if (next !== val) el.setAttribute(attrName, next);
        };
        svgElement.querySelectorAll('[fill]').forEach(el => rewriteUrlAttr(el, 'fill'));
        svgElement.querySelectorAll('[stroke]').forEach(el => rewriteUrlAttr(el, 'stroke'));
        svgElement.querySelectorAll('[clip-path]').forEach(el => rewriteUrlAttr(el, 'clip-path'));
        svgElement.querySelectorAll('[filter]').forEach(el => rewriteUrlAttr(el, 'filter'));
        svgElement.querySelectorAll('[mask]').forEach(el => rewriteUrlAttr(el, 'mask'));

        // The current Illustrator export applies gradient fills via a <style>
        // block (.st0 { fill: url(#radial-gradient); }) instead of fill
        // attributes — rewrite url(#...) there too, and scope the generic .stN
        // selectors so they can't collide with other inline SVGs once this
        // stylesheet becomes document-global.
        svgElement.querySelectorAll('style').forEach(styleEl => {
          styleEl.textContent = styleEl.textContent
            .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${idMap[id] || id})`)
            .replace(/\.st(\d+)\b/g, `#${imgElement.id} .st$1`);
        });

        // Convert deprecated xlink:href → href for gradient inheritance in Chrome 79+.
        const XLINK_NS = 'http://www.w3.org/1999/xlink';
        svgElement.querySelectorAll('*').forEach(el => {
          const xlinkHref = el.getAttributeNS(XLINK_NS, 'href');
          if (xlinkHref !== null) {
            const refId = xlinkHref.startsWith('#') ? xlinkHref.slice(1) : null;
            const resolved = refId && idMap[refId] ? `#${idMap[refId]}` : xlinkHref;
            el.setAttribute('href', resolved);
            el.removeAttributeNS(XLINK_NS, 'href');
          }
        });

        // Copy identity attributes from the original <img>
        svgElement.setAttribute('id', imgElement.id);
        if (imgElement.className) svgElement.setAttribute('class', imgElement.className);

        // Add animation classes to internal elements. Selectors match the
        // current Illustrator export: coords rounded to 1 decimal, character
        // group named ID_character, outer card frame has no id (matched by
        // its path data instead).
        const border      = svgElement.querySelector('path[d^="M10.5,239.4"]');
        const face        = svgElement.querySelector(`#${ID_PREFIX}ID_character`);
        const hexagons    = svgElement.querySelectorAll('polygon[points*="39.4 "], polygon[points*="77.8 "], polygon[points*="116.4 "], polygon[points*="154.3 "]');
        const circles     = svgElement.querySelectorAll('circle[cx="27.6"], circle[cx="66"], circle[cx="104.6"]');
        const sideCircles = svgElement.querySelectorAll('circle[cx="49.3"]');
        const stars       = svgElement.querySelectorAll('polygon[points*="442.2 "], polygon[points*="410.1 "], polygon[points*="377.9 "], polygon[points*="345.3 "], polygon[points*="506.5 "], polygon[points*="474.8 "]');
        const rects       = svgElement.querySelectorAll('rect');

        if (border) border.classList.add('id1-border');
        if (face)   face.classList.add('id1-face');
        hexagons.forEach((hex, i)  => { hex.classList.add('id1-hexagon');     hex.style.setProperty('--hex-index', i); });
        circles.forEach((c, i)     => { c.classList.add('id1-circle');         c.style.setProperty('--circle-index', i); });
        sideCircles.forEach((c, i) => { c.classList.add('id1-side-circle');    c.style.setProperty('--side-circle-index', i); });
        stars.forEach((s, i)       => { s.classList.add('id1-star');           s.style.setProperty('--star-index', i); });
        rects.forEach((r, i)       => { r.classList.add('id1-rect');           r.style.setProperty('--rect-index', i); });

        // Group the five role/hobby text rows (outlined glyph paths in five
        // y-bands beside the side circles, x 60–300) into <g class="id1-tag">
        // wrappers so each row is a single hoverable element. Paths within a
        // row are contiguous siblings, so wrapping preserves paint order.
        const SVG_NS    = 'http://www.w3.org/2000/svg';
        const TAG_BANDS = [[200, 217], [230, 245], [259, 273], [286, 301], [315, 330]];
        const tagRows   = TAG_BANDS.map(() => []);
        svgElement.querySelectorAll('path.st18').forEach(p => {
          const m = /^M([\d.]+),([\d.]+)/.exec(p.getAttribute('d') || '');
          if (!m) return;
          const x = parseFloat(m[1]);
          const y = parseFloat(m[2]);
          if (x < 60 || x > 300) return;
          const band = TAG_BANDS.findIndex(([y0, y1]) => y >= y0 && y <= y1);
          if (band !== -1) tagRows[band].push(p);
        });
        const tagGroups = [];
        tagRows.forEach((paths, i) => {
          if (!paths.length) return;
          const g = document.createElementNS(SVG_NS, 'g');
          g.classList.add('id1-tag');
          g.style.setProperty('--tag-index', i);
          paths[0].parentNode.insertBefore(g, paths[0]);
          paths.forEach(p => g.appendChild(p));
          tagGroups[i] = g;
        });

        imgElement.parentNode.replaceChild(svgElement, imgElement);

        // Transparent hit-area rect behind each tag row — the hover target
        // becomes the full row box, not just the thin glyph strokes.
        // getBBox() needs a rendered element, hence after insertion + rAF.
        requestAnimationFrame(() => {
          svgElement.querySelectorAll('g.id1-tag').forEach(g => {
            try {
              const b   = g.getBBox();
              const hit = document.createElementNS(SVG_NS, 'rect');
              hit.setAttribute('class', 'id1-tag-hit');
              hit.setAttribute('x',      b.x - 5);
              hit.setAttribute('y',      b.y - 4);
              hit.setAttribute('width',  b.width + 10);
              hit.setAttribute('height', b.height + 8);
              g.insertBefore(hit, g.firstChild);
            } catch (e) { /* not rendered yet — row stays glyph-hover only */ }
          });
        });

        // ── Alternate portraits ──────────────────────────────────────────
        // Hovering a tag row swaps the ID_character portrait for the row's
        // own illustration. Rows: 0 book reader · 1 guitar player ·
        // 2 certified tattoo artist · 3 freelancer · 4 time traveler.
        // Drop a file in and add one entry here when new artwork lands;
        // rows without an entry keep just the amber text hover.
        const ALT_CHARACTERS = {
          0: { name: 'book-reader',   url: 'images/reader.svg' },
          1: { name: 'guitar-player', url: 'images/guitar electric.svg' },
          2: { name: 'tattoo-artist', url: 'images/tattoo.svg' },
          3: { name: 'freelancer',    url: 'images/freelance.svg' },
          4: { name: 'time-traveler', url: 'images/time.svg' },
        };

        // ID_character's portrait frame rect in id1.svg user units —
        // alternates are contain-fitted and centered into this box.
        const FRAME = { x: 324, y: 13.6, w: 208.3, h: 312.5 };

        Object.entries(ALT_CHARACTERS).forEach(([rowIdx, conf]) => {
          const tagGroup = tagGroups[rowIdx];
          if (!tagGroup || !face) return;

          fetch(conf.url)
            .then(r => r.text())
            .then(text => {
              const altRoot = parser.parseFromString(text, 'image/svg+xml').documentElement;
              const vb = (altRoot.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
              if (vb.length !== 4 || vb.some(isNaN)) return;

              const s  = Math.min(FRAME.w / vb[2], FRAME.h / vb[3]);
              const tx = FRAME.x + (FRAME.w - vb[2] * s) / 2 - vb[0] * s;
              const ty = FRAME.y + (FRAME.h - vb[3] * s) / 2 - vb[1] * s;

              const altGroup = document.createElementNS(SVG_NS, 'g');
              altGroup.setAttribute('class', 'id1-alt');
              altGroup.setAttribute('data-alt', conf.name);
              altGroup.setAttribute('transform', `translate(${tx} ${ty}) scale(${s})`);
              Array.from(altRoot.childNodes).forEach(n =>
                altGroup.appendChild(document.importNode(n, true)));
              // Strip ids from imported artwork — avoids document collisions
              altGroup.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

              face.parentNode.insertBefore(altGroup, face.nextSibling);

              tagGroup.addEventListener('mouseenter', () => {
                svgElement.classList.add('id1-alt-on');
                altGroup.classList.add('id1-alt-active');
              });
              tagGroup.addEventListener('mouseleave', () => {
                svgElement.classList.remove('id1-alt-on');
                altGroup.classList.remove('id1-alt-active');
              });
            })
            .catch(err => console.error('[ID1 SVG] alt portrait failed:', conf.url, err));
        });

        _setupID1Observer();
      })
      .catch(error => console.error('[ID1 SVG] Error loading SVG:', error));
  }

  // Called internally after the SVG is injected.
  // #id1svg now lives in the top head beside the title; reveal it off #abouttitle
  // (its in-flow neighbour) so the trigger can't be pushed off-screen by the
  // badge's own size. Chrome's IntersectionObserver clips to the `overflow: clip`
  // boundary, so a stable in-flow proxy is still used rather than the badge itself.
  function _setupID1Observer() {
    const id1svg = document.getElementById('id1svg');
    if (!id1svg) return;

    // Phones (match the responsive.css breakpoint, never the UA flag): the
    // badge and the scroll hint each hide only once 50% OF THE ELEMENT ITSELF
    // is out of the viewport (owner request 2026-07-01). The desktop proxy
    // below keys off #abouttitle, which exits too eagerly on the tall phone
    // column. Observing the elements directly is safe here: the phone #about
    // layout keeps both in normal flow inside the section box, so the
    // overflow:clip caveat (see desktop comment) never clips them.
    if (window.matchMedia('(max-width: 768px)').matches) {
      const halfVisibleToggle = (watchEl, targets, withExit) => {
        let entered = false;
        new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.intersectionRatio >= 0.5) {
              entered = true;
              targets.forEach(t => {
                t.classList.remove('element-exit');
                t.classList.add('element-visible');
              });
            } else if (entered) {
              targets.forEach(t => {
                t.classList.remove('element-visible');
                if (withExit) t.classList.add('element-exit');
              });
            }
          });
        }, { threshold: 0.5 }).observe(watchEl);
      };

      // Badge: element-exit drives its slideUpFade out (styles.css).
      halfVisibleToggle(id1svg, [id1svg], true);

      // Scroll hint (text + chevrons) moves as ONE unit keyed to the arrow —
      // its own observer, decoupled from the badge chain (responsive.css
      // re-keys the reveal to the hint's own class on phones). No exit class:
      // base opacity:0 + the 0.45s transition handles the fade-out.
      const arrow  = document.querySelector('#about .about-id-arrow');
      const scroll = document.querySelector('#about .about-id-scroll');
      if (arrow) halfVisibleToggle(arrow, [arrow, scroll].filter(Boolean), false);
      return;
    }

    const proxyEl =
      document.getElementById('abouttitle') ||
      document.getElementById('about-availability') ||
      document.getElementById('about');
    if (!proxyEl) return;

    let id1Entered = false;
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          id1Entered = true;
          id1svg.classList.remove('element-exit');
          id1svg.classList.add('element-visible');
        } else if (id1Entered) {
          id1svg.classList.remove('element-visible');
          id1svg.classList.add('element-exit');
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }).observe(proxyEl);
  }

  // ── skills.svg — inline conversion + per-row entrance (all viewports) ───
  // (owner request 2026-07-03: entrance like id1's, each element appearing;
  // extended from phones to desktop the same day.)
  // The graphic is an Illustrator export with outlined text: two anonymous
  // top-level <g> columns holding one <path> per glyph, no per-line grouping.
  // Rows are recovered geometrically — cluster each column's direct children
  // by the y of their path's first M command (rows sit ≥7 user units apart;
  // first-point spread within a row is <3.5) — then wrapped in <g
  // class="skills-row"> with a global top-down --row-index across BOTH
  // columns, so the stagger reads as one cascade down the card (desktop
  // cascade CSS in styles.css, phone twin in responsive.css). On any
  // fetch/parse failure the <img> stays and the stock container fade
  // still reveals the full graphic.
  function convertSkillsSvgToInline() {
    const imgElement = document.querySelector('.decoration-skills .skills-svg');
    if (!imgElement || imgElement.tagName !== 'IMG') return;

    fetch(imgElement.src)
      .then(response => response.text())
      .then(data => {
        const svgElement = new DOMParser()
          .parseFromString(data, 'image/svg+xml').documentElement;
        const SVG_ID = 'skillssvg';

        // Same collision hygiene as the id1 conversion: prefix internal ids
        // (Layer_2 is shared across Illustrator exports) and scope the .stN
        // stylesheet before it becomes document-global.
        svgElement.querySelectorAll('[id]').forEach(el =>
          el.setAttribute('id', 'skills-' + el.getAttribute('id')));
        svgElement.querySelectorAll('style').forEach(styleEl => {
          styleEl.textContent = styleEl.textContent
            .replace(/\.st(\d+)\b/g, `#${SVG_ID} .st$1`);
        });
        svgElement.setAttribute('id', SVG_ID);
        svgElement.setAttribute('class', imgElement.className + ' skills-anim');
        svgElement.setAttribute('role', 'img');
        if (imgElement.alt) svgElement.setAttribute('aria-label', imgElement.alt);

        // Named parts: orange card bg first, then the [·Skills·] sidebar
        // (dark column + glyphs) with its full-height rule line.
        const card = svgElement.querySelector('path.st1');
        if (card) card.classList.add('skills-card');
        const sideLine = svgElement.querySelector('line.st3');
        if (sideLine) sideLine.classList.add('skills-side');
        const sideGroup = svgElement.querySelector('#skills-skills');
        if (sideGroup) sideGroup.classList.add('skills-side');

        const firstMY = node => {
          const d = node.tagName === 'path'
            ? node.getAttribute('d')
            : (node.querySelector('path') || { getAttribute: () => '' }).getAttribute('d');
          const m = /^M([\d.-]+)[,\s]([\d.-]+)/.exec(d || '');
          return m ? parseFloat(m[2]) : null;
        };

        const rows = [];
        svgElement.querySelectorAll(':scope > g:not([id])').forEach(column => {
          let current = null;
          Array.from(column.children)
            .map(node => ({ node, y: firstMY(node) }))
            .filter(k => k.y !== null)
            .sort((a, b) => a.y - b.y)
            .forEach(k => {
              if (!current || k.y - current.lastY > 3.5) {
                current = { y0: k.y, lastY: k.y, nodes: [] };
                rows.push(current);
              }
              current.lastY = k.y;
              current.nodes.push(k.node);
            });
        });
        rows.sort((a, b) => a.y0 - b.y0);
        const SVG_NS = 'http://www.w3.org/2000/svg';
        rows.forEach((row, i) => {
          const g = document.createElementNS(SVG_NS, 'g');
          g.setAttribute('class', 'skills-row');
          g.style.setProperty('--row-index', i);
          row.nodes[0].parentNode.insertBefore(g, row.nodes[0]);
          row.nodes.forEach(n => g.appendChild(n));
        });

        imgElement.parentNode.replaceChild(svgElement, imgElement);
        // Flags the container so responsive.css hands the reveal over to the
        // per-part stagger (container paints immediately; parts are hidden
        // until its element-visible arrives from the script.js observer).
        svgElement.closest('.decoration-skills').classList.add('skills-inline');
      })
      .catch(error => console.error('[Skills SVG] Error loading SVG:', error));
  }

  window.convertID1SvgToInline = convertID1SvgToInline;
  window.convertSkillsSvgToInline = convertSkillsSvgToInline;
}());


;
/* ===== art-direction.js ===== */
/**
 * art-direction.js — Art Direction section entrance + ambient controller.
 *
 * initArtDirectionEntrance(section)
 *   • Scroll-driven letter reveal (clip-path per .art-cell)
 *   • Nav-triggered timed animation (App.playArtEntranceAnimation)
 *   • Background image glitch entrance (.art-bg-image)
 *   • Discipline nav decode (.ad-explore-card .adnav-label) + the
 *     body.ad-section-live gate that drives the skills bar, intro frame
 *     and nav-card entrances
 *   • Viewport gate: pauses ambient CSS animations (letter blink, scanlines,
 *     VHS static) while the section is off-screen
 *
 * Performance: all three scroll-driven behaviours share ONE passive scroll
 * listener, rAF-throttled, reading getBoundingClientRect() once per frame —
 * no per-event forced layout. Subsystems coordinate via the section-scoped
 * CustomEvent('artEntrancePlay') rather than monkey-patching.
 *
 * Accessibility: honors prefers-reduced-motion — letter reveal / bg jump to
 * their end state and text decodes resolve instantly (window.scrambleText).
 *
 * Depends on: lib/scramble.js (window.scrambleText), app-registry.js (App).
 */
(function () {
  'use strict';

  // clip-path wipe applied during the nav-triggered letter entrance.
  // 0.28 s sits between --transition-fast (0.2 s) and --transition-base (0.3 s):
  // snappy enough to feel instant, slow enough for the reveal to be legible.
  const CELL_REVEAL_TRANSITION = 'clip-path 0.28s ease-out';

  // Nav-card decode cadence (matches the previous bespoke scramble loop).
  const NAV_SCRAMBLE = { frameMs: 45, initialDelay: 300, stepMs: 90 };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function initArtDirectionEntrance(section) {
    if (!section) return;

    const cells = [...section.querySelectorAll('.art-cell')];
    if (!cells.length) return;

    const TOTAL = cells.length;
    let playing = false;

    // ── Letter grid ────────────────────────────────────────────────────────────

    // Hide all cells before JS takes over.
    cells.forEach(cell => { cell.style.clipPath = 'inset(0 100% 0 0)'; });

    // Stamp each cell's letter onto its glitch children so CSS ::after can read it.
    cells.forEach(cell => {
      const letter = cell.dataset.letter;
      cell.querySelectorAll('.glitch-r, .glitch-g, .glitch-b').forEach(el => {
        el.dataset.letter = letter;
      });
    });

    const revealAll = () => {
      cells.forEach(c => { c.style.transition = ''; c.style.clipPath = 'inset(0 0% 0 0)'; });
    };

    // Timed animation — used when the nav button is clicked. Dispatches
    // 'artEntrancePlay' so the bg / nav subsystems react independently.
    App.playArtEntranceAnimation = () => {
      if (reducedMotion.matches) {
        revealAll();
        section.dispatchEvent(new CustomEvent('artEntrancePlay', { bubbles: false }));
        return;
      }
      playing = true;
      cells.forEach(cell => {
        cell.style.transition = CELL_REVEAL_TRANSITION;
        cell.style.clipPath   = 'inset(0 100% 0 0)';
      });
      section.dispatchEvent(new CustomEvent('artEntrancePlay', { bubbles: false }));
      cells.forEach((cell, i) => {
        setTimeout(() => {
          cell.style.clipPath = 'inset(0 0% 0 0)';
          if (i === TOTAL - 1) {
            setTimeout(() => {
              cells.forEach(c => { c.style.transition = ''; });
              playing = false;
            }, 320);
          }
        }, i * 120);
      });
    };

    const updateLetters = (rect, vh) => {
      if (playing) return;
      if (reducedMotion.matches) { revealAll(); return; }
      // Phones: the section rests below the fixed header (scroll-margin-top),
      // so rect.top never reaches 0 there — with a /vh span the wipe stalls at
      // ~0.89 and the ION row stays clipped when arriving by scroll. Shrink
      // the span so the reveal completes right at the rest position. Desktop
      // pins at top:0 and keeps the original full-viewport span.
      let span = vh;
      if (App.BrowserDetect && App.BrowserDetect.isMobile) {
        const header = document.querySelector('header');
        span = vh - ((header ? header.offsetHeight : 0) + 8);
      }
      const progress = clamp01((vh - rect.top) / span);
      cells.forEach((cell, i) => {
        const start = i / TOTAL;
        const end   = (i + 1) / TOTAL;
        const local = clamp01((progress - start) / (end - start));
        cell.style.clipPath = `inset(0 ${((1 - local) * 100).toFixed(2)}% 0 0)`;
      });
    };

    // ── Background image ───────────────────────────────────────────────────────

    const artBgImage = section.querySelector('.art-bg-image');
    let bgPlayed = false;

    const triggerBg = () => {
      if (bgPlayed || !artBgImage) return;
      bgPlayed = true;
      if (reducedMotion.matches) {
        // Skip the glitch entrance — reveal the final state directly.
        artBgImage.style.opacity   = '1';
        artBgImage.style.clipPath  = 'none';
        artBgImage.style.transform = 'none';
      } else {
        artBgImage.classList.add('art-bg-animate');
      }
    };

    const resetBg = () => {
      if (!artBgImage) return;
      bgPlayed = false;
      artBgImage.classList.remove('art-bg-animate');
      artBgImage.style.opacity   = '';
      artBgImage.style.clipPath  = '';
      artBgImage.style.transform = '';
    };

    const updateBg = (rect, vh) => {
      if (bgPlayed) return;
      if ((vh - rect.top) / vh > 0.05) triggerBg();
    };

    // ── Discipline nav decode + ad-section-live gate ─────────────────────────────
    // The nav card (.ad-explore-card inline SVG) is the section navigation. This
    // block owns the body.ad-section-live gate that drives the skills bar, intro
    // frame and nav-card entrances — if the card is removed, that gate must move.

    const navCard   = section.querySelector('.ad-explore-card');
    const navLabels = [...section.querySelectorAll('.ad-explore-card .adnav-label[data-content]')];
    const hasNav    = navCard && navLabels.length;
    const dnaSpans  = [...section.querySelectorAll('.ad-dna .text span')];
    let sectionLive = false;

    // Intro paragraph — about-style Splitting glitch entrance (owner
    // 2026-07-03, same tempo as #about's copy: tuning + char wave live in
    // art-direction-panel.css). The host keeps glitch-suppressed for life;
    // firing is (re)triggered with the intro reveal below and undone on
    // reset so nav-button replays re-run the wave.
    const iadBody = section.querySelector('.iad-body');
    const splitIadBody = () => {
      if (!iadBody || !window.Splitting) return;
      // i18n rewrites the innerHTML — drop Splitting's memo (el['🍌']) or
      // the re-split silently hands back the stale, detached chars.
      delete iadBody['🍌'];
      window.Splitting({ target: iadBody, by: 'chars' }).forEach(result => {
        result.chars.forEach(char => {
          char.style.setProperty('--count', Math.random() * 5 + 1);
          for (let g = 0; g < 10; g++) {
            const rc = window.GLITCH_CHARS[Math.floor(Math.random() * window.GLITCH_CHARS.length)];
            char.style.setProperty(`--char-${g}`, `"${rc}"`);
          }
        });
      });
    };
    splitIadBody();
    if (iadBody) iadBody.classList.add('glitch-suppressed');

    const triggerSectionLive = () => {
      if (sectionLive) return;
      sectionLive = true;
      document.body.classList.add('ad-section-live');
      navLabels.forEach((label, i) =>
        window.scrambleText(label, { ...NAV_SCRAMBLE, startDelay: i * 120 }));
      setTimeout(() => {
        section.classList.add('ad-intro-animate');
        window.scrambleText(section.querySelector('.iad-header[data-content]'), NAV_SCRAMBLE);
        if (iadBody) {
          // suppress → flush → fire (the cross-browser restart dance from
          // GlitchSystem.triggerGlitch) so replays re-run the char wave.
          iadBody.classList.remove('glitch-firing');
          void iadBody.offsetWidth;
          iadBody.classList.add('glitch-firing');
        }
      }, 700);
      // DNA ring letters — reveal after the capsule finishes growing (0.9s
      // delay + 1.2s grow). Guarded so a reset mid-stagger can't re-reveal.
      dnaSpans.forEach((span, i) => {
        setTimeout(() => { if (sectionLive) span.classList.add('revealed'); }, 1600 + i * 60);
      });
    };

    const resetSectionLive = () => {
      if (!hasNav) return;
      sectionLive = false;
      document.body.classList.remove('ad-section-live');
      section.classList.remove('ad-intro-animate');
      section.classList.add('ad-intro-active');
      navLabels.forEach(label => { label.textContent = label.getAttribute('data-content'); });
      dnaSpans.forEach(span => span.classList.remove('revealed'));
      if (iadBody) iadBody.classList.remove('glitch-firing');
      ['.iad-header[data-content]'].forEach(sel => {
        const el = section.querySelector(sel);
        if (el) el.textContent = el.getAttribute('data-content');
      });
    };

    // Scrambled texts resolve to data-content, but i18n only rewrites
    // textContent — keep the attributes in sync so a post-toggle scramble
    // (or resetSectionLive) can't restore the previous language.
    document.addEventListener('languagechanged', () => {
      // i18n just rewrote the intro paragraph — re-split it. If the host is
      // still glitch-firing, the fresh chars re-run the wave on insertion.
      splitIadBody();
      const el = section.querySelector('.iad-header[data-content]');
      const t  = App.LanguageManager?.translate('ad.intro.header');
      if (el && t) el.setAttribute('data-content', t);
      navLabels.forEach(label => {
        const disc = label.closest('[data-discipline]')?.dataset.discipline;
        const lt   = disc && App.LanguageManager?.translate(`ad.nav.label.${disc}`);
        if (lt) label.setAttribute('data-content', lt);
      });
    });

    // Nav button — letters play first, then the nav card decodes after they finish.
    const lettersDone = (TOTAL - 1) * 120 + 400;
    section.addEventListener('artEntrancePlay', () => {
      resetBg();
      requestAnimationFrame(triggerBg);
      if (hasNav) {
        resetSectionLive();
        setTimeout(triggerSectionLive, lettersDone);
      }
    });

    // ── Single rAF-throttled scroll loop ─────────────────────────────────────────
    // One rect read per frame, fanned out to every scroll-driven behaviour.

    let ticking = false;

    const onFrame = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const vh   = window.innerHeight;
      updateLetters(rect, vh);
      updateBg(rect, vh);
      // Go live once ≥40% of the section is on screen — the intro frame
      // (red #BB3E03) and skills bar (amber #EE9B00) ride the ad-section-live
      // gate, so this is what brings them in. Measured as visible height over
      // min(section, viewport) so it stays reachable if the section ever grows
      // taller than the viewport (pure section-height ratios can't).
      if (hasNav && !sectionLive) {
        const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        const visibleFrac = visible / Math.min(rect.height || vh, vh);
        if (visibleFrac >= 0.4) triggerSectionLive();
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onFrame);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onFrame(); // initial paint

    // ── Observers ────────────────────────────────────────────────────────────────

    // Reset entrance state when the section fully leaves the viewport so it
    // replays on the next visit.
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) { resetBg(); resetSectionLive(); }
      });
    }, { threshold: 0 }).observe(section);

    // Viewport gate — pause ambient CSS animations (letter blink, scanlines, VHS
    // static) while the section is off-screen. Activates #art-direction
    // .paused-animations in css/main.css. rootMargin warms up just before entry.
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        section.classList.toggle('paused-animations', !e.isIntersecting);
      });
    }, { rootMargin: '200px 0px' }).observe(section);
  }

  window.initArtDirectionEntrance = initArtDirectionEntrance;
}());


;
/* ===== about-pin.js ===== */
/**
 * about-pin.js — #about Paul Rand quote: self-running, looping reveal.
 *
 * initAboutPin(smoothScrollTo)
 *   smoothScrollTo is injected by the caller (script.js) so this module
 *   does not need to know about the scroll duration constants defined there.
 *
 * The section no longer hijacks the scroll. The quote plays itself:
 *   Design h3 glitches → each yellow line slides into the 1-line window with a
 *   glitch and a readable pause → ending glitches in → the full quote holds →
 *   the sequence loops. The loop is paused whenever the section is offscreen
 *   (IntersectionObserver) and is skipped entirely under prefers-reduced-motion.
 */
(function () {
  'use strict';

  function initAboutPin(smoothScrollTo) {
    const wrapper        = document.querySelector('.about-pin-wrapper');
    const about          = document.getElementById('about');
    const header         = document.querySelector('header');
    if (!wrapper || !about || !header) return;

    const quoteItems     = Array.from(document.querySelectorAll('.paul-rands-quote li'));
    const ending         = document.querySelector('.paul-rands-quote .ending');
    const quoteContainer = document.querySelector('.paul-rands-quote');
    const quoteH3        = document.querySelector('.paul-rands-quote blockquote p');
    const numItems       = quoteItems.length; // 3

    const STEP_ANIM      = 900;   // ms for one yellow-line slide-in
    const READABLE_PAUSE = 1000;  // ms hold after a line's glitch settles
    const END_HOLD       = 2800;  // ms the full quote stays before looping
    const LOOP_GAP       = 600;   // ms blank-ish beat before the reveal restarts

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── State ──────────────────────────────────────────────────────────────────

    let lastIndex     = -2;     // last snapped item index (-2 = uninitialised)
    let endingShown   = false;
    let sectionActive = false;
    let running       = false;  // a reveal sequence is in flight
    let rafId         = null;
    let stepTimer     = null;   // single owned timeout for the whole sequence

    if (App) App._scrollPathActive = false; // legacy flag; no readers remain

    // ── Helpers ──────────────────────────────────────────────────────────────

    function measure() {
      document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    }

    function triggerGlitch(el) {
      if (!el) return;
      el.classList.remove('glitch-active');
      void el.offsetWidth;
      el.classList.add('glitch-active');
    }

    function glitchDuration(el) {
      if (!el) return 500;
      const chars = el.querySelectorAll('[data-char]');
      if (!chars.length) return 500;
      return 500 + (chars.length - 1) * 0.55 * 200;
    }

    function applyOffset(offset) {
      const ty = -offset * 1.2;
      quoteItems.forEach(li => { li.style.transform = `translateY(${ty}em)`; });
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    // ── Sequence ────────────────────────────────────────────────────────────

    function animateStep(fromOffset, toOffset, onDone) {
      let startTime = null;
      function tick(ts) {
        if (!running) return;
        if (!startTime) startTime = ts;
        const t = Math.min((ts - startTime) / STEP_ANIM, 1);
        applyOffset(fromOffset + (toOffset - fromOffset) * easeOutCubic(t));
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
          onDone();
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function runStep(stepIndex) {
      if (!running) return;

      if (stepIndex < numItems) {
        animateStep(stepIndex - 1, stepIndex, () => {
          if (!running) return;
          triggerGlitch(quoteItems[stepIndex]);
          lastIndex = stepIndex;
          const settleMs = glitchDuration(quoteItems[stepIndex]);
          stepTimer = setTimeout(() => {
            if (!running) return;
            stepTimer = setTimeout(() => runStep(stepIndex + 1), READABLE_PAUSE);
          }, settleMs);
        });

      } else {
        // Full quote: reveal the ending, hold, then loop.
        endingShown = true;
        if (ending) {
          ending.classList.add('visible');
          triggerGlitch(ending);
          stepTimer = setTimeout(loopRestart, glitchDuration(ending) + END_HOLD);
        } else {
          stepTimer = setTimeout(loopRestart, END_HOLD);
        }
      }
    }

    function runIntro() {
      if (running || !sectionActive) return;
      running     = true;
      endingShown = false;
      lastIndex   = -2;
      if (ending) { ending.classList.remove('visible'); ending.classList.remove('glitch-active'); }
      applyOffset(-1);
      triggerGlitch(quoteH3);

      // Kick off the yellow lines the instant the "Design" glitch settles —
      // no extra READABLE_PAUSE here.
      const h3Ms = glitchDuration(quoteH3);
      stepTimer = setTimeout(() => {
        if (!running) return;
        runStep(0);
      }, h3Ms);
    }

    function loopRestart() {
      running = false;
      if (!sectionActive) return;
      stepTimer = setTimeout(runIntro, LOOP_GAP);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      clearTimeout(stepTimer);
    }

    // ── Static (reduced-motion / fallback) ────────────────────────────────────

    function showStaticQuote() {
      stop();
      if (quoteContainer) quoteContainer.classList.add('static-display');
      if (ending) ending.classList.add('visible');
      applyOffset(numItems - 1);
    }

    // ── Section observer — play while visible, pause while not ─────────────────

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        sectionActive = entry.isIntersecting;
        if (prefersReducedMotion) return;

        if (sectionActive) {
          if (!running) runIntro();
        } else {
          stop();
        }
      });
    }, { threshold: 0.05 });

    // ── Nav button / bfcache ───────────────────────────────────────────────────

    const aboutNavBtn = document.querySelector('a[href="#about"].nav-btn');
    if (aboutNavBtn) {
      aboutNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetY = Math.max(0, wrapper.offsetTop - header.offsetHeight);
        smoothScrollTo(targetY);
        // Restart the reveal from the top so a nav-in always sees the intro.
        if (!prefersReducedMotion) { stop(); endingShown = false; runIntro(); }
      });
    }

    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      if (prefersReducedMotion) { showStaticQuote(); return; }
      stop();
      if (sectionActive) runIntro();
    });

    // ── Init ───────────────────────────────────────────────────────────────────

    wrapper.style.height = '';      // release the old scroll-pin extra height
    measure();
    window.addEventListener('resize', measure);

    if (prefersReducedMotion) {
      showStaticQuote();
    } else {
      observer.observe(about);
    }
  }

  window.initAboutPin = initAboutPin;
}());


;
/* ===== about-title-fit.js ===== */
/* about-title-fit.js — phone only.
 *
 * Scales the #about "·Hello! I'm Sergio Ayala·" title so its widest line fills
 * the available width of the hero column, left to right. The per-line offsets
 * are expressed in em (responsive.css) so the stacked composition scales with
 * the font-size we set here.
 *
 * Desktop stays byte-for-byte identical: the effect is gated on the ≤768px
 * media query, so on desktop fit() bails before touching any style.
 */
(function () {
  function init() {
    const title = document.getElementById('abouttitle');
    if (!title) return;

    // Measure .about-top: on mobile both .about-intro and .about-top-head are
    // display:contents (no box → clientWidth 0). .about-top is the full-width
    // hero column that actually holds the stacked title/badge/bar1/bio.
    const intro = title.closest('.about-top') || title.parentElement;
    const lines = title.querySelectorAll(
      '.title-line-1, .title-line-2, .title-line-3, .title-line-4'
    );
    if (!intro || !lines.length) return;

    const mq = window.matchMedia('(max-width: 768px)');

    const fit = () => {
      // Desktop / tablet ≥769px: never touch the title (keep it identical).
      if (!mq.matches) {
        title.style.fontSize = '';
        return;
      }
      const avail = intro.clientWidth;
      if (!avail) return;

      // Measure natural line widths at the CSS base size (font-size:'' resets to it).
      title.style.fontSize = '';
      const base = parseFloat(getComputedStyle(title).fontSize) || 64;
      let widest = 0;
      lines.forEach((l) => { widest = Math.max(widest, l.scrollWidth); });
      if (!widest) return;

      // 0.98 keeps the dots/exclamation overhang a hair inside the edges.
      title.style.fontSize = (base * (avail / widest) * 0.98) + 'px';
    };

    fit();
    // Webfont swap (Funnel Display) changes metrics → refit once it lands.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(fit, 150); };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    // i18n swaps the title text → its width changes → refit.
    window.addEventListener('languagechanged', fit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


;
/* ===== script.js ===== */
/**
 * script.js — application coordinator.
 * Business logic lives in focused modules; this file wires them together.
 */
'use strict';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

// Navigation exit flag — set true for 2 s when nav jumps away from #photo
// so the photo reveal scroll handler ignores the programmatic scroll.
let _photoNavExit = false;

const TIMING = {
  CYBER_PANEL_DELAY: 2000,
  DNA_GLITCH_DELAY: 500,
  DNA_REVEAL_DELAY: 3000,
  DNA_LETTER_DELAY: 100,
  DNA_START_DELAY: 200, // Start after dnacapsule1.svg animation completes
  NAV_SCROLL_DELAY: 100,
  NAV_DEBOUNCE: 50,
  NAV_SCROLL_DURATION: 1600,       // ms — default nav scroll speed
  PHOTO_SCROLL_DURATION: 2800      // ms — slower to let all 3 phases play visibly
};

// JS mirrors of :root CSS variables in css/main.css.
// When updating either side, update both.
const CSS = {
  transitionFast: '0.2s',    // --transition-fast / --duration-quick
  glitchStagger:   0.04,     // --glitch-stagger on .main-nav .nav-btn (line ~1149)
  easingEaseOut:  'ease-out', // --easing-ease-out
};

/**
 * Custom smooth scroll to a Y position with a configurable duration.
 * Uses an ease-in-out cubic curve.
 */
function smoothScrollTo(targetY, duration = TIMING.NAV_SCROLL_DURATION) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ============================================================================
// GLITCH SYSTEM - Manages all glitch effects
// ============================================================================

class GlitchSystem {
  constructor() {
    this.glitchChars = GLITCH_CHARS;
    this.initSplitting();
    this.initLogoGlitch();
    this.initSealGlitch();
    document.addEventListener('languagechanged', () => this._resplitTranslated());
  }

  /**
   * Re-split and re-apply glitch vars on elements translated by i18n
   * Called after languagechanged event so new text gets the full glitch treatment
   */
  _resplitTranslated() {
    const els = Array.from(document.querySelectorAll('[data-i18n-split]'));
    if (!els.length) return;
    const results = window.Splitting({ target: els, by: 'chars' });
    results.forEach(result => {
      result.chars.forEach(char => {
        char.style.setProperty('--count', Math.random() * 5 + 1);
        for (let g = 0; g < 10; g++) {
          const randomChar = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
          char.style.setProperty(`--char-${g}`, `"${randomChar}"`);
        }
      });
    });
  }

  /**
   * Initialize Splitting.js for all glitch text elements
   */
  initSplitting() {
    const results = window.Splitting({
      target: '.glitch-text',
      by: 'chars'
    });

    results.forEach(result => {
      const chars = result.chars;
      if (!result.el.classList.contains('reveal--0')) {
        result.el.classList.add('reveal--0');
      }

      chars.forEach(char => {
        char.style.setProperty('--count', Math.random() * 5 + 1);
        for (let g = 0; g < 10; g++) {
          const randomChar = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
          char.style.setProperty(`--char-${g}`, `"${randomChar}"`);
        }
      });
    });

    // Initialize ScrollOut for scroll-based animations
    window.ScrollOut({ targets: '.glitch-text' });
  }

  /**
   * Add glitch animation to logo on hover.
   * Delegates to GlitchSystem.triggerGlitch() — same mechanism as info-hints.
   */
  initLogoGlitch() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    // Suppress the page-load reveal after it finishes so the first hover gets
    // a clean name-change restart (none → glitch-switch). If the user hovers
    // before the timeout, triggerGlitch() adds glitch-suppressed on-demand.
    setTimeout(() => logo.classList.add('glitch-suppressed'), 3000);

    logo.addEventListener('mouseenter', () => GlitchSystem.triggerGlitch(logo));
    logo.addEventListener('mouseleave', () => logo.classList.remove('glitch-firing'));
  }

  /**
   * Trigger a fresh glitch animation on a single element.
   * Adds glitch-suppressed (animation-name: none) if absent, then does a
   * remove → getBoundingClientRect() flush → add of glitch-firing so Chrome
   * always sees the animation-name change from none → glitch-switch.
   */
  static triggerGlitch(el) {
    el.classList.add('glitch-suppressed');
    el.classList.remove('glitch-firing');
    void el.getBoundingClientRect();
    el.classList.add('glitch-firing');
  }

  /**
   * Trigger glitch on multiple elements with a single reflow flush.
   * Filters to elements that actually contain [data-char] children.
   */
  static triggerGlitchBatch(els) {
    const capable = els.filter(el => el.querySelector('[data-char]'));
    if (!capable.length) return;
    capable.forEach(el => {
      el.classList.add('glitch-suppressed');
      el.classList.remove('glitch-firing');
    });
    void capable[0].getBoundingClientRect();
    capable.forEach(el => el.classList.add('glitch-firing'));
  }

  initSealGlitch() {
    const sealCta = document.getElementById('seal-cta');
    if (!sealCta) return;

    sealCta.addEventListener('mouseenter', function() {
      const chars = this.querySelectorAll('.seal-label [data-char]');
      chars.forEach((char, index) => {
        char.style.animation = 'none';
        void char.offsetWidth;
        char.style.animation = `glitch-switch ${CSS.transitionFast} steps(1) ${index * CSS.glitchStagger}s 6 backwards`;
      });
      this.classList.remove('seal-glitch-active');
      void this.offsetWidth;
      this.classList.add('seal-glitch-active');
    });

    sealCta.addEventListener('animationend', function(e) {
      if (e.animationName === 'seal-glitch-burst') {
        this.classList.remove('seal-glitch-active');
      }
    });

    sealCta.addEventListener('mouseleave', function() {
      const chars = this.querySelectorAll('.seal-label [data-char]');
      chars.forEach((char) => {
        char.style.animation = 'none';
        void char.offsetWidth;
        char.style.animation = '';
      });
    });
  }

  /**
   * Initialize DNA text glitch effect
   */
  initDNAGlitch() {
    const dnaSpans = document.querySelectorAll('.scene .text span');
    if (!dnaSpans.length) return;

    // Store original text for each span
    const originalTexts = new Map();
    dnaSpans.forEach(span => originalTexts.set(span, span.textContent));

    // Glitch a single span temporarily
    const glitchSpan = (span, duration = 100) => {
      const originalText = originalTexts.get(span);
      const glitchText = Array.from(originalText)
        .map(char => {
          if (char === ' ' || char === '·' || char === '-') return char;
          return Math.random() > 0.5 ? char : this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
        })
        .join('');

      span.textContent = glitchText;
      setTimeout(() => { span.textContent = originalText; }, duration);
    };

    // Initial load glitch with staggered timing
    dnaSpans.forEach((span, index) => {
      setTimeout(() => {
        let glitchCount = 0;
        const maxGlitches = Math.floor(Math.random() * 5) + 3;

        const glitchInterval = setInterval(() => {
          glitchSpan(span, 80);
          glitchCount++;
          if (glitchCount >= maxGlitches) {
            clearInterval(glitchInterval);
          }
        }, 150);
      }, index * 50);
    });

    // Occasional random glitches (stored for cleanup)
    this.dnaGlitchInterval = setInterval(() => {
      const randomSpan = dnaSpans[Math.floor(Math.random() * dnaSpans.length)];
      if (Math.random() > 0.95) {
        glitchSpan(randomSpan, 60);
      }
    }, 500);
  }

  /**
   * Cleanup DNA glitch interval
   */
  cleanupDNAGlitch() {
    if (this.dnaGlitchInterval) {
      clearInterval(this.dnaGlitchInterval);
      this.dnaGlitchInterval = null;
    }
  }

  /**
   * Animate DNA text reveal letter by letter
   */
  animateDNAReveal() {
    const masteringText = document.querySelector('.text[style*="--text: 0"]');
    const brandDNAText = document.querySelector('.text[style*="--text: 2"]');

    if (!masteringText || !brandDNAText) return;

    const masteringSpans = Array.from(masteringText.querySelectorAll('span'));
    const brandDNASpans = Array.from(brandDNAText.querySelectorAll('span'));

    setTimeout(() => {
      // Animate "Mastering" forward
      masteringSpans.forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('revealed');
        }, index * TIMING.DNA_LETTER_DELAY);
      });

      // Animate "Your Brand's DNA" backward
      brandDNASpans.reverse().forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('revealed');
        }, index * TIMING.DNA_LETTER_DELAY);
      });
    }, TIMING.DNA_START_DELAY);
  }
}

// ============================================================================
// NAVIGATION MANAGER - Handles section navigation and active states
// ============================================================================

class NavigationManager {
  constructor() {
    // Only the section nav links — exclude the language ([EN]/[ES]) and sound
    // toggles, which also carry .nav-btn but own their own independent .active
    // state (set in i18n.js / sound toggle). Including them here would let every
    // scroll-driven setActiveButton() wipe their highlight.
    this.navButtons = document.querySelectorAll('.main-nav .nav-btn:not(.lang-btn):not(.sound-btn)');
    this.sections = document.querySelectorAll('main section');
    this.header = document.querySelector('header');
    this.sectionToButton = new Map();
    this.scrollTimeout = null;

    // Interstitial particle transition (section-transition.js) state.
    this._reducedMotion   = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._navTransitioning = false;

    this.init();
  }

  /**
   * Initialize navigation system
   */
  init() {
    this.hamburger  = document.getElementById('hamburger-btn');
    this.drawer     = document.getElementById('main-nav');
    this.backdrop   = document.getElementById('nav-backdrop');
    this._boundKeydown = this._handleKeydown.bind(this);

    this.buildSectionMap();
    this.setupClickHandlers();
    this.setupScrollHandler();
    this.setupMobileNav();
  }

  /**
   * Build map of section IDs to navigation buttons
   */
  buildSectionMap() {
    this.navButtons.forEach(btn => {
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sectionId = href.substring(1);
        this.sectionToButton.set(sectionId, btn);
      }
    });
  }

  /**
   * Set active navigation button and update header background
   */
  setActiveButton(sectionId) {
    this.navButtons.forEach(btn => btn.classList.remove('active'));

    const activeButton = this.sectionToButton.get(sectionId);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    // Update header background color
    this.updateHeaderBackground(sectionId);
  }

  /**
   * Update header background based on active section
   */
  updateHeaderBackground(sectionId) {
    if (!this.header) return;

    const sectionClasses = [
      'section-intro',
      'section-about',
      'section-art-direction',
      'section-photo',
      'section-illustration',
      'section-contact'
    ];

    // Remove all section classes from header and body
    this.header.classList.remove(...sectionClasses);
    document.body.classList.remove(...sectionClasses);

    // Add new section class to both
    if (sectionId) {
      this.header.classList.add(`section-${sectionId}`);
      document.body.classList.add(`section-${sectionId}`);
    }
  }

  /**
   * Determine which section owns the viewport right now and set it active.
   * Called on every scroll (debounced) and once at init.
   *
   * Strategy: the "active" section is the last one in DOM order whose top edge
   * is at or above 35% of the viewport AND whose bottom is still on screen.
   * This means the section has entered the upper third of the screen — the user
   * is clearly inside it. "Last in DOM order" means the section furthest down
   * the page wins when two sections overlap (e.g. sticky #about while
   * art-direction is just entering from below).
   *
   * #photo is position:fixed so its own DOM rect is always pinned to the
   * viewport — useless for ownership. Its real scroll extent lives in the
   * .photo-scroll-spacer that follows it in flow, so we substitute the spacer's
   * rect as #photo's proxy and let it compete in the SAME rule as every other
   * section. This is the fix for the long-standing "art direction stays
   * highlighted while photo is active" bug: because the spacer sits directly
   * after #art-direction in flow, art-direction.bottom and spacer.top are the
   * exact same edge — so the previous code (which only fell back to #photo after
   * the loop found nothing) kept art-direction winning through the whole photo
   * reveal. Treating photo as a real participant lets it take over as soon as the
   * spacer crosses the trigger line, and hand off to #illustration the same way.
   */
  detectActiveSection() {
    const scrollY = window.scrollY;
    const vh    = window.innerHeight;

    // ── Intro zone: no nav button active ─────────────────────────────────────
    const introEl = document.getElementById('intro');
    if (introEl && scrollY < introEl.offsetHeight * 0.7) {
      this.navButtons.forEach(btn => btn.classList.remove('active'));
      this.updateHeaderBackground('intro');
      return;
    }

    // ── Find the lowest section (in DOM order) whose top ≤ 35 % of viewport ───
    const triggerY    = vh * 0.35;
    const photoSpacer = document.querySelector('.photo-scroll-spacer');
    let activeId = null;

    // this.sections is in DOM order: …art-direction, photo, illustration… so
    // #photo is evaluated right after #art-direction (it can override it) and
    // right before #illustration (which can override #photo) — exactly the
    // handoff order we want.
    this.sections.forEach(section => {
      if (!section.id || section.id === 'intro') return;

      let rect;
      if (section.id === 'photo') {
        if (!photoSpacer) return;        // spacer is the only source of truth
        rect = photoSpacer.getBoundingClientRect();
      } else {
        rect = section.getBoundingClientRect();
      }

      if (rect.top <= triggerY && rect.bottom > 0) {
        activeId = section.id; // keep overwriting — last (lowest) match wins
      }
    });

    if (activeId) {
      this.setActiveButton(activeId);
      // Keep the URL in sync with the photo zone (other sections push their hash
      // on click; photo is purely scroll-driven so it does it here).
      if (activeId === 'photo' && location.hash !== '#photo') {
        history.pushState(null, '', '#photo');
      }
    }
  }

  /**
   * Programmatically navigate to a section — the single source of truth shared
   * by nav-button clicks, deep-links on first load, and browser back/forward.
   *
   * Each section type needs a different scroll target (sticky wrappers, the
   * fixed #photo + its spacer proxy) and a different entrance trigger, so this
   * mirrors exactly what a manual nav click does. `pushHash` is false when the
   * URL already reflects the destination (deep-link / popstate) so we don't
   * stack duplicate history entries.
   */
  goToSection(sectionId, { pushHash = true } = {}) {
    // Interstitial particle transition (≈1.5s) masks the otherwise instant
    // scroll jump. All viewports since 2026-07-03 (owner request; phones get a
    // lighter swarm — see section-transition.js maxPop). prefers-reduced-motion
    // keeps the original immediate navigation. The lock stops rapid clicks
    // stacking overlays. Only on real menu clicks (pushHash true) — deep-links
    // and back/forward (pushHash false) navigate instantly, no curtain on load
    // or history moves.
    const useTransition = pushHash
      && window.SectionTransition
      && !this._reducedMotion.matches;

    if (!useTransition) { this._performNav(sectionId, pushHash); return; }
    if (this._navTransitioning) return;
    this._navTransitioning = true;
    window.SectionTransition.run(() => this._performNav(sectionId, pushHash))
      .finally(() => { this._navTransitioning = false; });
  }

  /**
   * The actual navigation work: scroll target + entrance trigger per section
   * type. Split out of goToSection so the transition layer can invoke it while
   * the viewport is hidden under the cover (it's also the direct path when the
   * transition is disabled).
   */
  _performNav(sectionId, pushHash = true) {
    // Tell section widgets a nav jump is happening so they can tear down
    // open overlays (e.g. the art-direction project modal) before the
    // viewport moves — the instant scroll may not trip their observers.
    document.dispatchEvent(new CustomEvent('app:navigate', { detail: { sectionId } }));

    // If the photo section is currently visible and we are navigating away
    // from it, force-hide it immediately before any scroll fires so
    // updatePhotoReveal doesn't re-animate the clip-path wipe mid-scroll.
    if (sectionId !== 'photo') {
      const _photoSpacer = document.querySelector('.photo-scroll-spacer');
      if (_photoSpacer) {
        const _prog = 1 - _photoSpacer.getBoundingClientRect().top / window.innerHeight;
        if (_prog > 0) {
          const _photoEl = document.querySelector('#photo');
          if (_photoEl) {
            _photoEl.style.visibility = 'hidden';
            _photoEl.style.clipPath   = 'inset(0 0 100% 0)';
          }
          _photoNavExit = true;
          setTimeout(() => { _photoNavExit = false; }, 2000);
        }
      }
    }

    const headerH = this.header ? this.header.offsetHeight : 0;

    if (sectionId === 'intro') {
      window.scrollTo(0, 0);
      this.setActiveButton('intro');
      return;
    }

    if (sectionId === 'art-direction') {
      // #art-direction is position:sticky (top:0) inside .ad-pin-wrap, so its
      // own rect.top clamps to 0 once pinned — reading rect.top+scrollY off the
      // section gives an arbitrary target whenever you start from within its pin
      // zone (the intermittent "header covers the top" offset). Measure the
      // NON-sticky wrapper instead: its rect.top+scrollY is the section's true,
      // stable document offset regardless of scroll position.
      const artTarget = document.querySelector('.ad-pin-wrap')
                      || document.getElementById('art-direction');
      if (artTarget) {
        const targetY = Math.max(0, artTarget.getBoundingClientRect().top + window.scrollY - headerH);
        window.scrollTo(0, targetY);
      }
      if (App.playArtEntranceAnimation) App.playArtEntranceAnimation();
      this.setActiveButton('art-direction');
      if (pushHash) history.pushState(null, '', '#art-direction');
      return;
    }

    if (sectionId === 'about') {
      // Same sticky caveat as art-direction: measure the flow wrapper.
      const aboutTarget = document.querySelector('.about-pin-wrapper')
                        || document.getElementById('about');
      if (aboutTarget) {
        const targetY = Math.max(0, aboutTarget.getBoundingClientRect().top + window.scrollY - headerH);
        window.scrollTo(0, targetY);
      }
      this.setActiveButton('about');
      if (pushHash) history.pushState(null, '', '#about');
      return;
    }

    if (sectionId === 'photo') {
      const photoSpacer = document.querySelector('.photo-scroll-spacer');
      if (photoSpacer) {
        // rawProgress=3: all list items revealed (spacerTop + two full viewport heights)
        const spacerTop = photoSpacer.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, spacerTop + window.innerHeight * 2);
      }
      this.setActiveButton('photo');
      if (pushHash) history.pushState(null, '', '#photo');
      return;
    }

    // General rule: all other sections scroll instantly to their top
    // and activate entrance animations through IntersectionObserver re-entry.
    const target = document.getElementById(sectionId);
    if (target) {
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
    }
    this.setActiveButton(sectionId);
    if (pushHash) history.pushState(null, '', `#${sectionId}`);
  }

  /**
   * Setup click handlers for navigation buttons
   */
  setupClickHandlers() {
    // Navigation button clicks
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this.goToSection(href.substring(1));
        }
      });
    });

    // Logo click handler
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        const href = logo.getAttribute('href');
        if (href === '#intro') {
          e.preventDefault();
          smoothScrollTo(0);
          this.setActiveButton('intro');
        }
      });
    }
  }

  /**
   * Drive nav-active state purely from scroll position.
   * Replaces the old IntersectionObserver approach, which had dead zones due to
   * transition-only firing and sticky #about confusing the intersection math.
   */
  setupScrollHandler() {
    window.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => this.detectActiveSection(), TIMING.NAV_DEBOUNCE);
    });
    // Seed the correct state on page load (e.g. deep-linked URL)
    setTimeout(() => this.detectActiveSection(), 100);
  }

  setupMobileNav() {
    if (!this.hamburger || !this.drawer || !this.backdrop) return;

    this.hamburger.addEventListener('click', () => this.toggleDrawer());
    this.backdrop.addEventListener('click',  () => this.closeDrawer());

    // Close on any nav link click
    this.drawer.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeDrawer());
    });

    // Vertical electric-static line on the drawer's left edge (phones only —
    // the desktop nav is horizontal and the canvas is display:none there). Shown
    // while the menu is open. shadow:false → the cyan glow comes from CSS filter.
    const navStaticCanvas = this.drawer.querySelector('.nav-static-line');
    if (navStaticCanvas && window.makeStaticLine && App.BrowserDetect?.isMobile) {
      this.navStatic = window.makeStaticLine(navStaticCanvas, {
        vertical: true, shadow: false, throttleEvery: 2,
      });
    }
  }

  toggleDrawer() {
    const isOpen = this.drawer.classList.contains('is-open');
    isOpen ? this.closeDrawer() : this.openDrawer();
  }

  openDrawer() {
    this.drawer.classList.add('is-open');
    this.backdrop.classList.add('is-visible');
    document.body.classList.add('nav-open');
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.hamburger.setAttribute('aria-label', 'Close navigation menu');
    document.addEventListener('keydown', this._boundKeydown);
    this.navStatic?.show();

    // Re-fire the intro-text glitch on the section words every time the menu
    // opens — the same glitch-switch the logo/name uses on load (the CSS handles
    // the orange top-line grow). triggerGlitchBatch restarts it with one reflow.
    if (this.navButtons?.length) {
      GlitchSystem.triggerGlitchBatch(Array.from(this.navButtons));
    }

    // Move focus into drawer
    const firstFocusable = this._getFocusable()[0];
    if (firstFocusable) firstFocusable.focus();
  }

  closeDrawer() {
    this.drawer.classList.remove('is-open');
    this.backdrop.classList.remove('is-visible');
    document.body.classList.remove('nav-open');
    this.navStatic?.hide();
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.hamburger.setAttribute('aria-label', 'Open navigation menu');
    document.removeEventListener('keydown', this._boundKeydown);
    this.hamburger.focus();
  }

  _getFocusable() {
    return Array.from(
      this.drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.closest('[hidden]'));
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') {
      this.closeDrawer();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = this._getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }
}


// Resolve the current URL hash to a deep-linkable section id, or null. Only
// real <main> sections qualify; #intro (page top) and the #main skip-link target
// are excluded so they fall through to the plain scroll-to-top path.
function _deepLinkSectionId() {
  const id = (location.hash || '').slice(1);
  if (!id || id === 'intro' || id === 'main') return null;
  // NB: a module-level `const CSS` shadows window.CSS here, so CSS.escape is
  // unavailable — resolve by id directly (section ids are plain slugs anyway).
  const el = document.getElementById(id);
  return (el && el.tagName === 'SECTION' && el.closest('main')) ? id : null;
}

// ── Browser back / forward ───────────────────────────────────────────────
// Route every section hash through the shared navigator (sticky wrappers and
// the fixed #photo need their own scroll math); empty/#intro returns to top.
window.addEventListener('popstate', () => {
  const id = _deepLinkSectionId();
  if (id) {
    App.navigationManager?.goToSection(id, { pushHash: false });
  } else if (!location.hash || location.hash === '#intro') {
    window.scrollTo(0, 0);
    App.navigationManager?.setActiveButton('intro');
  }
});

// ============================================================================
// SECTION ANIMATION INIT — one plain function per domain
// ============================================================================

function initCyberPanel(delay = TIMING.CYBER_PANEL_DELAY) {
  const panel = document.getElementById('introCyberPanel');
  if (!panel) return;

  setTimeout(() => {
    panel.classList.add('active');

    // Info interface slides in last — after social icons (~3000 ms on the
    // half-speed frame timeline).
    const infoInterface = document.getElementById('infoInterface');
    if (infoInterface) {
      setTimeout(() => infoInterface.classList.add('active'), 4000);
    }
  }, delay);
}

// Pause/resume canvas animations when #intro leaves / re-enters the viewport.
function initIntroObserver() {
  const introSection = document.getElementById('intro');
  if (!introSection) return;

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        introSection.classList.remove('paused-animations');

        // Don't start JS canvas animations while preloader is still showing
        // (Orb3D is excluded — its CSS animations run freely during preloading.
        // App.ParticleSystem is the INTRO swarm; the preloader has its own
        // self-managed instance — see particle-system.js.)
        if (!document.body.classList.contains('preloading')) {
          if (App.ParticleSystem?.resume) App.ParticleSystem.resume();
          if (App.BarcodeAnimation?.start) App.BarcodeAnimation.start();
        }
      } else {
        introSection.classList.add('paused-animations');

        if (App.ParticleSystem?.pause) App.ParticleSystem.pause();
        if (App.Orb3D?.pause) App.Orb3D.pause();
        if (App.BarcodeAnimation?.stop) App.BarcodeAnimation.stop();
      }
    });
  }, { threshold: 0.2, rootMargin: '-100px' }).observe(introSection);
}

// Scroll-triggered animations for the #about section:
// section glitch-active, cert gallery, per-element visibility, DNA group, SVG decorations.
function initAboutAnimations() {
  const aboutSection     = document.getElementById('about');
  const certGalleryLayer = document.querySelector('.cert-gallery-layer');

  const scrollTriggerOptions   = { threshold: 0.05, rootMargin: '0px 0px -10% 0px' };
  const elementObserverOptions = { threshold: 0.3,  rootMargin: '0px 0px -20% 0px' };

  // Scroll guard — prevents scroll-triggered animations from firing on page load.
  let userHasScrolled = false;
  const scrollGuardListener = () => {
    if (window.scrollY > 100) {
      userHasScrolled = true;
      window.removeEventListener('scroll', scrollGuardListener);
    }
  };
  window.addEventListener('scroll', scrollGuardListener);

  // About section — one-time glitch-active + pause-resume on re-entry.
  if (aboutSection) {
    let aboutAnimationTriggered = false;

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !aboutAnimationTriggered && userHasScrolled) {
          aboutSection.classList.remove('paused-animations');
          aboutSection.classList.add('glitch-active');
          aboutAnimationTriggered = true;
        } else if (!entry.isIntersecting && aboutAnimationTriggered) {
          aboutSection.classList.add('paused-animations');
        } else if (entry.isIntersecting && aboutAnimationTriggered) {
          aboutSection.classList.remove('paused-animations');
        }
      });
    }, scrollTriggerOptions).observe(aboutSection);
  }

  // Certificate gallery — reveal once on first scroll-into-view.
  if (certGalleryLayer) {
    let certGalleryAnimated = false;

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !certGalleryAnimated && userHasScrolled) {
          certGalleryLayer.classList.add('visible');
          certGalleryAnimated = true;
        }
      });
    }, scrollTriggerOptions).observe(certGalleryLayer);
  }

  // Per-element visibility toggle (element-visible / element-exit).
  const createVisibilityObserver = (targets) => {
    targets.forEach(element => {
      let hasEntered = false;
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            hasEntered = true;
            element.classList.remove('element-exit');
            element.classList.add('element-visible');
          } else if (hasEntered) {
            element.classList.remove('element-visible');
            element.classList.add('element-exit');
          }
        });
      }, elementObserverOptions).observe(element);
    });
  };

  // Phones: the availability pill ("Available for freelance — 2026" + pulsing
  // dot) reads as part of the intro stack — reparent it directly under the
  // justified bio (#aboutp1), where responsive.css orders it (owner request
  // 2026-07-01). matchMedia-gated (same breakpoint as the CSS, never the UA
  // flag) so desktop keeps its .about-left position byte-for-byte. Done BEFORE
  // the observer below is armed; the IO tracks the node itself, so the
  // slideInFromLeft reveal keeps working from the new position.
  if (window.matchMedia('(max-width: 768px)').matches) {
    const availEl   = document.getElementById('about-availability');
    const bioEl     = document.getElementById('aboutp1');
    const metricsEl = document.getElementById('about-metrics');
    if (availEl && bioEl) bioEl.insertAdjacentElement('afterend', availEl);
    // metrics strip ("10+ years · 50+ projects · …") rides right under the
    // pill (owner request 2026-07-01); ordered by responsive.css (order 5).
    const metricsAnchor = availEl || bioEl;
    if (metricsEl && metricsAnchor) {
      metricsAnchor.insertAdjacentElement('afterend', metricsEl);
    }
    // skills.svg graphic below the metrics strip, full-bleed (owner request
    // 2026-07-01). Its .about-left styles stop applying after the move —
    // responsive.css restyles it for the .about-top stack (order 6, 100vw).
    const skillsGraphic = document.querySelector('.decoration-skills');
    const skillsAnchor  = metricsEl || metricsAnchor;
    if (skillsGraphic && skillsAnchor) {
      skillsAnchor.insertAdjacentElement('afterend', skillsGraphic);
    }
    // #aboutp3 closes the stack below the graphic (owner request 2026-07-02):
    // on phones only its .about-highlight sentence survives — responsive.css
    // hides the lifestyle text via font-size:0 (text nodes have no selector),
    // which also survives i18n innerHTML re-renders on language switch.
    const p3El     = document.getElementById('aboutp3');
    const p3Anchor = skillsGraphic || skillsAnchor;
    if (p3El && p3Anchor) {
      p3Anchor.insertAdjacentElement('afterend', p3El);
    }
    // #aboutp4 rides right under the highlight line (owner request
    // 2026-07-02): moved out of .about-right; on phones only its
    // .about-p4-keep tail ("Let's work together…" + certificates paragraph)
    // survives — same font-size:0 collapse trick, span present in index.html
    // AND both locale strings so it survives language switches.
    const p4El     = document.getElementById('aboutp4');
    const p4Anchor = p3El || p3Anchor;
    if (p4El && p4Anchor) {
      p4Anchor.insertAdjacentElement('afterend', p4El);
    }
    // Certificate gallery closes the stack below the #aboutp4 tail (owner
    // request 2026-07-02): same composition as desktop, scaled to the
    // viewport by responsive.css (455px design box → 100vw).
    const certLayer  = document.querySelector('.cert-gallery-layer');
    const certAnchor = p4El || p4Anchor;
    if (certLayer && certAnchor) {
      certAnchor.insertAdjacentElement('afterend', certLayer);
    }
    // Seal CTA + social icons centered below the cert gallery (owner request
    // 2026-07-03): the wrapper lives at .about-container level in the markup
    // (it only LOOKED stacked — it trailed the section off-center). Move it
    // into the same stack, right after the gallery (responsive.css order 10 +
    // full width; the wrapper is already a centering flex column).
    const sealWrapper = document.querySelector('.seal-cta-wrapper');
    const sealAnchor  = certLayer || certAnchor;
    if (sealWrapper && sealAnchor) {
      sealAnchor.insertAdjacentElement('afterend', sealWrapper);
    }
  }

  // Glitch entrance for the section's copy (owner 2026-07-02 bio; extended
  // 2026-07-03 to the pill / metrics / p3 / p4 and, same day, from phones to
  // ALL viewports at the same tempo — desktop tuning lives in styles.css,
  // the phone twin in responsive.css). Per target: `host` carries the
  // suppress/fire classes, the tuning vars and the entrance observer — it
  // must be a node that SURVIVES i18n innerHTML rewrites; `split()` returns
  // the node whose text is actually split. On phones p3/p4 split only their
  // surviving span (the rest is font-size:0 collapsed) so the firing stagger
  // starts at the visible text; desktop shows the full paragraphs and splits
  // them whole, plus #aboutp2 (display:none on phones — never intersects).
  // NOTE: only #aboutp1 gets the .glitch-text class — its white-space:pre
  // would re-break the others' wrapping (the exact overflow fixed on 07-03);
  // the suppress→fire CSS only needs [data-char] children, not the class.
  // styles.css restores normal wrapping on the desktop bio.
  if (window.Splitting) {
    const phoneCopy = window.matchMedia('(max-width: 768px)').matches;
    [
      { hostId: 'aboutp1', split: el => el, i18n: true, glitchTextClass: true },
      { hostId: 'about-availability', split: el => el, i18n: false },
      { hostId: 'about-metrics', split: el => el, i18n: false },
      ...(phoneCopy ? [
        { hostId: 'aboutp3', split: el => el.querySelector('.about-highlight'), i18n: true },
        { hostId: 'aboutp4', split: el => el.querySelector('.about-p4-keep'), i18n: true },
      ] : [
        { hostId: 'aboutp2', split: el => el, i18n: true },
        { hostId: 'aboutp3', split: el => el, i18n: true },
        { hostId: 'aboutp4', split: el => el, i18n: true },
      ]),
    ].forEach(({ hostId, split, i18n, glitchTextClass }) => {
      const hostEl = document.getElementById(hostId);
      if (!hostEl) return;
      if (glitchTextClass) {
        hostEl.classList.add('glitch-text', 'reveal--0');
        hostEl.setAttribute('data-splitting', '');
      }
      const splitTarget = () => {
        const target = split(hostEl);
        if (!target) return;
        // Splitting memoizes per element under el['🍌'] and would hand back
        // the stale (detached) spans after i18n rewrites the innerHTML —
        // the same reason the stock [data-i18n-split] re-split silently
        // no-ops for the nav buttons. Drop the memo to force a real split.
        delete target['🍌'];
        const results = window.Splitting({ target, by: 'chars' });
        results.forEach(result => {
          result.chars.forEach(char => {
            char.style.setProperty('--count', Math.random() * 5 + 1);
            for (let g = 0; g < 10; g++) {
              const randomChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
              char.style.setProperty(`--char-${g}`, `"${randomChar}"`);
            }
          });
        });
      };
      splitTarget();
      // Every i18n apply rewrites the host's innerHTML (including the async
      // default-locale apply shortly after load), destroying the char spans
      // — re-split on each. If the entrance already fired, the host still
      // carries glitch-suppressed + glitch-firing, so fresh chars glitch in
      // on insertion; if not, they stay static until the observer fires.
      // Non-i18n hosts (pill, metrics) must NOT re-split: their spans are
      // never rewritten and a second pass would nest .word/.char wrappers.
      if (i18n) document.addEventListener('languagechanged', splitTarget);
      hostEl.classList.add('glitch-suppressed');
      new IntersectionObserver((entries, obs) => {
        if (entries.some(entry => entry.isIntersecting)) {
          GlitchSystem.triggerGlitch(hostEl);
          obs.disconnect();
        }
      }, { threshold: 0.3 }).observe(hostEl);
    });
  }

  createVisibilityObserver([...new Set([
    document.getElementById('abouttitle'),
    ...document.querySelectorAll('#about .about-left p'),
    // phones: #aboutp3 was reparented OUT of .about-left above, so the
    // selector misses it — list it explicitly (the Set dedupes on desktop,
    // where the selector still matches it).
    document.getElementById('aboutp3'),
    document.getElementById('about-availability'),
    document.getElementById('about-metrics'),
    document.getElementById('seal-cta'),
    document.getElementById('paulrand-quote'),
    document.getElementById('paulrand-author'),
    document.getElementById('aboutp4'),
  ])].filter(Boolean));
  // Note: ID1 SVG observer is set up after SVG conversion — see svg-inline.js

  // DNA group — dnatitle + dnacapsule1 + .about-right yellow line.
  // Entry fires 800 ms after #aboutp2 enters viewport (matching its slideInFromLeft delay).
  // Exit fires when #about fully leaves the viewport.
  const dnatitleEl = document.getElementById('dnatitle');
  const dnaCapsule = document.getElementById('dnacapsule1');
  const aboutRight = document.querySelector('.about-right');
  let dnaGroupVisible       = false;
  let dnaAnimationsTriggered = false;

  const enterDnaGroup = () => {
    dnaGroupVisible = true;
    [dnatitleEl, dnaCapsule, aboutRight].forEach(el => {
      if (!el) return;
      el.classList.remove('element-exit');
      el.classList.add('element-visible');
    });
    if (App.glitchSystem && !dnaAnimationsTriggered) {
      dnaAnimationsTriggered = true;
      setTimeout(() => App.glitchSystem.initDNAGlitch(),    TIMING.DNA_GLITCH_DELAY);
      setTimeout(() => App.glitchSystem.animateDNAReveal(), TIMING.DNA_REVEAL_DELAY);
    }
  };

  const exitDnaGroup = () => {
    dnaGroupVisible = false;
    [dnatitleEl, dnaCapsule, aboutRight].forEach(el => {
      if (!el) return;
      el.classList.remove('element-visible');
      el.classList.add('element-exit');
    });
  };

  // Phones: every .about-left text block is now hidden or reparented to the
  // top stack, so none can time the DNA reveal from its original spot.
  // Anchor the entry trigger to .about-right ITSELF — the column holding the
  // capsule — so the reveal fires as it scrolls into view. Desktop keeps
  // the #aboutp2 proxy.
  const aboutp2El = window.matchMedia('(max-width: 768px)').matches
    ? (document.querySelector('#about .about-right') || document.getElementById('aboutp2'))
    : document.getElementById('aboutp2');
  if (aboutp2El) {
    let entryTimer = null;
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !dnaGroupVisible) {
          entryTimer = setTimeout(enterDnaGroup, 800);
        } else if (!entry.isIntersecting) {
          clearTimeout(entryTimer);
        }
      });
    }, elementObserverOptions).observe(aboutp2El);
  }

  if (aboutSection) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && dnaGroupVisible) exitDnaGroup();
      });
    }, { threshold: 0 }).observe(aboutSection);
  }

  // SVG decoration bars — looser threshold so they trigger reliably on short screens
  // (the -20% rootMargin in elementObserverOptions pushes bar1 off-screen at ~900 px height).
  const decorationObserverOptions = { threshold: 0.1, rootMargin: '0px' };
  // Match the EXACT breakpoint that owns bar2's slide-in CSS (responsive.css
  // @media max-width:768px), not App.BrowserDetect.isMobile — the UA/isMobile
  // flag can disagree with the width query, which left the flicker in place.
  const isPhoneWidth = window.matchMedia('(max-width: 768px)').matches;
  const createDecorationObserver = (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      let hasEntered = false;
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            hasEntered = true;
            el.classList.remove('element-exit');
            el.classList.add('element-visible');
          } else if (hasEntered) {
            el.classList.remove('element-visible');
            el.classList.add('element-exit');
          }
        });
      }, decorationObserverOptions).observe(el);
    });
  };

  createDecorationObserver('.decoration-bar1');
  // bar2: on phones, observe the bar element itself (reliably fires as #about's
  // top edge enters — the section is taller than the viewport so a 20%-of-section
  // threshold could never be met, leaving bar2 invisible). ONE-SHOT: on the first
  // intersection add element-visible and disconnect, so the slide-in plays once
  // and holds its final position — no enter/exit toggle, no re-slide flicker.
  // Desktop keeps the standard per-element enter/exit observer, unchanged.
  if (isPhoneWidth) {
    document.querySelectorAll('.decoration-bar2').forEach(el => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.remove('element-exit');
            el.classList.add('element-visible');
            io.disconnect();
          }
        });
      }, decorationObserverOptions);
      io.observe(el);
    });
  } else {
    createDecorationObserver('.decoration-bar2');
  }
  createDecorationObserver('.decoration-certs1');
  createDecorationObserver('.decoration-vtv1');

  // .decoration-skills: same entry/exit pair pattern as the DNA group.
  const decorationSkills = document.querySelector('.decoration-skills');
  if (decorationSkills) {
    let skillsShown = false;
    let skillsTimer = null;

    // Phones: #aboutp2 is display:none (never intersects). Key the reveal to
    // the MESSAGES right above the graphic — #about-metrics (fallback: the
    // availability pill, then the graphic itself) — so the svg fades in just
    // after they enter the viewport (the 800ms delay below lands it right as
    // their slide-in settles). Desktop keeps the #aboutp2 proxy.
    const skillsTriggerEl = window.matchMedia('(max-width: 768px)').matches
      ? (document.getElementById('about-metrics') ||
         document.getElementById('about-availability') ||
         decorationSkills)
      : document.getElementById('aboutp2');
    if (skillsTriggerEl) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !skillsShown) {
            skillsTimer = setTimeout(() => {
              skillsShown = true;
              decorationSkills.classList.remove('element-exit');
              decorationSkills.classList.add('element-visible');
            }, 800);
          } else if (!entry.isIntersecting) {
            clearTimeout(skillsTimer);
          }
        });
      }, elementObserverOptions).observe(skillsTriggerEl);
    }

    if (aboutSection) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && skillsShown) {
            skillsShown = false;
            decorationSkills.classList.remove('element-visible');
            decorationSkills.classList.add('element-exit');
          }
        });
      }, { threshold: 0 }).observe(aboutSection);
    }
  }
}

// Scroll-linked clip-path reveal for #photo + static line + collision star.
function initPhotoReveal() {
  const photoSection     = document.querySelector('#photo');
  const photoSpacer      = document.querySelector('.photo-scroll-spacer');
  const staticLineCanvas = document.querySelector('.photo-static-line');
  // #art-direction is sticky-pinned (frozen) behind the photo curtain, so its
  // IntersectionObserver keeps it "visible" and its ambient animations running
  // the whole time it's occluded. Pause them once the curtain fully covers it.
  const artDirection     = document.getElementById('art-direction');

  if (photoSection && photoSpacer && staticLineCanvas) {
    // shadow: false — CSS filter on the canvas handles the glow
    // throttleEvery: 4 — ~15 fps; flicker is imperceptible above 12 fps
    const { show: showStaticLine, hide: hideStaticLine } =
      makeStaticLine(staticLineCanvas, { shadow: false, throttleEvery: 4, resizeDebounce: 100 });
    let scrollTimeout = null;

    const updatePhotoReveal = () => {
      if (_photoNavExit) return;

      const spacerRect     = photoSpacer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Entry: 0→1 as spacer.top descends from viewportH to 0
      const entryProgress = 1 - (spacerRect.top / viewportHeight);
      const entryClamped  = Math.max(0, Math.min(1, entryProgress));

      // Exit: 0→1 over the last viewport of the spacer (spacer.bottom → 0)
      const exitProgress = Math.max(0, Math.min(1, 1 - (spacerRect.bottom / viewportHeight)));

      // Freeze art-direction's ambient animations while it's fully occluded by
      // the curtain (reveal complete, exit not yet started).
      if (artDirection) {
        artDirection.classList.toggle('paused-animations', entryClamped >= 1 && exitProgress <= 0);
      }

      if (exitProgress > 0) {
        // Photo stays frozen (it's position:fixed). #illustration sits in normal
        // flow right behind it and rises from the bottom as the spacer scrolls.
        // Clip the photo from the BOTTOM up to expose that rising section, so it
        // reads as illustration covering the frozen photo from the bottom. The
        // clip seam sits at (1−exit)·vh — exactly illustration's top edge
        // (spacerRect.bottom), so the seam + static line track it pixel-perfect.
        photoSection.style.visibility = exitProgress < 1 ? 'visible' : 'hidden';
        photoSection.style.clipPath   = `inset(0 0 ${exitProgress * 100}% 0)`;
        staticLineCanvas.style.top    = `${(1 - exitProgress) * viewportHeight - 2}px`;
        exitProgress < 1 ? showStaticLine() : hideStaticLine();
      } else {
        photoSection.style.visibility = entryClamped > 0 ? 'visible' : 'hidden';
        photoSection.style.clipPath   = `inset(0 0 ${(1 - entryClamped) * 100}% 0)`;
        staticLineCanvas.style.top    = `${entryClamped * viewportHeight - 2}px`;
        (entryClamped > 0 && entryClamped < 1) ? showStaticLine() : hideStaticLine();
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(hideStaticLine, 150);
    };

    // RAF-gate: coalesce scroll events into one layout read+write per frame.
    let _photoRevealPending = false;
    const schedulePhotoReveal = () => {
      if (_photoRevealPending) return;
      _photoRevealPending = true;
      requestAnimationFrame(() => { _photoRevealPending = false; updatePhotoReveal(); });
    };

    window.addEventListener('scroll', schedulePhotoReveal, { passive: true });
    updatePhotoReveal();
  }

  // Collision star — fires when the about-bottom static line meets the photo reveal edge.
  const collisionStar = document.getElementById('line-collision-star');
  if (collisionStar) {
    let animating  = false;
    let overlapping = false;

    const checkLineOverlap = () => {
      const aboutEl  = document.getElementById('about');
      const spacerEl = document.querySelector('.photo-scroll-spacer');
      if (!aboutEl || !spacerEl) return;

      const aboutBottom = aboutEl.getBoundingClientRect().bottom;
      const vh = window.innerHeight;

      if (aboutBottom <= 4 || aboutBottom >= vh - 4) { overlapping = false; return; }

      const spacerTop = spacerEl.getBoundingClientRect().top;
      const clamped   = Math.max(0, Math.min(1, 1 - spacerTop / vh));
      if (clamped <= 0 || clamped >= 1) { overlapping = false; return; }

      const revealEdgeY   = clamped * vh;
      const inOverlapZone = Math.abs(aboutBottom - revealEdgeY) < 8;

      if (inOverlapZone && !overlapping && !animating) {
        overlapping = true;
        animating   = true;
        collisionStar.style.top = ((aboutBottom + revealEdgeY) / 2) + 'px';

        collisionStar.classList.remove('firing');
        void collisionStar.offsetWidth; // force reflow to restart CSS animation
        collisionStar.classList.add('firing');

        setTimeout(() => { collisionStar.classList.remove('firing'); animating = false; }, 800);
      } else if (!inOverlapZone) {
        overlapping = false;
      }
    };

    window.addEventListener('scroll', checkLineOverlap, { passive: true });
  }
}

// Animated static lines at section edges (about top/bottom, art-direction bottom).
function initStaticLines() {
  const aboutEl = document.getElementById('about');

  const aboutBottomCanvas = document.querySelector('.about-bottom-static-line');
  if (aboutBottomCanvas) {
    bindSectionEdge(aboutBottomCanvas, makeStaticLine(aboutBottomCanvas), aboutEl, 'bottom');
  }

  const aboutTopCanvas = document.querySelector('.about-top-static-line');
  if (aboutTopCanvas) {
    bindSectionEdge(aboutTopCanvas, makeStaticLine(aboutTopCanvas), aboutEl, 'top');
  }

  const artDirBottomCanvas = document.querySelector('.art-direction-bottom-static-line');
  if (artDirBottomCanvas) {
    bindSectionEdge(artDirBottomCanvas, makeStaticLine(artDirBottomCanvas),
      document.getElementById('art-direction'), 'top');
  }
}


// ============================================================================
// MASTER INITIALIZATION - Application Entry Point
// ============================================================================

/**
 * Updates the date element with the current date.
 * Format: [· Y Y Y Y · M M · D D ·]
 */
function updateDate() {
  const dateElement = document.querySelector('.date');
  if (dateElement) {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // Split digits with spaces
    const yearSpaced = year.split('').join(' ');
    const monthSpaced = month.split('').join(' ');
    const daySpaced = day.split('').join(' ');

    // Format: [· Y Y Y Y · M M · D D ·]
    dateElement.textContent = `[· ${yearSpaced} · ${monthSpaced} · ${daySpaced} ·]`;
  }
}

// ============================================================================
// INFO INTERFACE — HOTSPOT HINTS
// Hovering a step row adds .info-glow to the corresponding header target.
// Transparent <rect> hit areas sit on top of the SVG; pointer-events enabled
// only when badge is .active, so scroll is never blocked during entrance.
// ============================================================================

function initInfoInterfaceHints() {
  const badge = document.getElementById('infoInterface');
  if (!badge) return;

  const targets = {
    nav:    Array.from(document.querySelectorAll('.main-nav .nav-btn:not(.lang-btn):not(.sound-btn)')),
    cta:    Array.from(document.querySelectorAll('.intro-work-cta')),
    sound:  [document.getElementById('sound-toggle')].filter(Boolean),
    lang:   Array.from(document.querySelectorAll('.lang-btn')),
  };

  // ── Sound button: scrambling char replaces the icon on hover ──────────────
  const soundBtn = targets.sound[0] ?? null;
  const soundGlitchChars = '!@#$%^&*<>?/|\\[]{}~±§¶•∆∑∏√∞≠≈∫◊ΦΨΩλβγδ'.split('');
  let soundScrambleId = null;

  const soundGlitchSpan = document.createElement('span');
  soundGlitchSpan.className = 'sound-glitch-char';
  soundGlitchSpan.setAttribute('aria-hidden', 'true');
  soundBtn?.appendChild(soundGlitchSpan);

  const startSoundScramble = () => {
    if (!soundBtn) return;
    soundBtn.classList.add('sound-glitching');
    soundGlitchSpan.textContent = soundGlitchChars[Math.floor(Math.random() * soundGlitchChars.length)];
    soundScrambleId = setInterval(() => {
      soundGlitchSpan.textContent = soundGlitchChars[Math.floor(Math.random() * soundGlitchChars.length)];
    }, 80);
  };

  const stopSoundScramble = () => {
    clearInterval(soundScrambleId);
    soundScrambleId = null;
    soundBtn?.classList.remove('sound-glitching');
  };
  // ─────────────────────────────────────────────────────────────────────────

  let activeHint = null;

  const clearHint = (hint) => {
    targets[hint]?.forEach(el => el.classList.remove('info-glow', 'glitch-firing'));
    if (hint === 'sound') stopSoundScramble();
  };

  const applyHint = (hint) => {
    const els = targets[hint] ?? [];
    els.forEach(el => el.classList.add('info-glow'));
    // GlitchSystem.triggerGlitchBatch adds glitch-suppressed on-demand (no
    // timeout race) and internally filters to elements with [data-char] children.
    GlitchSystem.triggerGlitchBatch(els);
    if (hint === 'sound') startSoundScramble();
  };

  badge.addEventListener('mouseover', (e) => {
    const hotspot = e.target.closest('.inf-hotspot[data-hint]');
    const hint = hotspot?.dataset.hint ?? null;
    if (hint === activeHint) return;
    clearHint(activeHint);
    activeHint = hint;
    applyHint(activeHint);
    // Freeze the auto language cycle while an option is hovered; resume when
    // the pointer is over the badge but not on any hotspot.
    if (hint) badge._langLoopPause?.();
    else badge._langLoopResume?.();
  });

  badge.addEventListener('mouseleave', () => {
    clearHint(activeHint);
    activeHint = null;
    badge._langLoopResume?.();
  });
}

// ============================================================================
// INFO INTERFACE — BILINGUAL LOOP
// EN → flicker → ES → flicker → EN … forever.
// Content lines re-animate (staggered entrance) on every language change.
// ============================================================================

function initInfoInterfaceLangLoop() {
  const badge  = document.getElementById('infoInterface');
  if (!badge) return;

  const enGroup = badge.querySelector('#inf-en');
  const esGroup = badge.querySelector('#inf-es');
  if (!enGroup || !esGroup) return;

  const DISPLAY_MS = 6500;   // how long each language stays visible
  const EXIT_MS    = 450;    // duration of the flicker-out animation (must match CSS)

  let currentGroup = enGroup;
  let nextGroup    = esGroup;

  // Auto-cycle control. While paused (e.g. the user is hovering a hotspot to
  // read a hint) the loop holds on the current language; resuming reschedules
  // a fresh full interval so the visible language gets its full reading time.
  let switchTimer = null;
  let paused      = false;

  function scheduleNext() {
    clearTimeout(switchTimer);
    if (paused) return;
    switchTimer = setTimeout(doSwitch, DISPLAY_MS);
  }

  // Restart line animations on a group.
  // --line-offset controls the initial delay before stagger begins.
  function enterGroup(group, lineOffset = '0s') {
    group.style.setProperty('--line-offset', lineOffset);
    group.style.display = '';
    // Force animation restart: remove class → reflow → re-add
    group.classList.remove('inf-lang--entering');
    void group.getBoundingClientRect();
    group.classList.add('inf-lang--entering');
  }

  function doSwitch() {
    const outgoing = currentGroup;
    const incoming = nextGroup;

    // Flicker out the old group
    outgoing.classList.remove('inf-lang--entering');
    outgoing.classList.add('inf-lang--exiting');

    setTimeout(() => {
      // Hide old, reveal new with content entrance
      outgoing.style.display = 'none';
      outgoing.classList.remove('inf-lang--exiting');

      enterGroup(incoming, '0s');

      currentGroup = incoming;
      nextGroup    = outgoing;

      // Schedule the next switch (no-op while paused)
      scheduleNext();
    }, EXIT_MS);
  }

  // Exposed to the hotspot-hints handler so hovering an option freezes the
  // language, and leaving it resumes the cycle.
  badge._langLoopPause = () => {
    if (paused) return;
    paused = true;
    clearTimeout(switchTimer);
  };
  badge._langLoopResume = () => {
    if (!paused) return;
    paused = false;
    scheduleNext();
  };

  // Observe the badge becoming active (set by initCyberPanel)
  const mo = new MutationObserver(() => {
    if (!badge.classList.contains('active')) return;
    mo.disconnect();

    // Trigger EN entrance after the container slides in (0.75s = infoEntrance duration)
    enterGroup(enGroup, '0.75s');

    // Schedule first switch after EN has been visible long enough
    scheduleNext();
  });
  mo.observe(badge, { attributes: true, attributeFilter: ['class'] });
}

// Disable browser scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Runs fn(), logs a labelled error and continues if it throws.
// Keeps every subsystem independent: one broken DOM element can't block navigation.
function safeInit(label, fn) {
  try { return fn(); }
  catch (e) { console.error(`[init:${label}]`, e); }
}

// Boot after translations are applied — App.LanguageManager.ready resolves
// after DOMContentLoaded + default locale fetch, so Splitting.js processes
// already-translated text. i18n.js guarantees this runs before painting.
App.LanguageManager.ready.then(() => {
  window.scrollTo(0, 0);

  safeInit('date',       updateDate);
  safeInit('svg-inline', convertID1SvgToInline);
  safeInit('skills-inline', convertSkillsSvgToInline); // all viewports since 2026-07-03
  safeInit('lang-loop',  initInfoInterfaceLangLoop);
  safeInit('info-hints', initInfoInterfaceHints);

  const introSection = document.getElementById('intro');
  if (introSection) introSection.scrollIntoView({ behavior: 'instant', block: 'start' });

  const glitchSystem      = safeInit('GlitchSystem',      () => new GlitchSystem());
  const navigationManager = safeInit('NavigationManager', () => new NavigationManager());
  if (navigationManager) navigationManager.updateHeaderBackground('intro');
  App.navigationManager = navigationManager;  // shared with popstate (back/forward)
  initIntroObserver();
  initAboutAnimations();
  initPhotoReveal();
  initStaticLines();
  initArtDirectionEntrance(document.getElementById('art-direction'));
  if (glitchSystem) App.glitchSystem = glitchSystem;

  // Signal a successful boot to the fault guard (js/fault-guard.js): the core
  // managers initialized, so the app is alive. This disarms the watchdog and
  // makes late/minor errors non-fatal (they no longer trigger #site-fault).
  window.__SITE_BOOTED__ = true;

  safeInit('sound-toggle', () => {
    const soundToggle = document.getElementById('sound-toggle');
    if (!soundToggle) return;
    soundToggle.addEventListener('click', () => {
      const isActive = soundToggle.classList.toggle('active');
      soundToggle.setAttribute('aria-pressed', String(isActive));
    });
  });

  // ── Deep-link routing ────────────────────────────────────────────────────
  // A shared link like /#contact must land directly on that section without
  // the user scrolling past intro. We jump while the preloader overlay is still
  // opaque (preloaderExiting fires just before its fade) so the reveal already
  // shows the right section — no intro flash + jump. goToSection() reuses the
  // exact per-section scroll/entrance logic the nav buttons use.
  let deepLinkRouted = false;
  const routeDeepLink = () => {
    if (deepLinkRouted || !navigationManager) return;
    const id = _deepLinkSectionId();
    if (!id) return;
    deepLinkRouted = true;
    navigationManager.goToSection(id, { pushHash: false });
  };

  // sidebar uses CSS transition — unaffected by animation-play-state freeze
  window.addEventListener('preloaderExiting', () => {
    initCyberPanel(800);
    routeDeepLink();
  }, { once: true });

  // Fallback: if a slow locale fetch made this block run AFTER the preloader
  // already finished, the listener above missed its event — route immediately.
  if (!document.getElementById('preloader')) routeDeepLink();

  // Orb3D excluded — runs since page load, visible above the preloader.
  // App.ParticleSystem is the intro swarm (the preloader's own instance
  // destroys itself on this same event — see particle-system.js).
  window.addEventListener('preloaderDone', () => {
    if (App.ParticleSystem?.resume)    App.ParticleSystem.resume();
    if (App.BarcodeAnimation?.start)   App.BarcodeAnimation.start();
  }, { once: true });
});

// Only reset to top on (re)load when NOT deep-linking — otherwise this would
// fight the deep-link jump. The hash is preserved across reload by the browser.
window.addEventListener('load',         () => { if (!_deepLinkSectionId()) window.scrollTo(0, 0); });
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

// About section pin (→ about-pin.js). smoothScrollTo injected to avoid circular import.
safeInit('about-pin', () => initAboutPin(smoothScrollTo));

