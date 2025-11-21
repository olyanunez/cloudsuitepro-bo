'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Package } from 'lucide-react';
import { ExpiringBatch } from '@/lib/types/batch';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BatchExpirationWidgetProps {
  expiringBatches: ExpiringBatch[];
  loading?: boolean;
}

export function BatchExpirationWidget({ expiringBatches, loading = false }: BatchExpirationWidgetProps) {
  const totalEstimatedLoss = expiringBatches.reduce((sum, batch) => sum + batch.estimatedLoss, 0);
  const criticalCount = expiringBatches.filter(b => b.daysUntilExpiration <= 7).length;
  const warningCount = expiringBatches.filter(b => b.daysUntilExpiration > 7 && b.daysUntilExpiration <= 30).length;

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysLabel = (days: number) => {
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
    return `En ${days} días`;
  };

  const getDaysBadgeVariant = (days: number) => {
    if (days <= 0) return 'destructive';
    if (days <= 7) return 'destructive';
    if (days <= 30) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas de Vencimiento
          </CardTitle>
          <CardDescription>Lotes próximos a vencer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Cargando...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expiringBatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Alertas de Vencimiento
          </CardTitle>
          <CardDescription>Lotes próximos a vencer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-green-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No hay lotes próximos a vencer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Vencimiento
            </CardTitle>
            <CardDescription>
              {expiringBatches.length} lote{expiringBatches.length !== 1 ? 's' : ''} próximo{expiringBatches.length !== 1 ? 's' : ''} a vencer
            </CardDescription>
          </div>
          <Link href="/inventory/batches?status=expiring">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-xs text-muted-foreground">Críticos (≤7d)</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
            <div className="text-xs text-muted-foreground">Advertencia (≤30d)</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="text-lg font-bold text-purple-600">{formatCurrency(totalEstimatedLoss)}</div>
            <div className="text-xs text-muted-foreground">Pérdida estimada</div>
          </div>
        </div>

        {/* Batch List */}
        <div className="space-y-3">
          {expiringBatches.slice(0, 5).map((batch) => {
            const isCritical = batch.daysUntilExpiration <= 7;
            const borderColor = isCritical
              ? 'border-red-200 dark:border-red-800'
              : 'border-orange-200 dark:border-orange-800';
            const bgColor = isCritical
              ? 'bg-red-50 dark:bg-red-950/20'
              : 'bg-orange-50 dark:bg-orange-950/20';

            return (
              <div
                key={batch.id}
                className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-red-600' : 'text-orange-600'}`} />
                      <span className="font-medium text-sm">{batch.product?.name || 'Producto'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Lote: {batch.batchNumber}</div>
                      <div>Stock: {batch.currentQuantity} unidades</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Vence: {formatDate(batch.expirationDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <Badge
                      variant={batch.daysUntilExpiration <= 0 ? 'destructive' : 'outline'}
                      className={
                        batch.daysUntilExpiration <= 0
                          ? ''
                          : batch.daysUntilExpiration <= 7
                          ? 'border-red-600 text-red-600'
                          : 'border-orange-600 text-orange-600'
                      }
                    >
                      {getDaysLabel(batch.daysUntilExpiration)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-2">
                      Pérdida: {formatCurrency(batch.estimatedLoss)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {expiringBatches.length > 5 && (
            <div className="text-center pt-2">
              <Link href="/inventory/batches?status=expiring">
                <Button variant="link" size="sm">
                  + {expiringBatches.length - 5} lotes más próximos a vencer
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
