'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CashSessionService, CashSession, CashDenominationDto, CloseSessionResponse } from '@/lib/services/cashSessionService';
import { toast } from 'sonner';
import { Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CloseCashSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSession | null;
  onSuccess: () => void;
}

// Denominaciones de pesos dominicanos
const DENOMINATIONS = {
  bills: [
    { value: 2000, label: 'RD$2,000' },
    { value: 1000, label: 'RD$1,000' },
    { value: 500, label: 'RD$500' },
    { value: 200, label: 'RD$200' },
    { value: 100, label: 'RD$100' },
    { value: 50, label: 'RD$50' },
  ],
  coins: [
    { value: 25, label: 'RD$25' },
    { value: 10, label: 'RD$10' },
    { value: 5, label: 'RD$5' },
    { value: 1, label: 'RD$1' },
  ],
};

type DenominationCounts = Record<number, number>;

export function CloseCashSessionModal({ open, onOpenChange, session, onSuccess }: CloseCashSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [closingVouchers, setClosingVouchers] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [billCounts, setBillCounts] = useState<DenominationCounts>({});
  const [coinCounts, setCoinCounts] = useState<DenominationCounts>({});
  const [closeResult, setCloseResult] = useState<CloseSessionResponse | null>(null);

  // Calcular total de efectivo desde denominaciones
  const totalCash = useMemo(() => {
    let total = 0;
    DENOMINATIONS.bills.forEach(d => {
      total += (billCounts[d.value] || 0) * d.value;
    });
    DENOMINATIONS.coins.forEach(d => {
      total += (coinCounts[d.value] || 0) * d.value;
    });
    return total;
  }, [billCounts, coinCounts]);

  const handleBillCountChange = (denomination: number, count: string) => {
    const numCount = parseInt(count) || 0;
    setBillCounts(prev => ({ ...prev, [denomination]: numCount }));
  };

  const handleCoinCountChange = (denomination: number, count: string) => {
    const numCount = parseInt(count) || 0;
    setCoinCounts(prev => ({ ...prev, [denomination]: numCount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    const openingAmount = parseFloat(session.openingAmount || '0');
    const vouchersAmount = parseFloat(closingVouchers) || 0;

    // Validar que hay al menos una denominación o vouchers, excepto si la sesión se abrió con 0
    if (totalCash === 0 && vouchersAmount === 0 && openingAmount > 0) {
      toast.error('Debe ingresar al menos efectivo o vouchers');
      return;
    }

    // Construir array de denominaciones
    const denominations: CashDenominationDto[] = [];

    DENOMINATIONS.bills.forEach(d => {
      const quantity = billCounts[d.value] || 0;
      if (quantity > 0) {
        denominations.push({
          type: 'BILL',
          denomination: d.value,
          quantity,
        });
      }
    });

    DENOMINATIONS.coins.forEach(d => {
      const quantity = coinCounts[d.value] || 0;
      if (quantity > 0) {
        denominations.push({
          type: 'COIN',
          denomination: d.value,
          quantity,
        });
      }
    });

    setLoading(true);
    try {
      const result = await CashSessionService.closeSession(session.id, {
        denominations,
        closingVouchers: parseFloat(closingVouchers) || 0,
        closingNotes: closingNotes || undefined,
      });

      setCloseResult(result);
    } catch (error: any) {
      console.error('Error closing cash session:', error);
      toast.error(error?.message || 'Error al cerrar la sesión de caja');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBillCounts({});
    setCoinCounts({});
    setClosingVouchers('');
    setClosingNotes('');
    setCloseResult(null);
    onOpenChange(false);
  };

  const handleConfirmClose = () => {
    toast.success('Sesión de caja cerrada exitosamente');
    onSuccess();
    handleClose();
  };

  if (!session) return null;

  // Si ya se cerró, mostrar resultado
  if (closeResult) {
    const { cashierSummary } = closeResult;
    const hasShortage = cashierSummary.status === 'SHORTAGE';

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {hasShortage ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              Resultado del Cuadre
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            {hasShortage ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="font-semibold text-red-700 dark:text-red-400 text-center text-lg">
                    {cashierSummary.message}
                  </p>
                </div>

                {cashierSummary.cashShortage !== null && (
                  <div className="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <span className="font-medium">Faltante en Efectivo:</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      -${cashierSummary.cashShortage.toFixed(2)}
                    </span>
                  </div>
                )}

                {cashierSummary.voucherShortage !== null && (
                  <div className="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <span className="font-medium">Faltante en Vouchers:</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      -${cashierSummary.voucherShortage.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-700 dark:text-green-400 text-lg">
                  {cashierSummary.message}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  El cuadre de caja se realizó correctamente
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmClose} className="w-full">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const openingAmount = parseFloat(session.openingAmount || '0');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            {/* Info de apertura */}
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monto de Apertura:</span>
                <span className="font-semibold">${openingAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Sección de Efectivo por Denominación */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Conteo de Efectivo por Denominación
              </h3>

              {/* Billetes */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Billetes</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DENOMINATIONS.bills.map(d => (
                    <div key={d.value} className="flex items-center gap-2 p-2 rounded border bg-background">
                      <span className="text-sm font-medium w-20">{d.label}</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={billCounts[d.value] || ''}
                        onChange={(e) => handleBillCountChange(d.value, e.target.value)}
                        className="h-8 w-16 text-center"
                      />
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        ${((billCounts[d.value] || 0) * d.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monedas */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Monedas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DENOMINATIONS.coins.map(d => (
                    <div key={d.value} className="flex items-center gap-2 p-2 rounded border bg-background">
                      <span className="text-sm font-medium w-16">{d.label}</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={coinCounts[d.value] || ''}
                        onChange={(e) => handleCoinCountChange(d.value, e.target.value)}
                        className="h-8 w-16 text-center"
                      />
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        ${((coinCounts[d.value] || 0) * d.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Efectivo */}
              <div className="rounded-lg border-2 border-primary/50 p-3 bg-primary/5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Efectivo Contado:</span>
                  <span className="text-xl font-bold text-primary">
                    ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sección de Vouchers */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Vouchers (Tarjetas + Transferencias)</h3>
              <p className="text-xs text-muted-foreground">
                Ingrese el total de vouchers de tarjetas y comprobantes de transferencias
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={closingVouchers}
                  onChange={(e) => setClosingVouchers(e.target.value)}
                  className="pl-7 text-lg h-12"
                />
              </div>
            </div>

            <Separator />

            {/* Notas de cierre */}
            <div className="grid gap-2">
              <Label htmlFor="closingNotes">Notas de Cierre (opcional)</Label>
              <Textarea
                id="closingNotes"
                placeholder="Ej: Cierre sin novedades, todo en orden"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                rows={2}
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
                  Procesando...
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
