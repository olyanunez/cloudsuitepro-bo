'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Download, Printer } from 'lucide-react';
import { creditNoteService, CreditNote } from '@/lib/services/creditNoteService';
import ncfService, { NcfConfiguration } from '@/lib/services/ncfService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function CreditNoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [ncfConfig, setNcfConfig] = useState<NcfConfiguration | null>(null);

  useEffect(() => {
    loadCreditNote();
    loadNcfConfig();
  }, [params.id]);

  const loadNcfConfig = async () => {
    try {
      const config = await ncfService.getConfiguration();
      setNcfConfig(config);
    } catch (error) {
      console.error('Error loading NCF config:', error);
    }
  };

  const loadCreditNote = async () => {
    try {
      setLoading(true);
      const id = parseInt(params.id as string);
      const data = await creditNoteService.getById(id);
      setCreditNote(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error cargando nota de crédito', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (!creditNote) {
    return <div className="flex items-center justify-center h-96">Nota de crédito no encontrada</div>;
  }

  const getRefundMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
      STORE_CREDIT: 'Crédito en Tienda',
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="self-start">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">NC {creditNote.creditNoteNumber}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {creditNote.fiscalType === 'FISCAL' ? 'Devolución Fiscal con NCF B04' : 'Devolución Interna sin NCF'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Descargar PDF</span>
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Nota de Crédito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número NC:</span>
              <span className="font-medium">{creditNote.creditNoteNumber}</span>
            </div>
            {creditNote.ncf && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NCF B04:</span>
                  <span className="font-mono font-medium">{creditNote.ncf}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Válido hasta:</span>
                  <span>{creditNote.ncfValidUntil ? formatDate(creditNote.ncfValidUntil) : 'N/A'}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              {creditNote.fiscalType === 'FISCAL' ? (
                <Badge variant="default">Fiscal (Con NCF B04)</Badge>
              ) : (
                <Badge variant="secondary">Interna (Sin NCF)</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span>{formatDate(creditNote.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge>{creditNote.status}</Badge>
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
              <span className="font-medium">{creditNote.originalInvoiceNumber}</span>
            </div>
            {creditNote.originalNcf && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">NCF Original:</span>
                <span className="font-mono">{creditNote.originalNcf}</span>
              </div>
            )}
            {creditNote.originalInvoice && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Original:</span>
                  <span>{formatCurrency(creditNote.originalInvoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Original:</span>
                  <span>{formatDate(creditNote.originalInvoice.createdAt)}</span>
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
            {creditNote.customer ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">
                    {creditNote.customer.name} {creditNote.customer.lastName}
                  </span>
                </div>
                {creditNote.customer.taxId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RNC/Cédula:</span>
                    <span>{creditNote.customer.taxId}</span>
                  </div>
                )}
                {creditNote.customer.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{creditNote.customer.email}</span>
                  </div>
                )}
                {creditNote.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span>{creditNote.customer.phone}</span>
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
            <CardTitle>Detalles del Reembolso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método:</span>
              <Badge variant="outline">{getRefundMethodLabel(creditNote.refundMethod)}</Badge>
            </div>
            {creditNote.refundReference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referencia:</span>
                <span className="font-mono">{creditNote.refundReference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span>{creditNote.returnType === 'FULL' ? 'Devolución Total' : 'Devolución Parcial'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sucursal:</span>
              <span>{creditNote.branch.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Almacén:</span>
              <span>{creditNote.warehouse.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Razón y Notas */}
      {(creditNote.reason || creditNote.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Razón y Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {creditNote.reason && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Razón de la devolución:</span>
                <p className="mt-1">{creditNote.reason}</p>
              </div>
            )}
            {creditNote.notes && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Notas adicionales:</span>
                <p className="mt-1">{creditNote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items Devueltos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Devueltos</CardTitle>
          <CardDescription>{creditNote.items.length} {creditNote.items.length === 1 ? 'producto' : 'productos'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">ITBIS</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditNote.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.variant.product.code}</TableCell>
                  <TableCell>
                    <div>{item.variant.product.name}</div>
                    {item.variant.name && (
                      <div className="text-sm text-muted-foreground">{item.variant.name}</div>
                    )}
                    {item.reason && (
                      <div className="text-xs text-muted-foreground">Razón: {item.reason}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.tax)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <span className="font-medium">{formatCurrency(creditNote.subtotal)}</span>
            </div>
            {creditNote.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Descuento:</span>
                <span>-{formatCurrency(creditNote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>ITBIS ({ncfConfig?.itbisRate || 18}%):</span>
              <span>{formatCurrency(creditNote.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total Reembolsado:</span>
              <span>{formatCurrency(creditNote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
