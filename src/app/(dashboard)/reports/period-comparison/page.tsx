'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, PeriodComparisonData } from '@/lib/services/reportsService';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Receipt, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comparación de Períodos</h1>
            <p className="text-muted-foreground mt-1">
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comparación de Períodos</h1>
            <p className="text-muted-foreground mt-1">
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comparación de Períodos</h1>
          <p className="text-muted-foreground mt-1">
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Ingresos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ingresos Totales</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Actual</p>
              <p className="text-2xl font-bold">{formatCurrency(parseFloat(data.current.totalRevenue as any))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Anterior</p>
              <p className="text-lg text-muted-foreground">{formatCurrency(parseFloat(data.previous.totalRevenue as any))}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Cambio</p>
              {getChangeIndicator(parseFloat(data.comparison.revenueChange as any))}
              <Badge variant="outline" className="mt-2">
                {parseFloat(data.comparison.revenueChangePercent as any) > 0 ? '+' : ''}
                {parseFloat(data.comparison.revenueChangePercent as any).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Facturas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Total Facturas</CardTitle>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Actual</p>
              <p className="text-2xl font-bold">{data.current.totalInvoices.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Anterior</p>
              <p className="text-lg text-muted-foreground">{data.previous.totalInvoices.toLocaleString()}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Cambio</p>
              <div className={`flex items-center gap-2 ${data.comparison.invoicesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`p-1 rounded ${data.comparison.invoicesChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {data.comparison.invoicesChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <span className="font-semibold">
                  {data.comparison.invoicesChange > 0 ? '+' : ''}{data.comparison.invoicesChange}
                </span>
              </div>
              <Badge variant="outline" className="mt-2">
                {parseFloat(data.comparison.invoicesChangePercent as any) > 0 ? '+' : ''}
                {parseFloat(data.comparison.invoicesChangePercent as any).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ticket Promedio</CardTitle>
              <Ticket className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Actual</p>
              <p className="text-2xl font-bold">{formatCurrency(parseFloat(data.current.averageTicket as any))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Período Anterior</p>
              <p className="text-lg text-muted-foreground">{formatCurrency(parseFloat(data.previous.averageTicket as any))}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Cambio</p>
              {getChangeIndicator(parseFloat(data.comparison.averageTicketChange as any))}
              <Badge variant="outline" className="mt-2">
                {parseFloat(data.comparison.averageTicketChangePercent as any) > 0 ? '+' : ''}
                {parseFloat(data.comparison.averageTicketChangePercent as any).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Comparación</CardTitle>
          <CardDescription>
            Análisis detallado entre {data.current.period} y {data.previous.period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Período Actual</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="font-medium">{data.current.period}</span>
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
                    <span className="text-muted-foreground">Ticket Promedio:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(data.current.averageTicket as any))}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Período Anterior</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="font-medium">{data.previous.period}</span>
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
                    <span className="text-muted-foreground">Ticket Promedio:</span>
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
