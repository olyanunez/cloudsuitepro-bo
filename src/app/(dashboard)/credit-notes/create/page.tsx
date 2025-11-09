'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, ArrowLeft, Plus, Minus } from 'lucide-react';
import { creditNoteService, CreateCreditNoteDto, ReturnType, RefundMethod } from '@/lib/services/creditNoteService';
import { invoiceService } from '@/lib/services/invoiceService';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface InvoiceItem {
  id: number;
  productId: number;
  product: { code: string; name: string };
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  ncf?: string;
  customerId?: number;
  customer?: { name: string; lastName?: string; taxId?: string };
  branchId: number;
  warehouseId: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: InvoiceItem[];
}

interface ReturnItem {
  originalItemId: number;
  productId: number;
  productName: string;
  maxQuantity: number;
  quantityToReturn: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

export default function CreateCreditNotePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(RefundMethod.CASH);
  const [refundReference, setRefundReference] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const searchInvoice = async () => {
    if (!invoiceNumber.trim()) {
      toast({ title: 'Error', description: 'Ingrese un número de factura', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const invoices = await invoiceService.getAll({ invoiceNumber: invoiceNumber.trim(), limit: 1 });

      if (invoices.data.length === 0) {
        toast({ title: 'No encontrada', description: 'No se encontró la factura', variant: 'destructive' });
        return;
      }

      const foundInvoice = invoices.data[0] as any;
      setInvoice(foundInvoice);

      // Inicializar items para devolución
      const items: ReturnItem[] = foundInvoice.items.map((item: InvoiceItem) => ({
        originalItemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        maxQuantity: item.quantity,
        quantityToReturn: 0,
        unitPrice: parseFloat(item.unitPrice.toString()),
        discount: parseFloat(item.discount.toString()),
        tax: parseFloat(item.tax.toString()) / item.quantity,
      }));
      setReturnItems(items);

      toast({ title: 'Éxito', description: 'Factura encontrada' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error buscando factura', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...returnItems];
    const item = newItems[index];

    if (quantity < 0) quantity = 0;
    if (quantity > item.maxQuantity) quantity = item.maxQuantity;

    newItems[index].quantityToReturn = quantity;
    setReturnItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    returnItems.forEach(item => {
      if (item.quantityToReturn > 0) {
        const itemSubtotal = item.unitPrice * item.quantityToReturn;
        const itemDiscount = item.discount * item.quantityToReturn;
        const itemTax = item.tax * item.quantityToReturn;

        subtotal += itemSubtotal;
        discount += itemDiscount;
        tax += itemTax;
      }
    });

    const total = subtotal - discount + tax;
    return { subtotal, tax, discount, total };
  };

  const handleSubmit = async () => {
    if (!invoice) {
      toast({ title: 'Error', description: 'Debe buscar una factura primero', variant: 'destructive' });
      return;
    }

    const itemsToReturn = returnItems.filter(item => item.quantityToReturn > 0);

    if (itemsToReturn.length === 0) {
      toast({ title: 'Error', description: 'Debe seleccionar al menos un producto para devolver', variant: 'destructive' });
      return;
    }

    const totals = calculateTotals();

    const dto: CreateCreditNoteDto = {
      originalInvoiceId: invoice.id,
      returnType: itemsToReturn.length === returnItems.length &&
                  itemsToReturn.every((item, idx) => item.quantityToReturn === item.maxQuantity)
                  ? ReturnType.FULL
                  : ReturnType.PARTIAL,
      refundMethod,
      refundReference: refundReference || undefined,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      reason: reason || undefined,
      notes: notes || undefined,
      items: itemsToReturn.map(item => ({
        originalInvoiceItemId: item.originalItemId,
        productId: item.productId,
        quantity: item.quantityToReturn,
        unitPrice: item.unitPrice,
        discount: item.discount * item.quantityToReturn,
        subtotal: item.unitPrice * item.quantityToReturn,
        tax: item.tax * item.quantityToReturn,
        total: (item.unitPrice * item.quantityToReturn) - (item.discount * item.quantityToReturn) + (item.tax * item.quantityToReturn),
      })),
    };

    try {
      setSubmitting(true);
      const result = await creditNoteService.create(dto);
      toast({
        title: 'Éxito',
        description: `Nota de crédito ${result.creditNoteNumber} creada exitosamente` +
                    (result.ncf ? ` con NCF B04: ${result.ncf}` : '')
      });
      router.push('/credit-notes');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error creando nota de crédito', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Devolución</h1>
          <p className="text-muted-foreground">Procesar devolución y generar nota de crédito</p>
        </div>
      </div>

      {/* Buscar Factura */}
      <Card>
        <CardHeader>
          <CardTitle>1. Buscar Factura</CardTitle>
          <CardDescription>Ingrese el número de factura a devolver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Número de factura (ej: INV-00001)"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchInvoice()}
              />
            </div>
            <Button onClick={searchInvoice} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {invoice && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Factura:</strong> {invoice.invoiceNumber}</div>
                <div><strong>NCF:</strong> {invoice.ncf || 'Sin NCF'}</div>
                <div><strong>Cliente:</strong> {invoice.customer ? `${invoice.customer.name} ${invoice.customer.lastName || ''}` : 'N/A'}</div>
                <div><strong>Total:</strong> {formatCurrency(invoice.total)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seleccionar Items */}
      {invoice && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>2. Seleccionar Productos a Devolver</CardTitle>
              <CardDescription>Indique la cantidad de cada producto a devolver</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        Precio: {formatCurrency(item.unitPrice)} | Disponible: {item.maxQuantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(index, item.quantityToReturn - 1)}
                        disabled={item.quantityToReturn === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        max={item.maxQuantity}
                        value={item.quantityToReturn}
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(index, item.quantityToReturn + 1)}
                        disabled={item.quantityToReturn >= item.maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detalles de Reembolso */}
          <Card>
            <CardHeader>
              <CardTitle>3. Detalles del Reembolso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Método de Reembolso</Label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as RefundMethod)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value={RefundMethod.CASH}>Efectivo</option>
                    <option value={RefundMethod.CARD}>Tarjeta</option>
                    <option value={RefundMethod.TRANSFER}>Transferencia</option>
                    <option value={RefundMethod.STORE_CREDIT}>Crédito en Tienda</option>
                  </select>
                </div>

                {(refundMethod === RefundMethod.CARD || refundMethod === RefundMethod.TRANSFER) && (
                  <div className="space-y-2">
                    <Label>Referencia de Reembolso</Label>
                    <Input
                      placeholder="Voucher, número de transferencia..."
                      value={refundReference}
                      onChange={(e) => setRefundReference(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Razón de la Devolución</Label>
                <Input
                  placeholder="Producto defectuoso, talla incorrecta, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notas Adicionales (Opcional)</Label>
                <Textarea
                  placeholder="Información adicional sobre la devolución..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Devolución</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(totals.discount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>ITBIS:</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total a Reembolsar:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || totals.total === 0}>
                  {submitting ? 'Procesando...' : 'Procesar Devolución'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
