'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiPost, apiGet } from '@/lib/services/apiService';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    supplierType: 'FORMAL' as 'FORMAL' | 'INFORMAL',
    isInformal: false,
    informalReason: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    paymentTerms: '',
    notes: '',
  });

  useEffect(() => {
    // Generate next code when component mounts
    const fetchNextCode = async () => {
      try {
        const response = await apiGet<{ code: string }>('/suppliers/next-code');
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
      await apiPost('/suppliers', formData);
      toast.success('Proveedor creado exitosamente');
      router.push('/suppliers');
    } catch (error: any) {
      toast.error('Error al crear proveedor', {
        description: error.message || 'No se pudo crear el proveedor',
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
        <Link href="/suppliers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proveedores
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nuevo Proveedor</h1>
        <p className="text-gray-600 mt-1">
          Registra un nuevo proveedor en el sistema
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

              {/* Espacio vacío para alineación */}
              <div></div>

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
                <Label htmlFor="taxId">
                  RNC{' '}
                  {formData.supplierType === 'FORMAL' && (
                    <span className="text-sm text-gray-500">(recomendado)</span>
                  )}
                </Label>
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

          {/* Tipo de Proveedor */}
          <div className="mb-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Tipo de Proveedor</h2>
            <div className="grid grid-cols-1 gap-6">
              {/* Selector de Tipo */}
              <div>
                <Label htmlFor="supplierType">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplierType}
                  onValueChange={(value: 'FORMAL' | 'INFORMAL') => {
                    setFormData((prev) => ({
                      ...prev,
                      supplierType: value,
                      isInformal: value === 'INFORMAL',
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FORMAL">
                      Proveedor Formal (con RNC)
                    </SelectItem>
                    <SelectItem value="INFORMAL">
                      Proveedor Informal (sin RNC - Requiere B11)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Los proveedores informales generarán NCF B11 automáticamente
                </p>
              </div>

              {/* Alert para Proveedores Informales */}
              {formData.supplierType === 'INFORMAL' && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Proveedor Informal:</strong> Este proveedor generará
                    automáticamente un NCF tipo B11 (Comprobante para Regímenes
                    Especiales) al recibir mercancía. Debe especificar el motivo
                    por el cual es un proveedor informal.
                  </AlertDescription>
                </Alert>
              )}

              {/* Motivo para Proveedores Informales */}
              {formData.supplierType === 'INFORMAL' && (
                <div>
                  <Label htmlFor="informalReason">
                    Motivo (Proveedor Informal){' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="informalReason"
                    name="informalReason"
                    value={formData.informalReason}
                    onChange={handleChange}
                    rows={3}
                    required={formData.supplierType === 'INFORMAL'}
                    placeholder="Ej: Productor agrícola sin registro mercantil, artesano local, etc."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Explique por qué este proveedor es informal
                  </p>
                </div>
              )}
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
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Proveedor'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
