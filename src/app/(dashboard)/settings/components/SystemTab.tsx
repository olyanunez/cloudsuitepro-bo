'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Monitor, Bell, Globe, Save, Printer } from 'lucide-react';
import { toast } from 'sonner';
import UserPreferencesService, { UserPreferences } from '@/lib/services/userPreferencesService';
import { applyTheme } from '@/components/providers/ThemeProvider';

export default function SystemTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await UserPreferencesService.getPreferences();
      setPreferences(data);

      // Aplicar tema inmediatamente
      applyTheme(data.theme);
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      toast.error('Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserPreferences, value: any) => {
    if (preferences) {
      const newPreferences = { ...preferences, [field]: value };
      setPreferences(newPreferences);

      // Aplicar tema inmediatamente si cambia
      if (field === 'theme') {
        applyTheme(value);
        // Emitir evento para que otros componentes se enteren del cambio
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: value } }));
      }

      // Emitir evento cuando cambia la vista compacta
      if (field === 'compactView') {
        window.dispatchEvent(new CustomEvent('preferencesChanged', { detail: { compactView: value } }));
      }
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await UserPreferencesService.updatePreferences({
        theme: preferences.theme,
        sidebarExpanded: preferences.sidebarExpanded,
        compactView: preferences.compactView,
        itemsPerPage: preferences.itemsPerPage,
        emailNotifications: preferences.emailNotifications,
        lowStockAlerts: preferences.lowStockAlerts,
        ncfExpirationAlerts: preferences.ncfExpirationAlerts,
        dailySalesSummary: preferences.dailySalesSummary,
        ncfExpirationDays: preferences.ncfExpirationDays,
        currency: preferences.currency,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat,
        firstDayOfWeek: preferences.firstDayOfWeek,
        printBrowserInvoice: preferences.printBrowserInvoice,
        printThermalVoucher: preferences.printThermalVoucher,
      });
      toast.success('Preferencias guardadas correctamente');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudieron guardar las preferencias';
      toast.error('Error al guardar preferencias', {
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Cargando preferencias...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No se pudieron cargar las preferencias</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primera fila - Apariencia y Notificaciones lado a lado */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Preferencias de Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Apariencia y Visualización
            </CardTitle>
            <CardDescription>Personaliza cómo se ve la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">{/* Tema */}
            {/* Tema */}
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => handleChange('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático (según el sistema)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items por Página */}
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Elementos por página (tablas)</Label>
              <Select
                value={preferences.itemsPerPage.toString()}
                onValueChange={(value) => handleChange('itemsPerPage', parseInt(value))}
              >
                <SelectTrigger id="itemsPerPage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sidebar expandido por defecto</Label>
                  <p className="text-sm text-muted-foreground">
                    Mantener el menú lateral abierto al cargar
                  </p>
                </div>
                <Switch
                  checked={preferences.sidebarExpanded}
                  onCheckedChange={(checked) => handleChange('sidebarExpanded', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vista compacta de tablas</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce el espaciado en las tablas para ver más datos
                  </p>
                </div>
                <Switch
                  checked={preferences.compactView}
                  onCheckedChange={(checked) => handleChange('compactView', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configura tus preferencias de notificación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de stock bajo</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando los productos tengan poco inventario
                  </p>
                </div>
                <Switch
                  checked={preferences.lowStockAlerts}
                  onCheckedChange={(checked) => handleChange('lowStockAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de expiración de NCF</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando las secuencias NCF estén por vencer
                  </p>
                </div>
                <Switch
                  checked={preferences.ncfExpirationAlerts}
                  onCheckedChange={(checked) => handleChange('ncfExpirationAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumen diario de ventas</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir un resumen de ventas cada día por email
                  </p>
                </div>
                <Switch
                  checked={preferences.dailySalesSummary}
                  onCheckedChange={(checked) => handleChange('dailySalesSummary', checked)}
                />
              </div>
            </div>

            {/* Días de Alerta NCF */}
            <div className="space-y-2">
              <Label htmlFor="ncfExpirationDays">
                Alertar con cuántos días de anticipación (NCF)
              </Label>
              <Select
                value={preferences.ncfExpirationDays.toString()}
                onValueChange={(value) => handleChange('ncfExpirationDays', parseInt(value))}
              >
                <SelectTrigger id="ncfExpirationDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila - Preferencias de Impresión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Preferencias de Impresión
          </CardTitle>
          <CardDescription>Configura cómo deseas imprimir las facturas en el POS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Imprimir factura estándar (navegador)</Label>
                <p className="text-sm text-muted-foreground">
                  Imprime la factura tradicional con formato completo usando el navegador
                </p>
              </div>
              <Switch
                checked={preferences.printBrowserInvoice}
                onCheckedChange={(checked) => handleChange('printBrowserInvoice', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Imprimir voucher térmico</Label>
                <p className="text-sm text-muted-foreground">
                  Imprime un comprobante compacto usando impresora térmica vía Printer Service
                </p>
              </div>
              <Switch
                checked={preferences.printThermalVoucher}
                onCheckedChange={(checked) => handleChange('printThermalVoucher', checked)}
              />
            </div>

            {!preferences.printBrowserInvoice && !preferences.printThermalVoucher && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Advertencia:</strong> No has seleccionado ninguna opción de impresión.
                  Las facturas no se imprimirán automáticamente.
                </p>
              </div>
            )}

            {preferences.printBrowserInvoice && preferences.printThermalVoucher && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Se imprimirán ambos formatos: factura estándar y voucher térmico.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tercera fila - Configuración Regional en ancho completo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuración Regional
          </CardTitle>
          <CardDescription>Formato de fecha, hora y moneda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Moneda */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOP">RD$ - Peso Dominicano</SelectItem>
                  <SelectItem value="USD">$ - Dólar Estadounidense</SelectItem>
                  <SelectItem value="EUR">€ - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zona Horaria */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Santo_Domingo">
                    República Dominicana (GMT-4)
                  </SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato de Fecha */}
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Fecha</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => handleChange('dateFormat', value)}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato de Hora */}
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Formato de Hora</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => handleChange('timeFormat', value)}
              >
                <SelectTrigger id="timeFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 horas (3:30 PM)</SelectItem>
                  <SelectItem value="24h">24 horas (15:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primer Día de la Semana */}
            <div className="space-y-2">
              <Label htmlFor="firstDayOfWeek">Primer día de la semana</Label>
              <Select
                value={preferences.firstDayOfWeek}
                onValueChange={(value) => handleChange('firstDayOfWeek', value)}
              >
                <SelectTrigger id="firstDayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Domingo</SelectItem>
                  <SelectItem value="monday">Lunes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar - Ancho completo */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Todas las Preferencias'}
        </Button>
      </div>
    </div>
  );
}
