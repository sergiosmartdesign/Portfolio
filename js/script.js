// 1. Inicializa Splitting en todos los elementos que tienen la clase 'glitch-text'
// Esto crea los elementos <span> con los atributos [data-char]
const results = window.Splitting({ 
    target: '.glitch-text', 
    by: 'chars' 
}); 

// Caracteres aleatorios para el glitch (los que usa el CSS keyframes)
const glitches = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

// 2. Aplica las variables CSS dinámicas necesarias para la animación Glitch
results.forEach(result => {
  const chars = result.chars;
  
  // Asegura que la animación se dispare al cargar (ya que tiene la clase 'reveal--0' en el HTML)
  if (!result.el.classList.contains('reveal--0')) {
    result.el.classList.add('reveal--0');
  }
  
  chars.forEach(char => {
    // Establecer el número aleatorio de iteraciones para que varíe
    char.style.setProperty('--count', Math.random() * 5 + 1);
    
    // Asignar los 10 caracteres aleatorios para la animación CSS (--char-0 a --char-9)
    for (let g = 0; g < 10; g++) {
      char.style.setProperty(
      `--char-${g}`,
      `"${glitches[Math.floor(Math.random() * glitches.length)]}"`);
    }
  });
});

// 3. Inicializa ScrollOut para futuros efectos de scroll.
window.ScrollOut({
  targets: '.glitch-text' // Opcional, pero asegura que Splitting puede trabajar con ScrollOut
});