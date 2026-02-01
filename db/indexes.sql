-- ============================================
-- INDEXES.SQL - Optimización
-- ============================================

-- Índice compuesto para acelerar reportes de ventas por fecha y status
-- (Usado en v_monthly_sales_trends y filtros de dashboard)
CREATE INDEX IF NOT EXISTS idx_ordenes_created_status 
ON ordenes(created_at, status);

-- Índice para mejorar el JOIN entre productos y detalles de órdenes
-- (Usado en v_sales_by_category)
CREATE INDEX IF NOT EXISTS idx_orden_detalles_producto_id 
ON orden_detalles(producto_id);

-- Índice parcial para búsqueda rápida de usuarios activos
CREATE INDEX IF NOT EXISTS idx_usuarios_activos 
ON usuarios(email) 
WHERE activo = true;