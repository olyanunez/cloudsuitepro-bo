'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InventoryMovement, VariantInventoryMovement, MovementType } from '@/lib/types/inventory';
import { InventoryService } from '@/lib/services/inventoryService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Package,
  Warehouse,
  Calendar,
  FileText,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Box,
  DollarSign,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRADA]: 'Entrada',
  [MovementType.SALIDA]: 'Salida',
  [MovementType.AJUSTE]: 'Ajuste',
  [MovementType.TRANSFERENCIA]: 'Transferencia',
};

const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  [MovementType.ENTRADA]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [MovementType.SALIDA]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [MovementType.AJUSTE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [MovementType.TRANSFERENCIA]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const MOVEMENT_TYPE_ICONS: Record<MovementType, React.ReactNode> = {
  [MovementType.ENTRADA]: <ArrowDown className="h-4 w-4" />,
  [MovementType.SALIDA]: <ArrowUp className="h-4 w-4" />,
  [MovementType.AJUSTE]: <RefreshCw className="h-4 w-4" />,
  [MovementType.TRANSFERENCIA]: <ArrowRight className="h-4 w-4" />,
};

export default function MovementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movementId = parseInt(params.id as string, 10);

  const [movement, setMovement] = useState<InventoryMovement | VariantInventoryMovement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovement();
  }, [movementId]);

  const loadMovement = async () => {
    try {
      setLoading(true);
      const data = await InventoryService.getMovementById(movementId);
      console.log('Movement data:', data);
      setMovement(data);
    } catch (error) {
      console.error('Error loading movement:', error);
      toast.error('Error al cargar el movimiento');
      router.push('/inventory/movements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando movimiento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Movimiento no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory/movements">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Detalle de Movimiento #{movement.id}
            </h1>
            <p className="text-muted-foreground">
              Información completa del movimiento de inventario
            </p>
          </div>
        </div>
      </div>

      {/* Movement Type Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tipo de Movimiento
            </CardTitle>
            <Badge className={MOVEMENT_TYPE_COLORS[movement.type]}>
              <span className="flex items-center gap-1">
                {MOVEMENT_TYPE_ICONS[movement.type]}
                {MOVEMENT_TYPE_LABELS[movement.type]}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Fecha</p>
              <p className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {format(new Date(movement.createdAt), "PPP 'a las' p", { locale: es })}
              </p>
            </div>
            {movement.reference && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Referencia</p>
                <p className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {movement.reference}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product/Variant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {('variant' in movement && movement.variant) ? 'Información de la Variante' : 'Información del Producto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const isVariantMovement = 'variant' in movement && movement.variant;
            const variant = isVariantMovement ? movement.variant : null;
            const product = variant?.product || ('product' in movement ? movement.product : null);

            // Determinar la imagen a mostrar
            const variantImages = variant?.images || [];
            const variantPrimaryImage = variantImages.find((img: any) => img.isPrimary) || variantImages[0];
            const productPrimaryImage = product?.images?.find((img: any) => img.isPrimary) || product?.images?.[0];
            const displayImage = variantPrimaryImage?.url || productPrimaryImage?.url;

            return (
              <>
                <div className="flex gap-6">
                  {/* Imagen */}
                  {displayImage && (
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={displayImage}
                          alt={variant?.name || product?.name || 'Producto'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {variant ? 'SKU' : 'Código'}
                        </p>
                        <p className="text-base font-semibold">
                          {variant ? variant.sku : product?.code || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Cantidad</p>
                        <p className="text-2xl font-bold text-primary">
                          {movement.type === MovementType.SALIDA ? '-' : '+'}{movement.quantity}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Producto</p>
                      <p className="text-lg font-semibold">
                        {product?.name || 'N/A'}
                        {variant?.name && <span className="text-muted-foreground"> - {variant.name}</span>}
                      </p>
                    </div>

                    {/* Atributos de la variante */}
                    {variant?.attributeValues && variant.attributeValues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Atributos</p>
                        <div className="flex flex-wrap gap-2">
                          {variant.attributeValues.map((av: any) => (
                            <Badge key={av.id} variant="secondary">
                              {av.attributeValue?.attribute?.displayName || av.attributeValue?.attribute?.name}: {av.attributeValue?.displayName || av.attributeValue?.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {product?.description && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
                    <p className="text-base">{product.description}</p>
                  </div>
                )}

                {/* Precios y costos */}
                {(variant?.price || product?.price) && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Precio Unitario</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(variant?.price || product?.price || 0)}
                        </p>
                      </div>
                      {(variant?.cost || product?.cost) && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Costo Unitario</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(variant?.cost || product?.cost || 0)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Código de barras */}
                {(variant?.barcode || product?.barcode) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Código de Barras</p>
                    <p className="text-base font-mono">{variant?.barcode || product?.barcode}</p>
                  </div>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* Warehouse Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Almacenes
          </CardTitle>
          <CardDescription>
            {movement.type === MovementType.TRANSFERENCIA
              ? 'Almacenes de origen y destino'
              : 'Almacén involucrado en el movimiento'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movement.type === MovementType.TRANSFERENCIA ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground mb-2">Origen</p>
                <p className="text-base font-semibold">
                  {movement.sourceWarehouse?.name || `ID: ${movement.sourceWarehouseId}` || 'N/A'}
                </p>
                {movement.sourceWarehouse?.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {movement.sourceWarehouse.address}
                  </p>
                )}
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground mb-2">Destino</p>
                <p className="text-base font-semibold">
                  {movement.destinationWarehouse?.name || `ID: ${movement.destinationWarehouseId}` || 'N/A'}
                </p>
                {movement.destinationWarehouse?.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {movement.destinationWarehouse.address}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Almacén</p>
              <p className="text-base font-semibold">
                {movement.type === MovementType.ENTRADA
                  ? (movement.destinationWarehouse?.name || `ID: ${movement.destinationWarehouseId}` || 'N/A')
                  : (movement.sourceWarehouse?.name || `ID: ${movement.sourceWarehouseId}` || 'N/A')}
              </p>
              {(movement.destinationWarehouse?.address || movement.sourceWarehouse?.address) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {movement.destinationWarehouse?.address || movement.sourceWarehouse?.address}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Information */}
      {movement.batchMovements && movement.batchMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Lotes Asociados
            </CardTitle>
            <CardDescription>
              Información de los lotes involucrados en este movimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {movement.batchMovements.map((batchMovement, index) => (
                <div
                  key={batchMovement.id}
                  className="p-6 border rounded-lg bg-muted/30 space-y-4"
                >
                  {/* Header del Lote */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Box className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Link
                          href={`/inventory/batches/${batchMovement.batchId}`}
                          className="text-lg font-semibold text-primary hover:underline"
                        >
                          {batchMovement.batch.batchNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          Estado del lote: <span className="font-medium">{batchMovement.batch.status}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {batchMovement.type}
                    </Badge>
                  </div>

                  {/* Cantidades del Movimiento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Cantidad del Movimiento</p>
                      <p className="text-lg font-semibold">
                        {batchMovement.quantity > 0 ? '+' : ''}{batchMovement.quantity} unidades
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Cantidad Antes</p>
                      <p className="text-lg font-semibold">{batchMovement.quantityBefore} unidades</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Cantidad Después</p>
                      <p className="text-lg font-semibold">{batchMovement.quantityAfter} unidades</p>
                    </div>
                  </div>

                  {/* Información del Lote */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Información del Lote</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Costo Unitario
                        </p>
                        <p className="text-sm font-medium">{formatCurrency(batchMovement.batch.unitCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Costo Total del Lote
                        </p>
                        <p className="text-sm font-medium">{formatCurrency(batchMovement.batch.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cantidad Inicial</p>
                        <p className="text-sm font-medium">{batchMovement.batch.initialQuantity} unidades</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cantidad Actual del Lote</p>
                        <p className="text-sm font-medium">{batchMovement.batch.currentQuantity} unidades</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cantidad Reservada</p>
                        <p className="text-sm font-medium">{batchMovement.batch.reservedQuantity} unidades</p>
                      </div>
                      {batchMovement.batch.location && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Ubicación
                          </p>
                          <p className="text-sm font-medium">{batchMovement.batch.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fechas */}
                  {(batchMovement.batch.manufacturingDate || batchMovement.batch.expirationDate) && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Fechas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {batchMovement.batch.manufacturingDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Fecha de Fabricación
                            </p>
                            <p className="text-sm font-medium">
                              {format(new Date(batchMovement.batch.manufacturingDate), "PPP", { locale: es })}
                            </p>
                          </div>
                        )}
                        {batchMovement.batch.expirationDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Fecha de Vencimiento
                            </p>
                            <p className="text-sm font-medium">
                              {format(new Date(batchMovement.batch.expirationDate), "PPP", { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proveedor y OC */}
                  {(batchMovement.batch.supplierName || batchMovement.batch.purchaseOrderRef) && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Información del Proveedor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {batchMovement.batch.supplierName && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Proveedor</p>
                            <p className="text-sm font-medium">{batchMovement.batch.supplierName}</p>
                          </div>
                        )}
                        {batchMovement.batch.purchaseOrderRef && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Orden de Compra</p>
                            <p className="text-sm font-medium">{batchMovement.batch.purchaseOrderRef}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Referencias y Notas del Movimiento del Lote */}
                  {(batchMovement.reference || batchMovement.notes) && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Información Adicional del Movimiento</h4>
                      {batchMovement.reference && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Referencia</p>
                          <p className="text-sm">{batchMovement.reference}</p>
                        </div>
                      )}
                      {batchMovement.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notas</p>
                          <p className="text-sm whitespace-pre-wrap">{batchMovement.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {movement.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{movement.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Link href="/inventory/movements">
          <Button variant="outline">
            Volver a la lista
          </Button>
        </Link>
      </div>
    </div>
  );
}
