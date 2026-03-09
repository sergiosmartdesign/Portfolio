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
  const CONFIG = {
    // Text rendered in the scene
    text:             'Photography.',
    fontFamily:       '"Funnel Display", sans-serif',
    fontWeight:       900,

    // Scroll-driven font size animation:
    // starts large when the section first enters the viewport,
    // shrinks to small when the section is fully revealed.
    fontSizeVwStart:  18,   // font size (% of section width) at scroll progress 0
    fontSizeVwEnd:    8,    // font size (% of section width) at scroll progress 1

    // Section background colour — keep in sync with CSS #001219
    bgColor:          [0, 18, 25],   // [R, G, B] 0–255

    // Ray-march quality: higher = smoother shadows but slower (16–128 recommended)
    samples:          64,

    // Light behaviour
    lightPower:       0.2,    // attenuation exponent (lower = wider halo)
    lightRadius:      0.1,    // source strength multiplier
    rainbowIntensity: 2.5,    // chromatic dispersion on shadow edges
    ditherAmount:     0.01,   // film-grain noise to avoid colour banding
  };
  // ────────────────────────────────────────────────────────────────────────────


  // ── SHADERS ─────────────────────────────────────────────────────────────────
  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  // SAMPLES is baked in at compile time so the loop index is a constant.
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

      /* Distinct names — GLSL ES 1.0 does not support overloads */
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

        /* Text pixels → solid white */
        if (samp(uv).r > 0.5) { gl_FragColor = vec4(1.0); return; }

        /* Aspect-ratio-corrected screen space */
        float ar = u_res.x / u_res.y;
        vec2 p   = (uv * 2. - 1.) * vec2(ar, 1.);
        vec2 mp  = ((u_mouse / u_res) * 2. - 1.) * vec2(ar, 1.);

        /* Ray march from pixel toward mouse */
        vec2  rp  = p;
        vec2  d   = (mp - p) / SAMPLES;
        float acc = 0.;
        for (float i = 0.; i < SAMPLES; i++) {
          rp  += d;
          rp  += h3v(vec3(rp, i)) * 0.5 / SAMPLES;
          vec2 uv2  = (rp / vec2(ar, 1.)) * 0.5 + 0.5;
          acc      += samp(uv2).r / SAMPLES;
        }

        /* Radial light halo */
        float lm = length(p - mp);
        vec4  c  = vec4(smoothstep(0., 1., pow(u_lightRadius / max(lm, 1e-5), u_lightPower)));

        c -= acc;                                                     /* shadow */
        c += vec4(spectrum(cos(acc * 3.5)), 1.) * acc * u_rainbow;   /* rainbow */
        c -= h2(uv) * u_dither;                                       /* dither  */

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

    // Wait for custom fonts so Canvas 2D renders the correct typeface
    await document.fonts.ready;

    // Offscreen canvas — renders the white-on-black text mask
    const textCanvas = document.createElement('canvas');
    const tc = textCanvas.getContext('2d');

    // WebGL canvas — covers the full section
    const glCanvas = document.createElement('canvas');
    Object.assign(glCanvas.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      display: 'block',
      zIndex: '0',
    });
    section.appendChild(glCanvas);

    const gl = glCanvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      console.warn('[PhotoVFX] WebGL not supported');
      return;
    }

    const prog = makeProgram(gl);
    if (!prog) return;
    gl.useProgram(prog);

    // Fullscreen quad (triangle strip)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const U = {
      res:   gl.getUniformLocation(prog, 'u_res'),
      mouse: gl.getUniformLocation(prog, 'u_mouse'),
      tex:   gl.getUniformLocation(prog, 'u_tex'),
      lp:    gl.getUniformLocation(prog, 'u_lightPower'),
      lr:    gl.getUniformLocation(prog, 'u_lightRadius'),
      rb:    gl.getUniformLocation(prog, 'u_rainbow'),
      dt:    gl.getUniformLocation(prog, 'u_dither'),
    };

    // Set static uniforms once
    gl.uniform1f(U.lp, CONFIG.lightPower);
    gl.uniform1f(U.lr, CONFIG.lightRadius);
    gl.uniform1f(U.rb, CONFIG.rainbowIntensity);
    gl.uniform1f(U.dt, CONFIG.ditherAmount);
    gl.uniform1i(U.tex, 0);

    // Section background as WebGL clear colour
    const [br, bg, bb] = CONFIG.bgColor;
    gl.clearColor(br / 255, bg / 255, bb / 255, 1);

    // Texture object
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Runtime state
    let mouse        = { x: 0, y: 0 };
    let sw = 0, sh = 0, cw = 0, ch = 0, dpr = 1;
    let dirty        = true;    // canvas/viewport needs full resize
    let texDirty     = true;    // text mask needs redraw (scroll or resize)
    let visible      = false;
    let rafId        = null;
    let scrollProgress = 0;     // 0 = section just entering, 1 = fully revealed

    // ── Scroll-driven font size ──────────────────────────────────────────────
    // Mirrors the same formula used in script.js updatePhotoReveal()
    const updateScrollProgress = () => {
      const spacerRect = photoSpacer.getBoundingClientRect();
      const newProgress = Math.max(0, Math.min(1,
        1 - (spacerRect.top / window.innerHeight)
      ));
      if (Math.abs(newProgress - scrollProgress) > 0.001) {
        scrollProgress = newProgress;
        texDirty = true;
      }
    };
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // ── Mouse tracking ───────────────────────────────────────────────────────
    window.addEventListener('mousemove', e => {
      const rect = section.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      // Flip Y: gl_FragCoord y=0 is bottom of canvas
      mouse.y = ch - (e.clientY - rect.top) * dpr;
    });

    // ── Text mask draw + GPU upload ──────────────────────────────────────────
    function drawTextMask() {
      // Interpolate font size based on scroll progress
      const fontSizeVw = CONFIG.fontSizeVwStart +
        (CONFIG.fontSizeVwEnd - CONFIG.fontSizeVwStart) * scrollProgress;
      const fontSize = Math.round(fontSizeVw / 100 * sw * dpr);

      tc.fillStyle = '#000';
      tc.fillRect(0, 0, cw, ch);
      tc.fillStyle = '#fff';
      tc.font = `${CONFIG.fontWeight} ${fontSize}px ${CONFIG.fontFamily}`;
      tc.textAlign    = 'center';
      tc.textBaseline = 'middle';
      tc.fillText(CONFIG.text, cw / 2, ch / 2);

      // UNPACK_FLIP_Y_WEBGL aligns canvas Y (top=0) with GL UV Y (bottom=0)
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);

      texDirty = false;
    }

    // ── Resize ───────────────────────────────────────────────────────────────
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sw  = section.clientWidth;
      sh  = section.clientHeight;
      cw  = Math.round(sw * dpr);
      ch  = Math.round(sh * dpr);

      glCanvas.width  = cw;
      glCanvas.height = ch;
      textCanvas.width  = cw;
      textCanvas.height = ch;

      gl.viewport(0, 0, cw, ch);
      gl.uniform2f(U.res, cw, ch);

      // Reset mouse to centre
      mouse.x = cw / 2;
      mouse.y = ch / 2;

      drawTextMask();
    }

    // Observe section size changes
    const ro = new ResizeObserver(() => { dirty = true; });
    ro.observe(section);

    // Pause/resume RAF based on visibility
    const io = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !rafId) rafId = requestAnimationFrame(frame);
    }, { threshold: 0 });
    io.observe(section);

    // ── Render loop ───────────────────────────────────────────────────────────
    function frame() {
      if (dirty)        { resize();        dirty = false; }
      else if (texDirty){ drawTextMask(); }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafId = visible ? requestAnimationFrame(frame) : null;
    }

    resize();
    rafId = requestAnimationFrame(frame);
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
