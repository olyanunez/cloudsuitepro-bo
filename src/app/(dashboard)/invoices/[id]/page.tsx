'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Invoice, InvoiceService } from '@/lib/services/invoiceService';
import { TenantService, Tenant } from '@/lib/services/tenantService';
import TenantSettingsService, { TenantSettings } from '@/lib/services/tenantSettingsService';
import ncfService, { NcfConfiguration } from '@/lib/services/ncfService';
import { printInvoice } from '@/lib/utils/invoicePrint';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  FileTextIcon,
  UserIcon,
  BuildingIcon,
  PackageIcon,
  CreditCardIcon,
  CalendarIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  XCircleIcon,
  PrinterIcon
} from 'lucide-react';
import Link from 'next/link';
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

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  const invoiceId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<Tenant | null>(null);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [ncfConfig, setNcfConfig] = useState<NcfConfiguration | null>(null);

  useEffect(() => {
    loadInvoice();
    loadTenantInfo();
    loadTenantSettings();
    loadNcfConfig();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await InvoiceService.getInvoice(invoiceId);
      console.log('Factura cargada:', data);
      setInvoice(data);
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo cargar la factura';
      toast.error('Error al cargar la factura', {
        description: errorMessage,
      });
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadTenantInfo = async () => {
    try {
      const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
      if (tenantId) {
        const tenant = await TenantService.getTenantById(tenantId);
        setTenantInfo(tenant);
      }
    } catch (error) {
      console.error('Error loading tenant information:', error);
    }
  };

  const loadTenantSettings = async () => {
    try {
      const settings = await TenantSettingsService.getSettings();
      setTenantSettings(settings);
    } catch (error) {
      console.error('Error loading tenant settings:', error);
    }
  };

  const loadNcfConfig = async () => {
    try {
      const config = await ncfService.getConfiguration();
      setNcfConfig(config);
    } catch (error) {
      console.error('Error loading NCF configuration:', error);
    }
  };

  const handleCancelInvoice = async () => {
    try {
      await InvoiceService.cancelInvoice(invoiceId);
      toast.success('Factura anulada exitosamente');
      setIsCancelDialogOpen(false);
      loadInvoice(); // Reload to show updated status
    } catch (error: any) {
      console.error('Error voiding invoice:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo anular la factura';
      toast.error('Error al anular la factura', {
        description: errorMessage,
      });
    }
  };

  const handlePrint = () => {
    if (!invoice) return;

    try {
      // Determinar si el cliente está exento de impuestos basado en el tipo de NCF
      const isExempt = invoice.ncfType === 'B14' ||
        invoice.ncfType === 'B15' ||
        invoice.ncfType === 'B16';

      // Determinar razón de exención basada en el tipo de NCF
      const exemptionReason = isExempt
        ? invoice.ncfType === 'B16'
          ? 'Cliente exportador - NCF tipo B16 (Art. 343 Código Tributario)'
          : invoice.ncfType === 'B15'
            ? 'Entidad gubernamental - NCF tipo B15 (Art. 343 Código Tributario)'
            : 'Régimen especial - NCF tipo B14 (Art. 343 Código Tributario)'
        : undefined;

      printInvoice({
        invoice,
        tenantInfo,
        itbisRate: ncfConfig?.itbisRate || 18,
        includeLogo: tenantSettings?.includeLogo ?? true,
        invoiceFooter: tenantSettings?.invoiceFooter || undefined,
        termsAndConditions: tenantSettings?.termsAndConditions || undefined,
        isExemptFromTax: isExempt,
        taxExemptionReason: exemptionReason,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al imprimir la factura');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8">
        <p>Factura no encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center">
          <Link href="/invoices" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Factura</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          {invoice.status !== 'VOIDED' && invoice.status !== 'CANCELLED' && (
            <Button
              variant="destructive"
              onClick={() => setIsCancelDialogOpen(true)}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              <XCircleIcon className="mr-2 h-4 w-4" />
              Anular Factura
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileTextIcon className="mr-2 h-5 w-5" />
              Información de la Factura
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${InvoiceService.getStatusColor(invoice.status)}`}>
              {InvoiceService.formatStatus(invoice.status)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Número de Factura</p>
              <p className="text-base font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                Fecha de Creación
              </p>
              <p className="text-base">
                {new Date(invoice.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <CreditCardIcon className="mr-1 h-4 w-4" />
                Método de Pago
              </p>
              <p className="text-base">{InvoiceService.formatPaymentMethod(invoice.paymentMethod)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer and Branch Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
              <p className="text-base font-semibold">
                {invoice.customer
                  ? `${invoice.customer.name}${invoice.customer.lastName ? ` ${invoice.customer.lastName}` : ''}`
                  : 'Sin cliente'}
              </p>
            </div>
            {invoice.customer?.email && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-base">{invoice.customer.email}</p>
              </div>
            )}
            {invoice.customer?.phone && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                <p className="text-base">{invoice.customer.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branch and Warehouse Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingIcon className="mr-2 h-5 w-5" />
              Sucursal y Almacén
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sucursal</p>
              <p className="text-base font-semibold">
                {invoice.branch?.name || 'Sin sucursal'}
                {invoice.branch?.code && (
                  <span className="text-sm text-gray-500 ml-2">({invoice.branch.code})</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Almacén</p>
              <p className="text-base">{invoice.warehouse?.name || 'Sin almacén'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vendedor</p>
              <p className="text-base">
                {invoice.user?.name || invoice.user?.email || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCartIcon className="mr-2 h-5 w-5" />
            Productos ({invoice.items?.length || 0} artículos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Impuesto
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.variant?.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.variant?.product?.name || 'Producto sin nombre'}
                          {item.variant?.name && ` - ${item.variant.name}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Código: {item.variant?.product?.code || 'N/A'}
                        </div>
                        {item.variant?.product?.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.variant.product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {InvoiceService.formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {InvoiceService.formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {InvoiceService.formatCurrency(item.discount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {InvoiceService.formatCurrency(item.tax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {InvoiceService.formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay productos en esta factura
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSignIcon className="mr-2 h-5 w-5" />
            Totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-base text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-base font-medium">{InvoiceService.formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-base text-gray-600 dark:text-gray-400">Descuento:</span>
              <span className="text-base font-medium text-red-600 dark:text-red-400">
                -{InvoiceService.formatCurrency(invoice.discount)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-base text-gray-600 dark:text-gray-400">Impuestos:</span>
              <span className="text-base font-medium">{InvoiceService.formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {InvoiceService.formatCurrency(invoice.total)}
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notas:</p>
              <p className="text-base text-gray-900 dark:text-white">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Void Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular esta factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción anulará la factura {invoice.invoiceNumber}. Esta operación no se puede deshacer.
              El inventario será restaurado automáticamente.
              <br /><br />
              <strong>Nota:</strong> Solo se pueden anular facturas del mismo día, sin NCF y sin pagos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvoice} className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600">
              Confirmar Anulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
