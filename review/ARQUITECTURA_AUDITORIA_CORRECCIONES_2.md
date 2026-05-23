# Arquitectura — Auditoría Correcciones 2

Fecha: 2026-05-23  
Modelo: Claude Sonnet 4.6  
Sesión: correcciones de arquitectura sobre hallazgos de la auditoría anterior

---

## Corrección 1 — `GLITCH_CHARS` duplicado en 3 archivos

### Problema
La constante `GLITCH_CHARS` estaba copiada literalmente en tres archivos con un comentario "keep in sync":

- `js/script.js:15`
- `js/art-direction.js:15`
- `js/preloader.js:8`

Cualquier cambio en el string requería editar los tres archivos manualmente. El comentario no indicaba cuál era el canónico ni por qué existía la copia.

### Solución

**Archivo creado:** `js/constants.js`  
IIFE que expone `window.GLITCH_CHARS` como fuente de verdad única:

```js
(function () {
  'use strict';
  window.GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');
}());
```

**`script.js` y `art-direction.js`:** eliminadas sus copias locales; acceden al global `GLITCH_CHARS` (= `window.GLITCH_CHARS`) como el resto del codebase.

**`preloader.js`:** conserva su copia deliberadamente porque se carga como IIFE clásico en la línea 406 del HTML, antes de que ningún otro script haya ejecutado. Convertirlo a módulo retrasaría el preloader y rompería su propósito. El comentario fue reemplazado por una explicación arquitectónica precisa:

```js
// Canonical lives in constants.js — duplicated here intentionally because
// preloader runs as a classic IIFE before ES module infrastructure loads.
// If you change the string, update constants.js to match.
```

**`index.html`:** `constants.js` añadido como `<script defer>` antes de `script.js` y `art-direction.js`.

### Resultado
- Una sola fuente de verdad para `GLITCH_CHARS`
- La copia en `preloader.js` está documentada con motivo y dirección de actualización
- Los comentarios "keep in sync" (sin precedencia clara) fueron eliminados

---

## Corrección 2 — `photo-portfolio.js` god module (1598 líneas)

### Problema
`photo-portfolio.js` era un único IIFE de 1598 líneas que mezclaba subsistemas sin relación entre sí:

- Stream de imágenes fantasma + RAF loop
- Lightbox por tarjeta
- Reveal canvas scratch-off (polaroid)
- Caption voladora (clon que sigue el hover al fondo del viewport)
- Animación de cadena de intro (chain animation)
- Acordeón de categorías
- Efectos hover + ScrambleText
- Bordes eléctricos (dos instancias independientes)
- Strip de información animado

### Solución

Se extrajeron tres subsistemas autocontenidos al patrón `window.Photo.*` (IIFE + namespace global, consistente con el resto del codebase):

#### `js/photo-ghost-stream.js` — 301 líneas
Clase `GhostStream`. Responsabilidades:
- RAF loop del stream horizontal de tarjetas
- Renderer puro `_renderStream()` con caché `_cardHidden` (evita escrituras DOM redundantes ~90% de frames)
- Transiciones de estado: `idle → active → idle`
- `pauseRaf()` / `resumeRaf()` para tabs ocultas
- `deactivate()` (limpieza parcial) vs `reset()` (limpieza total) — distinción semántica necesaria porque `_cancelChain` y el scroll tick tienen responsabilidades diferentes
- Strip de información animado (`startInfoAnim` / `stopInfoAnim`)
- Lightbox por tarjeta (construcción DOM, apertura/cierre, electric border)

#### `js/photo-polaroid.js` — 238 líneas
Clase `PolaroidReveal`. Responsabilidades:
- Canvas scratch-off HiDPI-aware con `destination-out`
- Selección aleatoria de imagen + caption reveal
- Click-to-activate: abre el acordeón correspondiente y activa el item
- `init()` / `reset()` llamados por la chain animation

Recibe referencia al manager (`this._mgr`) para leer estado compartido (`inPhase3`, `openCategories`, `originalTexts`) y llamar helpers compartidos (`showBackgroundImage`, `_openCategory`, `contentScroll`). Es dependency injection estándar — la alternativa (pasar 6 callbacks) sería peor acoplamiento.

#### `js/photo-fly-caption.js` — 143 líneas
Clase `FlyCaption`. Responsabilidades:
- Construye un clon `<li>` del item hovereado
- Lo anima hacia una posición fija en el fondo del viewport (GSAP)
- Quick-switch cuando el hover cambia a otro item (ScrambleText en el clon existente)
- `return()` lo devuelve a su origen con animación inversa
- `clear()` limpieza instantánea (scroll fuera de fase, resize)

Recibe solo `originalTexts` (el Map) — no necesita referencia al manager completo.

#### `js/photo-portfolio.js` — 989 líneas (antes 1598)
Queda como orquestador. Retiene:
- Chain animation (~250 líneas) — no extraíble sin empeorer el acoplamiento; coordina accordion + stream + polaroid + hover + GSAP de forma inherentemente entrelazada
- Acordeón de categorías
- Animaciones glitch (`_revealItem`, `_hideItem`, `_bounceHideItem`)
- Hover + ScrambleText
- Imagen de fondo + electric border del bg
- Scramble text manual (highlights)

**Cambios en el orquestador al delegar:**
- `this._initPolaroid()` → `this.polaroid.init()`
- `this._clearFlyClone()` → `this.caption.clear()`
- `this._tickStream()` → `this.stream.tick(rawProgress)`
- `this._streamCanPlay = true; this._startInfoAnim()` → `this.stream.canPlay = true; this.stream.startInfoAnim()`
- `this._stopInfoAnim(); this._stream?.classList.remove(...)` → `this.stream.deactivate()`
- `this._pauseAllRafs()` / `_resumeAllRafs()` → delegan al stream, retienen accordion border y photo border

**`index.html`:** los tres archivos nuevos añadidos como `<script defer>` inmediatamente antes de `photo-portfolio.js`, después de GSAP y ScrambleTextPlugin (dependencias globales que todos necesitan).

```html
<script defer src="js/lib/gsap.min.js"></script>
<script defer src="js/lib/ScrambleTextPlugin.min.js"></script>
<script defer src="js/photo-ghost-stream.js"></script>
<script defer src="js/photo-polaroid.js"></script>
<script defer src="js/photo-fly-caption.js"></script>
<script defer src="js/photo-portfolio.js"></script>
```

### Resultado

| Archivo | Líneas | Estado |
|---|---|---|
| `photo-portfolio.js` (original) | 1598 | eliminado / reescrito |
| `photo-ghost-stream.js` | 301 | nuevo |
| `photo-polaroid.js` | 238 | nuevo |
| `photo-fly-caption.js` | 143 | nuevo |
| `photo-portfolio.js` (nuevo) | 989 | orquestador |

Reducción del archivo principal: **−609 líneas (−38%)**. Los tres módulos extraídos tienen responsabilidad única y son testables de forma aislada.

---

## Corrección 3 — `art-direction-slider.js` nombre engañoso

### Problema
El archivo `js/art-direction-slider.js` (y su CSS hermano `css/art-direction-slider.css`) no contienen ningún slider. La clase principal es `ArtWorksPanel`; el archivo gestiona un panel de obras con tabla filtrable por disciplina. El nombre `slider` es un vestigio de una intención de diseño anterior que nunca se implementó.

### Solución

Renombrado en sistema de ficheros y actualizadas todas las referencias activas en `index.html`:

```
js/art-direction-slider.js  →  js/art-direction-panel.js
css/art-direction-slider.css →  css/art-direction-panel.css
```

```html
<!-- index.html — antes -->
<link rel="stylesheet" href="css/art-direction-slider.css">
<script defer src="js/art-direction-slider.js"></script>

<!-- index.html — después -->
<link rel="stylesheet" href="css/art-direction-panel.css">
<script defer src="js/art-direction-panel.js"></script>
```

El archivo de auditoría histórico en `review/AUDITORIA_RESULTADO.html` no fue modificado — es un artefacto de referencia, no código activo.

### Resultado
- Nombre alineado con la clase que contiene (`ArtWorksPanel`) y con la función real del archivo (panel, no slider)
- Sin cambios de comportamiento ni de contenido
- Cero referencias activas al nombre antiguo fuera del directorio `review/`
