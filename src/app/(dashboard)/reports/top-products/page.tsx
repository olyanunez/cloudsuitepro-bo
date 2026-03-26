'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, TopProductItem } from '@/lib/services/reportsService';
import { ArrowLeft, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

export default function TopProductsReport() {
  const [data, setData] = useState<TopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: ReportPeriod.THIS_MONTH,
    limit: 20,
    sortBy: 'totalRevenue',
    sortOrder: 'desc',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await reportsService.getTopProducts(filters);
      setData(result);
    } catch (error) {
      console.error('Error loading top products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.totalRevenue as any), 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.quantitySold, 0);

  const handleExport = async (format: 'pdf' | 'excel', exportStartDate?: string, exportEndDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const params = new URLSearchParams({ format, reportType: 'top-products' });

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

      // Agregar límite
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
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

      // Generar nombre descriptivo con periodo y límite
      const periodText = filters.period || 'personalizado';
      const limitText = filters.limit || 'todos';
      a.download = `top-products-${periodText}-limit${limitText}-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Productos Más Vendidos</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Top de productos por cantidad y valor de ventas
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
        showLimitFilter={true}
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
              De los {data.length} productos principales
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unidades Vendidas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de unidades
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Detalle de Productos</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Lista de productos ordenados por desempeño de ventas
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
                  <div key={item.productId} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant={index < 3 ? 'default' : 'secondary'} className="flex-shrink-0">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-sm truncate">{item.productName}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                      <div>SKU: {item.sku}</div>
                      <div><Badge variant="outline" className="text-xs">{item.categoryName}</Badge></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Cant:</span>
                        <span className="font-medium ml-1">{item.quantitySold}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prom:</span>
                        <span className="font-medium ml-1">{formatCurrency(parseFloat(item.averagePrice as any))}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">{formatCurrency(parseFloat(item.totalRevenue as any))}</span>
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
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Prom.</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.categoryName}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.quantitySold}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(item.averagePrice as any))}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(parseFloat(item.totalRevenue as any))}
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
  );
}
