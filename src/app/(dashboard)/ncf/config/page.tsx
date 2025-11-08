'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Info } from 'lucide-react';
import { toast } from 'sonner';
import ncfService, {
  NcfConfiguration,
  CreateNcfConfigurationDto,
} from '@/lib/services/ncfService';

const formSchema = z.object({
  autoAssignNcf: z.boolean(),
  requireNcfForInvoice: z.boolean(),
  itbisRate: z.coerce
    .number()
    .min(0, 'La tasa debe ser mayor o igual a 0')
    .max(100, 'La tasa no puede ser mayor a 100'),
  allowManualNcf: z.boolean(),
  requireCustomerRnc: z.boolean(),
  alertDaysBeforeExpiry: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NcfConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<NcfConfiguration | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoAssignNcf: true,
      requireNcfForInvoice: false,
      itbisRate: 18,
      allowManualNcf: false,
      requireCustomerRnc: false,
      alertDaysBeforeExpiry: 30,
    },
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const data = await ncfService.getConfiguration();
      setConfig(data);
      form.reset({
        autoAssignNcf: data.autoAssignNcf,
        requireNcfForInvoice: data.requireNcfForInvoice,
        itbisRate: data.itbisRate, // Ya viene como porcentaje (18, no 0.18)
        allowManualNcf: data.allowManualNcf,
        requireCustomerRnc: data.requireCustomerRnc,
        alertDaysBeforeExpiry: data.alertDaysBeforeExpiry,
      });
    } catch (error: any) {
      // Si no hay configuración, usar valores por defecto
      if (error.response?.status === 404) {
        console.log('No hay configuración NCF, usando valores por defecto');
      } else {
        console.error('Error cargando configuración:', error);
        toast.error('Error al cargar la configuración NCF');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setSaving(true);
      const dto: CreateNcfConfigurationDto = {
        autoAssignNcf: data.autoAssignNcf,
        requireNcfForInvoice: data.requireNcfForInvoice,
        itbisRate: data.itbisRate, // Ya es porcentaje (18, no 0.18)
        allowManualNcf: data.allowManualNcf,
        requireCustomerRnc: data.requireCustomerRnc,
        alertDaysBeforeExpiry: data.alertDaysBeforeExpiry,
      };

      const updated = await ncfService.upsertConfiguration(dto);
      setConfig(updated);
      toast.success('Configuración guardada exitosamente');
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      toast.error(
        error.response?.data?.message || 'Error al guardar la configuración'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Configuración NCF</h1>
          <p className="text-muted-foreground">
            Ajustes del sistema de Números de Comprobante Fiscal
          </p>
        </div>
      </div>

      {/* Alerta informativa */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta configuración afecta cómo el sistema maneja los NCF en las
          facturas. Asegúrate de configurar correctamente según los requisitos
          de la DGII.
        </AlertDescription>
      </Alert>

      {/* Formulario de configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Auto-asignar NCF */}
              <FormField
                control={form.control}
                name="autoAssignNcf"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Auto-asignar NCF
                      </FormLabel>
                      <FormDescription>
                        Asignar automáticamente un NCF a cada factura creada.
                        Recomendado para cumplimiento fiscal.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Requerir NCF para factura */}
              <FormField
                control={form.control}
                name="requireNcfForInvoice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requerir NCF para Factura
                      </FormLabel>
                      <FormDescription>
                        No permitir crear facturas sin NCF asignado. Útil para
                        garantizar cumplimiento total.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Permitir NCF manual */}
              <FormField
                control={form.control}
                name="allowManualNcf"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Permitir NCF Manual
                      </FormLabel>
                      <FormDescription>
                        Permitir ingresar NCF manualmente en lugar de usar
                        secuencias automáticas. No recomendado excepto para
                        casos especiales.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Requerir RNC del cliente */}
              <FormField
                control={form.control}
                name="requireCustomerRnc"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requerir RNC del Cliente
                      </FormLabel>
                      <FormDescription>
                        Solicitar obligatoriamente el RNC o cédula del cliente
                        para emitir comprobantes fiscales.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tasa de ITBIS */}
              <FormField
                control={form.control}
                name="itbisRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasa de ITBIS (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        placeholder="18"
                      />
                    </FormControl>
                    <FormDescription>
                      Tasa de ITBIS (IVA) aplicable en República Dominicana.
                      Actualmente es 18%.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Días de alerta antes de vencimiento */}
              <FormField
                control={form.control}
                name="alertDaysBeforeExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Alerta Antes de Vencimiento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={365}
                        step={1}
                        placeholder="30"
                      />
                    </FormControl>
                    <FormDescription>
                      Número de días antes del vencimiento de las secuencias NCF
                      para mostrar una alerta. Valor recomendado: 30 días.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botón de guardar */}
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Información sobre NCF y DGII
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <strong>NCF (Números de Comprobante Fiscal):</strong>
            <p className="mt-1">
              Son números autorizados por la DGII que deben aparecer en todos
              los comprobantes fiscales (facturas, notas de crédito, etc.) para
              que estos tengan validez fiscal.
            </p>
          </div>

          <div>
            <strong>ITBIS (Impuesto a la Transferencia de Bienes y Servicios):</strong>
            <p className="mt-1">
              Es el impuesto al valor agregado (IVA) de República Dominicana.
              La tasa general es del 18% sobre el precio de venta.
            </p>
          </div>

          <div>
            <strong>Tipos de NCF:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>B01: Facturas de crédito fiscal (con RNC del cliente)</li>
              <li>B02: Facturas de consumo (sin RNC del cliente)</li>
              <li>B03: Notas de débito</li>
              <li>B04: Notas de crédito</li>
              <li>B11-B16: Comprobantes especiales</li>
            </ul>
          </div>

          <div>
            <strong>Reportes DGII:</strong>
            <p className="mt-1">
              Debes presentar mensualmente los reportes 606 (compras) y 607
              (ventas) a través del portal de la DGII. Estos reportes contienen
              el detalle de todos los comprobantes emitidos y recibidos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
