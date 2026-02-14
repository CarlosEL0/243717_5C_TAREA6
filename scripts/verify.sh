#!/bin/bash

# =================================================================
# SCRIPT DE VERIFICACIÓN AUTOMATIZADA - TAREA 6
# Instrucciones para el Evaluador:
# 1. Asegúrese de que los contenedores estén corriendo (docker compose up -d).
# 2. Otorgue permisos de ejecución: chmod +x scripts/verify.sh
# 3. Ejecute: ./scripts/verify.sh
# =================================================================

echo "===================================================="
echo "🔍 INICIANDO AUDITORÍA TÉCNICA DE LA BASE DE DATOS"
echo "===================================================="

# 1. Verificación de Vistas Existentes
echo -e "\n[1/3] LISTADO DE VISTAS (Requisito: 5 Vistas)" 
docker exec -it postgres_container psql -U postgres -d actividad_db -c "\dv"

# 2. Ejecución de Queries de Prueba (Validación de Lógica SQL)
echo -e "\n[2/3] PRUEBAS DE INTEGRIDAD DE LOS REPORTES:" 

echo -e "\n---> REPORTE 1: Ventas por Categoría (Agregación + COALESCE)" 
docker exec -it postgres_container psql -U postgres -d actividad_db -c "SELECT * FROM v_sales_by_category LIMIT 2;"

echo -e "\n---> REPORTE 2: Clientes VIP (HAVING > 500)" 
docker exec -it postgres_container psql -U postgres -d actividad_db -c "SELECT * FROM v_high_value_customers LIMIT 2;"

echo -e "\n---> REPORTE 3: Estatus de Inventario (CASE + Semáforo)" 
docker exec -it postgres_container psql -U postgres -d actividad_db -c "SELECT * FROM v_inventory_status LIMIT 2;"

echo -e "\n---> REPORTE 4: Tendencias de Ventas (CTE + Window Function)" 
docker exec -it postgres_container psql -U postgres -d actividad_db -c "SELECT * FROM v_sales_trends LIMIT 2;"

echo -e "\n---> REPORTE 5: Ranking de Productos (RANK OVER PARTITION)" 
docker exec -it postgres_container psql -U postgres -d actividad_db -c "SELECT * FROM v_top_products_per_category LIMIT 2;"

# 3. Verificación de Seguridad y Roles
echo -e "\n[3/3] VALIDACIÓN DE ROLES Y PERMISOS MÍNIMOS" 
echo "Verificando existencia del rol 'app_reporter':"
docker exec -it postgres_container psql -U postgres -d actividad_db -c "\du app_reporter"

echo -e "\n===================================================="
echo "✅ AUDITORÍA FINALIZADA"
echo "===================================================="