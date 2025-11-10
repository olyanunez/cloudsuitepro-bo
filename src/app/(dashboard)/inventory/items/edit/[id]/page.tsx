'use client';

import { useState, useEffect } from 'react';
import { InventoryItem, UpdateInventoryItemDto } from '@/lib/types/inventory';
import { InventoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon, ImageIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditInventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = parseInt(params.id as string, 10);

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<UpdateInventoryItemDto>({
    minStock: 0,
    maxStock: undefined
  });

  const [errors, setErrors] = useState<{
    minStock?: string;
    maxStock?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Cargar el item actual
        const itemData = await InventoryService.getItemById(itemId);
        if (!itemData) {
          router.push('/inventory/items');
          return;
        }

        setItem(itemData);

        // Inicializar formData con los datos del item (sin quantity)
        setFormData({
          minStock: itemData.minStock,
          maxStock: itemData.maxStock
        });
      } catch (error) {
        console.error('Error loading item data:', error);
        alert('Ocurrió un error al cargar los datos del item.');
      } finally {
        setLoading(false);
      }
    }

    if (itemId) {
      loadData();
    }
  }, [itemId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      minStock?: string;
      maxStock?: string;
    } = {};

    if (formData.minStock === undefined || formData.minStock === null || formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo debe ser un número mayor o igual a cero';
    }

    if (formData.maxStock !== undefined && formData.maxStock !== null && formData.maxStock < formData.minStock!) {
      newErrors.maxStock = 'El stock máximo debe ser mayor o igual al stock mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Actualizar el item
      const updatedItem = await InventoryService.updateItem(itemId, formData);

      console.log('Item actualizado:', updatedItem);
      router.push(`/inventory/items/${itemId}`);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Ocurrió un error al actualizar el item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Item no encontrado</h2>
          <p className="mb-4">El item que está buscando no existe o ha sido eliminado.</p>
          <Link href="/inventory/items">
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver a la lista de items
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href={`/inventory/items/${itemId}`}>
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Item de Inventario</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="product">Producto</Label>
              <Input
                id="product"
                value={item.product?.name || 'N/A'}
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">No se puede cambiar el producto</p>

              {/* Product Image Preview */}
              {item.product && (() => {
                const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];

                return (
                  <div className="mt-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Código: {item.product.code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Precio: ${item.product.price}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <Label htmlFor="warehouse">Almacén</Label>
              <Input
                id="warehouse"
                value={item.warehouse?.name || 'N/A'}
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">No se puede cambiar el almacén</p>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad Actual</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={item.quantity}
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                La cantidad solo puede modificarse mediante movimientos de inventario
              </p>
            </div>

            <div>
              <Label htmlFor="minStock">Stock Mínimo <span className="text-red-500">*</span></Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                value={formData.minStock?.toString() || ''}
                onChange={handleInputChange}
                className="mt-1"
                min="0"
              />
              {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>}
            </div>

            <div>
              <Label htmlFor="maxStock">Stock Máximo</Label>
              <Input
                id="maxStock"
                name="maxStock"
                type="number"
                value={formData.maxStock?.toString() || ''}
                onChange={handleInputChange}
                className="mt-1"
                min="0"
                placeholder="Opcional"
              />
              {errors.maxStock && <p className="text-red-500 text-xs mt-1">{errors.maxStock}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Link href={`/inventory/items/${itemId}`} className="mr-4">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary-600" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
