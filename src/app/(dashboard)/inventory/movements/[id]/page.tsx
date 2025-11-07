'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InventoryMovement, MovementType } from '@/lib/types/inventory';
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
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

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

  const [movement, setMovement] = useState<InventoryMovement | null>(null);
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

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información del Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Código</p>
              <p className="text-base font-semibold">{movement.product?.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Nombre</p>
              <p className="text-base font-semibold">{movement.product?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Cantidad</p>
              <p className="text-2xl font-bold text-primary">
                {movement.type === MovementType.SALIDA ? '-' : '+'}{movement.quantity}
              </p>
            </div>
          </div>

          {movement.product?.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
              <p className="text-base">{movement.product.description}</p>
            </div>
          )}

          {movement.product?.price && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Precio Unitario</p>
                  <p className="text-lg font-semibold">{formatCurrency(movement.product.price)}</p>
                </div>
                {movement.product.cost && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Costo Unitario</p>
                    <p className="text-lg font-semibold">{formatCurrency(movement.product.cost)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
