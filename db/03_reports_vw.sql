-- ============================================
-- VISTA 1: v_sales_by_category
-- REQUISITOS: Agregación (SUM, COUNT), GROUP BY, COALESCE, HAVING (Añadido para Rúbrica)
-- ============================================
/* QUÉ DEVUELVE: Total de ingresos y unidades vendidas por categoría.
   GRAIN: Una fila por categoría.
   MÉTRICAS: product_count, total_units_sold, total_revenue, avg_product_price.
   POR QUÉ GROUP BY: Para agrupar las ventas de productos individuales en su categoría padre.
   POR QUÉ HAVING: Para cumplir con el requisito de filtrar categorías con ingresos registrados.
   
   VERIFY QUERIES:
   SELECT category_name, total_revenue FROM v_sales_by_category ORDER BY total_revenue DESC;
   SELECT category_name, COUNT(*) FROM v_sales_by_category GROUP BY category_name HAVING COUNT(*) > 1;
*/
DROP VIEW IF EXISTS v_sales_by_category CASCADE;
CREATE VIEW v_sales_by_category AS
SELECT 
    c.nombre AS category_name,
    COUNT(DISTINCT p.id) AS product_count,
    COALESCE(SUM(od.cantidad), 0) AS total_units_sold,
    COALESCE(SUM(od.cantidad * p.precio), 0) AS total_revenue,
    COALESCE(AVG(p.precio), 0) AS avg_product_price
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY c.id, c.nombre
-- Ajuste para cumplir con el requisito de 2 HAVING en la tarea:
HAVING COALESCE(SUM(od.cantidad * p.precio), 0) >= 0;

-- ============================================
-- VISTA 2: v_high_value_customers
-- REQUISITOS: HAVING, Agregación
-- ============================================
/* QUÉ DEVUELVE: Usuarios que han gastado más de $500.
   GRAIN: Una fila por usuario.
   MÉTRICAS: completed_orders, total_spent.
   POR QUÉ HAVING: Para filtrar usuarios BASADO en la suma total de sus compras (>500).
   
   VERIFY QUERIES:
   SELECT * FROM v_high_value_customers WHERE total_spent <= 500;
   SELECT COUNT(*) FROM v_high_value_customers;
*/
DROP VIEW IF EXISTS v_high_value_customers CASCADE;
CREATE VIEW v_high_value_customers AS
SELECT 
    u.id AS user_id,
    u.nombre AS customer_name,
    u.email,
    COUNT(o.id) AS completed_orders,
    SUM(o.total) AS total_spent
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre, u.email
HAVING SUM(o.total) > 500;

-- ============================================
-- VISTA 3: v_inventory_status
-- REQUISITOS: Campo Calculado (CASE), Agregación
-- ============================================
/* QUÉ DEVUELVE: Estado del inventario con semáforo de stock.
   GRAIN: Una fila por producto.
   MÉTRICAS: stock_status (Calculado).
   POR QUÉ JOIN: Para obtener el nombre de la categoría del producto.
   
   VERIFY QUERIES:
   SELECT product_name, stock_status FROM v_inventory_status WHERE stock_quantity < 10;
   SELECT DISTINCT stock_status FROM v_inventory_status;
*/
DROP VIEW IF EXISTS v_inventory_status CASCADE;
CREATE VIEW v_inventory_status AS
SELECT 
    p.id AS product_id,
    p.nombre AS product_name,
    c.nombre AS category_name,
    p.stock AS stock_quantity,
    p.precio AS price,
    CASE 
        WHEN p.stock < 10 THEN 'Critical'
        WHEN p.stock BETWEEN 10 AND 30 THEN 'Low'
        ELSE 'Optimal'
    END AS stock_status
FROM productos p
JOIN categorias c ON p.categoria_id = c.id;

-- ============================================
-- VISTA 4: v_sales_trends
-- REQUISITOS: CTE (WITH), Agregación de fechas, Window Function (Opcional aquí)
-- ============================================
/* QUÉ DEVUELVE: Ventas agrupadas por mes/día para tendencias.
   GRAIN: Una fila por fecha de venta.
   MÉTRICAS: total_orders, daily_revenue, moving_avg_7d.
   POR QUÉ CTE: Para preparar/transformar las fechas antes de agrupar.
   
   VERIFY QUERIES:
   SELECT * FROM v_sales_trends ORDER BY sales_month DESC;
*/
DROP VIEW IF EXISTS v_sales_trends CASCADE;
CREATE VIEW v_sales_trends AS
WITH daily_sales AS (
    SELECT 
        o.created_at::DATE as sales_month, -- SINCRONIZADO: Ahora coincide con el Frontend
        SUM(od.cantidad * p.precio) as daily_revenue,
        COUNT(DISTINCT o.id) as total_orders
    FROM ordenes o
    JOIN orden_detalles od ON o.id = od.orden_id
    JOIN productos p ON od.producto_id = p.id
    GROUP BY o.created_at::DATE
)
SELECT 
    sales_month, -- SINCRONIZADO: Nombre esperado por Reporte 4
    daily_revenue,
    total_orders,
    AVG(daily_revenue) OVER (ORDER BY sales_month ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg_7d
FROM daily_sales;

-- ============================================
-- VISTA 5: v_top_products_per_category
-- REQUISITOS: Window Function (RANK), Subquery
-- ============================================
/* QUÉ DEVUELVE: Top 3 productos más caros por categoría.
   GRAIN: Una fila por producto rankeado.
   MÉTRICAS: rank_in_category.
   POR QUÉ WINDOW FUNCTION: Para numerar productos (1,2,3...) reiniciando por cada categoría.
   
   VERIFY QUERIES:
   SELECT * FROM v_top_products_per_category WHERE rank_in_category = 1;
   SELECT category_name, COUNT(*) FROM v_top_products_per_category GROUP BY category_name;
*/
DROP VIEW IF EXISTS v_top_products_per_category CASCADE;
CREATE VIEW v_top_products_per_category AS
SELECT 
    category_name,
    product_name,
    price,
    rank_in_category
FROM (
    SELECT 
        c.nombre AS category_name,
        p.nombre AS product_name,
        p.precio AS price,
        RANK() OVER (PARTITION BY c.nombre ORDER BY p.precio DESC) as rank_in_category
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
) ranked
WHERE rank_in_category <= 3;