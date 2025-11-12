// Interfaces para el módulo de inventario

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

export interface Product {
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
  inventoryItems?: InventoryItem[];
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

export interface InventoryItem {
  id: number;
  productId: number;
  product?: Product;
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

export interface InventoryMovement {
  id: number;
  type: MovementType;
  productId: number;
  product?: Product;
  sourceWarehouseId?: number;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId?: number;
  destinationWarehouse?: Warehouse;
  quantity: number;
  reference?: string;
  notes?: string;
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

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost: number;
  isStockable?: boolean;
  categoryId: number;
}

export interface UpdateProductDto {
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

export interface CreateInventoryMovementDto {
  type: MovementType;
  productId: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  quantity: number;
  reference?: string;
  notes?: string;
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
