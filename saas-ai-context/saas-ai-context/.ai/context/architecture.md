# Arquitectura del Proyecto — SaaS Inventory

> Este archivo es estable. Solo se edita cuando cambia la arquitectura fundamental del sistema.
> Última revisión: [fecha de creación del proyecto]

---

## Descripción del sistema

SaaS multitenant de gestión comercial para retail (papelerías medianas y grandes).
Permite a múltiples empresas (tenants) gestionar su inventario, ventas, compras y reportes
desde múltiples sucursales, con roles y permisos diferenciados por usuario.

---

## Jerarquía de datos (CRÍTICO)

```
Tenant (empresa cliente)
  └── Branch (sucursal)
        ├── User (empleado con rol)
        ├── Stock (inventario propio por sucursal)
        ├── Sale + SaleItems (ventas)
        └── PurchaseOrder + PurchaseItems (compras)

Product   → catálogo global del tenant (compartido entre sucursales)
Supplier  → proveedores del tenant (compartidos entre sucursales)
Category  → categorías del tenant (compartidas entre sucursales)
```

**Regla absoluta:** Todo documento en MongoDB lleva `tenantId` como primer campo.

---

## Stack tecnológico

### Backend
- **Runtime:** Node.js 20 LTS
- **Lenguaje:** TypeScript 5 (strict mode)
- **Framework:** Express.js 4
- **ODM:** Mongoose 8
- **Base de datos:** MongoDB 7
- **Autenticación:** JWT (jsonwebtoken)
- **Validación:** Zod 3
- **Seguridad:** helmet, cors, express-rate-limit
- **Logging:** Winston (JSON en prod, colorido en dev)
- **Jobs:** node-cron (alertas de stock bajo)
- **Archivos:** multer + Cloudinary
- **Reportes:** exceljs + pdfkit
- **Package manager:** pnpm

### Frontend
- **Framework:** React 18 + Vite 5
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS v4
- **Componentes:** shadcn/ui (sobre Radix UI)
- **Data fetching:** TanStack Query v5
- **Tablas:** TanStack Table v8
- **HTTP client:** Axios (con interceptores JWT)
- **Router:** React Router v7
- **Formularios:** React Hook Form + Zod
- **Gráficas:** Recharts
- **Notificaciones:** react-hot-toast
- **Barcode:** zxing-js
- **Package manager:** pnpm

### Infraestructura
- **Contenedores:** Docker + docker-compose
- **BD en la nube:** MongoDB Atlas
- **Deploy backend:** Railway / Render
- **Deploy frontend:** Vercel
- **Imágenes:** Cloudinary

### Testing
- **Backend:** Jest + Supertest + mongodb-memory-server
- **Frontend:** Vitest + Testing Library + MSW
- **E2E:** Playwright
- **Carga:** k6

---

## Decisiones de diseño permanentes

1. **Stock independiente por sucursal** — cada sucursal tiene su propio documento de stock. No hay stock global.
2. **Precio de venta por sucursal** — `price` vive en `stock`, no en `products`. `costPrice` vive en `products`.
3. **Plan fijo por tenant** — `small` (2 sucursales, 10 usuarios), `medium` (10/50), `large` (50/200).
4. **StockMovements inmutable** — nunca se edita. Toda entrada/salida genera un movimiento como audit log.
5. **Snapshots en SaleItems** — `productName`, `sku`, `unitPrice`, `costPrice` se copian al vender.
6. **Email único por tenant** — índice único en `{ tenantId, email }`.
7. **Transacciones obligatorias** — venta, recepción de mercancía y registro de tenant usan session de Mongoose.

---

## Roles del sistema

| Rol | Alcance | Descripción |
|-----|---------|-------------|
| `owner` | Todo el tenant | Acceso total. Solo 1 por tenant. |
| `admin` | Todo el tenant | Todo excepto facturación y cambio de plan. |
| `manager` | Su sucursal | Solo opera su propia sucursal. |
| `cashier` | Su sucursal | Solo puede vender y consultar stock. |

---

## Estructura de carpetas

```
backend/src/
├── config/        # env, database, logger, permissions
├── controllers/   # extrae req → llama service
├── middlewares/   # authenticate, resolveTenant, checkPermission, validate, error
├── models/        # schemas de Mongoose con índices
├── routes/        # rutas con validate() y checkPermission()
├── services/      # lógica de negocio — lanza ApiError
├── jobs/          # node-cron jobs
├── types/         # express.d.ts
└── utils/         # ApiError, ApiResponse, jwt, sequenceGenerator

frontend/src/
├── api/           # axios.ts, endpoints.ts
├── components/    # ui/ (shadcn), layout/
├── context/       # AuthContext, BranchContext
├── features/      # un folder por módulo: api, hooks, schemas, types, components
├── hooks/         # useAuth, useBranch, usePermission
├── lib/           # utils: cn(), formatCurrency(), formatDate()
├── pages/         # una página por ruta
└── router/        # index.tsx, ProtectedRoute, RoleRoute
```

---

## Patrón de código obligatorio

### Backend
```
Route → validate(zodSchema) → checkPermission → Controller → Service → Model
```
- Controller: solo extrae datos del req. Sin lógica de negocio.
- Service: toda la lógica. Lanza `ApiError` para errores.
- Nunca queries de Mongoose en controllers.

### Frontend
```
Page → Feature Hook (TanStack Query) → Feature API → axios → Backend
```
- Nunca axios directo en componentes.
- Estado servidor: TanStack Query.
- Estado global cliente: Context API.
- Estado local: useState.

---

## Formato de respuestas API

```json
// Éxito
{ "success": true, "message": "...", "data": {} }

// Paginado
{ "success": true, "message": "OK", "data": [], "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 } }

// Error
{ "success": false, "message": "..." }
```

---

## Prefijo de rutas

Todas las rutas bajo: `/api/v1`
