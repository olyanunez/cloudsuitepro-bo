'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BatchService } from '@/lib/services/batchService';
import { Batch, BatchMovement, BatchStatus } from '@/lib/types/batch';
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown,
  Hash,
  Warehouse,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [movements, setMovements] = useState<BatchMovement[]>([]);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setLoading(true);
        const [batchData, movementsResponse] = await Promise.all([
          BatchService.getById(parseInt(id)),
          BatchService.getMovements(parseInt(id)),
        ]);
        setBatch(batchData);
        // El endpoint devuelve un objeto con { batch, movements }
        // Extraer el array de movements del response
        const movementsData = (movementsResponse as any)?.movements || movementsResponse;
        setMovements(Array.isArray(movementsData) ? movementsData : []);
      } catch (error: any) {
        toast.error('Error al cargar lote', {
          description: error.message || 'No se pudo cargar el lote',
        });
        router.push('/inventory/batches');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBatch();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-center">Cargando...</p>
        </Card>
      </div>
    );
  }

  if (!batch) {
    return null;
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilExpiration = () => {
    if (!batch.expirationDate) return null;
    const today = new Date();
    const expDate = new Date(batch.expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: BatchStatus) => {
    const variants = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      RESERVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      DEPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      BLOCKED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };

    const labels = {
      ACTIVE: 'Activo',
      RESERVED: 'Reservado',
      DEPLETED: 'Agotado',
      EXPIRED: 'Vencido',
      BLOCKED: 'Bloqueado',
    };

    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const daysUntilExp = getDaysUntilExpiration();
  const isExpiringSoon = daysUntilExp !== null && daysUntilExp <= 30 && daysUntilExp > 0;
  const isExpired = daysUntilExp !== null && daysUntilExp <= 0;
  const stockPercentage = (batch.currentQuantity / batch.initialQuantity) * 100;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href="/inventory/batches">
          <Button variant="ghost" size="sm" className="mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Lotes
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{batch.batchNumber}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">{batch.product?.name || 'Producto'}</p>
          </div>
          <div className="self-start">
            {getStatusBadge(batch.status)}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(isExpiringSoon || isExpired) && (
        <div className={`mb-6 p-4 rounded-lg border ${isExpired ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' : 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
            <span className="font-semibold">
              {isExpired ? '¡Lote Vencido!' : '¡Alerta de Vencimiento!'}
            </span>
          </div>
          <p className="text-sm mt-1 ml-7">
            {isExpired
              ? `Este lote venció hace ${Math.abs(daysUntilExp)} días.`
              : `Este lote vence en ${daysUntilExp} días.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Producto</p>
                  <p className="font-medium">{batch.product?.name || '-'}</p>
                  <p className="text-sm text-muted-foreground">{batch.product?.code || '-'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Warehouse className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Almacén</p>
                  <p className="font-medium">{batch.warehouse?.name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Número de Lote</p>
                  <p className="font-medium">{batch.batchNumber}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{batch.location || '-'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Entrada</p>
                  <p className="font-medium">{formatDate(batch.entryDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Fabricación</p>
                  <p className="font-medium">{formatDate(batch.manufacturingDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="font-medium">{formatDate(batch.expirationDate)}</p>
                  {daysUntilExp !== null && (
                    <p className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {isExpired ? `Vencido hace ${Math.abs(daysUntilExp)} días` : `Vence en ${daysUntilExp} días`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stock Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Stock y Costos</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Stock Disponible</span>
                  <span className="font-semibold">{stockPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${stockPercentage > 50
                      ? 'bg-green-500'
                      : stockPercentage > 20
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(100, stockPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{batch.currentQuantity} unidades disponibles</span>
                  <span>{batch.initialQuantity} unidades iniciales</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Costo Unitario</p>
                  <p className="text-2xl font-bold">{formatCurrency(batch.unitCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(batch.totalCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad Reservada</p>
                  <p className="text-xl font-semibold">{batch.reservedQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Actual</p>
                  <p className="text-xl font-semibold">{formatCurrency(batch.currentQuantity * batch.unitCost)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Supplier Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Proveedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Proveedor</p>
                <p className="font-medium">{batch.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orden de Compra</p>
                <p className="font-medium">{batch.purchaseOrderRef}</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas
            </h2>
            <p className="text-muted-foreground">{batch.notes}</p>
          </Card>
          {/* Audit Dates */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información de Auditoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">{formatDateTime(batch.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="font-medium">{formatDateTime(batch.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Movements */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historial de Movimientos</h2>
            {movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay movimientos registrados
              </p>
            ) : (
              <div className="space-y-4">
                {movements.map((movement) => {
                  const isEntry = movement.type === 'ENTRADA';
                  return (
                    <div
                      key={movement.id}
                      className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {isEntry ? (
                            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{movement.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(movement.createdAt)}
                            </p>
                            {movement.reference && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Ref: {movement.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                            {isEntry ? '+' : '-'}{movement.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {movement.quantityBefore} → {movement.quantityAfter}
                          </p>
                        </div>
                      </div>
                      {movement.notes && (
                        <p className="text-xs text-muted-foreground mt-2 pl-7">
                          {movement.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
