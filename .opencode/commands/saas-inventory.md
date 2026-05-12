---
name: saas-inventory
description: Genera y mantiene la estructura completa de un SaaS multitenant de gestión de inventario para retail (papelerías, tiendas). Stack: Node.js 20 + Express + TypeScript + Mongoose + MongoDB (backend), React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui (frontend). Úsalo cuando el usuario diga "crea el proyecto saas", "inicializa el inventario", "genera la estructura del saas", "agrega un módulo al saas", "crea el endpoint de X", "agrega la página de X", o cualquier tarea de desarrollo sobre este proyecto. También actívalo si el usuario menciona tenants, sucursales, stock, ventas, compras, reportes, roles o permisos en el contexto de este sistema.
---

# SaaS Inventory — Guía completa del proyecto

Antes de cualquier acción, lee esta guía completa. Contiene toda la arquitectura, decisiones y convenciones del proyecto. No inventes nada que no esté aquí.

---

## Descripción del sistema

SaaS multitenant de gestión comercial para retail (papelerías medianas y grandes).

- **Tipo:** SaaS B2B multitenant
- **Unidad de cliente:** Empresa (tenant) con múltiples sucursales
- **Usuarios finales:** Dueños, administradores, gerentes de sucursal y cajeros
- **Interfaces:** Web (navegador) + Tablet (mostrador / punto de venta)

---

## Stack tecnológico completo

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20 LTS | Runtime |
| TypeScript | 5 | Lenguaje — tipado estricto obligatorio |
| Express.js | 4 | Framework HTTP |
| Mongoose | 8 | ODM para MongoDB |
| MongoDB | 7 | Base de datos principal |
| jsonwebtoken | — | JWT para autenticación stateless |
| bcryptjs | — | Hash de contraseñas |
| zod | 3 | Validación de inputs en cada endpoint |
| helmet | — | Headers HTTP de seguridad |
| cors | — | Control de orígenes |
| express-rate-limit | — | Protección fuerza bruta en login |
| winston | — | Logging estructurado |
| morgan | — | Log de requests HTTP |
| node-cron | — | Alertas de stock bajo programadas |
| multer | — | Subida de imágenes de productos |
| exceljs | — | Exportación de reportes a Excel |
| pdfkit | — | Exportación de reportes a PDF |
| dotenv | — | Variables de entorno |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18 | Framework UI |
| Vite | 5 | Build tool con proxy al backend |
| TypeScript | 5 | Lenguaje |
| Tailwind CSS | v4 | Estilos utility-first |
| shadcn/ui | — | Componentes UI accesibles sobre Radix UI |
| TanStack Query | v5 | Caché y sincronización con el servidor |
| TanStack Table | v8 | Tablas con virtualización para inventarios grandes |
| Axios | — | HTTP client con interceptores JWT |
| React Router | v7 | Rutas protegidas por rol |
| React Hook Form | — | Formularios |
| Zod | 3 | Validación — mismos schemas que el backend |
| Recharts | — | Gráficas de ventas y stock |
| react-hot-toast | — | Notificaciones |
| zxing-js | — | Escaneo de código de barras desde cámara |

### Infraestructura
| Tecnología | Propósito |
|------------|-----------|
| Docker + docker-compose | Contenedores: backend + MongoDB + Mongo Express |
| MongoDB Atlas | BD en producción |
| Railway / Render | Deploy del backend |
| Vercel | Deploy del frontend |
| Cloudinary | Imágenes de productos con CDN |

### Testing
| Backend | Frontend |
|---------|----------|
| Jest + Supertest | Vitest + Testing Library |
| mongodb-memory-server | MSW (mock del backend) |

---

## Arquitectura del sistema

### Jerarquía de datos (CRÍTICO)

```
Tenant (empresa cliente)
  └── Branch (sucursal)
        ├── User (empleado con rol)
        ├── Stock (inventario propio)
        ├── Sale (ventas)
        └── PurchaseOrder (compras)

Product (catálogo global del tenant — compartido entre sucursales)
Supplier (proveedores del tenant — compartido entre sucursales)
Category (categorías del tenant — compartidas entre sucursales)
```

**Regla absoluta:** Todo documento en MongoDB lleva `tenantId` como primer campo. Sin excepción. Es la clave de partición que aísla los datos entre clientes.

### Decisiones de diseño tomadas

1. **Stock independiente por sucursal** — cada sucursal tiene su propio documento de stock por producto. No hay stock global compartido.
2. **Precio de venta por sucursal** — el campo `price` vive en la colección `stock`, no en `products`. `costPrice` vive en `products` (igual para todas las sucursales).
3. **Plan fijo por tenant** — `small` (2 sucursales, 10 usuarios), `medium` (10 sucursales, 50 usuarios), `large` (50 sucursales, 200 usuarios).
4. **StockMovements inmutable** — registro de auditoría que nunca se edita. Toda entrada/salida de stock genera un movimiento.
5. **Snapshots en SaleItems** — `productName`, `sku`, `unitPrice` y `costPrice` se copian al momento de la venta. Si el producto cambia después, el historial queda intacto.
6. **Email único por tenant** — dos tenants distintos pueden tener el mismo email de usuario. El índice único es `{ tenantId, email }`.

---

## Estructura de carpetas

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Conexión MongoDB con reconnect
│   │   ├── env.ts              # Variables de entorno validadas con Zod
│   │   ├── logger.ts           # Winston — JSON en prod, colorido en dev
│   │   └── permissions.ts      # Constante PERMISSIONS con todos los permisos
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── tenant.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── supplier.controller.ts
│   │   ├── stock.controller.ts
│   │   ├── sale.controller.ts
│   │   ├── purchase.controller.ts
│   │   └── report.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # Verifica JWT → req.user
│   │   ├── tenant.middleware.ts     # Resuelve tenant → req.tenant
│   │   ├── authorize.middleware.ts  # checkPermission(permission)
│   │   ├── validate.middleware.ts   # validate(zodSchema)
│   │   ├── error.middleware.ts      # Manejo global de errores
│   │   └── notFound.middleware.ts
│   ├── models/
│   │   ├── tenant.model.ts
│   │   ├── branch.model.ts
│   │   ├── user.model.ts
│   │   ├── category.model.ts
│   │   ├── supplier.model.ts
│   │   ├── product.model.ts
│   │   ├── stock.model.ts
│   │   ├── stockMovement.model.ts
│   │   ├── sale.model.ts           # Sale + SaleItem
│   │   ├── purchaseOrder.model.ts  # PurchaseOrder + PurchaseItem
│   │   └── index.ts                # Re-exporta todos los modelos
│   ├── routes/
│   │   ├── index.ts                # Agrega todas las rutas bajo /api/v1
│   │   ├── auth.routes.ts
│   │   ├── tenant.routes.ts
│   │   ├── branch.routes.ts
│   │   ├── user.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── supplier.routes.ts
│   │   ├── stock.routes.ts
│   │   ├── sale.routes.ts
│   │   ├── purchase.routes.ts
│   │   └── report.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── tenant.service.ts
│   │   ├── branch.service.ts
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── stock.service.ts        # moveStock() y getLowStockAlerts()
│   │   ├── sale.service.ts         # Transacción: venta + descuento stock
│   │   ├── purchase.service.ts     # Transacción: recepción + aumento stock
│   │   └── report.service.ts
│   ├── jobs/
│   │   └── stockAlert.job.ts       # node-cron: revisa stock bajo cada hora
│   ├── types/
│   │   └── express.d.ts            # Extiende Request: user, tenant, branch
│   ├── utils/
│   │   ├── ApiError.ts             # Clase con métodos estáticos: badRequest, notFound...
│   │   ├── ApiResponse.ts          # Formato estándar de respuestas
│   │   ├── jwt.ts                  # signToken, verifyToken
│   │   └── sequenceGenerator.ts    # Números de venta y orden de compra
│   └── app.ts                      # Express app sin listen()
├── tests/
│   ├── setup.ts                    # mongodb-memory-server
│   ├── unit/
│   └── integration/
├── .env.example
├── .env
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
├── package.json
└── server.ts                       # Entry point: connectDB + app.listen
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.ts                # Instancia con interceptores JWT y 401
│   │   └── endpoints.ts            # Constantes de rutas del backend
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   └── layout/
│   │       ├── AppShell.tsx        # Layout principal con sidebar
│   │       ├── Sidebar.tsx         # Nav filtrada por rol
│   │       ├── Header.tsx          # Breadcrumb + usuario + sucursal activa
│   │       └── TabletLayout.tsx    # Layout optimizado para punto de venta
│   ├── context/
│   │   ├── AuthContext.tsx         # user, token, tenant, login, logout
│   │   ├── BranchContext.tsx       # sucursal activa seleccionada
│   │   └── index.ts
│   ├── features/                   # Un folder por módulo de negocio
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   ├── inventory/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── ProductTable.tsx    # TanStack Table con virtualización
│   │   │       ├── ProductForm.tsx
│   │   │       ├── StockBadge.tsx      # Indicador visual de stock bajo
│   │   │       └── BarcodeScanner.tsx  # zxing desde cámara
│   │   ├── sales/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── PosCart.tsx         # Carrito del punto de venta
│   │   │       ├── PosProductSearch.tsx
│   │   │       └── SaleReceipt.tsx
│   │   ├── purchases/
│   │   ├── suppliers/
│   │   ├── reports/
│   │   │   └── components/
│   │   │       ├── SalesChart.tsx      # Recharts
│   │   │       ├── StockValueCard.tsx
│   │   │       └── BranchComparison.tsx
│   │   ├── users/
│   │   └── settings/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBranch.ts
│   │   └── usePermission.ts        # hasPermission(permission) → boolean
│   ├── lib/
│   │   └── utils.ts                # cn(), formatCurrency(), formatDate()
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── PosPage.tsx             # Punto de venta — layout tablet
│   │   ├── SalesPage.tsx
│   │   ├── PurchasesPage.tsx
│   │   ├── SuppliersPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── router/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx      # Redirige a /login si no autenticado
│   │   └── RoleRoute.tsx           # Redirige si el rol no tiene acceso
│   ├── types/
│   │   └── index.ts                # Tipos globales (User, Tenant, Branch...)
│   └── main.tsx
├── .env.example
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Colecciones MongoDB y sus índices

| Colección | Índices críticos |
|-----------|-----------------|
| `tenants` | `slug` único |
| `branches` | `{ tenantId, isActive }` |
| `users` | `{ tenantId, email }` único · `{ tenantId, role }` |
| `products` | `{ tenantId, sku }` único · `{ tenantId, barcode }` · text search `{ name, description }` |
| `categories` | `{ tenantId, parentId }` |
| `suppliers` | `{ tenantId, isActive }` |
| `stock` | `{ tenantId, branchId, productId }` único compuesto |
| `stockmovements` | `{ tenantId, branchId, productId, createdAt }` |
| `sales` | `{ tenantId, saleNumber }` único · `{ tenantId, branchId, createdAt }` |
| `saleitems` | `{ tenantId, saleId }` · `{ tenantId, productId }` |
| `purchaseorders` | `{ tenantId, orderNumber }` único · `{ tenantId, branchId, status }` |
| `purchaseitems` | `{ tenantId, purchaseOrderId }` |

---

## Roles y permisos

### Definición de roles

| Rol | Alcance | Descripción |
|-----|---------|-------------|
| `owner` | Todo el tenant | Dueño. Acceso total incluyendo facturación y plan. Solo 1 por tenant. |
| `admin` | Todo el tenant | Gerente general. Todo excepto facturación y cambio de plan. |
| `manager` | Su sucursal | Encargado de sucursal. Solo ve y opera su propia sucursal. |
| `cashier` | Su sucursal | Cajero. Solo puede vender y consultar stock. |

### Reglas de autorización en el backend

Cada request autenticado pasa por esta cadena de middlewares:

```
authenticate → resolveTenant → checkPermission(permission) → controller
```

- `authenticate`: verifica JWT, adjunta `req.user = { userId, tenantId, role, branchId }`
- `resolveTenant`: verifica que el tenant está activo, adjunta `req.tenant`
- `checkPermission(permission)`: verifica rol y restringe `branchId` si `ownBranchOnly: true`

### Permisos por módulo (referencia rápida)

```typescript
// Inventario
'inventory:read'         → owner, admin, manager, cashier (ownBranch)
'inventory:create'       → owner, admin
'inventory:update'       → owner, admin, manager (ownBranch)
'inventory:delete'       → owner, admin
'inventory:adjust'       → owner, admin, manager (ownBranch)
'inventory:set-price'    → owner, admin, manager (ownBranch)
'inventory:view-cost'    → owner, admin   ← cashier/manager NO ven costPrice

// Ventas
'sales:create'           → todos (ownBranch)
'sales:read'             → todos (ownBranch)
'sales:read-all'         → owner, admin
'sales:cancel'           → owner, admin, manager (ownBranch)
'sales:cancel-own'       → cashier (solo su última venta del día)
'sales:refund'           → owner, admin
'sales:apply-discount'   → todos (con límite % por rol)

// Compras
'suppliers:read'         → owner, admin, manager
'purchases:create'       → owner, admin, manager (ownBranch)
'purchases:receive'      → owner, admin, manager (ownBranch)

// Reportes
'reports:branch'         → owner, admin, manager (ownBranch)
'reports:global'         → owner, admin
'reports:financial'      → owner, admin

// Usuarios
'users:create-cashier'   → owner, admin, manager
'users:create-manager'   → owner, admin
'users:create-admin'     → owner

// Tenant
'tenant:change-plan'     → owner
'tenant:billing'         → owner
'tenant:manage-branches' → owner
```

---

## Formato estándar de respuestas API

### Respuesta exitosa
```json
{
  "success": true,
  "message": "Descripción de la acción",
  "data": { }
}
```

### Respuesta paginada
```json
{
  "success": true,
  "message": "OK",
  "data": [],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Respuesta de error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## Variables de entorno requeridas

### Backend (`.env`)
```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb://localhost:27017/saas-inventory

JWT_SECRET=min_32_caracteres_cambiar_en_produccion
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=http://localhost:5173
```

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Inventario Pro
```

---

## Convenciones de código — OBLIGATORIO seguirlas siempre

### Nomenclatura
- **Archivos:** `kebab-case` para todos los archivos
- **Clases e interfaces:** `PascalCase`
- **Variables y funciones:** `camelCase`
- **Constantes globales:** `UPPER_SNAKE_CASE`
- **Tipos TypeScript:** prefijo `I` para interfaces de Mongoose (`IUser`, `IProduct`)
- **Schemas Zod:** sufijo `Schema` (`loginSchema`, `createProductSchema`)

### Patrón backend obligatorio

```
Route → validate(zodSchema) → checkPermission → Controller → Service → Model
```

- **Controller:** solo extrae datos del `req` y llama al service. Sin lógica de negocio.
- **Service:** toda la lógica de negocio. Lanza `ApiError` para errores conocidos.
- **Model:** solo definición del schema y métodos de instancia.
- **Nunca** hacer queries de Mongoose directamente en un controller.
- **Siempre** usar transacciones de Mongoose (`session`) cuando una operación modifica más de una colección (ej: crear venta + descontar stock).

### Patrón frontend obligatorio

```
Page → Feature Hook (TanStack Query) → Feature API → axios → Backend
```

- **Nunca** hacer llamadas a `axios` directamente en un componente o página.
- **Todo** fetch del servidor va en `features/[nombre]/api.ts` y se consume con un hook en `features/[nombre]/hooks.ts`.
- **Estado del servidor:** TanStack Query.
- **Estado global del cliente:** Context API (auth, branch activa).
- **Estado local:** `useState`.
- **Validación:** Zod en el frontend con el mismo schema que el backend cuando sea posible.
- **Estilos:** siempre `cn()` de `@/lib/utils` para combinar clases Tailwind.

### Control de acceso en el frontend

Antes de renderizar cualquier acción sensible, verificar con el hook `usePermission`:

```typescript
const { hasPermission } = usePermission();
if (!hasPermission('inventory:create')) return null;
```

**Nunca** esconder elementos solo con CSS — siempre condicional en el JSX.

### Operaciones de stock

**Toda** modificación de stock debe pasar por `stock.service.ts → moveStock()`. Nunca actualizar `Stock.quantity` directamente desde un controller o service que no sea el de stock. `moveStock()` garantiza:
1. Verificación de stock suficiente antes de descontar
2. Creación del `StockMovement` inmutable
3. Operación dentro de una transacción de Mongoose

---

## Endpoints principales de la API

Todos bajo el prefijo `/api/v1`

```
POST   /auth/register-tenant    → Crea tenant + owner
POST   /auth/login
GET    /auth/profile

GET    /branches                → Lista sucursales del tenant
POST   /branches                → Crear sucursal (owner)
PATCH  /branches/:id
DELETE /branches/:id

GET    /users                   → Lista usuarios (filtrado por rol)
POST   /users
PATCH  /users/:id
DELETE /users/:id

GET    /categories
POST   /categories
PATCH  /categories/:id

GET    /suppliers
POST   /suppliers
PATCH  /suppliers/:id

GET    /products                → Con paginación, búsqueda y filtros
POST   /products
PATCH  /products/:id
DELETE /products/:id

GET    /stock                   → Stock de la sucursal activa
POST   /stock                   → Inicializar stock de producto en sucursal
PATCH  /stock/:productId/price  → Cambiar precio en sucursal
POST   /stock/:productId/adjust → Ajuste manual con nota obligatoria
GET    /stock/low               → Productos bajo stock mínimo

POST   /sales                   → Crear venta (descuenta stock automáticamente)
GET    /sales                   → Historial con filtros de fecha
GET    /sales/:id
PATCH  /sales/:id/cancel
POST   /sales/:id/refund

GET    /purchases               → Órdenes de compra
POST   /purchases               → Crear orden
PATCH  /purchases/:id
POST   /purchases/:id/receive   → Recibir mercancía (aumenta stock)

GET    /reports/sales           → Reporte de ventas por período
GET    /reports/inventory       → Valor y rotación del inventario
GET    /reports/profitability   → Rentabilidad por producto
GET    /reports/branches        → Comparativo entre sucursales (owner/admin)

GET    /tenant                  → Configuración del tenant
PATCH  /tenant/settings
PATCH  /tenant/plan             → Cambiar plan (owner)
```

---

## Flujos críticos que siempre se ejecutan en transacción

### 1. Crear venta
```
POST /sales
  → Validar stock suficiente por cada item
  → Crear Sale
  → Crear SaleItems (con snapshots)
  → moveStock() para cada item (type: 'sale')
  → Todo en una sola sesión de Mongoose
```

### 2. Recibir mercancía
```
POST /purchases/:id/receive
  → Verificar que la orden existe y no está cancelada
  → Actualizar quantityReceived en cada PurchaseItem
  → moveStock() para cada item (type: 'purchase')
  → Actualizar status de la orden (partial | received)
  → Todo en una sola sesión de Mongoose
```

### 3. Registro de nuevo tenant
```
POST /auth/register-tenant
  → Crear Tenant con plan 'small'
  → Crear primera Branch (sucursal principal)
  → Crear User con role 'owner' ligado al tenant
  → Retornar JWT
  → Todo en una sola sesión de Mongoose
```

---

## Docker

### Desarrollo local
```bash
docker-compose up          # Levanta: backend + MongoDB + Mongo Express
```

Mongo Express disponible en `http://localhost:8081` (usuario: admin / contraseña: admin)

### Build de producción
```bash
docker build --target production -t saas-inventory-api .
```

---

## Scripts disponibles

### Backend
```bash
npm run dev          # ts-node-dev con hot reload
npm run build        # Compilar TypeScript a dist/
npm start            # node dist/server.js
npm test             # Jest
npm run lint         # ESLint
npm run format       # Prettier
```

### Frontend
```bash
npm run dev          # Vite dev server en puerto 5173
npm run build        # Build de producción
npm run preview      # Preview del build
npm test             # Vitest
npm run lint         # ESLint
npm run format       # Prettier
```

---

## Cómo agregar un nuevo módulo

Cuando el usuario pida agregar un nuevo módulo (ej: "agrega gestión de clientes"), seguir este orden exacto:

### Backend
1. Crear `src/models/[nombre].model.ts` con `tenantId` como primer campo
2. Agregar permisos en `src/config/permissions.ts`
3. Crear `src/services/[nombre].service.ts`
4. Crear `src/controllers/[nombre].controller.ts`
5. Crear `src/routes/[nombre].routes.ts` con `validate()` y `checkPermission()` en cada ruta
6. Registrar las rutas en `src/routes/index.ts`
7. Agregar índices de MongoDB en el modelo

### Frontend
1. Crear `src/features/[nombre]/types.ts`
2. Crear `src/features/[nombre]/schemas.ts`
3. Crear `src/features/[nombre]/api.ts`
4. Crear `src/features/[nombre]/hooks.ts`
5. Crear `src/features/[nombre]/components/` con los componentes necesarios
6. Crear `src/pages/[Nombre]Page.tsx`
7. Agregar la ruta en `src/router/index.tsx`
8. Agregar el link en `Sidebar.tsx` con verificación de permiso

---

## Errores comunes y soluciones

**"No puedo acceder a datos de otra sucursal"**
→ El middleware `checkPermission` inyecta `branchId` fijo en el query cuando `ownBranchOnly: true`. Es correcto. No cambiar este comportamiento.

**"Stock quedó en negativo"**
→ `moveStock()` lanza `ApiError.badRequest` antes de descontar. Si llega a negativo, hay un bug en la transacción. Verificar que se usa `session` correctamente.

**"El email ya existe"**
→ El índice único es `{ tenantId, email }`. El mismo email puede existir en otro tenant. Si el error ocurre dentro del mismo tenant, es un duplicado real.

**"La venta no descuenta el stock"**
→ Verificar que `sale.service.ts` llama a `moveStock()` dentro de la misma `session` de Mongoose.

**"Los precios del reporte no coinciden con el precio actual"**
→ Correcto por diseño. `SaleItem.unitPrice` es un snapshot del precio al momento de la venta.
