# Changelog del Proyecto

> Actualizado por /actualizarcontexto
> Cada entrada es APPEND ONLY — nunca se borra el historial.
> La IA agrega nuevas entradas AL INICIO (más reciente primero).

---

## Formato de entrada

```
### [YYYY-MM-DD] — [Resumen de la sesión en una línea]

**Backend:**
- feat: descripción del cambio
- fix: descripción del fix
- refactor: descripción

**Frontend:**
- feat: descripción
- fix: descripción

**Base de datos:**
- Nuevo modelo: NombreModelo
- Nuevo índice: colección.campo

**Tests:**
- Nuevo test: descripción
- Tests arreglados: descripción

**Infraestructura:**
- Cambio en docker-compose, CI, etc.

**Decisiones tomadas:**
- Referencia a decisions.md si aplica
```

---

<!-- La IA inserta nuevas entradas AQUÍ, debajo de esta línea -->

### 2026-05-23 — Sesión de corrección de bugs y setup E2E

**Backend:**
- fix: Import Excel no creaba productos — brandId era nombre de marca (string) pero schema esperaba ObjectId. Agregada auto-creación de marcas en importProducts con brandMap name→ObjectId
- fix: Productos no visibles en sucursal — string/ObjectId mismatch en aggregation pipelines. Convertido tenantId/branchId/departmentId/supplierId a ObjectId en 11 funciones (getProducts, 4 en report.service, 3 en sale.service, 4 en cashierShift.service)
- fix: $lookup stockInfo no matcheaba — $toString solo en un lado del $eq. Agregado $toString en ambos lados
- fix: Búsqueda de productos daba 500 — $text con índice compuesto incompatible con query planner. Reemplazado por $regex en name, sku, barcode
- fix: Ventas fallaban con 500 — StockMovement.referenceId era ObjectId pero moveStock pasaba saleNumber (string). Cambiado tipo a String
- fix: Clientes no guardaban branchId — Customer model no declaraba branchId. Agregado al schema + $or fallback en 5 queries del servicio
- fix: Marcas no guardaban branchId — Brand model no declaraba branchId. Agregado al schema + $or fallback en 4 queries del servicio
- fix: NaN en cierre de caja — CashierShift sin campos totalCash/totalCard/totalTransfer/totalProfit. Agregados al modelo
- fix: NaN en clientes — Customer sin campos totalPurchases/totalSpent/lastPurchaseDate. Agregados al modelo

**Frontend:**
- fix: Cliente persistía en POS post-venta — saleKey + key prop en PosCart para forzar remount
- fix: formatCurrency/formatNumber retornan '$0'/'0' en vez de NaN para valores null/undefined/NaN
- feat: Infraestructura E2E con Playwright — 18 tests, 3 fixtures (auth, api), 3 suites (auth, pos, inventory)

**Decisiones tomadas:**
- Departments/Brands/Customers declarados per-branch: branchId opcional con $or fallback para legacy
- referenceId en StockMovement cambiado de ObjectId a String (saleNumber es string no ObjectId)
- $text search reemplazado por $regex (más compatible con índices compuestos)
- E2E tests usan API para crear datos de prueba (register-tenant, create user/branch/product) en vez de seeds

### 2026-05-22 — Fix: department branchId missing from schema, products not showing

**Backend:**
- fix: Added `branchId` field to Department schema (was missing, causing empty lists)
- fix: Updated department service queries to include departments without branchId (backward compat)
- fix: Updated parent lookups in create/update to handle legacy departments

**Decisiones tomadas:**
- Departments declared per-branch: branchId added to schema + unique index updated to include it
- $or query used to also return legacy departments without branchId until re-created

### 2026-05-20 — Unificación del sistema de contexto IA en .ai/

**Setup:**
- Movida estructura `.ia/` y `saas-ai-context/` a `.ai/context/`
- Primera ejecución de `/actualizarcontexto` con estado real del proyecto detectado

**Backend:**
- Detectados 14 modelos, 13 servicios, 14 controladores, 13 rutas, 6 middlewares implementados
- ~4,600 líneas de código real (sin templates)

**Frontend:**
- Detectadas 14 páginas, 3 context providers, 10 features organizadas por dominio
- ~8,295 líneas de código real
- POS multi-cart, Dashboard, Reportes con gráficos, Cierre de caja

**Tests:**
- Infraestructura configurada pero sin casos de prueba escritos

### [Inicio del proyecto] — Configuración inicial del sistema de contexto IA

**Setup:**
- Creada estructura `.ai/` con sistema de contexto automático
- Definida arquitectura del proyecto en `architecture.md`
- Definidos pendientes iniciales en `pending.md`
- Documentadas decisiones técnicas fundacionales en `decisions.md`

**Decisiones documentadas:**
- Multitenant con tenantId en cada documento
- Stock independiente por sucursal
- Precio de venta por sucursal (en colección stock)
- StockMovements como audit log inmutable
- Snapshots en SaleItems
- Plan fijo con planLimits sincronizados por hook
- pnpm como package manager
- Transacciones de Mongoose en operaciones críticas
