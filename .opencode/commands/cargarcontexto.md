---
name: cargarcontexto
description: Carga el contexto completo del proyecto SaaS Inventory al inicio de una sesión. Lee architecture.md, current-state.md, pending.md y changelog.md para entender en qué punto está el desarrollo. Úsalo al inicio de cada sesión de trabajo, cuando digas "carga el contexto", "dónde quedamos", "continúa el proyecto", "qué falta por hacer" o cuando abras una sesión nueva del proyecto.
---

# Cargar Contexto del Proyecto

## Paso 1: Ubicar la raíz del proyecto

```bash
# Verificar dónde estamos y encontrar la carpeta .ai
pwd
ls .ai/context/ 2>/dev/null || echo "ERROR: No se encuentra .ai/context/ — asegúrate de abrir OpenCode desde la raíz del proyecto"
```

Si no existe `.ai/context/`, detente e indica al usuario que abra OpenCode desde la raíz del proyecto donde está la carpeta `.ai/`.

## Paso 2: Leer archivos de contexto

Lee en este orden exacto:

```bash
cat .ai/context/architecture.md
```
```bash
cat .ai/context/current-state.md
```
```bash
cat .ai/context/pending.md
```
```bash
cat .ai/context/changelog.md
```
```bash
cat .ai/context/test-status.md 2>/dev/null || true
```

## Paso 3: Presentar resumen al usuario

Al terminar de leer, presenta este resumen:

```
## Contexto cargado ✓

**Proyecto:** SaaS Inventory — [estado general de project-summary]

**Última sesión:** [resumen de 1 línea de la última entrada del changelog]

**En progreso:**
- [items con estado 🟡 del pending.md]

**Pendientes críticos (P1):**
- [items ⚪ P1 del pending.md — máximo 5]

**Tests:** [estado actual de test-status.md]

**Advertencias:**
- [bugs activos o tests fallando si los hay, si no: "ninguna"]

Listo para continuar. ¿En qué trabajamos hoy?
```

## Reglas

1. NO preguntes qué hace el proyecto — está en architecture.md
2. NO pidas que expliquen el stack — está documentado
3. Mantén coherencia con todas las decisiones de decisions.md
4. Si el usuario pide algo que contradice una decisión técnica, señálalo antes de proceder
5. El package manager es pnpm — nunca sugerir npm ni npx
