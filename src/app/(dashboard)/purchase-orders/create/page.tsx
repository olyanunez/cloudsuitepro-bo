'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, ImageIcon, Check, ChevronsUpDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '@/lib/services/apiService';
import { PurchaseOrderService } from '@/lib/services/purchaseOrderService';
import { CreatePurchaseOrderInput, CreatePurchaseOrderItemInput } from '@/lib/types/purchase-order';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import ProtectedPage from '@/components/ProtectedPage';
import { FeatureGate } from '@/components/subscription/FeatureGate';

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
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: number;
  sku: string;
  name?: string;
  cost?: number;
  barcode?: string;
  productId: number;
  product?: {
    id: number;
    name: string;
    code: string;
  };
  images?: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
  }>;
  attributeValues?: Array<{
    id: number;
    attributeValue?: {
      id: number;
      value: string;
      displayName?: string;
      attribute?: {
        id: number;
        name: string;
        displayName?: string;
      };
    };
  }>;
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
  const [orderNumber, setOrderNumber] = useState('');

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

  // Track open state for each combobox
  const [openComboboxes, setOpenComboboxes] = useState<Map<number, boolean>>(new Map());

  // Track search value for each combobox
  const [searchValues, setSearchValues] = useState<Map<number, string>>(new Map());

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [suppliersData, warehousesData, productsData, variantsData, nextOrderNumber] = await Promise.all([
          apiGet<Supplier[]>('/suppliers/active'),
          apiGet<Warehouse[]>('/warehouses'),
          apiGet<Product[]>('/products'),
          apiGet<ProductVariant[]>('/product-variants'),
          PurchaseOrderService.generateNextOrderNumber(),
        ]);

        setSuppliers(suppliersData);
        setWarehouses(warehousesData);
        setProducts(productsData);
        setAllVariants(variantsData);
        setOrderNumber(nextOrderNumber);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
          // Use variant cost if available, otherwise use product cost
          newItems[index].unitCost = Number(variant.cost || variant.product?.cost || 0);
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

  const getDisplayInfoForItem = (index: number) => {
    const item = items[index];
    const selectedKey = selectedVariants.get(index);

    if (selectedKey && selectedKey.startsWith('variant-')) {
      const variantId = Number(selectedKey.replace('variant-', ''));
      const variant = allVariants.find(v => v.id === variantId);
      if (variant) {
        const variantImages = variant.images || [];
        const variantPrimaryImage = variantImages.find(img => img.isPrimary) || variantImages[0];
        return {
          name: variant.product?.name || 'Producto',
          variantName: variant.name,
          sku: variant.sku,
          image: variantPrimaryImage?.url,
          attributes: variant.attributeValues?.map(av => ({
            name: av.attributeValue?.attribute?.displayName || av.attributeValue?.attribute?.name,
            value: av.attributeValue?.displayName || av.attributeValue?.value
          })) || []
        };
      }
    } else if (item.variantId > 0) {
      const variant = allVariants.find(v => v.id === item.variantId);
      if (variant) {
        const variantImages = variant.images || [];
        const variantPrimaryImage = variantImages.find(img => img.isPrimary) || variantImages[0];
        return {
          name: variant.product?.name || 'Producto',
          variantName: variant.name,
          sku: variant.sku,
          image: variantPrimaryImage?.url,
          attributes: variant.attributeValues?.map(av => ({
            name: av.attributeValue?.attribute?.displayName || av.attributeValue?.attribute?.name,
            value: av.attributeValue?.displayName || av.attributeValue?.value
          })) || []
        };
      }
    }

    return null;
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

    const purchaseOrderData: CreatePurchaseOrderInput = {
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
      await PurchaseOrderService.createPurchaseOrder(purchaseOrderData);
      toast.success('Orden de compra creada exitosamente');
      router.push('/purchase-orders');
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      toast.error('Error al crear orden de compra', {
        description: error.message || 'No se pudo crear la orden de compra',
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

  return (
    <ProtectedPage screenCode="PURCHASE_ORDERS" requiredPermission="CREATE">
      <FeatureGate feature="hasPurchaseOrders">
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href="/purchase-orders">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Orden de Compra</h1>
          <p className="text-sm text-muted-foreground">Número: {orderNumber}</p>
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
                            <Popover
                              open={openComboboxes.get(index) || false}
                              onOpenChange={(open) => {
                                const newOpenStates = new Map(openComboboxes);
                                newOpenStates.set(index, open);
                                setOpenComboboxes(newOpenStates);
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openComboboxes.get(index) || false}
                                  className="w-full min-w-[280px] justify-between"
                                >
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
                                    <span className="text-muted-foreground">Seleccionar producto</span>
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[450px] p-0 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700" align="start">
                                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-md overflow-hidden">
                                  {/* Search Bar */}
                                  <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="Buscar por nombre, SKU o código..."
                                      className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                      value={searchValues.get(index) || ''}
                                      onChange={(e) => {
                                        const newSearchValues = new Map(searchValues);
                                        newSearchValues.set(index, e.target.value);
                                        setSearchValues(newSearchValues);
                                      }}
                                    />
                                  </div>

                                  {/* Products List */}
                                  <div className="max-h-[350px] overflow-y-auto bg-white dark:bg-gray-800">
                                    <div className="p-2 space-y-1">
                                      {products
                                        .flatMap((product) => {
                                          const productVariants = allVariants.filter(v => v.productId === product.id);
                                          return productVariants.map((variant) => ({
                                            product,
                                            variant
                                          }));
                                        })
                                        .filter(({ product, variant }) => {
                                          const searchTerm = (searchValues.get(index) || '').toLowerCase();
                                          if (!searchTerm) return true;

                                          const productName = product.name.toLowerCase();
                                          const variantName = (variant.name || '').toLowerCase();
                                          const sku = variant.sku.toLowerCase();

                                          return productName.includes(searchTerm) ||
                                            variantName.includes(searchTerm) ||
                                            sku.includes(searchTerm);
                                        })
                                        .map(({ product, variant }) => {
                                          const variantImages = variant.images || [];
                                          const variantPrimaryImage = variantImages.find(img => img.isPrimary) || variantImages[0];
                                          const variantValue = `variant-${variant.id}`;
                                          const isSelected = selectedKey === variantValue;

                                          return (
                                            <div
                                              key={variantValue}
                                              onClick={() => {
                                                console.log('Selected:', variantValue);
                                                handleItemChange(index, 'variantId', variantValue);
                                                const newOpenStates = new Map(openComboboxes);
                                                newOpenStates.set(index, false);
                                                setOpenComboboxes(newOpenStates);
                                              }}
                                              className={cn(
                                                "group relative flex cursor-pointer select-none items-center rounded-md px-3 py-3 text-sm transition-colors",
                                                "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                                                isSelected
                                                  ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                                  : "border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50"
                                              )}
                                            >
                                              {/* Check Icon */}
                                              <div className="mr-3 flex-shrink-0">
                                                <Check
                                                  className={cn(
                                                    "h-4 w-4 transition-all",
                                                    isSelected
                                                      ? "opacity-100 text-blue-600 dark:text-blue-400"
                                                      : "opacity-0 group-hover:opacity-30"
                                                  )}
                                                />
                                              </div>

                                              {/* Product Image */}
                                              {variantPrimaryImage ? (
                                                <img
                                                  src={variantPrimaryImage.url}
                                                  alt={variant.name || product.name}
                                                  className="w-12 h-12 rounded-md object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                                                />
                                              ) : (
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-600">
                                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                              )}

                                              {/* Product Info */}
                                              <div className="flex-1 min-w-0 ml-3">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                  {product.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                  {variant.name && <span className="font-medium">{variant.name} • </span>}
                                                  <span className="text-gray-600 dark:text-gray-400">SKU: {variant.sku}</span>
                                                </div>
                                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">
                                                  ${Number(variant.cost || product.cost).toFixed(2)}
                                                </div>

                                                {/* Attributes */}
                                                {variant.attributeValues && variant.attributeValues.length > 0 && (
                                                  <div className="flex flex-wrap gap-1 mt-2">
                                                    {variant.attributeValues.map((av) => (
                                                      <span
                                                        key={av.id}
                                                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                                                      >
                                                        {av.attributeValue?.displayName || av.attributeValue?.value}
                                                      </span>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      {products
                                        .flatMap((product) => {
                                          const productVariants = allVariants.filter(v => v.productId === product.id);
                                          return productVariants.map((variant) => ({
                                            product,
                                            variant
                                          }));
                                        })
                                        .filter(({ product, variant }) => {
                                          const searchTerm = (searchValues.get(index) || '').toLowerCase();
                                          if (!searchTerm) return false;

                                          const productName = product.name.toLowerCase();
                                          const variantName = (variant.name || '').toLowerCase();
                                          const sku = variant.sku.toLowerCase();

                                          return !(productName.includes(searchTerm) ||
                                            variantName.includes(searchTerm) ||
                                            sku.includes(searchTerm));
                                        }).length === products.flatMap(p => allVariants.filter(v => v.productId === p.id)).length &&
                                        (searchValues.get(index) || '').length > 0 && (
                                          <div className="py-8 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                                              <Search className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                              No se encontraron productos
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              Intenta con otro término de búsqueda
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
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
                      )
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
                      Crear Orden
                    </>
                  )}
                </Button>
                <Link href="/purchase-orders" className="block">
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
      </FeatureGate>
    </ProtectedPage>
  );
}
