# Contexto del Proyecto — SaaS Inventory
# Generado: 2026-05-20 15:13

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

## ESTADO ACTUAL — 2026-05-20
BACKEND (~4,600 líneas): 14 modelos (Tenant, Branch, User, Department, Category, Brand, Supplier, Customer, Product, Stock, StockMovement, Sale, CashierShift, CashMovement), 13 servicios (auth, tenant, branch, user, department, category, brand, supplier, customer, product, stock, sale, cashierShift, report, pdf), 14 controladores, 13 rutas, 6 middlewares (auth JWT, authorize permisos, tenant resolver, validate Zod, error handler, 404). Jobs: stockAlert cron horario.
FRONTEND (~8,295 líneas): 14 páginas (Login, Register, Dashboard, Inventory, ProductForm, Departments, POS, Sales, CashierShift, Suppliers, Customers, Reports, Users, Settings). Estado: AuthContext, BranchContext, CartContext (multi-cart POS). UI: shadcn + Recharts + lucide-react.

## EN PROGRESO
(nada — todos los módulos core están completados)

## PENDIENTES CRÍTICOS
- Scanner de código de barras (zxing) para POS vía cámara
- Tests E2E con Playwright (flujos críticos)
- Pruebas de carga con k6 (concurrencia POS)

## ÚLTIMOS CAMBIOS
2026-05-20 — Unificación del sistema de contexto IA en .ai/
  - Estructura `.ia/` y `saas-ai-context/` movida a `.ai/context/`
  - Documentado estado real del proyecto: 12,895 líneas, ~198 archivos
  - Sin tests escritos, infraestructura configurada

## TESTS — 2026-05-20
Tests escritos: 0 | Pasando: 0 | Fallando: 0 | Cobertura: —
Tests críticos faltantes: aislamiento tenants, transacciones, autorización por rol

## DECISIONES RECIENTES
- [Inicio] Transacciones Mongoose obligatorias en operaciones multi-colección. MongoDB debe correr en replica set.
- [Inicio] pnpm como package manager. Nunca npm/npx — usar pnpm exec.
- [Inicio] Plan fijo con límites sincronizados por hook pre-save al cambiar tenant.plan.

## REGLAS QUE SIEMPRE APLICAN
- tenantId obligatorio en cada query y documento
- pnpm siempre — nunca npm/npx
- decisions.md y changelog.md son APPEND ONLY — nunca sobreescribir
- Transacciones Mongoose en operaciones que tocan más de una colección
- cashier y manager NO ven costPrice ni márgenes
