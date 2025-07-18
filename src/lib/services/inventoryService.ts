import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
  CreateInventoryItemDto,
  CreateInventoryMovementDto,
  CreateProductCategoryDto,
  CreateProductDto,
  CreateWarehouseDto,
  InventoryItem,
  InventoryMovement,
  LowStockReport,
  MovementType,
  Product,
  ProductCategory,
  StockValuationReport,
  UpdateInventoryItemDto,
  UpdateProductCategoryDto,
  UpdateProductDto,
  UpdateWarehouseDto,
  Warehouse,
} from '@/lib/types/inventory';

// Servicio para categorías de productos
export const ProductCategoryService = {
  getAll: async (): Promise<ProductCategory[]> => {
    return apiGet('/product-categories');
  },

  getById: async (id: number): Promise<ProductCategory> => {
    return apiGet(`/product-categories/${id}`);
  },

  create: async (data: CreateProductCategoryDto): Promise<ProductCategory> => {
    return apiPost('/product-categories', data);
  },

  update: async (id: number, data: UpdateProductCategoryDto): Promise<ProductCategory> => {
    return apiPatch(`/product-categories/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiDelete(`/product-categories/${id}`);
  },
};

// Servicio para productos
export const ProductService = {
  getProducts: async (categoryId?: number, search?: string): Promise<Product[]> => {
    let endpoint = '/products';
    const params = new URLSearchParams();

    if (categoryId) params.append('categoryId', categoryId.toString());
    if (search) params.append('search', search);

    if (params.toString()) endpoint += `?${params.toString()}`;

    return apiGet(endpoint);
  },

  getProductById: async (id: number): Promise<Product> => {
    return apiGet(`/products/${id}`);
  },

  createProduct: async (data: CreateProductDto): Promise<Product> => {
    return apiPost('/products', data);
  },

  updateProduct: async (id: number, data: UpdateProductDto): Promise<Product> => {
    return apiPatch(`/products/${id}`, data);
  },

  deleteProduct: async (id: number): Promise<void> => {
    return apiDelete(`/products/${id}`);
  },
};

// Servicio para almacenes
export const WarehouseService = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    return apiGet('/warehouses');
  },

  getWarehouseById: async (id: number): Promise<Warehouse> => {
    return apiGet(`/warehouses/${id}`);
  },

  createWarehouse: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    return apiPost('/warehouses', data);
  },

  updateWarehouse: async (id: number, data: UpdateWarehouseDto): Promise<Warehouse> => {
    return apiPatch(`/warehouses/${id}`, data);
  },

  deleteWarehouse: async (id: number): Promise<void> => {
    return apiDelete(`/warehouses/${id}`);
  },
};

// Servicio para inventario
export const InventoryService = {
  // Items de inventario
  getItems: async (warehouseId?: number, productId?: number, lowStock?: boolean): Promise<InventoryItem[]> => {
    let endpoint = '/inventory/items';
    const params = new URLSearchParams();

    if (warehouseId) params.append('warehouseId', warehouseId.toString());
    if (productId) params.append('productId', productId.toString());
    if (lowStock) params.append('lowStock', 'true');

    if (params.toString()) endpoint += `?${params.toString()}`;

    return apiGet(endpoint);
  },

  getItemById: async (id: number): Promise<InventoryItem> => {
    return apiGet(`/inventory/items/${id}`);
  },

  createItem: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    return apiPost('/inventory/items', data);
  },

  updateItem: async (id: number, data: UpdateInventoryItemDto): Promise<InventoryItem> => {
    return apiPatch(`/inventory/items/${id}`, data);
  },

  deleteItem: async (id: number): Promise<void> => {
    return apiDelete(`/inventory/items/${id}`);
  },

  // Movimientos de inventario
  getMovements: async (
    productId?: number,
    type?: MovementType,
    startDate?: string,
    endDate?: string
  ): Promise<InventoryMovement[]> => {
    let endpoint = '/inventory/movements';
    const params = new URLSearchParams();

    if (productId) params.append('productId', productId.toString());
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    if (params.toString()) endpoint += `?${params.toString()}`;

    return apiGet(endpoint);
  },

  getMovementById: async (id: number): Promise<InventoryMovement> => {
    return apiGet(`/inventory/movements/${id}`);
  },

  createMovement: async (data: CreateInventoryMovementDto): Promise<InventoryMovement> => {
    return apiPost('/inventory/movements', data);
  },

  // Reportes
  getStockValuationReport: async (warehouseId?: number): Promise<StockValuationReport> => {
    let endpoint = '/inventory/reports/stock-valuation';
    if (warehouseId) endpoint += `?warehouseId=${warehouseId}`;

    return apiGet(endpoint);
  },

  getLowStockReport: async (warehouseId?: number): Promise<LowStockReport> => {
    let endpoint = '/inventory/reports/low-stock';
    if (warehouseId) endpoint += `?warehouseId=${warehouseId}`;

    return apiGet(endpoint);
  },
};
