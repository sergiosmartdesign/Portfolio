// ====================================================================
// PARTE 1: IMPLEMENTACIÓN DE SPLITTING.JS (ADAPTADA)
// Divide el texto en spans con data-char para aplicar el efecto CSS.
// ====================================================================

function Splitting() {
    function $$$(selector) {
        // Asegura que se seleccionen elementos y se devuelva un array
        return selector instanceof Element ? [selector] : Array.from(document.querySelectorAll(selector));
    }
    
    function $(elem, key, val) {
        // Función para establecer variables CSS
        if (key && val) {
            elem.style.setProperty(key, val);
        }
    }

    function compute(elem, items, key, index, total) {
        // Variables esenciales para el efecto
        $(elem, '--char-index', index);
        $(elem, '--item-total', total);
        
        // Calcular dimensiones para variables (opcional, pero útil)
        if (key === 'chars') {
            var charRect = elem.getBoundingClientRect();
            $(elem, '--char-width', charRect.width + 'px');
        }
    }

    // Función principal de división
    function bySplitting(key, item) {
        var str = item.textContent;
        var children = [];
        var total = str.replace(/\s/g, '').length; // Total de caracteres sin espacios

        item.textContent = '';
        str.split(' ').map((word, wordIndex) => {
            var wordEl = document.createElement('span');
            wordEl.className = 'word';
            wordEl.setAttribute('data-word', word);
            wordEl.style.display = 'inline-block';
            
            var chars = word.split('').map((char, charIndex) => {
                var charEl = document.createElement('span');
                charEl.className = 'char';
                charEl.setAttribute('data-char', char);
                charEl.setAttribute('data-char-index', children.length); // Usamos el índice de children
                charEl.textContent = char;
                children.push(charEl);
                
                compute(charEl, children, 'chars', children.length - 1, total);
                return charEl;
            });

            chars.forEach(charEl => wordEl.appendChild(charEl));
            item.appendChild(wordEl);
            
            // Espacio entre palabras
            if (wordIndex < str.split(' ').length - 1) {
                item.appendChild(document.createTextNode(' '));
            }
            
            return wordEl;
        });

        item.classList.add('splitting');
        item.setAttribute('data-splitting', key);

        return {
            key: key,
            children: children // Todos los spans de caracteres
        };
    }

    // Selecciona todos los elementos marcados para el efecto
    var targets = $$$(document.querySelectorAll('.glitch-text')); 
    
    // Procesa cada elemento
    var results = targets.map(target => {
        return bySplitting('chars', target);
    });

    return results;
}

// ====================================================================
// PARTE 2: FUNCIÓN DEL EFECTO GLITCH
// Aplica los caracteres aleatorios y activa el efecto.
// ====================================================================

function GlitchEffect() {
    const results = Splitting();
    // Caracteres aleatorios para el glitch (del código original)
    const glitches = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');
    
    // Iterar sobre todos los elementos divididos
    for (let r = 0; r < results.length; r++) {
      const chars = results[r].children; 
      
      for (let c = 0; c < chars.length; c++) {
        // Establecer el número aleatorio de iteraciones para la animación
        chars[c].style.setProperty('--count', Math.random() * 5 + 1);
        
        // Asignar los 10 caracteres aleatorios para la animación CSS
        for (let g = 0; g < 10; g++) {
          chars[c].style.setProperty(
          `--char-${g}`,
          `"${glitches[Math.floor(Math.random() * glitches.length)]}"`);
        }
      }
    }
}

// ====================================================================
// PARTE 3: INICIALIZACIÓN
// Ejecuta el efecto una vez que la página ha cargado.
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Aplica el efecto Glitch al título y a los botones
    GlitchEffect();
});