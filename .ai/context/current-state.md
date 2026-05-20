# Estado Actual del Proyecto

> ⚠️ Este archivo se sobreescribe completamente en cada /actualizarcontexto
> Para el historial de cambios ver: changelog.md
> Última actualización: 2026-05-20 15:07

---

## Backend (Express + Mongoose, ~4,600 líneas)

### Modelos (14 modelos en `src/models/`)
- Tenant, Branch, User, Department, Category, Brand, Supplier, Customer, Product, Stock, StockMovement, Sale, CashierShift, CashMovement

### Endpoints (13 archivos en `src/routes/`, montados en `routes/index.ts`)
- **Auth:** `POST /register-tenant`, `POST /login`, `GET /profile`
- **Tenant:** `GET /`, `PATCH /settings`
- **Branch:** CRUD completo
- **User:** CRUD completo con hasheo de password
- **Department/Category:** CRUD con validación de jerarquía (parentId)
- **Brand/Supplier/Customer:** CRUD completo
- **Product:** CRUD + `GET /barcode/:barcode`, `GET /export`, `POST /import`
- **Stock:** `GET /`, `POST /` (init), `PATCH /:productId/price`, `POST /:productId/adjust`
- **Sale:** CRUD + `GET /summary`, `GET /transfers`, `GET /by-number/:saleNumber`, `GET /:id/pdf`, `POST /:id/refund`
- **CashierShift:** CRUD + `POST /open`, `GET /current`, `POST /:id/close`, `GET /:shiftId/movements`
- **Report:** `GET /sales`, `GET /inventory`, `GET /profitability`, `GET /branches`

### Servicios (13 servicios implementados)
- Todos con lógica real de negocio. Destacan:
  - `auth.service.ts`: registro transaccional (tenant + owner en una transacción)
  - `sale.service.ts`: ventas con descuento de stock, números correlativos, cliente auto-creado, refund transaccional
  - `stock.service.ts`: moveStock transaccional, alertas de stock bajo vía aggregation pipeline
  - `cashierShift.service.ts`: cierre automático con cómputo de totales desde ventas + movimientos
  - `pdf.service.ts`: generación de PDFs (recibos) con PDFKit
  - `report.service.ts`: agregaciones complejas (ventas diarias, rentabilidad, comparativo sucursales)

### Middlewares (6 implementados)
- `auth.middleware.ts`: verifica JWT, adjunta `req.user`
- `authorize.middleware.ts`: permisos por rol (25+ permisos, 4 roles)
- `tenant.middleware.ts`: resuelve tenant desde JWT, valida tenant activo
- `validate.middleware.ts`: validación Zod
- `error.middleware.ts`: manejador global de errores con ApiError
- `notFound.middleware.ts`: catch-all 404

### Jobs
- `stockAlert.job.ts`: cron job horario que detecta stock bajo en todos los tenants activos

---

## Frontend (React + Vite + TanStack Query, ~8,295 líneas)

### Páginas/Features implementadas (14 páginas)
- **LoginPage** + **RegisterTenantPage** — auth flows
- **DashboardPage** — cards de resumen (productos, stock bajo, ventas) + POS cajas grid (cashier)
- **InventoryPage** + **ProductFormPage** — CRUD de productos, import/export, filtro por sucursal
- **DepartmentsPage** — gestión de departamentos
- **PosPage** — POS con búsqueda de productos, carro de compras, selección de cliente, múltiples métodos de pago
- **SalesPage** — listado de ventas con filtros, resumen, detalle
- **CashierShiftPage** — apertura/cierre de caja, movimientos, turno actual
- **SuppliersPage** — CRUD de proveedores
- **CustomersPage** — CRUD de clientes
- **ReportsPage** — gráficos de ventas, comparativo de sucursales, rentabilidad, stock
- **UsersPage** — CRUD de usuarios
- **SettingsPage** — configuración del tenant

### Estado global
- **AuthContext:** sesión, token persistido en localStorage, login/register/logout
- **BranchContext:** sucursal activa
- **CartContext:** multi-cart POS con persistencia en sessionStorage

### UI Components
- Componentes base (button, input, table, label) estilo shadcn
- AppShell con Header + Sidebar
- Recharts para gráficos, lucide-react para íconos, react-hot-toast para notificaciones

---

## Base de datos (MongoDB)

### Colecciones creadas por los modelos
- Todas con índices `tenantId` como primer campo
- Stock con índice único compuesto `{ tenantId, branchId, productId }`
- Product con text index en `name + description`
- StockMovement con `pre-save` hook que bloquea updates (solo inserción)

### Migraciones / Seeds
- Sin migraciones automáticas ni seeds configurados aún

---

## Tests

| Capa | Tests escritos | Pasando | Fallando |
|------|---------------|---------|----------|
| Backend | 0 | 0 | 0 |
| Frontend | 0 | 0 | 0 |

- Infraestructura de tests configurada (jest con MongoMemoryServer, vitest) pero sin casos de prueba
- `cd backend && pnpm approve-builds` requerido para aprobar mongodb-memory-server

---

## Problemas conocidos / Bugs activos

1. `pnpm test` falla por `ERR_PNPM_IGNORED_BUILDS` — mongodb-memory-server requiere `pnpm approve-builds`
2. No hay tests escritos en ninguna capa
3. `categories/` directory existe en frontend pero sin archivos (placeholder/residuo)

---

## Notas de la última sesión

- Movida estructura `.ia/` y `saas-ai-context/` a `.ai/` — unificación del sistema de contexto IA
- Primera ejecución de `/actualizarcontexto` tras la reestructuración
- Proyecto sustancialmente completo: ~12,895 líneas de código real (sin contar node_modules/dist)
