# Pendientes del Proyecto

> Actualizado por /actualizarcontexto
> Última actualización: 2026-05-23 14:51
>
> Estados: 🔴 Bloqueado | 🟡 En progreso | ⚪ Pendiente | ✅ Completado
> Prioridad: P1 (crítico) | P2 (importante) | P3 (nice to have)

---

## P1 — Críticos (bloquean otros módulos)

| Estado | Tarea | Módulo | Notas |
|--------|-------|--------|-------|
| ✅ | Configurar estructura base del proyecto | Setup | Backend + Frontend |
| ✅ | Registro de tenant + primer owner | Auth | Crea tenant + branch + user en transacción |
| ✅ | Login con JWT | Auth | |
| ✅ | Middleware authenticate + resolveTenant | Middleware | Base de todo lo demás |
| ✅ | Middleware checkPermission con PERMISSIONS | Middleware | Autorización por rol |
| ✅ | Modelo Stock con índice único tenantId+branchId+productId | Models | |
| ✅ | moveStock() con transacción y StockMovement | Stock Service | Crítico para ventas y compras |

---

## P2 — Importantes

| Estado | Tarea | Módulo | Notas |
|--------|-------|--------|-------|
| ✅ | CRUD de productos con imágenes (Cloudinary) | Inventario | |
| ✅ | CRUD de categorías con jerarquía | Inventario | |
| ✅ | CRUD de proveedores | Compras | |
| ✅ | Crear venta (POS) con descuento de stock automático | Ventas | Usa moveStock() en transacción |
| ✅ | Historial de ventas con filtros | Ventas | |
| ✅ | Dashboard por sucursal | Frontend | |
| ✅ | Dashboard global (owner/admin) | Frontend | |
| ✅ | POS optimizado para tablet | Frontend | Layout touch-friendly |
| ✅ | Alertas de stock bajo (cron job) | Jobs | node-cron cada hora |
| ✅ | Cierre de caja | POS | Resumen del día por cajero |

---

## P3 — Nice to have

| Estado | Tarea | Módulo | Notas |
|--------|-------|--------|-------|
| ✅ | Exportar ventas a Excel (exceljs) | Reportes | |
| ✅ | Exportar reportes a PDF (pdfkit) | Reportes | |
| ✅ | Reporte comparativo entre sucursales | Reportes | Solo owner/admin |
| ✅ | Reporte de rentabilidad por producto | Reportes | |
| ✅ | Route guards por rol (PermissionRoute) | Frontend | Cashier restringido a / y /caja |
| ✅ | Ocultar costPrice/profit a cashier | Frontend | ShiftSummary + ShiftCloseReceipt |
| ✅ | Backend restructuring modular | Backend | 62 archivos a modules/ + shared/ |
| ⚪ | Scanner de código de barras (zxing) | POS | Desde cámara del tablet |
| ⚪ | Tests E2E con Playwright | Testing | Flujos críticos — infraestructura creada, 11/18 tests pendientes de arreglar |
| ⚪ | Pruebas de carga con k6 | Testing | Concurrencia en POS |
| ⚪ | Actualizar contexto IA | Setup | Pendiente hacer commit de cambios de esta sesión |

---

## Bloqueados

| Tarea | Bloqueado por | Desde |
|-------|---------------|-------|
| (ninguno) | | |

---

## Completados recientemente

| Fecha | Tarea | Módulo |
|-------|-------|--------|
| 2026-05-23 | Fix: import Excel no creaba productos (brandId string→ObjectId en bulkWrite) | Backend |
| 2026-05-23 | Fix: productos no visibles en sucursal (string/ObjectId mismatch en 11 aggregation pipelines) | Backend |
| 2026-05-23 | Fix: búsqueda de productos daba 500 ($text→$regex) | Backend |
| 2026-05-23 | Fix: ventas fallaban 500 (StockMovement.referenceId ObjectId→String) | Backend |
| 2026-05-23 | Fix: clientes sin branchId (schema + $or fallback en queries) | Backend |
| 2026-05-23 | Fix: NaN en reportes de caja y clientes (campos faltantes en 2 modelos) | Backend + Frontend |
| 2026-05-23 | Fix: cliente persistía en POS post-venta (saleKey + key prop) | Frontend |
| 2026-05-23 | Infraestructura E2E con Playwright (config + 3 fixtures + 3 suites) | Testing |
| 2026-05-22 | Reestructuración completa del backend: modules/ + shared/ | Backend |
| 2026-05-22 | Route guards por rol (PermissionRoute) | Frontend |
| 2026-05-22 | Ocultar costPrice/profit a cashier en ShiftSummary + ShiftCloseReceipt | Frontend |
| 2026-05-20 | Exportar a Excel/PDF, reportes comparativos y rentabilidad | Reportes |
| 2026-05-20 | Cierre de caja (CashierShift + CashMovement) | POS |
