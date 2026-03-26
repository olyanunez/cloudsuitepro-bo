'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, PeriodComparisonData } from '@/lib/services/reportsService';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Receipt, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

export default function PeriodComparisonReport() {
  const [data, setData] = useState<PeriodComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: ReportPeriod.THIS_MONTH,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await reportsService.getPeriodComparison(filters);
      setData(result);
    } catch (error) {
      console.error('Error loading period comparison:', error);
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

      const params = new URLSearchParams({ format, reportType: 'period-comparison' });

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

      // Solo PDF para este reporte
      const periodText = filters.period || 'personalizado';
      a.download = `comparacion-periodos-${periodText}-${Date.now()}.pdf`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Archivo PDF descargado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar datos');
    }
  };

  const getChangeIndicator = (value: number, isPercentage: boolean = false) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';

    return (
      <div className={`flex items-center gap-2 ${color}`}>
        <div className={`p-1 rounded ${bgColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-semibold">
          {isPositive ? '+' : ''}{isPercentage ? `${value.toFixed(2)}%` : formatCurrency(value)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Volver</span>
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Comparación de Períodos</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Comparar período actual vs período anterior
            </p>
          </div>
        </div>
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={loadData}
          showLimitFilter={false}
        />
        <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Volver</span>
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Comparación de Períodos</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Comparar período actual vs período anterior
            </p>
          </div>
        </div>
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={loadData}
          showLimitFilter={false}
        />
        <div className="text-center py-8 text-muted-foreground">
          No hay datos para el período seleccionado
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Comparación de Períodos</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Comparar período actual vs período anterior
            </p>
          </div>
          <div className="flex-shrink-0">
            <ExportButton
              screenCode="REPORTS"
              onExport={handleExport}
              requiresDateRange={false}
              pdfOnly={true}
            />
          </div>
        </div>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onApply={loadData}
        showLimitFilter={false}
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Ingresos */}
        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Actual</p>
              <p className="text-lg sm:text-2xl font-bold">{formatCurrency(parseFloat(data.current.totalRevenue as any))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Anterior</p>
              <p className="text-base sm:text-lg text-muted-foreground">{formatCurrency(parseFloat(data.previous.totalRevenue as any))}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Cambio</p>
              {getChangeIndicator(parseFloat(data.comparison.revenueChange as any))}
              <Badge variant="outline" className="mt-2 text-xs">
                {parseFloat(data.comparison.revenueChangePercent as any) > 0 ? '+' : ''}
                {parseFloat(data.comparison.revenueChangePercent as any).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Facturas */}
        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">Total Facturas</CardTitle>
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Actual</p>
              <p className="text-lg sm:text-2xl font-bold">{data.current.totalInvoices.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Anterior</p>
              <p className="text-base sm:text-lg text-muted-foreground">{data.previous.totalInvoices.toLocaleString()}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Cambio</p>
              <div className={`flex items-center gap-2 ${data.comparison.invoicesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`p-1 rounded ${data.comparison.invoicesChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {data.comparison.invoicesChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <span className="font-semibold text-sm">
                  {data.comparison.invoicesChange > 0 ? '+' : ''}{data.comparison.invoicesChange}
                </span>
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                {parseFloat(data.comparison.invoicesChangePercent as any) > 0 ? '+' : ''}
                {parseFloat(data.comparison.invoicesChangePercent as any).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card className="p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">Ticket Promedio</CardTitle>
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Actual</p>
              <p className="text-lg sm:text-2xl font-bold">{formatCurrency(parseFloat(data.current.averageTicket as any))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Anterior</p>
              <p className="text-base sm:text-lg text-muted-foreground">{formatCurrency(parseFloat(data.previous.averageTicket as any))}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Cambio</p>
              {getChangeIndicator(parseFloat(data.comparison.averageTicketChange as any))}
              <Badge variant="outline" className="mt-2 text-xs">
                {parseFloat(data.comparison.averageTicketChangePercent as any) > 0 ? '+' : ''}
                {parseFloat(data.comparison.averageTicketChangePercent as any).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Resumen de Comparación</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Análisis detallado entre {data.current.period} y {data.previous.period}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h3 className="font-semibold text-sm sm:text-base">Período Actual</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="font-medium truncate ml-2">{data.current.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingresos:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(data.current.totalRevenue as any))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facturas:</span>
                    <span className="font-medium">{data.current.totalInvoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Prom:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(data.current.averageTicket as any))}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-sm sm:text-base">Período Anterior</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="font-medium truncate ml-2">{data.previous.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingresos:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(data.previous.totalRevenue as any))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facturas:</span>
                    <span className="font-medium">{data.previous.totalInvoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Prom:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(data.previous.averageTicket as any))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
