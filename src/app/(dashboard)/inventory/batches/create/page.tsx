'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon, Package } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/ProtectedPage';
import { BatchService } from '@/lib/services/batchService';
import { CreateBatchDto } from '@/lib/types/batch';
import { apiGet } from '@/lib/services/apiService';

interface Product {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

interface Warehouse {
  id: number;
  name: string;
  isActive: boolean;
}

export default function CreateBatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formData, setFormData] = useState<CreateBatchDto>({
    productId: 0,
    warehouseId: 0,
    quantity: 0,
    unitCost: 0,
    batchNumber: '',
    expirationDate: undefined,
    manufacturingDate: undefined,
    supplierName: '',
    purchaseOrderRef: '',
    location: '',
    reference: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{
    productId?: string;
    warehouseId?: string;
    quantity?: string;
    unitCost?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, warehousesData] = await Promise.all([
          apiGet<Product[]>('/products'),
          apiGet<Warehouse[]>('/warehouses'),
        ]);

        setProducts(productsData.filter(p => p.isActive));
        setWarehouses(warehousesData.filter(w => w.isActive));
      } catch (error: any) {
        toast.error('Error al cargar datos', {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'quantity' || name === 'unitCost') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else if (type === 'date') {
      setFormData(prev => ({ ...prev, [name]: value || undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'productId' || name === 'warehouseId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));

      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      productId?: string;
      warehouseId?: string;
      quantity?: string;
      unitCost?: string;
    } = {};

    if (!formData.productId || formData.productId <= 0) {
      newErrors.productId = 'Debe seleccionar un producto';
    }

    if (!formData.warehouseId || formData.warehouseId <= 0) {
      newErrors.warehouseId = 'Debe seleccionar un almacén';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor que cero';
    }

    if (formData.unitCost <= 0) {
      newErrors.unitCost = 'El costo unitario debe ser mayor que cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await BatchService.create(formData);
      toast.success('Lote creado exitosamente');
      router.push('/inventory/batches');
    } catch (error: any) {
      toast.error('Error al crear lote', {
        description: error.message || 'No se pudo crear el lote',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedPage screenCode="INVENTORY" requiredPermission="CREATE">
        <div className="p-6">
          <div className="text-center py-12">Cargando...</div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage screenCode="INVENTORY" requiredPermission="CREATE">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Nuevo Lote</h1>
            <p className="text-muted-foreground mt-1">
              Registrar entrada de mercancía con trazabilidad
            </p>
          </div>
          <Link href="/inventory/batches">
            <Button variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            <div className="space-y-6">
              {/* Información Básica */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Producto */}
                  <div className="space-y-2">
                    <Label htmlFor="productId">
                      Producto <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.productId ? formData.productId.toString() : ''}
                      onValueChange={(value) => handleSelectChange('productId', value)}
                    >
                      <SelectTrigger id="productId" className={errors.productId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccione un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.code} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.productId && (
                      <p className="text-sm text-red-500">{errors.productId}</p>
                    )}
                  </div>

                  {/* Almacén */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseId">
                      Almacén <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.warehouseId ? formData.warehouseId.toString() : ''}
                      onValueChange={(value) => handleSelectChange('warehouseId', value)}
                    >
                      <SelectTrigger id="warehouseId" className={errors.warehouseId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccione un almacén" />
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
                      <p className="text-sm text-red-500">{errors.warehouseId}</p>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Cantidad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity || ''}
                      onChange={handleInputChange}
                      className={errors.quantity ? 'border-red-500' : ''}
                      placeholder="0.00"
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Costo Unitario */}
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">
                      Costo Unitario <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="unitCost"
                      name="unitCost"
                      type="number"
                      step="0.01"
                      value={formData.unitCost || ''}
                      onChange={handleInputChange}
                      className={errors.unitCost ? 'border-red-500' : ''}
                      placeholder="0.00"
                    />
                    {errors.unitCost && (
                      <p className="text-sm text-red-500">{errors.unitCost}</p>
                    )}
                  </div>

                  {/* Número de Lote */}
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Número de Lote</Label>
                    <Input
                      id="batchNumber"
                      name="batchNumber"
                      type="text"
                      value={formData.batchNumber || ''}
                      onChange={handleInputChange}
                      placeholder="Dejar vacío para generar automático"
                    />
                    <p className="text-xs text-muted-foreground">
                      Si se deja vacío, se generará automáticamente
                    </p>
                  </div>

                  {/* Ubicación */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación en Almacén</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Ej: Pasillo A, Estante 3"
                    />
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Fechas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de Fabricación */}
                  <div className="space-y-2">
                    <Label htmlFor="manufacturingDate">Fecha de Fabricación</Label>
                    <Input
                      id="manufacturingDate"
                      name="manufacturingDate"
                      type="date"
                      value={formData.manufacturingDate || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Fecha de Vencimiento */}
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
                    <Input
                      id="expirationDate"
                      name="expirationDate"
                      type="date"
                      value={formData.expirationDate || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Información del Proveedor */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información del Proveedor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre del Proveedor */}
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Nombre del Proveedor</Label>
                    <Input
                      id="supplierName"
                      name="supplierName"
                      type="text"
                      value={formData.supplierName || ''}
                      onChange={handleInputChange}
                      placeholder="Nombre del proveedor"
                    />
                  </div>

                  {/* Orden de Compra */}
                  <div className="space-y-2">
                    <Label htmlFor="purchaseOrderRef">Orden de Compra</Label>
                    <Input
                      id="purchaseOrderRef"
                      name="purchaseOrderRef"
                      type="text"
                      value={formData.purchaseOrderRef || ''}
                      onChange={handleInputChange}
                      placeholder="Número de orden de compra"
                    />
                  </div>

                  {/* Referencia */}
                  <div className="space-y-2">
                    <Label htmlFor="reference">Referencia</Label>
                    <Input
                      id="reference"
                      name="reference"
                      type="text"
                      value={formData.reference || ''}
                      onChange={handleInputChange}
                      placeholder="Referencia adicional"
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales sobre el lote..."
                  rows={3}
                />
              </div>

              {/* Costo Total (Calculado) */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Costo Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${(formData.quantity * formData.unitCost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex gap-4 justify-end">
            <Link href="/inventory/batches">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Crear Lote
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedPage>
  );
}
