(function () {
    'use strict';

    const IMAGES = [
        'images/illustration/sergio-ayala-themberchaud-dnd-dragon-concept-art.webp', // stop 0 — gallery title face; image hidden behind label
        'images/illustration/sergio-ayala-themberchaud-dnd-dragon-concept-art.webp',
        'images/illustration/sergio-ayala-hada-de-los-andes-andean-fairy-illustration-2024.webp',
        'images/illustration/meninas/sergio-ayala-meninas-canido-tarot-illustration-ferrol-2024.webp',
        'images/illustration/sergio-ayala-rocker-ghost-geisha-yurei-illustration-2024.webp',
        'images/illustration/sergio-ayala-mujer-crustaceo-surrealist-mixed-media-2014.webp',
        'images/illustration/faber castell/sergio-ayala-reconciliacion-watercolor-digital-2014.webp',
        'images/illustration/draconic love/sergio-ayala-draconic-love-dragon-illustration-2019.webp',
        'images/illustration/sergio-ayala-colibri-hummingbird-surrealist-mixed-media-2024.webp',
        'images/illustration/sergio-ayala-illustration-muse-mixed-media-2024.webp',
        'images/illustration/sergio-ayala-photography-fujifilm-camera-mixed-media-2024.webp',
        'images/illustration/sergio-ayala-web-design-cyborg-mixed-media-2024.webp',
        'images/art-direction/quindiorellanas/sergio-ayala-quindiorellanas-hugo-molly-mascot-characters-colombia.webp',
    ];

    const FACE_NAMES = IMAGES.map(src =>
        src.split('/').pop().replace(/\.[^.]+$/, '').toUpperCase()
    );

    // Stop 0 is the section intro (no photo yet) — show the gallery title in the
    // HUD instead of the first image's filename.
    const INTRO_LABEL = '· S e r g i o  A y a l a ·   I L L U S T R A T I O N   -   G A L L E R Y';


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
    const faces       = [...illus.querySelectorAll('.illus-face')];
    const hudPct      = illus.querySelector('.illus-hud-pct');
    const progFill    = illus.querySelector('.illus-progress-fill');
    const sceneLabel  = illus.querySelector('.illus-scene-label');
    const dots        = [...illus.querySelectorAll('.illus-dot')];
    const strip       = illus.querySelector('.illus-strip');
    const infoSvg     = illus.querySelector('.illus-info-svg');
    const lustEl      = illus.querySelector('.illus-lust-accent');

    // Scale section height to number of images. Scroll progress is normalized to
    // offsetHeight (see _update), so a shorter per-stop height on phones just
    // makes the cube scroll brisker without breaking the choreography.
    // Phone perf mode: skip per-frame writes to HUD nodes hidden by
    // responsive.css, the electric-border driver (its faces are display:none on
    // phones), the Splitting.js glitches on hidden hint/title, and DOM writes
    // while the cube is parked. Desktop path is untouched.
    const IS_MOBILE = !!(App.BrowserDetect && App.BrowserDetect.isMobile);
    const stopVh = IS_MOBILE ? 65 : 100;
    // Reserve a frozen exit band at the very end of the section. The tunnel stays
    // pinned through this band (the section bottom hasn't reached the viewport
    // bottom yet), so while scrolling it the entrance choreography plays in
    // reverse — text/SVG slide back out, the cube shrinks away — leaving only the
    // background before #contact finally scrolls up.
    const EXIT_VH    = stopVh;   // frozen band where illustration content slides out
    const HANDOFF_VH = stopVh;   // frozen band for the cross-dissolve into #contact
    const totalVh    = N * stopVh + EXIT_VH + HANDOFF_VH;
    illus.style.height = totalVh + 'vh';
    // Raw scroll milestones (fractions of the section's scroll range):
    //   [0, GALLERY_END]             cube gallery (progress fed = raw / GALLERY_END)
    //   [GALLERY_END, HANDOFF_START] frozen exit — content slides out, bg only
    //   [HANDOFF_START, 1]           frozen cross-dissolve into #contact
    const GALLERY_END   = (N * stopVh) / totalVh;
    const HANDOFF_START = (N * stopVh + EXIT_VH) / totalVh;
    const contactEl = document.getElementById('contact');

    // ── Scroll-driven cube rotation — phone progressive enhancement ─────────
    // On phones whose engine supports CSS scroll-driven animations, the cube
    // rotation is compiled into a generated @keyframes (one stop per keyframe,
    // offsets baked against GALLERY_END) bound to a view-timeline on
    // #illustration, so it runs entirely on the compositor and stays smooth
    // even when the main thread is busy. JS keeps driving everything else
    // (image swaps, face opacities, UI, entrance/exit/handoff) and simply
    // stops writing cube.style.transform; its smoothing snaps to the raw
    // scroll value so labels/opacities stay in lockstep with the CSS timeline.
    // Engines without support keep the original RAF-driven rotation. Desktop
    // never sees any of this: IS_MOBILE gate + the injected rules live inside
    // a max-width media query. The `contain` range of a view-timeline equals
    // getProgress() for a taller-than-viewport subject (top hits viewport top
    // → bottom hits viewport bottom).
    // window.CSS explicitly: script.js declares a top-level `const CSS = {…}`
    // that shadows the native CSS object for every classic script on the page.
    const SCROLL_DRIVEN = IS_MOBILE && window.CSS && window.CSS.supports &&
        window.CSS.supports('animation-timeline: view()');
    if (SCROLL_DRIVEN) {
        // ≈ the JS easeIO quadratic in-out, applied per keyframe interval.
        const EASE = 'cubic-bezier(0.45, 0, 0.55, 1)';
        const frames = STOPS.map((s, i) =>
            `${((i / (N - 1)) * GALLERY_END * 100).toFixed(4)}% { transform: rotateX(${s.rx}deg) rotateY(${s.ry}deg); }`
        );
        // Hold the last stop through the frozen exit + handoff bands.
        const last = STOPS[N - 1];
        frames.push(`100% { transform: rotateX(${last.rx}deg) rotateY(${last.ry}deg); }`);
        const st = document.createElement('style');
        st.textContent =
            '@media (max-width: 768px) {\n' +
            '  #illustration { view-timeline: --illus-cube-tl block; }\n' +
            `  @keyframes illus-cube-scroll-rotate {\n  ${frames.join('\n  ')}\n  }\n` +
            '  #illustration .illus-cube {\n' +
            `    animation: illus-cube-scroll-rotate ${EASE} both;\n` +
            '    animation-timeline: --illus-cube-tl;\n' +
            '    animation-range: contain 0% contain 100%;\n' +
            '  }\n' +
            '}\n';
        document.head.appendChild(st);
    }

    // Auto-handoff: once the gallery has slid out (raw past GALLERY_END) leaving
    // only the particle background, drive the cross-dissolve into #contact on a
    // timer so a *stopped* scroll never parks the viewport on the bare background.
    // Manual scroll still overrides — the handoff is fed the MAX of the scroll-
    // linked and the time-driven progress, so scrubbing forward/back stays exact.
    const EXIT_HOLD_MS    = 650;   // ≈ the slide-out choreography duration
    const AUTO_HANDOFF_MS = 900;   // cross-dissolve fade duration

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
    // Phone-only cache of each face's <img> so updateFaceOpacities doesn't run
    // 6 querySelectors per RAF frame. Written in setFaceImage, read when IS_MOBILE.
    const faceImgEls = new Array(6).fill(null);

    // Returns the CSS transform needed to counter the cube's accumulated rotation
    // so each image always appears right-side-up to the viewer.
    //
    // - Side faces (front/right/left): rotateY never affects the vertical axis → no correction.
    // - Back face: only ever visible at ry≡180°, where the cube's rotateY(180) exactly
    //   cancels the face's own authored rotateY(180) (Ry(180)·Ry(180)=identity) → no
    //   correction. (A scaleX(-1) here would MIRROR an already-correct image.)
    // - Top face (rx=90): accumulated ry tilts the image; correction = rotateZ(-ry).
    // - Bottom face (rx=-90): same but opposite sign → rotateZ(+ry).
    function getFaceCorrection(faceIdx, stopIdx) {
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

    // ── Process thumbnails overlaid on a piece's cube face ────────────────────
    // Some pieces carry extra process/proof images (sketches, press clippings,
    // award certificates). They stack in a column on the side OPPOSITE the text
    // card (card is --right on odd stops, so thumbs go left on odd stops, right
    // on even), ride the same 3D face so they rotate with it, and show only while
    // that face displays the piece. Clicks: thumbs sit outside the cube clickzone
    // so a direct handler works (clickzone hit-test below is a fallback).
    const THUMB_SETS = [
        { match: 'meninas-canido-tarot-illustration', dir: 'images/illustration/meninas/', items: [
            { base: 'sergio-ayala-meninas-canido-tarot-sketch-process-ferrol-2024', alt: 'Meninas de Canido — tarot concept sketch (process) by Sergio Ayala, 2024' },
            { base: 'sergio-ayala-meninas-canido-la-voz-de-galicia-press-2024',      alt: 'Meninas de Canido — featured in La Voz de Galicia, 2024' },
            { base: 'sergio-ayala-holy-vandal-canido-baroque-concept-art-2024',      alt: 'Holy Vandal — Meninas de Canido concept (process) by Sergio Ayala, 2024' },
        ]},
        { match: 'reconciliacion-watercolor-digital', dir: 'images/illustration/faber castell/', items: [
            { base: 'sergio-ayala-reconciliacion-faber-castell-award-certificate-2014', alt: 'Reconciliación — Faber-Castell IV National Drawing Contest certificate, 2014' },
        ]},
        { match: 'draconic-love-dragon-illustration', dir: 'images/illustration/draconic love/', inset: true, items: [
            { base: 'sergio-ayala-draconic-love-tshirt-mockup-2019',        alt: 'Draconic Love — t-shirt merchandise mockup by Sergio Ayala, 2019' },
            { base: 'sergio-ayala-draconic-love-tote-bag-mockup-2019',      alt: 'Draconic Love — tote bag merchandise mockup by Sergio Ayala, 2019' },
            { base: 'sergio-ayala-draconic-love-merchandise-mockup-2019',   alt: 'Draconic Love — merchandise collection mockup by Sergio Ayala, 2019' },
            { base: 'sergio-ayala-draconic-love-merchandise-web-banner-2019', alt: 'Draconic Love — merchandise web banner by Sergio Ayala, 2019' },
        ]},
    ];
    const thumbWraps = [];   // { wrap, stop, face }
    let   thumbEls   = [];
    // Stops whose main image must inset (shrink + hug the far side) so it clears a
    // tall thumb column. Value = the side the thumb column sits on.
    const insetStops = {};   // stop -> 'left' | 'right'
    THUMB_SETS.forEach(set => {
        const stop = IMAGES.findIndex(s => s.includes(set.match));
        if (stop < 0) return;
        const face = FACE_MAP[stop];
        if (set.inset) insetStops[stop] = (stop % 2 === 0 ? 'right' : 'left');
        const wrap = document.createElement('div');
        // Thumbs opposite the text card: card is --right on odd stops → thumbs left;
        // even stops → card left → thumbs right.
        wrap.className = 'illus-face-thumbs' + (stop % 2 === 0 ? ' illus-face-thumbs--right' : '');
        set.items.forEach(t => {
            const el = new Image();
            el.className = 'illus-face-thumb';
            el.src = `${set.dir}${t.base}-thumb.webp`;
            el.alt = t.alt;
            el.loading = 'lazy';
            el.dataset.full = `${set.dir}${t.base}.webp`;
            el.dataset.alt  = t.alt;
            // Click is handled by a capture-phase hit-test on the tunnel (see below),
            // not a per-element handler: Chromium doesn't reliably deliver pointer
            // events to children of a 3D-rotated face (works for the front face only).
            wrap.appendChild(el);
            thumbEls.push(el);
        });
        faces[face].appendChild(wrap);
        thumbWraps.push({ wrap, stop, face });
    });

    async function setFaceImage(faceIdx, imgIdx) {
        if (faceImgIdx[faceIdx] === imgIdx) return;
        faceImgIdx[faceIdx] = imgIdx;

        // Toggle any process-thumbnail column bound to this face by image identity.
        thumbWraps.forEach(tw => {
            if (tw.face === faceIdx) tw.wrap.classList.toggle('is-visible', imgIdx === tw.stop);
        });

        // Stop 0 reclaims the gallery-title face: clear photo and restore title label
        if (faceIdx === INTRO_FACE && imgIdx === 0) {
            const staleImg = faces[INTRO_FACE].querySelector('img.illus-main-img');
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
        let img = faces[faceIdx].querySelector('img.illus-main-img');
        if (!img) { img = new Image(); img.className = 'illus-main-img'; faces[faceIdx].appendChild(img); }
        if (IS_MOBILE) faceImgEls[faceIdx] = img;
        // Release any forwards-fill from a previous scan animation so the per-frame
        // dot-product opacity can take back control of this face's image.
        img.classList.remove('illus-img-enter');
        // Inset the main image when this stop carries a tall thumb column, so the
        // artwork shrinks and hugs the far side instead of overlapping the thumbs.
        img.classList.remove('illus-main-img--inset-left', 'illus-main-img--inset-right');
        if (insetStops[imgIdx]) img.classList.add('illus-main-img--inset-' + insetStops[imgIdx]);
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
        // Scroll-driven phones: the CSS timeline owns the cube transform; JS
        // still computes the angles below for the label counter-rotation and
        // the per-face opacity dot products.
        if (!SCROLL_DRIVEN) {
            cube.style.transform = `rotateX(${curRxDeg}deg) rotateY(${curRyDeg}deg)`;
        }

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
            const img = IS_MOBILE ? faceImgEls[fi]
                                  : faces[fi]?.querySelector('img.illus-main-img');
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
        // Phone: the whole HUD (pct, progress bar, scene label) is display:none
        // in responsive.css — skip its per-frame DOM writes (they still cost a
        // style recalc on hidden nodes).
        if (!IS_MOBILE) {
            const pct  = Math.round(s * 100);
            hudPct.textContent      = String(pct).padStart(3, '0') + '%';
            progFill.style.width    = pct + '%';
        }

        const stop = Math.min(N - 1, Math.round(s * (N - 1)));
        if (stop === lastStop) return;
        lastStop = stop;

        // Randomise "LUST" accent color on every stop change — pick from palette,
        // never repeat the same color twice in a row.
        if (lustEl && !IS_MOBILE) {
            let idx;
            do { idx = Math.floor(Math.random() * FACE_COLORS.length); }
            while (idx === lastLustColorIdx);
            lastLustColorIdx = idx;
            illus.style.setProperty('--illus-lust-accent', FACE_COLORS[idx].hex);
        }

        const name   = FACE_NAMES[stop] ?? '';
        const spaced = name.split('').join(' ');

        // Phone: the scene label lives in the hidden HUD — skip the write.
        if (!IS_MOBILE) sceneLabel.textContent = stop === 0 ? INTRO_LABEL : name;

        imgGlitchPending = true;
        // Hide the image-name caption on the gallery-title face (stop 0 has no photo)
        tunnel.classList.toggle('illus-stop-zero', stop === 0);
        if (!tunnel.classList.contains('illus-info-revealed')) {
            tunnel.classList.add('illus-info-revealed');
        }
        // Phone: float title, hint/strip sides and nav dots are display:none in
        // responsive.css — skip their DOM work entirely.
        if (!IS_MOBILE) {
            // Float title: entry animation on first reveal from stop 0; hide on return.
            if (stop === 0) {
                titleFloat.classList.remove('illus-title-float--visible');
            } else if (!titleFloat.classList.contains('illus-title-float--visible')) {
                void titleFloat.offsetWidth;
                titleFloat.classList.add('illus-title-float--visible');
            }
            setHintSide(stop);
            allDots.forEach((d, i)  => d.classList.toggle('active', i === stop));
        }
        allSections.forEach((sec, i) => sec.classList.toggle('active', i === stop));
    }

    function gotoSlide(idx) {
        const illusTop = illus.getBoundingClientRect().top + window.scrollY;
        const total    = illus.offsetHeight - window.innerHeight;
        // Stops live in the [0, GALLERY_END] portion of the scroll range; the
        // remainder is the frozen exit band.
        const targetY  = illusTop + (Math.max(0, Math.min(N - 1, idx)) / (N - 1)) * total * GALLERY_END;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    let tgt    = Math.min(getProgress() / GALLERY_END, 1);
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

        // Re-trigger the expand hint and float title glitch on every new image face landing.
        // Phone: the hint stays visible (owner 2026-07-10) so its glitch fires
        // too; the float title is display:none — skip its Splitting.js work.
        triggerExpandHintGlitch();
        if (!IS_MOBILE) triggerTitleFloatGlitch();

        const img = face?.querySelector('img.illus-main-img');
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
    let prevSmooth    = smooth;
    let lastAppliedSmooth = -1;   // phone idle short-circuit (see frame loop)
    let introSeenOnce     = false;  // both stages fired — entrance complete
    let stageContentFired = false;  // Stage A (text + SVG) latched at 40% coverage
    let stageCubeFired    = false;  // Stage B (3D cube) latched at 90% coverage
    let exiting           = false;  // inside the frozen exit band (reverse choreography)
    let handoffActive     = false;  // frozen cross-dissolve into #contact is running
    let autoHandoffStart  = 0;      // ts (ms) the exit band was entered; 0 = idle
    const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const ILLUS_TEXTS = {
        en: { expand: '[ · c l i c k | t o | e x p a n d · ]' },
        es: { expand: '[ · c l i c | p a r a | e x p a n d i r · ]' },
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
        if (infoSvg) {
            infoSvg.classList.toggle('illus-info-svg--right', hintRight);
            infoSvg.classList.toggle('illus-info-svg--left',  !hintRight);
        }
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
                // Flow is driven by the self-animating #illus-cube-electric filter;
                // only the on/off flicker is toggled here.
                tunnel.classList.toggle('illus-electric-active', on);
            }, delay);
        });
    }

    // Cleanup run on every (re)entry / nav click. The staged entrance itself is
    // driven by viewport coverage in the frame loop (see "Staged scroll-driven
    // entrance"); .illus-intro-active is intentionally left applied as the
    // permanent Stage-0 hold that the stage classes override.
    function resetIntro() {
        elecActive = false;
        if (elecTimer) { clearTimeout(elecTimer); elecTimer = null; }
        tunnel.classList.remove('illus-electric-active');

        // Evict any stale photo and restore the gallery label — always, on every visit
        const titleFaceImg = faces[INTRO_FACE].querySelector('img.illus-main-img');
        if (titleFaceImg) {
            titleFaceImg.classList.remove('illus-img-enter');
            titleFaceImg.removeAttribute('src');
        }
        restoreGalleryLabel();
        faceImgIdx[INTRO_FACE] = -1;
    }

    // Play the full staged entrance (Stage A text/SVG → Stage B cube power-on)
    // on demand, independent of scroll coverage. The menu jumps to the section
    // instantly (coverage hits 100% in a single frame), so the coverage-based
    // trigger would collapse both stages together — this scripts them on a timer
    // so a clicked entry looks identical to a scrolled one.
    let entranceTimer = null;
    function playStagedEntrance() {
        if (entranceTimer) { clearTimeout(entranceTimer); entranceTimer = null; }

        // Re-arm to the bg-only Stage-0 baseline and take over from the
        // coverage-based trigger so it can't double-fire.
        illus.classList.remove('illus-stage-content', 'illus-stage-cube');
        stageContentFired = true;
        stageCubeFired    = false;
        introSeenOnce     = true;
        resetIntro();                       // restore gallery label, evict stale photo
        void illus.offsetWidth;             // restart the stage-content animation cleanly

        // Stage A — text + SVG slide in.
        illus.classList.add('illus-stage-content');

        // Stage B — cube powers on once the content has settled, mirroring the
        // gap the scroll path leaves between 40% and 90% coverage.
        entranceTimer = setTimeout(() => {
            stageCubeFired = true;
            illus.classList.add('illus-stage-cube');
            if (!prefersReducedMotion && !IS_MOBILE) startIntroElecFlicker();
            entranceTimer = null;
        }, 900);
    }

    document.querySelectorAll('a[href="#illustration"]').forEach(btn => {
        btn.addEventListener('click', playStagedEntrance);
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

    // Phone lightbox layout (owner 2026-07-10): large image on top, the
    // piece's title / description / links below, in a scrollable column.
    // The info is cloned at open time from the stop's hidden .illus-card, so
    // it always reflects the current i18n language. The close button moves out
    // of the (scale-transformed) frame so position:fixed can pin it to the
    // viewport while the column scrolls. Desktop lightbox is untouched.
    let lbInfo = null;
    if (IS_MOBILE) {
        lbInfo = document.createElement('div');
        lbInfo.className = 'illus-lightbox-info';
        lbInfo.hidden = true;
        lb.querySelector('.illus-lightbox-frame').appendChild(lbInfo);
        lb.appendChild(lb.querySelector('.illus-lightbox-close'));
    }

    function fillLbInfo(stop) {
        if (!lbInfo) return;
        lbInfo.innerHTML = '';
        const card = (stop != null && stop >= 1)
            ? illus.querySelector(`.illus-section[data-idx="${stop}"] .illus-card`)
            : null;
        if (!card) { lbInfo.hidden = true; return; }
        [...card.children].forEach(el => {
            if (el.classList.contains('illus-cta-row') ||
                el.classList.contains('illus-h-line')) return;
            const clone = el.cloneNode(true);
            // Flatten any Splitting.js char spans back to plain text — the
            // lightbox reads as a static caption, no per-char glitch runs here.
            if (clone.matches('[data-splitting]')) {
                clone.textContent = clone.textContent;
            }
            clone.querySelectorAll('[data-splitting]').forEach(g => {
                g.textContent = g.textContent;
            });
            lbInfo.appendChild(clone);
        });
        lbInfo.hidden = false;
    }

    // Frame scale animation uses cubic-bezier(0.34, 1.56, 0.64, 1) over 0.5s.
    // The spring overshoots before settling; 620ms covers the full settle window.
    const LB_SETTLE_MS = 620;

    function lbShow(src, alt, stop) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        fillLbInfo(stop);
        lb.scrollTop = 0;
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

    // Capture-phase hit-test for process thumbnails: works regardless of where the
    // thumb projects (in/outside the clickzone) and regardless of 3D pointer quirks,
    // because it tests click coordinates against each visible thumb's rendered rect
    // rather than relying on the event target being the 3D-transformed <img>.
    tunnel.addEventListener('click', (e) => {
        const hit = thumbEls.find(t => {
            if (!t.closest('.illus-face-thumbs')?.classList.contains('is-visible')) return false;
            const r = t.getBoundingClientRect();
            return r.width && e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
        });
        if (hit) { e.stopPropagation(); lbShow(hit.dataset.full, hit.dataset.alt); }
    }, true);

    clickZone.addEventListener('click', () => {
        const stop = Math.max(0, lastStop);
        const img  = faces[FACE_MAP[stop]]?.querySelector('img.illus-main-img');
        if (img?.src) lbShow(img.src, img.alt, stop);
    });
    clickZone.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickZone.click(); }
    });

    window.addEventListener('scroll', () => {
        tgt = Math.min(getProgress() / GALLERY_END, 1);
    }, { passive: true });

    illus.addEventListener('click', e => {
        const btn = e.target.closest('[data-goto]');
        if (!btn) return;
        gotoSlide(parseInt(btn.dataset.goto, 10));
    });

    // ── Handoff to #contact — frozen cross-dissolve ───────────────────────
    // Runs during the HANDOFF band while the section is STILL PINNED, so nothing
    // moves and nothing below scrolls into view. #contact is held as a fixed,
    // fully-opaque backdrop *behind* the section (both pinned by the compositor —
    // no JS transforms, so no scroll jitter); the section's own opacity is scrubbed
    // 1→0 to reveal it. Because contact is opaque and directly behind, there is
    // never a translucent gap that could expose other sections. #contact's own
    // IntersectionObserver fires its entrance as it's revealed. Reversible.
    // wp = cross-dissolve progress 0→1 (caller blends scroll- and time-driven).
    function updateHandoff(wp) {
        if (!contactEl) return false;

        if (wp <= 0) {
            if (handoffActive) {
                handoffActive = false;
                illus.classList.remove('illus-handoff');
                illus.style.removeProperty('opacity');
                contactEl.classList.remove('ct-handoff-in');
                // Tunnel is the interactive layer again — let the goo cursor return.
                window.dispatchEvent(new CustomEvent('illus:handoff', { detail: { active: false } }));
            }
            return false;
        }

        if (!handoffActive) {
            handoffActive = true;
            illus.classList.add('illus-handoff');      // raise section above #contact
            contactEl.classList.add('ct-handoff-in');   // fixed opaque backdrop behind
            // #contact owns input now; the tunnel is still pinned in view, so the
            // goo cursor's IntersectionObserver won't release on its own — tell it.
            window.dispatchEvent(new CustomEvent('illus:handoff', { detail: { active: true } }));
        }
        illus.style.opacity = String(1 - Math.min(1, wp)); // fade section out → reveal #contact
        return true;
    }

    let lastNow = performance.now();

    function frame(now) {
        requestAnimationFrame(frame);

        const bcr = illus.getBoundingClientRect();
        const vh  = window.innerHeight;
        const raw = getProgress(bcr);

        // Frozen cross-dissolve into #contact. Progress is the greater of the
        // scroll-linked amount (raw past HANDOFF_START) and a time-driven auto
        // amount that engages once the gallery has slid out (raw past GALLERY_END
        // + a hold for the slide-out choreography) — so a parked scroll on the
        // bare particle background still completes into #contact on its own.
        const scrollWp = raw > HANDOFF_START
            ? Math.min(1, (raw - HANDOFF_START) / (1 - HANDOFF_START))
            : 0;
        let autoWp = 0;
        if (raw > GALLERY_END) {
            if (!autoHandoffStart) autoHandoffStart = now;
            autoWp = (now - autoHandoffStart - EXIT_HOLD_MS) / AUTO_HANDOFF_MS;
        } else {
            autoHandoffStart = 0;
        }
        const handoff = updateHandoff(Math.max(scrollWp, Math.max(0, Math.min(1, autoWp))));

        // Skip all work when section is well off-screen — cheap early exit.
        // Suspended while the handoff owns the frame so the dissolve can finish;
        // a fully off-screen section also re-arms the staged entrance so the whole
        // sequence replays the next time the section is approached.
        if (!handoff && (bcr.top > vh + 100 || bcr.bottom < -100)) {
            if (introSeenOnce || stageContentFired || exiting) {
                if (entranceTimer) { clearTimeout(entranceTimer); entranceTimer = null; }
                introSeenOnce = stageContentFired = stageCubeFired = exiting = false;
                illus.classList.remove('illus-stage-content', 'illus-stage-cube', 'illus-exiting');
            }
            return;
        }

        const dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow  = now;

        tgt = Math.min(raw / GALLERY_END, 1);   // gallery completes at GALLERY_END

        // ── Frozen exit ───────────────────────────────────────────────────
        // Past GALLERY_END the gallery is finished but the tunnel is still
        // pinned, so the section is frozen in place. Toggle .illus-exiting to
        // play the reverse choreography (content slides out, cube shrinks away,
        // leaving only the background) before the section unpins into #contact.
        const inExitBand = raw > GALLERY_END + 0.001;
        if (inExitBand !== exiting) {
            exiting = inExitBand;
            illus.classList.toggle('illus-exiting', exiting);
        }

        // ── Staged scroll-driven entrance ─────────────────────────────────
        // coverage = the share of the viewport this section occupies as it
        // rises over the photo curtain (bottom-up). It equals the photo
        // reveal's exitProgress, but measured from our own rect so the section
        // stays self-contained. Stage A (text + SVG) latches at 40% coverage,
        // Stage B (the 3D cube) at 90%. Each stage fires once and holds.
        if (!introSeenOnce) {
            const coverage = (window.innerHeight - bcr.top) / window.innerHeight;
            if (!stageContentFired && coverage >= 0.40) {
                stageContentFired = true;
                resetIntro();                       // restore label, evict stale photo
                illus.classList.add('illus-stage-content');
            }
            if (!stageCubeFired && coverage >= 0.90) {
                stageCubeFired = true;
                illus.classList.add('illus-stage-cube');
                if (!prefersReducedMotion && !IS_MOBILE) startIntroElecFlicker();
                introSeenOnce = true;               // entrance complete — latch
            }
        }

        if (SCROLL_DRIVEN) {
            // The CSS timeline rotates the cube off the raw scroll value (native
            // momentum already smooths touch scrolling) — keep the JS state in
            // lockstep so swaps/opacities/glitches don't trail the rotation.
            smooth = tgt;
        } else {
            smooth += (tgt - smooth) * (1 - Math.exp(-dt * 8));
            smooth  = Math.max(0, Math.min(1, smooth));
        }

        // Phone idle short-circuit: snap the asymptotic tail of the ease, then
        // skip every per-frame DOM write while the cube is parked on a stop —
        // no transform/opacity/class churn between scrolls. Desktop unchanged.
        if (IS_MOBILE) {
            if (Math.abs(tgt - smooth) < 0.0004) smooth = tgt;
            if (smooth === lastAppliedSmooth && !imgGlitchPending) return;
            lastAppliedSmooth = smooth;
        }

        // Phone: the electric-border faces are display:none in responsive.css —
        // skip the velocity tracking + class/timer churn that drives them.
        if (!IS_MOBILE) {
            const vel = Math.abs(smooth - prevSmooth);
            prevSmooth = smooth;
            if (vel > 0.0002) { elecOn(); } else if (elecActive) { elecOff(); }
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
