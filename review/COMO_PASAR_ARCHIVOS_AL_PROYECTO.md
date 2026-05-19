# 🚀 GUÍA: Pasar Archivos al Proyecto y Ejecutar desde Terminal

## 📋 Paso a Paso Completo

### PASO 1: Copiar Archivos a tu Proyecto

```bash
# 1. Abre terminal en tu computadora
# 2. Ve a la carpeta raíz de tu proyecto
cd /ruta/a/tu/proyecto

# 3. Verifica que estés en la carpeta correcta
pwd
# Debe mostrar algo como: /Users/tu-usuario/Documents/mi-proyecto

# 4. Verifica que esté limpio
git status
# Debe mostrar: "nothing to commit, working tree clean"
# Si hay cambios, haz commit primero:
# git add .
# git commit -m "before: audit and refactor"
```

### PASO 2: Descargar/Copiar Archivos

**Opción A: Si los archivos están en tu computadora**

```bash
# Copia los archivos desde Downloads a tu proyecto
cp ~/Downloads/AUDITORIA_MAESTRIA_PROYECTO_WEB.html ./
cp ~/Downloads/AUDITORIA_COMO_USAR_GUIA.md ./
cp ~/Downloads/README_AUDITORIA_MAESTRIA.md ./
cp ~/Downloads/run-audit.sh ./
cp ~/Downloads/SKILL_PORTFOLIO_REFACTOR_EXPERT.md ./
cp ~/Downloads/ESTIMADOS_LINEAS_CODIGO_PORTAFOLIOS_2025.md ./
cp ~/Downloads/SKILL_IMPLEMENTACION_TECNICA.md ./
cp ~/Downloads/RESUMEN_TOTAL_CREADO.md ./
cp ~/Downloads/GUIA_RAPIDA_5_MINUTOS.md ./

# Verifica que se copiaron
ls -la *.html *.md *.sh
```

**Opción B: Si están en otra carpeta**

```bash
# Reemplaza SOURCE_PATH con tu ruta
cp /SOURCE_PATH/AUDITORIA_*.html ./
cp /SOURCE_PATH/*.md ./
cp /SOURCE_PATH/*.sh ./

# Verifica
ls -la | grep -E "AUDITORIA|SKILL|README|run-audit"
```

### PASO 3: Dar Permisos al Script

```bash
# El script bash necesita permisos de ejecución
chmod +x run-audit.sh

# Verifica que tiene permiso
ls -l run-audit.sh
# Debe mostrar algo como: -rwxr-xr-x
```

### PASO 4: Crear Carpeta de Auditoría (Opcional pero Recomendado)

```bash
# Crea una carpeta para organizar todo
mkdir -p docs/audit

# Mueve archivos a la carpeta
mv AUDITORIA_MAESTRIA_PROYECTO_WEB.html docs/audit/
mv AUDITORIA_COMO_USAR_GUIA.md docs/audit/
mv README_AUDITORIA_MAESTRIA.md docs/audit/
mv run-audit.sh docs/audit/
mv SKILL_PORTFOLIO_REFACTOR_EXPERT.md docs/audit/
mv ESTIMADOS_LINEAS_CODIGO_PORTAFOLIOS_2025.md docs/audit/
mv SKILL_IMPLEMENTACION_TECNICA.md docs/audit/
mv RESUMEN_TOTAL_CREADO.md docs/audit/
mv GUIA_RAPIDA_5_MINUTOS.md docs/audit/

# Verifica
ls -la docs/audit/
```

### PASO 5: Commitear a Git

```bash
# Agrega los archivos a Git
git add docs/audit/
# O si los dejaste en raíz:
# git add *.html *.md AUDITORIA_* SKILL_* run-audit.sh

# Verifica qué se va a commitear
git status

# Haz commit
git commit -m "docs: add academic audit and refactor skill

- Added AUDITORIA_MAESTRIA_PROYECTO_WEB.html
- Added SKILL_PORTFOLIO_REFACTOR_EXPERT.md
- Added run-audit.sh script
- Added comprehensive guides and documentation
- Ready for implementation"

# Verifica el commit
git log --oneline -1
```

---

## 🎯 AHORA: EJECUTAR DESDE TERMINAL

### OPCIÓN 1: Ejecutar Auditoría Simple (RECOMENDADO PARA EMPEZAR)

```bash
# Si los archivos están en raíz del proyecto
cd /ruta/a/tu/proyecto

# Abre el HTML en navegador (más simple)
# macOS
open AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# Linux
xdg-open AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# Windows
start AUDITORIA_MAESTRIA_PROYECTO_WEB.html
```

**¿Qué pasa?**
- ✅ Se abre la auditoría en navegador
- ✅ Lees el análisis completo
- ✅ Ves las recomendaciones
- ✅ Tienes el plan de acción

---

### OPCIÓN 2: Ejecutar Script de Auditoría

```bash
# Si los archivos están en raíz
cd /ruta/a/tu/proyecto

# Ejecutar script
./run-audit.sh --project-path . --output ./audit-report

# Si están en carpeta docs/audit
./docs/audit/run-audit.sh --project-path . --output ./audit-report
```

**¿Qué pasa?**
- ✅ Script valida tu proyecto
- ✅ Analiza estructura
- ✅ Genera reportes
- ✅ Abre en navegador automáticamente
- ✅ Crea carpeta `audit-report/` con resultados

**Resultado en terminal:**
```
╔════════════════════════════════════════════════════════════════╗
║  📚 AUDITORÍA TUTORIAL DE MAESTRÍA - PROYECTO WEB              ║
╚════════════════════════════════════════════════════════════════╝

ℹ️  Iniciando auditoría de proyecto...
  Proyecto: .
  Salida: ./audit-report

ℹ️  Validando proyecto...
✅ Repositorio Git detectado
✅ Repositorio limpio (sin cambios sin commitear)
✅ Análisis completado:
  📄 Archivos HTML: 3
  🎨 Archivos CSS: 2
  ⚙️  Archivos JavaScript: 4
  📊 Total archivos: 9

✅ Reporte HTML generado
✅ Reporte abierto en navegador

✅ AUDITORÍA COMPLETADA

📁 Archivos generados en: ./audit-report

  📄 AUDITORIA_MAESTRIA_PROYECTO_WEB.html
  
📖 Próximos pasos:
  1. Lee la auditoría completa en el navegador
  2. Discute los resultados con tus tutores
  3. Prioriza las recomendaciones por criticidad
  4. Implementa según el timeline propuesto

💡 Consejo:
  Guarda esta auditoría en tu repositorio Git:
  $ cd .
  $ git add ./audit-report/
  $ git commit -m "docs: academic audit report"
```

---

### OPCIÓN 3: Usar Claude Code desde Terminal

```bash
# En la carpeta raíz del proyecto
cd /ruta/a/tu/proyecto

# MÉTODO A: Que Claude Code analice el proyecto
# (Esto requiere que tengas Claude Code instalado y configurado)
claude-code analyze-project --repo-path . --audit-file AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# MÉTODO B: Que Claude Code siga la guía
claude-code run-audit --guide docs/audit/AUDITORIA_COMO_USAR_GUIA.md

# MÉTODO C: Que Claude Code ejecute el refactor skill
claude-code portfolio-refactor-expert analyze \
  --repo-path . \
  --audit-file docs/audit/SKILL_PORTFOLIO_REFACTOR_EXPERT.md \
  --agentes all
```

**Nota:** Estos comandos requieren que Claude Code esté configurado. Si no los conoces, usa Opción 1 o 2.

---

### OPCIÓN 4: Ejecutar Paso a Paso (LO QUE PROBABLEMENTE QUIERES)

```bash
# 1. Ve a tu proyecto
cd /ruta/a/tu/proyecto

# 2. Abre la auditoría en navegador
open AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# 3. Léela completamente (20-30 minutos)

# 4. Abre terminal nueva (sin cerrar la auditoría)

# 5. Ahora sí, llama a Claude Code
# Opción A: Modo conversacional
claude-code

# Dentro de Claude Code, pásale esta instrucción:
# "Analiza mi proyecto usando la auditoría que está en AUDITORIA_MAESTRIA_PROYECTO_WEB.html
# y AUDITORIA_COMO_USAR_GUIA.md. Sigue las recomendaciones e implementa
# las mejoras críticas primero."

# Opción B: Directamente con instrucción
claude-code --file AUDITORIA_COMO_USAR_GUIA.md "Sigue esta guía paso a paso"
```

---

## 📂 ESTRUCTURA RECOMENDADA DEL PROYECTO

```
tu-proyecto/
├── .git/
├── src/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── docs/
│   └── audit/
│       ├── AUDITORIA_MAESTRIA_PROYECTO_WEB.html    ← Abre en navegador
│       ├── AUDITORIA_COMO_USAR_GUIA.md             ← Lee esto
│       ├── README_AUDITORIA_MAESTRIA.md
│       ├── SKILL_PORTFOLIO_REFACTOR_EXPERT.md
│       ├── run-audit.sh                            ← Script ejecutable
│       └── [otros archivos]
├── package.json
└── README.md
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

```bash
# Verificar que todo está en su lugar
cd /ruta/a/tu/proyecto

# 1. Verifica que ves los archivos
ls -la AUDITORIA_MAESTRIA_PROYECTO_WEB.html
ls -la AUDITORIA_COMO_USAR_GUIA.md
ls -la run-audit.sh

# 2. Verifica que Git está limpio
git status
# Debe decir: "nothing to commit, working tree clean"

# 3. Verifica que el script tiene permisos
test -x run-audit.sh && echo "✅ Script ejecutable" || echo "❌ Sin permisos"

# 4. Verifica que puedes abrir la auditoría
test -f AUDITORIA_MAESTRIA_PROYECTO_WEB.html && echo "✅ HTML existe" || echo "❌ No encontrado"
```

---

## 🎯 FLUJO RECOMENDADO

### Para Maestría:

```bash
# DÍA 1: Setup
cd /tu/proyecto
cp [archivos] ./
git add . && git commit -m "docs: audit files"

# DÍA 2-3: Revisión
open AUDITORIA_MAESTRIA_PROYECTO_WEB.html
# Leer auditoría y tomar notas

# DÍA 4: Planificación
# Discutir con tutores qué implementar primero

# SEMANA 2-5: Implementación
# Seguir el plan de acción
# Ejecutar ./run-audit.sh cada semana para medir progreso
```

### Para Refactor de Portafolio:

```bash
# DÍA 1: Setup
cd /tu/portafolio
cp SKILL_PORTFOLIO_REFACTOR_EXPERT.md ./
cp SKILL_IMPLEMENTACION_TECNICA.md ./

# DÍA 2: Análisis
claude-code portfolio-refactor-expert analyze --repo-path . --agentes all

# DÍA 3: Revisión de recomendaciones
# Abrir panel interactivo y aprobar cambios

# DÍA 4-20: Refactorización
# Ejecutar cambios automáticos
# Testear y validar
```

---

## 🔧 TROUBLESHOOTING

### Error: "Permission denied" al ejecutar script

```bash
# Solución: dar permisos
chmod +x run-audit.sh

# Verify
ls -l run-audit.sh
# Debe mostrar: -rwxr-xr-x (con la x)
```

### Error: "No such file or directory"

```bash
# Verifica que estás en la carpeta correcta
pwd

# Verifica que los archivos están ahí
ls -la | grep AUDITORIA

# Si están en subcarpeta, usa ruta completa
./docs/audit/run-audit.sh
# en lugar de
./run-audit.sh
```

### Error: "Repository not clean"

```bash
# El proyecto tiene cambios sin commitear
git status

# Hacer commit
git add .
git commit -m "wip: changes before audit"

# Intentar de nuevo
./run-audit.sh
```

### No abre en navegador

```bash
# El script intentó abrir automáticamente pero falló
# Abre manualmente:
open AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# O directamente en tu navegador:
# Arrastra el archivo al navegador
# O File > Open > selecciona el HTML
```

---

## 🎓 AHORA SÍ: EJECUTA CLAUDE CODE

### Versión Simple (Recomendada):

```bash
# Terminal en tu proyecto
cd /ruta/a/tu/proyecto

# 1. Abre la auditoría
open AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# 2. Abre Claude Code en terminal
claude-code

# 3. Dentro de Claude Code, pasa esta instrucción:

"""
Soy estudiante de maestría. Tengo la auditoría del proyecto 
en AUDITORIA_MAESTRIA_PROYECTO_WEB.html y AUDITORIA_COMO_USAR_GUIA.md

Por favor:
1. Analiza el proyecto actual
2. Sigue las recomendaciones de la auditoría
3. Implementa primero lo CRÍTICO (accesibilidad, loading states, modularizar CSS)
4. Genera reportes de progreso
5. Sugiere cambios específicos para cada archivo

El plan de acción es 4-5 semanas. Empezamos con lo crítico esta semana.
"""

# 4. Claude Code analizará el proyecto y seguirá la auditoría
# 5. Implementará cambios paso a paso
```

### Versión Avanzada (Para Refactor):

```bash
# Terminal en tu proyecto
cd /ruta/a/tu/proyecto

# Abre Claude Code con instrucción específica
claude-code --file SKILL_PORTFOLIO_REFACTOR_EXPERT.md

# Dentro de Claude Code:
"""
Usa la guía SKILL_PORTFOLIO_REFACTOR_EXPERT.md para:

1. Analizar el portafolio con 4 agentes expertos
2. Generar presentación HTML con sugerencias
3. Crear panel interactivo para aprobación
4. Ejecutar refactorización automática

Sigue el flujo:
- FASE 1: Análisis paralelo de 4 agentes
- FASE 2: Generar presentación + PDF
- FASE 3: Panel interactivo (yo apruebo/rechaza)
- FASE 4: Ejecutar cambios
- FASE 5: Validar resultados
"""
```

---

## 📊 RESULTADO ESPERADO

### Después de Ejecutar:

```
✅ Auditoría en navegador mostrando:
   └─ Resumen Ejecutivo (métricas)
   └─ Análisis Arquitectura
   └─ Análisis Vibe Coding
   └─ Análisis Dirección de Arte
   └─ Recomendaciones Finales

✅ Carpeta ./audit-report/ con reportes

✅ Claude Code listo para implementar cambios

✅ Git actualizado con versión nueva
```

---

## 🎯 SIGUIENTE PASO INMEDIATO

```bash
# 1. Abre tu terminal ahora
cd /ruta/a/tu/proyecto

# 2. Copia los archivos (ajusta PATH si es necesario)
cp ~/Downloads/AUDITORIA_*.html ./
cp ~/Downloads/*MAESTRIA*.md ./
cp ~/Downloads/run-audit.sh ./

# 3. Dale permisos
chmod +x run-audit.sh

# 4. Abre en navegador
open AUDITORIA_MAESTRIA_PROYECTO_WEB.html

# 5. Lee la auditoría (30 minutos)

# 6. Abre Claude Code
claude-code

# 7. Pasa la auditoría como contexto

¡Listo!
```

---

**¡Eso es todo! Ahora tienes todo configurado en tu proyecto y listo para ejecutar desde terminal.** 🚀

El archivo HTML es el "corazón" - ábrelo y léelo primero. Luego usa Claude Code para implementar.
