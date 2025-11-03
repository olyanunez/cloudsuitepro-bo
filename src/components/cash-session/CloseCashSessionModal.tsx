'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CashSessionService, CashSession } from '@/lib/services/cashSessionService';
import { toast } from 'sonner';
import { Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CloseCashSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSession | null;
  onSuccess: () => void;
}

export function CloseCashSessionModal({ open, onOpenChange, session, onSuccess }: CloseCashSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [closingAmount, setClosingAmount] = useState<string>('');
  const [closingVouchers, setClosingVouchers] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [sessionSummary, setSessionSummary] = useState<CashSession | null>(null);

  useEffect(() => {
    if (open && session) {
      loadSessionSummary();
    }
  }, [open, session]);

  const loadSessionSummary = async () => {
    if (!session) return;

    try {
      const summary = await CashSessionService.getSessionSummary(session.id);
      setSessionSummary(summary);
    } catch (error: any) {
      console.error('Error loading session summary:', error);
      toast.error('Error al cargar el resumen de la sesión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    if (!closingAmount || parseFloat(closingAmount) < 0) {
      toast.error('Ingrese un monto de cierre válido');
      return;
    }

    setLoading(true);
    try {
      await CashSessionService.closeSession(session.id, {
        closingAmount: parseFloat(closingAmount),
        closingVouchers: closingVouchers ? parseFloat(closingVouchers) : undefined,
        closingNotes: closingNotes || undefined,
      });

      toast.success('Sesión de caja cerrada exitosamente');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error closing cash session:', error);
      toast.error(error?.message || 'Error al cerrar la sesión de caja');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClosingAmount('');
    setClosingVouchers('');
    setClosingNotes('');
    setSessionSummary(null);
    onOpenChange(false);
  };

  if (!session) return null;

  // Calcular totales por método de pago desde las facturas
  const invoices = sessionSummary?.invoices || [];
  const invoiceCount = invoices.length;

  const totalCash = invoices
    .filter((inv: any) => inv.paymentMethod === 'CASH' && inv.status !== 'CANCELLED')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);

  const totalCard = invoices
    .filter((inv: any) => inv.paymentMethod === 'CARD' && inv.status !== 'CANCELLED')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);

  const totalTransfer = invoices
    .filter((inv: any) => inv.paymentMethod === 'TRANSFER' && inv.status !== 'CANCELLED')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);

  const totalOther = invoices
    .filter((inv: any) => !['CASH', 'CARD', 'TRANSFER'].includes(inv.paymentMethod) && inv.status !== 'CANCELLED')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);

  const openingAmount = parseFloat(session.openingAmount || '0');
  const expectedAmount = openingAmount + totalCash;
  const closingAmountNum = parseFloat(closingAmount || '0');
  const difference = closingAmountNum - expectedAmount;

  // Cálculos para vouchers
  const expectedVouchers = totalCard + totalTransfer;
  const closingVouchersNum = parseFloat(closingVouchers || '0');
  const differenceVouchers = closingVouchersNum - expectedVouchers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cerrar Sesión de Caja - Cuadre
            </DialogTitle>
            <DialogDescription>
              Sesión #{session.sessionNumber} - {session.branch?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Resumen de la sesión */}
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Resumen del Turno</h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Apertura</p>
                  <p className="font-medium">${openingAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Facturas</p>
                  <p className="font-medium">{invoiceCount}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Ventas por Método de Pago</h4>
                <div className="grid gap-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efectivo:</span>
                    <span className="font-medium">${totalCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarjeta:</span>
                    <span className="font-medium">${totalCard.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transferencia:</span>
                    <span className="font-medium">${totalTransfer.toFixed(2)}</span>
                  </div>
                  {totalOther > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Otros:</span>
                      <span className="font-medium">${totalOther.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Efectivo Esperado:</span>
                <span className="font-semibold text-lg">${expectedAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                (Apertura + Ventas en Efectivo)
              </p>
            </div>

            {/* Resumen de Vouchers Esperados */}
            {expectedVouchers > 0 && (
              <div className="rounded-lg border p-4 space-y-3 bg-blue-50/50 dark:bg-blue-950/20">
                <h3 className="font-semibold text-sm">Vouchers Esperados (Tarjetas + Transferencias)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarjetas:</span>
                    <span className="font-medium">${totalCard.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transferencias:</span>
                    <span className="font-medium">${totalTransfer.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Total Vouchers Esperado:</span>
                    <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                      ${expectedVouchers.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Monto de cierre en efectivo */}
            <div className="grid gap-2">
              <Label htmlFor="closingAmount">Efectivo Contado en Caja *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="closingAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cuente el efectivo físico en la caja e ingrese el monto total
              </p>
            </div>

            {/* Monto de vouchers contados */}
            {expectedVouchers > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="closingVouchers">Vouchers Contados (Tarjetas + Transferencias)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="closingVouchers"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={closingVouchers}
                    onChange={(e) => setClosingVouchers(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cuente los vouchers físicos y referencias de transferencias e ingrese el monto total
                </p>
              </div>
            )}

            {/* Diferencia calculada en efectivo */}
            {closingAmount && (
              <div className={`rounded-lg border p-4 ${
                difference === 0 ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
                difference > 0 ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' :
                'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {difference === 0 ? (
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : difference > 0 ? (
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-semibold">
                      Efectivo: {difference === 0 ? 'Cuadre Exacto' :
                       difference > 0 ? 'Sobrante' : 'Faltante'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${
                    difference === 0 ? 'text-green-600 dark:text-green-400' :
                    difference > 0 ? 'text-blue-600 dark:text-blue-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
                  </span>
                </div>
                {difference !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {difference > 0
                      ? 'Hay más efectivo del esperado en la caja'
                      : 'Hay menos efectivo del esperado en la caja'}
                  </p>
                )}
              </div>
            )}

            {/* Diferencia calculada en vouchers */}
            {closingVouchers && expectedVouchers > 0 && (
              <div className={`rounded-lg border p-4 ${
                differenceVouchers === 0 ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
                differenceVouchers > 0 ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' :
                'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {differenceVouchers === 0 ? (
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : differenceVouchers > 0 ? (
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-semibold">
                      Vouchers: {differenceVouchers === 0 ? 'Cuadre Exacto' :
                       differenceVouchers > 0 ? 'Sobrante' : 'Faltante'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${
                    differenceVouchers === 0 ? 'text-green-600 dark:text-green-400' :
                    differenceVouchers > 0 ? 'text-blue-600 dark:text-blue-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {differenceVouchers >= 0 ? '+' : ''}${differenceVouchers.toFixed(2)}
                  </span>
                </div>
                {differenceVouchers !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {differenceVouchers > 0
                      ? 'Hay más vouchers del esperado'
                      : 'Hay menos vouchers del esperado'}
                  </p>
                )}
              </div>
            )}

            {/* Notas de cierre */}
            <div className="grid gap-2">
              <Label htmlFor="closingNotes">Notas de Cierre (opcional)</Label>
              <Textarea
                id="closingNotes"
                placeholder="Ej: Cierre sin novedades, todo en orden"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Cerrando...
                </>
              ) : (
                'Cerrar Caja'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
