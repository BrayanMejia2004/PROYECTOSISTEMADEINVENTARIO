# Estado de Tests

> Actualizado por /actualizarcontexto
> Última actualización: 2026-05-23 14:51

---

## Resumen

| Capa | Tests escritos | Pasando | Fallando | Cobertura |
|------|---------------|---------|----------|-----------|
| Unitarios backend | 0 | 0 | 0 | — |
| Integración backend | 0 | 0 | 0 | — |
| Unitarios frontend | 0 | 0 | 0 | — |
| Integración frontend | 0 | 0 | 0 | — |
| E2E (Playwright) | 18 | 7 | 11 | — |

### E2E — Detalle por suite

| Suite | Archivo | Total | Pasando | Fallando |
|-------|---------|-------|---------|----------|
| Auth Flows | `e2e/auth/auth.spec.ts` | 7 | 2 | 5 |
| POS Flows | `e2e/pos/pos.spec.ts` | 5 | 2 | 3 |
| Inventory & Reports | `e2e/inventory/inventory.spec.ts` | 6 | 3 | 3 |

### E2E — Problemas conocidos en los tests

Los 11 tests fallan por bugs en el código de test, no en la aplicación:

1. **`loginAs()` helper roto**: `localStorage.setItem` + `page.reload()` no activa el flujo de auth. Necesita `page.goto('/')` + esperar networkidle.
2. **`getByLabel()` sin asociación DOM**: Los `<label>` no tienen `htmlFor` ni los `<input>` tienen `id`. Selectores deben usar `getByPlaceholder()` o `locator('input[name="..."]')`.
3. **Tests POS concurrentes**: `fullyParallel: true` hace que tests compitan por el mismo CashierShift. Se requiere `test.describe.serial`.
4. **Selectores incorrectos en reports**: El test busca "Ventas"/"Inventario"/"Rentabilidad" pero la página muestra otros textos.

---

## Tests críticos que DEBEN existir

### Backend — Seguridad multitenant (P1)
- [ ] Token de Tenant A → request a datos de Tenant B → 403
- [ ] Manager no puede ver datos de otra sucursal aunque cambie branchId en request
- [ ] JWT manipulado → 401

### Backend — Transacciones (P1)
- [ ] Venta exitosa: Sale + SaleItems + StockMovement creados en BD
- [ ] Venta fallida a mitad: rollback completo, ningún documento creado
- [ ] Stock no queda en negativo con concurrencia (10 cajeros al mismo tiempo)

### Backend — Autorización por rol (P1)
- [ ] Cashier no puede GET /reports/global
- [ ] Admin no puede PATCH /tenant/plan
- [ ] Manager solo ve ventas de su sucursal

### Backend — Límites del plan (P2)
- [ ] Plan small: crear 3ra sucursal → 403
- [ ] Plan small: crear usuario 11 → 403

### Frontend — Flujos críticos (P2)
- [ ] Login → redirección correcta según rol
- [ ] POS: agregar producto → cobrar → recibo visible
- [ ] ProtectedRoute: redirige a /login si no autenticado

---

## Últimos tests fallando

- `pnpm test` falla en backend por `ERR_PNPM_IGNORED_BUILDS` (mongodb-memory-server necesita `pnpm approve-builds`)
- Frontend timeout al ejecutar tests (sin tests escritos)
- E2E: 11/18 tests fallan por bugs en el código de test (ver sección arriba)

---

## Deuda técnica en testing

- Todo el proyecto está sin tests unitarios/integración (~12,895 líneas de código sin cobertura)
- Prioridad crítica: tests de transacciones (ventas) y seguridad multitenant
- E2E: infraestructura creada, tests funcionales necesitan correcciones de selectores y helpers
