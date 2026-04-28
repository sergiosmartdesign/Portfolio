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

    const FACE_NAMES = [
        'TIMELESS', 'REBELLION', 'SURREAL', 'DRAMATIC', 'CLASSICAL', 'OTHERWORLDLY',
        'FLAMINGO', 'NOMADS', 'CANYON', 'CASTLE', 'PURSUIT', 'COLLISION',
        'COMPANION', 'ADRIATIC', 'GEOMETRY', 'CAVE CITY', 'BOSPHORUS', 'ROSE CITY',
        'KOTOR', 'LONDON', 'ASCENT', 'MEDIEVAL', 'TIDAL', 'TOMBS',
        'CARVED', 'VENETIAN', 'SEVILLA', 'ISTANBUL'
    ];

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
                <div class="illus-tag">${card.date} &nbsp;·&nbsp; ${card.num} — ${card.theme}</div>
                <h2 class="illus-h2">${h2Lines}</h2>
                <span class="illus-technique">${card.technique}</span>
                <div class="illus-cta-row">
                    <button class="illus-cta-back" data-goto="${i - 1}">${arrowL} Back</button>
                    <button class="illus-cta" data-goto="${nextIdx}">
                        ${nextIdx === 0 ? 'Begin again' : 'Turn'} ${arrowR}
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

        sceneLabel.textContent  = FACE_NAMES[stop] ?? '';
        captionNum.textContent  = String(stop + 1).padStart(2, '0');
        captionName.textContent = FACE_NAMES[stop] ?? '';

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

    // ── Electric ring — scroll-velocity driven ───────────────────────────────
    let elecActive = false;
    let elecRaf    = null;
    let elecTimer  = null;
    let prevSmooth = smooth;

    function elecTick() {
        if (!elecActive) { elecRaf = null; return; }
        if (electricNoise) electricNoise.setAttribute('seed', (Math.random() * 500 | 0) + 1);
        elecRaf = requestAnimationFrame(elecTick);
    }

    function elecOn() {
        clearTimeout(elecTimer);
        if (!elecActive) {
            elecActive = true;
            tunnel.classList.add('illus-electric-active');
            if (!elecRaf) elecRaf = requestAnimationFrame(elecTick);
        }
    }

    function elecOff() {
        clearTimeout(elecTimer);
        elecTimer = setTimeout(() => {
            elecActive = false;
            tunnel.classList.remove('illus-electric-active');
        }, 500);
    }

    window.addEventListener('scroll', () => { tgt = getProgress(); }, { passive: true });

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

        // Electric ring: fire while cube is visibly rotating
        const vel = Math.abs(smooth - prevSmooth);
        prevSmooth = smooth;
        if (vel > 0.0002) { elecOn(); } else { elecOff(); }

        setCubeTransform(smooth);
        checkImageSwaps(smooth);
        updateUI(smooth);
    }

    requestAnimationFrame(frame);

}());
