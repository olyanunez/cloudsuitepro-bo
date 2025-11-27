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

interface Supplier {
  id: number;
  code: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
}

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    paymentTerms: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const supplier = await apiGet<Supplier>(`/suppliers/${id}`);
        setFormData({
          code: supplier.code,
          name: supplier.name,
          taxId: supplier.taxId || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          contactName: supplier.contactName || '',
          contactPhone: supplier.contactPhone || '',
          contactEmail: supplier.contactEmail || '',
          paymentTerms: supplier.paymentTerms || '',
          notes: supplier.notes || '',
          isActive: supplier.isActive,
        });
      } catch (error: any) {
        toast.error('Error al cargar proveedor', {
          description: error.message || 'No se pudo cargar el proveedor',
        });
        router.push('/suppliers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiPatch(`/suppliers/${id}`, formData);
      toast.success('Proveedor actualizado exitosamente');
      router.push('/suppliers');
    } catch (error: any) {
      toast.error('Error al actualizar proveedor', {
        description: error.message || 'No se pudo actualizar el proveedor',
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
        <Link href="/suppliers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proveedores
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Proveedor</h1>
        <p className="text-gray-600 mt-1">
          Actualiza la información del proveedor
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          {/* Información General */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Información General</h2>
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
                  placeholder="SUP-0001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Código único del proveedor
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Proveedor activo
                </Label>
              </div>

              {/* Nombre */}
              <div>
                <Label htmlFor="name">
                  Nombre / Razón Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Distribuidora XYZ, S.R.L."
                />
              </div>

              {/* RNC */}
              <div>
                <Label htmlFor="taxId">RNC</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="000-00000-0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Número de identificación fiscal
                </p>
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
                  placeholder="info@proveedor.com"
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

              {/* Dirección */}
              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Calle Principal #123, Sector Industrial, Santo Domingo"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="mb-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Persona de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre de Contacto */}
              <div>
                <Label htmlFor="contactName">Nombre Completo</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Teléfono de Contacto */}
              <div>
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="809-555-0100"
                />
              </div>

              {/* Email de Contacto */}
              <div className="md:col-span-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="contacto@proveedor.com"
                />
              </div>
            </div>
          </div>

          {/* Términos y Notas */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Información Adicional</h2>
            <div className="grid grid-cols-1 gap-6">
              {/* Términos de Pago */}
              <div>
                <Label htmlFor="paymentTerms">Términos de Pago</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  placeholder="Ej: 30 días, 50% adelanto, contado, etc."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Condiciones de pago acordadas con el proveedor
                </p>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Información adicional sobre el proveedor..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <Link href="/suppliers">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Guardando...' : 'Actualizar Proveedor'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
