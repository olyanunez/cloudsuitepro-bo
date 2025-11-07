'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'ingresos' || name === 'promedio') {
                  return formatCurrency(parseFloat(value));
                }
                return value;
              }}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ingresos"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Ingresos"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="facturas"
              stroke="#10b981"
              strokeWidth={2}
              name="Facturas"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="promedio"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Ticket Promedio"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
