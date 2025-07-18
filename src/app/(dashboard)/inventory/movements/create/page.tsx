'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MovementType, Product, Warehouse } from '@/lib/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { CreateInventoryMovementDto } from '@/lib/types/inventory';

export default function CreateMovementPage() {
  const router = useRouter();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Form state
  const [movementType, setMovementType] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    type?: string;
    productId?: string;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    quantity?: string;
    general?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [productsData, warehousesData] = await Promise.all([
          ProductService.getProducts(),
          WarehouseService.getWarehouses()
        ]);

        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!movementType) {
      newErrors.type = 'El tipo de movimiento es requerido';
    }

    if (!productId) {
      newErrors.productId = 'El producto es requerido';
    }

    if ((movementType === MovementType.SALIDA || movementType === MovementType.TRANSFERENCIA) && !sourceWarehouseId) {
      newErrors.sourceWarehouseId = 'El almacén de origen es requerido';
    }

    if ((movementType === MovementType.ENTRADA || movementType === MovementType.TRANSFERENCIA) && !destinationWarehouseId) {
      newErrors.destinationWarehouseId = 'El almacén de destino es requerido';
    }

    if (movementType === MovementType.TRANSFERENCIA && sourceWarehouseId === destinationWarehouseId) {
      newErrors.destinationWarehouseId = 'Los almacenes de origen y destino deben ser diferentes';
    }

    if (!quantity) {
      newErrors.quantity = 'La cantidad es requerida';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser un número mayor que cero';
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

      const movementData: CreateInventoryMovementDto = {
        type: movementType as MovementType,
        productId: Number(productId),
        quantity: Number(quantity),
        reference: reference || undefined,
        notes: notes || undefined
      };

      if (movementType === MovementType.ENTRADA || movementType === MovementType.TRANSFERENCIA) {
        movementData.destinationWarehouseId = Number(destinationWarehouseId);
      }

      if (movementType === MovementType.SALIDA || movementType === MovementType.TRANSFERENCIA) {
        movementData.sourceWarehouseId = Number(sourceWarehouseId);
      }

      await InventoryService.createMovement(movementData);

      toast.success('Movimiento creado correctamente');
      router.push('/inventory/movements');
    } catch (error) {
      console.error('Error creating movement:', error);
      toast.error('Error al crear el movimiento');
      setErrors({ ...errors, general: 'Error al crear el movimiento. Intente nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/inventory/movements" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Movimiento de Inventario</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Movimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="movementType" className="text-sm font-medium">
                  Tipo de Movimiento <span className="text-red-500">*</span>
                </label>
                <Select value={movementType} onValueChange={(value: string) => setMovementType(value)}>
                  <SelectTrigger id="movementType" className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar tipo de movimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MovementType.ENTRADA}>Entrada</SelectItem>
                    <SelectItem value={MovementType.SALIDA}>Salida</SelectItem>
                    <SelectItem value={MovementType.AJUSTE}>Ajuste</SelectItem>
                    <SelectItem value={MovementType.TRANSFERENCIA}>Transferencia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="product" className="text-sm font-medium">
                  Producto <span className="text-red-500">*</span>
                </label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="product" className={errors.productId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
              </div>

              {(movementType === MovementType.SALIDA || movementType === MovementType.TRANSFERENCIA) && (
                <div className="space-y-2">
                  <label htmlFor="sourceWarehouse" className="text-sm font-medium">
                    Almacén de Origen <span className="text-red-500">*</span>
                  </label>
                  <Select value={sourceWarehouseId} onValueChange={setSourceWarehouseId}>
                    <SelectTrigger id="sourceWarehouse" className={errors.sourceWarehouseId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar almacén de origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sourceWarehouseId && <p className="text-red-500 text-xs mt-1">{errors.sourceWarehouseId}</p>}
                </div>
              )}

              {(movementType === MovementType.ENTRADA || movementType === MovementType.TRANSFERENCIA) && (
                <div className="space-y-2">
                  <label htmlFor="destinationWarehouse" className="text-sm font-medium">
                    Almacén de Destino <span className="text-red-500">*</span>
                  </label>
                  <Select value={destinationWarehouseId} onValueChange={setDestinationWarehouseId}>
                    <SelectTrigger id="destinationWarehouse" className={errors.destinationWarehouseId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar almacén de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destinationWarehouseId && <p className="text-red-500 text-xs mt-1">{errors.destinationWarehouseId}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ingrese la cantidad"
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="reference" className="text-sm font-medium">
                  Referencia
                </label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Referencia o número de documento"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notas
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales"
                rows={3}
              />
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <Link href="/inventory/movements">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-primary hover:bg-primary-600" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
