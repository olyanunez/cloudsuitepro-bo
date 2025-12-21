'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { debitNoteService, CreateDebitNoteDto } from '@/lib/services/debitNoteService';
import { invoiceService, Invoice } from '@/lib/services/invoiceService';
import { toast } from 'sonner';
import { Plus, Search, DollarSign, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CreateDebitNoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateDebitNoteDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateDebitNoteDialogProps) {
    const [loading, setLoading] = useState(false);
    const [searchingInvoice, setSearchingInvoice] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [invoiceSearch, setInvoiceSearch] = useState('');

    // Form fields
    const [subtotal, setSubtotal] = useState('');
    const [tax, setTax] = useState('');
    const [discount, setDiscount] = useState('0');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    const total =
        parseFloat(subtotal || '0') +
        parseFloat(tax || '0') -
        parseFloat(discount || '0');

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setSelectedInvoice(null);
        setInvoiceSearch('');
        setSubtotal('');
        setTax('');
        setDiscount('0');
        setReason('');
        setNotes('');
    };

    const handleSearchInvoice = async () => {
        if (!invoiceSearch.trim()) {
            toast.error('Ingrese un número de factura o NCF');
            return;
        }

        setSearchingInvoice(true);
        try {
            const response = await invoiceService.getAll({
                invoiceNumber: invoiceSearch.startsWith('INV-') ? invoiceSearch : undefined,
                ncf: invoiceSearch.startsWith('E') ? invoiceSearch : undefined,
                limit: 1,
            });

            if (response.data.length === 0) {
                toast.error('Factura no encontrada');
                return;
            }

            const invoice = response.data[0];

            if (invoice.status === 'CANCELLED') {
                toast.error('No se puede crear una nota de débito para una factura cancelada');
                return;
            }

            setSelectedInvoice(invoice);
            toast.success('Factura encontrada');
        } catch (error) {
            console.error('Error searching invoice:', error);
            toast.error('Error al buscar la factura');
        } finally {
            setSearchingInvoice(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedInvoice) {
            toast.error('Debe seleccionar una factura');
            return;
        }

        if (!reason.trim()) {
            toast.error('Debe especificar un motivo');
            return;
        }

        if (parseFloat(subtotal) <= 0) {
            toast.error('El subtotal debe ser mayor a cero');
            return;
        }

        if (total <= 0) {
            toast.error('El total debe ser mayor a cero');
            return;
        }

        setLoading(true);
        try {
            const dto: CreateDebitNoteDto = {
                originalInvoiceId: selectedInvoice.id,
                subtotal: parseFloat(subtotal),
                tax: parseFloat(tax || '0'),
                discount: parseFloat(discount || '0'),
                total: total,
                reason: reason.trim(),
                notes: notes.trim() || undefined,
            };

            await debitNoteService.create(dto);
            toast.success('Nota de débito creada exitosamente');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error creating debit note:', error);
            toast.error(error?.message || 'Error al crear la nota de débito');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Nueva Nota de Débito
                        </DialogTitle>
                        <DialogDescription>
                            Cree un cargo adicional a una factura existente. Se generará automáticamente un NCF B03.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Búsqueda de Factura */}
                        <div className="grid gap-2">
                            <Label>Factura Original *</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="INV-00001 o NCF..."
                                        value={invoiceSearch}
                                        onChange={(e) => setInvoiceSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchInvoice())}
                                        className="pl-8"
                                        disabled={!!selectedInvoice}
                                    />
                                </div>
                                {!selectedInvoice ? (
                                    <Button
                                        type="button"
                                        onClick={handleSearchInvoice}
                                        disabled={searchingInvoice}
                                    >
                                        {searchingInvoice ? 'Buscando...' : 'Buscar'}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedInvoice(null);
                                            setInvoiceSearch('');
                                        }}
                                    >
                                        Cambiar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Información de la Factura Seleccionada */}
                        {selectedInvoice && (
                            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="h-4 w-4" />
                                    Factura: {selectedInvoice.invoiceNumber}
                                </div>
                                {selectedInvoice.ncf && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                        NCF: {selectedInvoice.ncf}
                                    </p>
                                )}
                                {selectedInvoice.customer && (
                                    <p className="text-sm">
                                        Cliente: {selectedInvoice.customer.name} {selectedInvoice.customer.lastName}
                                    </p>
                                )}
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">Total Factura:</span>
                                    <span className="text-sm font-medium">{formatCurrency(selectedInvoice.total)}</span>
                                </div>
                                {selectedInvoice.balanceDue !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Saldo Pendiente:</span>
                                        <span className="text-sm font-medium">{formatCurrency(selectedInvoice.balanceDue)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Montos */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="subtotal">Subtotal *</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="subtotal"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={subtotal}
                                        onChange={(e) => setSubtotal(e.target.value)}
                                        className="pl-8"
                                        disabled={!selectedInvoice}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tax">ITBIS</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="tax"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={tax}
                                        onChange={(e) => setTax(e.target.value)}
                                        className="pl-8"
                                        disabled={!selectedInvoice}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="discount">Descuento</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="discount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="pl-8"
                                        disabled={!selectedInvoice}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Total Calculado */}
                        {selectedInvoice && subtotal && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total a Cargar:</span>
                                    <span className="text-lg font-bold">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        )}

                        {/* Motivo */}
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo del Cargo *</Label>
                            <Textarea
                                id="reason"
                                placeholder="Ej: Cargos por envío, intereses por mora, servicios adicionales..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                disabled={!selectedInvoice}
                                required
                            />
                        </div>

                        {/* Notas Adicionales */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Información adicional sobre el cargo..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                disabled={!selectedInvoice}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedInvoice}
                        >
                            {loading ? 'Creando...' : 'Crear Nota de Débito'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
