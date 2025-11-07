'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { apiPost, apiGet } from '@/lib/services/apiService';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    isActive: true,
  });

  useEffect(() => {
    // Generate next code when component mounts
    const fetchNextCode = async () => {
      try {
        const response = await apiGet<{ code: string }>('/customers/next-code');
        setFormData((prev) => ({ ...prev, code: response.code }));
      } catch (error) {
        console.error('Error fetching next code:', error);
      }
    };
    fetchNextCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiPost('/customers', formData);
      toast.success('Cliente creado exitosamente');
      router.push('/customers');
    } catch (error: any) {
      toast.error('Error al crear cliente', {
        description: error.message || 'No se pudo crear el cliente',
      });
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
        <p className="text-gray-600 mt-1">
          Registra un nuevo cliente en el sistema
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

            {/* Empty space for alignment */}
            <div></div>

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
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
