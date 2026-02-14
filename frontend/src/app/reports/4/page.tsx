import Link from 'next/link';
import { getSalesTrends } from '@/app/lib/reports';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';

interface MonthlyTrend {
  sales_month: string; 
  total_orders: number;
  monthly_revenue: string;
}

export default async function Report4Page() {
  // 2. Fetching de datos mediante la capa de servicio
  const rows = await getSalesTrends() as MonthlyTrend[];

  // 3. Lógica para el "Gráfico de Barras CSS"
  // Encontramos el mes con mayores ventas para usarlo como el 100% de la barra
  const maxRevenue = rows.length > 0 
    ? Math.max(...rows.map(r => parseFloat(r.monthly_revenue)))
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            Tendencias Mensuales
          </h1>
          <p className="text-gray-600 mt-2">
            Histórico de desempeño agrupado por mes (Cálculo mediante CTE).
          </p>
        </header>

        {/* Tabla de Resultados con Gráfico CSS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Mes</th>
                <th className="px-6 py-4 text-center">Órdenes</th>
                <th className="px-6 py-4 text-right">Ingresos</th>
                <th className="px-6 py-4 w-1/3">Gráfico de Ventas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, index) => {
                const revenue = parseFloat(row.monthly_revenue);
                // Calculamos el porcentaje de la barra (Regla de 3)
                const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                
                // Formateamos la fecha para legibilidad
                const dateObj = new Date(row.sales_month);
                const dateStr = dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {dateStr}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-orange-100 text-orange-800 py-1 px-2 rounded font-mono text-xs">
                        {row.total_orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {/* Barra Visual Proporcional */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">{percentage.toFixed(0)}% del máximo</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}