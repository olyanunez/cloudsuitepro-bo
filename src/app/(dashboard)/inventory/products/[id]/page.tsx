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

  const defaultVariant = product.variants?.[0];

  // Formatear el precio en moneda local (DOP)
  const formattedPrice = defaultVariant?.price
    ? new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
      }).format(defaultVariant.price)
    : 'N/A';

  // Formatear el costo en moneda local (DOP)
  const formattedCost = defaultVariant?.cost
    ? new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
      }).format(defaultVariant.cost)
    : 'N/A';

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

      {/* Variants Section */}
      {product.variants && product.variants.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {product.hasVariants ? 'Variantes del Producto' : 'Información de Variante'}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código de Barras
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atributos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Costo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {variant.images && variant.images.length > 0 ? (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                            <Image
                              src={variant.images.find(img => img.isPrimary)?.url || variant.images[0].url}
                              alt={variant.name || variant.sku}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-mono text-gray-900 dark:text-white">
                            {variant.sku}
                          </div>
                          {variant.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded px-2 py-0.5">
                              Por defecto
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {variant.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {variant.barcode || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {variant.attributeValues && variant.attributeValues.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {variant.attributeValues.map((av) => (
                            <span
                              key={av.id}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                            >
                              {av.attribute?.displayName}: {av.displayName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {variant.price
                        ? new Intl.NumberFormat('es-DO', {
                            style: 'currency',
                            currency: 'DOP'
                          }).format(variant.price)
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {variant.cost
                        ? new Intl.NumberFormat('es-DO', {
                            style: 'currency',
                            currency: 'DOP'
                          }).format(variant.cost)
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        variant.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {variant.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Código de Barras (Variante Principal)</p>
            <p className="font-mono">{defaultVariant?.barcode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Variantes</p>
            <p>{product.variants?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
