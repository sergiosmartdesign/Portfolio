# Arquitectura — Auditoría Correcciones 1

Fecha: 2026-05-23  
Rama: `main`  
Auditor: Claude Sonnet 4.6

---

## Ítem 1 — Módulos ESM mezclados con scripts defer

**Problema**  
`script.js` era `type="module"` e importaba 4 módulos ESM (`static-line.js`, `svg-inline.js`, `art-direction.js`, `about-pin.js`) más `constants.js`. El resto de scripts usaban `defer` + IIFE + `App.*`. Los módulos ESM se ejecutan después de todos los `defer` por comportamiento de los navegadores — no por especificación —, creando un contrato implícito que podía romperse. `App.playArtEntranceAnimation` se asignaba como side-effect de `art-direction.js` (importado por el módulo) y era llamado desde listeners que podrían dispararse antes de que el módulo terminara en condiciones de red lentas.

**Fix aplicado**  
Todos los scripts convertidos a `defer` global unificado:
- `constants.js`, `static-line.js`, `svg-inline.js`, `art-direction.js`, `about-pin.js` → IIFEs con `'use strict'`, exponen sus funciones en `window.*`
- `script.js` → eliminados los 5 `import`, añadido `'use strict'` explícito, cambiado `type="module"` a `defer`
- `index.html` → 5 nuevas etiquetas `<script defer>` en orden antes de `script.js`

**Por qué `window.*` y no `App.*`**  
`App.*` documenta estado de runtime inter-módulo (pause/resume, manager instances). Las 5 funciones son helpers de inicialización usados sólo por `script.js` — añadirlas a `App` cambiaría su semántica de "registro de estado compartido" a "registro de funciones".

---

## Ítem 2 — og-image.jpg referenciado pero inexistente

**Problema**  
`<meta property="og:image">`, `<meta name="twitter:image">` y el JSON-LD hacían referencia a `https://sergioayala.design/images/og-image.jpg`. El archivo no existía, causando un 404 en todos los crawlers sociales (LinkedIn, Twitter/X, WhatsApp, Slack) y en los bots de SEO estructurado.

**Fix aplicado**  
Generado `images/og-image.jpg` con ImageMagick 7:
- Fuente: `images/intro robot.jpeg` (2732×2048, artwork hero del portfolio)
- Dimensiones finales: **1200×630 px** (estándar OG)
- Composición: hero centrado + gradiente oscuro en franja inferior (290 px) + texto "SERGIO AYALA" en blanco + rol en amber `#EE9B00` + dominio en gris
- Peso: 71 KB @ quality 88 — dentro del rango óptimo para crawlers (< 300 KB)
- Paleta del texto alineada con los design tokens del portfolio

---

## Ítem 3 — i18n.js: 430/448 líneas eran datos de traducción inline

**Problema**  
El objeto `TRANSLATIONS` con 139 claves en EN + 139 claves en ES ocupaba ~330 líneas dentro del IIFE de `i18n.js`. Imposibilitaba lazy-loading del idioma no-default y mezclaba datos con lógica. Cualquier edición editorial requería abrir el archivo JS.

**Fix aplicado**  
- Creados `locales/en.json` y `locales/es.json` (139 claves cada uno, validadas con `node -e`)
- `i18n.js` reescrito: **448 → 144 líneas** (-68%)
- El fetch del locale por defecto (EN) arranca en el cuerpo del script (antes de DOMContentLoaded) para que esté en vuelo mientras el navegador construye el DOM
- ES se carga lazily sólo cuando el usuario cambia de idioma
- `App.LanguageManager.ready` expuesto como Promise que resuelve después de `DOMContentLoaded` + fetch de EN completado
- `script.js`: una línea cambiada — `window.addEventListener('DOMContentLoaded', ...)` → `App.LanguageManager.ready.then(...)` — garantiza que Splitting.js procese elementos ya traducidos

**Por qué coordinar con `.ready` y no con `DOMContentLoaded`**  
Splitting.js fragmenta el texto en `<span>` por carácter en el constructor de `GlitchSystem`. Si Splitting corre antes de que las traducciones se apliquen, los `<span>` contienen el texto por defecto del HTML y el cambio posterior a ES no re-fragmenta correctamente. `.ready` es el contrato explícito que elimina esa condición de carrera.

---

## Ítem 4 — Easing tokens con self-references circulares

**Estado**  
Ya corregido en commit `b5f47ef` ("fix: restore self-referential easing tokens to real cubic-bezier values") antes de esta sesión de auditoría. Los tokens actuales son:

```css
--ease-expo-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-material: cubic-bezier(0.4, 0, 0.2, 1);
```

No se requirió acción.

---

## Ítem 5 — `_animateRowsIn()` hardcodeaba valores de timing

**Problema**  
`_animateRowsIn()` en `art-direction-panel.js` mutaba inline styles directamente:
```js
row.style.opacity    = '0';
row.style.transform  = 'translateY(10px)';
row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
```
Los valores `0.3s`, `ease`, `10px`, `20 + i * 60` y `340` eran literales hardcodeados que bypaseaban completamente el sistema de design tokens (`--duration-*`, `--ease-*`). Además, las mutaciones inline tienen mayor especificidad que cualquier regla CSS, bloqueando overrides desde la hoja de estilos.

**Fix aplicado**  
**CSS** — añadidas dos clases en `art-direction-panel.css`:
```css
#art-direction .ad-work-item.ad-row-entering {
  opacity: 0;
  transform: translateY(10px);
  transition: none;
}

#art-direction .ad-work-item.ad-row-visible {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity   var(--duration-quick) var(--ease-expo-out),
    transform var(--duration-quick) var(--ease-expo-out);
  transition-delay: calc(20ms + var(--row-index, 0) * 60ms);
}
```

**JS** — `_animateRowsIn()` reescrita: cero mutaciones de `style.*` en filas individuales:
```js
rows.forEach((row, i) => {
    row.style.setProperty('--row-index', i);
    row.classList.add('ad-row-entering');
});
void this.table.offsetWidth; // flush CSSOM
rows.forEach(row => {
    row.classList.remove('ad-row-entering');
    row.classList.add('ad-row-visible');
});
```

El stagger (`20ms + i * 60ms`) se convierte en dato CSS puro vía `transition-delay: calc(...)` con `--row-index`. Duración y easing referencian `--duration-quick` y `--ease-expo-out` respectivamente.

---

## Resumen de archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `js/constants.js` | ESM export → IIFE + `window.GLITCH_CHARS` |
| `js/static-line.js` | ESM exports → IIFE + `window.*` |
| `js/svg-inline.js` | ESM export → IIFE + `window.*` |
| `js/art-direction.js` | ESM export + import → IIFE + `window.*` |
| `js/about-pin.js` | ESM export → IIFE + `window.*` |
| `js/script.js` | Remove 5 imports; `type=module` → `defer`; DOMContentLoaded → `.ready.then()` |
| `js/i18n.js` | 448 → 144 líneas; fetch dinámico; `.ready` Promise |
| `js/art-direction-panel.js` | `_animateRowsIn()`: inline styles → class toggle |
| `index.html` | 5 nuevas etiquetas `<script defer>`; `type=module` eliminado |
| `css/art-direction-panel.css` | Añadidas `.ad-row-entering` / `.ad-row-visible` |
| `locales/en.json` | Nuevo — 139 claves EN |
| `locales/es.json` | Nuevo — 139 claves ES |
| `images/og-image.jpg` | Nuevo — OG image 1200×630 px |
