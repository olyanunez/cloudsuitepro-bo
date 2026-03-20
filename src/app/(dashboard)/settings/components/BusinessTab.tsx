'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, ShoppingCart, ExternalLink, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import TenantSettingsService, { TenantSettings } from '@/lib/services/tenantSettingsService';
import ncfService, { NcfConfiguration } from '@/lib/services/ncfService';

export default function BusinessTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [ncfConfig, setNcfConfig] = useState<NcfConfiguration | null>(null);

  useEffect(() => {
    loadSettings();
    loadNcfConfig();
  }, []);

  const loadNcfConfig = async () => {
    try {
      const config = await ncfService.getConfiguration();
      setNcfConfig(config);
    } catch (error) {
      console.error('Error loading NCF config:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await TenantSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TenantSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await TenantSettingsService.updateSettings({
        invoicePrefix: settings.invoicePrefix,
        autoPrintInvoices: settings.autoPrintInvoices,
        includeLogo: settings.includeLogo,
        invoiceFooter: settings.invoiceFooter || undefined,
        termsAndConditions: settings.termsAndConditions || undefined,
        defaultPaymentMethod: settings.defaultPaymentMethod,
        enableSounds: settings.enableSounds,
        autoPrintReceipts: settings.autoPrintReceipts,
        askForCustomer: settings.askForCustomer,
      });
      toast.success('Configuraciones guardadas correctamente');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Cargando configuraciones...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No se pudieron cargar las configuraciones</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* NCF y Fiscal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuración NCF y Fiscal</CardTitle>
              <CardDescription>
                Gestiona la configuración de comprobantes fiscales (NCF) y DGII
              </CardDescription>
            </div>
            <Link href="/ncf/config" target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Configuración NCF
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tasa ITBIS</p>
                <p className="text-sm text-muted-foreground">Impuesto aplicado a las ventas</p>
              </div>
              <span className="text-2xl font-bold">{ncfConfig?.itbisRate || 18}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-asignar NCF</p>
                <p className="text-sm text-muted-foreground">
                  Asignación automática de comprobantes fiscales
                </p>
              </div>
              <span className="text-sm font-medium text-green-600">Activo</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Para configurar secuencias NCF, tipos de comprobantes y más, accede a la configuración
              completa.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Facturas y POS - Lado a Lado */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facturas y Comprobantes
            </CardTitle>
            <CardDescription>Personaliza tus facturas y recibos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prefijo de Facturas */}
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Prefijo de Facturas</Label>
              <Input
                id="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="INV"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Ej: "INV" generará facturas como INV-00001, INV-00002, etc.
              </p>
            </div>

            {/* Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-imprimir facturas</Label>
                  <p className="text-sm text-muted-foreground">
                    Imprime automáticamente después de crear una factura
                  </p>
                </div>
                <Switch
                  checked={settings.autoPrintInvoices}
                  onCheckedChange={(checked) => handleChange('autoPrintInvoices', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Incluir logo en comprobantes</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra el logo de la empresa en facturas impresas
                  </p>
                </div>
                <Switch
                  checked={settings.includeLogo}
                  onCheckedChange={(checked) => handleChange('includeLogo', checked)}
                />
              </div>
            </div>

            {/* Texto de Pie de Página */}
            <div className="space-y-2">
              <Label htmlFor="footerText">Texto de Pie de Página</Label>
              <Textarea
                id="footerText"
                value={settings.invoiceFooter || ''}
                onChange={(e) => handleChange('invoiceFooter', e.target.value)}
                placeholder="Ej: ¡Gracias por su compra!"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Mensaje que aparecerá al final de las facturas
              </p>
            </div>

            {/* Términos y Condiciones */}
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Términos y Condiciones</Label>
              <Textarea
                id="termsAndConditions"
                value={settings.termsAndConditions || ''}
                onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                placeholder="Términos de venta, políticas de devolución, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de POS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Punto de Venta (POS)
            </CardTitle>
            <CardDescription>Preferencias para el punto de venta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Método de Pago Predeterminado */}
            <div className="space-y-2">
              <Label htmlFor="defaultPayment">Método de Pago Predeterminado</Label>
              <Select
                value={settings.defaultPaymentMethod}
                onValueChange={(value) => handleChange('defaultPaymentMethod', value)}
              >
                <SelectTrigger id="defaultPayment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="CARD">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFER">Transferencia</SelectItem>
                  <SelectItem value="MIXED">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switches POS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activar sonidos de confirmación</Label>
                  <p className="text-sm text-muted-foreground">
                    Beep al escanear códigos de barras y otras acciones
                  </p>
                </div>
                <Switch
                  checked={settings.enableSounds}
                  onCheckedChange={(checked) => handleChange('enableSounds', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-imprimir recibos</Label>
                  <p className="text-sm text-muted-foreground">
                    Imprime el recibo automáticamente después de cada venta
                  </p>
                </div>
                <Switch
                  checked={settings.autoPrintReceipts}
                  onCheckedChange={(checked) => handleChange('autoPrintReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Solicitar cliente en cada venta</Label>
                  <p className="text-sm text-muted-foreground">
                    Requiere seleccionar un cliente antes de finalizar la venta
                  </p>
                </div>
                <Switch
                  checked={settings.askForCustomer}
                  onCheckedChange={(checked) => handleChange('askForCustomer', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de Guardar - Ancho completo */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Todas las Configuraciones'}
        </Button>
      </div>
    </div>
  );
}
