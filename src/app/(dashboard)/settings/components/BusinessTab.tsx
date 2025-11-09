'use client';

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
import { FileText, Receipt, ShoppingCart, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function BusinessTab() {
  // TODO: Cargar desde backend cuando se implemente la tabla de configuraciones
  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: 'INV',
    autoprint: false,
    includeLogo: true,
    footerText: '',
    termsAndConditions: '',
  });

  const [posSettings, setPosSettings] = useState({
    defaultPaymentMethod: 'CASH',
    enableSounds: true,
    autoprintReceipts: false,
    askForCustomer: true,
  });

  const handleInvoiceChange = (field: string, value: any) => {
    setInvoiceSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePosChange = (field: string, value: any) => {
    setPosSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveInvoiceSettings = () => {
    // TODO: Implementar guardado en backend
    toast.warning('Guardado de configuraciones en desarrollo', {
      description: 'Esta funcionalidad estará disponible próximamente',
    });
  };

  const handleSavePosSettings = () => {
    // TODO: Implementar guardado en backend
    toast.warning('Guardado de configuraciones en desarrollo', {
      description: 'Esta funcionalidad estará disponible próximamente',
    });
  };

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
              <span className="text-2xl font-bold">18%</span>
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
                value={invoiceSettings.invoicePrefix}
                onChange={(e) => handleInvoiceChange('invoicePrefix', e.target.value)}
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
                  checked={invoiceSettings.autoprint}
                  onCheckedChange={(checked) => handleInvoiceChange('autoprint', checked)}
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
                  checked={invoiceSettings.includeLogo}
                  onCheckedChange={(checked) => handleInvoiceChange('includeLogo', checked)}
                />
              </div>
            </div>

            {/* Texto de Pie de Página */}
            <div className="space-y-2">
              <Label htmlFor="footerText">Texto de Pie de Página</Label>
              <Textarea
                id="footerText"
                value={invoiceSettings.footerText}
                onChange={(e) => handleInvoiceChange('footerText', e.target.value)}
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
                value={invoiceSettings.termsAndConditions}
                onChange={(e) => handleInvoiceChange('termsAndConditions', e.target.value)}
                placeholder="Términos de venta, políticas de devolución, etc."
                rows={3}
              />
            </div>

            <Button onClick={handleSaveInvoiceSettings} className="w-full">
              Guardar Configuración de Facturas
            </Button>
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
                value={posSettings.defaultPaymentMethod}
                onValueChange={(value) => handlePosChange('defaultPaymentMethod', value)}
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
                  checked={posSettings.enableSounds}
                  onCheckedChange={(checked) => handlePosChange('enableSounds', checked)}
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
                  checked={posSettings.autoprintReceipts}
                  onCheckedChange={(checked) => handlePosChange('autoprintReceipts', checked)}
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
                  checked={posSettings.askForCustomer}
                  onCheckedChange={(checked) => handlePosChange('askForCustomer', checked)}
                />
              </div>
            </div>

            <Button onClick={handleSavePosSettings} className="w-full">
              Guardar Configuración de POS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
