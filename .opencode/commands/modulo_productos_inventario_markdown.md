# Módulo de Productos — Sistema de Inventarios

---

# 1. Información básica del producto

Estos campos son prácticamente obligatorios.

| Campo | Tipo | Descripción |
|---|---|---|
| idProducto | UUID / Long | Identificador interno |
| codigo | String | Código único o SKU |
| codigoBarras | String | Código de barras |
| nombre | String | Nombre del producto |
| descripcion | Text | Descripción detallada |
| categoriaId | FK | Categoría |
| marcaId | FK | Marca |
| estado | Boolean | Activo/Inactivo |
| imagen | URL/String | Imagen del producto |

---

# 2. Control de inventario

Aquí defines cómo se manejará el stock.

| Campo | Tipo | Descripción |
|---|---|---|
| controlaInventario | Boolean | Si descuenta stock |
| stockActual | Decimal | Existencia actual |
| stockMinimo | Decimal | Mínimo permitido |
| stockMaximo | Decimal | Máximo recomendado |
| unidadMedida | String | Unidad (kg, unidad, caja, litro) |
| permiteVentaSinStock | Boolean | Permitir vender en negativo |
| lote | Boolean | Maneja lotes |
| fechaVencimiento | Boolean | Maneja vencimiento |

---

# 3. Precios y costos

Aquí es donde entra IVA, descuentos y márgenes.

## Campos recomendados

| Campo | Tipo | Descripción |
|---|---|---|
| costoCompra | Decimal | Precio de compra |
| precioVenta | Decimal | Precio base de venta |
| margenGanancia | Decimal | % utilidad |
| aplicaIVA | Boolean | Si el producto tiene IVA |
| porcentajeIVA | Decimal | 19%, 5%, etc |
| precioConIVA | Decimal | Precio final con IVA |
| permiteDescuento | Boolean | Si acepta descuentos |
| descuentoMaximo | Decimal | % máximo permitido |
| precioMayoreo | Decimal | Precio por volumen |
| precioEspecial | Decimal | Precio promocional |

---

# 4. Cómo manejar correctamente el IVA

Aquí suele haber confusión.

## Lo recomendado profesionalmente

NO guardes únicamente el precio final.

Guarda:

- precio base
- porcentaje IVA
- precio calculado

## Ejemplo

| Campo | Valor |
|---|---|
| precioVenta | 100000 |
| aplicaIVA | true |
| porcentajeIVA | 19 |

### Fórmula

```txt
precioConIVA = precioVenta + (precioVenta * porcentajeIVA / 100)
```

### Resultado

```txt
119000
```

---

# 5. Descuentos — Opción recomendada (Opción B)

## Descuento aplicado en la venta

Lo más recomendable es que el producto NO guarde descuentos fijos.

El descuento debe aplicarse directamente en la factura o detalle de venta.

### Ventajas

- Más flexible
- Evita modificar productos constantemente
- Permite promociones temporales
- Es el estándar empresarial

## Campos recomendados en producto

| Campo | Tipo | Descripción |
|---|---|---|
| permiteDescuento | Boolean | Permite aplicar descuento |
| descuentoMaximo | Decimal | % máximo permitido |

## Campos recomendados en detalle factura

| Campo | Tipo | Descripción |
|---|---|---|
| descuento | Decimal | Valor descuento |
| tipoDescuento | String | Porcentaje o valor fijo |
| subtotal | Decimal | Valor antes de IVA |
| iva | Decimal | Valor IVA |
| total | Decimal | Total final |

---

# 6. Fórmula correcta de venta

El orden recomendado para calcular una venta es:

```txt
subtotal = cantidad * precio

descuento = subtotal * porcentajeDescuento / 100

subtotalConDescuento = subtotal - descuento

iva = subtotalConDescuento * porcentajeIVA / 100

total = subtotalConDescuento + iva
```

---

# 7. Recomendación importante

NO guardes valores calculados innecesariamente dentro del producto.

## Evita guardar

- subtotal
- totalIVA
- totalConIVA
- precioFinal

Porque estos valores:
- pueden cambiar
- generan inconsistencias
- duplican información

## Lo correcto

Guardar únicamente:
- configuración base
- precios base
- porcentajes
- reglas de negocio

Y calcular los resultados en:
- ventas
- facturas
- cotizaciones
- órdenes

---

