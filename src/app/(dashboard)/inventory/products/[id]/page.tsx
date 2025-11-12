'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types/inventory';
import { ProductService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PencilIcon, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productId = parseInt(params.id as string, 10);

  const nextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images!.length);
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
    }
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await ProductService.getProductById(productId);
        console.log('Product data:', JSON.stringify(productData, null, 2));
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Producto no encontrado</h2>
          <p className="mb-4">El producto que está buscando no existe o ha sido eliminado.</p>
          <Link href="/inventory/products">
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver a la lista de productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Formatear el precio en moneda local (DOP)
  const formattedPrice = new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(product.price);

  // Formatear el costo en moneda local (DOP)
  const formattedCost = new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(product.cost || 0);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/inventory/products">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>
        <Link href={`/inventory/products/edit/${product.id}`}>
          <Button className="bg-primary hover:bg-primary-600">
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar Producto
          </Button>
        </Link>
      </div>

      {/* Top Section: Carousel (Left) and Product Info (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Image Carousel - Left */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          {product.images && product.images.length > 0 ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={product.images[currentImageIndex].url}
                  alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />
                {product.images.length > 1 && (
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
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-colors ${index === currentImageIndex
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image.url}
                        alt={`Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Imagen {currentImageIndex + 1} de {product.images.length}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No hay imágenes disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Information - Right */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información del Producto</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
              <p className="font-medium">{product.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
              <p>{product.description || 'Sin descripción'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Precio</p>
              <p className="font-medium text-lg">{formattedPrice}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Costo</p>
              <p className="font-medium text-lg">{formattedCost}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Categoría</p>
              <p>{product.category?.name || 'Sin categoría'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Producto</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isStockable ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'}`}>
                {product.isStockable ? 'Inventariable' : 'Servicio'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Additional Information - Full Width */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Información Adicional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
            <p>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
            <p>{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          {/* Estos campos no existen en la interfaz Product del backend */}
          {/*
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stock Actual</p>
            <p className="font-medium">0 unidades</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stock Mínimo</p>
            <p>0 unidades</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Código de Barras</p>
            <p className="font-mono">N/A</p>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
