'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPatch } from '@/lib/services/apiService';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  code: string;
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  taxRegime?: 'NORMAL' | 'RUI' | 'SPECIAL_REGIME' | 'GOVERNMENT';
  isActive: boolean;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    taxRegime: 'NORMAL' as 'NORMAL' | 'RUI' | 'SPECIAL_REGIME' | 'GOVERNMENT',
    isActive: true,
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const customer = await apiGet<Customer>(`/customers/${id}`);
        setFormData({
          code: customer.code,
          name: customer.name,
          lastName: customer.lastName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          taxId: customer.taxId || '',
          taxRegime: customer.taxRegime || 'NORMAL',
          isActive: customer.isActive,
        });
      } catch (error: any) {
        toast.error('Error al cargar cliente', {
          description: error.message || 'No se pudo cargar el cliente',
        });
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiPatch(`/customers/${id}`, formData);
      toast.success('Cliente actualizado exitosamente');
      router.push('/customers');
    } catch (error: any) {
      toast.error('Error al actualizar cliente', {
        description: error.message || 'No se pudo actualizar el cliente',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-center">Cargando...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/customers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
        <p className="text-gray-600 mt-1">
          Actualiza la información del cliente
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <Label htmlFor="code">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="CLI-0001"
              />
              <p className="text-sm text-gray-500 mt-1">
                Código único del cliente
              </p>
            </div>

            {/* Estado */}
            <div className="flex items-center space-x-2 mt-8">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Cliente activo
              </Label>
            </div>

            {/* Nombre */}
            <div>
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Juan"
              />
            </div>

            {/* Apellido */}
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan.perez@example.com"
              />
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="809-555-0100"
              />
            </div>

            {/* RNC/Cédula */}
            <div>
              <Label htmlFor="taxId">RNC / Cédula</Label>
              <Input
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="001-0000000-0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Número de identificación fiscal
              </p>
            </div>

            {/* Régimen Fiscal */}
            <div className="md:col-span-2 space-y-3">
              <Label>Régimen Fiscal</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="taxRegime-normal"
                    name="taxRegime"
                    value="NORMAL"
                    checked={formData.taxRegime === 'NORMAL'}
                    onChange={(e) => setFormData({ ...formData, taxRegime: 'NORMAL' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="taxRegime-normal" className="cursor-pointer font-normal">
                    Normal (NCF B01) - Contribuyente regular con RNC
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="taxRegime-rui"
                    name="taxRegime"
                    value="RUI"
                    checked={formData.taxRegime === 'RUI'}
                    onChange={(e) => setFormData({ ...formData, taxRegime: 'RUI' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="taxRegime-rui" className="cursor-pointer font-normal">
                    Régimen Simplificado - RUI (NCF B12)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="taxRegime-special"
                    name="taxRegime"
                    value="SPECIAL_REGIME"
                    checked={formData.taxRegime === 'SPECIAL_REGIME'}
                    onChange={(e) => setFormData({ ...formData, taxRegime: 'SPECIAL_REGIME' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="taxRegime-special" className="cursor-pointer font-normal">
                    Regímenes Especiales (NCF B14) - Zonas francas, turismo, etc.
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="taxRegime-government"
                    name="taxRegime"
                    value="GOVERNMENT"
                    checked={formData.taxRegime === 'GOVERNMENT'}
                    onChange={(e) => setFormData({ ...formData, taxRegime: 'GOVERNMENT' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="taxRegime-government" className="cursor-pointer font-normal">
                    Entidad Gubernamental (NCF B15) - Instituciones del Estado
                  </Label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selecciona el tipo de régimen fiscal del cliente para la asignación automática de NCF
              </p>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Calle Principal #123, Sector Centro, Santo Domingo"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <Link href="/customers">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Guardando...' : 'Actualizar Cliente'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
