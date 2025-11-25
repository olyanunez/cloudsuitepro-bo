'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
  ImageIcon,
  XIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { ProductService, ProductCategoryService } from '@/lib/services/inventoryService';
import { productAttributesService } from '@/lib/services/product-attributes.service';
import { productVariantsService } from '@/lib/services/product-variants.service';
import { ProductImageUpload, ProductImage } from '@/components/products/ProductImageUpload';
import {
  Product,
  ProductCategory,
  ProductAttribute,
  UpdateProductDto,
} from '@/lib/types/inventory';
import { toast } from 'sonner';

interface VariantImagePreview {
  file?: File;
  preview: string;
  id?: number;
  url?: string;
  publicId?: string;
  isPrimary?: boolean;
  order?: number;
}

interface VariantFormData {
  id?: number;
  sku: string;
  barcode?: string;
  name?: string;
  price?: number;
  cost?: number;
  minStock?: number;
  maxStock?: number;
  attributeAssignments: { [attributeId: number]: number };
  images: VariantImagePreview[];
  imagesToDelete?: number[]; // IDs of images to delete
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string, 10);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [generatingBarcode, setGeneratingBarcode] = useState<boolean>(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [initialImageIds, setInitialImageIds] = useState<number[]>([]);

  // Form data for product
  const [formData, setFormData] = useState<UpdateProductDto>({
    code: '',
    name: '',
    description: '',
    categoryId: 0,
    hasVariants: false,
    isStockable: true,
  });

  // Simple mode: single variant
  const [simpleVariant, setSimpleVariant] = useState<{
    sku: string;
    barcode?: string;
    price?: number;
    cost?: number;
    minStock?: number;
    maxStock?: number;
  }>({
    sku: '',
    barcode: '',
    price: undefined,
    cost: undefined,
    minStock: 0,
    maxStock: undefined,
  });

  // Variant mode: manually created variants
  const [variants, setVariants] = useState<VariantFormData[]>([]);

  const [errors, setErrors] = useState<{
    code?: string;
    name?: string;
    categoryId?: string;
    sku?: string;
    price?: string;
    variants?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Cargar categorías
        const categoriesData = await ProductCategoryService.getAll();
        const activeCategories = categoriesData.filter((cat) => cat.isActive);
        setCategories(activeCategories);

        // Cargar atributos
        const attributesData = await productAttributesService.getAll();
        setAttributes(attributesData);

        // Cargar producto
        const productData = await ProductService.getProductById(productId);
        console.log('Product data loaded:', JSON.stringify(productData, null, 2));
        setProduct(productData);

        // Determinar si el producto tiene variantes (más de 1 variante significa modo variantes)
        const hasMultipleVariants = productData.variants && productData.variants.length > 1;

        // Inicializar formulario con datos del producto
        setFormData({
          code: productData.code,
          name: productData.name,
          description: productData.description || '',
          categoryId: productData.categoryId,
          hasVariants: hasMultipleVariants,
          isStockable: productData.isStockable ?? true,
        });

        // Cargar imágenes existentes del producto
        if (productData.images && productData.images.length > 0) {
          const existingImages: ProductImage[] = productData.images.map((img) => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary,
            order: img.order,
          }));
          setImages(existingImages);
          setInitialImageIds(existingImages.map((img) => img.id!));
        }

        // Cargar variantes existentes
        if (productData.variants && productData.variants.length > 0) {
          const loadedVariants: VariantFormData[] = productData.variants.map((variant) => {
            // Construir attributeAssignments
            const attributeAssignments: { [attributeId: number]: number } = {};
            if (variant.attributeValues && variant.attributeValues.length > 0) {
              variant.attributeValues.forEach((av) => {
                const attrId = av.attributeValue?.attribute?.id;
                const valueId = av.attributeValue?.id;
                if (attrId && valueId) {
                  attributeAssignments[attrId] = valueId;
                }
              });
            }

            // Cargar imágenes de la variante
            const variantImages: VariantImagePreview[] = [];
            if (variant.images && variant.images.length > 0) {
              variant.images.forEach((img) => {
                variantImages.push({
                  id: img.id,
                  url: img.url,
                  publicId: img.publicId,
                  isPrimary: img.isPrimary,
                  order: img.order,
                  preview: img.url,
                });
              });
            }

            return {
              id: variant.id,
              sku: variant.sku,
              barcode: variant.barcode || '',
              name: variant.name || '',
              price: variant.price ? Number(variant.price) : undefined,
              cost: variant.cost ? Number(variant.cost) : undefined,
              minStock: variant.minStock ?? 0,
              maxStock: variant.maxStock ?? undefined,
              attributeAssignments,
              images: variantImages,
              imagesToDelete: [],
            };
          });

          if (hasMultipleVariants) {
            // Modo variantes: cargar todas las variantes
            setVariants(loadedVariants);
          } else if (loadedVariants.length === 1) {
            // Modo simple: cargar la única variante en simpleVariant
            const singleVariant = loadedVariants[0];
            setSimpleVariant({
              sku: singleVariant.sku,
              barcode: singleVariant.barcode || '',
              price: singleVariant.price,
              cost: singleVariant.cost,
              minStock: singleVariant.minStock || 0,
              maxStock: singleVariant.maxStock,
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos del producto');
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: parseInt(value, 10) }));
    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: undefined }));
    }
  };

  const handleIsStockableChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isStockable: checked }));
  };

  const handleHasVariantsChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, hasVariants: checked }));
    if (!checked) {
      // Clear variant mode data when switching to simple mode
      setVariants([]);
    }
    if (errors.variants) {
      setErrors((prev) => ({ ...prev, variants: undefined }));
    }
  };

  const handleSimpleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSimpleVariant((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : name === 'sku' || name === 'barcode' ? value : Number(value),
    }));

    // Clear errors for simple variant fields
    if (name === 'sku' && errors.sku) {
      setErrors((prev) => ({ ...prev, sku: undefined }));
    }
    if (name === 'price' && errors.price) {
      setErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleGenerateBarcode = async () => {
    try {
      setGeneratingBarcode(true);
      const result = await ProductService.generateBarcode();
      setFormData((prev) => ({ ...prev, barcode: result.barcode }));
      toast.success('Código de barras generado exitosamente');
    } catch (error: any) {
      toast.error('Error al generar código de barras', {
        description: error.message || 'No se pudo generar el código de barras',
      });
    } finally {
      setGeneratingBarcode(false);
    }
  };

  // Variant management functions
  const handleAddVariant = () => {
    const newVariant: VariantFormData = {
      sku: `${formData.code}-${variants.length + 1}`,
      barcode: '',
      name: '',
      price: undefined,
      cost: undefined,
      minStock: 0,
      maxStock: undefined,
      attributeAssignments: {},
      images: [],
      imagesToDelete: [],
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => {
      const variant = prev[index];
      // Revoke all object URLs for this variant
      variant.images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(img.preview);
        }
      });
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value === '' ? undefined : value,
            }
          : variant
      )
    );
  };

  const updateVariantAttribute = (
    variantIndex: number,
    attributeId: number,
    valueId: number | null
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        const newAssignments = { ...variant.attributeAssignments };
        if (valueId === null) {
          delete newAssignments[attributeId];
        } else {
          newAssignments[attributeId] = valueId;
        }

        return {
          ...variant,
          attributeAssignments: newAssignments,
        };
      })
    );
  };

  const handleVariantImageUpload = (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: VariantImagePreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex ? { ...variant, images: [...variant.images, ...newImages] } : variant
      )
    );
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        const imageToRemove = variant.images[imageIndex];

        // If it's an existing image (has id), add to imagesToDelete
        const newImagesToDelete = [...(variant.imagesToDelete || [])];
        if (imageToRemove.id) {
          newImagesToDelete.push(imageToRemove.id);
        }

        // Revoke the object URL if it's a new file
        if (imageToRemove.file) {
          URL.revokeObjectURL(imageToRemove.preview);
        }

        return {
          ...variant,
          images: variant.images.filter((_, idx) => idx !== imageIndex),
          imagesToDelete: newImagesToDelete,
        };
      })
    );
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      newErrors.categoryId = 'Seleccione una categoría';
    }

    // Validate variants
    if (formData.hasVariants) {
      if (variants.length === 0) {
        newErrors.variants = 'Agregue al menos una variante o cambie a modo simple';
      } else {
        // Check if all variants have SKU and price
        const invalidVariants = variants.filter(
          (v) => !v.sku.trim() || v.price === undefined || v.price <= 0
        );
        if (invalidVariants.length > 0) {
          newErrors.variants =
            'Todas las variantes deben tener un SKU y un precio válido';
        }
      }
    } else {
      // Simple mode validation
      if (!simpleVariant.sku.trim()) {
        newErrors.sku = 'El SKU es requerido';
      }
      if (simpleVariant.price === undefined || simpleVariant.price <= 0) {
        newErrors.price = 'El precio es requerido y debe ser mayor a cero';
      }
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

      // 1. Update product basic information and product images
      const newProductImageFiles = images.filter((img) => img.file).map((img) => img.file!);

      const currentProductImageIds = images.filter((img) => img.id).map((img) => img.id!);
      const productImagesToDelete = initialImageIds.filter(
        (id) => !currentProductImageIds.includes(id)
      );

      const primaryProductImage = images.find((img) => img.isPrimary && img.id);
      const primaryProductImageId = primaryProductImage?.id;

      await ProductService.updateProduct(
        productId,
        formData,
        newProductImageFiles,
        productImagesToDelete,
        primaryProductImageId
      );

      // 2. Handle variants and their images
      if (formData.hasVariants) {
        // Upload new images for each variant
        for (const variant of variants) {
          if (variant.id) {
            // Process images for existing variants
            const newImages = variant.images.filter((img) => img.file);
            console.log(`Variant ${variant.id}: ${newImages.length} new images to upload`);

            // Upload new images
            if (newImages.length > 0) {
              const imageFiles = newImages.map((img) => img.file!);
              console.log('Uploading images for variant', variant.id, imageFiles);
              await productVariantsService.uploadImages(variant.id, imageFiles);
            }

            // Delete images marked for deletion
            if (variant.imagesToDelete && variant.imagesToDelete.length > 0) {
              console.log(`Deleting ${variant.imagesToDelete.length} images from variant ${variant.id}`);
              for (const imageId of variant.imagesToDelete) {
                await productVariantsService.deleteImage(variant.id, imageId);
              }
            }
          }
        }
      }

      toast.success('Producto actualizado exitosamente');
      router.push('/inventory/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto', {
        description: error.message || 'No se pudo actualizar el producto.',
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
          <p className="mb-4">
            El producto que está buscando no existe o ha sido eliminado.
          </p>
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
          {/* Información Básica */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">
                  Código <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={errors.code ? 'border-red-500' : ''}
                  placeholder="Código del producto"
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              <div>
                <Label htmlFor="name">
                  Nombre del Producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="Nombre del producto"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <Label htmlFor="categoryId">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId?.toString() || ''}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="mt-1">
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
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isStockable"
                  checked={formData.isStockable}
                  onCheckedChange={handleIsStockableChange}
                />
                <Label htmlFor="isStockable" className="cursor-pointer">
                  Producto con inventario
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasVariants"
                  checked={formData.hasVariants}
                  onCheckedChange={handleHasVariantsChange}
                />
                <Label htmlFor="hasVariants" className="cursor-pointer">
                  Producto con variantes
                </Label>
              </div>
            </div>
          </div>

          {/* Right Column: Variant Configuration */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Configuración de Variantes
            </h2>

            {!formData.hasVariants ? (
              // Simple Mode
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Modo simple: se creará una única variante con la información
                  básica.
                </p>

                <div>
                  <Label htmlFor="sku">
                    SKU <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={simpleVariant.sku}
                    onChange={handleSimpleVariantChange}
                    className="mt-1"
                    placeholder="Ej: PROD-001-DEFAULT"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={simpleVariant.barcode || ''}
                    onChange={handleSimpleVariantChange}
                    className="mt-1"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <Label htmlFor="price">
                    Precio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={simpleVariant.price?.toString() || ''}
                    onChange={handleSimpleVariantChange}
                    className="mt-1"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cost">Costo</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    value={simpleVariant.cost?.toString() || ''}
                    onChange={handleSimpleVariantChange}
                    className="mt-1"
                    placeholder="0.00 (Opcional)"
                  />
                </div>

                <div>
                  <Label htmlFor="minStock">Stock Mínimo</Label>
                  <Input
                    id="minStock"
                    name="minStock"
                    type="number"
                    value={simpleVariant.minStock?.toString() || '0'}
                    onChange={handleSimpleVariantChange}
                    className="mt-1"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="maxStock">Stock Máximo</Label>
                  <Input
                    id="maxStock"
                    name="maxStock"
                    type="number"
                    value={simpleVariant.maxStock?.toString() || ''}
                    onChange={handleSimpleVariantChange}
                    className="mt-1"
                    min="0"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            ) : (
              // Variant Mode - Manual Creation
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Agregue manualmente las variantes que desee y asigne los atributos a cada una.
                </p>

                {attributes.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No hay atributos configurados. Puede{' '}
                      <Link
                        href="/inventory/product-attributes"
                        className="underline font-medium"
                        target="_blank"
                      >
                        crear atributos aquí
                      </Link>
                      .
                    </p>
                  </div>
                ) : null}

                <Button type="button" onClick={handleAddVariant} variant="outline" className="w-full">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Agregar Variante
                </Button>

            {errors.variants && <p className="text-red-500 text-xs">{errors.variants}</p>}

            {variants.length > 0 && (
              <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto">
                <h3 className="font-semibold text-sm">Variantes ({variants.length})</h3>
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-md p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        Variante {index + 1}
                        {variant.name ? ` - ${variant.name}` : ''}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">
                          SKU <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="mt-1 h-8 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Código de Barras</Label>
                        <Input
                          value={variant.barcode || ''}
                          onChange={(e) => updateVariant(index, 'barcode', e.target.value)}
                          className="mt-1 h-8 text-sm"
                          placeholder="Opcional"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Nombre Variante</Label>
                        <Input
                          value={variant.name || ''}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className="mt-1 h-8 text-sm"
                          placeholder="Ej: Rojo - XL"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          Precio <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price?.toString() || ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'price',
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                          className="mt-1 h-8 text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Costo</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.cost?.toString() || ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'cost',
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                          className="mt-1 h-8 text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Stock Mínimo</Label>
                        <Input
                          type="number"
                          value={variant.minStock?.toString() || '0'}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'minStock',
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                          className="mt-1 h-8 text-sm"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Stock Máximo</Label>
                        <Input
                          type="number"
                          value={variant.maxStock?.toString() || ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'maxStock',
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                          className="mt-1 h-8 text-sm"
                          min="0"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>

                    {/* Attribute Assignments */}
                    {attributes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Label className="text-xs font-semibold mb-2 block">
                          Atributos de la Variante
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {attributes.map((attr) => (
                            <div key={attr.id}>
                              <Label className="text-xs">{attr.displayName}</Label>
                              <Select
                                value={
                                  variant.attributeAssignments[attr.id]?.toString() || 'none'
                                }
                                onValueChange={(value) =>
                                  updateVariantAttribute(
                                    index,
                                    attr.id,
                                    value === 'none' ? null : Number(value)
                                  )
                                }
                              >
                                <SelectTrigger className="mt-1 h-8 text-sm">
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    <span className="text-gray-400">Sin asignar</span>
                                  </SelectItem>
                                  {attr.values?.map((value) => (
                                    <SelectItem key={value.id} value={value.id.toString()}>
                                      {value.displayName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variant Images */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <Label className="text-xs font-semibold mb-2 block">
                        Imágenes de la Variante
                      </Label>

                      <div className="flex flex-wrap gap-3 mb-3">
                        {variant.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative w-20 h-20 rounded border border-gray-300 dark:border-gray-600 overflow-hidden group"
                          >
                            <Image
                              src={img.preview}
                              alt={`Variant ${index + 1} image ${imgIdx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(index, imgIdx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleVariantImageUpload(index, e.target.files)}
                          />
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Agregue imágenes específicas para esta variante
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>
            )}
          </div>
        </div>

        {/* Imágenes del Producto */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Imágenes del Producto</h2>
          {formData.hasVariants ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Las imágenes de productos con variantes se configuran individualmente en cada variante.
              </p>
              {variants.some(v => v.images.length > 0) ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {variants.flatMap((variant, variantIdx) =>
                    variant.images.map((img, imgIdx) => (
                      <div
                        key={`${variantIdx}-${imgIdx}`}
                        className="relative aspect-square rounded border border-gray-300 dark:border-gray-600 overflow-hidden"
                      >
                        <Image
                          src={img.url || img.preview}
                          alt={`Variante ${variantIdx + 1} - Imagen ${imgIdx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No hay imágenes en las variantes del producto.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Imágenes generales del producto.
              </p>
              <ProductImageUpload images={images} onChange={setImages} maxImages={10} />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="mr-2"
            onClick={() => router.push('/inventory/products')}
          >
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary-600" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
