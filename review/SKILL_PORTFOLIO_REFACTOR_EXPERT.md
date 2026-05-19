# 🏆 SKILL: Portfolio Refactor Expert
## Guía Completa para Claude Code

---

## 📌 RESUMEN EJECUTIVO

**Skill especializado** para refactorizar portafolios web bilingües (HTML, CSS, JavaScript) utilizando un **sistema de 4 agentes expertos independientes** que analizan el código desde perspectivas distintas y generan recomendaciones en un **panel interactivo de aprobación**.

**Objetivo Final:** Optimizar tu portafolio para **ganar premios** como CSS Design Awards, Awwwards y CSS Winner basándose en análisis de ganadores 2025.

---

## 🎯 FLUJO COMPLETO (Paso a Paso)

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 0: PREPARACIÓN (Terminal)                                   │
│ $ cd /ruta/portafolio && git status                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: INVOCACIÓN (Claude Code)                                │
│ $ claude-code portfolio-refactor-expert analyze \                │
│   --repo-path . \                                                │
│   --github-url https://github.com/tu-usuario/portafolio         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: ANÁLISIS PARALELO (4 Agentes Expertos)                  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Agente Arq.      │  │ Agente UI/UX     │                     │
│  │ - Estructura     │  │ - Accesibilidad  │                     │
│  │ - Patrones       │  │ - Usabilidad     │                     │
│  │ - Modularidad    │  │ - Interactividad │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Agente Arte      │  │ Agente Perfor.   │                     │
│  │ - Diseño Visual  │  │ - Velocidad      │                     │
│  │ - Marca          │  │ - Optimización   │                     │
│  │ - Animaciones    │  │ - Bundle size    │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│ ⏱️  Tiempo: 5-15 minutos                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: GENERACIÓN PRESENTACIÓN (HTML + PDF)                    │
│                                                                  │
│ 📄 presentation.html   → Interactivo, tabs por experto          │
│ 📋 presentation.pdf    → Formal, reportes profesionales         │
│ 📊 metrics-before.json → Métricas actuales del código           │
│                                                                  │
│ ⏱️  Tiempo: 2-3 minutos                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: REVISIÓN DEL USUARIO (Interactivo)                      │
│                                                                  │
│ 🎨 panel-interactivo.html → React Dashboard                     │
│  - ✅ Checkboxes para cada sugerencia                           │
│  - 👁️ Preview en tiempo real de cambios                        │
│  - ⚠️ Detectar conflictos entre recomendaciones                 │
│  - ⏱️ Estimado de tiempo por cambio                             │
│  - 🔄 Sincronización con analysis-results.json                  │
│                                                                  │
│ 🎯 USUARIO DECIDE:                                              │
│    ✅ Aplicar / ❌ Rechazar cada sugerencia                     │
│                                                                  │
│ 💾 Salida: approved-changes.json                                │
│                                                                  │
│ ⏱️  Tiempo: Tú decides (5-30 minutos típicamente)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: EJECUCIÓN AUTOMÁTICA (No Reversible)                   │
│                                                                  │
│ $ claude-code portfolio-refactor-expert execute \               │
│   --changes-file approved-changes.json \                        │
│   --backup true                                                  │
│                                                                  │
│ ✅ Backup creado automáticamente en: backups/v1-[timestamp]/   │
│ ✅ Cambios aplicados a archivos fuente                          │
│ ✅ Código validado y formateado                                 │
│ ✅ Logs generados: refactor-execution.log                       │
│                                                                  │
│ ⏱️  Tiempo: 5-20 minutos (depende de cantidad de cambios)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 6: VALIDACIÓN Y REPORTE FINAL                              │
│                                                                  │
│ 🧪 Tests ejecutados (si existen)                                │
│ 📊 Métricas después: metrics-after.json                         │
│ 📈 Comparativa: antes vs después                                │
│ 📄 Final Report: refactor-final-report.pdf                      │
│                                                                  │
│ ⏱️  Tiempo: 2-3 minutos                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 LOS 4 AGENTES EXPERTOS DETALLADOS

### 1️⃣ **AGENTE ARQUITECTURA DE SOFTWARE**

**Rol:** Experto en Patrones, Estructura y Escalabilidad

**Analiza:**
```
✅ Organización de carpetas y archivos
   └─ Estructura: /src, /styles, /components, /assets, etc.

✅ Patrones de diseño aplicados
   └─ MVC, Componentes, Modular, Singleton, etc.

✅ Duplicación y reutilización de código
   └─ Detecta copy-paste > 3 veces

✅ Separación de responsabilidades
   └─ HTML describe, CSS estiliza, JS interactúa

✅ Dependencias y librerías
   └─ ¿Son necesarias todas? ¿Hay alternativas más ligeras?

✅ Configuración de build tools
   └─ Webpack, Vite, Rollup, etc.

✅ Gestión de estado
   └─ Si usa frameworks, ¿estado bien gestionado?

✅ Type Safety (si usa TypeScript)
   └─ Coverage, strict mode, types completos
```

**Recomienda:**
- 🔄 Refactorización de estructura de carpetas
- 📦 Modularización de código duplicado
- 🏗️ Implementación de patrones de diseño
- 🔗 Mejor separación de responsabilidades
- 🧹 Eliminación de código muerto
- ⚙️ Optimización de configuración de build
- 📊 Gestión de dependencias más eficiente

**Impacto:** Alto (afecta toda la base de código)

---

### 2️⃣ **AGENTE UI/UX**

**Rol:** Experto en Experiencia de Usuario y Accesibilidad

**Analiza:**
```
✅ Accesibilidad WCAG 2.1
   └─ Contraste de colores, etiquetas ARIA, navegación por teclado

✅ Responsive Design
   └─ Mobile-first, media queries, viewports

✅ Tiempo de carga percibido
   └─ Lazy loading, skeleton screens, progresivo enhancement

✅ Navegación e información
   └─ Arquitectura de información, breadcrumbs, sitemap

✅ Interactividad y feedback
   └─ Botones, forms, validación, estados visuales

✅ Mobile-first approach
   └─ Touch targets, tamaños adecuados, performance en 3G

✅ SEO básico
   └─ Meta tags, heading hierarchy, alt text

✅ Micro-interacciones
   └─ Hover states, transitions, loading indicators

✅ Gestión de errores
   └─ 404, timeouts, validación de forms
```

**Recomienda:**
- ♿ Mejoras de accesibilidad (ARIA, contraste)
- 📱 Optimización responsive
- ⚡ Mejora de tiempo percibido (lazy load, skeleton)
- 🎯 Mejor flujo de usuario
- 🎨 Micro-interacciones más pulidas
- 📊 Mejor SEO on-page
- 🛡️ Mejor manejo de errores

**Impacto:** Alto (afecta experiencia de usuarios)

---

### 3️⃣ **AGENTE DIRECCIÓN DE ARTE**

**Rol:** Experto en Diseño Visual y Dirección Creativa

**Analiza:**
```
✅ Consistencia visual
   └─ ¿Todos los elementos siguen el mismo sistema?

✅ Paleta de colores
   └─ ¿Es coherente? ¿Sigue principios de contraste?

✅ Tipografía
   └─ Fuentes, tamaños, line-height, spacing

✅ Espaciado y alineación (Whitespace)
   └─ Padding, margin, grid system

✅ Animaciones y transiciones
   └─ Duración, easing, propósito

✅ Identidad de marca
   └─ Logo, colores primarios, valores visuales

✅ Elementos visuales
   └─ Iconos, ilustraciones, fotografía

✅ Tendencias de diseño 2025
   └─ Gradientes, glassmorphism, dark mode, 3D

✅ Jerarquía visual
   └─ Qué elementos destacan, qué es secundario
```

**Recomienda:**
- 🎨 Mejoras visuales y consistencia
- 🌈 Optimización de paleta de colores
- ✍️ Mejora de tipografía y legibilidad
- 🎬 Animaciones más pulidas y propositivas
- 🏷️ Mejor jerarquía visual
- 🎯 Alineación con identidad de marca
- 📈 Modernización del diseño (tendencias 2025)

**Impacto:** Alto (afecta percepción y atracción visual)

---

### 4️⃣ **AGENTE PERFORMANCE**

**Rol:** Experto en Optimización y Velocidad

**Analiza:**
```
✅ Tamaño de archivos
   └─ HTML, CSS, JS minificado ¿Está optimizado?

✅ Número de requests
   └─ ¿Se pueden agrupar? ¿CDN en uso?

✅ Compresión de assets
   └─ Imágenes en WebP, SVG optimizado, fuentes comprimidas

✅ CSS no usado (Unused CSS)
   └─ PurgeCSS, unused selectors

✅ JavaScript no utilizado
   └─ Code splitting, tree-shaking

✅ Tiempo de ejecución JS
   └─ Scripts largos bloqueantes, async/defer

✅ Core Web Vitals
   └─ LCP, FID, CLS (Google metrics)

✅ Métricas Lighthouse
   └─ Performance, Accessibility, Best Practices, SEO

✅ Caché y estrategia de carga
   └─ Service Workers, HTTP caching

✅ Renders performance
   └─ Reflows, repaints, 60fps
```

**Recomienda:**
- 🖼️ Optimización agresiva de imágenes
- ⏳ Lazy loading de imágenes y componentes
- 📦 Code splitting y dynamic imports
- 🗜️ Minificación y compresión
- 🔄 Caché estratégico
- 🧹 Eliminación de código muerto
- 🌳 Tree-shaking de dependencias
- 📈 Core Web Vitals > 90

**Impacto:** Crítico (afecta velocidad y SEO)

---

## 📊 ARCHIVOS GENERADOS

### 1. **presentation.html** 
```html
<!-- Interfaz interactiva con tabs -->
<header>Análisis Portafolio - [Tu nombre]</header>

<nav>
  <tab id="tab-resumen">📊 Resumen Ejecutivo</tab>
  <tab id="tab-arquitectura">🏗️ Arquitectura</tab>
  <tab id="tab-ui-ux">♿ UI/UX</tab>
  <tab id="tab-arte">🎨 Dirección de Arte</tab>
  <tab id="tab-performance">⚡ Performance</tab>
</nav>

<!-- Cada tab contiene:
     - Análisis detallado
     - Métricas (antes/después estimado)
     - Sugerencias priorizadas por impacto
     - Links a archivos específicos a cambiar
-->
```

**Características:**
- ✅ Interfaz moderna y profesional
- ✅ Tabs navegables
- ✅ Gráficos de impacto
- ✅ Links a código específico
- ✅ Estimado de esfuerzo/tiempo
- ✅ Priorización clara
- ✅ Exportable a PDF

---

### 2. **presentation.pdf**
```
📄 Portfolio Refactor Analysis Report
   
┌─────────────────────────────────┐
│ PORTADA PROFESIONAL             │
│ Tu Nombre / Portfolio Name      │
│ Fecha del Análisis              │
└─────────────────────────────────┘

📋 TABLA DE CONTENIDOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. RESUMEN EJECUTIVO (1 página)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Métricas generales
   • Puntuación antes/después
   • Top 5 prioridades
   • Impacto estimado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. ANÁLISIS ARQUITECTURA (2 páginas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Estado actual
   • Problemas identificados
   • Recomendaciones
   • Beneficios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. ANÁLISIS UI/UX (2 páginas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Auditoría de accesibilidad
   • Análisis responsive
   • Problemas de usabilidad
   • Mejoras recomendadas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. ANÁLISIS DIRECCIÓN DE ARTE (2 páginas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Auditoría visual
   • Consistencia de marca
   • Recomendaciones de diseño
   • Tendencias 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. ANÁLISIS PERFORMANCE (2 páginas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Métricas de velocidad
   • Core Web Vitals
   • Oportunidades de optimización
   • Impacto en SEO/UX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. PLAN DE ACCIÓN (1 página)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Cambios recomendados (47)
   • Prioridad y esfuerzo
   • Timeline estimado
```

**Características:**
- ✅ Profesional y formal
- ✅ Gráficos y métricas
- ✅ Análisis estructurado
- ✅ Recomendaciones claras
- ✅ Estimado de impacto
- ✅ Plan de acción implementable

---

### 3. **panel-interactivo.html** (React/Vanilla JS)

```html
<!-- DASHBOARD INTERACTIVO -->

<header>
  <h1>🎯 Panel de Aprobación de Cambios</h1>
  <p>Selecciona qué cambios deseas aplicar a tu portafolio</p>
</header>

<aside class="sidebar">
  <!-- ESTADÍSTICAS -->
  <div class="stats">
    <div class="stat">
      <span class="label">Total Cambios</span>
      <span class="value">47</span>
    </div>
    <div class="stat">
      <span class="label">Aprobados</span>
      <span class="value">0</span>
    </div>
    <div class="stat">
      <span class="label">Impacto Estimado</span>
      <span class="value">Alto</span>
    </div>
  </div>

  <!-- FILTROS -->
  <div class="filters">
    <h3>Filtrar por Categoría</h3>
    <label>
      <input type="checkbox" value="arquitectura" checked>
      🏗️ Arquitectura (12)
    </label>
    <label>
      <input type="checkbox" value="ui-ux" checked>
      ♿ UI/UX (18)
    </label>
    <label>
      <input type="checkbox" value="arte" checked>
      🎨 Arte (10)
    </label>
    <label>
      <input type="checkbox" value="performance" checked>
      ⚡ Performance (7)
    </label>
  </div>
</aside>

<main class="changes-list">
  <!-- CAMBIOS ORGANIZADOS POR CATEGORÍA -->
  
  <section class="category" data-category="arquitectura">
    <h2>🏗️ ARQUITECTURA (12 cambios)</h2>
    
    <div class="change-item" data-id="arch-001">
      <div class="header">
        <input type="checkbox" class="approval-checkbox">
        <h3>Modularizar componentes CSS</h3>
        <span class="impact high">Alto Impacto</span>
        <span class="effort medium">Medio Esfuerzo</span>
      </div>
      
      <div class="description">
        <p>Actualmente todos los estilos están en main.css. 
           Se recomienda dividir en componentes modulares.</p>
      </div>
      
      <div class="details">
        <strong>Archivos afectados:</strong>
        <ul>
          <li>styles/main.css</li>
          <li>styles/components/ (crear)</li>
        </ul>
        
        <strong>Beneficios:</strong>
        <ul>
          <li>✅ Mejor mantenibilidad</li>
          <li>✅ Reutilización de componentes</li>
          <li>✅ CSS tree-shaking más eficiente</li>
        </ul>
        
        <strong>Tiempo estimado:</strong>
        <span class="time">2-3 horas</span>
      </div>
      
      <div class="preview">
        <button class="btn-preview">👁️ Preview del cambio</button>
      </div>
    </div>
    
    <!-- MÁS CAMBIOS... -->
  </section>

  <!-- SIMILARES PARA UI/UX, ARTE, PERFORMANCE -->
</main>

<footer>
  <div class="conflicts" style="display: none;">
    <h3>⚠️ Conflictos Detectados</h3>
    <!-- Mostrar conflictos si hay -->
  </div>
  
  <div class="actions">
    <button class="btn-cancel" onclick="resetChanges()">
      Cancelar
    </button>
    <button class="btn-select-all" onclick="selectAll()">
      Seleccionar Todo
    </button>
    <button class="btn-apply" onclick="applyChanges()">
      ✅ Aplicar Cambios (47)
    </button>
  </div>
</footer>

<style>
/* Diseño moderno, responsive, dark mode support */
</style>

<script>
// Lógica interactiva:
// - Mostrar/ocultar detalles
// - Preview de cambios
// - Detectar conflictos
// - Generar approved-changes.json
// - Tracking de selecciones
</script>
```

**Características:**
- ✅ Dashboard moderno y responsive
- ✅ Checkboxes para cada cambio
- ✅ Filtros por categoría
- ✅ Preview de cambios en tiempo real
- ✅ Detección de conflictos
- ✅ Estadísticas en tiempo real
- ✅ Exportar a JSON aprobado
- ✅ Indicadores de impacto y esfuerzo

---

### 4. **approved-changes.json**

```json
{
  "metadata": {
    "timestamp": "2025-05-18T14:32:00Z",
    "approved_by": "usuario@example.com",
    "total_changes": 47,
    "total_approved": 42,
    "total_rejected": 5,
    "portfolio_name": "Mi Portafolio",
    "categories": {
      "arquitectura": {
        "total": 12,
        "approved": 11,
        "rejected": 1
      },
      "ui-ux": {
        "total": 18,
        "approved": 16,
        "rejected": 2
      },
      "arte": {
        "total": 10,
        "approved": 9,
        "rejected": 1
      },
      "performance": {
        "total": 7,
        "approved": 6,
        "rejected": 0
      }
    }
  },

  "conflicts": [
    {
      "id": "conflict-001",
      "agents": ["arte", "performance"],
      "description": "Arte sugiere animación suave (400ms), Performance sugiere reducir a 200ms",
      "resolution": "Aplicar compromiso: 300ms"
    }
  ],

  "changes": [
    {
      "id": "arch-001",
      "category": "arquitectura",
      "agent": "Arquitectura",
      "type": "refactor",
      "priority": "alta",
      "status": "approved",
      "title": "Modularizar componentes CSS",
      "description": "Dividir main.css en componentes modulares",
      "files_affected": [
        "styles/main.css",
        "styles/components/header.css",
        "styles/components/footer.css"
      ],
      "impact": "high",
      "effort": "medium",
      "time_estimate_hours": 3,
      "benefits": [
        "Mejor mantenibilidad",
        "Reutilización de componentes",
        "CSS tree-shaking más eficiente"
      ],
      "commands": [
        "mkdir -p styles/components",
        "split styles/main.css by components"
      ]
    },
    
    {
      "id": "ui-ux-001",
      "category": "ui-ux",
      "agent": "UI/UX",
      "type": "add",
      "priority": "media",
      "status": "approved",
      "title": "Agregar skip-to-content link",
      "description": "Mejorar accesibilidad para navegación por teclado",
      "files_affected": ["index.html"],
      "impact": "medium",
      "effort": "low",
      "time_estimate_hours": 0.5,
      "code_snippet": "<a href=\"#main\" class=\"skip-link\">Skip to content</a>"
    },
    
    {
      "id": "ui-ux-rejected-001",
      "category": "ui-ux",
      "agent": "UI/UX",
      "type": "modify",
      "priority": "baja",
      "status": "rejected",
      "title": "Cambiar tamaño de fuente base",
      "description": "Aumentar de 16px a 18px",
      "reason_rejected": "El usuario prefiereRespetarDiseño actual"
    }
  ]
}
```

---

### 5. **Otros Archivos Generados**

```
├── analysis-results.json
│   └─ Datos crudos de análisis de cada agente
│
├── metrics-before.json
│   └─ Lighthouse, LCP, FID, CLS, etc. (estado actual)
│
├── metrics-after.json
│   └─ Predicción de métricas después del refactor
│
├── debug.log
│   └─ Logs detallados del análisis
│
└── backups/
    └─ v1-2025-05-18-14-32/
        ├─ index.html.bak
        ├─ styles/
        └─ scripts/
```

---

## 🚀 CÓMO INVOCAR DESDE TERMINAL

### **Instalación (Una sola vez)**

```bash
# Ir a tu repositorio
cd /ruta/a/tu/portafolio

# Clonar/descargar el skill
git clone https://github.com/tu-usuario/portfolio-refactor-expert .claude-skill

# O si uses npm
npm install --save-dev claude-code-portfolio-refactor-expert
```

---

### **Opción 1: Análisis Automático Completo**

```bash
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --github-url https://github.com/tu-usuario/tu-portafolio \
  --lang-primary es \
  --lang-secondary en \
  --agentes all \
  --output-dir ./refactor-analysis
```

**Resultado:** 
- ✅ presentation.html
- ✅ presentation.pdf
- ✅ analysis-results.json
- ✅ panel-interactivo.html (abierto automáticamente)

---

### **Opción 2: Análisis Interactivo Guiado**

```bash
claude-code portfolio-refactor-expert interactive
```

El skill te hará preguntas paso a paso:

```
? ¿Cuál es la URL de tu repositorio GitHub?
> https://github.com/mi-usuario/mi-portafolio

? ¿Qué agentes quieres usar?
> (o) Todos
  ( ) Solo Arquitectura
  ( ) Solo Performance
  ( ) Personalizado

? ¿Quieres análisis de bilingüismo?
> (o) Sí (es y en)
  ( ) Solo español
  ( ) Solo inglés

? ¿Generar también PDF?
> (o) Sí
  ( ) No

? ¿Abrir panel interactivo automáticamente?
> (o) Sí
  ( ) No

[Ejecutando análisis...]
✅ Análisis completado en 8 minutos 32 segundos
```

---

### **Opción 3: Solo Algunos Agentes**

```bash
# Solo Performance
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --agentes performance

# Solo Arquitectura y UI/UX
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --agentes arquitectura,ui-ux
```

---

### **Opción 4: Generar Presentación desde Análisis Existente**

```bash
# Si ya tienes analysis-results.json
claude-code portfolio-refactor-expert generate-presentation \
  --analysis-file ./analysis-results.json \
  --format html-pdf \
  --interactive true
```

---

### **Opción 5: Ejecutar Cambios Aprobados**

```bash
# Después de usar el panel interactivo y aprobar cambios
claude-code portfolio-refactor-expert execute \
  --changes-file ./approved-changes.json \
  --backup true \
  --validate true \
  --auto-commit false
```

**Flags:**
- `--backup true`: Crear backup antes de cualquier cambio (RECOMENDADO)
- `--validate true`: Validar código después de cambios
- `--auto-commit false`: No hacer commit automático (tú lo haces manual)

---

### **Opción 6: Ver Diferencias Antes de Ejecutar**

```bash
# Generar reporte de diferencias (diff)
claude-code portfolio-refactor-expert diff \
  --changes-file ./approved-changes.json \
  --output-format html

# Esto abre un diff viewer en el navegador
```

---

## 📋 CHECKLIST PRE-EJECUCIÓN

Antes de ejecutar cualquier comando, verifica:

```
PREPARACIÓN
[ ] El repositorio está limpio (git status sin cambios)
[ ] Tienes backup local del proyecto
[ ] Estás en la rama correcta (main/master)
[ ] Tienes acceso de escritura a los archivos

CONFIGURACIÓN
[ ] .gitignore está configurado correctamente
[ ] package.json existe (si es Node.js)
[ ] No hay dependencias corruptas (npm install limpio)

ANÁLISIS
[ ] Leíste presentation.html completo
[ ] Leíste presentation.pdf completo
[ ] Entiendes cada recomendación en el panel
[ ] Detectaste y resolviste conflictos

APROBACIÓN
[ ] Seleccionaste cambios conscientemente
[ ] No aprobaste por defecto (revisa cada uno)
[ ] Entiendes el impacto de cada cambio
[ ] Guardaste approved-changes.json

EJECUCIÓN
[ ] Creaste backup manual antes de --execute
[ ] Tienes Git abierto para revertir si es necesario
[ ] Terminal está en el directorio correcto
[ ] No hay procesos usando los archivos
```

---

## ⚠️ LIMITACIONES DEL SKILL

❌ **No puede:**
- Analizar código backend (Python, Node.js, Java, etc.)
- Procesar archivos > 50MB
- Trabajar con repositorios con cambios sin commitear
- Refactorizar código minificado/ofuscado
- Analizar frameworks no soportados (solo Vanilla JS, React, Vue básico)

✅ **Puede:**
- Analizar HTML, CSS, JavaScript
- Generar recomendaciones de arquitectura, UI/UX, diseño y performance
- Crear panel interactivo para aprobación
- Ejecutar refactorización automáticamente
- Crear backups automáticos

---

## 🎯 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Análisis Rápido de Performance

```bash
cd ~/projects/my-portfolio
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --agentes performance \
  --quick true

# Resultado en 3-5 minutos
# Solo muestra: presentation.html (tab Performance)
```

---

### Ejemplo 2: Análisis Completo + Ejecución Automática

```bash
cd ~/projects/my-portfolio

# Paso 1: Análisis
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --agentes all \
  --output-dir ./refactor

# Paso 2: Revisar presentation.html en navegador
open refactor/presentation.html

# Paso 3: Usar panel interactivo (se abre automáticamente)
# → Apruebas todos los cambios

# Paso 4: Ejecutar
claude-code portfolio-refactor-expert execute \
  --changes-file ./refactor/approved-changes.json \
  --backup true

# ✅ Listo
git status  # Ver cambios
git diff    # Revisar línea por línea
git add .
git commit -m "refactor: optimization for award-winning portfolio"
```

---

### Ejemplo 3: Análisis de Bilingüismo

```bash
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --check-bilingual true \
  --lang-primary es \
  --lang-secondary en

# Analiza:
# - ¿HTML tiene hreflang correcto?
# - ¿CSS supports RTL si es necesario?
# - ¿JS maneja cambio de idioma?
# - ¿Métricas en ambos idiomas?
```

---

## 📈 MÉTRICAS DE ÉXITO

El skill está diseñado para cumplir estos criterios (basado en ganadores analizados):

### 🏗️ Arquitectura
- [x] Modularidad > 70%
- [x] DRY (Don't Repeat Yourself) cumplido
- [x] Patrones de diseño implementados
- [x] Máximo 3 niveles carpetas

### ♿ UI/UX
- [x] WCAG 2.1 AA cumplido
- [x] Responsive 100% (mobile-first)
- [x] LCP < 2.5s
- [x] FID < 100ms
- [x] CLS < 0.1

### 🎨 Dirección de Arte
- [x] Consistencia visual 100%
- [x] Paleta coherente
- [x] Tipografía 2-3 fuentes
- [x] Animaciones 200-400ms

### ⚡ Performance
- [x] Lighthouse > 90
- [x] Bundle < 150KB
- [x] 0 código no utilizado
- [x] Core Web Vitals (All Green)

---

## 🔧 CONFIGURACIÓN AVANZADA

### `.portfolio-refactor/config.json`

```json
{
  "project": {
    "name": "Mi Portafolio",
    "repository": "https://github.com/mi-usuario/mi-portafolio",
    "primary_language": "es",
    "secondary_language": "en"
  },
  
  "agentes": {
    "arquitectura": {
      "enabled": true,
      "strict_mode": false,
      "max_recommendations": 20
    },
    "ui-ux": {
      "enabled": true,
      "wcag_level": "AA",
      "check_mobile": true
    },
    "arte": {
      "enabled": true,
      "check_trends_2025": true,
      "brand_consistency": true
    },
    "performance": {
      "enabled": true,
      "lighthouse_target": 90,
      "bundle_target_kb": 150,
      "lcp_target_ms": 2500
    }
  },
  
  "ignorar": {
    "carpetas": ["node_modules", ".git", "dist"],
    "archivos": [".env", "*.lock"],
    "patrones": ["*.min.js", "*.min.css"]
  },
  
  "output": {
    "format": "html-pdf",
    "interactive": true,
    "auto_open": true
  }
}
```

---

## 📞 SOLUCIÓN DE PROBLEMAS

### Problema: "Error: Repository not clean"
```bash
# Solución: Hacer commit o stash de cambios
git add .
git commit -m "wip: changes before refactor"
# Luego intentar de nuevo
```

### Problema: "Timeout durante análisis"
```bash
# El proyecto es muy grande, intentar solo 1 agente
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --agentes performance \
  --timeout 600  # Aumentar timeout
```

### Problema: "Panel interactivo no abre"
```bash
# Abrir manualmente
open refactor-analysis/panel-interactivo.html
# O si estás en Linux
xdg-open refactor-analysis/panel-interactivo.html
```

### Problema: "Cambios se aplicaron pero se ven mal"
```bash
# Revertir desde backup automático
cp -r backups/v1-2025-05-18-14-32/* .

# O usar Git
git reset --hard HEAD~1
```

---

## 🎓 PRÓXIMOS PASOS DESPUÉS DEL REFACTOR

1. **Validar cambios:**
   ```bash
   npm run test      # Si existen tests
   npm run build     # Build para producción
   npm run preview   # Ver localmente
   ```

2. **Medir impacto:**
   ```bash
   # Lighthouse
   npx lighthouse https://localhost:3000 --chrome-flags="--headless"
   
   # WebPageTest
   # Usa herramienta online para comparar antes/después
   ```

3. **Optimizar más (opcional):**
   ```bash
   # Si quieres más sugerencias
   claude-code portfolio-refactor-expert analyze-deep \
     --repo-path . \
     --depth advanced
   ```

4. **Publicar cambios:**
   ```bash
   git push origin main
   # Deploy a producción (Netlify, Vercel, etc.)
   ```

---

## 💡 TIPS PARA GANAR PREMIOS

Basado en análisis de ganadores CSS Design Awards 2025:

1. **Código Limpio:** 10,000-25,000 líneas bien optimizadas
2. **Performance Obsesivo:** Lighthouse > 95, bundle < 100KB
3. **Accesibilidad:** WCAG 2.1 AA como mínimo
4. **Animaciones Propositivas:** Cada una con propósito, no decorativa
5. **Mobile First:** Diseña para móvil primero
6. **Bilingüismo Correcto:** hreflang, meta lang, navegación clara
7. **Storytelling:** Cuenta historia, no solo portfolio
8. **Interactividad Única:** 1-2 elementos que no se ven en otros portafolios
9. **Rendimiento Consistente:** Rápido en 4G y WiFi
10. **Atención al Detalle:** Micro-interacciones pulidas

---

## 📚 RECURSOS ADICIONALES

- Guía de portafolios ganadores 2025: `ESTIMADOS_LINEAS_CODIGO_PORTAFOLIOS_2025.md`
- Documentación de agentes: `AGENTES_EXPERTOS_DETALLADO.md`
- Template de portfolio ganador: `TEMPLATE_PORTFOLIO_GANADOR.md`

---

## ✅ SUMMARY

| Paso | Comando | Tiempo |
|------|---------|--------|
| 1. Análisis | `analyze --repo-path .` | 5-15min |
| 2. Revisar Presentación | Abrir HTML/PDF | 10-20min |
| 3. Panel Interactivo | Seleccionar cambios | 5-30min |
| 4. Ejecutar Refactor | `execute --changes-file` | 5-20min |
| 5. Validación | Lighthouse, tests | 5-10min |
| **TOTAL** | | **30-95 min** |

---

**¡Tu portafolio está listo para ganar premios! 🏆**

Última actualización: Mayo 2026
Versión Skill: 1.0.0
