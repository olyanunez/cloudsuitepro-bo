'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import ncfService, {
  DgiiReportType,
  dgiiReportTypeLabels,
  GenerateDgiiReportDto,
} from '@/lib/services/ncfService';

const formSchema = z.object({
  reportType: z.nativeEnum(DgiiReportType, {
    required_error: 'Debes seleccionar un tipo de reporte',
  }),
  startDate: z.string().min(1, 'La fecha inicial es requerida'),
  endDate: z.string().min(1, 'La fecha final es requerida'),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: 'La fecha final debe ser mayor o igual a la fecha inicial',
    path: ['endDate'],
  }
);

type FormValues = z.infer<typeof formSchema>;

export default function DgiiReportsPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: DgiiReportType.REPORT_607,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const dto: GenerateDgiiReportDto = {
        reportType: data.reportType,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      await ncfService.downloadDgiiReport(dto);
      toast.success('Reporte DGII descargado exitosamente');
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      toast.error(
        error.response?.data?.message || 'Error al generar el reporte DGII'
      );
    } finally {
      setLoading(false);
    }
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    form.setValue('startDate', firstDay.toISOString().split('T')[0]);
    form.setValue('endDate', lastDay.toISOString().split('T')[0]);
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    form.setValue('startDate', firstDay.toISOString().split('T')[0]);
    form.setValue('endDate', lastDay.toISOString().split('T')[0]);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reportes DGII</h1>
        <p className="text-muted-foreground">
          Generación de reportes fiscales para la Dirección General de Impuestos
          Internos
        </p>
      </div>

      {/* Información sobre reportes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reporte 607 - Ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Reporte de comprobantes emitidos (ventas). Incluye todas las
              facturas con NCF generadas en el período seleccionado.
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>NCF utilizados</li>
              <li>Montos facturados</li>
              <li>ITBIS cobrado</li>
              <li>Datos del cliente (RNC/Cédula)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reporte 606 - Compras
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Reporte de comprobantes recibidos (compras). Requiere módulo de
              compras implementado.
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>NCF de proveedores</li>
              <li>Montos de compras</li>
              <li>ITBIS pagado</li>
              <li>Datos del proveedor</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Alerta informativa */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los reportes se generan en formato TXT delimitado por pipes (|) según
          especificaciones de la DGII. Asegúrate de validar el formato antes de
          enviar a DGII.
        </AlertDescription>
      </Alert>

      {/* Formulario de generación */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipo de reporte */}
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Reporte *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de reporte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(DgiiReportType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {dgiiReportTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona el tipo de reporte que deseas generar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Período */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Período del Reporte *</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={setPreviousMonth}
                    >
                      Mes Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={setCurrentMonth}
                    >
                      Mes Actual
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Inicial *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormDescription>Desde</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Final *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormDescription>Hasta</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Botón de descarga */}
              <Button type="submit" disabled={loading} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'Generando reporte...' : 'Descargar Reporte'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Selecciona el tipo de reporte que necesitas generar (606 o 607)</li>
            <li>
              Define el período que deseas reportar usando las fechas inicial y
              final
            </li>
            <li>
              Haz clic en "Descargar Reporte" para generar el archivo TXT
            </li>
            <li>
              Valida el contenido del archivo antes de enviarlo a la DGII
            </li>
            <li>
              Sube el archivo al portal de la DGII en la sección correspondiente
            </li>
          </ol>
          <p className="mt-4">
            <strong>Importante:</strong> Los reportes deben presentarse
            mensualmente según el calendario establecido por la DGII. Verifica
            las fechas límite de presentación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
