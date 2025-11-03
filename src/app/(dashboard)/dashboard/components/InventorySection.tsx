'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventorySectionProps {
  totalValue: number;
  lowStockCount: number;
  totalProducts: number;
  lowStockItems?: Array<{
    productCode: string;
    productName: string;
    warehouseName: string;
    quantity: number;
    minStock: number;
    deficit: number;
  }>;
}

export function InventorySection({
  totalValue,
  lowStockCount,
  totalProducts,
  lowStockItems = [],
}: InventorySectionProps) {
  const riskValue = lowStockItems.reduce((sum, item) => sum + (item.deficit * 50), 0); // Estimado

  return (
    <div className="space-y-4">
      {/* KPI Cards de Inventario */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valorización Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalProducts} productos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Productos críticos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor en Riesgo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${riskValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por stock bajo</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Stock Bajo */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock Bajo</CardTitle>
            <CardDescription>
              Productos que necesitan reabastecimiento urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.productCode} - {item.warehouseName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {item.quantity} / {item.minStock}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Faltante: {item.deficit}
                      </p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  + {lowStockItems.length - 5} productos más con stock bajo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
