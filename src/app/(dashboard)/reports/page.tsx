'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Tag, Users, Calendar, GitCompare } from 'lucide-react';
import Link from 'next/link';

const reports = [
  {
    title: 'Productos Más Vendidos',
    description: 'Top de productos por cantidad y valor de ventas',
    icon: BarChart3,
    href: '/reports/top-products',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Márgenes de Productos',
    description: 'Análisis de rentabilidad y márgenes de ganancia',
    icon: TrendingUp,
    href: '/reports/product-margins',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Ventas por Categoría',
    description: 'Distribución de ventas por categoría de productos',
    icon: Tag,
    href: '/reports/sales-by-category',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Ventas por Cajero',
    description: 'Desempeño y métricas de cada cajero',
    icon: Users,
    href: '/reports/sales-by-cashier',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Tendencia de Ventas',
    description: 'Evolución diaria de ventas en el período',
    icon: Calendar,
    href: '/reports/sales-trend',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    title: 'Comparación de Períodos',
    description: 'Comparar período actual vs período anterior',
    icon: GitCompare,
    href: '/reports/period-comparison',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-2">
          Análisis detallados de ventas, productos y desempeño
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{report.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
