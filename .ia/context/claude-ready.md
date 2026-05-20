# Contexto del Proyecto — SaaS Inventory
# Generado por /exportarcontexto | Optimizado para IA

> Este archivo se genera automáticamente. No editar manualmente.
> Última generación: [PENDIENTE — ejecutar /exportarcontexto]

---

## SISTEMA
SaaS multitenant de inventario para retail. Node.js 20 + Express + TypeScript + Mongoose + MongoDB (backend). React 18 + Vite + TypeScript + Tailwind + shadcn/ui (frontend). pnpm como package manager.

## ARQUITECTURA CLAVE
- Cada documento MongoDB tiene tenantId como primer campo (aislamiento de tenants)
- Stock independiente por sucursal: colección stock con { tenantId, branchId, productId } único
- Precio de venta en stock (no en products). costPrice en products
- StockMovements: audit log inmutable. Nunca se edita
- SaleItems: snapshot de nombre, sku, precio al momento de la venta
- Planes: small(2suc/10usr) medium(10/50) large(50/200)
- Transacciones Mongoose obligatorias en: crear venta, recibir mercancía, registrar tenant

## ROLES
owner(todo el tenant) > admin(todo menos billing) > manager(su sucursal) > cashier(solo vender)

## PATRONES OBLIGATORIOS
Backend: Route → validate(zod) → checkPermission → Controller → Service → Model
Frontend: Page → TanStack Query Hook → Feature API → axios → Backend

## ESTADO ACTUAL
[PENDIENTE — ejecutar /exportarcontexto para generar versión actualizada]

## PENDIENTES CRÍTICOS
[PENDIENTE — ejecutar /exportarcontexto para generar versión actualizada]

## ÚLTIMOS CAMBIOS
[PENDIENTE — ejecutar /exportarcontexto para generar versión actualizada]
