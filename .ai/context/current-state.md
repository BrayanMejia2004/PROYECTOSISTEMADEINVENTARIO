# Estado Actual del Proyecto

> ⚠️ Este archivo se sobreescribe completamente en cada /actualizarcontexto
> Para el historial de cambios ver: changelog.md
> Última actualización: 2026-05-23 14:51

---

## Backend (Express + Mongoose, ~5,800 líneas)

### Estructura modular

```
backend/src/
├── config/           # env, database, logger, cloudinary, permissions
├── middlewares/       # auth, authorize, error, notFound, tenant, validate
├── jobs/              # stockAlert/
├── routes/index.ts    # barrel que importa de modules/
├── shared/
│   ├── models/        # 15 modelos (cada uno en subcarpeta)
│   ├── types/         # express.d.ts
│   └── utils/         # apiError, apiResponse, jwt, pdf, sequenceGenerator
└── modules/           # 14 módulos de dominio
```

### Modelos (15) — estado post-fixes 2026-05-23

| Modelo | Campos clave | Índices |
|--------|-------------|---------|
| Tenant | name, slug (unique), email, isActive | slug unique |
| Branch | tenantId, name, address, phone, isActive | { tenantId, name } unique |
| User | tenantId, email, password, firstName, lastName, role, branchId, isActive | { tenantId, email }, { tenantId, branchId } |
| Department | tenantId, **branchId**, name, parentId, isActive | { tenantId, branchId, name } unique |
| Category | tenantId, name, isActive | { tenantId, name } unique |
| Brand | tenantId, **branchId**, name, isActive | { tenantId, branchId, name } unique |
| Supplier | tenantId, name, contactName, email, phone, address, taxId, isActive | { tenantId, name } unique |
| Customer | tenantId, **branchId**, name, email, phone, address, taxId, isActive, **totalPurchases**, **totalSpent**, **lastPurchaseDate** | { tenantId, branchId } |
| Product | tenantId, sku, barcode, name, departmentId, brandId, supplierId, costPrice, price (+10 fields) | { tenantId, sku }, { tenantId, barcode }, text index |
| Stock | tenantId, branchId, productId, quantity, price, minStock, isLowStock | { t, b, p } unique, 2 más |
| StockMovement | tenantId, branchId, productId, type, quantity, previous/newQuantity, **referenceId (String)**, note | 3 compound |
| Sale + SaleItems | tenantId, saleNumber, branchId, userId, customerId, items[], subtotal, tax, discount, total, paymentMethod, status, transfer/card/exchange fields | 4 compound |
| CashierShift | tenantId, branchId, userId, openingBalance, closingBalance, totalSales, **totalCash**, **totalCard**, **totalTransfer**, **totalProfit**, totalEntries, totalExits, status, openedAt, closedAt | { t, b, status }, { t, u, status } |
| CashMovement | tenantId, shiftId, type, amount, reason, userId | { shiftId, createdAt } |
| Counter | tenantId, key, seq | { tenantId, key } unique |

### Bugs corregidos en esta sesión (2026-05-23)

1. **Import Excel no creaba productos**: brandId recibía nombre de marca (string) pero el schema esperaba ObjectId → el bulkWrite fallaba completo. Fix: auto-creación de marcas en importProducts + brandMap name→ObjectId.

2. **Productos no se listaban en sucursal**: getProducts usaba aggregation `$match` con tenantId string vs ObjectId en MongoDB → 0 resultados. Fix: `new mongoose.Types.ObjectId()` en query + `$toString` en ambos lados del `$lookup` stockInfo. Igual fix aplicado a report.service.ts (4 funciones), sale.service.ts (3 funciones), cashierShift.service.ts (4 funciones).

3. **Búsqueda de productos daba 500**: `$text` search requería índice de texto compuesto que no era compatible con el query planner. Fix: reemplazado `$text` por `$regex` en name, sku y barcode.

4. **Ventas fallaban con 500**: StockMovement.referenceId era ObjectId pero moveStock() pasaba saleNumber (string "V-2026-..."). Fix: cambiado tipo a String.

5. **Clientes no se guardaban con branchId**: Customer model no declaraba branchId → Mongoose lo silenciaba. Fix: agregado branchId al schema + $or fallback en queries.

6. **NaN en cierre de caja y clientes**: CashierShift no tenía totalCash/Card/Transfer/Profit en el schema. Customer no tenía totalPurchases/totalSpent. Fix: campos agregados a ambos modelos + guardias null en formatCurrency/formatNumber.

7. **Cliente persistía después de venta en POS**: selectedCustomer era estado local de PosCart que no se reseteaba. Fix: saleKey forzando remount vía key prop en PosPage.

### Endpoints

14 módulos con rutas completas: Auth, Tenant, Branch, User, Department, Category, Brand, Supplier, Customer, Product (CRUD + import/export/barcode), Stock (init/adjust/price), Sale (CRUD + summary/refund/transfers/PDF), CashierShift (CRUD + open/close/movements), Report (sales/inventory/profitability/branches).

---

## Frontend (React + Vite + TanStack Query, ~8,700 líneas)

### Páginas (15)
Login, RegisterTenant, Dashboard, Inventory, ProductForm, Departments, Pos, Sales, CashierShift, Suppliers, Customers, Reports, Users, Settings, NotFound.

### Estado global
- AuthContext: sesión, token en localStorage
- BranchContext: sucursal activa
- CartContext: multi-cart POS con persistencia en sessionStorage

### Route guards
PermissionRoute por rol para cada ruta. Cashier restringido a /, /caja, /pos/:cartId.

### Bugs corregidos
- POS: cliente se limpia post-venta (saleKey + key prop en PosCart)
- formatCurrency/formatNumber: retornan '$0'/'0' en vez de NaN para valores nulos

---

## Testing

### Estado actual

| Capa | Tests escritos | Pasando | Fallando |
|------|---------------|---------|----------|
| Backend (jest) | 0 | 0 | 0 |
| Frontend (vitest) | 0 | 0 | 0 |
| E2E (Playwright) | 18 | 7 | 11 |

### E2E — Infraestructura creada
- `frontend/playwright.config.ts`: Chromium, webServer frontend+backend, parallel
- `frontend/e2e/fixtures/auth.ts`: setupTestContext crea tenant+owner+admin+cashier vía API
- `frontend/e2e/fixtures/api.ts`: seedProduct vía API
- 3 suites: auth (7 tests), pos (5 tests), inventory (6 tests)
- 7 tests pasan, 11 fallan por bugs en el código de test (selectores, loginAs(), concurrencia)

### Problemas conocidos
- `pnpm test` falla por `ERR_PNPM_IGNORED_BUILDS` (mongodb-memory-server)
- E2E: 11 tests fallan por defectos en los selectores y helper de login (no en la app)
- Directorio `categories/` vacío en frontend (residuo)

---

## Notas de la sesión 2026-05-23

- Corregidos 7 bugs críticos: import Excel roto, productos no visibles, búsqueda con 500, ventas con 500, clientes sin branchId, NaN en reportes, cliente persiste en POS
- Agregados campos faltantes en 4 modelos (Brand, Customer x2, CashierShift)
- Fix de tipo ObjectId vs string en 11 aggregation pipelines (report, sale, cashierShift, product)
- Reemplazado $text por $regex en búsqueda de productos
- Creada infraestructura E2E con Playwright: 18 tests, 3 fixtures, 2 comandos
- Backend: 0 errores TypeScript
- Frontend: 0 errores TypeScript
