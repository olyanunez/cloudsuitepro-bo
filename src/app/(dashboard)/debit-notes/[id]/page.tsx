'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Download, XCircle } from 'lucide-react';
import { debitNoteService, DebitNote } from '@/lib/services/debitNoteService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DebitNoteDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [debitNote, setDebitNote] = useState<DebitNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadDebitNote();
    }, [params.id]);

    const loadDebitNote = async () => {
        try {
            setLoading(true);
            const id = parseInt(params.id as string);
            const data = await debitNoteService.getById(id);
            setDebitNote(data);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Error cargando nota de débito', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancellationReason.trim()) {
            toast({ title: 'Error', description: 'Debe especificar un motivo de cancelación', variant: 'destructive' });
            return;
        }

        setCancelling(true);
        try {
            await debitNoteService.cancel(debitNote!.id, cancellationReason.trim());
            toast({ title: 'Éxito', description: 'Nota de débito cancelada exitosamente' });
            setShowCancelDialog(false);
            loadDebitNote();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Error al cancelar la nota de débito', variant: 'destructive' });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Cargando...</div>;
    }

    if (!debitNote) {
        return <div className="flex items-center justify-center h-96">Nota de débito no encontrada</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Nota de Débito {debitNote.debitNoteNumber}</h1>
                        <p className="text-muted-foreground">
                            {debitNote.fiscalType === 'FISCAL' ? 'Cargo Fiscal con NCF B03' : 'Cargo Interno sin NCF'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>
                    {debitNote.status === 'COMPLETED' && (
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                            className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar Nota
                        </Button>
                    )}
                </div>
            </div>

            {/* Información General */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Nota de Débito</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Número ND:</span>
                            <span className="font-medium">{debitNote.debitNoteNumber}</span>
                        </div>
                        {debitNote.ncf && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">NCF B03:</span>
                                    <span className="font-mono font-medium">{debitNote.ncf}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Válido hasta:</span>
                                    <span>{debitNote.ncfValidUntil ? formatDate(debitNote.ncfValidUntil) : 'N/A'}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            {debitNote.fiscalType === 'FISCAL' ? (
                                <Badge variant="default">Fiscal (Con NCF B03)</Badge>
                            ) : (
                                <Badge variant="secondary">Interno (Sin NCF)</Badge>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha:</span>
                            <span>{formatDate(debitNote.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Estado:</span>
                            {debitNote.status === 'COMPLETED' ? (
                                <Badge variant="default">Completada</Badge>
                            ) : (
                                <Badge variant="secondary">Cancelada</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Factura Original</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Número Factura:</span>
                            <span className="font-medium">{debitNote.originalInvoiceNumber}</span>
                        </div>
                        {debitNote.originalNcf && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">NCF Original:</span>
                                <span className="font-mono">{debitNote.originalNcf}</span>
                            </div>
                        )}
                        {debitNote.originalInvoice && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Original:</span>
                                    <span>{formatCurrency(debitNote.originalInvoice.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nuevo Cargo:</span>
                                    <span className="text-red-600 font-medium">+{formatCurrency(debitNote.total)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-muted-foreground">Nuevo Saldo:</span>
                                    <span className="font-semibold text-lg">
                                        {formatCurrency(Number(debitNote.originalInvoice.total) + Number(debitNote.total))}
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {debitNote.customer ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cliente:</span>
                                    <span className="font-medium">
                                        {debitNote.customer.name} {debitNote.customer.lastName}
                                    </span>
                                </div>
                                {debitNote.customer.taxId && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">RNC/Cédula:</span>
                                        <span>{debitNote.customer.taxId}</span>
                                    </div>
                                )}
                                {debitNote.customer.email && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span>{debitNote.customer.email}</span>
                                    </div>
                                )}
                                {debitNote.customer.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Teléfono:</span>
                                        <span>{debitNote.customer.phone}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-muted-foreground">Sin información de cliente</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Información Operativa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sucursal:</span>
                            <span>{debitNote.branch.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Código Sucursal:</span>
                            <span className="font-mono">{debitNote.branch.code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Creado por:</span>
                            <span>{debitNote.user.name || debitNote.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de Creación:</span>
                            <span>{formatDate(debitNote.createdAt)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Motivo y Notas */}
            <Card>
                <CardHeader>
                    <CardTitle>Motivo del Cargo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Motivo:</span>
                        <p className="mt-1 whitespace-pre-wrap">{debitNote.reason}</p>
                    </div>
                    {debitNote.notes && (
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Notas adicionales:</span>
                            <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{debitNote.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Totales */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Montos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-medium">{formatCurrency(debitNote.subtotal)}</span>
                        </div>
                        {debitNote.discount > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>Descuento:</span>
                                <span>-{formatCurrency(debitNote.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>ITBIS (18%):</span>
                            <span>{formatCurrency(debitNote.tax)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t pt-2">
                            <span>Total Cargado:</span>
                            <span>{formatCurrency(debitNote.total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Información de Cancelación */}
            {debitNote.status === 'CANCELLED' && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Información de Cancelación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {debitNote.cancelledAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cancelada el:</span>
                                <span>{formatDate(debitNote.cancelledAt)}</span>
                            </div>
                        )}
                        {debitNote.cancellationReason && (
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Motivo de cancelación:</span>
                                <p className="mt-1">{debitNote.cancellationReason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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
                        <AlertDialogCancel disabled={cancelling}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={cancelling || !cancellationReason.trim()}
                            className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600"
                        >
                            {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
