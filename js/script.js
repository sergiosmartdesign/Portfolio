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

// ====================================================================
// PARTE 7: INTRO EXIT ANIMATION - MERGE COLUMNS TO RED
// ====================================================================

function initContactExitAnimation() {
  const contactSection = document.querySelector('#contact');
  const wrapper = document.querySelector('.wrapper');

  if (!contactSection || !wrapper) return;

  // Intersection Observer to detect when leaving contact section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        // User scrolled past contact section (going down)
        activateExitAnimation();
      } else if (entry.isIntersecting) {
        // User is back in contact section
        deactivateExitAnimation();
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px'
  });

  observer.observe(contactSection);

  function activateExitAnimation() {
    const squares = document.querySelectorAll('.item');
    const columns = 10;
    const rows = Math.ceil(window.innerHeight / 64) + 2;

    const columnDelay = 0.3;
    const squareDelay = 0.05;

    squares.forEach((square, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      // Calculate reverse delay (same logic as appear but reversed)
      let delay = 0;
      if (col < 5) {
        // Columns 1-5: now disappear from bottom to top (reverse)
        delay = (col * columnDelay) + ((rows - 1 - row) * squareDelay);
      } else {
        // Columns 6-10: now disappear from top to bottom (reverse)
        delay = (col * columnDelay) + (row * squareDelay);
      }

      square.style.animationDelay = `${delay}s`;
    });

    wrapper.classList.add('exit');
  }

  function deactivateExitAnimation() {
    const squares = document.querySelectorAll('.item');
    const columns = 10;
    const rows = Math.ceil(window.innerHeight / 64) + 2;

    const columnDelay = 0.3;
    const squareDelay = 0.05;

    wrapper.classList.remove('exit');

    // Re-apply the appear animation with original delays
    squares.forEach((square, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      let delay = 0;
      if (col < 5) {
        // Columns 1-5: top to bottom
        delay = (col * columnDelay) + (row * squareDelay);
      } else {
        // Columns 6-10: bottom to top
        delay = (col * columnDelay) + ((rows - 1 - row) * squareDelay);
      }

      // Reset opacity and apply appear animation
      square.style.opacity = '0';
      square.style.animation = 'none';

      // Force reflow
      void square.offsetWidth;

      square.style.animation = `squareAppear 0.6s ease-out ${delay}s forwards`;

      // Remove animation after completion to allow mousemove
      square.addEventListener('animationend', () => {
        square.style.animation = 'none';
        square.style.opacity = '1';
      }, { once: true });
    });
  }
}

// Initialize contact exit animation
window.addEventListener('DOMContentLoaded', () => {
  initContactExitAnimation();
});

// ====================================================================
// PARTE 8: CYBERPUNK PANEL AUTO-TRIGGER
// ====================================================================

function initCyberPanelAnimation() {
  const panel = document.getElementById('introCyberPanel');
  
  if (!panel) return;

  // Trigger panel slide-in after 2 seconds
  setTimeout(() => {
    panel.classList.add('active');
  }, 2000);
}

// Initialize cyber panel animation
window.addEventListener('DOMContentLoaded', () => {
  initCyberPanelAnimation();
});

// ====================================================================
// PARTE 9: AI ASSISTANT SPEECH BUBBLES
// ====================================================================

function initAIAssistant() {
  const assistant = document.getElementById('ai-assistant');

  if (!assistant) return;

  const messages = [
    { text: "0hh!*", delay: 3500, duration: 2000 },
    { text: "H3LL0", delay: 6000, duration: 2000 },
    { text: "50rry, I app3ared in the wrr0ngggGG Position", delay: 9000, duration: 3500 },
    { text: "L3t me Fix thathah...", delay: 13000, duration: 2500 }
  ];

  messages.forEach(msg => {
    setTimeout(() => {
      assistant.setAttribute('data-message', msg.text);
    }, msg.delay);
  });

  // Clear message after sequence
  setTimeout(() => {
    assistant.removeAttribute('data-message');
  }, 16000);

  // Add glitch text during glitch animation (16s animation * 86% = 13760ms after start + 3000ms delay)
  const glitchTexts = ['ar24@#(ND><', 'ER#0R_%$@', 'G1!TCH_<<>', '##SYS_F@!L'];
  setTimeout(() => {
    let glitchInterval = setInterval(() => {
      const randomGlitch = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
      assistant.setAttribute('data-glitch', randomGlitch);
    }, 80);

    // Stop glitch after 720ms (duration of glitch animation)
    setTimeout(() => {
      clearInterval(glitchInterval);
      assistant.removeAttribute('data-glitch');
    }, 720);
  }, 16760);
}

// Initialize AI assistant
window.addEventListener('DOMContentLoaded', () => {
  initAIAssistant();
  initSVGAssistantSequence();
});

// ====================================================================
// PARTE 10: SVG AI ASSISTANT SEQUENCE - ROTATION AND MESSAGES
// ====================================================================

function initSVGAssistantSequence() {
  const svgAssistant = document.getElementById('ai-assistant-svg');

  if (!svgAssistant) return;

  // Timing starts after glitch out (~17.5s after page load)
  const baseDelay = 19500; // Start sequence after SVG appears

  // 1. laugh1.svg is already showing (from CSS)

  // 2. After 2 seconds, switch to timid1.svg
  setTimeout(() => {
    svgAssistant.style.backgroundImage = "url('../images/timid1.svg')";

    // Show "You just saw my naked code..." message
    setTimeout(() => {
      svgAssistant.setAttribute('data-message', 'You just saw my naked code...');
    }, 300);

  }, baseDelay);

  // 3. While showing message, switch to flirt1.svg (1 second later)
  setTimeout(() => {
    svgAssistant.style.backgroundImage = "url('../images/flirt1.svg')";
  }, baseDelay + 1000);

  // 4. Flicker between flirt1 and flirt21 (start at 2 seconds after timid)
  setTimeout(() => {
    let flickerCount = 0;
    const maxFlickers = 10;

    const flickerInterval = setInterval(() => {
      // Alternate between flirt1 and flirt21
      if (flickerCount % 2 === 0) {
        svgAssistant.style.backgroundImage = "url('../images/flirt21.svg')";
      } else {
        svgAssistant.style.backgroundImage = "url('../images/flirt1.svg')";
      }

      flickerCount++;

      if (flickerCount >= maxFlickers) {
        clearInterval(flickerInterval);
      }
    }, 150); // Flicker every 150ms

  }, baseDelay + 2000);

  // 5. Clear the "naked code" message before switching back
  setTimeout(() => {
    svgAssistant.removeAttribute('data-message');
  }, baseDelay + 3500);

  // 6. Switch back to laugh1.svg and show final message
  setTimeout(() => {
    svgAssistant.style.backgroundImage = "url('../images/laugh1.svg')";

    // Show "HAH! That's what happens..." message
    setTimeout(() => {
      svgAssistant.setAttribute('data-message', "HAH! That's what happens when you code me while 'vibing' to L0-Fi b3ats");
    }, 500);

  }, baseDelay + 3800);

  // 7. Clear final message after 4 seconds
  setTimeout(() => {
    svgAssistant.removeAttribute('data-message');
  }, baseDelay + 8800);
}
