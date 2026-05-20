# Estado de Tests

> Actualizado por /actualizarcontexto
> Última actualización: [PENDIENTE]

---

## Resumen

| Capa | Tests escritos | Pasando | Fallando | Cobertura |
|------|---------------|---------|----------|-----------|
| Unitarios backend | 0 | 0 | 0 | — |
| Integración backend | 0 | 0 | 0 | — |
| Unitarios frontend | 0 | 0 | 0 | — |
| Integración frontend | 0 | 0 | 0 | — |
| E2E | 0 | 0 | 0 | — |

---

## Cómo obtener el estado actual

```bash
# Backend
cd backend && pnpm test -- --coverage 2>&1 | tail -20

# Frontend
cd frontend && pnpm test -- --coverage 2>&1 | tail -20
```

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

<!-- La IA actualiza esta sección -->
- Ninguno conocido aún

---

## Deuda técnica en testing

<!-- La IA detecta y lista aquí qué no tiene test pero debería -->
- Todo el proyecto está sin tests aún (inicio del desarrollo)
