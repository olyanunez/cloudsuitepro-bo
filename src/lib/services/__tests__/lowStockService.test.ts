import * as apiService from '../apiService';
import lowStockService from '../lowStockService';

jest.mock('../apiService');

describe('LowStockService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLowStockItems', () => {
    it('should fetch low stock items without warehouse filter', async () => {
      const mockReport = {
        items: [
          {
            id: 1,
            productId: 1,
            productCode: 'P001',
            productName: 'Product 1',
            warehouseId: 1,
            warehouseName: 'Main Warehouse',
            quantity: 5,
            minStock: 10,
            deficit: 5
          },
          {
            id: 2,
            productId: 2,
            productCode: 'P002',
            productName: 'Product 2',
            warehouseId: 1,
            warehouseName: 'Main Warehouse',
            quantity: 2,
            minStock: 15,
            deficit: 13
          }
        ],
        count: 2
      };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await lowStockService.getLowStockItems();

      expect(result).toEqual(mockReport);
      expect(result.items).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/low-stock');
    });

    it('should fetch low stock items with warehouse filter', async () => {
      const mockReport = {
        items: [
          {
            id: 1,
            productId: 1,
            productCode: 'P001',
            productName: 'Product 1',
            warehouseId: 2,
            warehouseName: 'Secondary Warehouse',
            quantity: 3,
            minStock: 10,
            deficit: 7
          }
        ],
        count: 1
      };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await lowStockService.getLowStockItems(2);

      expect(result).toEqual(mockReport);
      expect(result.items).toHaveLength(1);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/low-stock?warehouseId=2');
    });

    it('should return empty report when no low stock items', async () => {
      const mockReport = {
        items: [],
        count: 0
      };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await lowStockService.getLowStockItems();

      expect(result.items).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe('getLowStockCount', () => {
    it('should fetch low stock count', async () => {
      const mockCount = { count: 15 };

      mockApiGet.mockResolvedValueOnce(mockCount);

      const result = await lowStockService.getLowStockCount();

      expect(result).toEqual(mockCount);
      expect(result.count).toBe(15);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/low-stock/count');
    });

    it('should return zero count when no low stock items', async () => {
      const mockCount = { count: 0 };

      mockApiGet.mockResolvedValueOnce(mockCount);

      const result = await lowStockService.getLowStockCount();

      expect(result.count).toBe(0);
    });
  });
});
