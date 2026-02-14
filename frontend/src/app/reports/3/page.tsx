import Link from 'next/link';
import { getInventoryStatus } from '@/app/lib/reports';
import { ArrowLeft, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface InventoryItem {
  product_id: number;
  product_name: string;
  category_name: string;
  stock_quantity: number;
  price: string;
  stock_status: string; 
}

export default async function Report3Page() {
  // 2. Fetching de datos a través de la capa de servicio
  const rows = await getInventoryStatus() as InventoryItem[];

  // 3. Cálculo de KPI (Lógica de presentación)
  const totalInventoryValue = rows.reduce((acc, row) => acc + (row.stock_quantity * parseFloat(row.price)), 0);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-emerald-600" />
              Estado de Inventario
            </h1>
            <p className="text-gray-600 mt-2">
              Monitoreo de niveles de stock y valoración de productos.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Valor Total Inventario</p>
            <p className="text-2xl font-bold text-emerald-700">
              ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </header>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Precio Unitario</th>
                <th className="px-6 py-4 text-center">Stock Actual</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row) => (
                <tr key={row.product_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.product_name}</td>
                  <td className="px-6 py-4 text-gray-500">{row.category_name}</td>
                  <td className="px-6 py-4 text-right">${parseFloat(row.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold">{row.stock_quantity}</td>
                  <td className="px-6 py-4 text-center">
                    {/* Mantenemos la lógica visual de estados */}
                    {row.stock_quantity < 10 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Crítico
                      </span>
                    ) : row.stock_quantity < 30 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> Óptimo
                      </span>
                    )}
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