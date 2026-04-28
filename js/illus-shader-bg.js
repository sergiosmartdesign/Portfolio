(function () {
    'use strict';

    const canvas = document.getElementById('illus-shader-bg');
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const isSafari = window.BrowserDetect && window.BrowserDetect.isSafari;
    const LOOP_COUNT = isSafari ? 30 : 60;

    const VS = `#version 300 es
in vec4 aPosition;
void main() {
    gl_Position = aPosition;
}`;

    const FS = `#version 300 es
precision highp float;

uniform vec3  iResolution;
uniform float iTime;
uniform vec4  iMouse;
out vec4 fragColor;

#define LOOP_COUNT ${LOOP_COUNT}.0

/* ── Project palette cycler ───────────────────────────────────────────────
   6 stops, smoothly interpolated, wraps back to start.
   t: 0..1 → one full cycle through all palette colours.
─────────────────────────────────────────────────────────────────────────── */
vec3 projectPalette(float t) {
    t = fract(t) * 6.0;
    int   seg = int(t);
    float f   = smoothstep(0.0, 1.0, fract(t));

    vec3 c0 = vec3(0.039, 0.576, 0.588); /* #0A9396  teal        */
    vec3 c1 = vec3(0.933, 0.608, 0.000); /* #EE9B00  amber       */
    vec3 c2 = vec3(0.580, 0.824, 0.741); /* #94D2BD  muted teal  */
    vec3 c3 = vec3(0.000, 1.000, 1.000); /* #00ffff  cyan        */
    vec3 c4 = vec3(0.792, 0.404, 0.008); /* #CA6702  orange-brown*/
    vec3 c5 = vec3(0.914, 0.847, 0.651); /* #E9D8A6  cream       */

    if (seg == 0) return mix(c0, c1, f);
    if (seg == 1) return mix(c1, c2, f);
    if (seg == 2) return mix(c2, c3, f);
    if (seg == 3) return mix(c3, c4, f);
    if (seg == 4) return mix(c4, c5, f);
                  return mix(c5, c0, f);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec4 o  = vec4(0.0);
    float t = 4.0 * iTime;

    float z = 0.0;
    for (float i = 0.0; i < LOOP_COUNT; i++) {
        float d;
        vec3 p = z * normalize(vec3(uv, 0.95));
        p.z += t;

        float len   = length(p.xy);
        float swirl = 0.1 * sin(len - t * 0.5);
        mat2  rot   = mat2(cos(swirl), -sin(swirl),
                           sin(swirl),  cos(swirl));
        p.xy *= rot;

        vec4 angle = vec4(0.0, 33.0, 11.0, 0.0);
        vec4 a     = z * 0.3 + t * 0.2 - angle;
        p.xy *= mat2(cos(a.x), -sin(a.x), sin(a.x), cos(a.x));

        z += d = length(cos(p + cos(p.yzx + p.z - t * 0.2)).xy) / 5.0;
        o += (sin(p.x + t + vec4(0.0, 2.0, 3.0, 0.0)) + 0.8) / d;
    }

    o = 3.0 * tanh(o / 6000.0);

    /* ── Luminance of the raw raymarching output ── */
    float lum = dot(o.rgb, vec3(0.299, 0.587, 0.114));

    /* ── Colour cycling ───────────────────────────────────────────────────
       drift:   slow global shift — full palette cycle every ~40 s
       angular: screen-angle offset so multiple colours appear at once,
                like a colour wheel radiating from the tunnel centre
    ─────────────────────────────────────────────────────────────────────── */
    float drift   = iTime * 0.025;
    float angular = atan(uv.y, uv.x) / 6.28318; /* –0.5 … +0.5 */

    /* Primary string colour at this screen position */
    vec3 strCol  = projectPalette(drift + angular * 0.6);
    /* Lighter phase for the inner glow halo */
    vec3 haloCol = projectPalette(drift + angular * 0.6 + 0.12);

    /* Background: #001219 — deepest dark in project palette */
    vec3 cDark = vec3(0.000, 0.071, 0.098);
    /* Cream peak for the hottest string cores */
    vec3 cCream = vec3(0.914, 0.847, 0.651); /* #E9D8A6 */

    vec3 col = cDark;
    col = mix(col, strCol,  smoothstep(0.00, 0.45, lum));
    col = mix(col, haloCol, smoothstep(0.40, 0.75, lum));
    col = mix(col, cCream,  smoothstep(0.70, 1.10, lum));

    fragColor = vec4(col, 1.0);
}`;

    function makeShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn('illus-shader-bg:', gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
        }
        return s;
    }

    const vs = makeShader(gl.VERTEX_SHADER,   VS);
    const fs = makeShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn('illus-shader-bg link:', gl.getProgramInfoLog(prog));
        return;
    }

    gl.useProgram(prog);

    const aPos   = gl.getAttribLocation(prog,  'aPosition');
    const uRes   = gl.getUniformLocation(prog, 'iResolution');
    const uTime  = gl.getUniformLocation(prog, 'iTime');
    const uMouse = gl.getUniformLocation(prog, 'iMouse');

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    let mouseX = 0, mouseY = 0;
    const illus = document.getElementById('illustration');

    illus.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = canvas.height - e.clientY;
    }, { passive: true });

    function resize() {
        const parent = canvas.parentElement;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        if (canvas.width === w && canvas.height === h) return;
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();

    let rafId     = null;
    let startTime = null;

    function frame(now) {
        if (startTime === null) startTime = now;
        const elapsed = (now - startTime) * 0.001;
        gl.uniform3f(uRes,   canvas.width, canvas.height, 1.0);
        gl.uniform1f(uTime,  elapsed);
        gl.uniform4f(uMouse, mouseX, mouseY, 0.0, 0.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        rafId = requestAnimationFrame(frame);
    }

    function start() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(frame);
    }

    function stop() {
        if (rafId === null) return;
        cancelAnimationFrame(rafId);
        rafId = null;
    }

    const io = new IntersectionObserver(entries => {
        entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 });

    io.observe(illus);

}());
