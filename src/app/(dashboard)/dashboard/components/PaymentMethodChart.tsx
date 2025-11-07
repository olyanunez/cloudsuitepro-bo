'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PaymentMethodChartProps {
  data: Array<{
    paymentMethod: string;
    total: number;
    count: number;
  }>;
}

const COLORS = {
  CASH: '#10b981', // green
  CARD: '#3b82f6', // blue
  TRANSFER: '#f59e0b', // amber
  OTHER: '#6b7280', // gray
};

const LABELS = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otros',
};

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  // Formatear datos para el gráfico - convertir a número
  const chartData = data.map(item => ({
    name: LABELS[item.paymentMethod as keyof typeof LABELS] || item.paymentMethod,
    value: parseFloat(item.total as any) || 0,
    count: parseInt(item.count as any) || 0,
    color: COLORS[item.paymentMethod as keyof typeof COLORS] || COLORS.OTHER,
  }));

  const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.total as any) || 0), 0);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>Distribución de ventas por método</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Total']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Resumen detallado */}
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{item.count} trans.</span>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
