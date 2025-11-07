'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface CashSessionsWidgetProps {
  openSessions: number;
  totalCollected: number;
  totalDifference: number;
  recentSessions?: Array<{
    id: number;
    sessionNumber: string;
    userName: string;
    totalCash: number;
    totalCard: number;
    totalTransfer: number;
    difference: number;
    differenceVouchers: number;
    status: string;
  }>;
}

export function CashSessionsWidget({
  openSessions,
  totalCollected,
  totalDifference,
  recentSessions = [],
}: CashSessionsWidgetProps) {
  return (
    <div className="space-y-4">
      {/* KPI Cards de Caja */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Abiertas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openSessions}</div>
            <p className="text-xs text-muted-foreground">Cajas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descuadres</CardTitle>
            {totalDifference >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {totalDifference >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalDifference))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDifference >= 0 ? 'Sobrante' : 'Faltante'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Sesiones Recientes */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Recientes</CardTitle>
            <CardDescription>Últimas sesiones de caja del día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session) => {
                const totalDiff = session.difference + (session.differenceVouchers || 0);
                const totalSession = session.totalCash + session.totalCard + session.totalTransfer;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">Sesión #{session.sessionNumber}</p>
                        <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                          {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.userName}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-muted-foreground">
                          💵 {formatCurrency(session.totalCash)}
                        </span>
                        <span className="text-muted-foreground">
                          💳 {formatCurrency(session.totalCard)}
                        </span>
                        <span className="text-muted-foreground">
                          🏦 {formatCurrency(session.totalTransfer)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(totalSession)}</p>
                      {session.status === 'CLOSED' && (
                        <p className={`text-xs font-medium ${
                          totalDiff === 0 ? 'text-green-600' :
                          totalDiff > 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {totalDiff === 0 ? '✓ Exacto' : `${totalDiff >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalDiff))}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
