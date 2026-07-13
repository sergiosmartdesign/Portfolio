/* bundle-c.js — concatenated app bundle (load order preserved). Sources in git history. */

;
/* ===== cert-gallery.js ===== */
(function () {
    'use strict';

    const CERTS = [
        { src: 'images/cert/sergio-ayala-platzi-software-engineering-fundamentals-certificate-2025.webp', alt: 'Sergio Ayala — Platzi Certificate: Software Engineering Fundamentals, September 2025' },
        { src: 'images/cert/sergio-ayala-platzi-computer-networks-internet-certificate-2025.webp',        alt: 'Sergio Ayala — Platzi Certificate: Computer Networks & Internet, September 2025' },
        { src: 'images/cert/sergio-ayala-platzi-prompt-engineering-certificate-2025.webp',                alt: 'Sergio Ayala — Platzi Certificate: Prompt Engineering & AI, August 2025' },
        { src: 'images/cert/sergio-ayala-platzi-ai-image-generation-certificate-2025.webp',               alt: 'Sergio Ayala — Platzi Certificate: AI Image Generation (Midjourney, Stable Diffusion), August 2025' },
        { src: 'images/cert/sergio-ayala-platzi-software-architecture-fundamentals-certificate-2025.webp', alt: 'Sergio Ayala — Platzi Certificate: Software Architecture Fundamentals, September 2025' },
        { src: 'images/cert/sergio-ayala-platzi-terminal-command-line-certificate-2025.webp',             alt: 'Sergio Ayala — Platzi Certificate: Terminal & Command Line (Bash, Linux), October 2025' },
        { src: 'images/cert/sergio-ayala-yoast-ecommerce-seo-certificate-2021.webp',                     alt: 'Sergio Ayala — Yoast SEO Academy Certificate: Ecommerce SEO, October 2021' },
        { src: 'images/cert/sergio-ayala-yoast-local-seo-certificate-2021.webp',                         alt: 'Sergio Ayala — Yoast SEO Academy Certificate: Local SEO & Google Business Profile, August 2021' },
        { src: 'images/cert/sergio-ayala-yoast-all-around-seo-certificate-2021.webp',                    alt: 'Sergio Ayala — Yoast SEO Academy Certificate: All-around SEO (Technical, Content, Link Building), September 2021' },
    ];

    const N           = CERTS.length;
    const SWAP_RADIUS = 2;

    const rand = window.mulberry32(0xC3D4E5F6);

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

    App.certCube = {
        goto: gotoStop,
        next: () => gotoStop(currentStop + 1),
        prev: () => gotoStop(currentStop - 1),
    };

}());


;
/* ===== photo-vfx.js ===== */
/**
 * photo-vfx.js
 * Volumetric light / shadow effect for the #photo section.
 * Pure WebGL + Canvas 2D — zero external dependencies.
 *
 * ── HOW TO CUSTOMISE ──────────────────────────────────────────────────────────
 * Edit the CONFIG object below. All values are in one place.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ── CONFIGURATION ───────────────────────────────────────────────────────────
  // Adaptive sample count: fewer samples on lower-end GPUs (Safari/iOS)
  const _tier    = App.BrowserDetect ? App.BrowserDetect.getPerformanceTier() : 'high';
  const _samples = _tier === 'low' ? 8 : _tier === 'medium' ? 12 : 16;

  // Phones only: the font size is a % of the (narrow) section width, so the
  // desktop vw values render a tiny, unreadable title on a ~393px viewport
  // (start size even overflows the width → clips). Mobile uses its own, larger
  // vw curve — desktop stays byte-for-byte identical (gated below).
  const _isMobile = !!(App.BrowserDetect && App.BrowserDetect.isMobile);

  const CONFIG = {
    // Text rendered in the scene
    text:             '[ · p h o t o g r a p h y · ]',
    fontFamily:       '"Funnel Display", sans-serif',
    fontWeight:       900,
    letterSpacing:    '0',

    // Scroll-driven font size animation:
    // starts large when the section first enters the viewport,
    // shrinks to small when the section is fully revealed.
    fontSizeVwStart:  12.6, // font size (% of section width) at scroll progress 0
    fontSizeVwEnd:    5.6,  // font size (% of section width) at scroll progress 1

    // Phase-2 continues shrinking to (fontSizeVwEnd × this factor).
    phase2Floor:      0.35,

    // ── Mobile-only overrides (≈393px section) ──────────────────────────────
    // 9vw ≈ 35px fills the width without clipping; 7.5vw ≈ 29px keeps the
    // resting title readable (desktop shrank it to ~1.96vw ≈ 7.7px here).
    fontSizeVwStartMobile: 9.0,
    fontSizeVwEndMobile:   7.5,
    phase2FloorMobile:     1.0, // no extra phase-2 shrink — stay legible while it parks

    // Section background colour — keep in sync with CSS #001219
    bgColor:          [0, 18, 25],   // [R, G, B] 0–255

    // Ray-march quality: adaptive — high=16, medium=12, low=8
    samples:          _samples,

    // Light behaviour
    lightPower:       0.2,
    lightRadius:      0.1,
    rainbowIntensity: 2.5,
    ditherAmount:     0.01,
    lightColor:       [0.914, 0.847, 0.651], // #E9D8A6
  };
  // ────────────────────────────────────────────────────────────────────────────


  // ── SHADERS ─────────────────────────────────────────────────────────────────
  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  function buildFrag(cfg) {
    return `
      precision highp float;
      #define SAMPLES ${cfg.samples}.0
      #define PI 3.141593

      uniform vec2      u_res;
      uniform vec2      u_mouse;
      uniform sampler2D u_tex;
      uniform float     u_lightPower;
      uniform float     u_lightRadius;
      uniform float     u_rainbow;
      uniform float     u_dither;
      uniform vec3      u_textColor;
      uniform vec3      u_lightColor;

      float h2(vec2 p) { return fract(sin(dot(p, vec2(489.,589.)))*492.)*2.-1.; }
      float h3(vec3 p) { return fract(sin(dot(p, vec3(489.,589.,58.)))*492.)*2.-1.; }
      vec2  h3v(vec3 p){ return vec2(h3(p), h3(p + 1.)); }

      vec4 samp(vec2 uv) {
        if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return vec4(0.);
        return texture2D(u_tex, uv);
      }
      vec3 spectrum(float x) {
        return cos((x - vec3(0., .5, 1.)) * vec3(.6, 1., .5) * PI);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;

        if (samp(uv).r > 0.5) { gl_FragColor = vec4(u_textColor, 1.0); return; }

        float ar = u_res.x / u_res.y;
        vec2 p   = (uv * 2. - 1.) * vec2(ar, 1.);
        vec2 mp  = ((u_mouse / u_res) * 2. - 1.) * vec2(ar, 1.);

        vec2  rp  = p;
        vec2  d   = (mp - p) / SAMPLES;
        float acc = 0.;
        for (float i = 0.; i < SAMPLES; i++) {
          rp  += d;
          rp  += h3v(vec3(rp, i)) * 0.5 / SAMPLES;
          vec2 uv2  = (rp / vec2(ar, 1.)) * 0.5 + 0.5;
          acc      += samp(uv2).r / SAMPLES;
        }

        float lm = length(p - mp);
        float lv = smoothstep(0., 1., pow(u_lightRadius / max(lm, 1e-5), u_lightPower));
        vec4  c  = vec4(lv);
        c.rgb *= u_lightColor;
        c -= acc;
        c += vec4(spectrum(cos(acc * 3.5)), 1.) * acc * u_rainbow;
        c -= h2(uv) * u_dither;
        gl_FragColor = c;
      }
    `;
  }


  // ── WebGL HELPERS ───────────────────────────────────────────────────────────
  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[PhotoVFX] Shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function makeProgram(gl) {
    const vs = compileShader(gl, gl.VERTEX_SHADER,   VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, buildFrag(CONFIG));
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('[PhotoVFX] Link error:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }


  // ── INIT ────────────────────────────────────────────────────────────────────
  async function init() {
    const section     = document.getElementById('photo');
    const photoSpacer = document.querySelector('.photo-scroll-spacer');
    if (!section || !photoSpacer) return;

    await document.fonts.ready;

    const textCanvas = document.createElement('canvas');
    const tc = textCanvas.getContext('2d', { willReadFrequently: true });

    const glCanvas = document.createElement('canvas');
    Object.assign(glCanvas.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      display: 'block',
      zIndex: '0',
    });
    section.appendChild(glCanvas);

    const gl = glCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) { console.warn('[PhotoVFX] WebGL not supported'); return; }

    const prog = makeProgram(gl);
    if (!prog) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res:   gl.getUniformLocation(prog, 'u_res'),
      mouse: gl.getUniformLocation(prog, 'u_mouse'),
      tex:   gl.getUniformLocation(prog, 'u_tex'),
      lp:    gl.getUniformLocation(prog, 'u_lightPower'),
      lr:    gl.getUniformLocation(prog, 'u_lightRadius'),
      rb:    gl.getUniformLocation(prog, 'u_rainbow'),
      dt:    gl.getUniformLocation(prog, 'u_dither'),
      tc:    gl.getUniformLocation(prog, 'u_textColor'),
      lc:    gl.getUniformLocation(prog, 'u_lightColor'),
    };

    gl.uniform1f(U.lp, CONFIG.lightPower);
    gl.uniform1f(U.lr, CONFIG.lightRadius);
    gl.uniform1f(U.rb, CONFIG.rainbowIntensity);
    gl.uniform1f(U.dt, CONFIG.ditherAmount);
    gl.uniform1i(U.tex, 0);
    gl.uniform3f(U.tc, CONFIG.bgColor[0] / 255, CONFIG.bgColor[1] / 255, CONFIG.bgColor[2] / 255);
    gl.uniform3f(U.lc, ...CONFIG.lightColor);

    gl.clearColor(0, 0, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // ── State ────────────────────────────────────────────────────────────────
    let mouse           = { x: 0, y: 0 };  // lerped position sent to shader
    let targetMouse     = { x: 0, y: 0 };  // raw position from mousemove events
    let sw = 0, sh = 0, cw = 0, ch = 0;
    // DPR capped at 1: quarter the pixels vs 2x Retina — biggest single perf win
    const DPR           = Math.min(window.devicePixelRatio || 1, 1);
    let scrollProgress  = 0;   // phase 1: font size (0→1)
    let scrollProgress2 = 0;   // phase 2: text Y position (0→1)
    let rawProgress     = 0;   // unclamped, used to gate the RAF
    let texInitialized  = false; // tracks whether texImage2D has been called
    const nav           = document.querySelector('header');

    // Cached layout values — computed once, refreshed on resize.
    // Avoids forced-reflow getBoundingClientRect() / offsetHeight reads
    // inside the high-frequency scroll and mousemove handlers.
    let winH         = window.innerHeight;
    let spacerDocTop = photoSpacer.getBoundingClientRect().top + window.scrollY;
    let navHeight    = nav ? nav.offsetHeight + 10 : 70;
    // #photo is position:fixed top:0 left:0, so section offsets are always 0
    let sectionLeft  = 0;
    let sectionTop   = 0;

    // Dirty flags — GPU draw only runs when something actually changed
    let needsResize  = true;
    let needsTex     = true;
    let needsDraw    = true;
    let rafId        = null;

    // ── Schedule a single RAF frame ──────────────────────────────────────────
    // The loop is demand-driven: it only runs when the section is active
    // (rawProgress > 0) and requeues itself only if there is more work to do.
    function scheduleFrame() {
      if (!rafId && rawProgress > 0) {
        rafId = requestAnimationFrame(frame);
      }
    }

    // ── Scroll-driven font size ──────────────────────────────────────────────
    // #photo is position:fixed — IntersectionObserver always fires for it, so
    // we gate activity with rawProgress instead.
    const updateScroll = () => {
      // Use cached spacerDocTop + current scrollY — no reflow.
      const spacerTop = spacerDocTop - window.scrollY;
      rawProgress = 1 - (spacerTop / winH);

      const newProgress  = Math.max(0, Math.min(1, rawProgress));
      // Phase 2: rawProgress 1→2 mapped to 0→1
      const newProgress2 = Math.max(0, Math.min(1, rawProgress - 1));

      if (Math.abs(newProgress - scrollProgress) > 0.005 ||
          Math.abs(newProgress2 - scrollProgress2) > 0.005) {
        scrollProgress  = newProgress;
        scrollProgress2 = newProgress2;
        needsTex  = true;
        needsDraw = true;
        scheduleFrame();
      }

      // Kick the loop when section first becomes active
      if (rawProgress > 0) scheduleFrame();
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    // ── Mouse tracking ───────────────────────────────────────────────────────
    window.addEventListener('mousemove', e => {
      if (rawProgress <= 0) return;           // section not active, skip
      // Use cached offsets — no getBoundingClientRect() on every mousemove.
      const nx = (e.clientX - sectionLeft) * DPR;
      const ny = ch - (e.clientY - sectionTop) * DPR;
      if (nx !== targetMouse.x || ny !== targetMouse.y) {
        targetMouse.x = nx;
        targetMouse.y = ny;
        scheduleFrame();
      }
    });

    // ── Resize ───────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      // Update cached values immediately so the scroll handler stays correct
      // even before the next RAF resize() call runs.
      winH         = window.innerHeight;
      spacerDocTop = photoSpacer.getBoundingClientRect().top + window.scrollY;
      navHeight    = nav ? nav.offsetHeight + 10 : 70;
      needsResize  = true;
      needsDraw    = true;
      scheduleFrame();
    });

    function resize() {
      sw = section.clientWidth;
      sh = section.clientHeight;
      cw = Math.round(sw * DPR);
      ch = Math.round(sh * DPR);

      glCanvas.width    = cw;
      glCanvas.height   = ch;
      textCanvas.width  = cw;
      textCanvas.height = ch;

      gl.viewport(0, 0, cw, ch);
      gl.uniform2f(U.res, cw, ch);

      mouse.x       = cw / 2;
      mouse.y       = ch / 2;
      targetMouse.x = cw / 2;
      targetMouse.y = ch / 2;

      texInitialized = false; // canvas dimensions changed — force texImage2D
      needsTex       = true;
      needsResize    = false;
    }

    // ── Text mask draw + GPU upload ──────────────────────────────────────────
    function drawTextMask() {
      // Desktop values, or the mobile overrides on phones (narrow section width).
      const vwStart = _isMobile ? CONFIG.fontSizeVwStartMobile : CONFIG.fontSizeVwStart;
      const vwEnd   = _isMobile ? CONFIG.fontSizeVwEndMobile   : CONFIG.fontSizeVwEnd;
      const floor   = _isMobile ? CONFIG.phase2FloorMobile     : CONFIG.phase2Floor;
      // Phase 1: shrink from start → end size
      const fontSizeVwP1 = vwStart + (vwEnd - vwStart) * scrollProgress;
      // Phase 2: continue shrinking from end size → (end × floor)
      const fontSizeVw = fontSizeVwP1 +
        (vwEnd * floor - vwEnd) * scrollProgress2;
      const fontSize = Math.round(fontSizeVw / 100 * sw * DPR);

      // Phase 2: move text from center toward (navBottom + 10px)
      const navBottomPx = navHeight; // cached — avoids offsetHeight reflow per frame
      const targetY     = navBottomPx * DPR + fontSize / 2; // baseline-middle offset
      const textY       = ch / 2 + (targetY - ch / 2) * scrollProgress2;

      tc.fillStyle = '#000';
      tc.fillRect(0, 0, cw, ch);
      tc.fillStyle    = '#fff'; // mask always white — color handled by shader uniform
      tc.font         = `${CONFIG.fontWeight} ${fontSize}px ${CONFIG.fontFamily}`;
      tc.letterSpacing = CONFIG.letterSpacing;
      tc.textAlign    = 'center';
      tc.textBaseline = 'middle';
      tc.fillText(CONFIG.text, cw / 2, textY);

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      if (!texInitialized) {
        // First upload — allocates GPU texture memory
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        texInitialized = true;
      } else {
        // Subsequent updates — reuses existing GPU allocation (cheaper)
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
      }

      needsTex = false;
    }

    // ── Render loop (demand-driven) ───────────────────────────────────────────
    function frame() {
      rafId = null;

      if (needsResize) resize();
      if (needsTex)    drawTextMask();

      // Lerp mouse toward target — smooths light movement, self-throttles redraws
      const dx = targetMouse.x - mouse.x;
      const dy = targetMouse.y - mouse.y;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        mouse.x += dx * 0.12;
        mouse.y += dy * 0.12;
        needsDraw = true;
      }

      if (needsDraw) {
        const [br, bg, bb] = CONFIG.bgColor;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.mouse, mouse.x, mouse.y);
        gl.uniform3f(U.tc, br / 255, bg / 255, bb / 255);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        needsDraw = false;
      }

      // Requeue only if there is still pending work
      if (needsResize || needsTex || needsDraw) scheduleFrame();
    }
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  // Wrap async init so an unhandled rejection doesn't silently break the page.
  // On failure the section falls back to its CSS background (#001219).
  function boot() {
    init().catch(err => console.warn('[PhotoVFX] Init failed:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();

