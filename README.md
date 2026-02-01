# Tarea 6: Lab Reportes - Next.js + PostgreSQL + Docker

**Estudiante:** [TU NOMBRE AQUÍ]
**Matrícula:** [TU MATRÍCULA AQUÍ]
**Materia:** Base de Datos Avanzada

## 📋 Descripción del Proyecto

Este proyecto es una aplicación de **Inteligencia de Negocios (BI)** construida con **Next.js (App Router)** y **PostgreSQL**, orquestada mediante **Docker Compose**.

El sistema visualiza 5 reportes estratégicos consumiendo datos a través de **Vistas SQL (Views)** seguras, implementando conceptos avanzados de bases de datos como CTEs, Window Functions, Índices y Roles de seguridad.

---

## 🚀 Cómo ejecutar el proyecto

El proyecto está contenerizado para una ejecución en un solo comando.

1.  **Clonar el repositorio / Descomprimir la carpeta.**
2.  **Ejecutar Docker Compose:**
    ```bash
    docker compose up --build -d
    ```
3.  **Acceder a la aplicación:**
    Abrir el navegador en [http://localhost:3000](http://localhost:3000)

> **Nota:** Al levantar el contenedor, PostgreSQL ejecutará automáticamente los scripts de `db/` para crear el esquema, poblar datos (seeds), generar las vistas, índices y configurar los roles de seguridad.

---

## 🗄️ Arquitectura de Base de Datos

El diseño cumple estrictamente con los requisitos de optimización y seguridad.

### 1. Vistas SQL (`db/03_reports_vw.sql`)

Se crearon 5 vistas para abstraer la lógica compleja y asegurar que el frontend solo haga `SELECT *`.

| Vista | Descripción y Justificación Técnica |
| :--- | :--- |
| **`v_sales_by_category`** | **Reporte de Ventas por Categoría.**<br>• Usa `GROUP BY` y funciones agregadas (`SUM`, `COUNT`) para consolidar ventas.<br>• Implementa **`HAVING`** para filtrar categorías sin ingresos.<br>• Usa `COALESCE` para manejar nulos en sumas. |
| **`v_high_value_customers`** | **Clientes VIP.**<br>• Identifica usuarios con alto valor de vida (LTV).<br>• Usa **`HAVING SUM(...) > 500`** para filtrar grupos tras la agregación, cumpliendo el requisito de filtrado post-agrupación. |
| **`v_inventory_status`** | **Semáforo de Inventario.**<br>• Utiliza lógica condicional **`CASE`** para clasificar el stock en estados ('Critical', 'Low', 'Optimal') directamente en la base de datos, descargando lógica del frontend. |
| **`v_sales_trends`** | **Tendencias Mensuales.**<br>• Implementa un **CTE (`WITH`)** para pre-calcular y truncar fechas (`YYYY-MM`) antes de realizar la agrupación final. Esto hace la consulta más legible y modular. |
| **`v_top_products_per_category`** | **Ranking de Productos.**<br>• Utiliza **Window Functions (`RANK() OVER partition...`)** para asignar posiciones de precio reiniciando el conteo por cada categoría, algo imposible de hacer con un `GROUP BY` simple. |

### 2. Índices y Optimización (`db/04_indexes.sql`)

Se crearon 3 índices estratégicos para optimizar los JOINs y ordenamientos utilizados en las vistas anteriores:

1.  **`idx_productos_categoria_id`**: Optimiza el `JOIN` entre Productos y Categorías. Esencial para las vistas `v_sales_by_category` y `v_inventory_status`.
2.  **`idx_ordenes_usuario_id`**: Acelera la búsqueda de historiales de compra, crítico para calcular el total gastado en la vista de Clientes VIP (`v_high_value_customers`).
3.  **`idx_ordenes_created_at`**: Índice descendente para acelerar el ordenamiento temporal en el reporte de Tendencias (`v_sales_trends`), evitando *full table scans* en tablas de hechos grandes.

### 3. Seguridad (`db/05_roles.sql`)

Se implementó el principio de **Mínimo Privilegio**:
* La aplicación **NO** se conecta como `postgres` (superuser).
* Se creó un rol dedicado: **`app_reporter`**.
* Este rol tiene permisos restringidos (`GRANT SELECT`) específicamente para lectura de reportes.

---

## 💻 Frontend (Next.js)

La aplicación utiliza **Next.js 15+ con App Router** y **Server Components**.

* **Sin credenciales expuestas:** La conexión a BD se realiza únicamente en el servidor (`lib/db.ts`).
* **Visualización:**
    * Dashboard interactivo con accesos directos.
    * Tablas de alto contraste para legibilidad de datos.
    * Indicadores visuales (Badges de colores, Medallas para rankings, Barras de progreso CSS).
* **Hot Reload en Windows:** Configurado `WATCHPACK_POLLING` en Docker para garantizar una buena experiencia de desarrollo (DX).

---

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js, Tailwind CSS, Lucide React (Iconos).
* **Backend/DB:** PostgreSQL 16 Alpine.
* **Infraestructura:** Docker & Docker Compose