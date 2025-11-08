'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NcfComplianceWidgetProps {
  totalActiveSequences: number;
  expiringCount: number;
  criticalCount: number;
  totalNcfUsed: number;
}

export function NcfComplianceWidget({
  totalActiveSequences,
  expiringCount,
  criticalCount,
  totalNcfUsed,
}: NcfComplianceWidgetProps) {
  // Calcular el estado de cumplimiento
  const getComplianceStatus = () => {
    if (totalActiveSequences === 0) {
      return {
        status: 'critical',
        label: 'Sin Secuencias',
        color: 'destructive' as const,
        icon: AlertCircle,
        message: 'No hay secuencias NCF activas configuradas',
      };
    }

    if (criticalCount > 0 || expiringCount > 3) {
      return {
        status: 'warning',
        label: 'Requiere Atención',
        color: 'default' as const,
        icon: AlertCircle,
        message: 'Hay secuencias que necesitan renovación o recarga',
      };
    }

    if (expiringCount > 0) {
      return {
        status: 'good',
        label: 'Monitorear',
        color: 'secondary' as const,
        icon: CheckCircle2,
        message: 'Sistema operando normalmente, algunas secuencias por vencer',
      };
    }

    return {
      status: 'excellent',
      label: 'Excelente',
      color: 'default' as const,
      icon: CheckCircle2,
      message: 'Todas las secuencias NCF están en buen estado',
    };
  };

  const compliance = getComplianceStatus();
  const ComplianceIcon = compliance.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Cumplimiento Fiscal</CardTitle>
        </div>
        <CardDescription>Estado general del sistema NCF</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado general */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <ComplianceIcon
              className={`h-8 w-8 ${
                compliance.status === 'critical'
                  ? 'text-red-500'
                  : compliance.status === 'warning'
                    ? 'text-orange-500'
                    : 'text-green-500'
              }`}
            />
            <div>
              <p className="font-semibold">{compliance.label}</p>
              <p className="text-xs text-muted-foreground">{compliance.message}</p>
            </div>
          </div>
          <Badge variant={compliance.color}>{compliance.status.toUpperCase()}</Badge>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Secuencias Activas</p>
            </div>
            <p className="text-2xl font-bold">{totalActiveSequences}</p>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">NCF Emitidos</p>
            </div>
            <p className="text-2xl font-bold">{totalNcfUsed.toLocaleString()}</p>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Por Vencer</p>
            </div>
            <p className="text-2xl font-bold">{expiringCount}</p>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Stock Bajo</p>
            </div>
            <p className="text-2xl font-bold">{criticalCount}</p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="pt-2 space-y-2">
          <Link href="/ncf/sequences" className="block">
            <Button variant="outline" size="sm" className="w-full">
              Ver Secuencias NCF
            </Button>
          </Link>
          {(expiringCount > 0 || criticalCount > 0) && (
            <Link href="/ncf/sequences/create" className="block">
              <Button size="sm" className="w-full">
                Crear Nueva Secuencia
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
