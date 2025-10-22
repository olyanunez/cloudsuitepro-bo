'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CashSessionService } from '@/lib/services/cashSessionService';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

interface OpenCashSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branchId: number;
  branchName: string;
  warehouseId?: number;
  warehouseName?: string;
}

export function OpenCashSessionModal({
  open,
  onOpenChange,
  onSuccess,
  branchId,
  branchName,
  warehouseId,
  warehouseName
}: OpenCashSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [openingAmount, setOpeningAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!openingAmount || parseFloat(openingAmount) < 0) {
      toast.error('Ingrese un monto de apertura válido');
      return;
    }

    setLoading(true);
    try {
      await CashSessionService.openSession({
        branchId: branchId,
        warehouseId: warehouseId,
        openingAmount: parseFloat(openingAmount),
        notes: notes || undefined,
      });

      toast.success('Sesión de caja abierta exitosamente');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error opening cash session:', error);
      toast.error(error?.message || 'Error al abrir la sesión de caja');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpeningAmount('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Abrir Sesión de Caja
            </DialogTitle>
            <DialogDescription>
              Ingrese el monto inicial con el que abre la caja.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Sucursal</Label>
              <div className="rounded-md border border-input bg-muted/50 px-3 py-2">
                <p className="text-sm font-medium">{branchName}</p>
                {warehouseName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Almacén: {warehouseName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="openingAmount">Monto de Apertura (Efectivo) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="openingAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ingrese el monto en efectivo con el que inicia el turno
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ej: Apertura de turno matutino"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                  Abriendo...
                </>
              ) : (
                'Abrir Caja'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
