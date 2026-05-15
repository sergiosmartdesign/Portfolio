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
 *
 * After applying translations, dispatches a 'languagechanged' CustomEvent
 * on document so other modules (e.g. photo-portfolio.js) can refresh caches.
 */

(function () {
  'use strict';

  // ── TRANSLATIONS ────────────────────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      // ── Intro CTAs ────────────────────────────────────────────────────────
      'intro.otw': '[ · O p e n   T o   W o r k · ]',
      'intro.cta': '[ · s e e · m y · w o r k · ]',

      // ── Navigation ────────────────────────────────────────────────────────
      'nav.about':        '[ · a b o u t · ]',
      'nav.photography':  '[ · p h o t o g r a p h y · ]',
      'nav.art-direction': '[ · a r t · d i r e c t i o n · ]',
      'nav.illustration': '[ · i l l u s t r a t i o n · ]',
      'nav.blog':         '[ · b l o g · ]',
      'nav.contact':      '[ · c o n t a c t · ]',

      'footer.rights': '© 2026 All rights reserved',

      'about.p1': 'Senior Art Director &amp; Photographer. Based in Bogotá, Colombia. I approach projects with a global vision, talking with the client to understand their brand and its DNA, focusing on what is the best way to implement an idea for the project, and how to translate it across various media: from web architecture and user experience design, to photography, illustration, and comprehensive branding.<br><span class="about-highlight">This portfolio itself was built using vibe coding, combining AI-assisted development with my UX/UI expertise</span> — and is fully optimized for both traditional search engines and AI-powered search.',

      'about.p2': 'As a UX/UI designer, my goal is to transform a brand\'s vision into engaging digital and tangible experiences that are clear and authentic. I currently work as an independent freelance professional, helping my clients to tell their stories through design.<br><br>I\'m now embracing vibe coding, using AI with my creative Art Direction skills to take them to the next level and build exceptional projects like this portfolio.',

      'about.p3': 'My work is an extension of my lifestyle: I am constantly learning about technology, tendencies, techniques. Always looking for references. I look for aesthetics everywhere, whether in the forms of nature, architecture, urban colors, pop culture or everyday details.<br><br><span class="about-highlight">I strongly believe that constant learning is the best way to create good design.</span>',

      'about.p4': 'My process begins with listening. It\'s not just about delivering a design, but about co-creating a visual language, that is the way to create good design. By talking with you we can <span class="about-highlight">understand your Brand\'s DNA,</span> translating it coherently into any format you need, whether it\'s relaunching your web platform, defining your photographic style, or conceptualizing your entire branding. <a href="mailto:sergionook@gmail.com" class="about-cta-marker"><em><strong>Let\'s work together</strong></em></a> to ensure your design doesn\'t just look good, but feels authentic and delivers a tangible impact on your audience.<br><br>You can explore what I\'ve studied in the certificates gallery below and experience what I\'ve done with it throughout this very project.',

      // ── Photo section — UI ─────────────────────────────────────────────────
      'photo.ui.cta':         'Click a category to expand its list — then hover over any photo title to preview the image.',
      'photo.ui.infoSub':     'use the arrows to navigate the photos · click the one you like to full view',
      'photo.ui.polaroids':     '[ · p o l a r o i d s · ]',
      'photo.ui.polaroidsDesc': 'A growing collection of travel polaroids. Each polaroid here is a travel photograph pulled from years of work across landscapes, cities, and encounters worldwide. When the archive reaches 100 photographs, the full collection is printed as a limited edition photobook.',
      'photo.ui.scrollHint':   '[ \u00b7 s c r o l l \u00a0 t o \u00a0 r e v e a l \u00a0 / \u00a0 c l i c k \u00a0 t o \u00a0 e x p a n d \u00a0 \u00b7 ]',
      'photo.ui.revealHint1':  'hover a title to',
      'photo.ui.revealHint2':  'reveal the photo',
      'photo.cat.landscapes': '· l a n d s c a p e s ·',
      'photo.cat.street':     '· s t r e e t \u00a0 p h o t o ·',
      'photo.cat.animals':    '· a n i m a l s ·',
      'photo.cat.travel':     '· t r a v e l ·',
      'photo.ig.label':       '· i n s t a g r a m ·',
      'photo.ig.desc':        'Want to see more? I post regularly on Instagram — more variety, more places, less structure. Everything that doesn\'t fit in a portfolio but is still worth sharing.',
      'photo.ig.cta':         '· f o l l o w ·',
      'photo.intro':          'Photography has been part of my professional and personal work for years — from commercial and editorial projects to street and travel work across four continents. It is one of my passions, a discipline where composition translates into visually pleasing images. <em>Every photo in this archive carries <span class="photo-ai-highlight"><strong><em>AI-generated metadata</em></strong></span>, making the portfolio fully searchable by people, search engines, and AI systems alike.</em>',

      // ── Photo titles — Landscapes ──────────────────────────────────────────
      'photo.t.islaEnUyuni':      'Isla en Uyuni',
      'photo.t.lagunaAzul':       'Laguna Azul',
      'photo.t.lagunaBlanca':     'Laguna Blanca',
      'photo.t.rumboAUyuni':      'Rumbo a Uyuni',
      'photo.t.cajonDelMaipo':    'Cajón del Maipo',
      'photo.t.daliDesert':       'Dalí Desert',
      'photo.t.andeanFlamingos':  'Andean Flamingos',
      'photo.t.kotorLandscape':   'Kotor Landscape',
      'photo.t.petraHorizon':     'Petra Horizon',

      // ── Photo titles — Street ──────────────────────────────────────────────
      'photo.t.streetsOfDubrovnik': 'Streets of Dubrovnik',
      'photo.t.wanderingFox':       'Wandering Fox Street Photo',
      'photo.t.asturianFolklore':   'Asturian Folklore',
      'photo.t.doingTheLaundry':    'Doing the Laundry',
      'photo.t.streetsOfSevilla':   'Streets of Sevilla',
      'photo.t.ponteDeLima':        'Ponte de Lima',
      'photo.t.peopleOfSevilla':    'People of Sevilla',
      'photo.t.ojoSevillano':       'Sevillian Eye',
      'photo.t.streetBeautyNantes': 'Street Beauty Nantes',
      'photo.t.streetsOfBiarritz':  'Streets of Biarritz',
      'photo.t.streetsOfIstanbul':  'Streets of Istanbul',

      // ── Photo titles — Animals ─────────────────────────────────────────────
      'photo.t.dog':              'Dog',
      'photo.t.shenanigan':       'Shenanigan',
      'photo.t.fairyWoods':       'Fairy Woods',
      'photo.t.comingForYou':     'Coming for You',
      'photo.t.crash':            'Crash',
      'photo.t.attackOfTheTitan': 'Attack of the Titan',

      // ── Photo titles — Travel ──────────────────────────────────────────────
      'photo.t.ourLadyOfTheRocks':  'Our Lady of the Rocks',
      'photo.t.perast':             'Perast',
      'photo.t.twelveHouses':       '12 Houses',
      'photo.t.adrvanRestaurant':   'Adrvan Restaurant Mostar',
      'photo.t.dubrovnik':          'Dubrovnik',
      'photo.t.kotorMontenegro':    'Kotor Montenegro',
      'photo.t.rovinjCroatia':      'Rovinj Croatia',
      'photo.t.touristSelfie':      'Tourist Selfie',
      'photo.t.paradaRefrescante':  'Refreshing Stop',
      'photo.t.londonBridge':       'London Bridge',
      'photo.t.findTheRhombus':     'Find the Rhombus',
      'photo.t.medieval':           'Medieval',
      'photo.t.atTheTop':           'At the Top',
      'photo.t.sevilla':            'Sevilla',
      'photo.t.theRiver':           'The River',
      'photo.t.lookingAtTheSky':    'Looking at the Sky',
      'photo.t.indi':               'Indi',
      'photo.t.beduinos':           'Bedouins',
      'photo.t.cappadociaIceCream': 'Cappadocia Ice Cream Houses',
      'photo.t.castilloDeLasHadas': 'Fairy Castle',
      'photo.t.goreme':             'Göreme',
      'photo.t.istanbulShips':      'Istanbul Ships',
      'photo.t.jewelsOfPetra':      'Jewels of Petra',
      'photo.t.montSaintMichel':    'Mont Saint-Michel',
      'photo.t.oldTombs':           'Old Tombs',
      'photo.t.petraDetails':       'Petra Details',
      'photo.t.petra':              'Petra',
      'photo.t.sweetWine':          'Sweet Wine',
      'photo.t.tritonDeSintra':     'Tritón de Sintra',

      // ── Photo locations ────────────────────────────────────────────────────
      'photo.l.uyuniBolivia':        'Uyuni, Bolivia',
      'photo.l.atacamaChile':        'Atacama, Chile',
      'photo.l.bolivianAndes':       'Bolivian Andes',
      'photo.l.bolivianAltiplano':   'Bolivian Altiplano',
      'photo.l.cajonDelMaipoChile':  'Cajón del Maipo, Chile',
      'photo.l.surLipezBolivia':     'Sur Lípez, Bolivia',
      'photo.l.kotorMontenegro':     'Kotor, Montenegro',
      'photo.l.petraJordan':         'Petra, Jordan',
      'photo.l.dubrovnikCroatia':    'Dubrovnik, Croatia',
      'photo.l.bragaPortugal':       'Braga, Portugal',
      'photo.l.asturiasSpain':       'Asturias, Spain',
      'photo.l.portoPortugal':       'Porto, Portugal',
      'photo.l.sevilleSpain':        'Seville, Spain',
      'photo.l.ponteDeLimaPortugal': 'Ponte de Lima, Portugal',
      'photo.l.nantesFrance':        'Nantes, France',
      'photo.l.biarritzFrance':      'Biarritz, France',
      'photo.l.istanbulTurkey':      'Istanbul, Turkey',
      'photo.l.cotaCundinamarca':    'Cota, Cundinamarca',
      'photo.l.laMesaCundinamarca':  'La Mesa, Cundinamarca',
      'photo.l.doninhosFerrolSpain': 'Doniños, Ferrol, Spain',
      'photo.l.bosniaHerz':          'Bosnia & Herzegovina',
      'photo.l.perastMontenegro':    'Perast, Montenegro',
      'photo.l.veniceItaly':         'Venice, Italy',
      'photo.l.mostarBosniaHerz':    'Mostar, Bosnia & Herzegovina',
      'photo.l.rovinjCroatia':       'Rovinj, Croatia',
      'photo.l.galiciaSpain':        'Galicia, Spain',
      'photo.l.londonUK':            'London, UK',
      'photo.l.cappadociaTurkey':    'Cappadocia, Turkey',
      'photo.l.goremeTurkey':        'Göreme, Turkey',
      'photo.l.palacioPortugal':     'Palácio da Pena, Portugal',
      'photo.l.normandyFrance':      'Normandy, France',
      'photo.l.sintraPortugal':      'Sintra, Portugal',

      // ── Illustration section ───────────────────────────────────────────────
      'illus.nav.hint':    'Scroll to navigate or click Enter to view',
      'illus.intro.body1': 'Digital, hand-drawn and',
      'illus.intro.body2': 'mixed media illustrations.',
      'illus.intro.body3': '3 series applied across editorial,',
      'illus.intro.body4': 'brand, and personal projects.',
      'illus.cta.enter':   'Enter',
      'illus.cta.next':    'Next',
      'illus.cta.back':    'Back',
      'illus.cta.again':   'Begin again',
      'illus.cat.digital':     'DIGITAL',
      'illus.cat.mixed':       'MIXED MEDIA',
      'illus.cat.traditional': 'TRADITIONAL',
      'illus.s1.body': 'A cow walking a monster instead of a monster walking a cow. That inversion is enough to break template thinking. The cape ends up on the wrong body.',
      'illus.s2.body': 'Clashing colors. No balance. A dance with no choreography. When the model works against itself something more genuine surfaces.',
      'illus.s3.body': 'AI is trained to polish and regularize. The harder direction is unlearning that. A television for a head is not an error. It is the point.',
      'illus.s4.body': 'Dada and the surrealists knew this. Put the absurd at the center and the edges stop pretending. Nine heads in the branches. The sun has a face and it approves.',
      'illus.s5.body': 'Forward creativity takes a sketch and makes it real. This goes the other way. Imperfection left in place is closer to something honest.',
      'illus.hud.s1': '· s c r o l l',
      'illus.hud.s2': 'o r',
      'illus.hud.s3': 'c l I c k',
      'illus.hud.s4': '- E N T E R -',
      'illus.hud.s5': 't o',
      'illus.hud.s6': 'v I e w ·',
      'illus.expand':  '[ · c l i c k | t o | e x p a n d · ]',
    },

    es: {
      // ── Intro CTAs ────────────────────────────────────────────────────────
      'intro.otw': '[ · T r a b a j e m o s   J u n t o s · ]',
      'intro.cta': '[ · v e r · m i · t r a b a j o · ]',

      // ── Navigation ────────────────────────────────────────────────────────
      'nav.about':        '[ · s o b r e · ]',
      'nav.photography':  '[ · f o t o g r a f í a · ]',
      'nav.art-direction': '[ · d i r e c c i ó n · d e · a r t e · ]',
      'nav.illustration': '[ · i l u s t r a c i ó n · ]',
      'nav.blog':         '[ · b l o g · ]',
      'nav.contact':      '[ · c o n t a c t o · ]',

      'footer.rights': '© 2026 Todos los derechos reservados — Sergio Ayala, Director de Arte Senior &amp; Fotógrafo, Bogotá, Colombia',

      'about.p1': 'Director de Arte Senior y Fotógrafo. Con base en Bogotá, Colombia. Abordo los proyectos con una visión global, hablando con el cliente para entender su marca y su ADN, enfocándome en la mejor forma de implementar una idea, y cómo traducirla a través de distintos medios: desde arquitectura web y diseño de experiencia de usuario, hasta fotografía, ilustración generando un branding integral.<br><span class="about-highlight">Este mismo portafolio fue construido usando vibe coding, combinando desarrollo asistido por IA con mi experiencia en UX/UI</span> y está completamente optimizado para motores de búsqueda tradicionales e IA.',

      'about.p2': 'Como diseñador UX/UI, mi objetivo es transformar la visión de una marca en experiencias digitales y tangibles que sean claras y auténticas. Actualmente trabajo como profesional independiente, ayudando a mis clientes a contar sus historias a través del diseño.<br><br>Hoy incorporo el vibe coding usando la IA como colaboradora creativa para llevar mis habilidades al siguiente nivel y construir proyectos extraordinarios como este portafolio.',

      'about.p3': 'Mi trabajo es una extensión de mi estilo de vida: estoy en constante aprendizaje sobre tecnología, tendencias y técnicas. Siempre buscando referencias. Encuentro estética en todas partes: en las formas de la naturaleza, la arquitectura, los colores urbanos, la cultura pop o los detalles cotidianos.<br><br><span class="about-highlight">Creo firmemente que el aprendizaje constante es la mejor forma de crear buen diseño.</span>',

      'about.p4': 'Mi proceso comienza con escuchar. No se trata solo de entregar un diseño, sino de co-crear un lenguaje visual — esa es la manera de crear buen diseño. Al hablar contigo podemos <span class="about-highlight">comprender el ADN de tu marca,</span> traduciéndolo coherentemente en cualquier formato que necesites: ya sea relanzando tu plataforma web, definiendo tu estilo fotográfico o conceptualizando todo tu branding. <a href="mailto:sergionook@gmail.com" class="about-cta-marker"><em><strong>Trabajemos juntos</strong></em></a> para asegurar que tu diseño no solo se vea bien, sino que se sienta auténtico y genere un impacto tangible en tu audiencia.<br><br>Puedes explorar lo que he estudiado en la galería de certificados y experimentar lo que he hecho con ello a lo largo de este mismo proyecto.',

      // ── Photo section — UI ─────────────────────────────────────────────────
      'photo.ui.cta':         'Haz clic en una categoría para expandir su lista — luego pasa el cursor sobre cualquier título para previsualizar la imagen.',
      'photo.ui.infoSub':     'usa las flechas para navegar las fotos · haz clic en la que quieras para verla en pantalla completa',
      'photo.ui.polaroids':     '[ · p o l a r o i d s · ]',
      'photo.ui.polaroidsDesc': 'Una colección en crecimiento de polaroids de viaje. Cada polaroid es una fotografía extraída de años de trabajo entre paisajes, ciudades y encuentros por todo el mundo. Cuando el archivo alcance las 100 fotografías, la colección completa se imprime como un photobook de edición limitada.',
      'photo.ui.revealHint1':  'pasa el cursor',
      'photo.ui.revealHint2':  'para revelar la foto',
      'photo.ui.scrollHint':   '[ \u00b7 d e s l i z a \u00a0 p a r a \u00a0 r e v e l a r \u00a0 / \u00a0 c l i c \u00a0 p a r a \u00a0 e x p a n d i r \u00a0 \u00b7 ]',
      'photo.cat.landscapes': '· p a i s a j e s ·',
      'photo.cat.street':     '· f o t o \u00a0 u r b a n a ·',
      'photo.cat.animals':    '· a n i m a l e s ·',
      'photo.cat.travel':     '· v i a j e s ·',
      'photo.ig.label':       '· i n s t a g r a m ·',
      'photo.ig.desc':        '¿Quieres ver más? Publico regularmente en Instagram — más variedad, más lugares, menos estructura. Todo lo que no cabe en un portfolio pero vale la pena compartir.',
      'photo.ig.cta':         '· s e g u i r ·',
      'photo.intro':          'La fotografía ha sido parte de mi trabajo profesional y personal durante años — desde proyectos comerciales y editoriales hasta trabajo callejero y de viaje en cuatro continentes. Es una de mis pasiones, una disciplina donde la composición se traduce en imágenes visualmente atractivas. <em><span class="photo-ai-highlight">Cada foto en este archivo lleva <strong><em>metadatos generados por IA</em></strong>,</span> haciendo que el portfolio sea completamente buscable por personas, motores de búsqueda y sistemas de IA.</em>',

      // ── Photo titles — Landscapes ──────────────────────────────────────────
      'photo.t.islaEnUyuni':      'Isla en Uyuni',
      'photo.t.lagunaAzul':       'Laguna Azul',
      'photo.t.lagunaBlanca':     'Laguna Blanca',
      'photo.t.rumboAUyuni':      'Rumbo a Uyuni',
      'photo.t.cajonDelMaipo':    'Cajón del Maipo',
      'photo.t.daliDesert':       'Desierto de Dalí',
      'photo.t.andeanFlamingos':  'Flamencos Andinos',
      'photo.t.kotorLandscape':   'Paisaje de Kotor',
      'photo.t.petraHorizon':     'Horizonte de Petra',

      // ── Photo titles — Street ──────────────────────────────────────────────
      'photo.t.streetsOfDubrovnik': 'Calles de Dubrovnik',
      'photo.t.wanderingFox':       'Zorro Errante — Foto Urbana',
      'photo.t.asturianFolklore':   'Folclore Asturiano',
      'photo.t.doingTheLaundry':    'Tendiendo la Ropa',
      'photo.t.streetsOfSevilla':   'Calles de Sevilla',
      'photo.t.ponteDeLima':        'Ponte de Lima',
      'photo.t.peopleOfSevilla':    'Gente de Sevilla',
      'photo.t.ojoSevillano':       'Ojo Sevillano',
      'photo.t.streetBeautyNantes': 'Belleza Callejera en Nantes',
      'photo.t.streetsOfBiarritz':  'Calles de Biarritz',
      'photo.t.streetsOfIstanbul':  'Calles de Estambul',

      // ── Photo titles — Animals ─────────────────────────────────────────────
      'photo.t.dog':              'Perro',
      'photo.t.shenanigan':       'Travesura',
      'photo.t.fairyWoods':       'Bosque de las Hadas',
      'photo.t.comingForYou':     'Viene por Ti',
      'photo.t.crash':            'Colisión',
      'photo.t.attackOfTheTitan': 'Ataque del Titán',

      // ── Photo titles — Travel ──────────────────────────────────────────────
      'photo.t.ourLadyOfTheRocks':  'Nuestra Señora de las Rocas',
      'photo.t.perast':             'Perast',
      'photo.t.twelveHouses':       '12 Casas',
      'photo.t.adrvanRestaurant':   'Restaurante Adrvan, Mostar',
      'photo.t.dubrovnik':          'Dubrovnik',
      'photo.t.kotorMontenegro':    'Kotor Montenegro',
      'photo.t.rovinjCroatia':      'Rovinj, Croacia',
      'photo.t.touristSelfie':      'Selfie de Turista',
      'photo.t.paradaRefrescante':  'Parada Refrescante',
      'photo.t.londonBridge':       'Puente de Londres',
      'photo.t.findTheRhombus':     'Encuentra el Rombo',
      'photo.t.medieval':           'Medieval',
      'photo.t.atTheTop':           'En la Cima',
      'photo.t.sevilla':            'Sevilla',
      'photo.t.theRiver':           'El Río',
      'photo.t.lookingAtTheSky':    'Mirando al Cielo',
      'photo.t.indi':               'Indi',
      'photo.t.beduinos':           'Beduinos',
      'photo.t.cappadociaIceCream': 'Casas Helado de Capadocia',
      'photo.t.castilloDeLasHadas': 'Castillo de las Hadas',
      'photo.t.goreme':             'Göreme',
      'photo.t.istanbulShips':      'Barcos de Estambul',
      'photo.t.jewelsOfPetra':      'Joyas de Petra',
      'photo.t.montSaintMichel':    'Mont Saint-Michel',
      'photo.t.oldTombs':           'Tumbas Antiguas',
      'photo.t.petraDetails':       'Detalles de Petra',
      'photo.t.petra':              'Petra',
      'photo.t.sweetWine':          'Vino Dulce',
      'photo.t.tritonDeSintra':     'Tritón de Sintra',

      // ── Photo locations ────────────────────────────────────────────────────
      'photo.l.uyuniBolivia':        'Uyuni, Bolivia',
      'photo.l.atacamaChile':        'Atacama, Chile',
      'photo.l.bolivianAndes':       'Andes Bolivianos',
      'photo.l.bolivianAltiplano':   'Altiplano Boliviano',
      'photo.l.cajonDelMaipoChile':  'Cajón del Maipo, Chile',
      'photo.l.surLipezBolivia':     'Sur Lípez, Bolivia',
      'photo.l.kotorMontenegro':     'Kotor, Montenegro',
      'photo.l.petraJordan':         'Petra, Jordania',
      'photo.l.dubrovnikCroatia':    'Dubrovnik, Croacia',
      'photo.l.bragaPortugal':       'Braga, Portugal',
      'photo.l.asturiasSpain':       'Asturias, España',
      'photo.l.portoPortugal':       'Oporto, Portugal',
      'photo.l.sevilleSpain':        'Sevilla, España',
      'photo.l.ponteDeLimaPortugal': 'Ponte de Lima, Portugal',
      'photo.l.nantesFrance':        'Nantes, Francia',
      'photo.l.biarritzFrance':      'Biarritz, Francia',
      'photo.l.istanbulTurkey':      'Estambul, Turquía',
      'photo.l.cotaCundinamarca':    'Cota, Cundinamarca',
      'photo.l.laMesaCundinamarca':  'La Mesa, Cundinamarca',
      'photo.l.doninhosFerrolSpain': 'Doniños, Ferrol, España',
      'photo.l.bosniaHerz':          'Bosnia y Herzegovina',
      'photo.l.perastMontenegro':    'Perast, Montenegro',
      'photo.l.veniceItaly':         'Venecia, Italia',
      'photo.l.mostarBosniaHerz':    'Mostar, Bosnia y Herzegovina',
      'photo.l.rovinjCroatia':       'Rovinj, Croacia',
      'photo.l.galiciaSpain':        'Galicia, España',
      'photo.l.londonUK':            'Londres, Reino Unido',
      'photo.l.cappadociaTurkey':    'Capadocia, Turquía',
      'photo.l.goremeTurkey':        'Göreme, Turquía',
      'photo.l.palacioPortugal':     'Palácio da Pena, Portugal',
      'photo.l.normandyFrance':      'Normandía, Francia',
      'photo.l.sintraPortugal':      'Sintra, Portugal',

      // ── Illustration section ───────────────────────────────────────────────
      'illus.nav.hint':    'Desplázate para navegar o haz clic en Entrar para ver',
      'illus.intro.body1': 'Ilustraciones digitales, dibujadas a mano y',
      'illus.intro.body2': 'en técnica mixta.',
      'illus.intro.body3': '3 series en proyectos editoriales,',
      'illus.intro.body4': 'de marca y personales.',
      'illus.cta.enter':   'Entrar',
      'illus.cta.next':    'Siguiente',
      'illus.cta.back':    'Atrás',
      'illus.cta.again':   'Comenzar de nuevo',
      'illus.cat.digital':     'DIGITAL',
      'illus.cat.mixed':       'TÉCNICA MIXTA',
      'illus.cat.traditional': 'TRADICIONAL',
      'illus.s1.body': 'Una vaca paseando a un monstruo en lugar de un monstruo paseando a una vaca. Esa inversión basta para romper el pensamiento de plantilla. La capa termina en el cuerpo equivocado.',
      'illus.s2.body': 'Colores que chocan. Sin equilibrio. Una danza sin coreografía. Cuando el modelo trabaja en su contra, emerge algo más genuino.',
      'illus.s3.body': 'La IA está entrenada para pulir y regularizar. La dirección más difícil es desaprender eso. Un televisor por cabeza no es un error. Es el punto.',
      'illus.s4.body': 'Dadá y los surrealistas lo sabían. Pon lo absurdo en el centro y los bordes dejan de fingir. Nueve cabezas entre las ramas. El sol tiene cara y aprueba.',
      'illus.s5.body': 'La creatividad hacia adelante toma un boceto y lo hace real. Este va al revés. La imperfección dejada en su lugar está más cerca de algo honesto.',
      'illus.hud.s1': '· d e s l i z a r',
      'illus.hud.s2': 'o',
      'illus.hud.s3': 'c l i c',
      'illus.hud.s4': '- E N T R A R -',
      'illus.hud.s5': 'p a r a',
      'illus.hud.s6': 'v e r ·',
      'illus.expand':  '[ · c l i c | p a r a | e x p a n d i r · ]',
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

    translate(key) {
      return TRANSLATIONS[this.current]?.[key];
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

      // Translate elements that need re-splitting (textContent only — script.js re-runs Splitting.js)
      document.querySelectorAll('[data-i18n-split]').forEach(el => {
        const key = el.getAttribute('data-i18n-split');
        const value = TRANSLATIONS[lang][key];
        if (value !== undefined) el.textContent = value;
      });

      // Translate elements with HTML content (data-i18n-html uses innerHTML)
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const value = TRANSLATIONS[lang][key];
        if (value !== undefined) el.innerHTML = value;
      });

      // Sync button active states
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });

      // Notify other modules (e.g. photo-portfolio.js) so they can refresh caches
      document.dispatchEvent(new CustomEvent('languagechanged', { detail: { lang } }));

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
