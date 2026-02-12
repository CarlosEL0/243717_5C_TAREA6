import Link from 'next/link';
import { query } from '@/app/lib/db';
import { ArrowLeft, Users, Star } from 'lucide-react';

// Tipo de dato para este reporte
interface VipCustomer {
  user_id: number;
  customer_name: string;
  email: string;
  completed_orders: number;
  total_spent: string; // Postgres devuelve DECIMAL como string
}

export default async function Report2Page() {
  // Consultamos la vista que usa HAVING SUM(total) > 500
  const result = await query('SELECT * FROM v_high_value_customers ORDER BY total_spent DESC');
  const rows = result.rows as VipCustomer[];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <header className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes VIP</h1>
            <p className="text-gray-600">
              Usuarios de alto valor con compras acumuladas superiores a <strong>$500.00</strong>
            </p>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Órdenes</th>
                <th className="px-6 py-4 text-right">Total Histórico</th>
                <th className="px-6 py-4 text-center">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                    No se encontraron clientes VIP con los datos actuales.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.customer_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{row.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-md font-mono text-xs">
                        {row.completed_orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${parseFloat(row.total_spent).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                        VIP
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}