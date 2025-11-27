'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '@/lib/services/apiService';
import { PurchaseOrderService } from '@/lib/services/purchaseOrderService';
import { PurchaseOrder, UpdatePurchaseOrderInput, CreatePurchaseOrderItemInput } from '@/lib/types/purchase-order';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Supplier {
  id: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  paymentTerms?: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  cost: number;
  barcode?: string;
}

interface ProductVariant {
  id: number;
  productId: number;
  name: string | null;
  sku: string;
  cost: number;
  price: number;
  stock: number;
  images?: {
    id: number;
    url: string;
    isPrimary: boolean;
    order: number;
  }[];
}

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    warehouseId: '',
    expectedDate: '',
    paymentTerms: '',
    notes: '',
  });

  const [items, setItems] = useState<CreatePurchaseOrderItemInput[]>([
    {
      variantId: 0,
      quantity: 1,
      unitCost: 0,
      discount: 0,
      tax: 0,
      notes: '',
    },
  ]);

  // Track selected variant IDs for display purposes
  const [selectedVariants, setSelectedVariants] = useState<Map<number, string>>(new Map());

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [suppliersData, warehousesData, productsData, variantsData, orderData] = await Promise.all([
          apiGet<Supplier[]>('/suppliers/active'),
          apiGet<Warehouse[]>('/warehouses'),
          apiGet<Product[]>('/products'),
          apiGet<ProductVariant[]>('/product-variants'),
          PurchaseOrderService.getPurchaseOrderById(id),
        ]);

        setSuppliers(suppliersData);
        setWarehouses(warehousesData);
        setProducts(productsData);
        setAllVariants(variantsData);
        setPurchaseOrder(orderData);

        // Verificar que la orden puede ser editada
        if (orderData.status !== 'DRAFT') {
          toast.error('Solo se pueden editar órdenes en estado borrador');
          router.push(`/purchase-orders/${id}`);
          return;
        }

        // Cargar datos del formulario
        setFormData({
          supplierId: orderData.supplierId.toString(),
          warehouseId: orderData.warehouseId.toString(),
          expectedDate: orderData.expectedDate
            ? new Date(orderData.expectedDate).toISOString().split('T')[0]
            : '',
          paymentTerms: orderData.paymentTerms || '',
          notes: orderData.notes || '',
        });

        // Cargar items
        if (orderData.items && orderData.items.length > 0) {
          const loadedItems = orderData.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitCost: Number(item.unitCost),
            discount: Number(item.discount),
            tax: Number(item.tax),
            notes: item.notes || '',
          }));
          setItems(loadedItems);

          // Initialize selectedVariants Map for display
          const newSelectedVariants = new Map<number, string>();
          loadedItems.forEach((item, index) => {
            if (item.variantId > 0) {
              newSelectedVariants.set(index, `variant-${item.variantId}`);
            }
          });
          setSelectedVariants(newSelectedVariants);
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos');
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

  const handleSupplierChange = (value: string) => {
    setFormData(prev => ({ ...prev, supplierId: value }));
    const supplier = suppliers.find(s => s.id.toString() === value);
    if (supplier?.paymentTerms && !formData.paymentTerms) {
      setFormData(prev => ({ ...prev, paymentTerms: supplier.paymentTerms || '' }));
    }
    if (errors.supplierId) {
      setErrors(prev => ({ ...prev, supplierId: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof CreatePurchaseOrderItemInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Si cambió el producto/variante, actualizar el costo unitario
    if (field === 'variantId') {
      const valueStr = String(value);
      const newSelectedVariants = new Map(selectedVariants);

      // The value is always a variant ID (format: "variant-{id}")
      if (valueStr.startsWith('variant-')) {
        const variantId = Number(valueStr.replace('variant-', ''));
        const variant = allVariants.find(v => v.id === variantId);
        if (variant) {
          // Use variant cost
          newItems[index].unitCost = Number(variant.cost || 0);
          // Store the variantId
          newItems[index].variantId = variantId;
          // Track the variant selection for display
          newSelectedVariants.set(index, valueStr);
        }
      }

      setSelectedVariants(newSelectedVariants);
    }

    setItems(newItems);
  };

  const getDisplayInfoForItem = (index: number) => {
    const item = items[index];
    const selectedKey = selectedVariants.get(index);

    if (selectedKey && selectedKey.startsWith('variant-')) {
      const variantId = Number(selectedKey.replace('variant-', ''));
      const variant = allVariants.find(v => v.id === variantId);
      if (variant) {
        const product = products.find(p => p.id === variant.productId);
        const variantImages = variant.images || [];
        const variantPrimaryImage = variantImages.find(img => img.isPrimary) || variantImages[0];
        return {
          name: product?.name || 'Producto',
          variantName: variant.name,
          sku: variant.sku,
          image: variantPrimaryImage?.url,
        };
      }
    } else if (item.variantId > 0) {
      const variant = allVariants.find(v => v.id === item.variantId);
      if (variant) {
        const product = products.find(p => p.id === variant.productId);
        const variantImages = variant.images || [];
        const variantPrimaryImage = variantImages.find(img => img.isPrimary) || variantImages[0];
        return {
          name: product?.name || 'Producto',
          variantName: variant.name,
          sku: variant.sku,
          image: variantPrimaryImage?.url,
        };
      }
    }

    return null;
  };

  const addItem = () => {
    setItems([...items, {
      variantId: 0,
      quantity: 1,
      unitCost: 0,
      discount: 0,
      tax: 0,
      notes: '',
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const calculateItemTotal = (item: CreatePurchaseOrderItemInput) => {
    const subtotal = item.quantity * item.unitCost;
    const discount = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;
    return subtotal - discount + tax;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(item => {
      if (item.variantId > 0) {
        subtotal += item.quantity * item.unitCost;
        totalDiscount += Number(item.discount) || 0;
        totalTax += Number(item.tax) || 0;
      }
    });

    const total = subtotal - totalDiscount + totalTax;

    return { subtotal, totalDiscount, totalTax, total };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Debe seleccionar un proveedor';
    }

    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Debe seleccionar un almacén';
    }

    const validItems = items.filter(item => item.variantId > 0);
    if (validItems.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto';
      toast.error('Debe agregar al menos un producto');
    }

    // Validar que todos los items tengan cantidad > 0
    validItems.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.unitCost <= 0) {
        newErrors[`item_${index}_unitCost`] = 'El costo debe ser mayor a 0';
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

    const validItems = items.filter(item => item.variantId > 0);

    const purchaseOrderData: UpdatePurchaseOrderInput = {
      supplierId: Number(formData.supplierId),
      warehouseId: Number(formData.warehouseId),
      expectedDate: formData.expectedDate || undefined,
      paymentTerms: formData.paymentTerms || undefined,
      notes: formData.notes || undefined,
      items: validItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        discount: item.discount || 0,
        tax: item.tax || 0,
        notes: item.notes || undefined,
      })),
    };

    try {
      setSaving(true);
      await PurchaseOrderService.updatePurchaseOrder(id, purchaseOrderData);
      toast.success('Orden de compra actualizada exitosamente');
      router.push('/purchase-orders');
    } catch (error: any) {
      console.error('Error updating purchase order:', error);
      toast.error('Error al actualizar orden de compra', {
        description: error.message || 'No se pudo actualizar la orden de compra',
      });
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

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
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href={`/purchase-orders/${id}`}>
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Orden de Compra</h1>
          <p className="text-sm text-muted-foreground">Número: {purchaseOrder.orderNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Información General</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="supplierId" className="block text-sm font-medium mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={handleSupplierChange}
                  >
                    <SelectTrigger className={errors.supplierId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name} ({supplier.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && (
                    <p className="mt-1 text-sm text-red-500">{errors.supplierId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="warehouseId" className="block text-sm font-medium mb-1">
                    Almacén <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, warehouseId: value }));
                      if (errors.warehouseId) {
                        setErrors(prev => ({ ...prev, warehouseId: '' }));
                      }
                    }}
                  >
                    <SelectTrigger className={errors.warehouseId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar almacén" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.warehouseId && (
                    <p className="mt-1 text-sm text-red-500">{errors.warehouseId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expectedDate" className="block text-sm font-medium mb-1">
                    Fecha Esperada
                  </label>
                  <Input
                    type="date"
                    id="expectedDate"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="paymentTerms" className="block text-sm font-medium mb-1">
                    Términos de Pago
                  </label>
                  <Input
                    type="text"
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    placeholder="Ej: Net 30"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Notas adicionales sobre la orden"
                />
              </div>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Productos</h2>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Producto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Cantidad
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Costo Unit.
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Descuento
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Total
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item, index) => {
                      const displayInfo = getDisplayInfoForItem(index);
                      const selectedKey = selectedVariants.get(index) || (item.variantId > 0 ? `variant-${item.variantId}` : undefined);

                      return (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <Select
                            value={selectedKey}
                            onValueChange={(value) => handleItemChange(index, 'variantId', value)}
                          >
                            <SelectTrigger className="w-full min-w-[280px]">
                              {displayInfo ? (
                                <div className="flex items-center gap-2 w-full">
                                  {displayInfo.image ? (
                                    <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                      <Image
                                        src={displayInfo.image}
                                        alt={displayInfo.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                      <ImageIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="font-medium truncate">{displayInfo.name}</div>
                                    {displayInfo.variantName && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {displayInfo.variantName} • {displayInfo.sku}
                                      </div>
                                    )}
                                    {!displayInfo.variantName && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {displayInfo.sku}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <SelectValue placeholder="Seleccionar producto" />
                              )}
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              {products.map((product) => {
                                const productVariants = allVariants.filter(v => v.productId === product.id);

                                // Solo mostrar variantes (no productos sin variantes)
                                return productVariants.map((variant) => {
                                  const variantImages = variant.images || [];
                                  const variantPrimaryImage = variantImages.find(img => img.isPrimary) || variantImages[0];

                                  return (
                                    <SelectItem
                                      key={`variant-${variant.id}`}
                                      value={`variant-${variant.id}`}
                                      textValue={`${product.name} ${variant.name || ''} ${variant.sku}`}
                                    >
                                      <div className="flex items-center gap-3 py-1">
                                        {variantPrimaryImage ? (
                                          <img
                                            src={variantPrimaryImage.url}
                                            alt={variant.name || product.name}
                                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">{product.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {variant.name && <span>{variant.name} • </span>}
                                            <span>SKU: {variant.sku}</span>
                                            <span className="ml-2">Stock: {variant.stock}</span>
                                          </div>
                                        </div>
                                        <div className="text-sm font-medium text-right flex-shrink-0">
                                          ${Number(variant.cost).toFixed(2)}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                });
                              })}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(index, 'unitCost', Number(e.target.value))}
                            className="w-28"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-medium">
                            ${calculateItemTotal(item).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento:</span>
                  <span className="font-medium text-red-600">-${totals.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuesto:</span>
                  <span className="font-medium">${totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Actualizar Orden
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
  );
}
