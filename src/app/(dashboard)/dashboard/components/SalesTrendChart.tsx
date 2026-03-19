'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    total: number;
    invoiceCount?: number;
    averageTicket?: number;
  }>;
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  // Formatear datos para el gráfico
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    ingresos: parseFloat(item.total as any) || 0,
    facturas: item.invoiceCount || 0,
    promedio: parseFloat(item.averageTicket as any) || 0,
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Tendencia de Ventas</CardTitle>
        <CardDescription>Evolución de ingresos y facturas por día</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
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
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
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
      </CardContent>
    </Card>
  );
}
