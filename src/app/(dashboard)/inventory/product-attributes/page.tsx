'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusIcon, EditIcon, TrashIcon, TagIcon } from 'lucide-react';
import { productAttributesService } from '@/lib/services/product-attributes.service';
import {
  ProductAttribute,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateAttributeValueDto,
} from '@/lib/types/product';

export default function ProductAttributesPage() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Attribute Dialog
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
  const [attributeFormData, setAttributeFormData] = useState<{
    name: string;
    description?: string;
  }>({
    name: '',
    description: '',
  });

  // Add Value Dialog
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
  const [valueFormData, setValueFormData] = useState({ value: '' });

  // Delete confirmations
  const [deleteAttributeId, setDeleteAttributeId] = useState<number | null>(null);
  const [deleteValueData, setDeleteValueData] = useState<{
    attributeId: number;
    valueId: number;
  } | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const data = await productAttributesService.getAll();
      setAttributes(data);
    } catch (error) {
      console.error('Error loading attributes:', error);
      alert('Error al cargar los atributos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttribute = () => {
    setEditingAttribute(null);
    setAttributeFormData({ name: '', description: '' });
    setIsAttributeDialogOpen(true);
  };

  const handleEditAttribute = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute);
    setAttributeFormData({
      name: attribute.name,
      description: attribute.description || '',
    });
    setIsAttributeDialogOpen(true);
  };

  const handleSaveAttribute = async () => {
    if (!attributeFormData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    try {
      const payload = {
        name: attributeFormData.name.trim(),
        displayName: attributeFormData.name.trim(),
        description: attributeFormData.description?.trim() || undefined,
      };

      console.log('Sending attribute payload:', payload);

      if (editingAttribute) {
        // Update
        await productAttributesService.update(editingAttribute.id, payload);
      } else {
        // Create
        await productAttributesService.create(payload);
      }

      setIsAttributeDialogOpen(false);
      loadAttributes();
    } catch (error: any) {
      console.error('Error saving attribute:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert(`Error al guardar el atributo: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`);
    }
  };

  const handleDeleteAttribute = async () => {
    if (!deleteAttributeId) return;

    try {
      await productAttributesService.delete(deleteAttributeId);
      setDeleteAttributeId(null);
      loadAttributes();
    } catch (error) {
      console.error('Error deleting attribute:', error);
      alert('Error al eliminar el atributo');
    }
  };

  const handleAddValue = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    setValueFormData({ value: '' });
    setIsValueDialogOpen(true);
  };

  const handleSaveValue = async () => {
    if (!selectedAttribute || !valueFormData.value.trim()) {
      alert('El valor es requerido');
      return;
    }

    try {
      const payload = {
        value: valueFormData.value.trim(),
        displayName: valueFormData.value.trim(),
      };

      console.log('Sending value payload:', payload);

      await productAttributesService.addValue(selectedAttribute.id, payload);

      setIsValueDialogOpen(false);
      loadAttributes();
    } catch (error: any) {
      console.error('Error adding value:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert(`Error al agregar el valor: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`);
    }
  };

  const handleDeleteValue = async () => {
    if (!deleteValueData) return;

    try {
      await productAttributesService.deleteValue(
        deleteValueData.attributeId,
        deleteValueData.valueId
      );
      setDeleteValueData(null);
      loadAttributes();
    } catch (error) {
      console.error('Error deleting value:', error);
      alert('Error al eliminar el valor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atributos de Producto</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure los atributos (Talla, Color, etc.) para generar variantes de productos
          </p>
        </div>
        <Button onClick={handleCreateAttribute}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Atributo
        </Button>
      </div>

      {attributes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-12 text-center">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay atributos configurados</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Cree atributos como Talla, Color, Material, etc. para poder generar variantes de productos.
          </p>
          <Button onClick={handleCreateAttribute}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Crear Primer Atributo
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {attributes.map((attribute) => (
            <div
              key={attribute.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{attribute.name}</h3>
                  {attribute.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attribute.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAttribute(attribute)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteAttributeId(attribute.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Valores</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddValue(attribute)}
                  >
                    <PlusIcon className="mr-1 h-3 w-3" />
                    Agregar Valor
                  </Button>
                </div>

                {attribute.values && attribute.values.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value) => (
                      <div
                        key={value.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        <span>{value.value}</span>
                        <button
                          onClick={() =>
                            setDeleteValueData({
                              attributeId: attribute.id,
                              valueId: value.id,
                            })
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay valores configurados. Agregue valores para usar este atributo.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Attribute Dialog */}
      <Dialog open={isAttributeDialogOpen} onOpenChange={setIsAttributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? 'Editar Atributo' : 'Nuevo Atributo'}
            </DialogTitle>
            <DialogDescription>
              {editingAttribute
                ? 'Modifique los datos del atributo'
                : 'Cree un nuevo atributo como Talla, Color, Material, etc.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={attributeFormData.name}
                onChange={(e) =>
                  setAttributeFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej: Talla, Color, Material"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={attributeFormData.description || ''}
                onChange={(e) =>
                  setAttributeFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descripción opcional"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttributeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAttribute}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Value Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Valor</DialogTitle>
            <DialogDescription>
              Agregue un nuevo valor para el atributo "{selectedAttribute?.name}"
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="value">
              Valor <span className="text-red-500">*</span>
            </Label>
            <Input
              id="value"
              value={valueFormData.value}
              onChange={(e) =>
                setValueFormData({ value: e.target.value })
              }
              placeholder="Ej: XL, Rojo, Algodón"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValueDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveValue}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Attribute Confirmation */}
      <AlertDialog
        open={deleteAttributeId !== null}
        onOpenChange={(open) => !open && setDeleteAttributeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar atributo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los valores asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAttribute}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Value Confirmation */}
      <AlertDialog
        open={deleteValueData !== null}
        onOpenChange={(open) => !open && setDeleteValueData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar valor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los productos que usen este valor pueden verse afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteValue}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
