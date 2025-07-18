'use client';

import { useState, useEffect } from 'react';
import { InventoryItem, UpdateInventoryItemDto, Product, Warehouse } from '@/lib/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EditInventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = parseInt(params.id as string, 10);

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<UpdateInventoryItemDto>({
    quantity: 0,
    minStock: 0,
    maxStock: undefined
  });

  const [errors, setErrors] = useState<{
    quantity?: string;
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

        // Inicializar formData con los datos del item
        setFormData({
          quantity: itemData.quantity,
          minStock: itemData.minStock,
          maxStock: itemData.maxStock
        });

        // Cargar productos y almacenes para referencia
        const productsData = await ProductService.getProducts();
        const warehousesData = await WarehouseService.getWarehouses();

        setProducts(productsData);
        setWarehouses(warehousesData);
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
      quantity?: string;
      minStock?: string;
      maxStock?: string;
    } = {};

    if (formData.quantity === undefined || formData.quantity === null || formData.quantity < 0) {
      newErrors.quantity = 'La cantidad debe ser un número mayor o igual a cero';
    }

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
              <Label htmlFor="quantity">Cantidad <span className="text-red-500">*</span></Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity?.toString() || ''}
                onChange={handleInputChange}
                className="mt-1"
                min="0"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
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
