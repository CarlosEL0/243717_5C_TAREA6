-- ============================================
-- REPORTS_VW.SQL - Vistas para Reportes
-- ============================================

-- ============================================
-- VISTA 1: Resumen de Ventas por Categoría
-- REQUISITOS: Agregación (SUM, COUNT), GROUP BY, COALESCE
-- ============================================
/* Qué devuelve: Total de ingresos y unidades vendidas por categoría.
   Grain: Una fila por categoría de producto.
   Métricas: Total de ingresos (SUM), Unidades vendidas (SUM), Promedio de precio (AVG).
   Por qué GROUP BY: Necesario para colapsar los productos en sus categorías padre.
   
   VERIFY QUERIES:
   1. Verificar que no haya categorías duplicadas:
      SELECT category_name, COUNT(*) FROM v_sales_by_category GROUP BY category_name HAVING COUNT(*) > 1;
   2. Ordenar por la categoría con más ingresos:
      SELECT * FROM v_sales_by_category ORDER BY total_revenue DESC;
*/
CREATE OR REPLACE VIEW v_sales_by_category AS
SELECT 
    c.nombre AS category_name,
    COUNT(DISTINCT p.id) AS product_count,
    COALESCE(SUM(od.cantidad), 0) AS total_units_sold,
    COALESCE(SUM(od.subtotal), 0) AS total_revenue,
    ROUND(AVG(p.precio), 2) AS avg_product_price
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
LEFT JOIN orden_detalles od ON p.id = od.producto_id
LEFT JOIN ordenes o ON od.orden_id = o.id
WHERE o.status = 'pagado' OR o.status = 'entregado' -- Solo ventas reales
GROUP BY c.id, c.nombre;

-- ============================================
-- VISTA 2: Clientes VIP (Alto Valor)
-- REQUISITOS: HAVING, Agregación
-- ============================================
/* Qué devuelve: Usuarios que han gastado más de $500.
   Grain: Una fila por usuario.
   Métricas: Gasto total (SUM), Cantidad de órdenes (COUNT).
   Por qué HAVING: Para filtrar grupos (usuarios) basado en el resultado de una agregación (suma de compras).
   
   VERIFY QUERIES:
   1. Validar que SOLO aparezcan clientes con más de $500:
      SELECT * FROM v_high_value_customers WHERE total_spent <= 500; -- Debería retornar 0 filas
   2. Comparar con un conteo manual rápido:
      SELECT COUNT(*) FROM v_high_value_customers;
*/
CREATE OR REPLACE VIEW v_high_value_customers AS
SELECT 
    u.id AS user_id,
    u.nombre AS customer_name,
    u.email,
    COUNT(o.id) AS completed_orders,
    SUM(o.total) AS total_spent
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
WHERE o.status IN ('pagado', 'entregado', 'enviado')
GROUP BY u.id, u.nombre, u.email
HAVING SUM(o.total) > 500;

-- ============================================
-- VISTA 3: Rendimiento de Inventario y Precios
-- REQUISITOS: Campo Calculado (CASE), Agregación
-- ============================================
/* Qué devuelve: Listado de productos con análisis de stock y etiquetas de precio.
   Grain: Una fila por producto.
   Métricas: Estado de stock (CASE), Ingreso potencial (Calculado).
   Por qué GROUP BY: No aplica (listado directo con cálculos), pero usamos JOINs.
   
   VERIFY QUERIES:
   1. Revisar la lógica del CASE de precios:
      SELECT product_name, precio, price_segment FROM v_product_inventory_status WHERE precio > 500;
   2. Encontrar productos agotados o críticos:
      SELECT * FROM v_product_inventory_status WHERE stock_status IN ('Agotado', 'Crítico');
*/
CREATE OR REPLACE VIEW v_product_inventory_status AS
SELECT 
    p.nombre AS product_name,
    c.nombre AS category,
    p.precio,
    p.stock,
    -- Campo calculado: Etiqueta de precio
    CASE 
        WHEN p.precio > 500 THEN 'Premium'
        WHEN p.precio BETWEEN 100 AND 500 THEN 'Estándar'
        ELSE 'Económico'
    END AS price_segment,
    -- Campo calculado: Estado de stock
    CASE 
        WHEN p.stock = 0 THEN 'Agotado'
        WHEN p.stock < 10 THEN 'Crítico'
        ELSE 'Saludable'
    END AS stock_status,
    -- Campo calculado: Valor del inventario
    (p.precio * p.stock) AS potential_inventory_value
FROM productos p
JOIN categorias c ON p.categoria_id = c.id;

-- ============================================
-- VISTA 4: Tendencias Mensuales de Ventas
-- REQUISITOS: CTE (WITH), Agregación de fechas
-- ============================================
/* Qué devuelve: Ingresos agrupados por mes y año.
   Grain: Una fila por mes.
   Métricas: Ingresos mensuales.
   Por qué CTE: Para preparar los datos de fechas antes de agrupar.
   
   VERIFY QUERIES:
   1. Verificar el formato de fecha (YYYY-MM):
      SELECT sale_month FROM v_monthly_sales_trends LIMIT 1;
   2. Asegurar que los meses más recientes salen primero:
      SELECT * FROM v_monthly_sales_trends ORDER BY sale_month DESC;
*/
CREATE OR REPLACE VIEW v_monthly_sales_trends AS
WITH monthly_data AS (
    SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS sale_month,
        total
    FROM ordenes
    WHERE status IN ('pagado', 'entregado', 'enviado')
)
SELECT 
    sale_month,
    COUNT(*) AS total_transactions,
    SUM(total) AS total_revenue
FROM monthly_data
GROUP BY sale_month
ORDER BY sale_month DESC;

-- ============================================
-- VISTA 5: Ranking de Productos por Categoría
-- REQUISITOS: Window Function (RANK/ROW_NUMBER), CTE
-- ============================================
/* Qué devuelve: Ranking de los productos más caros dentro de cada categoría.
   Grain: Una fila por producto.
   Métricas: Ranking (Window Function).
   Por qué Window Function: Para asignar una posición (1, 2, 3...) reiniciando el conteo en cada categoría.
   
   VERIFY QUERIES:
   1. Ver el Top 1 (más caro) de cada categoría:
      SELECT * FROM v_top_products_per_category WHERE price_rank = 1;
   2. Ver el ranking completo de la categoría 'Electrónica':
      SELECT * FROM v_top_products_per_category WHERE category_name = 'Electrónica' ORDER BY price_rank;
*/
CREATE OR REPLACE VIEW v_top_products_per_category AS
SELECT 
    p.nombre AS product_name,
    c.nombre AS category_name,
    p.precio,
    -- Window Function: Ranking por precio descendente particionado por categoría
    RANK() OVER (PARTITION BY c.nombre ORDER BY p.precio DESC) as price_rank
FROM productos p
JOIN categorias c ON p.categoria_id = c.id;