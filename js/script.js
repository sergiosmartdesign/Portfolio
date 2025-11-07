// 1. Inicializa Splitting en todos los elementos que tienen la clase 'glitch-text'
// ... (El código de Splitting y glitches se mantiene igual) ...
const results = window.Splitting({ 
    target: '.glitch-text', 
    by: 'chars' 
}); 

const glitches = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

results.forEach(result => {
  const chars = result.chars;
  if (!result.el.classList.contains('reveal--0')) {
    result.el.classList.add('reveal--0');
  }
  chars.forEach(char => {
    char.style.setProperty('--count', Math.random() * 5 + 1);
    for (let g = 0; g < 10; g++) {
      char.style.setProperty(
      `--char-${g}`,
      `"${glitches[Math.floor(Math.random() * glitches.length)]}"`);
    }
  });
});

// 2. NUEVO: Añadir evento hover al logo para reiniciar animación glitch
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('mouseenter', function() {
    const chars = this.querySelectorAll('[data-char]');

    // Para cada carácter del logo
    chars.forEach((char, index) => {
      // Remover la animación momentáneamente
      char.style.animation = 'none';

      // Forzar reflow para reiniciar la animación
      void char.offsetWidth;

      // Restaurar la animación con nuevos parámetros
      char.style.animation = `glitch-switch 0.2s steps(1) ${index * 0.05}s ${10} backwards`;
    });
  });

  // Detener la animación inmediatamente al quitar el mouse
  logo.addEventListener('mouseleave', function() {
    const chars = this.querySelectorAll('[data-char]');

    chars.forEach((char) => {
      // Remover completamente la animación
      char.style.animation = 'none';

      // Forzar reflow
      void char.offsetWidth;

      // Restaurar la animación por defecto (sin hover)
      char.style.animation = '';
    });
  });
}

// 3. Inicializa ScrollOut
window.ScrollOut({
  targets: '.glitch-text'
});

// ====================================================================
// PARTE 4: CUSTOM DNA GLITCH EFFECT
// ====================================================================

// DNA Glitch effect - compatible with 3D transforms
const dnaGlitches = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

function initDNAGlitch() {
  const dnaSpans = document.querySelectorAll('.scene .text span');

  if (dnaSpans.length === 0) return;

  // Store original text content for each span
  const originalTexts = new Map();
  dnaSpans.forEach(span => {
    originalTexts.set(span, span.textContent);
  });

  // Function to glitch a single span
  function glitchSpan(span, duration = 100) {
    const originalText = originalTexts.get(span);

    // Replace with random glitch characters
    const glitchText = Array.from(originalText)
      .map(char => {
        if (char === ' ' || char === '·' || char === '-') return char;
        return Math.random() > 0.5 ? char : dnaGlitches[Math.floor(Math.random() * dnaGlitches.length)];
      })
      .join('');

    span.textContent = glitchText;

    // Restore original text after duration
    setTimeout(() => {
      span.textContent = originalText;
    }, duration);
  }

  // Initial load glitch effect - runs once per span with staggered timing
  dnaSpans.forEach((span, index) => {
    setTimeout(() => {
      // Glitch multiple times on load
      let glitchCount = 0;
      const maxGlitches = Math.floor(Math.random() * 5) + 3; // 3-7 glitches

      const glitchInterval = setInterval(() => {
        glitchSpan(span, 80);
        glitchCount++;

        if (glitchCount >= maxGlitches) {
          clearInterval(glitchInterval);
        }
      }, 150); // Glitch every 150ms

    }, index * 50); // Stagger start time
  });

  // Optional: Random occasional glitches during animation
  setInterval(() => {
    const randomSpan = dnaSpans[Math.floor(Math.random() * dnaSpans.length)];
    if (Math.random() > 0.95) { // 5% chance every interval
      glitchSpan(randomSpan, 60);
    }
  }, 500);
}

// Initialize DNA glitch on page load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initDNAGlitch();
  }, 500); // Slight delay to ensure DOM is ready
});

// ====================================================================
// PARTE 5: DNA LETTER-BY-LETTER REVEAL ANIMATION
// ====================================================================

function animateDNAReveal() {
  // Select "Mastering" text (--text: 0)
  const masteringText = document.querySelector('.text[style*="--text: 0"]');
  // Select "Your Brand's DNA" text (--text: 2)
  const brandDNAText = document.querySelector('.text[style*="--text: 2"]');

  if (!masteringText || !brandDNAText) return;

  // Get all spans from both texts
  const masteringSpans = Array.from(masteringText.querySelectorAll('span'));
  const brandDNASpans = Array.from(brandDNAText.querySelectorAll('span'));

  const letterDelay = 100; // Delay between each letter (ms)
  const startDelay = 500; // Initial delay before starting

  setTimeout(() => {
    // Animate "Mastering" forward (index 0 to end)
    masteringSpans.forEach((span, index) => {
      setTimeout(() => {
        span.classList.add('revealed');
      }, index * letterDelay);
    });

    // Animate "Your Brand's DNA" backward (last index to 0)
    brandDNASpans.reverse().forEach((span, index) => {
      setTimeout(() => {
        span.classList.add('revealed');
      }, index * letterDelay);
    });
  }, startDelay);
}

// Initialize DNA reveal animation on page load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    animateDNAReveal();
  }, 3000); // 3 seconds delay after page load
});

// ====================================================================
// PARTE 6: INICIA EL FRAGMENT SHADER (RGBA.js)
// ====================================================================

setTimeout(() => {
    
    // Asegúrate de que la librería RGBA.js se haya cargado
    if (window.RGBA) {
        // CORRECCIÓN 1: Habilitar el scroll
        // Pasamos un objeto de configuración para evitar que RGBA.js
        // aplique `overflow: hidden` al body.
        RGBA(`

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec4 P){
    vec4 Pi0 = floor(P); // Integer part for indexing
    vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec4 Pf0 = fract(P); // Fractional part for interpolation
    vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = vec4(Pi0.zzzz);
    vec4 iz1 = vec4(Pi1.zzzz);
    vec4 iw0 = vec4(Pi0.wwww);
    vec4 iw1 = vec4(Pi1.wwww);
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 ixy00 = permute(ixy0 + iw0);
    vec4 ixy01 = permute(ixy0 + iw1);
    vec4 ixy10 = permute(ixy1 + iw0);
    vec4 ixy11 = permute(ixy1 + iw1);
    vec4 gx00 = ixy00 / 7.0;
    vec4 gy00 = floor(gx00) / 7.0;
    vec4 gz00 = floor(gy00) / 6.0;
    gx00 = fract(gx00) - 0.5;
    gy00 = fract(gy00) - 0.5;
    gz00 = fract(gz00) - 0.5;
    vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
    vec4 sw00 = step(gw00, vec4(0.0));
    gx00 -= sw00 * (step(0.0, gx00) - 0.5);
    gy00 -= sw00 * (step(0.0, gy00) - 0.5);
    vec4 gx01 = ixy01 / 7.0;
    vec4 gy01 = floor(gx01) / 7.0;
    vec4 gz01 = floor(gy01) / 6.0;
    gx01 = fract(gx01) - 0.5;
    gy01 = fract(gy01) - 0.5;
    gz01 = fract(gz01) - 0.5;
    vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
    vec4 sw01 = step(gw01, vec4(0.0));
    gx01 -= sw01 * (step(0.0, gx01) - 0.5);
    gy01 -= sw01 * (step(0.0, gy01) - 0.5);
    vec4 gx10 = ixy10 / 7.0;
    vec4 gy10 = floor(gx10) / 7.0;
    vec4 gz10 = floor(gy10) / 6.0;
    gx10 = fract(gx10) - 0.5;
    gy10 = fract(gy10) - 0.5;
    gz10 = fract(gz10) - 0.5;
    vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
    vec4 sw10 = step(gw10, vec4(0.0));
    gx10 -= sw10 * (step(0.0, gx10) - 0.5);
    gy10 -= sw10 * (step(0.0, gy10) - 0.5);
    vec4 gx11 = ixy11 / 7.0;
    vec4 gy11 = floor(gx11) / 7.0;
    vec4 gz11 = floor(gy11) / 6.0;
    gx11 = fract(gx11) - 0.5;
    gy11 = fract(gy11) - 0.5;
    gz11 = fract(gz11) - 0.5;
    vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
    vec4 sw11 = step(gw11, vec4(0.0));
    gx11 -= sw11 * (step(0.0, gx11) - 0.5);
    gy11 -= sw11 * (step(0.0, gy11) - 0.5);
    vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
    vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
    vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
    vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
    vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
    vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
    vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
    vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
    vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
    vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
    vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
    vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
    vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
    vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
    vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
    vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);
    vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
    g0000 *= norm00.x;
    g0100 *= norm00.y;
    g1000 *= norm00.z;
    g1100 *= norm00.w;
    vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
    g0001 *= norm01.x;
    g0101 *= norm01.y;
    g1001 *= norm01.z;
    g1101 *= norm01.w;
    vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
    g0010 *= norm10.x;
    g0110 *= norm10.y;
    g1010 *= norm10.z;
    g1110 *= norm10.w;
    vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
    g0011 *= norm11.x;
    g0111 *= norm11.y;
    g1011 *= norm11.z;
    g1111 *= norm11.w;
    float n0000 = dot(g0000, Pf0);
    float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
    float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
    float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
    float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
    float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
    float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
    float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
    float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
    float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
    float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
    float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
    float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
    float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
    float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
    float n1111 = dot(g1111, Pf1);
    vec4 fade_xyzw = fade(Pf0);
    vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
    vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
    vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
    vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
    float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
    return 2.2 * n_xyzw;
}

vec2 grid(vec2 uv) {
    return floor(uv * 25.) * 0.04;
}
float dots(vec2 uv) {
    float mx = mod(uv.x, 0.04);
    float my = mod(uv.y, 0.04);
    return step(0.027, max(mx, my));
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy*2.-1.;
    uv.y *= resolution.y/resolution.x;
    
    // CORRECCIÓN 2: Ralentizar la animación
    // Creamos una variable 'slowTime' que es 4 veces más lenta que 'time'
    float slowTime = time * 0.25; 
    
    // Usamos 'slowTime' en lugar de 'time' para el movimiento
    uv.x += slowTime * 0.5; 
    
    float noiseAmount = 0.5;
    float noiseFrequency = 10.0;
    
    // Usamos 'slowTime' para la evolución del ruido
    float n = cnoise(vec4(noiseFrequency * grid(uv), noiseFrequency * grid(uv).x, slowTime)) * 0.5 + 0.5;
    float n2 = cnoise(vec4(grid(uv), noiseFrequency * grid(uv).x, slowTime)) * 0.5 + 0.5;
    
    float d = 1.;
    d = smoothstep(0.0, 0.1, d);

 float t = (sin(uv.x) * 0.5 + 0.5);
    vec3 fgColor = mix(
        vec3(0.6078, 0.1333, 0.1490),
        vec3(0.9333, 0.6078, 0.0),    
        pow((n * n2) * 1.5, 5.0) * d
    ); 
    vec3 bgColor = vec3(0.05, 0.07, 0.09);
    vec3 color = bgColor;
    if (distance(0.0, uv.y) < 0.12) {
        color = mix(vec3(0.08, 0.11, 0.14), bgColor, dots(uv));
    }
    if (distance(0.0, uv.y) < (floor(t * n * 7.) * 0.04)) {
        color = mix(fgColor, bgColor, dots(uv));
    }
    if (distance((1. - n2) - 0.5, uv.y) < 0.1) {
        color = mix(fgColor, bgColor, dots(uv));
    }
    gl_FragColor = vec4(color, 1.);
}

`, {
    fullscreen: false // Esto evita que la librería bloquee el scroll del body
});
    }

}, 3500); // 3500 milisegundos = 3.5 segundos de retraso