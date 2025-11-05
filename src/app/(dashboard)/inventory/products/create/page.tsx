'use client';

import { useState, useEffect } from 'react';
import { CreateProductDto, ProductCategory } from '@/lib/types/inventory';
import { ProductService, ProductCategoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductImageUpload, ProductImage } from '@/components/products/ProductImageUpload';

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    code: '',
    description: '',
    price: 0,
    cost: 0,
    categoryId: 0
  });

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    price?: string;
    categoryId?: string;
  }>({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await ProductCategoryService.getAll();
        // Filtrar solo categorías activas
        const activeCategories = categoriesData.filter(cat => cat.isActive);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Para campos numéricos, convertir a número
    if (name === 'price' || name === 'cost') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'categoryId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));

      // Clear error when user selects
      if (errors.categoryId) {
        setErrors(prev => ({ ...prev, categoryId: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      code?: string;
      price?: string;
      categoryId?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código del producto es requerido';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor que cero';
    }

    if (!formData.categoryId || formData.categoryId <= 0) {
      newErrors.categoryId = 'Debe seleccionar una categoría';
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

      // Extraer archivos File de las imágenes
      const imageFiles = images.map(img => img.file).filter((file): file is File => file !== undefined);

      await ProductService.createProduct(formData, imageFiles);
      router.push('/inventory/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Ocurrió un error al crear el producto. Por favor intente nuevamente.');
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href="/inventory/products">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                  placeholder="Código del producto"
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                  placeholder="Nombre del producto"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                  value={formData.categoryId ? formData.categoryId.toString() : ''}
                >
                  <SelectTrigger className={`w-full ${errors.categoryId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Precio e Inventario</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    DOP
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                    className={`w-full pl-12 pr-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>

              {/* <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    DOP
                  </span>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                    placeholder="0.00"
                  />
                  </div>
              </div> */}

              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    DOP
                  </span>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                    className={`w-full pl-12 pr-3 py-2 border rounded-md border-gray-300 dark:border-gray-600'
                      focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Imágenes del Producto</h2>
          <ProductImageUpload images={images} onChange={setImages} maxImages={10} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="mr-2"
            onClick={() => router.push('/inventory/products')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-600"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
