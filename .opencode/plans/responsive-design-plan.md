# Plan: Ajustes Responsive Design

Basado en auditoría completa del frontend. Organizado por prioridad.

---

## Prioridad 1 — Críticos (rompen funcionalidad en mobile)

### 1.1 Sidebar colapsable en mobile
**Archivos:** `Sidebar.tsx`, `AppShell.tsx`, `Header.tsx`

**Problema:** Sidebar de 256px siempre visible. En celular 375px solo quedan 119px para contenido.

**Solución:**
- `Sidebar.tsx`: Agregar estado `isOpen`, animación de slide, overlay en mobile
  - `fixed lg:static inset-y-0 left-0 z-40`
  - `-translate-x-full lg:translate-x-0` + transición
  - Overlay `fixed inset-0 bg-black/40 z-30 lg:hidden`
- `Header.tsx`: Agregar botón hamburguesa `lg:hidden` para toggle sidebar
- `AppShell.tsx`: En mobile, contenido ocupa `w-full`

```tsx
// Sidebar.tsx estructura base
<>
  {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
  <aside className={cn(
    "fixed lg:static inset-y-0 left-0 z-40 w-64 min-h-screen bg-brand-sidebar",
    "transform transition-transform duration-200 ease-in-out",
    isOpen ? "translate-x-0" : "-translate-x-full",
    "lg:translate-x-0"
  )}>
    {/* contenido existente */}
  </aside>
</>
```

### 1.2 POS page: panels apilados en mobile
**Archivo:** `PosPage.tsx`

**Problema:** `flex-[2]` (búsqueda) y `flex-1` (carrito) lado a lado en todas las pantallas. En mobile cada panel es demasiado angosto.

**Solución:**
```tsx
<div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
  <div className="w-full lg:flex-[2] ..."> {/* full en mobile, 2/3 en desktop */}
  <div className="w-full lg:flex-1 lg:max-w-sm ..."> {/* full en mobile, 1/3 en desktop */}
```

### 1.3 Tabla de productos: ocultar columnas en mobile
**Archivo:** `ProductTable.tsx`

**Problema:** 10 columnas visibles siempre. Horizontal scroll extremo.

**Solución:** Agregar `hidden md:table-cell` a columnas de baja prioridad:
- `md:hidden`: Código, Tipo, Costo, Ganancia, Precio Mayor
- `hidden md:table-cell`: Departamento (oculto en mobile, visible en desktop)

En mobile mostrar solo: Nombre, Stock, Precio, Acciones.

---

## Prioridad 2 — UX táctil (touch targets)

### 2.1 Botones de acción en tablas (todos los CRUD)
**Archivos:** SuppliersPage, CustomersPage, UsersPage, CategoriesPage, DepartmentsPage, SettingsPage, SalesPage (pagination)

**Problema:** `p-1.5` (~30px). Mínimo recomendado: 44x44px.

**Solución:** Cambiar todos los `p-1.5` a `p-2.5` (o `min-w-[44px] min-h-[44px]`).

Patrón de búsqueda: `p-1\.5` en todos los `.tsx` dentro de `pages/` y `components/`.

### 2.2 Botones de cantidad en POS
**Archivo:** `PosCart.tsx`

**Problema:** `w-7 h-7` (28px) en botones +/- y eliminar.

**Solución:** Cambiar a `w-10 h-10` con iconos `w-4 h-4`.

### 2.3 Paginación
**Archivos:** CRUD pages + SalesPage

**Problema:** Botones `p-1.5` (~28px).

**Solución:** Cambiar a `w-9 h-9` con iconos `w-4 h-4`.

### 2.4 Inputs de formularios
**Archivos:** Todos los forms (ProductForm, Login, Register, Settings, etc.)

**Problema:** `py-2.5` (~40px). Mínimo 44px.

**Solución:** Cambiar a `py-3` (48px).

### 2.5 Botón de filtro en Sales
**Archivo:** `SalesFilters.tsx`

**Problema:** `p-2` (~32px).

**Solución:** Cambiar a `p-2.5`.

---

## Prioridad 3 — Ajustes de layout

### 3.1 InventoryPage: header apilable
**Archivo:** `InventoryPage.tsx`

**Problema:** Título + 3 botones en una fila. En mobile se desborda.

**Solución:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <h1>...</h1>
  <div className="flex flex-wrap gap-2">
    {/* botones */}
  </div>
</div>
```

### 3.2 Search input fixed width
**Archivo:** `CustomersPage.tsx`

**Problema:** `w-56` se desborda en mobile < 360px.

**Solución:** `w-full sm:w-56`.

### 3.3 Tenant name truncate
**Archivo:** `Header.tsx`

**Problema:** Nombre largo puede desbordarse.

**Solución:** Agregar `truncate` al `<h2>` del tenant name.

---

## Resumen de archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `components/layout/Sidebar.tsx` | Sidebar colapsable con overlay + transición |
| 2 | `components/layout/AppShell.tsx` | Ajustar layout para sidebar overlay |
| 3 | `components/layout/Header.tsx` | Botón hamburguesa + truncate tenant name |
| 4 | `pages/PosPage.tsx` | Paneles apilados en mobile (flex-col lg:flex-row) |
| 5 | `features/inventory/components/ProductTable.tsx` | Ocultar columnas en mobile |
| 6-11 | Todas las páginas CRUD | `p-1.5` → `p-2.5` en acciones |
| 12 | `features/sales/components/PosCart.tsx` | Botones +/- a `w-10 h-10` |
| 13 | `features/sales/components/SalesFilters.tsx` | `p-2` → `p-2.5` |
| 14 | `pages/InventoryPage.tsx` | Header flexible con wrap |
| 15 | `pages/CustomersPage.tsx` | Search input `w-full sm:w-56` |
| 16 | `features/sales/components/SalesSummaryCards.tsx` | Ya responsive, verificar |
| 17 | `features/sales/components/ShiftSummary.tsx` | Ya responsive, verificar |
