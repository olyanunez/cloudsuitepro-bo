'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Branch } from '@/lib/types/inventory';
import { BranchService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, PencilIcon, MapPinIcon, PhoneIcon, MailIcon, PackageIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadBranch() {
      try {
        const branchData = await BranchService.getBranchById(parseInt(branchId));
        setBranch(branchData);
      } catch (error) {
        console.error('Error loading branch:', error);
      } finally {
        setLoading(false);
      }
    }

    if (branchId) {
      loadBranch();
    }
  }, [branchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <p className="text-yellow-800 dark:text-yellow-200">Sucursal no encontrada</p>
        </div>
        <div className="mt-4">
          <Link href="/inventory/branches">
            <Button variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a Sucursales
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/inventory/branches">
            <Button variant="outline" size="sm" className="self-start">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{branch.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Código: {branch.code}</p>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Link href={`/inventory/branches/edit/${branch.id}`}>
            <Button size="sm">
              <PencilIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información General */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Detalles de la sucursal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Código
                  </label>
                  <p className="mt-1 text-base font-medium">{branch.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Nombre
                  </label>
                  <p className="mt-1 text-base font-medium">{branch.name}</p>
                </div>
              </div>

              {branch.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Descripción
                  </label>
                  <p className="mt-1 text-base">{branch.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  {branch.address && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Dirección</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{branch.address}</p>
                      </div>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{branch.phone}</p>
                      </div>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-start gap-3">
                      <MailIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Correo Electrónico</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{branch.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Almacenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Almacenes Asignados
              </CardTitle>
              <CardDescription>
                {branch.warehouses?.length || 0} almacén(es) en esta sucursal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {branch.warehouses && branch.warehouses.length > 0 ? (
                <div className="space-y-3">
                  {branch.warehouses.map((warehouse) => (
                    <div
                      key={warehouse.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{warehouse.name}</h4>
                        {warehouse.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {warehouse.description}
                          </p>
                        )}
                        {warehouse.address && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {warehouse.address}
                          </p>
                        )}
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            warehouse.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}
                        >
                          {warehouse.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <PackageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay almacenes asignados a esta sucursal</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información Adicional */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {branch.isActive ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-base font-medium text-green-600">Activa</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <span className="text-base font-medium text-red-600">Inactiva</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Fecha de Creación</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(branch.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Última Actualización</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(branch.updatedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Almacenes</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {branch.warehouses?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Almacenes Activos</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {branch.warehouses?.filter(w => w.isActive).length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
