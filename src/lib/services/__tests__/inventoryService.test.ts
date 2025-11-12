import * as apiService from '../apiService';
import {
  ProductCategoryService,
  ProductService,
  WarehouseService,
  InventoryService,
  BranchService
} from '../inventoryService';

jest.mock('../apiService');

// Mock fetch globally for file upload tests
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ProductCategoryService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all product categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Electronics', code: 'ELEC' },
        { id: 2, name: 'Clothing', code: 'CLOTH' }
      ];

      mockApiGet.mockResolvedValueOnce(mockCategories);

      const result = await ProductCategoryService.getAll();

      expect(result).toEqual(mockCategories);
      expect(mockApiGet).toHaveBeenCalledWith('/product-categories');
    });
  });

  describe('getById', () => {
    it('should fetch category by id', async () => {
      const mockCategory = { id: 1, name: 'Electronics', code: 'ELEC' };

      mockApiGet.mockResolvedValueOnce(mockCategory);

      const result = await ProductCategoryService.getById(1);

      expect(result).toEqual(mockCategory);
      expect(mockApiGet).toHaveBeenCalledWith('/product-categories/1');
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const categoryData = { name: 'New Category', code: 'NEW' };
      const mockResponse = { id: 3, ...categoryData };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await ProductCategoryService.create(categoryData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/product-categories', categoryData);
    });
  });

  describe('update', () => {
    it('should update existing category', async () => {
      const updateData = { name: 'Updated Category' };
      const mockResponse = { id: 1, name: 'Updated Category', code: 'ELEC' };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await ProductCategoryService.update(1, updateData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/product-categories/1', updateData);
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      mockApiDelete.mockResolvedValueOnce(undefined);

      await ProductCategoryService.delete(1);

      expect(mockApiDelete).toHaveBeenCalledWith('/product-categories/1');
    });
  });
});

describe('ProductService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  describe('getProducts', () => {
    it('should fetch all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', sku: 'P001' },
        { id: 2, name: 'Product 2', sku: 'P002' }
      ];

      mockApiGet.mockResolvedValueOnce(mockProducts);

      const result = await ProductService.getProducts();

      expect(result).toEqual(mockProducts);
      expect(mockApiGet).toHaveBeenCalledWith('/products');
    });

    it('should filter by category', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await ProductService.getProducts(1);

      expect(mockApiGet).toHaveBeenCalledWith('/products?categoryId=1');
    });

    it('should filter by search term', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await ProductService.getProducts(undefined, 'laptop');

      expect(mockApiGet).toHaveBeenCalledWith('/products?search=laptop');
    });
  });

  describe('getProductById', () => {
    it('should fetch product by id', async () => {
      const mockProduct = { id: 1, name: 'Product 1', sku: 'P001' };

      mockApiGet.mockResolvedValueOnce(mockProduct);

      const result = await ProductService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(mockApiGet).toHaveBeenCalledWith('/products/1');
    });
  });

  describe('createProduct', () => {
    it('should create product with form data', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('tenant_id', '1');

      const productData = {
        name: 'New Product',
        sku: 'P003',
        price: 100,
        categoryId: 1
      };

      const mockResponse = { id: 3, ...productData };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ProductService.createProduct(productData as any);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });

    it('should throw error on failed creation', async () => {
      const productData = { name: 'Product', sku: 'P004', price: 50, categoryId: 1 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error creating product' })
      });

      await expect(ProductService.createProduct(productData as any)).rejects.toThrow(
        'Error creating product'
      );
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      localStorage.setItem('auth_token', 'test-token');

      const updateData = { name: 'Updated Product' };
      const mockResponse = { id: 1, name: 'Updated Product', sku: 'P001' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ProductService.updateProduct(1, updateData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      mockApiDelete.mockResolvedValueOnce(undefined);

      await ProductService.deleteProduct(1);

      expect(mockApiDelete).toHaveBeenCalledWith('/products/1');
    });
  });
});

describe('WarehouseService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWarehouses', () => {
    it('should fetch all warehouses', async () => {
      const mockWarehouses = [
        { id: 1, name: 'Main Warehouse', code: 'WH001' },
        { id: 2, name: 'Secondary Warehouse', code: 'WH002' }
      ];

      mockApiGet.mockResolvedValueOnce(mockWarehouses);

      const result = await WarehouseService.getWarehouses();

      expect(result).toEqual(mockWarehouses);
      expect(mockApiGet).toHaveBeenCalledWith('/warehouses');
    });
  });

  describe('createWarehouse', () => {
    it('should create new warehouse', async () => {
      const warehouseData = { name: 'New Warehouse', code: 'WH003' };
      const mockResponse = { id: 3, ...warehouseData };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await WarehouseService.createWarehouse(warehouseData as any);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/warehouses', warehouseData);
    });
  });
});

describe('InventoryService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItems', () => {
    it('should fetch inventory items', async () => {
      const mockItems = [
        { id: 1, productId: 1, warehouseId: 1, quantity: 100 },
        { id: 2, productId: 2, warehouseId: 1, quantity: 50 }
      ];

      mockApiGet.mockResolvedValueOnce(mockItems);

      const result = await InventoryService.getItems();

      expect(result).toEqual(mockItems);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/items');
    });

    it('should filter by warehouse', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await InventoryService.getItems(1);

      expect(mockApiGet).toHaveBeenCalledWith('/inventory/items?warehouseId=1');
    });

    it('should filter by low stock', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await InventoryService.getItems(undefined, undefined, true);

      expect(mockApiGet).toHaveBeenCalledWith('/inventory/items?lowStock=true');
    });
  });

  describe('createItem', () => {
    it('should create inventory item', async () => {
      const itemData = { productId: 1, warehouseId: 1, quantity: 100 };
      const mockResponse = { id: 1, ...itemData };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await InventoryService.createItem(itemData as any);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/inventory/items', itemData);
    });
  });

  describe('getMovements', () => {
    it('should fetch inventory movements', async () => {
      const mockMovements = [
        { id: 1, productId: 1, type: 'IN', quantity: 100 },
        { id: 2, productId: 1, type: 'OUT', quantity: 50 }
      ];

      mockApiGet.mockResolvedValueOnce(mockMovements);

      const result = await InventoryService.getMovements();

      expect(result).toEqual(mockMovements);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/movements');
    });
  });

  describe('getStockValuationReport', () => {
    it('should fetch stock valuation report', async () => {
      const mockReport = { totalValue: 10000, items: [] };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await InventoryService.getStockValuationReport();

      expect(result).toEqual(mockReport);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/stock-valuation');
    });
  });

  describe('getLowStockReport', () => {
    it('should fetch low stock report', async () => {
      const mockReport = { items: [] };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await InventoryService.getLowStockReport();

      expect(result).toEqual(mockReport);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/low-stock');
    });
  });
});

describe('BranchService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBranches', () => {
    it('should fetch all branches', async () => {
      const mockBranches = [
        { id: 1, name: 'Main Branch', code: 'BR001' },
        { id: 2, name: 'Secondary Branch', code: 'BR002' }
      ];

      mockApiGet.mockResolvedValueOnce(mockBranches);

      const result = await BranchService.getBranches();

      expect(result).toEqual(mockBranches);
      expect(mockApiGet).toHaveBeenCalledWith('/branches');
    });
  });

  describe('createBranch', () => {
    it('should create new branch', async () => {
      const branchData = { name: 'New Branch', code: 'BR003' };
      const mockResponse = { id: 3, ...branchData };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await BranchService.createBranch(branchData as any);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/branches', branchData);
    });
  });

  describe('assignWarehouses', () => {
    it('should assign warehouses to branch', async () => {
      const assignData = { warehouseIds: [1, 2] };
      const mockResponse = { id: 1, name: 'Branch', warehouses: [1, 2] };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await BranchService.assignWarehouses(1, assignData as any);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/branches/1/warehouses', assignData);
    });
  });

  describe('unassignWarehouse', () => {
    it('should unassign warehouse from branch', async () => {
      const mockResponse = { id: 1, name: 'Branch', warehouses: [] };

      mockApiDelete.mockResolvedValueOnce(mockResponse);

      const result = await BranchService.unassignWarehouse(1, 1);

      expect(result).toEqual(mockResponse);
      expect(mockApiDelete).toHaveBeenCalledWith('/branches/1/warehouses/1');
    });
  });
});
