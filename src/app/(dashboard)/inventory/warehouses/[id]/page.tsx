'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WarehouseService } from '@/lib/services/inventoryService';
import { Warehouse } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WarehouseDetailsPageProps {
  params: {
    id: string;
  };
}

export default function WarehouseDetailsPage({ params }: WarehouseDetailsPageProps) {
  const router = useRouter();
  const { id } = params;
  const warehouseId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function loadWarehouse() {
      try {
        const data = await WarehouseService.getWarehouseById(warehouseId);
        setWarehouse(data);
      } catch (error: any) {
        console.error('Error loading warehouse:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'No se pudieron cargar los datos del almacén';
        toast.error('Error al cargar almacén', {
          description: errorMessage,
        });
        router.push('/inventory/warehouses');
      } finally {
        setLoading(false);
      }
    }

    loadWarehouse();
  }, [warehouseId, router]);

  const handleDelete = async () => {
    try {
      await WarehouseService.deleteWarehouse(warehouseId);
      toast.success('Almacén eliminado exitosamente');
      router.push('/inventory/warehouses');
    } catch (error: any) {
      console.error('Error deleting warehouse:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo eliminar el almacén';
      toast.error('Error al eliminar almacén', {
        description: errorMessage,
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Almacén no encontrado</h1>
          <Link href="/inventory/warehouses">
            <Button>Volver a la lista de almacenes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/inventory/warehouses">
            <Button variant="outline" size="sm" className="self-start h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Volver</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Detalles del Almacén</h1>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Link href={`/inventory/warehouses/edit/${warehouse.id}`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <PencilIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Eliminar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h3>
                <p className="mt-1 text-lg">{warehouse.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</h3>
                <p className="mt-1">{warehouse.address || 'No especificada'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</h3>
                <p className="mt-1">{warehouse.description || 'Sin descripción'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado y Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${warehouse.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                    {warehouse.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</h3>
                <p className="mt-1">
                  {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Actualización</h3>
                <p className="mt-1">
                  {warehouse.updatedAt ? new Date(warehouse.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el almacén y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
