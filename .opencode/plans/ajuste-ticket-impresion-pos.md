# Plan: Ajustar ticket de impresión para POS (SaleReceipt.tsx)

## Archivo a modificar
`frontend/src/features/sales/components/SaleReceipt.tsx`

## Cambios

### 1. Separar UI del área de impresión
- Usar `useRef` para aislar el contenido imprimible (`.receipt-print`)
- Usar variantes `print:` de Tailwind para ocultar UI en impresión (`print:hidden` en botones/header, `print:static` en overlay)

### 2. CSS `@media print` mejorado
```css
@media print {
  body * { visibility: hidden; }
  .receipt-print, .receipt-print * { visibility: visible; }
  .receipt-print {
    position: fixed;
    top: 0;
    left: 0;
    width: 80mm;
    padding: 3mm 4mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10px;
    line-height: 1.35;
    color: #000;
  }
  @page { margin: 0; size: 80mm auto; }
}
```

**Cambios clave vs actual:**
| Actual | Nuevo |
|--------|-------|
| `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)` | `position: fixed; top: 0; left: 0` (anclado a top-left) |
| Sin `@page` | `@page { margin: 0; size: 80mm auto; }` (sin márgenes, ancho 80mm) |
| Sin padding | `padding: 3mm 4mm` |
| Fuente heredada | `Courier New`, monospace (10px) |

### 3. Información del negocio en el ticket
- Nombre del negocio (ya existe)
- **NIT** del tenant (`tenant.nit`)
- **Dirección** (`tenant.address`)
- **Teléfono** (`tenant.phone`)

### 4. Datos de la venta
- N° Ticket
- Fecha y hora
- Cajero
- Lista de artículos (cant, nombre, precio unitario, total)
- Subtotal, impuestos, descuento, total
- Método de pago + datos bancarios/referencia
- Cliente (si aplica)

### 5. Pie de ticket
- "¡Gracias por su compra!"

### 6. Auto-cierre con afterprint
```tsx
useEffect(() => {
  const handleAfterPrint = () => onClose();
  window.addEventListener('afterprint', handleAfterPrint);
  return () => window.removeEventListener('afterprint', handleAfterPrint);
}, [onClose]);
```
El modal se cierra automáticamente después de imprimir.

### 7. Layout visual del ticket (monospace, 80mm)
```
          MI TIENDA
         NIT: 123.456.789-0
     Calle 123 #45-67, Ciudad
         Tel: 300 123 4567
  ─────────────────────────────
  Ticket:     V-000123
  Fecha:      13 may 2026, 3:30 p. m.
  Cajero:     Juan Pérez
  ─────────────────────────────
  Artículo          Total
  ─────────────────────────────
  Producto 1       $20.00
  Cant: 2 x $10.00
  Producto 2       $15.00
  Cant: 1 x $15.00
  ─────────────────────────────
  Subtotal         $35.00
  Impuestos         $2.10
  ─────────────────────────────
  TOTAL            $37.10
  ─────────────────────────────
  Método:         Efectivo
  Cliente:        María López
  ─────────────────────────────
     ¡Gracias por su compra!
```

## Verificación
- `cd frontend; npx tsc --noEmit` para verificar tipos
- Probar impresión en navegador con `window.print()` y seleccionar impresora POS (80mm)
