'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, SalesByCategoryItem } from '@/lib/services/reportsService';
import { ArrowLeft, Tag, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function SalesByCategoryReport() {
  const [data, setData] = useState<SalesByCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: ReportPeriod.THIS_MONTH,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await reportsService.getSalesByCategory(filters);
      setData(result);
    } catch (error) {
      console.error('Error loading sales by category:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async (format: 'pdf' | 'excel', exportStartDate?: string, exportEndDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const params = new URLSearchParams({ format, reportType: 'sales-by-category' });

      // Usar las fechas del export dialog si existen, sino usar las del filtro
      if (exportStartDate && exportEndDate) {
        params.append('startDate', exportStartDate);
        params.append('endDate', exportEndDate);
      } else if (filters.startDate && filters.endDate) {
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }

      // Agregar periodo si existe
      if (filters.period && !exportStartDate) {
        params.append('period', filters.period);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generar nombre descriptivo con periodo
      const periodText = filters.period || 'personalizado';
      a.download = `ventas-por-categoria-${periodText}-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar datos');
    }
  };

  const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.totalRevenue as any), 0);
  const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: parseFloat(item.totalRevenue as any),
    percentage: parseFloat(item.percentage as any),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm">Volver</span>
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Ventas por Categoría</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Distribución de ventas por categoría de productos
            </p>
          </div>
          <div className="flex-shrink-0">
            <ExportButton screenCode="REPORTS" onExport={handleExport} requiresDateRange={false} />
          </div>
        </div>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onApply={loadData}
        showLimitFilter={false}
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De {data.length} categorías
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unidades Vendidas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de unidades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Distribución de Ventas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Porcentaje de ingresos por categoría</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos para el período seleccionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(parseFloat(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Detalle por Categoría</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Métricas de ventas por categoría
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos para el período seleccionado
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {data.map((item, index) => (
                    <div key={item.categoryId} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-sm truncate">{item.categoryName}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {parseFloat(item.percentage as any).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Unidades:</span>
                          <span className="font-medium ml-1">{item.totalSales}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(parseFloat(item.totalRevenue as any))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Unidades</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={item.categoryId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{item.categoryName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.totalSales}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(parseFloat(item.totalRevenue as any))}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              {parseFloat(item.percentage as any).toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
