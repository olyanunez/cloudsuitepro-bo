'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { debitNoteService, DebitNote } from '@/lib/services/debitNoteService';
import { toast } from 'sonner';
import {
    FileText,
    Calendar,
    User,
    Building2,
    DollarSign,
    AlertCircle,
    XCircle,
    CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DebitNoteDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    debitNote: DebitNote;
    onCancelled: () => void;
}

export function DebitNoteDetailDialog({
    open,
    onOpenChange,
    debitNote,
    onCancelled,
}: DebitNoteDetailDialogProps) {
    const [loading, setLoading] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const handleCancel = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Debe especificar un motivo de cancelación');
            return;
        }

        setLoading(true);
        try {
            await debitNoteService.cancel(debitNote.id, cancellationReason.trim());
            toast.success('Nota de débito cancelada exitosamente');
            setShowCancelDialog(false);
            onCancelled();
        } catch (error: any) {
            console.error('Error cancelling debit note:', error);
            toast.error(error?.message || 'Error al cancelar la nota de débito');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (debitNote.status === 'COMPLETED') {
            return (
                <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completada
                </Badge>
            );
        }
        return (
            <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Cancelada
            </Badge>
        );
    };

    const getFiscalTypeBadge = () => {
        if (debitNote.fiscalType === 'FISCAL') {
            return <Badge variant="default">Con NCF B03</Badge>;
        }
        return <Badge variant="secondary">Sin NCF</Badge>;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detalle de Nota de Débito
                        </DialogTitle>
                        <DialogDescription>
                            Información completa del cargo adicional
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Header con Estado */}
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                            <div>
                                <h3 className="text-lg font-semibold">{debitNote.debitNoteNumber}</h3>
                                {debitNote.ncf && (
                                    <p className="text-sm font-mono text-muted-foreground">{debitNote.ncf}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadge()}
                                {getFiscalTypeBadge()}
                            </div>
                        </div>

                        {/* Factura Original */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Factura Original
                            </h4>
                            <div className="rounded-lg border p-3 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Número:</span>
                                    <span className="text-sm font-medium">{debitNote.originalInvoiceNumber}</span>
                                </div>
                                {debitNote.originalNcf && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">NCF:</span>
                                        <span className="text-sm font-mono">{debitNote.originalNcf}</span>
                                    </div>
                                )}
                                {debitNote.originalInvoice && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Total Original:</span>
                                            <span className="text-sm font-medium">
                                                {formatCurrency(debitNote.originalInvoice.total)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Nuevo Saldo:</span>
                                            <span className="text-sm font-medium">
                                                {formatCurrency(debitNote.originalInvoice.balanceDue)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Cliente */}
                        {debitNote.customer && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Cliente
                                </h4>
                                <div className="rounded-lg border p-3 space-y-1">
                                    <p className="text-sm font-medium">
                                        {debitNote.customer.name} {debitNote.customer.lastName}
                                    </p>
                                    {debitNote.customer.taxId && (
                                        <p className="text-xs text-muted-foreground">
                                            RNC/Cédula: {debitNote.customer.taxId}
                                        </p>
                                    )}
                                    {debitNote.customer.email && (
                                        <p className="text-xs text-muted-foreground">{debitNote.customer.email}</p>
                                    )}
                                    {debitNote.customer.phone && (
                                        <p className="text-xs text-muted-foreground">{debitNote.customer.phone}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Información Operativa */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Sucursal
                                </h4>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm font-medium">{debitNote.branch.name}</p>
                                    <p className="text-xs text-muted-foreground">Código: {debitNote.branch.code}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Creado por
                                </h4>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm font-medium">{debitNote.user.name || debitNote.user.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(debitNote.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Montos */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Desglose de Montos
                            </h4>
                            <div className="rounded-lg border p-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(debitNote.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ITBIS:</span>
                                    <span className="font-medium">{formatCurrency(debitNote.tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Descuento:</span>
                                    <span className="font-medium">{formatCurrency(debitNote.discount)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="font-semibold">Total:</span>
                                    <span className="text-lg font-bold">{formatCurrency(debitNote.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Motivo del Cargo
                            </h4>
                            <div className="rounded-lg border p-3">
                                <p className="text-sm whitespace-pre-wrap">{debitNote.reason}</p>
                            </div>
                        </div>

                        {/* Notas Adicionales */}
                        {debitNote.notes && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Notas Adicionales</h4>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                        {debitNote.notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Información de Cancelación */}
                        {debitNote.status === 'CANCELLED' && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Información de Cancelación
                                </h4>
                                {debitNote.cancelledAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Cancelada el: {formatDate(debitNote.cancelledAt)}
                                    </p>
                                )}
                                {debitNote.cancellationReason && (
                                    <p className="text-sm">{debitNote.cancellationReason}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cerrar
                        </Button>
                        {debitNote.status === 'COMPLETED' && (
                            <Button
                                type="button"
                                onClick={() => setShowCancelDialog(true)}
                                className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar Nota de Débito
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Confirmación de Cancelación */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar Nota de Débito?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción revertirá el cargo adicional aplicado a la factura. El saldo de la
                            factura original disminuirá en {formatCurrency(debitNote.total)}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <Label htmlFor="cancelReason">Motivo de Cancelación *</Label>
                        <Textarea
                            id="cancelReason"
                            placeholder="Ej: Error en monto, cargo aplicado incorrectamente..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={3}
                            className="mt-2"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={loading || !cancellationReason.trim()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
