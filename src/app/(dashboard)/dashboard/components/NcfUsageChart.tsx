'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';
import { NcfUsageByMonth } from '@/lib/services/ncfService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface NcfUsageChartProps {
  data: NcfUsageByMonth[];
}

// Colores personalizados más vibrantes y profesionales
const COLORS = {
  B01: '#3b82f6', // Azul vibrante - Crédito Fiscal
  B02: '#10b981', // Verde esmeralda - Consumo
  B03: '#f59e0b', // Ámbar - Nota Débito
  B04: '#ef4444', // Rojo - Nota Crédito
};

export function NcfUsageChart({ data }: NcfUsageChartProps) {
  // Formatear el mes para mostrar
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
  };

  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    B01: item.B01 || 0,
    B02: item.B02 || 0,
    B03: item.B03 || 0,
    B04: item.B04 || 0,
    total: item.total || 0,
  }));

  const totalNcfUsed = data.reduce((sum, item) => sum + (item.total || 0), 0);

  // Calcular tendencia (comparar último mes con el anterior)
  const trend =
    chartData.length >= 2
      ? ((chartData[chartData.length - 1].total - chartData[chartData.length - 2].total) /
          chartData[chartData.length - 2].total) *
        100
      : 0;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}:</span>
                </div>
                <span className="font-semibold">{entry.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-1 flex items-center justify-between gap-4 text-xs font-semibold">
              <span>Total:</span>
              <span>{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2 bg-gradient-to-br from-card to-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Uso de NCF por Mes</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Últimos 6 meses de emisión
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {totalNcfUsed.toLocaleString()}
              </p>
              {trend !== 0 && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendingUp
                    className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`}
                  />
                  {Math.abs(trend).toFixed(0)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de NCF emitidos
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No hay datos disponibles
            </p>
            <p className="text-xs text-muted-foreground">
              Los NCF emitidos aparecerán aquí
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorB01" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.B01} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={COLORS.B01} stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="colorB02" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.B02} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={COLORS.B02} stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="colorB03" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.B03} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={COLORS.B03} stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="colorB04" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.B04} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={COLORS.B04} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Legend
                wrapperStyle={{
                  fontSize: '11px',
                  paddingTop: '20px',
                }}
                iconType="square"
                iconSize={10}
              />
              <Bar
                dataKey="B01"
                name="B01 - Crédito Fiscal"
                stackId="a"
                fill="url(#colorB01)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="B02"
                name="B02 - Consumo"
                stackId="a"
                fill="url(#colorB02)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="B03"
                name="B03 - Nota Débito"
                stackId="a"
                fill="url(#colorB03)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="B04"
                name="B04 - Nota Crédito"
                stackId="a"
                fill="url(#colorB04)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
