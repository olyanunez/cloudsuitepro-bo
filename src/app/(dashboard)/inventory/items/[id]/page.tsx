'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/lib/types/inventory';
import { InventoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PencilIcon, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export default function InventoryItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const itemId = parseInt(params.id as string, 10);

  useEffect(() => {
    async function loadItem() {
      try {
        const itemData = await InventoryService.getItemById(itemId);
        console.log('Item data:', JSON.stringify(itemData, null, 2));
        setItem(itemData);
      } catch (error) {
        console.error('Error loading item data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (itemId) {
      loadItem();
    }
  }, [itemId]);

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
          <p className="mb-4">El item de inventario que está buscando no existe o ha sido eliminado.</p>
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

  const productImages = item.product?.images || [];
  const hasImages = productImages.length > 0;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/inventory/items">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles del Item de Inventario</h1>
        </div>
        <Link href={`/inventory/items/edit/${item.id}`}>
          <Button className="bg-primary hover:bg-primary-600">
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar Item
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images Carousel - Left Side */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Imágenes del Producto</h2>
            {hasImages ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image
                    src={productImages[selectedImageIndex].url}
                    alt={`${item.product?.name} - ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="outline absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="outline absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {productImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {productImages.length} {productImages.length === 1 ? 'imagen' : 'imágenes'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No hay imágenes disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Information - Right Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Producto</p>
                <p className="font-medium">{item.product?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{item.product?.code || 'Sin código'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Almacén</p>
                <p className="font-medium">{item.warehouse?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad Actual</p>
                <p className="font-medium">{item.quantity} unidades</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stock Mínimo</p>
                <p className="font-medium">{item.minStock} unidades</p>
              </div>
              {item.maxStock && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stock Máximo</p>
                  <p className="font-medium">{item.maxStock} unidades</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                <p className={`font-medium ${item.quantity <= item.minStock ? 'text-red-600' : 'text-green-600'}`}>
                  {item.quantity <= item.minStock ? 'Stock Bajo' : 'Stock Adecuado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                <p>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                <p>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Producto</h2>
            {!item.product ? (
              <p className="text-gray-500 dark:text-gray-400">No hay información disponible sobre el producto.</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Producto</p>
                    <p className="font-medium">{item.product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
                    <p className="font-medium">{item.product.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precio</p>
                    <p className="font-medium">{formatCurrency(typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price || '0'))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Costo</p>
                    <p className="font-medium">{formatCurrency(typeof item.product.cost === 'number' ? item.product.cost : parseFloat(item.product.cost || '0'))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Categoría</p>
                    <p className="font-medium">{item.product.category?.name || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                    <p className="font-medium">{item.product.isActive ? 'Activo' : 'Inactivo'}</p>
                  </div>
                </div>

                {item.product.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Descripción</p>
                    <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{item.product.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Información del Almacén</h2>
            {!item.warehouse ? (
              <p className="text-gray-500 dark:text-gray-400">No hay información disponible sobre el almacén.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Almacén</p>
                  <p className="font-medium">{item.warehouse.name}</p>
                </div>
                {item.warehouse.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
                    <p>{item.warehouse.description}</p>
                  </div>
                )}
                {item.warehouse.address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                    <p>{item.warehouse.address}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                  <p className="font-medium">{item.warehouse.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
