'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { productAttributesService } from '@/lib/services/product-attributes.service';
import { CreateAttributeValueDto } from '@/lib/types/product';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function CreateAttributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  });
  const [values, setValues] = useState<CreateAttributeValueDto[]>([]);
  const [newValue, setNewValue] = useState({ value: '', displayName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.displayName) {
      toast.error('El nombre y nombre para mostrar son requeridos');
      return;
    }

    try {
      setLoading(true);
      await productAttributesService.create({
        ...formData,
        values: values.length > 0 ? values : undefined,
      });
      toast.success('Atributo creado exitosamente');
      router.push('/inventory/attributes');
    } catch (error: any) {
      console.error('Error creating attribute:', error);
      toast.error(error.response?.data?.message || 'Error al crear el atributo');
    } finally {
      setLoading(false);
    }
  };

  const addValue = () => {
    if (!newValue.value || !newValue.displayName) {
      toast.error('Valor y nombre para mostrar son requeridos');
      return;
    }

    setValues([...values, { ...newValue, order: values.length }]);
    setNewValue({ value: '', displayName: '' });
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Atributo</h1>
          <p className="text-muted-foreground">
            Crea un nuevo atributo para productos con variantes
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Atributo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre Interno <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: COLOR, TALLA, CAPACIDAD"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value.toUpperCase() })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nombre único en mayúsculas para identificar el atributo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Nombre para Mostrar <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  placeholder="Ej: Color, Talla, Capacidad"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nombre visible para el usuario
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descripción del atributo..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores del Atributo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define los valores posibles para este atributo (ej: Rojo, Azul, Verde para Color)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Valor Interno</Label>
                <Input
                  id="value"
                  placeholder="Ej: ROJO, M, 128GB"
                  value={newValue.value}
                  onChange={(e) =>
                    setNewValue({ ...newValue, value: e.target.value.toUpperCase() })
                  }
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valueDisplayName">Nombre para Mostrar</Label>
                <div className="flex gap-2">
                  <Input
                    id="valueDisplayName"
                    placeholder="Ej: Rojo, Mediano, 128 GB"
                    value={newValue.displayName}
                    onChange={(e) =>
                      setNewValue({ ...newValue, displayName: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                  />
                  <Button type="button" onClick={addValue} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {values.length > 0 && (
              <div className="space-y-2">
                <Label>Valores Agregados ({values.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {value.displayName}
                      <button
                        type="button"
                        onClick={() => removeValue(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Atributo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
