'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WarehouseService } from '@/lib/services/inventoryService';
import { UpdateWarehouseDto, Warehouse } from '@/lib/types/inventory';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

interface EditWarehousePageProps {
  params: {
    id: string;
  };
}

export default function EditWarehousePage({ params }: EditWarehousePageProps) {
  const router = useRouter();
  const { id } = params;
  const warehouseId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<UpdateWarehouseDto>({
    name: '',
    description: '',
    address: '',
  });

  useEffect(() => {
    async function loadWarehouse() {
      try {
        const data = await WarehouseService.getWarehouseById(warehouseId);
        setWarehouse(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          address: data.address || '',
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('El nombre del almacén es obligatorio');
      return;
    }

    try {
      setSaving(true);
      await WarehouseService.updateWarehouse(warehouseId, formData);
      toast.success('Almacén actualizado exitosamente');
      router.push('/inventory/warehouses');
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast.error('Error al actualizar el almacén');
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
        <Link href="/inventory/warehouses" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Almacén</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Almacén</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del almacén"
                  required
                />
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
                  placeholder="Dirección del almacén"
                />
              </div>
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
                placeholder="Descripción del almacén"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/inventory/warehouses">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-600">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
