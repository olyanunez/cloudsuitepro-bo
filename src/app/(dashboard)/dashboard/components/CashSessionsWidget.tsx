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
    <div className="space-y-4 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* KPI Cards de Caja */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        <Card className="w-full max-w-full min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2 gap-2 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-medium min-w-0 truncate">Sesiones Abiertas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 min-w-0 overflow-hidden">
            <div className="text-lg sm:text-2xl font-bold leading-tight [overflow-wrap:anywhere]">{openSessions}</div>
            <p className="text-xs text-muted-foreground">Cajas activas</p>
          </CardContent>
        </Card>

        <Card className="w-full max-w-full min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2 gap-2 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-medium min-w-0 truncate">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 min-w-0 overflow-hidden">
            <div className="text-lg sm:text-2xl font-bold text-green-600 leading-tight [overflow-wrap:anywhere]">{formatCurrency(totalCollected)}</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card className="w-full max-w-full min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2 gap-2 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-medium min-w-0 truncate">Descuadres</CardTitle>
            {totalDifference >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 min-w-0 overflow-hidden">
            <div className={`text-lg sm:text-2xl font-bold leading-tight [overflow-wrap:anywhere] ${totalDifference >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {totalDifference >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalDifference))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDifference >= 0 ? 'Sobrante' : 'Faltante'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Sesiones Recientes */}
      <Card className="w-full max-w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg truncate">Sesiones Recientes</CardTitle>
          <CardDescription className="text-xs sm:text-sm truncate">Últimas sesiones de caja del día</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden">
          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay sesiones de caja disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session) => {
                const totalDiff = session.difference + (session.differenceVouchers || 0);
                const totalSession = session.totalCash + session.totalCard + session.totalTransfer;

                return (
                  <div
                    key={session.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 p-3 rounded-lg border min-w-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <p className="font-medium text-sm truncate">Sesión #{session.sessionNumber}</p>
                        <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                          {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.userName}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1 mt-2 text-xs min-w-0">
                        <span className="text-muted-foreground truncate">
                          💵 {formatCurrency(session.totalCash)}
                        </span>
                        <span className="text-muted-foreground truncate">
                          💳 {formatCurrency(session.totalCard)}
                        </span>
                        <span className="text-muted-foreground truncate">
                          🏦 {formatCurrency(session.totalTransfer)}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right min-w-0 sm:justify-self-end">
                      <p className="font-bold text-sm leading-tight [overflow-wrap:anywhere]">{formatCurrency(totalSession)}</p>
                      {session.status === 'CLOSED' && (
                        <p className={`text-xs font-medium ${totalDiff === 0 ? 'text-green-600' :
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
