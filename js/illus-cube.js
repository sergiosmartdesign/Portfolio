(function () {
    'use strict';

    const IMAGES = [
        'images/photo/Isla en Uyuni.jpg',
        'images/photo/Fairy woods.jpg',
        'images/photo/Dali Desert.jpg',
        'images/photo/Attack of the Titan.jpg',
        'images/photo/Triton de Sintra.jpg',
        'images/photo/Cappadocia ice cream houses.jpg',
        'images/photo/Andean Flamingo.jpg',
        'images/photo/Beduinos.jpg',
        'images/photo/Cajon del Maipo.jpg',
        'images/photo/Castillo de las Hadas.jpg',
        'images/photo/Coming for you.jpg',
        'images/photo/Crash.jpg',
        'images/photo/Dog.jpg',
        'images/photo/Dubrovnik.jpg',
        'images/photo/Find the Rhombus.jpg',
        'images/photo/Goreme.jpg',
        'images/photo/Istanbul ships.jpg',
        'images/photo/Jewels of Petra.jpg',
        'images/photo/Kotor landscape.jpg',
        'images/photo/London Bridge.jpg',
        'images/photo/Looking to the Sky.jpg',
        'images/photo/Medieval.jpg',
        'images/photo/Mt Saint Michel.jpg',
        'images/photo/Old tombs.jpg',
        'images/photo/Petra.jpg',
        'images/photo/Rovinj Croatia.jpg',
        'images/photo/Sevilla.jpg',
        'images/photo/Streets of Istanbul.jpg'
    ];

    const FACE_NAMES = IMAGES.map(src =>
        src.split('/').pop().replace(/\.[^.]+$/, '').toUpperCase()
    );

    const EXTRA_CARDS = [
        { date: 'Apr — 2024', num: '06', theme: 'Andean Light',        h2: 'STILL\nWATERS',          technique: 'Landscape photography · Long exposure' },
        { date: 'May — 2024', num: '07', theme: 'Desert Nomads',       h2: 'SAND\nAND\nSILENCE',     technique: 'Documentary · Available light' },
        { date: 'Jun — 2024', num: '08', theme: 'Canyon Echo',         h2: 'WALLS\nTHAT\nSPEAK',     technique: 'Landscape · Wide angle' },
        { date: 'Jul — 2024', num: '09', theme: 'Fairy Castle',        h2: 'STONE\nAND\nMOSS',        technique: 'Architecture · Natural light' },
        { date: 'Aug — 2024', num: '10', theme: 'Shadow Pursuit',      h2: 'NO\nESCAPE',              technique: 'Street photography · Contrast' },
        { date: 'Sep — 2024', num: '11', theme: 'Free Fall',           h2: 'GROUND\nLOST',            technique: 'Action · High shutter speed' },
        { date: 'Oct — 2024', num: '12', theme: 'Faithful Eye',        h2: 'BEFORE\nWORDS',           technique: 'Portrait · Natural light' },
        { date: 'Nov — 2024', num: '13', theme: 'Adriatic Wall',       h2: 'BUILT\nTO\nLAST',         technique: 'Architecture · Golden hour' },
        { date: 'Dec — 2024', num: '14', theme: 'Urban Geometry',      h2: 'FIND\nTHE\nGRID',         technique: 'Abstract · Aerial perspective' },
        { date: 'Jan — 2025', num: '15', theme: 'Cave City',           h2: 'CARVED\nFROM\nEARTH',     technique: 'Landscape · Magic hour' },
        { date: 'Feb — 2025', num: '16', theme: 'Three Continents',    h2: 'WATER\nBETWEEN\nWORLDS',  technique: 'Travel · Panoramic' },
        { date: 'Mar — 2025', num: '17', theme: 'Rose City',           h2: 'LIGHT\nON\nSTONE',         technique: 'Architecture · Side light' },
        { date: 'Apr — 2025', num: '18', theme: 'Bay of Kotor',        h2: 'WATER\nAND\nMOUNTAIN',    technique: 'Landscape · Telephoto' },
        { date: 'May — 2025', num: '19', theme: 'Tower Bridge',        h2: 'STEEL\nAND\nFOG',          technique: 'Urban · Long exposure' },
        { date: 'Jun — 2025', num: '20', theme: 'Vertical Longing',    h2: 'EYES\nUP',                 technique: 'Street photography · Perspective' },
        { date: 'Jul — 2025', num: '21', theme: 'Walled City',         h2: 'TIME\nSTOPPED\nHERE',      technique: 'Architecture · Overcast light' },
        { date: 'Aug — 2025', num: '22', theme: 'Island Abbey',        h2: 'TIDE\nAND\nFAITH',         technique: 'Landscape · Tidal flats' },
        { date: 'Sep — 2025', num: '23', theme: 'Ancient Silence',     h2: 'OLDER\nTHAN\nNAMES',       technique: 'Archaeology · Natural light' },
        { date: 'Oct — 2025', num: '24', theme: 'Carved in Stone',     h2: 'HANDS\nNOW\nGONE',         technique: 'Detail · Macro lens' },
        { date: 'Nov — 2025', num: '25', theme: 'Venetian Light',      h2: 'SALT\nAND\nGOLD',          technique: 'Travel · Overcast diffusion' },
        { date: 'Dec — 2025', num: '26', theme: 'Golden Andalucía',    h2: 'ORANGE\nWALLS\nFADE',      technique: 'Urban · Evening light' },
        { date: 'Jan — 2026', num: '27', theme: 'City on the Strait',  h2: 'EAST\nMEETS\nWEST',        technique: 'Urban · Telephoto compression' }
    ];

    const N            = IMAGES.length;
    const SWAP_RADIUS  = 3;

    const FACE_COLORS = [
        { hex: '#005F73', rgb: '0,95,115'    },
        { hex: '#0A9396', rgb: '10,147,150'  },
        { hex: '#94D2BD', rgb: '148,210,189' },
        { hex: '#E9D8A6', rgb: '233,216,166' },
        { hex: '#EE9B00', rgb: '238,155,0'   },
        { hex: '#CA6702', rgb: '202,103,2'   },
        { hex: '#BB3E03', rgb: '187,62,3'    },
        { hex: '#AE2012', rgb: '174,32,18'   },
        { hex: '#9B2226', rgb: '155,34,38'   },
    ];

    // Seeded PRNG — same path every page load, so image order is always identical
    function mulberry32(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const rand = mulberry32(0xA1B2C3D4);

    const STOPS        = buildRandomStops(N);
    const FACE_MAP     = buildFaceMap(STOPS);
    const INTRO_FACE   = FACE_MAP[0]; // physical face shown at stop 0 — reserved for text

    // One color per stop, seeded after buildRandomStops so the sequence is stable
    const STOP_COLORS  = Array.from({ length: N }, () =>
        Math.floor(rand() * FACE_COLORS.length)
    );

    // The original reference uses 3 transition types: pure pitch (drx=±90, dry=0),
    // pure yaw (drx=0, dry=±90), and diagonal (drx=±90, dry=±90).
    // All 8 signed variants are available; each stop randomly picks one,
    // keeping rx in {-90, 0, 90} so faces always land correctly.
    function buildRandomStops(n) {
        const MOVES = [
            { drx: -90, dry:   0 },
            { drx: +90, dry:   0 },
            { drx:   0, dry: -90 },
            { drx:   0, dry: +90 },
            { drx: -90, dry: -90 },
            { drx: +90, dry: +90 },
            { drx: -90, dry: +90 },
            { drx: +90, dry: -90 },
        ];
        const stops = [{ rx: 90, ry: 0 }];
        let rx = 90, ry = 0;
        for (let i = 1; i < n; i++) {
            // At top/bottom (rx=±90) yaw doesn't change the visible face, so force a pitch.
            const atPole = rx === 90 || rx === -90;
            const valid  = MOVES.filter(m => {
                const newRx = rx + m.drx;
                return newRx >= -90 && newRx <= 90 && (!atPole || m.drx !== 0);
            });
            const move = valid[Math.floor(rand() * valid.length)];
            rx += move.drx;
            ry += move.dry;
            stops.push({ rx, ry });
        }
        return stops;
    }

    // Maps each stop index to which of the 6 physical cube faces is visible at that orientation.
    function buildFaceMap(stops) {
        return stops.map(({ rx, ry }) => {
            const rxN = ((rx % 360) + 360) % 360;
            if (rxN === 90)  return 0; // top
            if (rxN === 270) return 5; // bottom
            const ryN = ((ry % 360) + 360) % 360;
            if (ryN === 0)   return 1; // front
            if (ryN === 270) return 2; // right
            if (ryN === 180) return 3; // back
            return 4;                  // left
        });
    }

    const illus = document.getElementById('illustration');
    if (!illus) return;

    // Lock the section in suppressed state immediately — before any RAF frame or
    // updateUI call can trigger the normal card reveal transitions.
    illus.classList.add('illus-intro-active');

    const tunnel         = illus.querySelector('.illus-tunnel');
    const cube           = illus.querySelector('.illus-cube');
    const electricNoise  = document.getElementById('illus-cube-turbulence');
    const faces       = [...illus.querySelectorAll('.illus-face')];
    const hudPct      = illus.querySelector('.illus-hud-pct');
    const progFill    = illus.querySelector('.illus-progress-fill');
    const sceneLabel  = illus.querySelector('.illus-scene-label');
    const captionNum  = illus.querySelector('.illus-caption-num');
    const captionName = illus.querySelector('.illus-caption-name');
    const dots        = [...illus.querySelectorAll('.illus-dot')];
    const sectionsEl  = illus.querySelector('.illus-sections');

    // Scale section height to number of images (100vh per stop)
    illus.style.height = (N * 100) + 'vh';

    // Stamp face label + scan line into every face.
    // The gallery-title face (stop 0) gets the section descriptor instead of the expand hint.
    faces.forEach((face, fi) => {
        // Only the gallery-title face gets an in-face label (decorative word-art).
        // The "click to expand" hint is rendered as a flat overlay (see expandHint below)
        // so it always appears upright at the visual bottom regardless of cube orientation.
        if (fi === INTRO_FACE) {
            const lbl = document.createElement('div');
            lbl.className = 'illus-face-label illus-face-label--gallery';
            lbl.innerHTML =
                '<span>[ · I N T E R D I M E N S I O N A L</span>' +
                '<span class="illus-gallery-indent">C U B E</span>' +
                '<span class="illus-gallery-indent">G A L L E R Y</span>' +
                '<span class="illus-gallery-indent">O F</span>' +
                '<span class="illus-gallery-indent">T I M E L E S S</span>' +
                '<span class="illus-gallery-indent">A R T · ]</span>';
            face.appendChild(lbl);
        }

        const sl = document.createElement('div');
        sl.className = 'illus-scan-line';
        face.appendChild(sl);
    });

    // Cache gallery label for the top face — counter-rotated in setCubeTransform.
    const topFaceLabel = faces[INTRO_FACE].querySelector('.illus-face-label');

    // Generate additional nav dots
    for (let i = dots.length; i < N; i++) {
        const btn = document.createElement('button');
        btn.className  = 'illus-dot';
        btn.dataset.goto = String(i);
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        illus.querySelector('.illus-strip').appendChild(btn);
    }
    const allDots = [...illus.querySelectorAll('.illus-dot')];

    // Generate content sections for stops 6+
    const arrowR = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 6h10M6 1l5 5-5 5"/></svg>`;
    const arrowL = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11 6H1M6 11L1 6l5-5"/></svg>`;

    EXTRA_CARDS.forEach((card, offset) => {
        const i      = 6 + offset;
        const isRight = i % 2 !== 0;
        const nextIdx = i < N - 1 ? i + 1 : 0;
        const h2Lines = card.h2.split('\n').join('<br>');

        const sec = document.createElement('div');
        sec.className      = 'illus-section';
        sec.dataset.idx    = String(i);
        sec.innerHTML = `
            <div class="illus-card${isRight ? ' illus-card--right' : ''}">
                <div class="illus-h-line"></div>
                <div class="illus-tag glitch-text" data-splitting>${card.date} &nbsp;·&nbsp; ${card.num} — ${card.theme}</div>
                <h2 class="illus-h2 glitch-text" data-splitting>${h2Lines}</h2>
                <span class="illus-technique">${card.technique}</span>
                <div class="illus-cta-row">
                    <button class="illus-cta-back" data-goto="${i - 1}">${arrowL} Back</button>
                    <button class="illus-cta" data-goto="${nextIdx}">
                        ${nextIdx === 0 ? 'Begin again' : 'Next'} ${arrowR}
                    </button>
                </div>
            </div>`;
        sectionsEl.appendChild(sec);
    });

    const allSections = [...illus.querySelectorAll('.illus-section')];

    // Image preloading
    const imageCache = new Map();

    function preloadImage(src) {
        if (imageCache.has(src)) return imageCache.get(src);
        const p = new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => resolve(img);
            img.src = src;
        });
        imageCache.set(src, p);
        return p;
    }

    IMAGES.forEach(src => preloadImage(src));

    const faceImgIdx = new Array(6).fill(-1);

    // Returns the CSS transform needed to counter the cube's accumulated rotation
    // so each image always appears right-side-up to the viewer.
    //
    // - Side faces (front/right/left): rotateY never affects the vertical axis → no correction.
    // - Back face: rotateY(180deg) mirrors the X axis → scaleX(-1).
    // - Top face (rx=90): accumulated ry tilts the image; correction = rotateZ(-ry).
    // - Bottom face (rx=-90): same but opposite sign → rotateZ(+ry).
    function getFaceCorrection(faceIdx, stopIdx) {
        if (faceIdx === 3) return 'scaleX(-1)';
        if (faceIdx === 0 || faceIdx === 5) {
            const ryN  = ((STOPS[stopIdx].ry % 360) + 360) % 360;
            if (ryN === 0) return '';
            const sign = faceIdx === 0 ? -1 : 1;
            const deg  = ((sign * ryN) % 360 + 360) % 360;
            return `rotate(${deg}deg)`;
        }
        return '';
    }

    // Restores the gallery-title label on INTRO_FACE.
    // Called whenever stop 0 reclaims the face, and on nav-button reset.
    function restoreGalleryLabel() {
        const lbl = faces[INTRO_FACE]?.querySelector('.illus-face-label');
        if (!lbl) return;
        lbl.style.opacity = '';
        lbl.className = 'illus-face-label illus-face-label--gallery';
        lbl.innerHTML =
            '<span>[ · I N T E R D I M E N S I O N A L</span>' +
            '<span class="illus-gallery-indent">C U B E</span>' +
            '<span class="illus-gallery-indent">G A L L E R Y</span>' +
            '<span class="illus-gallery-indent">O F</span>' +
            '<span class="illus-gallery-indent">T I M E L E S S</span>' +
            '<span class="illus-gallery-indent">A R T · ]</span>';
    }

    async function setFaceImage(faceIdx, imgIdx) {
        if (faceImgIdx[faceIdx] === imgIdx) return;
        faceImgIdx[faceIdx] = imgIdx;

        // Stop 0 reclaims the gallery-title face: clear photo and restore title label
        if (faceIdx === INTRO_FACE && imgIdx === 0) {
            const staleImg = faces[INTRO_FACE].querySelector('img');
            if (staleImg) {
                staleImg.classList.remove('illus-img-enter');
                staleImg.removeAttribute('src');
            }
            restoreGalleryLabel();
            return;
        }

        // A non-0 stop is claiming INTRO_FACE: hide the gallery label so it doesn't
        // show behind the photo. The "click to expand" hint comes from the 2D overlay.
        if (faceIdx === INTRO_FACE && topFaceLabel) {
            topFaceLabel.style.opacity = '0';
        }

        const src = IMAGES[imgIdx];
        await preloadImage(src);
        if (faceImgIdx[faceIdx] !== imgIdx) return;
        let img = faces[faceIdx].querySelector('img');
        if (!img) { img = new Image(); faces[faceIdx].appendChild(img); }
        img.alt = FACE_NAMES[imgIdx] ?? '';
        img.src = src;
        img.style.transform = getFaceCorrection(faceIdx, imgIdx);
    }

    function checkImageSwaps(s) {
        const base = Math.min(N - 1, Math.round(s * (N - 1)));
        // Process stops from nearest outward — first assignment wins per face,
        // so each face always shows the image of the closest stop that uses it.
        const assigned = new Set();
        for (let dist = 0; dist <= SWAP_RADIUS; dist++) {
            for (const offset of (dist === 0 ? [0] : [-dist, dist])) {
                const si = base + offset;
                if (si < 0 || si >= N) continue;
                const f = FACE_MAP[si];
                if (!assigned.has(f)) {
                    assigned.add(f);
                    setFaceImage(f, si);
                }
            }
        }
    }

    // Seed faces near the start
    for (let i = 0; i < Math.min(N, SWAP_RADIUS + 1); i++) setFaceImage(FACE_MAP[i], i);

    // Easing
    const easeIO = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function getProgress(rect) {
        const r     = rect || illus.getBoundingClientRect();
        const total = illus.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        return Math.max(0, Math.min(1, -r.top / total));
    }

    function setCubeTransform(s) {
        if (STOPS.length < 2) return;
        const t = s * (N - 1);
        const i = Math.min(Math.floor(t), N - 2);
        const f = easeIO(t - i);
        const a = STOPS[i], b = STOPS[i + 1];
        const curRy = a.ry + (b.ry - a.ry) * f;
        cube.style.transform =
            `rotateX(${a.rx + (b.rx - a.rx) * f}deg) rotateY(${curRy}deg)`;

        // The gallery label lives inside the top face (INTRO_FACE). Its face transform
        // (rotateX(-90deg)) turns the cube's accumulated ry into a Z-spin on the label,
        // so we counter-rotate each frame to keep the word-art upright.
        // The label uses translateY(-50%) for centering — preserve it in the inline transform.
        // (The click-to-expand hint is a flat 2D overlay and needs no correction.)
        if (topFaceLabel) {
            topFaceLabel.style.transform = `translateY(-50%) rotateZ(${-curRy}deg)`;
        }
    }

    let lastStop = -1;

    function updateUI(s) {
        const pct  = Math.round(s * 100);
        hudPct.textContent      = String(pct).padStart(3, '0') + '%';
        progFill.style.width    = pct + '%';
        hintHudPct.textContent  = String(pct).padStart(3, '0') + '%';
        hintHudFill.style.width = pct + '%';

        const stop = Math.min(N - 1, Math.round(s * (N - 1)));
        if (stop === lastStop) return;
        lastStop = stop;

        const name   = FACE_NAMES[stop] ?? '';
        const spaced = name.split('').join(' ');

        hintHudLabel.textContent = name;
        sceneLabel.textContent   = name;
        captionNum.textContent = String(stop + 1).padStart(2, '0');
        captionName.textContent = '[ · ' + spaced + ' · ]';
        captionName.classList.remove('illus-name-glitch');
        void captionName.offsetWidth;
        captionName.classList.add('illus-name-glitch');

        imgGlitchPending = true;
        // Hide the image-name caption on the gallery-title face (stop 0 has no photo)
        tunnel.classList.toggle('illus-stop-zero', stop === 0);
        setHintSide(stop);
        allDots.forEach((d, i)      => d.classList.toggle('active', i === stop));
        allSections.forEach((sec, i) => sec.classList.toggle('active', i === stop));
    }

    function gotoSlide(idx) {
        const illusTop = illus.getBoundingClientRect().top + window.scrollY;
        const total    = illus.offsetHeight - window.innerHeight;
        const targetY  = illusTop + (Math.max(0, Math.min(N - 1, idx)) / (N - 1)) * total;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    let tgt    = getProgress();
    let smooth = tgt;

    function applyFaceColor(stop) {
        const c = FACE_COLORS[STOP_COLORS[stop]];
        tunnel.style.setProperty('--illus-face-color', c.hex);
        tunnel.style.setProperty('--illus-face-rgb', c.rgb);
    }

    // ── Image entry glitch — fires when the face is nearly fully front-facing ─
    // Pending flag is set when the stop changes; the frame loop checks the
    // remaining normalized distance to the target stop and fires once the cube
    // is within ~12% of a stop-unit from landing (≈ 76% through its rotation).
    let imgGlitchPending = false;

    function fireImgGlitch(stop) {
        applyFaceColor(stop);
        const face     = faces[FACE_MAP[stop]];
        const scanLine = face?.querySelector('.illus-scan-line');

        if (stop === 0) {
            // Gallery title face — no image; pulse the scan line as landing feedback
            if (scanLine) {
                scanLine.classList.remove('illus-scan-active');
                void face.offsetWidth;
                scanLine.classList.add('illus-scan-active');
            }
            return;
        }

        // Re-trigger the expand hint glitch on every new image face landing
        triggerExpandHintGlitch();

        const img = face?.querySelector('img');
        if (!img) return;

        // Single reflow restarts both animations simultaneously
        img.classList.remove('illus-img-enter');
        if (scanLine) scanLine.classList.remove('illus-scan-active');
        void face.offsetWidth;
        img.classList.add('illus-img-enter');
        if (scanLine) scanLine.classList.add('illus-scan-active');
    }

    // ── Electric border — scroll-velocity driven ─────────────────────────────
    // Seed is cycled inside the main frame loop (no second RAF needed).
    // elecOff uses a guard so the timeout is only scheduled once per idle entry.
    let elecActive    = false;
    let elecTimer     = null;
    let elecFrame     = 0;
    let prevSmooth    = smooth;
    let introSeenOnce = false;
    let introTimer    = null;

    function elecOn() {
        if (elecTimer) { clearTimeout(elecTimer); elecTimer = null; }
        if (!elecActive) {
            elecActive = true;
            tunnel.classList.add('illus-electric-active');
        }
    }

    function elecOff() {
        if (elecTimer) return;
        elecTimer = setTimeout(() => {
            elecActive = false;
            elecTimer  = null;
            tunnel.classList.remove('illus-electric-active');
        }, 500);
    }

    // ── Scroll hint — opposite side of active card, after 3.5 s idle ─────────
    const hintHud      = document.createElement('div');
    const hintHudPct   = document.createElement('div');
    const hintHudBar   = document.createElement('div');
    const hintHudFill  = document.createElement('div');
    const hintHudLabel = document.createElement('div');

    hintHud.className      = 'illus-hint-hud illus-hint-hud--right';
    hintHudPct.className   = 'illus-hint-hud-pct';
    hintHudBar.className   = 'illus-hint-hud-bar';
    hintHudFill.className  = 'illus-hint-hud-fill';
    hintHudLabel.className = 'illus-hint-hud-label';

    hintHud.setAttribute('aria-hidden', 'true');
    hintHudPct.textContent   = '000%';
    hintHudLabel.textContent = 'TIMELESS';

    const hintHudScroll = document.createElement('div');
    hintHudScroll.className = 'illus-hud-scroll glitch-text subtitle-glitch';
    hintHudScroll.setAttribute('data-splitting', '');
    hintHudScroll.innerHTML =
        '<span>[ · s c r o l l</span>' +
        '<span class="illus-hud-scroll-in">o r</span>' +
        '<span class="illus-hud-scroll-in">c l I c k</span>' +
        '<span class="illus-hud-scroll-in">- E N T E R -</span>' +
        '<span class="illus-hud-scroll-in">t o</span>' +
        '<span class="illus-hud-scroll-in">v I e w · ]</span>';

    hintHudBar.appendChild(hintHudFill);
    hintHud.appendChild(hintHudPct);
    hintHud.appendChild(hintHudBar);
    hintHud.appendChild(hintHudLabel);
    hintHud.appendChild(hintHudScroll);
    tunnel.appendChild(hintHud);

    // Flat 2D overlay — sits outside the 3D cube context so it is always upright
    // and always at the viewer-space bottom of the cube. Hidden at stop 0 via CSS
    // (.illus-stop-zero is toggled by updateUI) so it only shows with an active photo.
    const expandHint = document.createElement('div');
    expandHint.className = 'illus-expand-hint glitch-text subtitle-glitch';
    expandHint.setAttribute('data-splitting', '');
    expandHint.setAttribute('aria-hidden', 'true');
    expandHint.textContent = '[ · c l i c k | t o | e x p a n d · ]';
    tunnel.appendChild(expandHint);

    let expandHintSplit = false;
    function triggerExpandHintGlitch() {
        if (!window.Splitting) return;
        if (!expandHintSplit) {
            // First call: run Splitting.js once and let the animation start naturally.
            expandHintSplit = true;
            const results = window.Splitting({ target: expandHint, by: 'chars' });
            results.forEach(result => {
                result.chars.forEach(char => {
                    char.style.setProperty('--count', String(Math.random() * 5 + 1));
                    for (let g = 0; g < 10; g++) {
                        const r = _GLITCH_CHARS[Math.floor(Math.random() * _GLITCH_CHARS.length)];
                        char.style.setProperty(`--char-${g}`, `"${r}"`);
                    }
                });
            });
            return;
        }
        // Subsequent calls: restart the CSS animation on [data-char]:after pseudo-elements.
        // Can't set inline styles on pseudo-elements directly — toggle a class on the parent
        // to suppress animation-name, force a reflow, then remove it to re-fire the animation.
        expandHint.classList.add('illus-glitch-reset');
        void expandHint.offsetWidth;
        expandHint.classList.remove('illus-glitch-reset');
    }

    function setHintSide(stop) {
        const hintRight = stop % 2 === 0;
        hintHud.classList.toggle('illus-hint-hud--right', hintRight);
        hintHud.classList.toggle('illus-hint-hud--left',  !hintRight);
    }

    // ── Scroll-hint glitch intro — fires once, after the cube enters ─────────
    // Kept isolated so it doesn't reach into GlitchSystem in script.js.
    const _GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');
    let   scrollHintSplit = false;

    function initScrollHintGlitch() {
        if (scrollHintSplit || !window.Splitting) return;
        scrollHintSplit = true;
        const results = window.Splitting({ target: hintHudScroll, by: 'chars' });
        results.forEach(result => {
            result.chars.forEach(char => {
                char.style.setProperty('--count', String(Math.random() * 5 + 1));
                for (let g = 0; g < 10; g++) {
                    const r = _GLITCH_CHARS[Math.floor(Math.random() * _GLITCH_CHARS.length)];
                    char.style.setProperty(`--char-${g}`, `"${r}"`);
                }
            });
        });
    }

    function resetIntro() {
        if (introTimer) { clearTimeout(introTimer); introTimer = null; }
        elecActive = false;
        if (elecTimer) { clearTimeout(elecTimer); elecTimer = null; }
        tunnel.classList.remove('illus-electric-active');
        illus.classList.remove('illus-entering', 'illus-intro-active');

        // Evict any stale photo and restore the gallery label — always, on every visit
        const titleFaceImg = faces[INTRO_FACE].querySelector('img');
        if (titleFaceImg) {
            titleFaceImg.classList.remove('illus-img-enter');
            titleFaceImg.removeAttribute('src');
        }
        restoreGalleryLabel();
        faceImgIdx[INTRO_FACE] = -1;

        if (introSeenOnce) return;
        introSeenOnce = true;
        illus.classList.add('illus-entering');
        // 580ms: cube scale-in finishes at 80ms delay + 480ms duration = 560ms;
        // glitch fires just after so it overlaps the hint-hud fade-in (starts 300ms).
        setTimeout(initScrollHintGlitch, 580);
        introTimer = setTimeout(() => {
            illus.classList.remove('illus-entering');
            introTimer = null;
        }, 1300);
    }

    document.querySelectorAll('a[href="#illustration"]').forEach(btn => {
        btn.addEventListener('click', resetIntro);
    });

    // ── Lightbox ─────────────────────────────────────────────────────────────
    const lb = document.createElement('div');
    lb.className = 'illus-lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
        <div class="illus-lightbox-frame">
            <img class="illus-lightbox-img" alt="">
            <div class="illus-lightbox-border" aria-hidden="true"></div>
            <button class="illus-lightbox-close" aria-label="Close">[ x ]</button>
        </div>`;
    document.body.appendChild(lb);

    const lbImg   = lb.querySelector('.illus-lightbox-img');
    let   lbOpen  = false;
    let   lbElecTimer = null;

    // Frame scale animation uses cubic-bezier(0.34, 1.56, 0.64, 1) over 0.5s.
    // The spring overshoots before settling; 620ms covers the full settle window.
    const LB_SETTLE_MS = 620;

    function lbShow(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lb.setAttribute('aria-hidden', 'false');
        lb.classList.add('open');
        lbOpen = true;
        document.body.style.overflow = 'hidden';

        if (lbElecTimer) { clearTimeout(lbElecTimer); lbElecTimer = null; }
        lb.classList.remove('lb-elec-active');
        // Force a style flush so the snap-on transition takes effect immediately
        void lb.offsetWidth;
        lb.classList.add('lb-elec-active');
        lbElecTimer = setTimeout(() => {
            lb.classList.remove('lb-elec-active');
            lbElecTimer = null;
        }, LB_SETTLE_MS);
    }

    function lbHide() {
        if (lbElecTimer) { clearTimeout(lbElecTimer); lbElecTimer = null; }
        lb.classList.remove('lb-elec-active');
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        lbOpen = false;
        document.body.style.overflow = '';
        setTimeout(() => { if (!lbOpen) lbImg.src = ''; }, 500);
    }

    lb.addEventListener('click', e => {
        if (e.target === lb) lbHide();
    });
    lb.querySelector('.illus-lightbox-close').addEventListener('click', lbHide);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lbOpen) lbHide(); });

    // Transparent click zone over cube — opens lightbox on click
    const clickZone = document.createElement('div');
    clickZone.className = 'illus-cube-clickzone';
    clickZone.setAttribute('role', 'button');
    clickZone.setAttribute('tabindex', '0');
    clickZone.setAttribute('aria-label', 'Expand image');
    tunnel.appendChild(clickZone);

    clickZone.addEventListener('click', () => {
        const stop = Math.max(0, lastStop);
        const img  = faces[FACE_MAP[stop]]?.querySelector('img');
        if (img?.src) lbShow(img.src, img.alt);
    });
    clickZone.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickZone.click(); }
    });

    window.addEventListener('scroll', () => {
        tgt = getProgress();
    }, { passive: true });

    illus.addEventListener('click', e => {
        const btn = e.target.closest('[data-goto]');
        if (!btn) return;
        gotoSlide(parseInt(btn.dataset.goto, 10));
    });

    let lastNow = performance.now();

    function frame(now) {
        requestAnimationFrame(frame);

        // Skip all work when section is well off-screen — cheap early exit.
        const bcr = illus.getBoundingClientRect();
        if (bcr.top > window.innerHeight + 100 || bcr.bottom < -100) return;

        const dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow  = now;

        tgt = getProgress(bcr);

        // First organic scroll entry — fires resetIntro() if user scrolled in
        // without clicking the nav button (nav click already calls resetIntro directly).
        if (!introSeenOnce && bcr.top <= 0 && bcr.bottom > 0) {
            resetIntro();
        }

        smooth  += (tgt - smooth) * (1 - Math.exp(-dt * 8));
        smooth   = Math.max(0, Math.min(1, smooth));

        const vel = Math.abs(smooth - prevSmooth);
        prevSmooth = smooth;
        if (vel > 0.0002) { elecOn(); } else if (elecActive) { elecOff(); }
        if ((elecActive || lbOpen) && electricNoise && ++elecFrame % 3 === 0) {
            electricNoise.setAttribute('seed', (Math.random() * 500 | 0) + 1);
        }

        setCubeTransform(smooth);
        checkImageSwaps(smooth);
        updateUI(smooth);

        // Fire image glitch once the cube face is mostly front-facing.
        // remaining: 0.5 when stop just changed, 0 when fully arrived.
        // Threshold 0.12 ≈ 76% through the landing rotation.
        if (imgGlitchPending && lastStop >= 0) {
            const remaining = Math.abs(smooth - lastStop / (N - 1)) * (N - 1);
            if (remaining < 0.12) {
                imgGlitchPending = false;
                fireImgGlitch(lastStop);
            }
        }
    }

    requestAnimationFrame(frame);

}());
