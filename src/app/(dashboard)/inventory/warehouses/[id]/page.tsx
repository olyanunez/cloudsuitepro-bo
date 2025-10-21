'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WarehouseService } from '@/lib/services/inventoryService';
import { Warehouse } from '@/lib/types/inventory';
import { toast } from 'react-hot-toast';
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
      } catch (error) {
        console.error('Error loading warehouse:', error);
        toast.error('Error al cargar los datos del almacén');
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
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error('Error al eliminar el almacén');
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/inventory/warehouses" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles del Almacén</h1>
        </div>
        <div className="flex space-x-2">
          <Link href={`/inventory/warehouses/edit/${warehouse.id}`}>
            <Button variant="outline" className="flex items-center">
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex items-center border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Eliminar
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
