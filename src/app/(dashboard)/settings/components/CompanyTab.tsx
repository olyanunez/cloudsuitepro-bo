'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TenantService, UpdateTenantDto } from '@/lib/services/tenantService';
import { useTenant } from '@/lib/contexts/TenantContext';
import { LogoUpload } from '@/components/settings/LogoUpload';

export default function CompanyTab() {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: '',
  });

  // Cargar datos de la empresa
  useEffect(() => {
    if (tenantId) {
      loadCompanyData();
    }
  }, [tenantId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const tenant = await TenantService.getTenantById(tenantId!);
      setFormData({
        name: tenant.name || '',
        taxId: tenant.taxId || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        description: tenant.description || '',
        logo: tenant.logo || '',
      });
    } catch (error: any) {
      console.error('Error loading company data:', error);
      toast.error('Error al cargar la información de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (file: File | null, previewUrl: string | null) => {
    setLogoFile(file);
    if (previewUrl) {
      setFormData((prev) => ({ ...prev, logo: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }

    if (formData.taxId && !/^[0-9]{9}$|^[0-9]{11}$/.test(formData.taxId)) {
      toast.error('El RNC debe tener 9 u 11 dígitos');
      return;
    }

    try {
      setSaving(true);

      // Si hay un archivo de logo seleccionado, subirlo primero
      let logoUrl = formData.logo;
      if (logoFile) {
        try {
          setUploading(true);
          const uploadResult = await TenantService.uploadLogo(tenantId!, logoFile);
          logoUrl = uploadResult.url;
          toast.success('Logo subido correctamente');
        } catch (uploadError: any) {
          console.error('Error uploading logo:', uploadError);
          toast.error(uploadError.message || 'Error al subir el logo');
          return;
        } finally {
          setUploading(false);
        }
      }

      const updateData: UpdateTenantDto = {
        name: formData.name,
        taxId: formData.taxId || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        description: formData.description || undefined,
      };

      await TenantService.updateTenant(tenantId!, updateData);

      // Actualizar el formData con la nueva URL del logo
      setFormData((prev) => ({ ...prev, logo: logoUrl }));
      setLogoFile(null);

      toast.success('Información de la empresa actualizada correctamente');

      // Recargar los datos para obtener el logo actualizado
      await loadCompanyData();
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast.error(error.message || 'Error al actualizar la información de la empresa');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Cargando información de la empresa...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Empresa</CardTitle>
        <CardDescription>
          Administra la información de tu empresa que aparecerá en facturas y documentos fiscales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica - 2 columnas */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Nombre de la Empresa */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Comercial El Sol SRL"
                  required
                />
              </div>

              {/* RNC / Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId">
                  RNC / Cédula <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="Ej: 123456789 o 12345678901"
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground">
                  Requerido para generación de NCF y comprobantes fiscales. Debe tener 9 u 11 dígitos.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@empresa.com"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej: 809-555-1234"
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Dirección completa de la empresa"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Esta dirección aparecerá en las facturas impresas
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción de la empresa (opcional)"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Logo - Ancho completo */}
          <div className="space-y-2">
            <Label>Logo de la Empresa</Label>
            <LogoUpload
              currentLogo={formData.logo}
              onImageChange={handleLogoChange}
            />
            <p className="text-xs text-muted-foreground">
              Este logo aparecerá en las facturas y documentos de tu empresa
            </p>
          </div>

          {/* Advertencia RNC */}
          {formData.taxId && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Importante: Cambios en el RNC
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  Modificar el RNC afectará los documentos fiscales futuros. Asegúrate de que el número sea correcto.
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={saving || uploading}>
              <Save className="mr-2 h-4 w-4" />
              {uploading ? 'Subiendo logo...' : saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={loadCompanyData}
              disabled={saving || uploading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
