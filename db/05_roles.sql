-- db/05_roles.sql

-- 1. Crear el rol de "Reportero" si no existe
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

-- 2. Asegurar permisos de conexión
GRANT CONNECT ON DATABASE actividad_db TO app_reporter;
GRANT USAGE ON SCHEMA public TO app_reporter;

-- 3. LA CLAVE: Dar permiso de lectura a TODAS las tablas y vistas actuales
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_reporter;

-- 4. (Opcional) Asegurar permiso para futuras tablas/vistas que se creen
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_reporter;