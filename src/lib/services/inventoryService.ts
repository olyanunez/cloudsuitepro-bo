import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
  AssignWarehousesDto,
  Branch,
  CreateBranchDto,
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
  UpdateBranchDto,
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

  createProduct: async (data: CreateProductDto, images?: File[]): Promise<Product> => {
    const formData = new FormData();

    // Agregar campos del producto
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Agregar imágenes si existen
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el producto');
    }

    return response.json();
  },

  updateProduct: async (id: number, data: UpdateProductDto, images?: File[], imagesToDelete?: number[], primaryImageId?: number): Promise<Product> => {
    const formData = new FormData();

    // Agregar campos del producto
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Agregar imágenes nuevas si existen
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Agregar IDs de imágenes a eliminar
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    // Agregar ID de imagen principal
    if (primaryImageId !== undefined) {
      formData.append('primaryImageId', primaryImageId.toString());
    }

    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      method: 'PATCH',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el producto');
    }

    return response.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
    return apiDelete(`/products/${id}`);
  },

  generateBarcode: async (): Promise<{ barcode: string }> => {
    return apiGet('/products/generate-barcode');
  },
};

// Servicio para almacenes
export const WarehouseService = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    return apiGet('/warehouses');
  },

  getUserWarehouses: async (): Promise<Warehouse[]> => {
    return apiGet('/warehouses/user/my-warehouses');
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

// Servicio para sucursales
export const BranchService = {
  getBranches: async (): Promise<Branch[]> => {
    return apiGet('/branches');
  },

  getBranchById: async (id: number): Promise<Branch> => {
    return apiGet(`/branches/${id}`);
  },

  createBranch: async (data: CreateBranchDto): Promise<Branch> => {
    return apiPost('/branches', data);
  },

  updateBranch: async (id: number, data: UpdateBranchDto): Promise<Branch> => {
    return apiPatch(`/branches/${id}`, data);
  },

  deleteBranch: async (id: number): Promise<void> => {
    return apiDelete(`/branches/${id}`);
  },

  assignWarehouses: async (id: number, data: AssignWarehousesDto): Promise<Branch> => {
    return apiPost(`/branches/${id}/warehouses`, data);
  },

  unassignWarehouse: async (branchId: number, warehouseId: number): Promise<Branch> => {
    return apiDelete(`/branches/${branchId}/warehouses/${warehouseId}`);
  },
};
