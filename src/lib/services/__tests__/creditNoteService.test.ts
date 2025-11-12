import * as apiService from '../apiService';
import { creditNoteService, ReturnType, RefundMethod } from '../creditNoteService';

jest.mock('../apiService');

describe('creditNoteService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new credit note', async () => {
      const creditNoteData = {
        originalInvoiceId: 1,
        returnType: ReturnType.FULL,
        refundMethod: RefundMethod.CASH,
        subtotal: 100,
        tax: 18,
        total: 118,
        items: [
          {
            productId: 1,
            quantity: 2,
            unitPrice: 50,
            subtotal: 100,
            tax: 18,
            total: 118
          }
        ]
      };

      const mockResponse = {
        id: 1,
        creditNoteNumber: 'CN-001',
        originalInvoiceId: 1,
        originalInvoiceNumber: 'INV-001',
        fiscalType: 'FISCAL' as const,
        branchId: 1,
        branch: { id: 1, code: 'BR001', name: 'Main Branch' },
        warehouseId: 1,
        warehouse: { id: 1, name: 'Main Warehouse' },
        userId: 1,
        user: { id: 1, name: 'User 1', email: 'user@test.com' },
        tenantId: 1,
        subtotal: 100,
        tax: 18,
        discount: 0,
        total: 118,
        returnType: ReturnType.FULL,
        refundMethod: RefundMethod.CASH,
        status: 'COMPLETED' as const,
        items: [],
        isActive: true,
        version: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await creditNoteService.create(creditNoteData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/credit-notes', creditNoteData);
    });
  });

  describe('getAll', () => {
    it('should fetch all credit notes without filters', async () => {
      const mockResponse = {
        data: [
          { id: 1, creditNoteNumber: 'CN-001', total: 100 },
          { id: 2, creditNoteNumber: 'CN-002', total: 200 }
        ],
        total: 2,
        limit: 10,
        offset: 0
      };

      mockApiGet.mockResolvedValueOnce(mockResponse);

      const result = await creditNoteService.getAll();

      expect(result).toEqual(mockResponse);
      expect(mockApiGet).toHaveBeenCalledWith('/credit-notes');
    });

    it('should fetch credit notes with filters', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0
      };

      mockApiGet.mockResolvedValueOnce(mockResponse);

      await creditNoteService.getAll({
        branchId: 1,
        status: 'COMPLETED',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        limit: 20
      });

      expect(mockApiGet).toHaveBeenCalledWith(
        '/credit-notes?branchId=1&startDate=2024-01-01&endDate=2024-01-31&status=COMPLETED&limit=20'
      );
    });

    it('should filter by fiscal type', async () => {
      mockApiGet.mockResolvedValueOnce({ data: [], total: 0, limit: 10, offset: 0 });

      await creditNoteService.getAll({
        fiscalType: 'INTERNAL',
        refundMethod: 'CASH'
      });

      expect(mockApiGet).toHaveBeenCalledWith('/credit-notes?fiscalType=INTERNAL&refundMethod=CASH');
    });
  });

  describe('getById', () => {
    it('should fetch credit note by id', async () => {
      const mockCreditNote = {
        id: 1,
        creditNoteNumber: 'CN-001',
        originalInvoiceId: 1,
        originalInvoiceNumber: 'INV-001',
        fiscalType: 'FISCAL' as const,
        branchId: 1,
        branch: { id: 1, code: 'BR001', name: 'Main Branch' },
        warehouseId: 1,
        warehouse: { id: 1, name: 'Main Warehouse' },
        userId: 1,
        user: { id: 1, name: 'User 1', email: 'user@test.com' },
        tenantId: 1,
        subtotal: 100,
        tax: 18,
        discount: 0,
        total: 118,
        returnType: ReturnType.PARTIAL,
        refundMethod: RefundMethod.CARD,
        status: 'COMPLETED' as const,
        items: [],
        isActive: true,
        version: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockCreditNote);

      const result = await creditNoteService.getById(1);

      expect(result).toEqual(mockCreditNote);
      expect(mockApiGet).toHaveBeenCalledWith('/credit-notes/1');
    });
  });

  describe('getStats', () => {
    it('should fetch credit note statistics without filters', async () => {
      const mockStats = {
        totalReturns: 10,
        totalAmount: 5000,
        fiscalReturns: 8,
        internalReturns: 2
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      const result = await creditNoteService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockApiGet).toHaveBeenCalledWith('/credit-notes/stats');
    });

    it('should fetch statistics with filters', async () => {
      const mockStats = {
        totalReturns: 5,
        totalAmount: 2000,
        fiscalReturns: 4,
        internalReturns: 1
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      await creditNoteService.getStats(1, '2024-01-01', '2024-01-31');

      expect(mockApiGet).toHaveBeenCalledWith('/credit-notes/stats?branchId=1&startDate=2024-01-01&endDate=2024-01-31');
    });
  });
});
