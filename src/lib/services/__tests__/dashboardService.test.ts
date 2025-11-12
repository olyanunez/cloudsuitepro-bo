import * as apiService from '../apiService';
import { DashboardService } from '../dashboardService';

jest.mock('../apiService');

describe('DashboardService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSalesStats', () => {
    it('should fetch sales statistics', async () => {
      const mockStats = {
        totalInvoices: 100,
        totalAmount: 10000,
        invoicesByPaymentMethod: [
          { paymentMethod: 'CASH', count: 50, total: 5000 },
          { paymentMethod: 'CARD', count: 50, total: 5000 }
        ]
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      const result = await DashboardService.getSalesStats();

      expect(result).toEqual(mockStats);
      expect(mockApiGet).toHaveBeenCalledWith('/invoices/stats');
    });

    it('should fetch sales statistics with filters', async () => {
      const mockStats = {
        totalInvoices: 10,
        totalAmount: 1000,
        invoicesByPaymentMethod: []
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      await DashboardService.getSalesStats({
        branchId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(mockApiGet).toHaveBeenCalledWith('/invoices/stats?branchId=1&startDate=2024-01-01&endDate=2024-01-31');
    });
  });

  describe('getStockValuation', () => {
    it('should fetch stock valuation report', async () => {
      const mockReport = {
        items: [
          {
            productCode: 'P001',
            productName: 'Product 1',
            warehouseName: 'Main Warehouse',
            quantity: 100,
            unitCost: 10,
            totalCost: 1000
          }
        ],
        summary: {
          totalItems: 1,
          totalQuantity: 100,
          totalValue: 1000
        }
      };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await DashboardService.getStockValuation();

      expect(result).toEqual(mockReport);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/stock-valuation');
    });

    it('should fetch stock valuation with warehouse filter', async () => {
      mockApiGet.mockResolvedValueOnce({ items: [], summary: { totalItems: 0, totalQuantity: 0, totalValue: 0 } });

      await DashboardService.getStockValuation(1);

      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/stock-valuation?warehouseId=1');
    });
  });

  describe('getLowStockReport', () => {
    it('should fetch low stock report', async () => {
      const mockReport = {
        items: [
          {
            productCode: 'P001',
            productName: 'Product 1',
            warehouseName: 'Main Warehouse',
            quantity: 5,
            minStock: 10,
            deficit: 5
          }
        ],
        count: 1
      };

      mockApiGet.mockResolvedValueOnce(mockReport);

      const result = await DashboardService.getLowStockReport();

      expect(result).toEqual(mockReport);
      expect(mockApiGet).toHaveBeenCalledWith('/inventory/reports/low-stock');
    });
  });

  describe('getSalesTrend', () => {
    it('should fetch sales trend with default days', async () => {
      const mockTrend = [
        { date: '2024-01-01', total: 100, invoiceCount: 5, averageTicket: 20 },
        { date: '2024-01-02', total: 150, invoiceCount: 8, averageTicket: 18.75 }
      ];

      mockApiGet.mockResolvedValueOnce(mockTrend);

      const result = await DashboardService.getSalesTrend();

      expect(result).toEqual(mockTrend);
      expect(mockApiGet).toHaveBeenCalledWith('/invoices/sales-trend?days=30');
    });

    it('should fetch sales trend with custom days', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await DashboardService.getSalesTrend(7, 1);

      expect(mockApiGet).toHaveBeenCalledWith('/invoices/sales-trend?days=7&branchId=1');
    });
  });

  describe('getGrowthRate', () => {
    it('should fetch growth rate', async () => {
      const mockGrowthData = {
        currentPeriod: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          total: 10000,
          invoiceCount: 100
        },
        previousPeriod: {
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          total: 8000,
          invoiceCount: 80
        },
        growthRate: 25,
        periodDurationDays: 31
      };

      mockApiGet.mockResolvedValueOnce(mockGrowthData);

      const result = await DashboardService.getGrowthRate();

      expect(result).toEqual(mockGrowthData);
      expect(mockApiGet).toHaveBeenCalledWith('/invoices/growth-rate');
    });
  });
});
