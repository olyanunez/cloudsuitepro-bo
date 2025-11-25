'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, ImageIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { productsService } from '@/lib/services/productsService';
import { productCategoriesService } from '@/lib/services/productCategoriesService';
import { productAttributesService } from '@/lib/services/product-attributes.service';
import { productVariantsService } from '@/lib/services/product-variants.service';
import { ProductImageUpload, ProductImage } from '@/components/products/ProductImageUpload';
import {
  ProductCategory,
  ProductAttribute,
  CreateProductDto,
  CreateProductVariantDto,
} from '@/lib/types/product';

interface VariantImagePreview {
  file: File;
  preview: string;
}

interface VariantFormData {
  sku: string;
  barcode?: string;
  name?: string;
  price?: number;
  cost?: number;
  minStock?: number;
  maxStock?: number;
  attributeAssignments: { [attributeId: number]: number }; // attributeId -> valueId
  images: VariantImagePreview[]; // Images for this variant
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Reference data
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

  // Form data for product
  const [formData, setFormData] = useState<CreateProductDto>({
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
    attributeAssignments: Record<number, number>; // attributeId -> attributeValueId
  }>({
    sku: '',
    barcode: '',
    price: undefined,
    cost: undefined,
    minStock: 0,
    maxStock: undefined,
    attributeAssignments: {},
  });

  // Simple mode: images for single variant
  const [simpleVariantImages, setSimpleVariantImages] = useState<VariantImagePreview[]>([]);
  const simpleVariantImageInputRef = useRef<HTMLInputElement>(null);

  // Variant mode: manually created variants
  const [variants, setVariants] = useState<VariantFormData[]>([]);

  // Product images
  const [images, setImages] = useState<ProductImage[]>([]);

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
        const [categoriesData, attributesData] = await Promise.all([
          productCategoriesService.getAll(),
          productAttributesService.getAll(),
        ]);
        setCategories(categoriesData);
        setAttributes(attributesData);
      } catch (error) {
        console.error('Error loading reference data:', error);
        alert('Ocurrió un error al cargar los datos de referencia.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-generate SKU for simple variant when product code changes
  useEffect(() => {
    if (!formData.hasVariants && formData.code) {
      setSimpleVariant((prev) => ({
        ...prev,
        sku: `${formData.code}-DEFAULT`,
      }));
    }
  }, [formData.code, formData.hasVariants]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleSimpleVariantImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: VariantImagePreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSimpleVariantImages((prev) => [...prev, ...newImages]);

    // Reset the input so the same file can be selected again
    if (simpleVariantImageInputRef.current) {
      simpleVariantImageInputRef.current.value = '';
    }
  };

  const removeSimpleVariantImage = (imageIndex: number) => {
    setSimpleVariantImages((prev) => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[imageIndex].preview);
      return prev.filter((_, idx) => idx !== imageIndex);
    });
  };

  const updateSimpleVariantAttribute = (attributeId: number, valueId: number | null) => {
    setSimpleVariant((prev) => {
      const newAssignments = { ...prev.attributeAssignments };
      if (valueId === null) {
        delete newAssignments[attributeId];
      } else {
        newAssignments[attributeId] = valueId;
      }
      return {
        ...prev,
        attributeAssignments: newAssignments,
      };
    });
  };

  const handleVariantImageUpload = (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: VariantImagePreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? { ...variant, images: [...variant.images, ...newImages] }
          : variant
      )
    );
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        // Revoke the object URL to free memory
        URL.revokeObjectURL(variant.images[imageIndex].preview);

        return {
          ...variant,
          images: variant.images.filter((_, idx) => idx !== imageIndex),
        };
      })
    );
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

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
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
    console.log('Form submitted');

    if (!validateForm()) {
      console.log('Validation failed', errors);
      return;
    }

    console.log('Validation passed, creating product...');
    try {
      setSaving(true);

      // Step 1: Create the product
      const createdProduct = await productsService.create(formData);

      // Step 2: Create variant(s)
      if (formData.hasVariants) {
        // Multiple variants
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];

          // Extract attributeValueIds from attributeAssignments
          const attributeValueIds = Object.values(variant.attributeAssignments);

          // Fix SKU if it was generated with empty product code (starts with "-")
          let finalSku = variant.sku;
          if (finalSku.startsWith('-')) {
            finalSku = `${formData.code}-${i + 1}`;
          }

          const variantDto: CreateProductVariantDto = {
            productId: createdProduct.id,
            sku: finalSku,
            barcode: variant.barcode || undefined,
            name: variant.name || undefined,
            price: variant.price,
            cost: variant.cost,
            minStock: variant.minStock || 0,
            maxStock: variant.maxStock || undefined,
            isDefault: i === 0,
            attributeValueIds: attributeValueIds.length > 0 ? attributeValueIds : undefined,
          };

          // Create variant
          const createdVariant = await productVariantsService.create(variantDto);

          // Upload variant images if any
          if (variant.images.length > 0) {
            const imageFiles = variant.images.map(img => img.file);
            await productVariantsService.uploadImages(createdVariant.id, imageFiles);
          }
        }
      } else {
        // Single variant (simple mode)
        const attributeValueIds = Object.values(simpleVariant.attributeAssignments);

        const variantDto: CreateProductVariantDto = {
          productId: createdProduct.id,
          sku: simpleVariant.sku,
          barcode: simpleVariant.barcode || undefined,
          price: simpleVariant.price,
          cost: simpleVariant.cost,
          minStock: simpleVariant.minStock || 0,
          maxStock: simpleVariant.maxStock || undefined,
          isDefault: true,
          attributeValueIds: attributeValueIds.length > 0 ? attributeValueIds : undefined,
        };

        const createdVariant = await productVariantsService.create(variantDto);

        // Upload variant images if any
        if (simpleVariantImages.length > 0) {
          const imageFiles = simpleVariantImages.map(img => img.file);
          await productVariantsService.uploadImages(createdVariant.id, imageFiles);
        }
      }

      console.log('Product and variants created successfully');
      router.push('/inventory/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Ocurrió un error al crear el producto.');
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
        <h1 className="text-2xl font-bold">Crear Producto</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Basic Information */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="code">
                  Código <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Ej: PROD-001"
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Nombre del producto"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                  placeholder="Descripción del producto (opcional)"
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
                    SKU <span className="text-xs text-gray-500">(Autogenerado)</span>
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={simpleVariant.sku}
                    readOnly
                    className="mt-1 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    placeholder="Se generará automáticamente"
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

                {/* Simple Variant Attributes */}
                {attributes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Label className="text-xs font-semibold mb-2 block">
                      Atributos del Producto
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {attributes.map((attr) => (
                        <div key={attr.id}>
                          <Label className="text-xs">{attr.displayName}</Label>
                          <Select
                            value={
                              simpleVariant.attributeAssignments[attr.id]?.toString() || 'none'
                            }
                            onValueChange={(value) =>
                              updateSimpleVariantAttribute(
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
                                <SelectItem
                                  key={value.id}
                                  value={value.id.toString()}
                                >
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

                {/* Simple Variant Images */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Label className="text-xs font-semibold mb-2 block">
                    Imágenes del Producto
                  </Label>

                  <div className="flex flex-wrap gap-3 mb-3">
                    {simpleVariantImages.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative w-20 h-20 rounded border border-gray-300 dark:border-gray-600 overflow-hidden group"
                      >
                        <Image
                          src={img.preview}
                          alt={`Imagen ${imgIdx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSimpleVariantImage(imgIdx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:border-primary transition-colors">
                      <input
                        ref={simpleVariantImageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleSimpleVariantImageUpload(e.target.files)}
                      />
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Agregue imágenes del producto
                  </p>
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

                <Button
                  type="button"
                  onClick={handleAddVariant}
                  variant="outline"
                  className="w-full"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Agregar Variante
                </Button>

                {errors.variants && (
                  <p className="text-red-500 text-xs">{errors.variants}</p>
                )}

                {/* Manually Created Variants List */}
                {variants.length > 0 && (
                  <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto">
                    <h3 className="font-semibold text-sm">
                      Variantes ({variants.length})
                    </h3>
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
                              onChange={(e) =>
                                updateVariant(index, 'sku', e.target.value)
                              }
                              className="mt-1 h-8 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Código de Barras</Label>
                            <Input
                              value={variant.barcode || ''}
                              onChange={(e) =>
                                updateVariant(index, 'barcode', e.target.value)
                              }
                              className="mt-1 h-8 text-sm"
                              placeholder="Opcional"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Nombre Variante</Label>
                            <Input
                              value={variant.name || ''}
                              onChange={(e) =>
                                updateVariant(index, 'name', e.target.value)
                              }
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
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value)
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
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value)
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
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value)
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
                                        <SelectItem
                                          key={value.id}
                                          value={value.id.toString()}
                                        >
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
                          src={img.preview}
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
                Las imágenes del producto se configuran en la variante.
              </p>
              {simpleVariantImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {simpleVariantImages.map((img, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative aspect-square rounded border border-gray-300 dark:border-gray-600 overflow-hidden"
                    >
                      <Image
                        src={img.preview}
                        alt={`Imagen ${imgIdx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No hay imágenes del producto. Agregue imágenes en la sección de configuración de variantes arriba.
                </p>
              )}
            </>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <Link href="/inventory/products">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
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
                <SaveIcon className="mr-2 h-4 w-4" />
                Crear Producto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
