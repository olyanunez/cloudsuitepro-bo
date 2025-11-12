import * as apiService from '../apiService';
import { CustomerService } from '../customerService';

jest.mock('../apiService');

describe('CustomerService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomers', () => {
    it('should fetch paginated customers', async () => {
      const mockResponse = {
        data: [
          { id: 1, code: 'C001', name: 'Customer 1', isActive: true, tenantId: 1 },
          { id: 2, code: 'C002', name: 'Customer 2', isActive: true, tenantId: 1 }
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockApiGet.mockResolvedValueOnce(mockResponse);

      const result = await CustomerService.getCustomers(1, 10);

      expect(result).toEqual(mockResponse);
      expect(mockApiGet).toHaveBeenCalledWith('/customers?page=1&limit=10');
    });

    it('should include search parameter when provided', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockApiGet.mockResolvedValueOnce(mockResponse);

      await CustomerService.getCustomers(1, 10, 'test');

      expect(mockApiGet).toHaveBeenCalledWith('/customers?page=1&limit=10&search=test');
    });
  });

  describe('getCustomer', () => {
    it('should fetch customer by id', async () => {
      const mockCustomer = {
        id: 1,
        code: 'C001',
        name: 'Customer 1',
        email: 'customer1@test.com',
        isActive: true,
        tenantId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: 1
      };

      mockApiGet.mockResolvedValueOnce(mockCustomer);

      const result = await CustomerService.getCustomer(1);

      expect(result).toEqual(mockCustomer);
      expect(mockApiGet).toHaveBeenCalledWith('/customers/1');
    });
  });

  describe('getActiveCustomers', () => {
    it('should fetch only active customers', async () => {
      const mockCustomers = [
        { id: 1, code: 'C001', name: 'Active Customer', isActive: true, tenantId: 1 }
      ];

      mockApiGet.mockResolvedValueOnce(mockCustomers);

      const result = await CustomerService.getActiveCustomers();

      expect(result).toEqual(mockCustomers);
      expect(mockApiGet).toHaveBeenCalledWith('/customers/active');
    });
  });

  describe('searchCustomers', () => {
    it('should search customers and return data array', async () => {
      const mockResponse = {
        data: [
          { id: 1, code: 'C001', name: 'Found Customer', isActive: true, tenantId: 1 }
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1
      };

      mockApiGet.mockResolvedValueOnce(mockResponse);

      const result = await CustomerService.searchCustomers('Found');

      expect(result).toEqual(mockResponse.data);
      expect(mockApiGet).toHaveBeenCalledWith('/customers?search=Found&limit=20');
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const customerData = {
        code: 'C003',
        name: 'New Customer',
        email: 'new@test.com',
        phone: '1234567890',
        isActive: true
      };

      const mockResponse = {
        id: 3,
        ...customerData,
        tenantId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: 1
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await CustomerService.createCustomer(customerData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/customers', customerData);
    });
  });

  describe('updateCustomer', () => {
    it('should update existing customer', async () => {
      const updateData = {
        name: 'Updated Customer',
        email: 'updated@test.com'
      };

      const mockResponse = {
        id: 1,
        code: 'C001',
        ...updateData,
        isActive: true,
        tenantId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        createdBy: 1
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await CustomerService.updateCustomer(1, updateData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/customers/1', updateData);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer', async () => {
      mockApiDelete.mockResolvedValueOnce(undefined);

      await CustomerService.deleteCustomer(1);

      expect(mockApiDelete).toHaveBeenCalledWith('/customers/1');
    });
  });

  describe('generateNextCode', () => {
    it('should generate next customer code', async () => {
      const mockResponse = { code: 'C004' };

      mockApiGet.mockResolvedValueOnce(mockResponse);

      const result = await CustomerService.generateNextCode();

      expect(result).toBe('C004');
      expect(mockApiGet).toHaveBeenCalledWith('/customers/next-code');
    });
  });

  describe('getTopCustomers', () => {
    it('should fetch top customers with default limit', async () => {
      const mockTopCustomers = [
        {
          id: 1,
          code: 'C001',
          name: 'Top Customer',
          initials: 'TC',
          totalPurchases: 10,
          totalAmount: 5000
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockTopCustomers);

      const result = await CustomerService.getTopCustomers();

      expect(result).toEqual(mockTopCustomers);
      expect(mockApiGet).toHaveBeenCalledWith('/customers/top-customers?limit=5');
    });

    it('should fetch top customers with custom limit', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await CustomerService.getTopCustomers(10);

      expect(mockApiGet).toHaveBeenCalledWith('/customers/top-customers?limit=10');
    });
  });
});
