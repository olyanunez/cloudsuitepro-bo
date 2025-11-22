'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, PencilIcon, Send, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseOrderService } from '@/lib/services/purchaseOrderService';
import { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types/purchase-order';
import { usePermissions } from '@/lib/hooks/usePermissions';
import ProtectedPage from '@/components/ProtectedPage';

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { canUpdate } = usePermissions('PURCHASE_ORDERS');
  const [loading, setLoading] = useState(true);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadPurchaseOrder() {
      try {
        setLoading(true);
        const data = await PurchaseOrderService.getPurchaseOrderById(id);
        setPurchaseOrder(data);
      } catch (error: any) {
        console.error('Error loading purchase order:', error);
        toast.error('Error al cargar orden de compra', {
          description: error.message || 'No se pudo cargar la orden de compra',
        });
        router.push('/purchase-orders');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPurchaseOrder();
    }
  }, [id, router]);

  const handleSendToSupplier = async () => {
    if (!purchaseOrder) return;

    const isResend = purchaseOrder.status === PurchaseOrderStatus.SENT;

    try {
      setSending(true);
      await PurchaseOrderService.sendToSupplier(purchaseOrder.id);
      toast.success(
        isResend
          ? 'Orden de compra reenviada al proveedor exitosamente'
          : 'Orden de compra enviada al proveedor exitosamente'
      );
      // Recargar datos
      const data = await PurchaseOrderService.getPurchaseOrderById(id);
      setPurchaseOrder(data);
    } catch (error: any) {
      toast.error('Error al enviar orden de compra', {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const statusConfig: Record<PurchaseOrderStatus, { label: string; className: string }> = {
      [PurchaseOrderStatus.DRAFT]: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      [PurchaseOrderStatus.SENT]: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
      [PurchaseOrderStatus.CONFIRMED]: { label: 'Confirmada', className: 'bg-purple-100 text-purple-800' },
      [PurchaseOrderStatus.RECEIVED]: { label: 'Recibida', className: 'bg-green-100 text-green-800' },
      [PurchaseOrderStatus.PARTIAL]: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800' },
      [PurchaseOrderStatus.CANCELLED]: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return null;
  }

  return (
    <ProtectedPage screenCode="PURCHASE_ORDERS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/purchase-orders">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Orden de Compra {purchaseOrder.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">
                Creada el {new Date(purchaseOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(purchaseOrder.status === PurchaseOrderStatus.DRAFT || purchaseOrder.status === PurchaseOrderStatus.SENT) && canUpdate && (
              <Button
                variant="outline"
                onClick={handleSendToSupplier}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {purchaseOrder.status === PurchaseOrderStatus.SENT ? 'Reenviar a Proveedor' : 'Enviar a Proveedor'}
                  </>
                )}
              </Button>
            )}
            {purchaseOrder.status === PurchaseOrderStatus.DRAFT && canUpdate && (
              <Link href={`/purchase-orders/edit/${purchaseOrder.id}`}>
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Información General */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Información General</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <div className="mt-1">{getStatusBadge(purchaseOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Orden</p>
                  <p className="font-medium">{purchaseOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-medium">{purchaseOrder.supplier?.name}</p>
                  <p className="text-sm text-muted-foreground">{purchaseOrder.supplier?.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Almacén</p>
                  <p className="font-medium">{purchaseOrder.warehouse?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Orden</p>
                  <p className="font-medium">
                    {new Date(purchaseOrder.orderDate).toLocaleDateString()}
                  </p>
                </div>
                {purchaseOrder.expectedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Esperada</p>
                    <p className="font-medium">
                      {new Date(purchaseOrder.expectedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {purchaseOrder.paymentTerms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Términos de Pago</p>
                    <p className="font-medium">{purchaseOrder.paymentTerms}</p>
                  </div>
                )}
                {purchaseOrder.sentAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Enviada el</p>
                    <p className="font-medium">
                      {new Date(purchaseOrder.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {purchaseOrder.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="mt-1">{purchaseOrder.notes}</p>
                </div>
              )}
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Productos</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Código
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Costo Unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Descuento
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {purchaseOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.product?.name}</div>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {item.product?.code}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          ${Number(item.unitCost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {item.discount > 0 ? `-$${Number(item.discount).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Resumen */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Resumen</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${Number(purchaseOrder.subtotal).toFixed(2)}</span>
                </div>
                {purchaseOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuento:</span>
                    <span className="font-medium text-red-600">
                      -${Number(purchaseOrder.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                {purchaseOrder.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuesto:</span>
                    <span className="font-medium">${Number(purchaseOrder.tax).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">
                      ${Number(purchaseOrder.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Proveedor */}
              {purchaseOrder.supplier && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Información del Proveedor</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nombre</p>
                      <p className="font-medium">{purchaseOrder.supplier.name}</p>
                    </div>
                    {purchaseOrder.supplier.email && (
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{purchaseOrder.supplier.email}</p>
                      </div>
                    )}
                    {purchaseOrder.supplier.phone && (
                      <div>
                        <p className="text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{purchaseOrder.supplier.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
