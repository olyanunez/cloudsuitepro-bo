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
} from '@/types/inventory';

// Servicio para categorías de productos
export const ProductCategoryService = {
  getAll: async (): Promise<ProductCategory[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/product-categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener las categorías');
    }

    return response.json();
  },

  getById: async (id: number): Promise<ProductCategory> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/product-categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener la categoría');
    }

    return response.json();
  },

  create: async (data: CreateProductCategoryDto): Promise<ProductCategory> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/product-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear la categoría');
    }

    return response.json();
  },

  update: async (id: number, data: UpdateProductCategoryDto): Promise<ProductCategory> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/product-categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la categoría');
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/product-categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la categoría');
    }
  },
};

// Servicio para productos
export const ProductService = {
  getAll: async (categoryId?: number, search?: string): Promise<Product[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${API_URL}/products`;
    const params = new URLSearchParams();
    
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (search) params.append('search', search);
    
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los productos');
    }

    return response.json();
  },

  getById: async (id: number): Promise<Product> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el producto');
    }

    return response.json();
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear el producto');
    }

    return response.json();
  },

  update: async (id: number, data: UpdateProductDto): Promise<Product> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el producto');
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
  },
};

// Servicio para almacenes
export const WarehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/warehouses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los almacenes');
    }

    return response.json();
  },

  getById: async (id: number): Promise<Warehouse> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/warehouses/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el almacén');
    }

    return response.json();
  },

  create: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/warehouses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear el almacén');
    }

    return response.json();
  },

  update: async (id: number, data: UpdateWarehouseDto): Promise<Warehouse> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/warehouses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el almacén');
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/warehouses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el almacén');
    }
  },
};

// Servicio para inventario
export const InventoryService = {
  // Items de inventario
  getItems: async (warehouseId?: number, productId?: number, lowStock?: boolean): Promise<InventoryItem[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${API_URL}/inventory/items`;
    const params = new URLSearchParams();
    
    if (warehouseId) params.append('warehouseId', warehouseId.toString());
    if (productId) params.append('productId', productId.toString());
    if (lowStock) params.append('lowStock', 'true');
    
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los ítems de inventario');
    }

    return response.json();
  },

  getItemById: async (id: number): Promise<InventoryItem> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/inventory/items/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el ítem de inventario');
    }

    return response.json();
  },

  createItem: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/inventory/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear el ítem de inventario');
    }

    return response.json();
  },

  updateItem: async (id: number, data: UpdateInventoryItemDto): Promise<InventoryItem> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/inventory/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el ítem de inventario');
    }

    return response.json();
  },

  // Movimientos de inventario
  getMovements: async (
    productId?: number,
    type?: MovementType,
    startDate?: string,
    endDate?: string
  ): Promise<InventoryMovement[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${API_URL}/inventory/movements`;
    const params = new URLSearchParams();
    
    if (productId) params.append('productId', productId.toString());
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los movimientos de inventario');
    }

    return response.json();
  },

  getMovementById: async (id: number): Promise<InventoryMovement> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/inventory/movements/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el movimiento de inventario');
    }

    return response.json();
  },

  createMovement: async (data: CreateInventoryMovementDto): Promise<InventoryMovement> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/inventory/movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear el movimiento de inventario');
    }

    return response.json();
  },

  // Reportes
  getStockValuationReport: async (warehouseId?: number): Promise<StockValuationReport> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${API_URL}/inventory/reports/stock-valuation`;
    if (warehouseId) url += `?warehouseId=${warehouseId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el reporte de valorización de inventario');
    }

    return response.json();
  },

  getLowStockReport: async (warehouseId?: number): Promise<LowStockReport> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${API_URL}/inventory/reports/low-stock`;
    if (warehouseId) url += `?warehouseId=${warehouseId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el reporte de stock bajo');
    }

    return response.json();
  },
};
