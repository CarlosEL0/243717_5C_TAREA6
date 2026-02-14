import Link from 'next/link';
import { getTopProducts } from '@/app/lib/reports';
import { ArrowLeft, Award, Trophy, Medal } from 'lucide-react';

interface RankedProduct {
  category_name: string;
  rank_in_category: number;
  product_name: string;
  price: string;
}

export default async function Report5Page() {
  // 2. Fetching seguro (Server-Side) mediante la capa de servicios
  const rows = await getTopProducts() as RankedProduct[];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-pink-600" />
            Ranking de Productos
          </h1>
          <p className="text-gray-600 mt-2">
            Top 3 productos más costosos por categoría.
          </p>
        </header>

        {/* Tabla de Resultados con Medallas Visuales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-center">Ranking</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Celda de Categoría destacada */}
                  <td className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">
                    {row.category_name}
                  </td>
                  
                  {/* Lógica visual de medallas (se mantiene intacta) */}
                  <td className="px-6 py-4 text-center">
                    {row.rank_in_category === 1 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-bold">
                        <Trophy className="w-3 h-3 mr-1" /> #1 Oro
                      </span>
                    )}
                    {row.rank_in_category === 2 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold">
                        <Medal className="w-3 h-3 mr-1" /> #2 Plata
                      </span>
                    )}
                    {row.rank_in_category === 3 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold">
                        <Medal className="w-3 h-3 mr-1" /> #3 Bronce
                      </span>
                    )}
                    {row.rank_in_category > 3 && (
                      <span className="text-gray-400 font-mono">#{row.rank_in_category}</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">
                    {row.product_name}
                  </td>
                  <td className="px-6 py-4 text-right font-mono">
                    ${parseFloat(row.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}