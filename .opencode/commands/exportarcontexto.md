---
name: exportarcontexto
description: Genera un archivo claude-ready.md compacto y optimizado para tokens que cualquier IA puede leer para entender el proyecto completo. Úsalo cuando quieras cambiar de herramienta de IA, compartir el contexto con un nuevo agente, o cuando digas "exporta el contexto", "genera el contexto para otra IA", "prepara el contexto para compartir".
---

# Exportar Contexto para IA Externa

## Paso 1: Verificar ubicación

```bash
ls .ai/context/ 2>/dev/null || echo "ERROR: Abre OpenCode desde la raíz del proyecto"
date "+%Y-%m-%d %H:%M"
```

## Paso 2: Leer todos los archivos de contexto

```bash
cat .ai/context/architecture.md
cat .ai/context/current-state.md
cat .ai/context/pending.md
cat .ai/context/decisions.md
cat .ai/context/test-status.md
cat .ai/context/changelog.md
```

Del changelog solo toma las últimas 3 entradas.

## Paso 3: Generar `.ai/context/claude-ready.md`

Sobreescribe el archivo completo con este formato — máximo 150 líneas:

```markdown
# Contexto del Proyecto — SaaS Inventory
# Generado: [timestamp]

## SISTEMA
SaaS multitenant de inventario para retail (papelerías).
Stack: Node.js 20 + Express + TypeScript + Mongoose + MongoDB | React 18 + Vite + TypeScript + Tailwind + shadcn/ui
Package manager: pnpm (nunca npm ni npx — usar pnpm exec)

## ARQUITECTURA CRÍTICA
- tenantId en CADA documento MongoDB — es la clave de aislamiento entre clientes
- Stock independiente por sucursal: colección stock con { tenantId, branchId, productId } único compuesto
- price (venta) vive en stock. costPrice vive en products
- stockMovements: audit log inmutable — nunca se edita, solo se inserta
- SaleItems: snapshot de nombre, sku, unitPrice, costPrice al momento de vender
- Planes: small(2suc/10usr) medium(10/50) large(50/200) — planLimits se sincroniza con hook
- Transacciones Mongoose OBLIGATORIAS en: crear venta, recibir mercancía, registrar tenant

## ROLES
owner(tenant completo) > admin(todo menos billing) > manager(su sucursal) > cashier(solo vender)

## PATRONES OBLIGATORIOS
Backend: Route → validate(zod) → checkPermission → Controller → Service → Model
Frontend: Page → TanStack Query Hook → Feature API → axios → Backend
- Nunca queries Mongoose en controllers
- Nunca axios directo en componentes React
- Estado servidor: TanStack Query | Estado global: Context API | Estado local: useState

## ESTADO ACTUAL — [fecha de current-state.md]
[Copiar sección "Completado" de current-state.md en formato compacto]

## EN PROGRESO
[Copiar items 🟡 de pending.md]

## PENDIENTES CRÍTICOS (P1)
[Listar máx 5 items ⚪ P1 de pending.md]

## ÚLTIMOS CAMBIOS
[Últimas 2 entradas del changelog en 3-4 líneas cada una]

## TESTS — [fecha]
[Estado de la tabla de test-status.md en 1 línea]
Tests críticos faltantes: aislamiento tenants, transacciones, autorización por rol

## DECISIONES RECIENTES
[Últimas 2-3 decisiones de decisions.md en formato ultra-compacto]

## REGLAS QUE SIEMPRE APLICAN
- tenantId obligatorio en cada query y documento
- pnpm siempre — nunca npm/npx
- decisions.md y changelog.md son APPEND ONLY — nunca sobreescribir
- Transacciones Mongoose en operaciones que tocan más de una colección
- cashier y manager NO ven costPrice ni márgenes
```

## Paso 4: Confirmar

```
## Contexto exportado ✓

Archivo generado: .ai/context/claude-ready.md
Tamaño: [N líneas]

Para usar en otra IA: copia el contenido de .ai/context/claude-ready.md
como primer mensaje de la nueva conversación.
```
