-- ============================================
-- ROLES.SQL - Seguridad
-- ============================================

-- 1. Crear un rol de aplicación (si no existe)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_reporter') THEN

      CREATE ROLE app_reporter WITH LOGIN PASSWORD '412785fg';
   END IF;
END
$do$;

-- 2. Conceder conexión a la base de datos
GRANT CONNECT ON DATABASE actividad_db TO app_reporter;

-- 3. Conceder uso del esquema public
GRANT USAGE ON SCHEMA public TO app_reporter;

-- 4. CRÍTICO: Conceder SELECT SOLO a las vistas (no a las tablas)
-- Primero revocamos todo por seguridad
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_reporter;

-- Damos permiso especifico a las vistas creadas
GRANT SELECT ON v_sales_by_category TO app_reporter;
GRANT SELECT ON v_high_value_customers TO app_reporter;
GRANT SELECT ON v_product_inventory_status TO app_reporter;
GRANT SELECT ON v_monthly_sales_trends TO app_reporter;
GRANT SELECT ON v_top_products_per_category TO app_reporter;

-- Nota: Si creas más vistas, debes ejecutar GRANT para ellas manualmente.