# Tarea 6: Lab Reportes - Next.js + PostgreSQL + Docker
---

## Descripción del Proyecto

Este proyecto es una aplicación de Inteligencia de Negocios (BI) construida con Next.js (App Router) y PostgreSQL, orquestada mediante Docker Compose. El sistema visualiza 5 reportes estratégicos consumiendo datos a través de Vistas SQL (Views) seguras, implementando conceptos avanzados de bases de datos como CTEs, Window Functions, Índices y Roles de seguridad.

---

## Cómo ejecutar el proyecto

El proyecto está contenerizado para una ejecución en un solo comando.

1. Clonar el repositorio / Descomprimir la carpeta.

2. Ejecutar Docker Compose:
```bash
   docker compose up --build -d
```

3. Acceder a la aplicación:  
   Abrir el navegador en [http://localhost:3000](http://localhost:3000)

> **Nota:** Al levantar el contenedor, PostgreSQL ejecutará automáticamente los scripts de `db/` para crear el esquema, poblar datos (seeds), generar las vistas, índices y configurar los roles de seguridad.

---

## Arquitectura de Base de Datos

El diseño cumple estrictamente con los requisitos de optimización y seguridad.

### 1. Vistas SQL (`db/03_reports_vw.sql`)

Se crearon 5 vistas para abstraer la lógica compleja y asegurar que el frontend solo realice consultas simples.

| Vista | Descripción y Justificación Técnica |
|-------|-------------------------------------|
| **v_sales_by_category** | **Reporte de Ventas por Categoría.** Usa `GROUP BY` y funciones agregadas (`SUM`, `COUNT`). Implementa `HAVING` para filtrar categorías con ingresos y `COALESCE` para manejar nulos. |
| **v_high_value_customers** | **Clientes VIP.** Identifica usuarios con alto valor de vida (LTV). Usa `HAVING SUM(...) > 500` para filtrar grupos tras la agregación. |
| **v_inventory_status** | **Semáforo de Inventario.** Utiliza lógica condicional `CASE` para clasificar el stock en estados (`'Critical'`, `'Low'`, `'Optimal'`) directamente en la base de datos. |
| **v_sales_trends** | **Tendencias Mensuales.** Implementa un CTE (`WITH`) para procesar fechas antes de la agrupación final, permitiendo un cálculo de media móvil más limpio. |
| **v_top_products_per_category** | **Ranking de Productos.** Utiliza Window Functions (`RANK() OVER`) para asignar posiciones de precio reiniciando el conteo por cada categoría. |

### 2. Índices y Optimización (`db/04_indexes.sql`)

Se implementaron índices estratégicos para optimizar el rendimiento de las vistas:

- **idx_productos_categoria_id:** Optimiza los JOINs entre productos y categorías.
- **idx_ordenes_usuario_id:** Acelera el cálculo de totales por cliente.
- **idx_ordenes_created_at:** Optimiza el ordenamiento y filtrado temporal.

### 3. Seguridad (`db/05_roles.sql`)

Se implementó el principio de **Mínimo Privilegio**:

- La aplicación no utiliza el usuario superusuario (`postgres`).
- Se configuró el rol **app_reporter** con permisos de `SELECT` únicamente sobre las vistas, bloqueando el acceso directo a las tablas base.

---

## Trade-offs (Decisiones de Diseño)

- **Lógica de Negocio en SQL:** Se decidió procesar el 100% de los cálculos analíticos (promedios, rankings y agregaciones) en la base de datos a través de vistas. Esto permite que la aplicación sea más rápida y que la lógica sea consistente incluso si se conectan otras herramientas a la BD.

- **Formateo en Frontend:** El formateo de moneda y los colores de los estados de inventario se manejan en Next.js. Esto mantiene la base de datos independiente de la capa visual y facilita cambios estéticos sin alterar el SQL.

---

## Performance Evidence (Evidencia de Rendimiento)

Se analizó la eficiencia de las vistas mediante el comando `EXPLAIN ANALYZE` para asegurar que el motor de búsqueda utilice correctamente los recursos.

### Evidencia 1: v_sales_trends
```
WindowAgg (cost=14.32..14.62 rows=5 width=76) (actual time=0.229..0.231 rows=1 loops=1)
  -> GroupAggregate (cost=14.32..14.54 rows=5 width=44) (actual time=0.184..0.185 rows=1 loops=1)
Planning Time: 3.299 ms
Execution Time: 0.474 ms
```

**Explicación:** La consulta se ejecuta en menos de 1ms. El uso de Hash Joins y la gestión eficiente de memoria (25kB) demuestran que el procesamiento de tendencias es óptimo a pesar de la complejidad del cálculo.

---

## Threat Model (Modelo de Amenazas)

- **Prevención de Inyección SQL:** Todas las consultas realizadas desde el servidor de Next.js utilizan consultas parametrizadas a través del objeto `pool.query`, eliminando la posibilidad de inyectar código malicioso mediante cadenas de texto.

- **Gestión de Credenciales:** Se utiliza un archivo `.env` para manejar las claves de acceso, el cual es inyectado por Docker Compose y nunca se expone en el código fuente ni en el lado del cliente.

- **Aislamiento de Permisos:** El rol `app_reporter` tiene denegado el acceso de escritura (`INSERT`/`UPDATE`/`DELETE`). En caso de una vulnerabilidad en el frontend, el atacante no podría modificar ni borrar información de la base de datos.

---

## Frontend (Next.js)

La aplicación utiliza Next.js 15+ con App Router y Server Components.

- **Seguridad:** El fetching de datos es seguro y ocurre del lado del servidor.
- **Visualización:** Dashboard interactivo con tablas de alta legibilidad y estados visuales basados en la lógica de las vistas.
- **DX:** Configuración de polling para asegurar el funcionamiento de Hot Reload en entornos Dockerizados.

---

## Stack Tecnológico

- **Frontend:** Next.js, Tailwind CSS.
- **Backend/DB:** PostgreSQL 16 Alpine.
- **Infraestructura:** Docker & Docker Compose.