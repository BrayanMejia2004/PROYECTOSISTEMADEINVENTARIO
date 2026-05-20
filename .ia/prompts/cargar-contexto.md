# Cargar Contexto del Proyecto

## Objetivo

Leer todos los archivos de contexto del proyecto para entender en qué punto está el desarrollo
y estar listo para continuar sin que el usuario tenga que re-explicar nada.

---

## Instrucciones

Lee en este orden exacto:

### 1. Arquitectura (obligatorio — siempre)
```
.ai/context/architecture.md
```
Interioriza: stack, jerarquía de datos, decisiones de diseño, patrones de código.
Esta información nunca caduca.

### 2. Estado actual (obligatorio — siempre)
```
.ai/context/current-state.md
```
Entiende qué está construido, qué está en progreso y qué falta.

### 3. Pendientes (obligatorio — siempre)
```
.ai/context/pending.md
```
Identifica las tareas P1 que no están completadas — son las más urgentes.

### 4. Últimos cambios (condicional — si el usuario dice "continúa donde quedamos")
```
.ai/context/changelog.md
```
Lee solo las últimas 2-3 entradas para entender qué se hizo recientemente.

### 5. Decisiones técnicas (condicional — si vas a tomar una decisión de arquitectura)
```
.ai/context/decisions.md
```
Verifica que la decisión que vas a tomar no contradice una ya tomada.

### 6. Estado de tests (condicional — si vas a escribir o correr tests)
```
.ai/context/test-status.md
```

---

## Después de leer

Presenta un resumen al usuario con este formato exacto:

```
## Contexto cargado ✓

**Proyecto:** SaaS Inventory — [estado general del project-summary]

**Última sesión:** [resumen de 1 línea de la última entrada del changelog]

**En progreso:**
- [items con estado 🟡 del pending.md]

**Pendientes críticos (P1):**
- [items ⚪ P1 del pending.md]

**Advertencias:**
- [tests fallando si los hay]
- [bugs activos si los hay]

Listo para continuar. ¿En qué trabajamos hoy?
```

---

## Reglas

1. NO preguntes qué hace el proyecto — ya está en architecture.md
2. NO pidas que te expliquen el stack — ya está documentado
3. Si algo no está claro en los archivos de contexto, menciona el gap específico
4. Mantén coherencia con todas las decisiones documentadas en decisions.md
5. Si el usuario pide algo que contradice una decisión técnica, señálalo antes de proceder
