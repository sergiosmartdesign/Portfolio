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
      desc: 'Encargo de un cliente particular: un mashup de Pikachu y Deadpool esculpido en Blender para impresión 3D. El personaje combina la silueta y las orejas del Pokémon con el traje, las armas y la actitud del mercenario, con detalles como el cinturón de pokebola, las pistolas y la katana. El modelo de esta página es el mismo sculpt optimizado para verlo en 360° directamente en el navegador.',
      specs: [['Scope','Character · 3D Print'],['Tools','Blender'],['Year','2026'],['Mode','Freelance']],
      tags: ['3D','Character','3D Print'],
      bg: 'images/art-direction/3d/sergio-ayala-pikapool-3d-character-turntable-2026.webp',
      model: 'images/3D/Pikapool-web.glb'
    },
    {
      num: '02', cat: '3D & Motion', title: 'Tib', sub: 'Personaje esculpido por encargo para impresión 3D',
      desc: 'Tib es un tiburón cartoon esculpido en Blender por encargo de un cliente particular para impresión 3D. La pieza se construyó alrededor de su expresión: la sonrisa cargada de dientes y la mirada desafiante debían leerse igual de bien en pantalla que en la figura impresa. Puedes examinar el modelo en 360° aquí mismo.',
      specs: [['Scope','Character · 3D Print'],['Tools','Blender'],['Year','2026'],['Mode','Freelance']],
      tags: ['3D','Character','3D Print'],
      bg: 'images/art-direction/3d/sergio-ayala-tib-3d-character-turntable-2026.webp',
      model: 'images/3D/Tib-web.glb'
    },
    {
      num: '03', cat: '3D & Motion', title: 'Throg', sub: 'La rana Thor de Marvel, esculpida para impresión 3D',
      desc: 'La versión rana de Thor en Marvel, esculpida en Blender por encargo de un cliente particular para impresión 3D. Casco alado, discos en el peto y anatomía de guerrero anfibio, presentados en gris neutro para que el volumen y el detalle hablen por sí solos.',
      specs: [['Scope','Character · 3D Print'],['Tools','Blender'],['Year','2026'],['Mode','Freelance']],
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
