'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/inventory';
import { ProductService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PencilIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const productId = parseInt(params.id as string, 10);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Categoría</p>
              <p>{product.category?.name || 'Sin categoría'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información Adicional</h2>
          <div className="space-y-4">
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
    </div>
  );
}
