import * as apiService from '../apiService';
import { PosService } from '../posService';

jest.mock('../apiService');

describe('PosService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchProducts', () => {
    it('should search products with warehouse filter', async () => {
      const mockProducts = [
        {
          id: 1,
          code: 'P001',
          name: 'Product 1',
          description: 'Test product',
          price: '100.00',
          cost: '50.00',
          category: { id: 1, name: 'Category 1' },
          stock: {
            quantity: 10,
            minStock: 5,
            warehouse: { id: 1, name: 'Main Warehouse' }
          }
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockProducts);

      const result = await PosService.searchProducts({
        search: 'Product',
        warehouseId: 1
      });

      expect(result).toEqual(mockProducts);
      expect(mockApiGet).toHaveBeenCalledWith('/pos/products/search?search=Product&warehouseId=1');
    });
  });

  describe('createInvoice', () => {
    it('should create invoice', async () => {
      const invoiceData = {
        branchId: 1,
        warehouseId: 1,
        subtotal: 200,
        total: 200,
        paymentMethod: 'CASH' as const,
        items: [
          { productId: 1, quantity: 2, unitPrice: 100 }
        ]
      };

      const mockResponse = {
        id: 1,
        invoiceNumber: 'INV-001',
        ncf: null,
        ncfType: null,
        ncfValidUntil: null,
        customerId: null,
        customerName: null,
        customerRnc: null,
        branchId: 1,
        warehouseId: 1,
        userId: 1,
        tenantId: 1,
        subtotal: '200.00',
        tax: '0.00',
        discount: '0.00',
        total: '200.00',
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        notes: null,
        paymentReference: null,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        items: []
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await PosService.createInvoice(invoiceData);

      expect(result).toBeDefined();
      expect(result.invoiceNumber).toBe('INV-001');
      expect(mockApiPost).toHaveBeenCalledWith('/pos/invoices', invoiceData);
    });
  });

  describe('getInvoices', () => {
    it('should fetch invoices with filters', async () => {
      const mockInvoices = [];

      mockApiGet.mockResolvedValueOnce(mockInvoices);

      const result = await PosService.getInvoices({ branchId: 1 });

      expect(result).toEqual(mockInvoices);
      expect(mockApiGet).toHaveBeenCalledWith('/pos/invoices?branchId=1');
    });
  });

  describe('getInvoiceById', () => {
    it('should fetch invoice by id', async () => {
      const mockInvoice = {
        id: 1,
        invoiceNumber: 'INV-001',
        status: 'COMPLETED',
        items: []
      };

      mockApiGet.mockResolvedValueOnce(mockInvoice);

      const result = await PosService.getInvoiceById(1);

      expect(result).toBeDefined();
      expect(result.invoiceNumber).toBe('INV-001');
      expect(mockApiGet).toHaveBeenCalledWith('/pos/invoices/1');
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice by invoice number', async () => {
      const mockResponse = {
        id: 1,
        invoiceNumber: 'INV-001',
        status: 'CANCELLED',
        items: []
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await PosService.cancelInvoice('INV-001');

      expect(result.status).toBe('CANCELLED');
      expect(mockApiPost).toHaveBeenCalledWith('/pos/invoices/cancel', { invoiceNumber: 'INV-001' });
    });
  });
});
