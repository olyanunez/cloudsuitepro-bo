'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BranchService, WarehouseService } from '@/lib/services/inventoryService';
import { UpdateBranchDto, Branch, Warehouse } from '@/lib/types/inventory';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, PackageIcon, XIcon } from 'lucide-react';
import Link from 'next/link';

interface EditBranchPageProps {
  params: {
    id: string;
  };
}

export default function EditBranchPage({ params }: EditBranchPageProps) {
  const router = useRouter();
  const { id } = params;
  const branchId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<UpdateBranchDto>({
    code: '',
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [branchData, warehousesData] = await Promise.all([
          BranchService.getBranchById(branchId),
          WarehouseService.getWarehouses(),
        ]);

        setBranch(branchData);
        setAllWarehouses(warehousesData);

        // Inicializar los warehouses seleccionados
        const currentWarehouseIds = branchData.warehouses?.map(w => w.id) || [];
        setSelectedWarehouseIds(currentWarehouseIds);

        setFormData({
          code: branchData.code,
          name: branchData.name,
          description: branchData.description || '',
          address: branchData.address || '',
          phone: branchData.phone || '',
          email: branchData.email || '',
        });
      } catch (error) {
        console.error('Error loading branch:', error);
        toast.error('Error al cargar los datos de la sucursal');
        router.push('/inventory/branches');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId, router]);

  const formatPhoneNumber = (value: string) => {
    // Remover todo excepto números
    const phoneNumber = value.replace(/\D/g, '');

    // Aplicar máscara: (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleWarehouseToggle = (warehouseId: number) => {
    setSelectedWarehouseIds((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const handleRemoveWarehouse = (warehouseId: number) => {
    setSelectedWarehouseIds((prev) => prev.filter((id) => id !== warehouseId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code?.trim()) {
      toast.error('El código de la sucursal es obligatorio');
      return;
    }

    if (!formData.name?.trim()) {
      toast.error('El nombre de la sucursal es obligatorio');
      return;
    }

    try {
      setSaving(true);

      // Actualizar información básica
      await BranchService.updateBranch(branchId, formData);

      // Actualizar almacenes asignados
      const currentWarehouseIds = branch?.warehouses?.map((w) => w.id) || [];
      const warehousesToAdd = selectedWarehouseIds.filter((id) => !currentWarehouseIds.includes(id));
      const warehousesToRemove = currentWarehouseIds.filter((id) => !selectedWarehouseIds.includes(id));

      // Asignar nuevos almacenes
      if (warehousesToAdd.length > 0) {
        await BranchService.assignWarehouses(branchId, { warehouseIds: warehousesToAdd });
      }

      // Desasignar almacenes
      for (const warehouseId of warehousesToRemove) {
        await BranchService.unassignWarehouse(branchId, warehouseId);
      }

      toast.success('Sucursal actualizada exitosamente');
      router.push('/inventory/branches');
    } catch (error) {
      console.error('Error updating branch:', error);
      toast.error('Error al actualizar la sucursal');
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
        <Link href="/inventory/branches" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Sucursal</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información básica */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Sucursal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Código <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Ej: SUC-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre de la sucursal"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="(809) 555-1234"
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="sucursal@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Dirección
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="Dirección de la sucursal"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Descripción de la sucursal"
                rows={4}
              />
            </div>

              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Almacenes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  Almacenes
                </CardTitle>
                <CardDescription>
                  Selecciona los almacenes para esta sucursal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Almacenes seleccionados */}
                  {selectedWarehouseIds.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Almacenes Asignados ({selectedWarehouseIds.length})</label>
                      <div className="space-y-2">
                        {allWarehouses
                          .filter((w) => selectedWarehouseIds.includes(w.id))
                          .map((warehouse) => (
                            <div
                              key={warehouse.id}
                              className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">{warehouse.name}</p>
                                {warehouse.address && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {warehouse.address}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveWarehouse(warehouse.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de almacenes disponibles */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Almacenes Disponibles</label>
                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3">
                      {allWarehouses
                        .filter((w) => !selectedWarehouseIds.includes(w.id))
                        .map((warehouse) => (
                          <div
                            key={warehouse.id}
                            className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                            onClick={() => handleWarehouseToggle(warehouse.id)}
                          >
                            <Checkbox
                              id={`warehouse-${warehouse.id}`}
                              checked={selectedWarehouseIds.includes(warehouse.id)}
                              onCheckedChange={() => handleWarehouseToggle(warehouse.id)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`warehouse-${warehouse.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {warehouse.name}
                              </label>
                              {warehouse.address && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {warehouse.address}
                                </p>
                              )}
                              {warehouse.branch && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  Ya asignado a: {warehouse.branch.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      {allWarehouses.filter((w) => !selectedWarehouseIds.includes(w.id)).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          Todos los almacenes están asignados
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Link href="/inventory/branches">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-600">
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
