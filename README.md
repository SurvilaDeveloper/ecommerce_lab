# Commerce Lab

E-commerce full stack en desarrollo, pensado como base realista para un negocio online. El proyecto combina un backend en **Java + Spring Boot** con un frontend en **Next.js**, con foco en catálogo, carrito, órdenes y panel de administración.

## Estado actual

El proyecto ya cuenta con una base funcional tanto para usuarios como para administración.

### Backend

- API REST con Spring Boot
- Módulo de catálogo con:
  - categorías
  - productos
  - imágenes de producto
- Validaciones de negocio para productos y categorías
- Carrito de compras
- Checkout básico y creación de órdenes
- Historial de órdenes del usuario
- Panel admin de órdenes
- Cambio de estados de orden desde admin
- Métricas básicas de dashboard admin
- Listado admin de productos con:
  - búsqueda
  - filtros
  - ordenamiento
  - paginación real desde backend
  - estadísticas globales filtradas

### Frontend

- App en Next.js
- Vistas públicas de catálogo y detalle de producto
- Carrito con contador en navbar
- Mini resumen desplegable del carrito
- Flujo carrito -> checkout -> creación de orden
- Historial de órdenes del usuario autenticado
- Panel admin para:
  - productos
  - órdenes
  - métricas básicas
- Listado admin de productos con UX mejorada

## Tecnologías

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Base de datos relacional
- Maven

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Estructura general

```text
commerce-lab/
├── backend/   # API Spring Boot
└── frontend/  # App Next.js
```

> En algunos archivos y conversaciones se trabajó con rutas desde la raíz del proyecto y en otras con prefijo `backend/` o `frontend/`. La idea general es: backend separado del frontend.

## Funcionalidades principales

### Catálogo

- Gestión de categorías
- Gestión de productos
- Slug por producto y categoría
- SKU único por producto
- Soporte para precio, compare-at price, cost price, stock y low stock threshold
- Producto activo/inactivo
- Producto destacado
- Imagen principal y galería de imágenes

### Carrito y órdenes

- Agregar productos al carrito
- Visualizar carrito
- Checkout básico
- Crear orden a partir del carrito
- Ver órdenes del usuario
- Administración de órdenes
- Cambio de estado de órdenes desde admin

### Administración

- Protección por rol para páginas admin
- Dashboard con métricas básicas
- Listado admin de productos con filtros backend-driven
- Búsqueda por nombre, SKU, slug, categoría y descripción corta
- Filtro por categoría, estado, stock y destacados
- Ordenamiento por nombre, precio y stock
- Paginación backend
- Estadísticas del resultado filtrado:
  - total encontrados
  - activos totales
  - stock bajo total
  - sin stock total
- Indicadores de página actual para ayudar a navegar listados largos

## Endpoints destacados

### Categorías

- `GET /api/categories`
- `GET /api/categories/{id}`
- `GET /api/categories/slug/{slug}`
- `POST /api/categories`

### Productos

- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/products/slug/{slug}`
- `GET /api/products/category/{categoryId}`
- `POST /api/products`
- `PUT /api/products/{id}`

El listado de productos soporta query params como:

- `search`
- `categoryId`
- `status`
- `stock`
- `featured`
- `page`
- `size`
- `sortField`
- `sortDirection`

Ejemplo:

```http
GET /api/products?search=martillo&categoryId=3&status=ACTIVE&stock=LOW_STOCK&page=0&size=10&sortField=NAME&sortDirection=ASC
```

## Variables de entorno

### Frontend

El frontend usa al menos:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Cómo levantar el proyecto

## 1. Backend

Desde la carpeta del backend:

```bash
./mvnw spring-boot:run
```

Si todo está bien, podés probar:

```bash
http://localhost:8080/api/health
```

## 2. Frontend

Desde la carpeta del frontend:

```bash
npm install
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

## Datos de prueba

Para probar el admin de productos con paginación y filtros, se puede poblar la tabla `product` con datos de ejemplo de ferretería. Durante el desarrollo se usaron categorías como:

- Electronics
- Pintura
- Herramientas
- Maderas
- Caños
- Tornillos
- Clavos

## Objetivo del proyecto

Este proyecto no está pensado solo como práctica aislada. La idea es que sirva como base para:

- usarlo en un negocio real
- seguir agregando módulos de e-commerce
- profesionalizar despliegue, pagos e integración con servicios externos
- mostrarlo como proyecto de portfolio full stack

## Próximos pasos sugeridos

- Persistir filtros y paginación del admin en la URL
- Mejorar dashboard admin
- CRUD admin de categorías más completo
- Integración de almacenamiento de imágenes en la nube
- Checkout más robusto
- Integración de pagos
- Gestión de envíos
- Mejoras de SEO y performance en frontend

## Notas

- El proyecto fue evolucionando por etapas, priorizando primero la funcionalidad y después refactors de escalabilidad.
- En el listado admin de productos, la búsqueda, filtros, ordenamiento y paginación ya fueron movidos al backend para soportar catálogos grandes.
- El filtro de categoría del admin ya trabaja con `categoryId`, que es más estable que filtrar por nombre.

## Autor

**Gabriel Survila**

GitHub: SurvilaDeveloper
