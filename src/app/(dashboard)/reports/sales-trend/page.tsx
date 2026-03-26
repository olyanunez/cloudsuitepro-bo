'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReportFilters from '@/components/reports/ReportFilters';
import reportsService, { ReportPeriod, ReportFilters as ReportFiltersType, SalesTrendItem } from '@/lib/services/reportsService';
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function SalesTrendReport() {
  const [data, setData] = useState<SalesTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: ReportPeriod.THIS_MONTH,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await reportsService.getSalesTrend(filters);
      setData(result);
    } catch (error) {
      console.error('Error loading sales trend:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    fullDate: item.date,
    ingresos: parseFloat(item.totalRevenue as any),
    facturas: item.invoiceCount,
    promedio: parseFloat(item.averageTicket as any),
  }));

  const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.totalRevenue as any), 0);
  const totalInvoices = data.reduce((sum, item) => sum + item.invoiceCount, 0);
  const avgTicket = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Tendencia de Ventas</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Evolución diaria de ventas en el período seleccionado
          </p>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En {data.length} días
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Facturas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-xs sm:text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(avgTicket)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por factura
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Gráfica de Tendencia</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Evolución de ingresos y facturas por día
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
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorFacturas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickMargin={8} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} width={50} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} width={40} />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'Ingresos' || name === 'Ticket Promedio') {
                        return formatCurrency(parseFloat(value));
                      }
                      return value;
                    }}
                    labelFormatter={(label) => `Fecha: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorIngresos)"
                    name="Ingresos"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="facturas"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorFacturas)"
                    name="Facturas"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="promedio"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#colorPromedio)"
                    name="Ticket Promedio"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
