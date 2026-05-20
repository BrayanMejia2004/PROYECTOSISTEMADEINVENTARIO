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
