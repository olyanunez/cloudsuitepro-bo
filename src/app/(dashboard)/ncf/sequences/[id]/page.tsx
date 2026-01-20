'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import ncfService, {
  NcfSequence,
  ncfTypeLabels,
  UpdateNcfSequenceDto,
} from '@/lib/services/ncfService';

const formSchema = z.object({
  validFrom: z.string().min(1, 'La fecha de inicio es requerida'),
  validUntil: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditNcfSequencePage() {
  const router = useRouter();
  const params = useParams();
  const sequenceId = parseInt(params.id as string);

  const [sequence, setSequence] = useState<NcfSequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    loadSequence();
  }, [sequenceId]);

  const loadSequence = async () => {
    try {
      setLoading(true);
      const data = await ncfService.getSequenceById(sequenceId);
      setSequence(data);

      // Formatear fechas para el input date
      const validFrom = new Date(data.validFrom).toISOString().split('T')[0];
      const validUntil = new Date(data.validUntil).toISOString().split('T')[0];

      form.reset({
        validFrom,
        validUntil,
        isActive: data.isActive,
        description: data.description || '',
      });
    } catch (error: any) {
      console.error('Error cargando secuencia:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo cargar la secuencia';
      toast.error('Error al cargar la secuencia', {
        description: errorMessage,
      });
      router.push('/ncf/sequences');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setSaving(true);
      const updateDto: UpdateNcfSequenceDto = {
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isActive: data.isActive,
        description: data.description,
      };

      await ncfService.updateSequence(sequenceId, updateDto);
      toast.success('Secuencia actualizada exitosamente');
      router.push('/ncf/sequences');
    } catch (error: any) {
      console.error('Error actualizando secuencia:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo actualizar la secuencia';
      toast.error('Error al actualizar la secuencia', {
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const getUsagePercentage = (): number => {
    if (!sequence) return 0;
    const total = sequence.rangeEnd - sequence.rangeStart + 1;
    const used = sequence.currentNumber - sequence.rangeStart;
    return Math.round((used / total) * 100);
  };

  const getRemainingCount = (): number => {
    if (!sequence) return 0;
    return sequence.rangeEnd - sequence.currentNumber;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando secuencia...</div>
      </div>
    );
  }

  if (!sequence) {
    return null;
  }

  const usagePercentage = getUsagePercentage();
  const remaining = getRemainingCount();

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/ncf/sequences')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Editar Secuencia NCF</h1>
          <p className="text-muted-foreground">
            {ncfTypeLabels[sequence.ncfType]}
          </p>
        </div>
        {sequence.isExpired ? (
          <Badge variant="destructive">Vencida</Badge>
        ) : sequence.isActive ? (
          <Badge variant="default">Activa</Badge>
        ) : (
          <Badge variant="secondary">Inactiva</Badge>
        )}
      </div>

      {/* Información de la secuencia */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              NCF Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-lg font-mono">
              {sequence.prefix}
              {sequence.ncfType.replace('B', '')}
              {sequence.series}
              {sequence.currentNumber.toString().padStart(8, '0')}
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Uso de Secuencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usagePercentage}%</div>
            <p className="text-sm text-muted-foreground">
              {sequence.currentNumber - sequence.rangeStart} de{' '}
              {sequence.rangeEnd - sequence.rangeStart + 1} usados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              NCFs Restantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remaining}</div>
            <p className="text-sm text-muted-foreground">
              Hasta {sequence.rangeEnd.toString().padStart(8, '0')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información no editable */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Secuencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de NCF
              </p>
              <p className="text-base">{ncfTypeLabels[sequence.ncfType]}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Serie
              </p>
              <code className="text-base">
                {sequence.prefix}
                {sequence.series}
              </code>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rango Inicial
              </p>
              <p className="text-base">
                {sequence.rangeStart.toString().padStart(8, '0')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rango Final
              </p>
              <p className="text-base">
                {sequence.rangeEnd.toString().padStart(8, '0')}
              </p>
            </div>
          </div>
          {sequence.branch && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sucursal
              </p>
              <p className="text-base">{sequence.branch.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Vigencia */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido Desde *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormDescription>Fecha de inicio</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido Hasta *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormDescription>Fecha de vencimiento</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Estado activo */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Secuencia Activa
                      </FormLabel>
                      <FormDescription>
                        Las secuencias inactivas no se utilizarán para generar
                        NCFs
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

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descripción opcional de la secuencia..."
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Información adicional sobre esta secuencia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/ncf/sequences')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
