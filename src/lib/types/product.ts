// Interfaces para Product Attributes y Product Variants

import { BaseEntity } from './base';
import { ProductCategory, ProductImage } from './inventory';

export interface ProductAttribute extends BaseEntity {
  name: string;
  displayName: string;
  description?: string;
  tenantId: number;
  values?: ProductAttributeValue[];
}

export interface ProductAttributeValue extends BaseEntity {
  attributeId: number;
  attribute?: ProductAttribute;
  value: string;
  displayName: string;
  order: number;
  tenantId: number;
}

export interface ProductProductAttribute {
  id: number;
  productId: number;
  attributeId: number;
  attribute?: ProductAttribute;
  order: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantAttributeValue {
  id: number;
  variantId: number;
  attributeValueId: number;
  attributeValue?: ProductAttributeValue;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant extends BaseEntity {
  productId: number;
  sku: string;
  barcode?: string;
  name?: string;
  price?: number;
  cost?: number;
  imageUrl?: string;
  isDefault: boolean;
  minStock?: number;
  maxStock?: number;
  tenantId: number;
  product?: Product;
  attributeValues?: ProductVariantAttributeValue[];
  inventoryItems?: InventoryItem[];
}

export interface Product extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  hasVariants: boolean;
  isStockable: boolean;
  categoryId: number;
  tenantId: number;
  category?: ProductCategory;
  images?: ProductImage[];
  variants?: ProductVariant[];
  productAttributes?: ProductProductAttribute[];
}

export interface InventoryItem extends BaseEntity {
  variantId: number;
  variant?: ProductVariant;
  warehouseId: number;
  warehouse?: {
    id: number;
    name: string;
  };
  quantity: number;
  minStock: number;
  maxStock?: number;
  tenantId: number;
  batches?: Batch[];
}

export interface Batch {
  id: number;
  batchNumber: string;
  variantId: number;
  inventoryItemId: number;
  unitCost: number;
  totalCost: number;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  status: string;
  expirationDate?: string;
  manufacturingDate?: string;
  entryDate: string;
  supplierName?: string;
  purchaseOrderRef?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs

export interface CreateProductAttributeDto {
  name: string;
  displayName: string;
  description?: string;
  values?: CreateAttributeValueDto[];
}

export interface CreateAttributeValueDto {
  value: string;
  displayName: string;
  order?: number;
}

export interface UpdateProductAttributeDto {
  name?: string;
  displayName?: string;
  description?: string;
}

export interface UpdateAttributeValueDto {
  value?: string;
  displayName?: string;
  order?: number;
}

export interface ProductAttributeAssignmentDto {
  attributeId: number;
  order?: number;
  isRequired?: boolean;
}

export interface CreateVariantInlineDto {
  sku: string;
  barcode?: string;
  name?: string;
  price: number;
  cost: number;
  minStock?: number;
  maxStock?: number;
  isDefault?: boolean;
  attributeValueIds?: number[];
}

export interface UpdateVariantInlineDto {
  id?: number;
  sku?: string;
  barcode?: string;
  name?: string;
  price?: number;
  cost?: number;
  minStock?: number;
  maxStock?: number;
  attributeValueIds?: number[];
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  hasVariants?: boolean;
  isStockable?: boolean;
  categoryId: number;
  attributes?: ProductAttributeAssignmentDto[];
  variants?: CreateVariantInlineDto[];
}

export interface UpdateProductDto {
  code?: string;
  name?: string;
  description?: string;
  hasVariants?: boolean;
  isStockable?: boolean;
  categoryId?: number;
  attributes?: ProductAttributeAssignmentDto[];
  imagesToDelete?: number[];
  imagesOrder?: string;
  primaryImageId?: number;
  variants?: UpdateVariantInlineDto[];
}

export interface CreateProductVariantDto {
  productId: number;
  sku: string;
  barcode?: string;
  name?: string;
  price?: number;
  cost?: number;
  imageUrl?: string;
  isDefault?: boolean;
  minStock?: number;
  maxStock?: number;
  attributeValueIds?: number[];
}

export interface UpdateProductVariantDto {
  sku?: string;
  barcode?: string;
  name?: string;
  price?: number;
  cost?: number;
  imageUrl?: string;
  isDefault?: boolean;
  minStock?: number;
  maxStock?: number;
  attributeValueIds?: number[];
}

export interface VariantCombinationDto {
  attributeValueIds: number[];
  price?: number;
  cost?: number;
}

export interface BulkCreateVariantsDto {
  productId: number;
  combinations: VariantCombinationDto[];
}

export interface BulkCreateVariantsResponse {
  created: number;
  total: number;
  variants: ProductVariant[];
}

export interface VariantStockInfo {
  variantId: number;
  sku: string;
  totalStock: number;
  byWarehouse: {
    quantity: number;
    warehouse: {
      id: number;
      name: string;
    };
  }[];
}
