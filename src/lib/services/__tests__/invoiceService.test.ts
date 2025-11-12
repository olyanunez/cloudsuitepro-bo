import * as apiService from '../apiService';
import { InvoiceService } from '../invoiceService';

jest.mock('../apiService');

describe('InvoiceService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console errors in tests
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInvoices', () => {
    it('should fetch all invoices', async () => {
      const mockInvoices = {
        data: [
          { id: 1, invoiceNumber: 'INV-001', status: 'COMPLETED' },
          { id: 2, invoiceNumber: 'INV-002', status: 'PENDING' },
        ],
        meta: {
          total: 2,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      };

      mockApiGet.mockResolvedValueOnce(mockInvoices);

      const result = await InvoiceService.getInvoices();

      expect(result).toEqual(mockInvoices);
      expect(mockApiGet).toHaveBeenCalledWith('/invoices');
    });
  });

  describe('getInvoice', () => {
    it('should fetch invoice by id', async () => {
      const mockInvoice = {
        id: 1,
        invoiceNumber: 'INV-001',
        branchId: 1,
        warehouseId: 1,
        customerId: 1,
        userId: 1,
        status: 'COMPLETED' as const,
        paymentMethod: 'CASH' as const,
        subtotal: 100,
        tax: 0,
        discount: 0,
        total: 100,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        items: [],
        customer: { id: 1, name: 'Customer 1' },
        branch: { id: 1, code: 'BR001', name: 'Branch 1' },
        warehouse: { id: 1, name: 'Warehouse 1' },
        user: { id: 1, name: 'User 1', email: 'user@test.com' }
      };

      mockApiGet.mockResolvedValueOnce(mockInvoice);

      const result = await InvoiceService.getInvoice(1);

      expect(result).toEqual(mockInvoice);
      expect(mockApiGet).toHaveBeenCalledWith('/invoices/1');
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice', async () => {
      const mockResponse = {
        id: 1,
        invoiceNumber: 'INV-001',
        status: 'CANCELLED' as const,
        branchId: 1,
        warehouseId: 1,
        customerId: 1,
        userId: 1,
        paymentMethod: 'CASH' as const,
        subtotal: 100,
        tax: 0,
        discount: 0,
        total: 100,
        isActive: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        items: [],
        customer: { id: 1, name: 'Customer 1' },
        branch: { id: 1, code: 'BR001', name: 'Branch 1' },
        warehouse: { id: 1, name: 'Warehouse 1' },
        user: { id: 1, name: 'User 1', email: 'user@test.com' }
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await InvoiceService.cancelInvoice(1);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/invoices/1/cancel');
    });
  });

  describe('getStats', () => {
    it('should fetch invoice statistics', async () => {
      const mockStats = {
        totalInvoices: 10,
        totalAmount: 1000,
        invoicesByPaymentMethod: [
          { paymentMethod: 'CASH', count: 5, total: 500 },
          { paymentMethod: 'CARD', count: 5, total: 500 }
        ]
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      const result = await InvoiceService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockApiGet).toHaveBeenCalledWith('/invoices/stats');
    });

    it('should fetch statistics with filters', async () => {
      const mockStats = {
        totalInvoices: 5,
        totalAmount: 500,
        invoicesByPaymentMethod: []
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      await InvoiceService.getStats(1, '2024-01-01', '2024-01-31');

      expect(mockApiGet).toHaveBeenCalledWith('/invoices/stats?branchId=1&startDate=2024-01-01&endDate=2024-01-31');
    });
  });
});
