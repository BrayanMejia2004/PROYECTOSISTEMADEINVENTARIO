# Pendientes del Proyecto

> Actualizado por /actualizarcontexto
> Última actualización: 2026-05-20 15:07
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
| ⚪ | Scanner de código de barras (zxing) | POS | Desde cámara del tablet |
| ⚪ | Tests E2E con Playwright | Testing | Flujos críticos |
| ⚪ | Pruebas de carga con k6 | Testing | Concurrencia en POS |

---

## Bloqueados

| Tarea | Bloqueado por | Desde |
|-------|---------------|-------|
| (ninguno) | | |

---

## Completados recientemente

| Fecha | Tarea | Módulo |
|-------|-------|--------|
| 2026-05-20 | Exportar a Excel/PDF, reportes comparativos y rentabilidad | Reportes |
| 2026-05-20 | Cierre de caja (CashierShift + CashMovement) | POS |
