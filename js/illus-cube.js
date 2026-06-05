(function () {
    'use strict';

    const IMAGES = [
        'images/illustration/sergio-ayala-themberchaud-dnd-dragon-concept-art.webp', // stop 0 — gallery title face; image hidden behind label
        'images/illustration/sergio-ayala-themberchaud-dnd-dragon-concept-art.webp',
        'images/illustration/sergio-ayala-hada-de-los-andes-andean-fairy-illustration-2024.webp',
        'images/illustration/sergio-ayala-meninas-canido-tarot-illustration-ferrol-2024.webp',
        'images/illustration/sergio-ayala-rocker-ghost-geisha-yurei-illustration-2024.webp',
        'images/illustration/sergio-ayala-holy-vandal-canido-baroque-concept-art-2024.webp',
        'images/illustration/sergio-ayala-mujer-crustaceo-surrealist-mixed-media-2014.webp',
        'images/illustration/sergio-ayala-reconciliacion-watercolor-digital-2014.webp',
        'images/art-direction/sergio-ayala-draconic-love-dragon-illustration-2019.webp',
    ];

    const FACE_NAMES = IMAGES.map(src =>
        src.split('/').pop().replace(/\.[^.]+$/, '').toUpperCase()
    );


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

    const rand = window.mulberry32(0xA1B2C3D4);

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
                // newRx !== 90 keeps the top face (INTRO_FACE) reserved for stop 0 only,
                // preventing stop 2+ from landing on the same physical face and corrupting
                // the gallery-title label / showing the wrong image on first entry.
                return newRx >= -90 && newRx <= 90 && newRx !== 90 && (!atPole || m.drx !== 0);
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
    const strip       = illus.querySelector('.illus-strip');
    const lustEl      = illus.querySelector('.illus-lust-accent');

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
        // Release any forwards-fill from a previous scan animation so the per-frame
        // dot-product opacity can take back control of this face's image.
        img.classList.remove('illus-img-enter');
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

    // Current interpolated cube rotation in radians — written by setCubeTransform,
    // read by updateFaceOpacities to compute per-face viewer-facing dot products.
    let _rxRad = Math.PI / 2;
    let _ryRad = 0;

    function setCubeTransform(s) {
        if (STOPS.length < 2) return;
        const t = s * (N - 1);
        const i = Math.min(Math.floor(t), N - 2);
        const f = easeIO(t - i);
        const a = STOPS[i], b = STOPS[i + 1];
        const curRxDeg = a.rx + (b.rx - a.rx) * f;
        const curRyDeg = a.ry + (b.ry - a.ry) * f;
        cube.style.transform = `rotateX(${curRxDeg}deg) rotateY(${curRyDeg}deg)`;

        // The gallery label lives inside the top face (INTRO_FACE). Its face transform
        // (rotateX(-90deg)) turns the cube's accumulated ry into a Z-spin on the label,
        // so we counter-rotate each frame to keep the word-art upright.
        // The label uses translateY(-50%) for centering — preserve it in the inline transform.
        // (The click-to-expand hint is a flat 2D overlay and needs no correction.)
        if (topFaceLabel) {
            topFaceLabel.style.transform = `translateY(-50%) rotateZ(${-curRyDeg}deg)`;
        }

        _rxRad = curRxDeg * (Math.PI / 180);
        _ryRad = curRyDeg * (Math.PI / 180);
    }

    // ── Per-face viewer dot products ──────────────────────────────────────────
    // The cube transform is rotateX(rx)·rotateY(ry) ≡ matrix M = Ry·Rx.
    // The viewer direction is +Z. The dot product of face i's outward normal with
    // the viewer equals the z-component of M·n_i. Derived analytically per face:
    //   top    n=(0, 1,0): cos(ry)·sin(rx)
    //   front  n=(0, 0,1): cos(ry)·cos(rx)
    //   right  n=(1, 0,0): −sin(ry)
    //   back   n=(0, 0,−1): −cos(ry)·cos(rx)
    //   left   n=(−1,0,0): sin(ry)
    //   bottom n=(0,−1,0): −cos(ry)·sin(rx)
    // A positive dot means the face is turning toward the viewer; used to drive
    // image opacity organically during rotation, before the face fully lands.
    const _FACE_DOT = [
        (rx, ry) =>  Math.cos(ry) * Math.sin(rx),   // 0: top
        (rx, ry) =>  Math.cos(ry) * Math.cos(rx),   // 1: front
        (rx, ry) => -Math.sin(ry),                  // 2: right
        (rx, ry) => -Math.cos(ry) * Math.cos(rx),   // 3: back
        (rx, ry) =>  Math.sin(ry),                  // 4: left
        (rx, ry) => -Math.cos(ry) * Math.sin(rx),   // 5: bottom
    ];

    function updateFaceOpacities() {
        const rx = _rxRad, ry = _ryRad;
        for (let fi = 0; fi < 6; fi++) {
            const img = faces[fi]?.querySelector('img');
            // Skip faces with no image or still running the scan-reveal animation
            // (the animation's fill-mode controls opacity while it is active).
            if (!img || !img.src || img.classList.contains('illus-img-enter')) continue;
            const dot = _FACE_DOT[fi](rx, ry);
            // Power curve: reaches ~76% opacity at dot=0.5 (face at 60° from viewer),
            // giving the image a snappy early-fade feel during the approach.
            img.style.opacity = dot > 0 ? String(Math.pow(dot, 0.4)) : '0';
        }
    }

    let lastStop         = -1;
    let lastLustColorIdx = -1;

    function updateUI(s) {
        const pct  = Math.round(s * 100);
        hudPct.textContent      = String(pct).padStart(3, '0') + '%';
        progFill.style.width    = pct + '%';

        const stop = Math.min(N - 1, Math.round(s * (N - 1)));
        if (stop === lastStop) return;
        lastStop = stop;

        // Randomise "LUST" accent color on every stop change — pick from palette,
        // never repeat the same color twice in a row.
        if (lustEl) {
            let idx;
            do { idx = Math.floor(Math.random() * FACE_COLORS.length); }
            while (idx === lastLustColorIdx);
            lastLustColorIdx = idx;
            illus.style.setProperty('--illus-lust-accent', FACE_COLORS[idx].hex);
        }

        const name   = FACE_NAMES[stop] ?? '';
        const spaced = name.split('').join(' ');

        sceneLabel.textContent   = name;
        captionNum.textContent = String(stop + 1).padStart(2, '0');
        captionName.textContent = '[ · ' + spaced + ' · ]';
        captionName.classList.remove('illus-name-glitch');
        void captionName.offsetWidth;
        captionName.classList.add('illus-name-glitch');

        imgGlitchPending = true;
        // Hide the image-name caption on the gallery-title face (stop 0 has no photo)
        tunnel.classList.toggle('illus-stop-zero', stop === 0);
        // Float title: entry animation on first reveal from stop 0; hide on return.
        if (stop === 0) {
            titleFloat.classList.remove('illus-title-float--visible');
        } else if (!titleFloat.classList.contains('illus-title-float--visible')) {
            void titleFloat.offsetWidth;
            titleFloat.classList.add('illus-title-float--visible');
        }
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

        // Re-trigger the expand hint and float title glitch on every new image face landing
        triggerExpandHintGlitch();
        triggerTitleFloatGlitch();

        const img = face?.querySelector('img');
        if (!img) return;

        // If the image faded in organically during the approach rotation (opacity > 0.85),
        // skip the clip-reveal scan — it would clip an already-visible image to black
        // and sweep it back in, which is jarring. The scan LINE still fires for tactile
        // landing feedback. For fast button/dot navigation the image is still dark,
        // so we play the full reveal as before.
        const alreadyVisible = parseFloat(img.style.opacity) > 0.85;

        img.classList.remove('illus-img-enter');
        if (scanLine) scanLine.classList.remove('illus-scan-active');
        void face.offsetWidth;
        if (!alreadyVisible) img.classList.add('illus-img-enter');
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

    const _MONO = "'Courier New', monospace";

    const ILLUS_TEXTS = {
        en: {
            expand: '[ · c l i c k | t o | e x p a n d · ]',
            info: {
                header: '[ \xb7 HOW TO USE \xb7 ]',
                steps: [
                    { num: '01', action: 'SCROLL',     desc: 'browse images'   },
                    { num: '02', action: 'ENTER',       desc: 'start gallery'   },
                    { num: '03', action: 'BACK / NEXT', desc: 'navigate pieces' },
                    { num: '04', action: '●●● DOTS',    desc: 'jump to any'    },
                    { num: '05', action: 'CLICK IMAGE', desc: 'view full size'  },
                ],
                footer: 'navigate your way \xb7',
            },
        },
        es: {
            expand: '[ · c l i c | p a r a | e x p a n d i r · ]',
            info: {
                header: '[ \xb7 CÓMO USAR \xb7 ]',
                steps: [
                    { num: '01', action: 'DESPLAZA',    desc: 'navega imágenes' },
                    { num: '02', action: 'ENTRAR',      desc: 'inicia galería'  },
                    { num: '03', action: 'ATRÁS / SIG', desc: 'navega piezas'   },
                    { num: '04', action: '●●● PUNTOS',  desc: 'salta a imagen'  },
                    { num: '05', action: 'CLIC IMAGEN', desc: 'ver tamaño real' },
                ],
                footer: 'navega a tu manera \xb7',
            },
        },
    };


    // Flat 2D overlay — sits outside the 3D cube context so it is always upright
    // and always at the viewer-space bottom of the cube. Hidden at stop 0 via CSS
    // (.illus-stop-zero is toggled by updateUI) so it only shows with an active photo.
    const expandHint = document.createElement('div');
    expandHint.className = 'illus-expand-hint glitch-text subtitle-glitch';
    expandHint.setAttribute('data-splitting', '');
    expandHint.setAttribute('aria-hidden', 'true');
    expandHint.textContent = '[ · c l i c k | t o | e x p a n d · ]';
    tunnel.appendChild(expandHint);

    // Mini floating title — behind cube (z:1), synced with hint HUD side.
    // Inherits --illus-lust-accent from #illustration via illus.style.setProperty.
    const titleFloat = document.createElement('div');
    titleFloat.className = 'illus-title-float illus-title-float--right';
    titleFloat.setAttribute('aria-hidden', 'true');
    titleFloat.innerHTML =
        '<span class="illus-title-float-line" data-splitting>[ · I L</span>' +
        '<span class="illus-title-float-line illus-title-float-lust" data-splitting>L U S T</span>' +
        '<span class="illus-title-float-line illus-title-float-in" data-splitting>R A T</span>' +
        '<span class="illus-title-float-line illus-title-float-in" data-splitting>I O N · ]</span>';
    tunnel.appendChild(titleFloat);

    let titleFloatSplit = false;
    function triggerTitleFloatGlitch() {
        if (!window.Splitting) return;
        if (!titleFloatSplit) {
            titleFloatSplit = true;
            titleFloat.querySelectorAll('[data-splitting]').forEach(span => {
                const results = window.Splitting({ target: span, by: 'chars' });
                results.forEach(result => {
                    result.chars.forEach(char => {
                        char.style.setProperty('--count', String(Math.random() * 5 + 1));
                        for (let g = 0; g < 10; g++) {
                            const r = _GLITCH_CHARS[Math.floor(Math.random() * _GLITCH_CHARS.length)];
                            char.style.setProperty(`--char-${g}`, `"${r}"`);
                        }
                    });
                });
            });
            return;
        }
        titleFloat.classList.add('illus-glitch-reset');
        void titleFloat.offsetWidth;
        titleFloat.classList.remove('illus-glitch-reset');
    }

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
        strip.classList.toggle('illus-strip--right', hintRight);
        strip.classList.toggle('illus-strip--left',  !hintRight);
        const isVisible = titleFloat.classList.contains('illus-title-float--visible');
        const wasRight  = titleFloat.classList.contains('illus-title-float--right');
        if (isVisible && wasRight !== hintRight) {
            // Side switch while visible — brief crossfade then reposition
            titleFloat.style.cssText = 'opacity:0;transition:opacity 0.15s ease';
            setTimeout(() => {
                titleFloat.classList.toggle('illus-title-float--right', hintRight);
                titleFloat.classList.toggle('illus-title-float--left',  !hintRight);
                titleFloat.style.cssText = '';
            }, 150);
        } else {
            titleFloat.classList.toggle('illus-title-float--right', hintRight);
            titleFloat.classList.toggle('illus-title-float--left',  !hintRight);
        }
    }

    const _GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

    function buildInfoPanelSVG(lang) {
        const t = (ILLUS_TEXTS[lang] || ILLUS_TEXTS.en).info;
        return (
            '<svg class="illus-info-interface-svg" viewBox="0 0 564.09 406.8" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
            '<defs><clipPath id="illus-inf-bg-clip">' +
            '<path d="M10.47,239.39c0,36.11,0,72.21,0,108.12,0,7.59-9.47,14.36-9.47,21.95v25.23s529.07,0,529.07,0l15.34-16-.13-.21V1c-177.56,0-355.11,0-532.67,0L1,21.32v204.24l9.47,13.83Z"/>' +
            '</clipPath></defs>' +
            '<rect x="0" y="0" width="564.09" height="406.8" fill="#001219" fill-opacity="0.35" clip-path="url(#illus-inf-bg-clip)"/>' +
            '<path d="M10.47,239.39c0,36.11,0,72.21,0,108.12,0,7.59-9.47,14.36-9.47,21.95v25.23s529.07,0,529.07,0l15.34-16-.13-.21V1c-177.56,0-355.11,0-532.67,0L1,21.32v204.24l9.47,13.83Z" fill="none" stroke="#EE9B00" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>' +
            '<polygon points="158.13 394.69 169.28 406.8 365.68 406.8 378.21 394.69 158.13 394.69" fill="#EE9B00"/>' +
            '<polygon points="545.41 162.3 564.09 149.42 564.09 16.17 545.28 1 545.41 162.3" fill="#EE9B00"/>' +
            '<text x="30" y="42" font-family="' + _MONO + '" font-size="25" fill="#EE9B00" letter-spacing="1">' + t.header + '</text>' +
            '<line x1="14" y1="54" x2="530" y2="54" stroke="#EE9B00" stroke-width="1" opacity="0.35"/>' +
            '<text x="30" y="84" font-family="' + _MONO + '" font-size="25" fill="#EE9B00">\xb7 01 \xb7 ' + t.steps[0].action + '</text>' +
            '<text x="30" y="106" font-family="' + _MONO + '" font-size="20" fill="#EE9B00" opacity="0.65">       ' + t.steps[0].desc + '</text>' +
            '<text x="30" y="140" font-family="' + _MONO + '" font-size="25" fill="#EE9B00">\xb7 02 \xb7 ' + t.steps[1].action + '</text>' +
            '<text x="30" y="162" font-family="' + _MONO + '" font-size="20" fill="#EE9B00" opacity="0.65">       ' + t.steps[1].desc + '</text>' +
            '<text x="30" y="196" font-family="' + _MONO + '" font-size="25" fill="#EE9B00">\xb7 03 \xb7 ' + t.steps[2].action + '</text>' +
            '<text x="30" y="218" font-family="' + _MONO + '" font-size="20" fill="#EE9B00" opacity="0.65">       ' + t.steps[2].desc + '</text>' +
            '<text x="30" y="252" font-family="' + _MONO + '" font-size="25" fill="#EE9B00">\xb7 04 \xb7 ' + t.steps[3].action + '</text>' +
            '<text x="30" y="274" font-family="' + _MONO + '" font-size="20" fill="#EE9B00" opacity="0.65">       ' + t.steps[3].desc + '</text>' +
            '<text x="30" y="308" font-family="' + _MONO + '" font-size="25" fill="#EE9B00">\xb7 05 \xb7 ' + t.steps[4].action + '</text>' +
            '<text x="30" y="330" font-family="' + _MONO + '" font-size="20" fill="#EE9B00" opacity="0.65">       ' + t.steps[4].desc + '</text>' +
            '<line x1="14" y1="352" x2="530" y2="352" stroke="#EE9B00" stroke-width="1" opacity="0.35"/>' +
            '<text x="30" y="376" font-family="' + _MONO + '" font-size="20" fill="#EE9B00" opacity="0.65">  ' + t.footer + '</text>' +
            '</svg>'
        );
    }

    function applyIllusLang(lang) {
        const t = ILLUS_TEXTS[lang] || ILLUS_TEXTS.en;

        const wasExpandSplit = expandHintSplit;
        expandHint.textContent = t.expand;
        expandHintSplit = false;
        if (wasExpandSplit) triggerExpandHintGlitch();

    }

    document.addEventListener('languagechanged', e => {
        applyIllusLang(e.detail.lang);
    });


    function startIntroElecFlicker() {
        const steps = [];
        let elapsed = 80; // start after cube scale-in begins
        while (elapsed < 1400) {
            steps.push(elapsed);
            elapsed += 55 + Math.random() * 130;
        }
        steps.push(elapsed); // final step — always ends off

        steps.forEach((delay, i) => {
            const isLast = i === steps.length - 1;
            const on     = isLast ? false : Math.random() > 0.4;
            setTimeout(() => {
                tunnel.classList.toggle('illus-electric-active', on);
                if (on && electricNoise) {
                    electricNoise.setAttribute('seed', (Math.random() * 500 | 0) + 1);
                }
            }, delay);
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
        startIntroElecFlicker();
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
        updateFaceOpacities();
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
