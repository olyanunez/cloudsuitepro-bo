'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseOrderService } from '@/lib/services/purchaseOrderService';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  ReceivePurchaseOrderInput,
  ReceivePurchaseOrderItem
} from '@/lib/types/purchase-order';
import ProtectedPage from '@/components/ProtectedPage';

export default function ReceivePurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [receiving, setReceiving] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const [formData, setFormData] = useState({
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [receivedItems, setReceivedItems] = useState<ReceivePurchaseOrderItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orderData = await PurchaseOrderService.getPurchaseOrderById(id);
        setPurchaseOrder(orderData);

        // Verificar que la orden puede ser recibida
        if (!['SENT', 'CONFIRMED', 'PARTIAL'].includes(orderData.status)) {
          toast.error('Solo se pueden recibir órdenes enviadas, confirmadas o parcialmente recibidas');
          router.push(`/purchase-orders/${id}`);
          return;
        }

        // Inicializar items para recepción
        if (orderData.items && orderData.items.length > 0) {
          setReceivedItems(
            orderData.items.map((item) => ({
              purchaseOrderItemId: item.id,
              receivedQuantity: 0, // Iniciar en 0, el usuario decide cuánto recibir
              batchNumber: '',
              expirationDate: '',
              notes: '',
            }))
          );
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar la orden de compra');
        router.push('/purchase-orders');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof ReceivePurchaseOrderItem, value: any) => {
    const newItems = [...receivedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceivedItems(newItems);

    // Clear error for this item if exists
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`item_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const getOrderItem = (purchaseOrderItemId: number): PurchaseOrderItem | undefined => {
    return purchaseOrder?.items?.find(item => item.id === purchaseOrderItemId);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Verificar que al menos un item tiene cantidad recibida > 0
    const hasReceivedItems = receivedItems.some(item => item.receivedQuantity > 0);
    if (!hasReceivedItems) {
      newErrors.items = 'Debe recibir al menos un producto';
      toast.error('Debe recibir al menos un producto');
    }

    // Validar cada item que tiene cantidad recibida
    receivedItems.forEach((receivedItem, index) => {
      if (receivedItem.receivedQuantity > 0) {
        const orderItem = getOrderItem(receivedItem.purchaseOrderItemId);
        if (orderItem) {
          const pendingQty = orderItem.quantity - orderItem.receivedQty;

          if (receivedItem.receivedQuantity > pendingQty) {
            newErrors[`item_${index}_receivedQuantity`] =
              `No puede recibir más de ${pendingQty} unidades (cantidad pendiente)`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filtrar solo los items con cantidad recibida > 0
    const itemsToReceive = receivedItems.filter(item => item.receivedQuantity > 0);

    const receiveData: ReceivePurchaseOrderInput = {
      items: itemsToReceive,
      receivedDate: formData.receivedDate || undefined,
      notes: formData.notes || undefined,
    };

    try {
      setReceiving(true);
      const result = await PurchaseOrderService.receivePurchaseOrder(id, receiveData);

      // Verificar si hay advertencia de NCF B11
      if ((result as any)?._ncfWarning) {
        toast.warning((result as any)._ncfWarning, {
          duration: 8000,
        });
      }

      toast.success('Orden de compra recibida exitosamente');
      router.push(`/purchase-orders/${id}`);
    } catch (error: any) {
      console.error('Error receiving purchase order:', error);
      toast.error('Error al recibir la orden de compra', {
        description: error.message || 'No se pudo procesar la recepción',
      });
    } finally {
      setReceiving(false);
    }
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
    <ProtectedPage screenCode="PURCHASE_ORDERS" requiredPermission="UPDATE">
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center">
          <Link href={`/purchase-orders/${id}`}>
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Recibir Orden de Compra</h1>
            <p className="text-sm text-muted-foreground">
              {purchaseOrder.orderNumber} - {purchaseOrder.supplier?.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productos para Recibir */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Productos a Recibir</h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Producto
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Ordenado
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Recibido
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Pendiente
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Recibir Ahora
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Lote
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          Vencimiento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {receivedItems.map((receivedItem, index) => {
                        const orderItem = getOrderItem(receivedItem.purchaseOrderItemId);
                        if (!orderItem) return null;

                        const pendingQty = orderItem.quantity - orderItem.receivedQty;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <div>
                                <div className="font-medium">{orderItem.variant.product.name}</div>
                                {orderItem.variant.name && (
                                  <div className="text-sm text-muted-foreground">{orderItem.variant.name}</div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  SKU: {orderItem.variant.sku}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="font-medium">{orderItem.quantity}</span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="text-green-600 dark:text-green-400">
                                {orderItem.receivedQty}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="text-orange-600 dark:text-orange-400 font-medium">
                                {pendingQty}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                max={pendingQty}
                                value={receivedItem.receivedQuantity}
                                onChange={(e) =>
                                  handleItemChange(index, 'receivedQuantity', Number(e.target.value))
                                }
                                className={`w-24 ${errors[`item_${index}_receivedQuantity`] ? 'border-red-500' : ''
                                  }`}
                              />
                              {errors[`item_${index}_receivedQuantity`] && (
                                <p className="mt-1 text-xs text-red-500">
                                  {errors[`item_${index}_receivedQuantity`]}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                placeholder="Opcional"
                                value={receivedItem.batchNumber}
                                onChange={(e) =>
                                  handleItemChange(index, 'batchNumber', e.target.value)
                                }
                                className="w-32"
                                disabled={receivedItem.receivedQuantity === 0}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="date"
                                value={receivedItem.expirationDate}
                                onChange={(e) =>
                                  handleItemChange(index, 'expirationDate', e.target.value)
                                }
                                className="w-40"
                                disabled={receivedItem.receivedQuantity === 0}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Información de Recepción */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Información de Recepción</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="receivedDate" className="block text-sm font-medium mb-1">
                      Fecha de Recepción
                    </label>
                    <Input
                      type="date"
                      id="receivedDate"
                      name="receivedDate"
                      value={formData.receivedDate}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-1">
                      Notas de Recepción
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Notas sobre la recepción..."
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Información Importante
                  </h3>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Puede recibir parcialmente los productos</li>
                    <li>• El número de lote es opcional</li>
                    <li>• La fecha de vencimiento es opcional</li>
                    <li>• Se creará un movimiento de inventario automáticamente</li>
                  </ul>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    type="submit"
                    disabled={receiving}
                    className="w-full"
                    style={{ backgroundColor: '#16a34a', color: 'white' }}
                  >
                    {receiving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <PackageIcon className="mr-2 h-4 w-4" />
                        Confirmar Recepción
                      </>
                    )}
                  </Button>
                  <Link href={`/purchase-orders/${id}`} className="block">
                    <Button type="button" variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedPage>
  );
}
