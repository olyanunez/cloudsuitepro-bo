'use client';

import { useState, useEffect } from 'react';
import { Product, ProductCategory, UpdateProductDto } from '@/lib/types/inventory';
import { ProductService, ProductCategoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon, RefreshCwIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductImageUpload, ProductImage } from '@/components/products/ProductImageUpload';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string, 10);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [generatingBarcode, setGeneratingBarcode] = useState<boolean>(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [initialImageIds, setInitialImageIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<UpdateProductDto>({
    name: '',
    code: '',
    description: '',
    barcode: '',
    price: 0,
    cost: 0,
    isStockable: true,
    categoryId: 0
  });


  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    price?: string;
    categoryId?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Cargar categorías
        const categoriesData = await ProductCategoryService.getAll();
        const activeCategories = categoriesData.filter(cat => cat.isActive);
        setCategories(activeCategories);

        // Cargar producto
        const productData = await ProductService.getProductById(productId);
        setProduct(productData);

        // Inicializar formulario con datos del producto
        setFormData({
          name: productData.name,
          code: productData.code,
          description: productData.description || '',
          barcode: productData.barcode || '',
          price: productData.price,
          cost: productData.cost || 0,
          isStockable: productData.isStockable ?? true,
          categoryId: productData.categoryId
        });

        // Cargar imágenes existentes
        if (productData.images && productData.images.length > 0) {
          const existingImages: ProductImage[] = productData.images.map((img) => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary,
            order: img.order
          }));
          setImages(existingImages);
          setInitialImageIds(existingImages.map(img => img.id!));
        }


      } catch (error) {
        console.error('Error loading data:', error);
        router.push('/inventory/products');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Para campos checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    // Para campos numéricos, convertir a número
    else if (name === 'price' || name === 'cost') {
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

  const handleGenerateBarcode = async () => {
    try {
      setGeneratingBarcode(true);
      const result = await ProductService.generateBarcode();
      setFormData(prev => ({ ...prev, barcode: result.barcode }));
      toast.success('Código de barras generado exitosamente');
    } catch (error: any) {
      toast.error('Error al generar código de barras', {
        description: error.message || 'No se pudo generar el código de barras',
      });
    } finally {
      setGeneratingBarcode(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      code?: string;
      price?: string;
      categoryId?: string;
    } = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.code || !formData.code.trim()) {
      newErrors.code = 'El código del producto es requerido';
    }

    if (!formData.price || formData.price <= 0) {
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

      // Identificar imágenes nuevas (las que tienen file)
      const newImageFiles = images
        .filter(img => img.file)
        .map(img => img.file!);

      // Identificar imágenes a eliminar (las que estaban inicialmente pero ya no están)
      const currentImageIds = images
        .filter(img => img.id)
        .map(img => img.id!);
      const imagesToDelete = initialImageIds.filter(id => !currentImageIds.includes(id));

      // Obtener el ID de la imagen principal (solo de las existentes, no las nuevas)
      const primaryImage = images.find(img => img.isPrimary && img.id);
      const primaryImageId = primaryImage?.id;

      await ProductService.updateProduct(productId, formData, newImageFiles, imagesToDelete, primaryImageId);
      toast.success('Producto actualizado exitosamente');
      router.push('/inventory/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto', {
        description: error.message || 'No se pudo actualizar el producto. Por favor intente nuevamente.',
      });
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href="/inventory/products">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
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
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código de Barras
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                    placeholder="Escanea o ingresa el código de barras"
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateBarcode}
                    disabled={generatingBarcode}
                    className="shrink-0"
                  >
                    {generatingBarcode ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon className="h-4 w-4 mr-2" />
                        Generar
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Opcional. Puedes escanear, generar o ingresar el código de barras manualmente.
                </p>
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

              {/* isActive checkbox removed */}
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
                    step="0.01"
                    min="0"
                    className={`w-full pl-12 pr-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="isStockable"
                  name="isStockable"
                  checked={formData.isStockable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isStockable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Afecta el inventario
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Desmarcar esta opción para productos que no afectan el inventario (servicios, productos digitales, etc.)
              </p>

              {/* Campos eliminados: stock, minimumStock, barcode */}
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
