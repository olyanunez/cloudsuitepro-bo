'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, SalesByCashierItem } from '@/lib/services/reportsService';
import { ArrowLeft, Users, TrendingUp, Receipt, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

export default function SalesByCashierReport() {
  const [data, setData] = useState<SalesByCashierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: ReportPeriod.THIS_MONTH,
    sortBy: 'totalRevenue',
    sortOrder: 'desc',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await reportsService.getSalesByCashier(filters);
      setData(result);
    } catch (error) {
      console.error('Error loading sales by cashier:', error);
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

      const params = new URLSearchParams({ format, reportType: 'sales-by-cashier' });

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
      a.download = `ventas-por-cajero-${periodText}-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.totalRevenue as any), 0);
  const totalInvoices = data.reduce((sum, item) => sum + item.totalInvoices, 0);
  const totalCancelled = data.reduce((sum, item) => sum + item.cancelledInvoices, 0);

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Ventas por Cajero</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Desempeño y métricas de cada cajero
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

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De {data.length} cajeros
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Facturas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{totalInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Facturas procesadas
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4 col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Facturas Canceladas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{totalCancelled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalInvoices > 0 ? ((totalCancelled / totalInvoices) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Desempeño por Cajero</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Métricas de ventas y rendimiento individual
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
                  <div key={item.userId} className="border rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={index < 3 ? 'default' : 'secondary'} className="flex-shrink-0">
                        {index + 1}
                      </Badge>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{getInitials(item.cashierName)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm truncate">{item.cashierName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Facturas:</span>
                        <Badge variant="outline" className="ml-1 text-xs">{item.totalInvoices}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Canceladas:</span>
                        {item.cancelledInvoices > 0 ? (
                          <Badge variant="destructive" className="ml-1 text-xs">{item.cancelledInvoices}</Badge>
                        ) : (
                          <span className="text-muted-foreground ml-1">0</span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ticket Prom:</span>
                        <span className="font-medium ml-1">{formatCurrency(parseFloat(item.averageTicket as any))}</span>
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
                      <TableHead>Cajero</TableHead>
                      <TableHead className="text-right">Facturas</TableHead>
                      <TableHead className="text-right">Canceladas</TableHead>
                      <TableHead className="text-right">Ticket Promedio</TableHead>
                      <TableHead className="text-right">Ingresos Totales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={item.userId}>
                        <TableCell className="font-medium">
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(item.cashierName)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{item.cashierName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.totalInvoices}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.cancelledInvoices > 0 ? (
                            <Badge variant="destructive">{item.cancelledInvoices}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(item.averageTicket as any))}
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
