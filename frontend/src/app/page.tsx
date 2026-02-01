import Link from 'next/link';
import { ShoppingCart, Users, Package, TrendingUp, Award } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
             Dashboard de Reportes SQL
          </h1>
          <p className="text-gray-600">
            Tarea 6: Visualización de datos con Next.js + Postgres + Docker
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Reporte 1 */}
          <ReportCard 
            href="/reports/1"
            title="Ventas por Categoría"
            description="Ingresos totales y unidades vendidas agrupadas por categoría."
            icon={<ShoppingCart className="w-8 h-8 text-blue-600" />}
          />

          {/* Card Reporte 2 */}
          <ReportCard 
            href="/reports/2"
            title="Clientes VIP"
            description="Usuarios de alto valor con compras superiores a $500."
            icon={<Users className="w-8 h-8 text-purple-600" />}
          />

          {/* Card Reporte 3 */}
          <ReportCard 
            href="/reports/3"
            title="Estado de Inventario"
            description="Análisis de stock y clasificación de precios."
            icon={<Package className="w-8 h-8 text-emerald-600" />}
          />

          {/* Card Reporte 4 */}
          <ReportCard 
            href="/reports/4"
            title="Tendencias Mensuales"
            description="Histórico de ventas agrupado por mes (CTE)."
            icon={<TrendingUp className="w-8 h-8 text-orange-600" />}
          />

          {/* Card Reporte 5 */}
          <ReportCard 
            href="/reports/5"
            title="Ranking Productos"
            description="Top productos más caros por categoría (Window Functions)."
            icon={<Award className="w-8 h-8 text-pink-600" />}
          />
        </div>
      </div>
    </main>
  );
}

// Componente pequeño para las tarjetas (para no repetir código)
function ReportCard({ href, title, description, icon }: { href: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-blue-300 h-full">
        <div className="mb-4 bg-gray-50 p-3 rounded-lg w-fit group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600">
          {title}
        </h2>
        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>
    </Link>
  );
}