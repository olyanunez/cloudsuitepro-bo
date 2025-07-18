'use client';

import { useState, useEffect } from 'react';
import { ProductCategory } from '@/lib/types/inventory';
import { ProductCategoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PencilIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const categoryId = parseInt(params.id as string, 10);

  useEffect(() => {
    async function loadCategory() {
      try {
        const categoryData = await ProductCategoryService.getById(categoryId);
        console.log('Category data:', JSON.stringify(categoryData, null, 2));
        setCategory(categoryData);
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Categoría no encontrada</h2>
          <p className="mb-4">La categoría que está buscando no existe o ha sido eliminada.</p>
          <Link href="/inventory/categories">
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver a la lista de categorías
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/inventory/categories">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>
        <Link href={`/inventory/categories/edit/${category.id}`}>
          <Button className="bg-primary hover:bg-primary-600">
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar Categoría
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información de la Categoría</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
              <p className="font-medium">{category.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
              <p>{category.description || 'Sin descripción'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {category.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
              <p>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
              <p>{category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
