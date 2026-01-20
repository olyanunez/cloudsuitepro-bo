'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import ncfService, {
  NcfType,
  ncfTypeLabels,
  CreateNcfSequenceDto,
} from '@/lib/services/ncfService';

const formSchema = z.object({
  ncfType: z.nativeEnum(NcfType, {
    required_error: 'Debes seleccionar un tipo de NCF',
  }),
  comprobanteLetter: z
    .string()
    .length(1, 'Debe ser una sola letra')
    .regex(/^[A-E]$/, 'Solo letras A, B, C, D o E'),
  serieNumber: z
    .string()
    .length(2, 'Debe ser un número de 2 dígitos')
    .regex(/^\d{2}$/, 'Solo números de 00 a 99'),
  rangeStart: z.coerce
    .number()
    .min(1, 'El rango inicial debe ser mayor a 0')
    .max(99999999, 'El rango inicial no puede ser mayor a 99999999'),
  rangeEnd: z.coerce
    .number()
    .min(1, 'El rango final debe ser mayor a 0')
    .max(99999999, 'El rango final no puede ser mayor a 99999999'),
  validFrom: z.string().min(1, 'La fecha de inicio es requerida'),
  validUntil: z.string().min(1, 'La fecha de fin es requerida'),
  description: z.string().optional(),
}).refine(
  (data) => data.rangeEnd > data.rangeStart,
  {
    message: 'El rango final debe ser mayor al rango inicial',
    path: ['rangeEnd'],
  }
);

type FormValues = z.infer<typeof formSchema>;

export default function CreateNcfSequencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobanteLetter: 'E',
      serieNumber: '01',
      rangeStart: 1,
      rangeEnd: 1000,
      description: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      // Construir el prefix y series correctamente según DGII
      // Ejemplo: E + 01 = E01 (prefix)
      // Ejemplo: E + 01 + 00000001 = E0100000001 (series)
      const prefix = `${data.comprobanteLetter}${data.serieNumber}`;
      const series = `${prefix}${data.rangeStart.toString().padStart(8, '0')}`;

      const createDto: CreateNcfSequenceDto = {
        ncfType: data.ncfType,
        series: series,
        prefix: prefix,
        rangeStart: data.rangeStart,
        rangeEnd: data.rangeEnd,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        description: data.description,
      };

      console.log('📝 Creando secuencia con:', createDto);
      await ncfService.createSequence(createDto);
      toast.success('Secuencia NCF creada exitosamente');
      router.push('/ncf/sequences');
    } catch (error: any) {
      console.error('Error creando secuencia:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo crear la secuencia NCF';
      toast.error('Error al crear la secuencia NCF', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    const comprobanteLetter = form.watch('comprobanteLetter') || 'E';
    const serieNumber = form.watch('serieNumber') || '01';
    const rangeStart = form.watch('rangeStart') || 1;

    // Formato DGII: Letra + Serie (2 dígitos) + Número (8 dígitos)
    // Ejemplo: E0100000001
    const prefix = `${comprobanteLetter}${serieNumber}`;
    const number = rangeStart.toString().padStart(8, '0');

    return `${prefix}${number}`;
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/ncf/sequences')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Secuencia NCF</h1>
          <p className="text-muted-foreground">
            Crear una nueva secuencia de Números de Comprobante Fiscal
          </p>
        </div>
      </div>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Vista Previa del NCF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-lg font-mono bg-muted px-4 py-2 rounded">
            {generatePreview()}
          </code>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Secuencia</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipo de NCF */}
              <FormField
                control={form.control}
                name="ncfType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de NCF *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de NCF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(NcfType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {ncfTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tipo de comprobante según DGII
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Letra de Comprobante y Número de Serie */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="comprobanteLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Letra de Comprobante *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="E"
                          maxLength={1}
                          className="uppercase"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        A, B, C, D o E (solo 1 letra)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serieNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Serie *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="01"
                          maxLength={2}
                          onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        2 dígitos (01-99)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Rango */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rangeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rango Inicial *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          max={99999999}
                          placeholder="1"
                        />
                      </FormControl>
                      <FormDescription>Número inicial</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rangeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rango Final *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          max={99999999}
                          placeholder="1000"
                        />
                      </FormControl>
                      <FormDescription>Número final</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Secuencia'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
