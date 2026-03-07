'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WarehouseService } from '@/lib/services/inventoryService';
import { CreateWarehouseDto } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreateWarehousePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateWarehouseDto>({
    name: '',
    description: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre del almacén es obligatorio');
      return;
    }

    try {
      setSaving(true);
      await WarehouseService.createWarehouse(formData);
      toast.success('Almacén creado exitosamente');
      router.push('/inventory/warehouses');
    } catch (error: any) {
      console.error('Error creating warehouse:', error);
      toast.error('Error al crear el almacén', {
        description: error.message || 'No se pudo crear el cliente',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/inventory/warehouses" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Nuevo Almacén</h1>
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
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-600"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
