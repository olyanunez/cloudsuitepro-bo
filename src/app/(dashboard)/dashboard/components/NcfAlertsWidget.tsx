'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, FileText } from 'lucide-react';
import { ExpiringSequence, CriticalSequence } from '@/lib/services/ncfService';

interface NcfAlertsWidgetProps {
  expiringSequences: ExpiringSequence[];
  criticalSequences: CriticalSequence[];
  expiringCount: number;
  criticalCount: number;
}

export function NcfAlertsWidget({
  expiringSequences,
  criticalSequences,
  expiringCount,
  criticalCount,
}: NcfAlertsWidgetProps) {
  const hasAlerts = expiringCount > 0 || criticalCount > 0;

  const getSeverityColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 15) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Alertas NCF</CardTitle>
          </div>
          {hasAlerts && (
            <Badge variant="destructive" className="text-xs">
              {expiringCount + criticalCount}
            </Badge>
          )}
        </div>
        <CardDescription>Secuencias que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAlerts ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay alertas. Todas las secuencias NCF están en buen estado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Secuencias próximas a vencer */}
            {expiringSequences.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h4 className="text-sm font-semibold">
                    Próximas a vencer ({expiringCount})
                  </h4>
                </div>
                <div className="space-y-2">
                  {expiringSequences.slice(0, 3).map((seq) => (
                    <div
                      key={seq.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {seq.ncfType}
                          </Badge>
                          <span className="text-sm font-medium">{seq.prefix}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {seq.branchName} • {seq.available.toLocaleString()} disponibles
                        </p>
                      </div>
                      <Badge variant={getSeverityColor(seq.daysUntilExpiry)}>
                        {seq.daysUntilExpiry}d
                      </Badge>
                    </div>
                  ))}
                  {expiringSequences.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      +{expiringSequences.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Secuencias con stock bajo */}
            {criticalSequences.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="text-sm font-semibold">
                    Stock bajo (&lt;10%) ({criticalCount})
                  </h4>
                </div>
                <div className="space-y-2">
                  {criticalSequences.slice(0, 3).map((seq) => (
                    <div
                      key={seq.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {seq.ncfType}
                          </Badge>
                          <span className="text-sm font-medium">{seq.prefix}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {seq.branchName} • {seq.available.toLocaleString()} de{' '}
                          {seq.total.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {seq.percentAvailable.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                  {criticalSequences.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      +{criticalSequences.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
