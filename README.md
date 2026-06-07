# InventoPro

Sistema de gestión de inventario SaaS multitenant para retail. Administra productos, ventas, stock, sucursales y usuarios con control de roles y permisos.

---

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 4
- **Base de datos:** MongoDB + Mongoose 8
- **Autenticación:** JWT (Access + Refresh tokens), bcryptjs
- **Validación:** Zod
- **Archivos:** Multer + Cloudinary
- **Reportes:** PDFKit, ExcelJS
- **Logging:** Winston
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **UI:** Tailwind CSS v4 + Radix primitives + shadcn/ui
- **Estado servidor:** TanStack React Query v5
- **Formularios:** react-hook-form + Zod
- **Routing:** react-router-dom v7
- **Gráficos:** recharts
- **Iconos:** lucide-react

---

## Arquitectura

```
Frontend (Vercel) ─── API ─── Backend (Render) ─── MongoDB (Atlas)
```

- **Frontend:** SPA React desplegada en Vercel con rewrites para SPA routing
- **Backend:** API REST desplegada en Render con Express
- **Autenticación:** Access token (15 min en memoria) + Refresh token (7 días en cookie httpOnly)
- **Multitenant:** Aislamiento de datos por `tenantId`, cada tenant con sus propias sucursales, productos y usuarios

### Roles
| Rol | Acceso |
|---|---|
| **owner** | Acceso completo a todas las sucursales, reportes globales, configuración del tenant |
| **admin** | Gestión de inventario, ventas, usuarios, limitado a su sucursal |
| **cashier** | Punto de venta, gestión de caja, consulta de inventario |

---

## Funcionalidades

### Inventario
- CRUD de productos con imágenes (subida a Cloudinary)
- Búsqueda por nombre, SKU, código de barras
- Control de stock por sucursal
- Alertas de stock bajo y sin stock
- Ajustes y movimientos de stock con auditoría
- Importación y exportación masiva via Excel
- Validación de duplicados (nombre, SKU, código de barras)

### Punto de Venta (POS)
- Múltiples cajas simultáneas
- Búsqueda de productos con escáner de código de barras
- Selección de cliente
- Métodos de pago: efectivo, tarjeta, transferencia, cambio
- Descuentos por producto
- Generación de ticket PDF
- Devoluciones y cancelaciones

### Gestión de Caja
- Apertura y cierre de turno
- Registro de ingresos y egresos de efectivo
- Resumen de ventas por turno

### Ventas
- Historial completo con filtros por fecha, estado, método de pago
- Resumen de ventas con métricas
- Detalle de venta con acciones de devolución

### Reportes
- Reporte de ventas
- Valor del inventario
- Rentabilidad
- Comparación entre sucursales
- Productos más vendidos
- Productos con stock bajo y sin stock

### Catálogos
- Departamentos (jerárquicos)
- Categorías
- Marcas
- Proveedores
- Clientes (con historial de compras)

### Usuarios y Permisos
- CRUD de usuarios con asignación de rol y sucursal
- Permisos granulares por acción

### Sucursales
- Configuración de múltiples sucursales por tenant
- Datos de contacto y dirección

### Personalización
- Logo de la empresa
- Colores corporativos
- Información del tenant (nombre, NIT, dirección)

---

## Capturas de pantalla

*(Agrega aquí capturas del dashboard, POS, inventario y reportes)*
