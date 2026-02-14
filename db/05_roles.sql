-- 1. Limpieza de seguridad
DROP ROLE IF EXISTS app_reporter;

-- 2. Creación del rol con permisos de inicio de sesión
-- Se utiliza la contraseña definida en el archivo .env para consistencia
CREATE ROLE app_reporter WITH LOGIN PASSWORD '412785fg';

-- 3. Permisos de conexión a la base de datos y uso del esquema
GRANT CONNECT ON DATABASE actividad_db TO app_reporter;
GRANT USAGE ON SCHEMA public TO app_reporter;

-- 4. RESTRICCIÓN ESTRICTA (Rúbrica): SELECT SOLO sobre las VIEWS
-- No se otorga GRANT SELECT sobre las tablas (usuarios, productos, etc.)
GRANT SELECT ON public.v_sales_by_category TO app_reporter;
GRANT SELECT ON public.v_high_value_customers TO app_reporter;
GRANT SELECT ON public.v_inventory_status TO app_reporter;
GRANT SELECT ON public.v_sales_trends TO app_reporter;
GRANT SELECT ON public.v_top_products_per_category TO app_reporter;

