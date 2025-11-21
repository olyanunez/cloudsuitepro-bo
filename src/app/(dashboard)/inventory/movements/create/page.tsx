'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MovementType, Product, Warehouse } from '@/lib/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventoryService';
import { BatchService } from '@/lib/services/batchService';
import { Batch } from '@/lib/types/batch';
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
  const [availableSourceWarehouses, setAvailableSourceWarehouses] = useState<Warehouse[]>([]);

  // Form state
  const [movementType, setMovementType] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProductStockable, setIsProductStockable] = useState<boolean>(true);

  // Batch-related fields
  const [batchMode, setBatchMode] = useState<'new' | 'existing'>('new');
  const [existingBatchId, setExistingBatchId] = useState<string>('');
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
  const [unitCost, setUnitCost] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [manufacturingDate, setManufacturingDate] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [purchaseOrderRef, setPurchaseOrderRef] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    type?: string;
    productId?: string;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    quantity?: string;
    unitCost?: string;
    existingBatchId?: string;
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

  // Cargar almacenes con stock del producto seleccionado
  useEffect(() => {
    async function loadWarehousesWithStock() {
      if (!productId) {
        setAvailableSourceWarehouses([]);
        return;
      }

      try {
        // Obtener items de inventario para el producto seleccionado
        const inventoryItems = await InventoryService.getItems(undefined, Number(productId));

        // Filtrar almacenes que tienen stock (cantidad > 0)
        const warehouseIdsWithStock = inventoryItems
          .filter(item => item.quantity > 0)
          .map(item => item.warehouseId);

        // Filtrar la lista de almacenes para incluir solo los que tienen stock
        const warehousesWithStock = warehouses.filter(warehouse =>
          warehouseIdsWithStock.includes(warehouse.id)
        );

        setAvailableSourceWarehouses(warehousesWithStock);

        // Si el almacén de origen seleccionado ya no tiene stock, limpiarlo
        if (sourceWarehouseId && !warehouseIdsWithStock.includes(Number(sourceWarehouseId))) {
          setSourceWarehouseId('');
        }
      } catch (error) {
        console.error('Error loading warehouses with stock:', error);
        toast.error('Error al cargar almacenes con stock');
        setAvailableSourceWarehouses([]);
      }
    }

    loadWarehousesWithStock();
  }, [productId, warehouses, sourceWarehouseId]);

  // Cargar lotes disponibles cuando se selecciona producto y almacén destino para ENTRADA
  useEffect(() => {
    async function loadAvailableBatches() {
      if (movementType !== MovementType.ENTRADA || !productId || !destinationWarehouseId || batchMode !== 'existing') {
        setAvailableBatches([]);
        return;
      }

      try {
        setLoadingBatches(true);
        const batches = await BatchService.getAvailableBatches(Number(productId), Number(destinationWarehouseId));

        // Filtrar solo lotes activos y no vencidos/bloqueados
        const activeBatches = batches.filter(batch =>
          batch.status === 'ACTIVE' || batch.status === 'RESERVED'
        );

        setAvailableBatches(activeBatches);

        if (activeBatches.length === 0) {
          toast.info('No hay lotes activos para este producto y almacén. Se creará un nuevo lote.');
          setBatchMode('new');
        }
      } catch (error) {
        console.error('Error loading available batches:', error);
        toast.error('Error al cargar los lotes disponibles');
        setAvailableBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    }

    loadAvailableBatches();
  }, [productId, destinationWarehouseId, movementType, batchMode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!movementType) {
      newErrors.type = 'El tipo de movimiento es requerido';
    }

    if (!productId) {
      newErrors.productId = 'El producto es requerido';
    }

    if ((movementType === MovementType.SALIDA || movementType === MovementType.TRANSFERENCIA || movementType === MovementType.AJUSTE) && !sourceWarehouseId) {
      newErrors.sourceWarehouseId = 'El almacén de origen es requerido';
    }

    if ((movementType === MovementType.ENTRADA || movementType === MovementType.TRANSFERENCIA) && !destinationWarehouseId) {
      newErrors.destinationWarehouseId = 'El almacén de destino es requerido';
    }

    if (movementType === MovementType.TRANSFERENCIA && sourceWarehouseId === destinationWarehouseId) {
      newErrors.destinationWarehouseId = 'Los almacenes de origen y destino deben ser diferentes';
    }

    // Solo validar cantidad para productos gastables
    if (isProductStockable) {
      if (!quantity) {
        newErrors.quantity = 'La cantidad es requerida';
      } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
        newErrors.quantity = 'La cantidad debe ser un número mayor que cero';
      }
    }

    // Validar costo unitario para entradas (solo para nuevos lotes)
    if (movementType === MovementType.ENTRADA && batchMode === 'new') {
      if (!unitCost) {
        newErrors.unitCost = 'El costo unitario es requerido para entradas';
      } else if (isNaN(Number(unitCost)) || Number(unitCost) <= 0) {
        newErrors.unitCost = 'El costo unitario debe ser un número mayor que cero';
      }
    }

    // Validar selección de lote existente
    if (movementType === MovementType.ENTRADA && batchMode === 'existing') {
      if (!existingBatchId) {
        newErrors.existingBatchId = 'Debe seleccionar un lote existente';
      }
      if (!unitCost) {
        newErrors.unitCost = 'El costo unitario es requerido';
      } else if (isNaN(Number(unitCost)) || Number(unitCost) <= 0) {
        newErrors.unitCost = 'El costo unitario debe ser un número mayor que cero';
      }
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
        quantity: isProductStockable ? Number(quantity) : 0,
        reference: reference || undefined,
        notes: notes || undefined
      };

      if (movementType === MovementType.ENTRADA || movementType === MovementType.TRANSFERENCIA) {
        movementData.destinationWarehouseId = Number(destinationWarehouseId);
      }

      if (movementType === MovementType.SALIDA || movementType === MovementType.TRANSFERENCIA || movementType === MovementType.AJUSTE) {
        movementData.sourceWarehouseId = Number(sourceWarehouseId);
      }

      // Add batch-related fields for ENTRADA
      if (movementType === MovementType.ENTRADA) {
        movementData.unitCost = Number(unitCost);

        if (batchMode === 'existing') {
          // Agregar a lote existente
          movementData.existingBatchId = Number(existingBatchId);
        } else {
          // Crear nuevo lote
          if (expirationDate) movementData.expirationDate = expirationDate;
          if (manufacturingDate) movementData.manufacturingDate = manufacturingDate;
          if (supplierName) movementData.supplierName = supplierName;
          if (purchaseOrderRef) movementData.purchaseOrderRef = purchaseOrderRef;
          if (location) movementData.location = location;
          if (batchNumber) movementData.batchNumber = batchNumber;
        }
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
                <Select value={productId} onValueChange={(value) => {
                  setProductId(value);
                  // Actualizar si el producto es gastable
                  const selectedProduct = products.find(p => p.id.toString() === value);
                  if (selectedProduct) {
                    setIsProductStockable(selectedProduct.isStockable);
                    // Si el producto no es gastable, limpiar la cantidad
                    if (!selectedProduct.isStockable) {
                      setQuantity('');
                    }
                  }
                }}>
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

              {(movementType === MovementType.SALIDA || movementType === MovementType.TRANSFERENCIA || movementType === MovementType.AJUSTE) && (
                <div className="space-y-2">
                  <label htmlFor="sourceWarehouse" className="text-sm font-medium">
                    Almacén {movementType === MovementType.AJUSTE ? '' : 'de Origen'} <span className="text-red-500">*</span>
                  </label>
                  <Select value={sourceWarehouseId} onValueChange={setSourceWarehouseId} disabled={!productId}>
                    <SelectTrigger id="sourceWarehouse" className={errors.sourceWarehouseId ? 'border-red-500' : ''}>
                      <SelectValue placeholder={!productId ? "Primero seleccione un producto" : `Seleccionar almacén ${movementType === MovementType.AJUSTE ? '' : 'de origen'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSourceWarehouses.length === 0 && productId ? (
                        <SelectItem value="no-stock" disabled>
                          No hay almacenes con stock de este producto
                        </SelectItem>
                      ) : (
                        availableSourceWarehouses.map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))
                      )}
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

              {isProductStockable && (
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
              )}

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

              {movementType === MovementType.ENTRADA && (
                <>
                  {/* Batch Mode Selection */}
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <label htmlFor="batchMode" className="text-sm font-medium">
                      Modo de Lote
                    </label>
                    <Select value={batchMode} onValueChange={(value: 'new' | 'existing') => {
                      setBatchMode(value);
                      setExistingBatchId('');
                    }}>
                      <SelectTrigger id="batchMode">
                        <SelectValue placeholder="Seleccionar modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Crear nuevo lote</SelectItem>
                        <SelectItem value="existing">Agregar a lote existente</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {batchMode === 'new'
                        ? 'Se creará un nuevo lote con la información proporcionada'
                        : 'Seleccione un lote existente para agregar inventario'}
                    </p>
                  </div>

                  {/* Existing Batch Selection */}
                  {batchMode === 'existing' && (
                    <div className="space-y-2">
                      <label htmlFor="existingBatch" className="text-sm font-medium">
                        Seleccionar Lote <span className="text-red-500">*</span>
                      </label>
                      <Select value={existingBatchId} onValueChange={setExistingBatchId} disabled={loadingBatches}>
                        <SelectTrigger id="existingBatch" className={errors.existingBatchId ? 'border-red-500' : ''}>
                          <SelectValue placeholder={loadingBatches ? "Cargando lotes..." : "Seleccionar lote existente"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBatches.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No hay lotes disponibles
                            </div>
                          ) : (
                            availableBatches.map(batch => (
                              <SelectItem key={batch.id} value={batch.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{batch.batchNumber}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Stock: {batch.currentQuantity} | Costo: ${Number(batch.unitCost).toFixed(2)}
                                    {batch.expirationDate && ` | Vence: ${new Date(batch.expirationDate).toLocaleDateString()}`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.existingBatchId && <p className="text-red-500 text-xs mt-1">{errors.existingBatchId}</p>}
                      <p className="text-xs text-muted-foreground">
                        Seleccione un lote existente para agregar más inventario
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="unitCost" className="text-sm font-medium">
                      Costo Unitario <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="unitCost"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      placeholder="Costo por unidad"
                      className={errors.unitCost ? 'border-red-500' : ''}
                    />
                    {errors.unitCost && <p className="text-red-500 text-xs mt-1">{errors.unitCost}</p>}
                  </div>

                  {batchMode === 'new' && (
                    <>
                  <div className="space-y-2">
                    <label htmlFor="expirationDate" className="text-sm font-medium">
                      Fecha de Caducidad
                    </label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="manufacturingDate" className="text-sm font-medium">
                      Fecha de Fabricación
                    </label>
                    <Input
                      id="manufacturingDate"
                      type="date"
                      value={manufacturingDate}
                      onChange={(e) => setManufacturingDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="supplierName" className="text-sm font-medium">
                      Proveedor
                    </label>
                    <Input
                      id="supplierName"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="Nombre del proveedor"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="purchaseOrderRef" className="text-sm font-medium">
                      Orden de Compra
                    </label>
                    <Input
                      id="purchaseOrderRef"
                      value={purchaseOrderRef}
                      onChange={(e) => setPurchaseOrderRef(e.target.value)}
                      placeholder="Referencia de OC"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Ubicación Física
                    </label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej: Pasillo A, Estante 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="batchNumber" className="text-sm font-medium">
                      Número de Lote
                    </label>
                    <Input
                      id="batchNumber"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="Dejar vacío para generarlo automáticamente"
                    />
                    <p className="text-xs text-muted-foreground">
                      Si se deja vacío, se generará automáticamente con el formato LOTE-YYYY-NNNNNN
                    </p>
                  </div>
                    </>
                  )}
                </>
              )}
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
