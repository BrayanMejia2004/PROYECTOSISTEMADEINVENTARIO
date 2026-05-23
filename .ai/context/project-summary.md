# Resumen del Proyecto — SaaS Inventory

> Actualizado automáticamente por /actualizarcontexto
> Última actualización: 2026-05-23 14:51

---

## ¿Qué es?

SaaS B2B multitenant para gestión de inventario, ventas, compras y reportes financieros
orientado a papelerías y negocios de retail medianos y grandes.

## Modelo de negocio

- Planes: **small** / **medium** / **large** (por sucursales y usuarios)
- Clientes: empresas con múltiples sucursales
- Usuarios por empresa: owner, admin, manager, cashier

## Módulos implementados

- [x] Autenticación y registro de tenant
- [x] Gestión de sucursales
- [x] Gestión de usuarios y roles
- [x] Catálogo de productos y categorías
- [x] Gestión de proveedores
- [x] Gestión de clientes
- [x] Inventario y stock por sucursal
- [x] Punto de venta (POS para tablet)
- [x] Historial de ventas
- [x] Cierre de caja
- [x] Dashboard global y por sucursal
- [x] Alertas de stock bajo (cron job)
- [x] Reportes financieros
- [x] Exportación a Excel/PDF
- [ ] Scanner de código de barras (zxing)
- [~] Tests E2E con Playwright (infraestructura creada, 7/18 tests pasan)
- [ ] Pruebas de carga con k6

## Interfaces

- **Web** (navegador) — gestión, reportes, configuración
- **Tablet** (mostrador) — punto de venta optimizado para touch

## Estado general del proyecto

🔵 En desarrollo avanzado — funcionalidades core completas y estables, E2E en progreso, falta scanner de barras y tests unitarios
