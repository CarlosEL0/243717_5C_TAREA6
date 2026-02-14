import { query } from './db';

/**
 * REPORTE 1: Ventas por Categoría
 * Req: Agregación, Group By, Coalesce, Having
 */
export async function getSalesByCategory() {
  const sql = 'SELECT * FROM v_sales_by_category ORDER BY total_revenue DESC';
  const res = await query(sql, []);
  return res.rows;
}

/**
 * REPORTE 2: Clientes VIP
 * Req: Having, Agregación
 */
export async function getHighValueCustomers() {
  const sql = 'SELECT * FROM v_high_value_customers ORDER BY total_spent DESC';
  const res = await query(sql, []);
  return res.rows;
}

/**
 * REPORTE 3: Estatus de Inventario
 * Req: CASE, Join
 */
export async function getInventoryStatus() {
  const sql = 'SELECT * FROM v_inventory_status ORDER BY stock_quantity ASC';
  const res = await query(sql, []);
  return res.rows;
}

/**
 * REPORTE 4: Tendencias de Ventas
 * Req: CTE, Window Function
 */
export async function getSalesTrends() {
  // Nota: Usamos sales_month para coincidir con tu frontend
  const sql = 'SELECT * FROM v_sales_trends ORDER BY sales_month DESC';
  const res = await query(sql, []);
  return res.rows;
}

/**
 * REPORTE 5: Ranking de Productos por Categoría
 * Req: Window Function (RANK)
 */
export async function getTopProducts() {
  const sql = 'SELECT * FROM v_top_products_per_category';
  const res = await query(sql, []);
  return res.rows;
}