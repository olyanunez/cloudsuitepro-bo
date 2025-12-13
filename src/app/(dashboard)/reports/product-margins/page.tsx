'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, ProductMarginItem } from '@/lib/services/reportsService';
import { ArrowLeft, TrendingUp, DollarSign, Percent } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

export default function ProductMarginsReport() {
  const [data, setData] = useState<ProductMarginItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: ReportPeriod.THIS_MONTH,
    limit: 20,
    sortBy: 'profitMargin',
    sortOrder: 'desc',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await reportsService.getProductMargins(filters);
      setData(result);
    } catch (error) {
      console.error('Error loading product margins:', error);
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

      const params = new URLSearchParams({ format, reportType: 'product-margins' });

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
      a.download = `margenes-productos-${periodText}-limit${limitText}-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

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
  const totalProfit = data.reduce((sum, item) => sum + parseFloat(item.grossProfit as any), 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Márgenes de Productos</h1>
            <p className="text-muted-foreground mt-1">
              Análisis de rentabilidad y márgenes de ganancia por producto
            </p>
          </div>
        </div>
        <ExportButton screenCode="REPORTS" onExport={handleExport} requiresDateRange={false} />
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onApply={loadData}
        showLimitFilter={true}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ventas totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Bruta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">Utilidad total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMarginColor(avgMargin)}`}>
              {avgMargin.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Margen general</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Márgenes</CardTitle>
          <CardDescription>
            Análisis de rentabilidad por producto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos para el período seleccionado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantitySold}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(parseFloat(item.totalRevenue as any))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(parseFloat(item.totalCost as any))}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(parseFloat(item.grossProfit as any))}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${getMarginColor(parseFloat(item.profitMargin as any))}`}>
                        {parseFloat(item.profitMargin as any).toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
