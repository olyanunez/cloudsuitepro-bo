'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CashSession, CashSessionService } from '@/lib/services/cashSessionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, DollarSign, CreditCard, Wallet, CheckCircle2, AlertTriangle, Clock, User, Building2, Banknote, Coins } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ProtectedPage from '@/components/ProtectedPage';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function CashSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (params.id) {
      loadSession(Number(params.id));
    }
  }, [params.id]);

  const loadSession = async (id: number) => {
    try {
      setLoading(true);
      const response = await CashSessionService.getSessionSummary(id);
      setSession(response);
    } catch (error) {
      console.error('Error loading cash session:', error);
      toast.error('Error al cargar la sesión de caja');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-500">Sesión no encontrada</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Calcular totales
  const totalVentas =
    parseFloat(session.totalCash || '0') +
    parseFloat(session.totalCard || '0') +
    parseFloat(session.totalTransfer || '0') +
    parseFloat(session.totalOther || '0');

  const openingAmount = parseFloat(session.openingAmount || '0');
  const closingAmount = parseFloat(session.closingAmount || '0');
  const closingVouchers = parseFloat(session.closingVouchers || '0');
  const expectedAmount = parseFloat(session.expectedAmount || '0');
  const expectedVouchers = parseFloat(session.expectedVouchers || '0');
  const differenceCash = parseFloat(session.difference || '0');
  const differenceVouchers = parseFloat(session.differenceVouchers || '0');

  // Determinar estado del cuadre
  const getCuadreStatus = () => {
    if (session.status === 'OPEN') return null;

    if (differenceCash < 0 || differenceVouchers < 0) {
      return { status: 'shortage', label: 'Faltante Detectado', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/20', borderColor: 'border-red-200' };
    }
    if (differenceCash > 0 || differenceVouchers > 0) {
      return { status: 'surplus', label: 'Sobrante Detectado', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/20', borderColor: 'border-blue-200' };
    }
    return { status: 'exact', label: 'Cuadre Exacto', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20', borderColor: 'border-green-200' };
  };

  const cuadreStatus = getCuadreStatus();

  // Agrupar denominaciones por tipo
  const billDenominations = session.denominations?.filter(d => d.type === 'BILL') || [];
  const coinDenominations = session.denominations?.filter(d => d.type === 'COIN') || [];

  return (
    <ProtectedPage screenCode="CASH_SESSIONS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Sesiones
          </Button>
        </div>

        <PageHeader
          title={`Sesión ${session.sessionNumber}`}
          description={`Detalle de la sesión de caja`}
          icon="calculator"
        />

        {/* Estado y Resumen General */}
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'} className="text-lg">
                {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cajero</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{session.user?.name || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">{session.user?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sucursal</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{session.branch?.name || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">{session.branch?.code}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalVentas)}</div>
              <p className="text-xs text-muted-foreground">{session._count?.invoices || 0} facturas</p>
            </CardContent>
          </Card>
        </div>

        {/* Fechas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempos de la Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Apertura</p>
                <p className="text-lg font-semibold">
                  {new Date(session.openedAt).toLocaleDateString('es-DO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Cierre</p>
                <p className="text-lg font-semibold">
                  {session.closedAt
                    ? new Date(session.closedAt).toLocaleDateString('es-DO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Aún no cerrada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desglose de Ventas por Método de Pago */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Desglose de Ventas por Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Efectivo</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(parseFloat(session.totalCash || '0'))}</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Tarjeta</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(session.totalCard || '0'))}</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Transferencia</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(parseFloat(session.totalTransfer || '0'))}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Otros</span>
                </div>
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(parseFloat(session.totalOther || '0'))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cuadre de Caja (solo si está cerrada) */}
        {session.status === 'CLOSED' && (
          <>
            {/* Resumen del Cuadre */}
            {cuadreStatus && (
              <Card className={`mb-6 ${cuadreStatus.bgColor} ${cuadreStatus.borderColor} border-2`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${cuadreStatus.color}`}>
                    {cuadreStatus.status === 'exact' && <CheckCircle2 className="h-6 w-6" />}
                    {cuadreStatus.status === 'shortage' && <AlertTriangle className="h-6 w-6" />}
                    {cuadreStatus.status === 'surplus' && <CheckCircle2 className="h-6 w-6" />}
                    {cuadreStatus.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Cuadre de Efectivo */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" /> Cuadre de Efectivo
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monto de Apertura:</span>
                          <span className="font-medium">{formatCurrency(openingAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Ventas en Efectivo:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(session.totalCash || '0'))}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>= Esperado en Caja:</span>
                          <span>{formatCurrency(expectedAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efectivo Contado:</span>
                          <span className="font-medium">{formatCurrency(closingAmount)}</span>
                        </div>
                        <Separator />
                        <div className={`flex justify-between font-bold text-lg ${differenceCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span>Diferencia:</span>
                          <span>{differenceCash >= 0 ? '+' : ''}{formatCurrency(differenceCash)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cuadre de Vouchers */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Cuadre de Vouchers
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Ventas con Tarjeta:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(session.totalCard || '0'))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Transferencias:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(session.totalTransfer || '0'))}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>= Esperado en Vouchers:</span>
                          <span>{formatCurrency(expectedVouchers)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vouchers Contados:</span>
                          <span className="font-medium">{formatCurrency(closingVouchers)}</span>
                        </div>
                        <Separator />
                        <div className={`flex justify-between font-bold text-lg ${differenceVouchers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span>Diferencia:</span>
                          <span>{differenceVouchers >= 0 ? '+' : ''}{formatCurrency(differenceVouchers)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Desglose por Denominaciones */}
            {(billDenominations.length > 0 || coinDenominations.length > 0) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Desglose por Denominaciones
                  </CardTitle>
                  <CardDescription>
                    Conteo de billetes y monedas al cierre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Billetes */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-green-600" />
                        Billetes
                      </h4>
                      {billDenominations.length > 0 ? (
                        <div className="space-y-2">
                          {billDenominations
                            .sort((a, b) => parseFloat(b.denomination) - parseFloat(a.denomination))
                            .map((denom, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                                <span className="font-medium">RD${parseFloat(denom.denomination).toLocaleString()}</span>
                                <span className="text-muted-foreground">x {denom.quantity}</span>
                                <span className="font-semibold">{formatCurrency(parseFloat(denom.subtotal))}</span>
                              </div>
                            ))}
                          <div className="flex justify-between items-center p-2 rounded bg-green-100 dark:bg-green-900/30 font-bold">
                            <span>Total Billetes:</span>
                            <span>{formatCurrency(billDenominations.reduce((sum, d) => sum + parseFloat(d.subtotal), 0))}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin billetes registrados</p>
                      )}
                    </div>

                    {/* Monedas */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-600" />
                        Monedas
                      </h4>
                      {coinDenominations.length > 0 ? (
                        <div className="space-y-2">
                          {coinDenominations
                            .sort((a, b) => parseFloat(b.denomination) - parseFloat(a.denomination))
                            .map((denom, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                                <span className="font-medium">RD${parseFloat(denom.denomination).toLocaleString()}</span>
                                <span className="text-muted-foreground">x {denom.quantity}</span>
                                <span className="font-semibold">{formatCurrency(parseFloat(denom.subtotal))}</span>
                              </div>
                            ))}
                          <div className="flex justify-between items-center p-2 rounded bg-yellow-100 dark:bg-yellow-900/30 font-bold">
                            <span>Total Monedas:</span>
                            <span>{formatCurrency(coinDenominations.reduce((sum, d) => sum + parseFloat(d.subtotal), 0))}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin monedas registradas</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Notas */}
        {(session.notes || session.closingNotes) && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas de Apertura:</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">{session.notes}</p>
                </div>
              )}
              {session.closingNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas de Cierre:</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">{session.closingNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedPage>
  );
}
