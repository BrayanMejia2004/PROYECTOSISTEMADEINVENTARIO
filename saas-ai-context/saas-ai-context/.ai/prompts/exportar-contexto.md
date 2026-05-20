# Exportar Contexto para IA Externa

## Objetivo

Generar un único archivo compacto y optimizado para tokens que cualquier IA
pueda leer al inicio de una sesión y entender el proyecto completamente.

---

## Instrucciones

### 1. Lee estos archivos en orden
```
.ai/context/architecture.md
.ai/context/current-state.md
.ai/context/pending.md
.ai/context/decisions.md
.ai/context/test-status.md
.ai/context/changelog.md  ← solo las últimas 3 entradas
```

### 2. Genera `.ai/context/claude-ready.md`

Sobreescribe el archivo completo con este formato optimizado:

```markdown
# Contexto del Proyecto — SaaS Inventory
# Generado: [timestamp]

## SISTEMA
[1-2 líneas: qué es el proyecto]
Stack: [lista compacta del stack]
Package manager: pnpm

## ARQUITECTURA CRÍTICA
[Bullet points de las decisiones de diseño más importantes — máx 10 líneas]

## ROLES
[1 línea con los 4 roles y su alcance]

## PATRONES OBLIGATORIOS
Backend: [patrón en 1 línea]
Frontend: [patrón en 1 línea]

## ESTADO ACTUAL — [fecha]
Backend completado: [lista compacta]
Frontend completado: [lista compacta]
En progreso: [lista compacta]

## PENDIENTES CRÍTICOS (P1)
[Lista de máx 5 items P1 pendientes más importantes]

## ÚLTIMOS CAMBIOS
[Últimas 2-3 entradas del changelog en formato ultra-compacto]

## TESTS
[1 línea con el estado actual: N passing / N failing / cobertura]
Tests críticos faltantes: [lista de los más importantes]

## DECISIONES RECIENTES
[Solo las últimas 2-3 decisiones de decisions.md]

## REGLAS QUE SIEMPRE APLICAN
- Todo documento MongoDB lleva tenantId como primer campo
- Nunca npm ni npx — usar pnpm y pnpm exec
- Nunca queries Mongoose en controllers
- Nunca axios directo en componentes React
- Transacciones Mongoose en: crear venta, recibir mercancía, registrar tenant
- decisions.md es append-only — nunca sobreescribir
- changelog.md es append-only — siempre insertar al inicio
```

---

## Reglas de exportación

1. **Máximo 150 líneas** — si supera eso, resumir más
2. **Sin código fuente** — solo descripciones y referencias a archivos
3. **Sin duplicar** lo que está en architecture.md word-for-word — resumir
4. **Priorizar** lo que cambia frecuentemente (estado, pendientes) sobre lo estático
5. **Lenguaje técnico directo** — sin explicaciones para no-desarrolladores
