'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Monitor, Bell, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemTab() {
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'auto',
    sidebarExpanded: true,
    compactView: false,
    itemsPerPage: '25',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    ncfExpirationAlerts: true,
    dailySalesSummary: false,
    ncfExpirationDays: '30',
  });

  const [regionalSettings, setRegionalSettings] = useState({
    currency: 'DOP',
    timezone: 'America/Santo_Domingo',
    firstDayOfWeek: 'sunday',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
  });

  useEffect(() => {
    // Cargar preferencias desde localStorage
    const savedTheme = localStorage.getItem('theme') || 'auto';
    setDisplaySettings((prev) => ({ ...prev, theme: savedTheme }));
  }, []);

  const handleThemeChange = (theme: string) => {
    setDisplaySettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);

    // Aplicar tema
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto - usar preferencia del sistema
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    toast.success(`Tema cambiado a: ${theme === 'auto' ? 'Automático' : theme === 'dark' ? 'Oscuro' : 'Claro'}`);
  };

  const handleDisplayChange = (field: string, value: any) => {
    setDisplaySettings((prev) => ({ ...prev, [field]: value }));
    toast.success('Preferencia guardada');
  };

  const handleNotificationChange = (field: string, value: any) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: value }));
    toast.success('Preferencia de notificación guardada');
  };

  const handleRegionalChange = (field: string, value: any) => {
    setRegionalSettings((prev) => ({ ...prev, [field]: value }));
    toast.success('Configuración regional guardada');
  };

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
          <CardContent className="space-y-6">
            {/* Tema */}
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select value={displaySettings.theme} onValueChange={handleThemeChange}>
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
                value={displaySettings.itemsPerPage}
                onValueChange={(value) => handleDisplayChange('itemsPerPage', value)}
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
                  checked={displaySettings.sidebarExpanded}
                  onCheckedChange={(checked) => handleDisplayChange('sidebarExpanded', checked)}
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
                  checked={displaySettings.compactView}
                  onCheckedChange={(checked) => handleDisplayChange('compactView', checked)}
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
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
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
                  checked={notificationSettings.lowStockAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('lowStockAlerts', checked)}
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
                  checked={notificationSettings.ncfExpirationAlerts}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('ncfExpirationAlerts', checked)
                  }
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
                  checked={notificationSettings.dailySalesSummary}
                  onCheckedChange={(checked) => handleNotificationChange('dailySalesSummary', checked)}
                />
              </div>
            </div>

            {/* Días de Alerta NCF */}
            <div className="space-y-2">
              <Label htmlFor="ncfExpirationDays">
                Alertar con cuántos días de anticipación (NCF)
              </Label>
              <Select
                value={notificationSettings.ncfExpirationDays}
                onValueChange={(value) => handleNotificationChange('ncfExpirationDays', value)}
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

      {/* Segunda fila - Configuración Regional en ancho completo */}
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
                value={regionalSettings.currency}
                onValueChange={(value) => handleRegionalChange('currency', value)}
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
                value={regionalSettings.timezone}
                onValueChange={(value) => handleRegionalChange('timezone', value)}
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
                value={regionalSettings.dateFormat}
                onValueChange={(value) => handleRegionalChange('dateFormat', value)}
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
                value={regionalSettings.timeFormat}
                onValueChange={(value) => handleRegionalChange('timeFormat', value)}
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
                value={regionalSettings.firstDayOfWeek}
                onValueChange={(value) => handleRegionalChange('firstDayOfWeek', value)}
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
    </div>
  );
}
