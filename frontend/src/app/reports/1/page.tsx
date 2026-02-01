import Link from 'next/link';
import { query } from '@/app/lib/db'; 
import { ArrowLeft, DollarSign } from 'lucide-react';

// Definimos el tipo de dato que esperamos de la Vista SQL
interface CategorySale {
  category_name: string;
  product_count: number;
  total_units_sold: number;
  total_revenue: string; // Postgres devuelve DECIMAL como string
  avg_product_price: string;
}

export default async function Report1Page() {
  // 1. Fetching de Datos (Server-Side)
  // Consultamos directamente la vista creada en SQL
  const result = await query('SELECT * FROM v_sales_by_category ORDER BY total_revenue DESC');
  const rows = result.rows as CategorySale[];

  // 2. Cálculo de KPI (Dato Destacado)
  // Sumamos el total de todas las categorías para mostrar un "Gran Total"
  const grandTotal = rows.reduce((acc, row) => acc + parseFloat(row.total_revenue), 0);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Botón Volver */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        {/* Encabezado del Reporte */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reporte 1: Ventas por Categoría</h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado de ingresos y movimiento de inventario agrupado por familias de productos.
          </p>
        </header>

        {/* KPI Cards (Datos Destacados) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-600 mt-1">+100% vs mes anterior (Simulado)</p>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-center">Productos Únicos</th>
                  <th className="px-6 py-4 text-center">Unidades Vendidas</th>
                  <th className="px-6 py-4 text-right">Precio Promedio</th>
                  <th className="px-6 py-4 text-right">Ingresos Generados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.category_name}</td>
                    <td className="px-6 py-4 text-center">{row.product_count}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.total_units_sold}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">${parseFloat(row.avg_product_price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${parseFloat(row.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}