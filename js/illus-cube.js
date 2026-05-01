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

    // Stamp expand hint + scan line into every face
    faces.forEach(face => {
        const lbl = document.createElement('div');
        lbl.className   = 'illus-face-label';
        lbl.textContent = '[ · c l i c k | t o | e x p a n d · ]';
        face.appendChild(lbl);

        const sl = document.createElement('div');
        sl.className = 'illus-scan-line';
        face.appendChild(sl);
    });

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

    async function setFaceImage(faceIdx, imgIdx) {
        if (faceImgIdx[faceIdx] === imgIdx) return;
        faceImgIdx[faceIdx] = imgIdx;
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

    function getProgress() {
        const rect  = illus.getBoundingClientRect();
        const total = illus.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        return Math.max(0, Math.min(1, -rect.top / total));
    }

    function setCubeTransform(s) {
        if (STOPS.length < 2) return;
        const t = s * (N - 1);
        const i = Math.min(Math.floor(t), N - 2);
        const f = easeIO(t - i);
        const a = STOPS[i], b = STOPS[i + 1];
        cube.style.transform =
            `rotateX(${a.rx + (b.rx - a.rx) * f}deg) rotateY(${a.ry + (b.ry - a.ry) * f}deg)`;
    }

    let lastStop = -1;

    function updateUI(s) {
        const pct  = Math.round(s * 100);
        hudPct.textContent   = String(pct).padStart(3, '0') + '%';
        progFill.style.width = pct + '%';

        const stop = Math.min(N - 1, Math.round(s * (N - 1)));
        if (stop === lastStop) return;
        lastStop = stop;

        const name   = FACE_NAMES[stop] ?? '';
        const spaced = name.split('').join(' ');

        sceneLabel.textContent = name;
        captionNum.textContent = String(stop + 1).padStart(2, '0');
        captionName.textContent = '[ · ' + spaced + ' · ]';
        captionName.classList.remove('illus-name-glitch');
        void captionName.offsetWidth;
        captionName.classList.add('illus-name-glitch');

        imgGlitchPending = true;
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

    // ── Image entry glitch — fires when the face is nearly fully front-facing ─
    // Pending flag is set when the stop changes; the frame loop checks the
    // remaining normalized distance to the target stop and fires once the cube
    // is within ~12% of a stop-unit from landing (≈ 76% through its rotation).
    let imgGlitchPending = false;

    function fireImgGlitch(stop) {
        const face     = faces[FACE_MAP[stop]];
        const img      = face?.querySelector('img');
        const scanLine = face?.querySelector('.illus-scan-line');
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
    let elecActive = false;
    let elecTimer  = null;
    let elecFrame  = 0;
    let prevSmooth = smooth;

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
    const scrollHint = document.createElement('div');
    scrollHint.className   = 'illus-scroll-hint illus-scroll-hint--right';
    scrollHint.setAttribute('aria-hidden', 'true');
    scrollHint.innerHTML = `
        <svg class="illus-scroll-screen" viewBox="0 0 88 126" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <pattern id="illus-hint-scan" x="0" y="0" width="88" height="4" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="88" y2="0" stroke="rgba(148,210,189,0.07)" stroke-width="1"/>
                </pattern>
            </defs>

            <!-- Geometric octagon frame — draws in via stroke-dashoffset -->
            <path class="illus-frame-border"
                  d="M14,1 L74,1 L87,14 L87,112 L74,125 L14,125 L1,112 L1,14 Z"
                  stroke="#AE2012" stroke-width="1.5"/>

            <!-- Amber L-shaped corner ticks -->
            <g class="illus-frame-corners">
                <polyline points="2,13 2,2 13,2"     stroke="#EE9B00" stroke-width="1.5" stroke-linecap="square" fill="none"/>
                <polyline points="75,2 86,2 86,13"   stroke="#EE9B00" stroke-width="1.5" stroke-linecap="square" fill="none"/>
                <polyline points="2,113 2,124 13,124" stroke="#EE9B00" stroke-width="1.5" stroke-linecap="square" fill="none"/>
                <polyline points="75,124 86,124 86,113" stroke="#EE9B00" stroke-width="1.5" stroke-linecap="square" fill="none"/>
            </g>

            <!-- Screen stage: bg + content power on together as a unit -->
            <g class="illus-screen-stage">
                <path d="M16,6 L72,6 L82,16 L82,112 L72,120 L16,120 L6,112 L6,16 Z" fill="#001219"/>
                <rect x="6" y="6" width="76" height="114" fill="url(#illus-hint-scan)"/>
                <line x1="16" y1="116" x2="72" y2="116" stroke="#AE2012" stroke-width="0.5" opacity="0.6"/>

                <!-- Scroll icon + label (fade in after screen opens) -->
                <g class="illus-screen-content">
                    <rect x="33" y="16" width="22" height="36" rx="11" stroke="#EE9B00" stroke-width="1.5"/>
                    <circle class="illus-scroll-dot" cx="44" cy="26" r="3" fill="#EE9B00"/>
                    <path class="illus-scroll-chevron" d="M38,60 L44,65 L50,60" stroke="#EE9B00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path class="illus-scroll-chevron" d="M38,54 L44,59 L50,54" stroke="#EE9B00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <text x="44" y="92" text-anchor="middle"
                          font-family="'Share Tech Mono', monospace"
                          font-size="7" letter-spacing="1.2"
                          fill="#E9D8A6">[ · SCROLL · ]</text>
                </g>
            </g>
        </svg>`;
    tunnel.appendChild(scrollHint);

    let hintTimer  = null;
    let loopTimer  = null;
    let inSection  = false;
    const HINT_MS       = 3500; // idle delay before first show
    const LOOP_MS       = 3000; // how long screen stays visible per cycle
    const LOOP_PAUSE_MS = 600;  // gap between hide and next show (covers 0.15s fade)

    function showHint() {
        if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
        const screen = scrollHint.querySelector('.illus-scroll-screen');
        if (screen) {
            screen.classList.remove('illus-screen-playing');
            void screen.offsetWidth; // force reflow so animation restarts cleanly
            screen.classList.add('illus-screen-playing');
        }
        scrollHint.classList.add('illus-scroll-visible');
        tunnel.classList.add('illus-idle');

        // Auto-hide after 3 s, then restart — user is still idle so keep illus-idle
        loopTimer = setTimeout(() => {
            const scr = scrollHint.querySelector('.illus-scroll-screen');
            if (scr) scr.classList.remove('illus-screen-playing');
            scrollHint.classList.remove('illus-scroll-visible');
            loopTimer = setTimeout(showHint, LOOP_PAUSE_MS);
        }, LOOP_MS);
    }
    function hideHint() {
        if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
        const screen = scrollHint.querySelector('.illus-scroll-screen');
        if (screen) screen.classList.remove('illus-screen-playing');
        scrollHint.classList.remove('illus-scroll-visible');
        tunnel.classList.remove('illus-idle');
    }

    function scheduleHint() {
        if (hintTimer) clearTimeout(hintTimer);
        hintTimer = setTimeout(showHint, HINT_MS);
    }

    function resetHint() {
        hideHint();
        if (inSection) scheduleHint();
        else if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    }

    function setHintSide(stop) {
        // Even stop → card on left → hint on right; odd → hint on left
        const hintRight = stop % 2 === 0;
        scrollHint.classList.toggle('illus-scroll-hint--right', hintRight);
        scrollHint.classList.toggle('illus-scroll-hint--left',  !hintRight);
    }

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
        resetHint();
    }, { passive: true });

    illus.addEventListener('click', e => {
        const btn = e.target.closest('[data-goto]');
        if (!btn) return;
        gotoSlide(parseInt(btn.dataset.goto, 10));
    });

    let lastNow = performance.now();

    function frame(now) {
        requestAnimationFrame(frame);
        const dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow  = now;
        smooth  += (tgt - smooth) * (1 - Math.exp(-dt * 8));
        smooth   = Math.max(0, Math.min(1, smooth));

        // Electric border: on while scrolling, seed cycled at ~20 fps
        const vel = Math.abs(smooth - prevSmooth);
        prevSmooth = smooth;
        if (vel > 0.0002) { elecOn(); } else if (elecActive) { elecOff(); }
        if ((elecActive || lbOpen) && electricNoise && ++elecFrame % 3 === 0) {
            electricNoise.setAttribute('seed', (Math.random() * 500 | 0) + 1);
        }

        // Section visibility — start/stop the idle hint timer at entry/exit
        const nowInSection = smooth > 0.001 && smooth < 0.999;
        if (nowInSection !== inSection) {
            inSection = nowInSection;
            if (inSection) scheduleHint();
            else { hideHint(); if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; } }
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
