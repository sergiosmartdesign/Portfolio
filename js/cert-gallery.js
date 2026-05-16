(function () {
    'use strict';

    const CERTS = [
        { src: 'images/cert/certificadoplatzi1.png', alt: 'Platzi Professional Certificate 1 — Sergio Ayala' },
        { src: 'images/cert/certificadoplatzi2.png', alt: 'Platzi Professional Certificate 2 — Sergio Ayala' },
        { src: 'images/cert/certificadoplatzi3.png', alt: 'Platzi Professional Certificate 3 — Sergio Ayala' },
        { src: 'images/cert/certificadoplatzi4.png', alt: 'Platzi Professional Certificate 4 — Sergio Ayala' },
        { src: 'images/cert/certificadoplatzi5.png', alt: 'Platzi Professional Certificate 5 — Sergio Ayala' },
        { src: 'images/cert/certificadoplatzi6.png', alt: 'Platzi Professional Certificate 6 — Sergio Ayala' },
        { src: 'images/cert/certificadoyoast1.png',  alt: 'Yoast SEO Professional Certificate 1 — Sergio Ayala' },
        { src: 'images/cert/certificadoyoast2.png',  alt: 'Yoast SEO Professional Certificate 2 — Sergio Ayala' },
        { src: 'images/cert/certificadoyoast3.png',  alt: 'Yoast SEO Professional Certificate 3 — Sergio Ayala' },
    ];

    const N           = CERTS.length;
    const SWAP_RADIUS = 2;

    // Same seeded PRNG as illus-cube, different seed so sequences diverge
    function mulberry32(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const rand = mulberry32(0xC3D4E5F6);

    // Builds N distinct cube orientation stops using random 90-degree moves.
    // Same algorithm as illus-cube: stays within rx ∈ [-90, 90], never returns
    // to rx=90 after stop 0 so the top face always maps to the first cert.
    function buildStops(n) {
        const MOVES = [
            { drx: -90, dry:   0 }, { drx: +90, dry:   0 },
            { drx:   0, dry: -90 }, { drx:   0, dry: +90 },
            { drx: -90, dry: -90 }, { drx: +90, dry: +90 },
            { drx: -90, dry: +90 }, { drx: +90, dry: -90 },
        ];
        const stops = [{ rx: 90, ry: 0 }];
        let rx = 90, ry = 0;
        for (let i = 1; i < n; i++) {
            const atPole = rx === 90 || rx === -90;
            const valid  = MOVES.filter(m => {
                const newRx = rx + m.drx;
                return newRx >= -90 && newRx <= 90 && newRx !== 90 && (!atPole || m.drx !== 0);
            });
            const move = valid[Math.floor(rand() * valid.length)];
            rx += move.drx;
            ry += move.dry;
            stops.push({ rx, ry });
        }
        return stops;
    }

    // Maps each stop index to which of the 6 physical faces (0–5) is front-facing.
    // Face indices match DOM order: top(0), front(1), right(2), back(3), left(4), bottom(5).
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

    const STOPS    = buildStops(N);
    const FACE_MAP = buildFaceMap(STOPS);

    // ── DOM ────────────────────────────────────────────────────────────────────
    const wrapper = document.querySelector('.cert-cube-wrapper');
    if (!wrapper) return;

    const cubeEl    = wrapper.querySelector('.cert-cube');
    const faces     = [...wrapper.querySelectorAll('.cert-face')];
    const prevBtn   = wrapper.querySelector('.cert-prev');
    const nextBtn   = wrapper.querySelector('.cert-next');
    const counterEl = wrapper.querySelector('.cert-counter');
    const scene     = wrapper.querySelector('.cert-cube-scene');

    const modal       = document.getElementById('certModal');
    const modalImage  = document.getElementById('certModalImage');
    const modalClose  = document.querySelector('.cert-modal-close');
    const modalBg     = document.querySelector('.cert-modal-backdrop');

    // ── Image preloading ───────────────────────────────────────────────────────
    const imgCache = new Map();

    function preloadImage(src) {
        if (imgCache.has(src)) return imgCache.get(src);
        const p = new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => resolve(img);
            img.src = src;
        });
        imgCache.set(src, p);
        return p;
    }

    CERTS.forEach(c => preloadImage(c.src));

    const faceImgIdx = new Array(6).fill(-1);

    // Mirrors illus-cube's getFaceCorrection logic:
    // back face (3) is rotated 180° around Y → image appears flipped → scaleX(-1).
    // top (0) and bottom (5) accumulate the cube's ry as a Z-spin on the face content
    // because rotateX(±90deg) folds ry into a roll → counter-rotate to keep certs upright.
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

    async function setFaceImage(faceIdx, certIdx) {
        if (faceImgIdx[faceIdx] === certIdx) return;
        faceImgIdx[faceIdx] = certIdx;

        const cert = CERTS[certIdx];
        await preloadImage(cert.src);
        if (faceImgIdx[faceIdx] !== certIdx) return; // superseded by a later call

        let img = faces[faceIdx].querySelector('img');
        if (!img) { img = new Image(); faces[faceIdx].appendChild(img); }

        img.classList.remove('cert-img-loaded');
        img.alt = cert.alt;
        img.src = cert.src;
        img.style.transform = getFaceCorrection(faceIdx, certIdx);

        if (img.complete && img.naturalWidth) {
            img.classList.add('cert-img-loaded');
        } else {
            img.onload = () => img.classList.add('cert-img-loaded');
        }
    }

    // Assigns images to faces near the given stop so the correct cert is
    // visible on each face both before and after the cube rotates.
    function checkImageSwaps(stop) {
        const assigned = new Set();
        for (let dist = 0; dist <= SWAP_RADIUS; dist++) {
            for (const offset of (dist === 0 ? [0] : [-dist, dist])) {
                const si = stop + offset;
                if (si < 0 || si >= N) continue;
                const f = FACE_MAP[si];
                if (!assigned.has(f)) {
                    assigned.add(f);
                    setFaceImage(f, si);
                }
            }
        }
    }

    // ── Navigation ─────────────────────────────────────────────────────────────
    let currentStop = 0;

    function gotoStop(idx) {
        currentStop = ((idx % N) + N) % N;
        const { rx, ry } = STOPS[currentStop];
        cubeEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        checkImageSwaps(currentStop);
        if (counterEl) {
            counterEl.textContent =
                String(currentStop + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
        }
    }

    prevBtn?.addEventListener('click', () => gotoStop(currentStop - 1));
    nextBtn?.addEventListener('click', () => gotoStop(currentStop + 1));

    document.addEventListener('keydown', e => {
        // Only intercept arrows if the cert area is in viewport
        if (!wrapper) return;
        const bcr = wrapper.getBoundingClientRect();
        if (bcr.bottom < 0 || bcr.top > window.innerHeight) return;

        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeModal();
            return;
        }
        if (e.key === 'ArrowLeft')  gotoStop(currentStop - 1);
        if (e.key === 'ArrowRight') gotoStop(currentStop + 1);
    });

    // ── Modal ──────────────────────────────────────────────────────────────────
    function openModal(src, alt) {
        if (!modal || !modalImage) return;
        modalImage.src = src;
        modalImage.alt = alt || '';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        setTimeout(() => { if (modal.classList.contains('hidden')) modalImage.src = ''; }, 300);
        document.body.style.overflow = '';
    }

    // Click on the cube scene opens the current cert in the modal
    scene?.addEventListener('click', () => {
        const img = faces[FACE_MAP[currentStop]]?.querySelector('img');
        if (img?.src && img.classList.contains('cert-img-loaded')) openModal(img.src, img.alt);
    });
    scene?.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scene.click(); }
    });

    modalClose?.addEventListener('click', closeModal);
    modalBg?.addEventListener('click', closeModal);

    // ── Init ───────────────────────────────────────────────────────────────────
    checkImageSwaps(0);
    cubeEl.style.transform = `rotateX(${STOPS[0].rx}deg) rotateY(${STOPS[0].ry}deg)`;
    if (counterEl) counterEl.textContent = '01 / ' + String(N).padStart(2, '0');

    window.certCube = {
        goto: gotoStop,
        next: () => gotoStop(currentStop + 1),
        prev: () => gotoStop(currentStop - 1),
    };

}());
