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
// PARTE 3.5: ACTIVE SECTION INDICATOR FOR NAVIGATION
// ====================================================================

function initActiveNavigation() {
  // Get all navigation buttons (excluding language toggle buttons)
  const navButtons = document.querySelectorAll('.main-nav .nav-btn');
  // Get all sections
  const sections = document.querySelectorAll('main section');

  // Create a map of section IDs to nav buttons
  const sectionToButton = new Map();
  navButtons.forEach(btn => {
    const href = btn.getAttribute('href');
    if (href && href.startsWith('#')) {
      const sectionId = href.substring(1);
      sectionToButton.set(sectionId, btn);
    }
  });

  // Function to set active button
  function setActiveButton(sectionId) {
    // Remove active class from all nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to the corresponding button
    const activeButton = sectionToButton.get(sectionId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  // Intersection Observer to detect which section is in view
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5 // 50% of the section must be visible
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        setActiveButton(sectionId);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Observe all sections
  sections.forEach(section => {
    if (section.id) {
      observer.observe(section);
    }
  });

  // Handle click on nav buttons to immediately set active state
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sectionId = href.substring(1);
        // Small delay to allow smooth scroll to complete
        setTimeout(() => {
          setActiveButton(sectionId);
        }, 100);
      }
    });
  });
}

// Initialize active navigation on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initActiveNavigation();
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
// PARTE 6: ROTATING SQUARES GRID - GENERATE AND MOUSEMOVE EFFECT
// ====================================================================

function initRotatingSquaresGrid() {
  const wrapper = document.querySelector('.wrapper');
  if (!wrapper) return;

  // Calculate how many squares we need to fill the viewport
  const squareSize = 40; // px
  const gap = 24; // 1.5rem ≈ 24px
  const totalSquareSize = squareSize + gap;

  const columns = 10; // Fixed at 10 columns for the color palette
  const rows = Math.ceil(window.innerHeight / totalSquareSize) + 2; // +2 for extra coverage
  const totalSquares = columns * rows;

  // Generate squares dynamically with staggered animation delays
  wrapper.innerHTML = ''; // Clear existing squares

  const columnDelay = 0.3; // Delay between each column (seconds)
  const squareDelay = 0.05; // Delay between each square in a column (seconds)

  for (let i = 0; i < totalSquares; i++) {
    const square = document.createElement('div');
    square.className = 'item';

    // Calculate column (0-9) and row (0-rows-1)
    const col = i % columns;
    const row = Math.floor(i / columns);

    // Calculate animation delay
    let delay = 0;

    if (col < 5) {
      // Columns 1-5: top to bottom
      delay = (col * columnDelay) + (row * squareDelay);
    } else {
      // Columns 6-10: bottom to top
      delay = (col * columnDelay) + ((rows - 1 - row) * squareDelay);
    }

    square.style.animationDelay = `${delay}s`;

    // Remove animation after it completes to allow mousemove transform to work
    square.addEventListener('animationend', () => {
      square.style.animation = 'none';
      square.style.opacity = '1'; // Keep visible after animation
    });

    wrapper.appendChild(square);
  }

  // Add mousemove effect
  document.addEventListener('mousemove', (e) => {
    const sqrs = document.querySelectorAll('.item');

    const mouseX = e.pageX;
    const mouseY = e.pageY;

    sqrs.forEach(sqr => {
      const rect = sqr.getBoundingClientRect();
      const sqrX = rect.left + rect.width / 2 + window.scrollX;
      const sqrY = rect.top + rect.height / 2 + window.scrollY;

      const diffX = mouseX - sqrX;
      const diffY = mouseY - sqrY;

      const radians = Math.atan2(diffY, diffX);

      const angle = radians * 180 / Math.PI;

      sqr.style.transform = `rotate(${angle}deg)`;
    });
  });
}

// Initialize rotating squares grid on page load
window.addEventListener('DOMContentLoaded', () => {
  initRotatingSquaresGrid();
});
