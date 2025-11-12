import * as apiService from '../apiService';
import reportsService, { ReportPeriod } from '../reportsService';

jest.mock('../apiService');

describe('ReportsService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopProducts', () => {
    it('should fetch top products without filters', async () => {
      const mockProducts = [
        {
          productId: 1,
          productName: 'Product 1',
          sku: 'P001',
          categoryName: 'Category A',
          quantitySold: 100,
          totalRevenue: 5000,
          averagePrice: 50
        },
        {
          productId: 2,
          productName: 'Product 2',
          sku: 'P002',
          categoryName: 'Category B',
          quantitySold: 80,
          totalRevenue: 4000,
          averagePrice: 50
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockProducts);

      const result = await reportsService.getTopProducts();

      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/reports/top-products'));
    });

    it('should fetch top products with filters', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await reportsService.getTopProducts({
        period: ReportPeriod.THIS_MONTH,
        branchId: 1,
        limit: 10,
        sortBy: 'totalRevenue',
        sortOrder: 'desc'
      });

      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('period=THIS_MONTH'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('branchId=1'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
    });
  });

  describe('getProductMargins', () => {
    it('should fetch product margins', async () => {
      const mockMargins = [
        {
          productId: 1,
          productName: 'Product 1',
          sku: 'P001',
          categoryName: 'Category A',
          quantitySold: 50,
          totalRevenue: 5000,
          totalCost: 2500,
          grossProfit: 2500,
          profitMargin: 50
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockMargins);

      const result = await reportsService.getProductMargins();

      expect(result).toEqual(mockMargins);
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/reports/product-margins'));
    });

    it('should fetch product margins with date range', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await reportsService.getProductMargins({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('startDate=2024-01-01'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('endDate=2024-01-31'));
    });
  });

  describe('getSalesByCategory', () => {
    it('should fetch sales by category', async () => {
      const mockSales = [
        {
          categoryId: 1,
          categoryName: 'Electronics',
          totalSales: 100,
          totalRevenue: 10000,
          averagePrice: 100,
          percentage: 45
        },
        {
          categoryId: 2,
          categoryName: 'Clothing',
          totalSales: 150,
          totalRevenue: 7500,
          averagePrice: 50,
          percentage: 35
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockSales);

      const result = await reportsService.getSalesByCategory();

      expect(result).toEqual(mockSales);
      expect(result).toHaveLength(2);
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/reports/sales-by-category'));
    });

    it('should fetch sales by category with period filter', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await reportsService.getSalesByCategory({
        period: ReportPeriod.LAST_MONTH,
        branchId: 2
      });

      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('period=LAST_MONTH'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('branchId=2'));
    });
  });

  describe('getSalesByCashier', () => {
    it('should fetch sales by cashier', async () => {
      const mockSales = [
        {
          userId: 1,
          cashierName: 'John Doe',
          totalInvoices: 50,
          totalRevenue: 10000,
          averageTicket: 200,
          cancelledInvoices: 2
        },
        {
          userId: 2,
          cashierName: 'Jane Smith',
          totalInvoices: 45,
          totalRevenue: 9000,
          averageTicket: 200,
          cancelledInvoices: 1
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockSales);

      const result = await reportsService.getSalesByCashier();

      expect(result).toEqual(mockSales);
      expect(result).toHaveLength(2);
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/reports/sales-by-cashier'));
    });

    it('should fetch sales by cashier with sorting', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await reportsService.getSalesByCashier({
        sortBy: 'totalRevenue',
        sortOrder: 'desc'
      });

      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('sortBy=totalRevenue'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('sortOrder=desc'));
    });
  });

  describe('getSalesTrend', () => {
    it('should fetch sales trend', async () => {
      const mockTrend = [
        {
          date: '2024-01-01',
          totalSales: 100,
          totalRevenue: 5000,
          averageTicket: 50,
          invoiceCount: 100
        },
        {
          date: '2024-01-02',
          totalSales: 120,
          totalRevenue: 6000,
          averageTicket: 50,
          invoiceCount: 120
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockTrend);

      const result = await reportsService.getSalesTrend();

      expect(result).toEqual(mockTrend);
      expect(result).toHaveLength(2);
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/reports/sales-trend'));
    });

    it('should fetch sales trend for this week', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await reportsService.getSalesTrend({
        period: ReportPeriod.THIS_WEEK
      });

      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('period=THIS_WEEK'));
    });
  });

  describe('getPeriodComparison', () => {
    it('should fetch period comparison data', async () => {
      const mockComparison = {
        current: {
          period: 'January 2024',
          totalRevenue: 50000,
          totalInvoices: 500,
          averageTicket: 100
        },
        previous: {
          period: 'December 2023',
          totalRevenue: 45000,
          totalInvoices: 450,
          averageTicket: 100
        },
        comparison: {
          revenueChange: 5000,
          revenueChangePercent: 11.11,
          invoicesChange: 50,
          invoicesChangePercent: 11.11,
          averageTicketChange: 0,
          averageTicketChangePercent: 0
        }
      };

      mockApiGet.mockResolvedValueOnce(mockComparison);

      const result = await reportsService.getPeriodComparison();

      expect(result).toEqual(mockComparison);
      expect(result.current.totalRevenue).toBe(50000);
      expect(result.comparison.revenueChangePercent).toBe(11.11);
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/reports/period-comparison'));
    });

    it('should fetch period comparison with custom dates', async () => {
      mockApiGet.mockResolvedValueOnce({
        current: { period: '', totalRevenue: 0, totalInvoices: 0, averageTicket: 0 },
        previous: { period: '', totalRevenue: 0, totalInvoices: 0, averageTicket: 0 },
        comparison: {
          revenueChange: 0,
          revenueChangePercent: 0,
          invoicesChange: 0,
          invoicesChangePercent: 0,
          averageTicketChange: 0,
          averageTicketChangePercent: 0
        }
      });

      await reportsService.getPeriodComparison({
        period: ReportPeriod.CUSTOM,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('period=CUSTOM'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('startDate=2024-01-01'));
      expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('endDate=2024-01-31'));
    });
  });
});
