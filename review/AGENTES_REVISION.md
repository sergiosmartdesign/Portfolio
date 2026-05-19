# Agentes de Revisión — Portafolio Web

Referencia para relanzar los 4 agentes expertos en futuras auditorías. Lanzar siempre en paralelo.

---

## Cómo relanzar

En Claude Code, decir:
> "Lanza los 4 agentes de auditoría del portafolio en paralelo según AGENTES_REVISION.md"

El agente principal lee este archivo, lanza los 4 agentes con sus prompts actualizados, espera los 4 resultados, y genera un nuevo `AUDITORIA_RESULTADO.html`.

---

## Estado actual (Mayo 2026)

| Agente | Score | Última revisión |
|--------|-------|----------------|
| Arquitectura de Software | 6.2/10 | 2026-05-19 |
| UI/UX y Accesibilidad | 7.1/10 | 2026-05-19 |
| Dirección de Arte | 8.1/10 | 2026-05-19 |
| Performance y Optimización | 4.5/10 | 2026-05-19 |
| **Promedio** | **6.5/10** | **2026-05-19** |

**Reporte completo:** `review/AUDITORIA_RESULTADO.html`

---

## Issues pendientes (por prioridad)

Issues que ya se encontraron — actualizar conforme se resuelvan para que los agentes sepan qué ya está hecho.

### Críticos (sin resolver)
- [ ] `ux-004` — mailto:placeholder@mail.com en #seal-cta → cambiar a sergionook@gmail.com
- [ ] `perf-001` — 113 MB de JPGs sin comprimir en /images/photo/
- [ ] `perf-003` — GSAP cargado después de sus dependencias (orden de scripts roto)
- [ ] `perf-002` — 23 scripts sin defer/async
- [ ] `ux-001` — prefers-reduced-motion ignorado en styles.css

### Altos (sin resolver)
- [ ] `perf-005` — Sin cache headers en _headers ni .htaccess
- [ ] `perf-010` — Sin width/height en <img> (CLS risk)
- [ ] `perf-014` — Sin preload para imagen LCP
- [ ] `perf-009` — Background images JPEG sin WebP fallback
- [ ] `ux-002` — Sin navegación móvil (hamburger/off-canvas)
- [ ] `ux-009` — Focus indicators ausentes en la mayoría de elementos
- [ ] `ux-014` — Modal art-direction sin focus trap
- [ ] `arch-001` — Static-line canvas copy-paste 4 veces (~350 líneas)
- [ ] `arch-002` — window.playArtEntranceAnimation monkey-patched 3 veces
- [ ] `art-004` — Sin breakpoints responsive en styles.css
- [ ] `art-005` — #main-title sin clamp() — 3.5rem fijo

### Medios (sin resolver)
- [ ] `perf-004` — 10 CSS render-blocking
- [ ] `perf-007` — 18 JS sin bundle/minify
- [ ] `arch-003` — script.js 2179 líneas (god module)
- [ ] `ux-003` — Language buttons sin aria-pressed
- [ ] `ux-005` — Falta hreflang en <head>
- [ ] `ux-013` — polaroidPhoto.alt nunca se actualiza en JS
- [ ] `arch-004` — BarcodeAnimation referenciado pero no definido
- [ ] `arch-010` — og-image.jpg no existe, TODO comments en prod
- [ ] `art-001` — #ee9b00 hardcoded 18+ veces en cert-gallery.css
- [ ] `art-003` — Tensión cyan/amber no resuelta en interactive states
- [ ] `art-002` — Playwrite DK Loopet sin uso (carga innecesaria)
- [ ] `art-013` — rgba(255,223,0) en art-direction hover — fuera de paleta

### Bajos (sin resolver)
- [ ] `arch-005` — chroma.min.js y photo-polaroids.js (tombstone) sin eliminar
- [ ] `arch-006` — mulberry32 PRNG duplicado en 2 archivos
- [ ] `arch-012` — Sin error boundaries en DOMContentLoaded
- [ ] `art-006` — cubic-bezier distintivos no tokenizados
- [ ] `perf-012` — 2 scroll listeners sin { passive: true }

---

## Prompts de los agentes

### Agente 1: Arquitectura de Software

```
Eres un experto en Arquitectura de Software revisando un portfolio web personal.
Proyecto: /Users/sersh/Portfolio/web

Lee estos archivos: index.html, js/script.js, js/photo-polaroids.js, js/cert-gallery.js,
js/art-direction-slider.js, js/browser-detect.js, js/i18n.js, js/preloader.js,
css/styles.css, y todos los CSS en css/.

Contexto de revisiones anteriores (Mayo 2026, score 6.2/10):
Issues ya conocidos y su estado actual están en review/AGENTES_REVISION.md —
léelo primero para no reportar issues ya resueltos y para actualizar scores de los que sí se resolvieron.

Analiza y reporta en JSON:
{
  "agent": "Arquitectura de Software",
  "score": <0-10>,
  "summary": "<2-3 oraciones honestas>",
  "strengths": [...],
  "resolved_since_last": ["<issue-id: descripción de qué cambió>"],
  "issues": [{ "id", "sev": "critical|high|medium|low", "title", "file", "desc", "rec", "effort", "impact" }],
  "metrics": { "js_files", "css_files", "estimated_js_lines", "estimated_css_lines", "classes_found", "global_variables", "duplicated_patterns" }
}
Solo JSON, sin markdown alrededor.
```

### Agente 2: UI/UX y Accesibilidad

```
Eres un experto en UI/UX y Accesibilidad revisando un portfolio web personal.
Proyecto: /Users/sersh/Portfolio/web

Lee: index.html, css/styles.css, js/script.js, js/i18n.js, js/scroll-hint.js,
css/scroll-hint.css, css/contact.css, js/contact.js.

Contexto: Revisión anterior Mayo 2026 score 7.1/10. Issues conocidos en review/AGENTES_REVISION.md.
Lee ese archivo primero para no reportar issues ya resueltos.

Evalúa: HTML semántico, ARIA, navegación por teclado, contraste, responsive,
SEO meta tags, hreflang, forms, focus states, prefers-reduced-motion, i18n, touch targets.

Reporta JSON:
{
  "agent": "UI/UX y Accesibilidad",
  "score": <0-10>,
  "summary": "<2-3 oraciones>",
  "strengths": [...],
  "resolved_since_last": ["<issue-id: qué cambió>"],
  "issues": [{ "id", "sev", "title", "file", "desc", "rec", "effort", "impact" }],
  "metrics": { "has_lang_attribute", "has_og_tags", "has_viewport_meta", "has_skip_link",
    "has_reduced_motion", "heading_levels_found", "images_without_alt", "aria_labels_found", "bilingual_support" }
}
Solo JSON.
```

### Agente 3: Dirección de Arte

```
Eres un Director de Arte y experto en Diseño Visual revisando un portfolio web.
Proyecto: /Users/sersh/Portfolio/web

Lee: css/styles.css, css/cert-gallery.css, css/art-direction-slider.css,
css/art-direction-list.css, css/preloader.css, css/contact.css, css/inf-bracket.css,
css/illus-cube.css, index.html, js/art-direction-slider.js, js/photo-polaroids.js.

Contexto: Revisión anterior Mayo 2026 score 8.1/10. Issues conocidos en review/AGENTES_REVISION.md.
Vocabulario clave del proyecto: paleta Smithsonian 10-colores (#001219→#9B2226),
estética VHS/synthwave/cyberpunk, Funnel Display + Share Tech Mono, 58 animaciones coreografiadas.

Evalúa: design tokens, paleta, tipografía, spacing, animaciones, identidad de marca,
consistencia visual, jerarquía, tendencias 2025, unicidad creativa.

Reporta JSON:
{
  "agent": "Dirección de Arte",
  "score": <0-10>,
  "summary": "<2-3 oraciones>",
  "strengths": [...],
  "resolved_since_last": ["<issue-id: qué cambió>"],
  "issues": [{ "id", "sev", "title", "file", "desc", "rec", "effort", "impact" }],
  "metrics": { "css_variables_count", "color_palette", "fonts_used", "animation_count",
    "has_dark_mode", "has_design_tokens", "spacing_system", "unique_creative_elements" }
}
Solo JSON.
```

### Agente 4: Performance y Optimización

```
Eres un ingeniero de Performance revisando un portfolio web.
Proyecto: /Users/sersh/Portfolio/web

Ejecuta estos comandos para métricas:
wc -c /Users/sersh/Portfolio/web/js/lib/*.js
wc -c /Users/sersh/Portfolio/web/js/*.js
wc -c /Users/sersh/Portfolio/web/css/*.css
wc -c /Users/sersh/Portfolio/web/index.html
find /Users/sersh/Portfolio/web/images -type f | sed 's/.*\.//' | sort | uniq -c
grep -c '<script' /Users/sersh/Portfolio/web/index.html
grep -c 'async\|defer' /Users/sersh/Portfolio/web/index.html
grep -c 'loading="lazy"' /Users/sersh/Portfolio/web/index.html
grep 'preload\|prefetch\|preconnect' /Users/sersh/Portfolio/web/index.html

Lee: index.html, js/script.js, js/photo-vfx.js, js/orb-3d.js, js/particle-system.js,
css/styles.css, _headers, .htaccess.

Contexto: Revisión anterior Mayo 2026 score 4.5/10. Issues conocidos en review/AGENTES_REVISION.md.
Issues críticos de la revisión anterior: 113MB JPGs, 23 scripts sin defer, GSAP load order roto,
sin cache headers.

Reporta JSON:
{
  "agent": "Performance y Optimización",
  "score": <0-10>,
  "summary": "<2-3 oraciones>",
  "strengths": [...],
  "resolved_since_last": ["<issue-id: qué cambió>"],
  "issues": [{ "id", "sev", "title", "file", "desc", "rec", "effort", "impact" }],
  "metrics": { "total_js_kb", "total_css_kb", "total_html_kb", "script_count",
    "css_file_count", "images_without_lazy", "uses_webp", "has_resource_hints",
    "has_cache_headers", "render_blocking_scripts" }
}
Solo JSON.
```

---

## Cómo actualizar este archivo después de cada auditoría

1. Actualizar la tabla de scores con la fecha
2. Marcar como `[x]` los issues que ya se resolvieron
3. Agregar nuevos issues que hayan aparecido
4. Actualizar el link al reporte HTML más reciente
5. Agregar una nueva fila en el historial

---

## Historial de auditorías

| Fecha | Arch | UX | Arte | Perf | Promedio | Reporte |
|-------|------|----|------|------|----------|---------|
| 2026-05-19 | 6.2 | 7.1 | 8.1 | 4.5 | 6.5 | AUDITORIA_RESULTADO.html |
