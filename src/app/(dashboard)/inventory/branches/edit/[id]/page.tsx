'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BranchService } from '@/lib/services/inventoryService';
import { UpdateBranchDto, Branch } from '@/lib/types/inventory';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from 'lucide-react';
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
  const [formData, setFormData] = useState<UpdateBranchDto>({
    code: '',
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    async function loadBranch() {
      try {
        const data = await BranchService.getBranchById(branchId);
        setBranch(data);
        setFormData({
          code: data.code,
          name: data.name,
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      } catch (error) {
        console.error('Error loading branch:', error);
        toast.error('Error al cargar los datos de la sucursal');
        router.push('/inventory/branches');
      } finally {
        setLoading(false);
      }
    }

    loadBranch();
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
      await BranchService.updateBranch(branchId, formData);
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

      <Card>
        <CardHeader>
          <CardTitle>Información de la Sucursal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
