# Plan: Módulo de Intercambio (Exchange) en Ventas

## Objetivo
Permitir que cuando una venta es devuelta (refund), el cliente pueda hacer un intercambio por otros productos sin que se le cobre doble vez, con soporte para pago mixto (intercambio + efectivo/tarjeta/transferencia si el nuevo total excede el crédito).

---

## Flujo de usuario

```
1. [Admin] En /sales → abre detalle → clic "Devolver"
   → Stock restaurado, venta → 'refunded'

2. [Cajero] Va a /pos → agrega productos al carrito manualmente

3. [Cajero] Al pagar → selecciona "Intercambio"
   → Busca venta original refundada por número de ticket
   → Sistema muestra crédito disponible
   → Valida que total carrito >= crédito (debe igualar o superar)
   → Si hay excedente, selecciona método de pago para el extra

4. [Sistema] Crea venta con pago mixto
```

---

## 1. Backend — Sale Model

**Archivo:** `backend/src/models/sale.model.ts`

### Cambios:
```typescript
// Agregar al schema:
exchangeFromSaleId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Sale',
  default: null,
},
exchangeCredit: {
  type: Number,
  default: 0,
},

// Modificar enum de paymentMethod:
paymentMethod: {
  type: String,
  enum: ['cash', 'card', 'transfer', 'exchange'],
  required: true,
},
```

---

## 2. Backend — Sale Service

**Archivo:** `backend/src/services/sale.service.ts`

### Cambios en `createSale`:

Después de la validación inicial, agregar lógica de intercambio:

```typescript
if (input.exchangeFromSaleId) {
  const originalSale = await Sale.findOne({
    _id: input.exchangeFromSaleId,
    tenantId,
  });
  
  if (!originalSale) throw ApiError.notFound('Venta original no encontrada');
  if (originalSale.status !== 'refunded')
    throw ApiError.badRequest('La venta original debe estar devuelta');
  
  // Calcular crédito ya usado en intercambios previos
  const usedAgg = await Sale.aggregate([
    { $match: { exchangeFromSaleId: originalSale._id, tenantId } },
    { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
  ]);
  const usedCredit = usedAgg[0]?.total || 0;
  const availableCredit = originalSale.total - usedCredit;
  
  if (input.exchangeCredit > availableCredit)
    throw ApiError.badRequest(
      `Crédito insuficiente. Disponible: ${formatCurrency(availableCredit)}`
    );
  
  if (input.total < input.exchangeCredit)
    throw ApiError.badRequest(
      'El total debe ser mayor o igual al crédito de intercambio'
    );
  
  // Si total > crédito, requiere método de pago para el extra
  if (input.total > input.exchangeCredit) {
    if (!input.paymentMethod || input.paymentMethod === 'exchange') {
      throw ApiError.badRequest(
        `El excedente de ${formatCurrency(input.total - input.exchangeCredit)} requiere un método de pago`
      );
    }
  } else {
    input.paymentMethod = 'exchange';
  }
}
```

El descuento de stock sigue funcionando igual (se descuenta normal).

---

## 3. Backend — Cashier Shift Service

**Archivo:** `backend/src/services/cashierShift.service.ts`

### Cambio en cálculo de totales:

Donde se calcula `totalSales` y `totalRevenue`, excluir la porción de crédito de las ventas exchange:

```typescript
// Para cada venta:
const effectiveRevenue = sale.paymentMethod === 'exchange'
  ? sale.total - (sale.exchangeCredit || 0)
  : sale.total;
```

---

## 4. Frontend — PaymentModal

**Archivo:** `frontend/src/features/sales/components/PaymentModal.tsx`

### Cambios:

**A. Agregar "Intercambio" como opción de método de pago:**
- En el POS, al seleccionar método de pago, agregar opción "Intercambio"
- Cuando se selecciona, el modal cambia a vista de intercambio

**B. Vista de intercambio:**
- **Campo "Venta original"**: input para buscar y seleccionar venta refundida por número de ticket
- **Crédito disponible**: muestra el monto de crédito de la venta original
- **Total carrito**: muestra el total actual
- **Diferencia**: si carrito > crédito, muestra "A pagar: $X" con selector de método de pago (efectivo/tarjeta/transferencia)
- **Validación**: si carrito < crédito, muestra advertencia "Debe agregar productos por al menos $X más"
- **Botón confirmar**: "Realizar intercambio" que envía los datos

**C. Props nuevas del modal:**
```typescript
interface PaymentModalProps {
  // ... existing props
  isExchange?: boolean;
  onExchangeConfirm?: (data: ExchangeData) => void;
}

interface ExchangeData {
  exchangeFromSaleId: string;
  exchangeCredit: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  // payment detail fields...
}
```

---

## 5. Frontend — Sales API / Hooks

**Archivo:** `frontend/src/features/sales/api.ts`

### Agregar endpoint:
```typescript
export const checkExchangeCredit = async (saleId: string): Promise<ApiResponse<{
  originalTotal: number;
  usedCredit: number;
  availableCredit: number;
}>> => {
  const { data } = await api.get(`${ENDPOINTS.SALES}/${saleId}/exchange-credit`);
  return data;
};
```

**Archivo:** `frontend/src/features/sales/hooks.ts`

### Agregar hook:
```typescript
export const useCheckExchangeCredit = (saleId: string | null) => {
  return useQuery({
    queryKey: ['sale', saleId, 'exchange-credit'],
    queryFn: () => salesApi.checkExchangeCredit(saleId!),
    enabled: !!saleId,
  });
};
```

---

## 6. Backend — Nuevo Endpoint

**Archivo:** `backend/src/controllers/sale.controller.ts`

```typescript
export const getExchangeCredit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const originalSale = await Sale.findOne({
      _id: req.params.id,
      tenantId: req.user!.tenantId,
      status: 'refunded',
    });
    if (!originalSale) throw ApiError.notFound('Venta devuelta no encontrada');
    
    const usedAgg = await Sale.aggregate([
      { $match: { exchangeFromSaleId: originalSale._id, tenantId: req.user!.tenantId } },
      { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
    ]);
    const usedCredit = usedAgg[0]?.total || 0;
    
    sendSuccess(res, 'Exchange credit info', {
      originalTotal: originalSale.total,
      usedCredit,
      availableCredit: originalSale.total - usedCredit,
    });
  } catch (error) {
    next(error);
  }
};
```

**Archivo:** `backend/src/routes/sale.routes.ts`
```typescript
router.get('/:id/exchange-credit', saleController.getExchangeCredit);
```

---

## 7. Frontend — SaleReceipt

**Archivo:** `frontend/src/features/sales/components/SaleReceipt.tsx`

### En la sección de método de pago, cuando es exchange:
```tsx
{sale.paymentMethod === 'exchange' && (
  <>
    <div className="flex justify-between">
      <span>Intercambio desde:</span>
      <span>{sale.exchangeFromSaleId}</span>
    </div>
    <div className="flex justify-between">
      <span>Crédito aplicado:</span>
      <span>{formatCurrency(sale.exchangeCredit)}</span>
    </div>
    {sale.total > sale.exchangeCredit && (
      <div className="flex justify-between font-bold">
        <span>Pagado adicional:</span>
        <span>{formatCurrency(sale.total - sale.exchangeCredit)}</span>
      </div>
    )}
  </>
)}
```

---

## 8. Frontend — Types

**Archivo:** `frontend/src/types/index.ts`

Agregar a `Sale` interface:
```typescript
exchangeFromSaleId?: string;
exchangeCredit?: number;
```

---

## Orden de implementación sugerido

1. Backend: Sale model (campos nuevos)
2. Backend: Sale service (lógica de validación en createSale)
3. Backend: Cashier shift service (excluir crédito de revenue)
4. Backend: Endpoint GET /sales/:id/exchange-credit
5. Frontend: Types (actualizar interface Sale)
6. Frontend: API + hooks (checkExchangeCredit)
7. Frontend: PaymentModal (vista de intercambio)
8. Frontend: SaleReceipt (desglose en ticket)
