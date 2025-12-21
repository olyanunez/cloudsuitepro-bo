'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/services/apiService';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  Package,
  Calendar,
  Building2,
  Hash,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  StickyNote,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Batch {
  id: number;
  batchNumber: string;
  quantity: number;
  expirationDate?: string;
  createdAt: string;
}

interface Supplier {
  id: number;
  code: string;
  name: string;
  supplierType?: 'FORMAL' | 'INFORMAL';
  isInformal?: boolean;
  informalReason?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  batches: Batch[];
  stats: {
    totalBatches: number;
    totalQuantity: number;
  };
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Supplier>(`/suppliers/${id}`);
        setSupplier(data);
      } catch (error: any) {
        toast.error('Error al cargar proveedor', {
          description: error.message || 'No se pudo cargar el proveedor',
        });
        router.push('/suppliers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
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

  if (!supplier) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/suppliers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proveedores
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{supplier.name}</h1>
            <p className="text-gray-600 mt-1">Código: {supplier.code}</p>
          </div>
          <Link href={`/suppliers/edit/${supplier.id}`}>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Supplier Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Información General
            </h2>

            {/* Sección: Identificación */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Identificación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Nombre / Razón Social</p>
                    <p className="font-medium">{supplier.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Tipo de Proveedor</p>
                    {supplier.supplierType === 'INFORMAL' || supplier.isInformal ? (
                      <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Proveedor Informal (B11)
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Proveedor Formal
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="font-medium">{supplier.code}</p>
                  </div>
                </div>

                {supplier.taxId && (
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">RNC</p>
                      <p className="font-medium">{supplier.taxId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="mb-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplier.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium break-all">{supplier.email}</p>
                    </div>
                  </div>
                )}

                {supplier.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{supplier.phone}</p>
                    </div>
                  </div>
                )}

                {supplier.address && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Dirección</p>
                      <p className="font-medium">{supplier.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Estado */}
            <div className="pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Estado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  {supplier.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Estado Actual</p>
                    <div className="mt-1">
                      <Badge
                        variant={supplier.isActive ? 'default' : 'destructive'}
                        className={supplier.isActive ? 'bg-green-500' : ''}
                      >
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Proveedor Desde</p>
                    <p className="font-medium">{formatDate(supplier.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          {(supplier.contactName || supplier.contactEmail || supplier.contactPhone) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Persona de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplier.contactName && (
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium">{supplier.contactName}</p>
                    </div>
                  </div>
                )}

                {supplier.contactEmail && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{supplier.contactEmail}</p>
                    </div>
                  </div>
                )}

                {supplier.contactPhone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{supplier.contactPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Informal Supplier Info */}
          {(supplier.supplierType === 'INFORMAL' || supplier.isInformal) && supplier.informalReason && (
            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-yellow-800">
                    Proveedor Informal
                  </h2>
                  <p className="text-sm text-yellow-700 mb-2">
                    Este proveedor genera automáticamente NCF tipo B11 (Comprobante para Regímenes Especiales) al recibir mercancía.
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Motivo:</p>
                    <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                      {supplier.informalReason}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Terms and Notes */}
          {(supplier.paymentTerms || supplier.notes) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Información Adicional
              </h2>
              <div className="space-y-4">
                {supplier.paymentTerms && (
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Términos de Pago</p>
                      <p className="font-medium">{supplier.paymentTerms}</p>
                    </div>
                  </div>
                )}

                {supplier.notes && (
                  <div className="flex items-start space-x-3">
                    <StickyNote className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Notas</p>
                      <p className="font-medium whitespace-pre-wrap">{supplier.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recent Batches */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Últimos Lotes</h2>
            {!supplier.batches || supplier.batches.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay lotes registrados
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                        Lote
                      </th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                        Fecha Ingreso
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">
                        Cantidad
                      </th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                        Vencimiento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {supplier.batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {batch.batchNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(batch.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {batch.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {batch.expirationDate
                            ? formatDate(batch.expirationDate)
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Lotes</p>
                    <p className="text-2xl font-bold">
                      {supplier.stats?.totalBatches || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Unidades</p>
                      <p className="text-2xl font-bold">
                        {supplier.stats?.totalQuantity || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {supplier.stats && supplier.stats.totalBatches > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Promedio por Lote</p>
                      <p className="text-lg font-semibold">
                        {Math.round(
                          supplier.stats.totalQuantity / supplier.stats.totalBatches
                        )} unidades
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
