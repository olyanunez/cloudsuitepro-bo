'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KPICardsProps {
  totalSales: number;
  transactionCount: number;
  avgTicket: number;
  growthRate: number;
}

export function KPICards({ totalSales, transactionCount, avgTicket, growthRate }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {/* Total Ventas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Ventas Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(totalSales)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Total facturado</p>
        </CardContent>
      </Card>

      {/* Número de Transacciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Transacciones</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold">{transactionCount}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Facturas emitidas</p>
        </CardContent>
      </Card>

      {/* Ticket Promedio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Ticket Promedio</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(avgTicket)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Por transacción</p>
        </CardContent>
      </Card>

      {/* Crecimiento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Crecimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className={`text-lg sm:text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">vs período anterior</p>
        </CardContent>
      </Card>
    </div>
  );
}
