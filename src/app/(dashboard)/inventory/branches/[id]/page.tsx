'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BranchService, WarehouseService } from '@/lib/services/inventoryService';
import { Branch, Warehouse } from '@/lib/types/inventory';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, PencilIcon, PlusIcon, TrashIcon, Building2, MapPin, Phone, Mail, Package } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
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

interface BranchDetailPageProps {
  params: {
    id: string;
  };
}

export default function BranchDetailPage({ params }: BranchDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  const branchId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  const [warehouseToUnassign, setWarehouseToUnassign] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, [branchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [branchData, warehousesData] = await Promise.all([
        BranchService.getBranchById(branchId),
        WarehouseService.getWarehouses(),
      ]);
      setBranch(branchData);
      setAllWarehouses(warehousesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
      router.push('/inventory/branches');
    } finally {
      setLoading(false);
    }
  };

  const availableWarehouses = allWarehouses.filter(
    (warehouse) =>
      !warehouse.branchId || warehouse.branchId === branchId
  );

  const handleOpenAssignDialog = () => {
    setSelectedWarehouses([]);
    setIsAssignDialogOpen(true);
  };

  const handleWarehouseSelection = (warehouseId: number, checked: boolean) => {
    setSelectedWarehouses((prev) =>
      checked
        ? [...prev, warehouseId]
        : prev.filter((id) => id !== warehouseId)
    );
  };

  const handleAssignWarehouses = async () => {
    if (selectedWarehouses.length === 0) {
      toast.error('Debe seleccionar al menos un almacén');
      return;
    }

    try {
      setAssigning(true);
      const updatedBranch = await BranchService.assignWarehouses(branchId, {
        warehouseIds: selectedWarehouses,
      });
      setBranch(updatedBranch);
      toast.success('Almacenes asignados exitosamente');
      setIsAssignDialogOpen(false);
      setSelectedWarehouses([]);
      loadData(); // Reload to refresh warehouse list
    } catch (error) {
      console.error('Error assigning warehouses:', error);
      toast.error('Error al asignar almacenes');
    } finally {
      setAssigning(false);
    }
  };

  const confirmUnassign = (warehouseId: number) => {
    setWarehouseToUnassign(warehouseId);
    setIsUnassignDialogOpen(true);
  };

  const handleUnassignWarehouse = async () => {
    if (!warehouseToUnassign) return;

    try {
      const updatedBranch = await BranchService.unassignWarehouse(branchId, warehouseToUnassign);
      setBranch(updatedBranch);
      toast.success('Almacén desasignado exitosamente');
      setIsUnassignDialogOpen(false);
      setWarehouseToUnassign(null);
      loadData(); // Reload to refresh warehouse list
    } catch (error) {
      console.error('Error unassigning warehouse:', error);
      toast.error('Error al desasignar el almacén');
      setWarehouseToUnassign(null);
      setIsUnassignDialogOpen(false);
    }
  };

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
        <p>Sucursal no encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/inventory/branches" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles de la Sucursal</h1>
        </div>
        <Link href={`/inventory/branches/edit/${branch.id}`}>
          <Button className="bg-primary hover:bg-primary-600">
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Branch Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Código</p>
              <p className="text-base font-semibold">{branch.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
              <p className="text-base font-semibold">{branch.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                Dirección
              </p>
              <p className="text-base">{branch.address || 'No especificada'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <Phone className="mr-1 h-4 w-4" />
                Teléfono
              </p>
              <p className="text-base">{branch.phone || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                Email
              </p>
              <p className="text-base">{branch.email || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${branch.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {branch.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
          {branch.description && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</p>
              <p className="text-base">{branch.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Warehouses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Almacenes Asignados ({branch.warehouses?.length || 0})
          </CardTitle>
          <Button onClick={handleOpenAssignDialog} size="sm" className="bg-primary hover:bg-primary-600">
            <PlusIcon className="mr-2 h-4 w-4" />
            Asignar Almacenes
          </Button>
        </CardHeader>
        <CardContent>
          {!branch.warehouses || branch.warehouses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay almacenes asignados a esta sucursal
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branch.warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base">{warehouse.name}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                      onClick={() => confirmUnassign(warehouse.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {warehouse.description || 'Sin descripción'}
                  </p>
                  {warehouse.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {warehouse.address}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Warehouses Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Asignar Almacenes</DialogTitle>
            <DialogDescription>
              Seleccione los almacenes que desea asignar a esta sucursal
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto py-4">
            {availableWarehouses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No hay almacenes disponibles para asignar
              </p>
            ) : (
              <div className="space-y-4">
                {availableWarehouses.map((warehouse) => {
                  const isAlreadyAssigned = branch.warehouses?.some(w => w.id === warehouse.id);
                  return (
                    <div key={warehouse.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`warehouse-${warehouse.id}`}
                        checked={selectedWarehouses.includes(warehouse.id) || isAlreadyAssigned}
                        onCheckedChange={(checked) => {
                          if (!isAlreadyAssigned) {
                            handleWarehouseSelection(warehouse.id, checked as boolean);
                          }
                        }}
                        disabled={isAlreadyAssigned}
                      />
                      <label
                        htmlFor={`warehouse-${warehouse.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium">{warehouse.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {warehouse.description || 'Sin descripción'}
                        </p>
                        {warehouse.address && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {warehouse.address}
                          </p>
                        )}
                        {isAlreadyAssigned && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Ya asignado
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssignWarehouses}
              disabled={selectedWarehouses.length === 0 || assigning}
              className="bg-primary hover:bg-primary-600"
            >
              {assigning ? 'Asignando...' : `Asignar (${selectedWarehouses.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasignar almacén?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desasignará el almacén de esta sucursal. El almacén quedará disponible para ser asignado a otra sucursal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassignWarehouse} className="bg-red-500 hover:bg-red-600">
              Desasignar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
