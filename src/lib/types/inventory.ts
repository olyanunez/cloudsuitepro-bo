// Interfaces para el módulo de inventario

// Re-export new variant-based types from product.ts
export type { Product, InventoryItem, CreateProductDto, UpdateProductDto } from './product';

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use Product from './product.ts' instead.
 * This interface is kept for backward compatibility but will be removed in future versions.
 * Products now support variants - see ProductVariant in './product.ts'
 */
export interface ProductLegacy {
  id: number;
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost: number;
  isStockable: boolean;
  categoryId: number;
  category?: ProductCategory;
  images?: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  inventoryItems?: InventoryItemLegacy[];
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  warehouses?: Warehouse[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  description?: string;
  address?: string;
  branchId?: number;
  branch?: Branch;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use InventoryItem from './product.ts' instead.
 * This interface is kept for backward compatibility.
 * Inventory is now tracked at variant level, not product level.
 */
export interface InventoryItemLegacy {
  id: number;
  productId: number;
  product?: ProductLegacy;
  warehouseId: number;
  warehouse?: Warehouse;
  quantity: number;
  minStock: number;
  maxStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export interface BatchMovement {
  id: number;
  batchId: number;
  batch: {
    id: number;
    batchNumber: string;
    unitCost: number;
    totalCost: number;
    initialQuantity: number;
    currentQuantity: number;
    reservedQuantity: number;
    status: string;
    expirationDate?: string;
    manufacturingDate?: string;
    supplierName?: string;
    purchaseOrderRef?: string;
    location?: string;
  };
  type: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  inventoryMovementId?: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated This interface uses the old product-based inventory.
 * New implementations should use variant-based inventory movements.
 */
export interface InventoryMovement {
  id: number;
  type: MovementType;
  productId: number;
  product?: ProductLegacy;
  sourceWarehouseId?: number;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId?: number;
  destinationWarehouse?: Warehouse;
  quantity: number;
  reference?: string;
  notes?: string;
  batchMovements?: BatchMovement[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para DTOs

export interface CreateProductCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateProductCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * @deprecated Use CreateProductDto from './product.ts' instead.
 * Products now support variants.
 */
export interface CreateProductDtoLegacy {
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost: number;
  isStockable?: boolean;
  categoryId: number;
}

/**
 * @deprecated Use UpdateProductDto from './product.ts' instead.
 * Products now support variants.
 */
export interface UpdateProductDtoLegacy {
  code?: string;
  name?: string;
  description?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  isStockable?: boolean;
  categoryId?: number;
}

export interface CreateBranchDto {
  code: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateBranchDto {
  code?: string;
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface AssignWarehousesDto {
  warehouseIds: number[];
}

export interface CreateWarehouseDto {
  name: string;
  description?: string;
  address?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  description?: string;
  address?: string;
}

/**
 * @deprecated Inventory items are now created automatically when variants are created.
 */
export interface CreateInventoryItemDto {
  productId: number;
  warehouseId: number;
  quantity: number;
  minStock: number;
  maxStock?: number;
}

export interface UpdateInventoryItemDto {
  // quantity no se puede editar directamente - solo mediante movimientos de inventario
  minStock?: number;
  maxStock?: number;
}

/**
 * @deprecated Use variant-based inventory movements instead.
 * Replace productId with variantId in new implementations.
 */
export interface CreateInventoryMovementDto {
  type: MovementType;
  productId: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  quantity: number;
  reference?: string;
  notes?: string;
  // Batch-related fields
  existingBatchId?: number;
  batchNumber?: string;
  unitCost?: number;
  expirationDate?: string;
  manufacturingDate?: string;
  supplierName?: string;
  purchaseOrderRef?: string;
  location?: string;
}

// New variant-based inventory movement interfaces
export interface VariantInventoryMovement {
  id: number;
  type: MovementType;
  variantId: number;
  variant?: {
    id: number;
    sku: string;
    barcode?: string;
    name?: string;
    price?: number;
    cost?: number;
    imageUrl?: string;
    product?: {
      id: number;
      code: string;
      name: string;
    };
    attributeValues?: Array<{
      id: number;
      attributeValue?: {
        id: number;
        value: string;
        displayName: string;
        attribute?: {
          id: number;
          name: string;
          displayName: string;
        };
      };
    }>;
  };
  sourceWarehouseId?: number;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId?: number;
  destinationWarehouse?: Warehouse;
  quantity: number;
  reference?: string;
  notes?: string;
  batchMovements?: BatchMovement[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantInventoryMovementDto {
  type: MovementType;
  variantId: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  quantity: number;
  reference?: string;
  notes?: string;
  // Batch-related fields
  existingBatchId?: number;
  batchNumber?: string;
  unitCost?: number;
  expirationDate?: string;
  manufacturingDate?: string;
  supplierName?: string;
  purchaseOrderRef?: string;
  location?: string;
}

// Interfaces para reportes

export interface StockValuationItem {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StockValuationReport {
  items: StockValuationItem[];
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
  };
}

export interface LowStockItem {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  minStock: number;
  deficit: number;
}

export interface LowStockReport {
  items: LowStockItem[];
  count: number;
}
