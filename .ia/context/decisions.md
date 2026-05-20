# Decisiones Técnicas

> ⚠️ APPEND ONLY — Este archivo NUNCA se sobreescribe.
> Solo se agregan entradas nuevas al final.
> La IA NUNCA borra entradas existentes.

---

## Formato de entrada

```
### [FECHA] — [Título corto de la decisión]
**Contexto:** Por qué se necesitaba tomar una decisión.
**Decisión:** Qué se decidió.
**Alternativas descartadas:** Qué otras opciones se consideraron.
**Consecuencias:** Qué implica esta decisión.
```

---

## Decisiones fundacionales del proyecto

### [Inicio] — Arquitectura multitenant con tenantId en cada documento
**Contexto:** El SaaS necesita aislar los datos de múltiples empresas cliente.
**Decisión:** Cada documento MongoDB lleva `tenantId` como primer campo. Los middlewares `authenticate` y `resolveTenant` lo inyectan automáticamente en cada request.
**Alternativas descartadas:** Base de datos separada por tenant (demasiado costoso en infraestructura), esquema separado por tenant (MongoDB no lo soporta nativamente).
**Consecuencias:** Todos los índices deben incluir `tenantId` como primer campo. Todas las queries deben filtrar por `tenantId`.

---

### [Inicio] — Stock independiente por sucursal
**Contexto:** Una papelería puede tener sucursales en distintas ubicaciones con inventarios físicamente separados.
**Decisión:** El stock se almacena en la colección `stock` con un documento por `{ tenantId, branchId, productId }`. Índice único compuesto.
**Alternativas descartadas:** Stock global con reservas por sucursal (más complejo, innecesario para el caso de uso).
**Consecuencias:** Para ver el stock total de un producto hay que agregar sobre todos los documentos de ese producto.

---

### [Inicio] — Precio de venta por sucursal (en colección stock)
**Contexto:** Diferentes sucursales del mismo negocio pueden tener precios distintos (ej: sucursal aeropuerto vs centro).
**Decisión:** El campo `price` (precio de venta) vive en el documento de `stock`, no en `products`. El campo `costPrice` vive en `products` porque es igual para todas las sucursales del tenant.
**Alternativas descartadas:** Precio en products con override en stock (más complejo sin beneficio real).
**Consecuencias:** Al mostrar precio de un producto hay que hacer join con stock de la sucursal activa.

---

### [Inicio] — StockMovements como audit log inmutable
**Contexto:** En un sistema de inventario es crítico saber quién cambió qué y cuándo.
**Decisión:** Cada operación que modifica stock crea un documento en `stockMovements`. Este modelo bloquea updates con un hook pre-save. Solo se insertan, nunca se modifican.
**Alternativas descartadas:** Guardar historial en el propio documento de stock (pierde historial completo).
**Consecuencias:** Para auditar, siempre consultar `stockMovements`. La cantidad actual siempre está en `stock.quantity`.

---

### [Inicio] — Snapshots en SaleItems
**Contexto:** Los reportes financieros deben reflejar el precio real al momento de la venta, no el precio actual del producto.
**Decisión:** Al crear una venta, se copian `productName`, `sku`, `unitPrice` y `costPrice` en cada `SaleItem`. Estos valores no se actualizan nunca.
**Alternativas descartadas:** Referencia al producto con precio actual (los reportes históricos quedarían incorrectos si el precio cambia).
**Consecuencias:** Los reportes de rentabilidad son precisos históricamente. El espacio en disco es ligeramente mayor.

---

### [Inicio] — Plan fijo por tenant con límites en planLimits
**Contexto:** El modelo de negocio es SaaS con 3 planes diferenciados por capacidad.
**Decisión:** Los límites se almacenan en `tenant.planLimits` y se actualizan automáticamente con un pre-save hook cuando cambia `tenant.plan`. Small: 2 sucursales / 10 usuarios. Medium: 10/50. Large: 50/200.
**Alternativas descartadas:** Calcular límites en el middleware en runtime (más requests, más lento).
**Consecuencias:** Al hacer upgrade de plan, solo se actualiza `plan` y el hook sincroniza `planLimits` automáticamente.

---

### [Inicio] — pnpm como package manager
**Contexto:** Necesitamos un package manager eficiente para monorepo o proyectos separados.
**Decisión:** pnpm en lugar de npm o yarn. Todos los comandos de instalación, scripts y CI usan pnpm.
**Alternativas descartadas:** npm (más lento, más espacio en disco), yarn (menos adoptado recientemente).
**Consecuencias:** Usar siempre `pnpm install`, `pnpm add`, `pnpm remove`. Nunca npm ni npx — usar `pnpm exec` en su lugar.

---

### [Inicio] — Transacciones de Mongoose en operaciones críticas
**Contexto:** Crear una venta modifica 3 colecciones simultáneamente (Sale, SaleItems, Stock via moveStock). Si falla a mitad, los datos quedan inconsistentes.
**Decisión:** Las operaciones que modifican más de una colección siempre usan `session` de Mongoose (transacciones de MongoDB). Esto aplica a: crear venta, recibir mercancía, registrar tenant.
**Alternativas descartadas:** Operaciones secuenciales sin transacción (riesgo de inconsistencia).
**Consecuencias:** MongoDB debe correr en modo replica set (incluso en desarrollo). docker-compose debe configurarlo.

---

<!-- La IA agrega nuevas decisiones DEBAJO de esta línea, nunca modifica las de arriba -->
