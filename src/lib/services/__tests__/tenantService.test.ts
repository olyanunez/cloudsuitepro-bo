import * as apiService from '../apiService';
import { TenantService } from '../tenantService';

jest.mock('../apiService');

describe('TenantService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTenants', () => {
    it('should fetch all tenants and normalize data', async () => {
      const mockTenants = [
        {
          id: '1',
          name: 'Company A',
          email: 'companya@test.com',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Company B',
          email: 'companyb@test.com',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockTenants);

      const result = await TenantService.getTenants();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Company A');
      expect(result[1].name).toBe('Company B');
      expect(mockApiGet).toHaveBeenCalledWith('/tenants');
    });
  });

  describe('getTenantById', () => {
    it('should fetch tenant by id and normalize data', async () => {
      const mockTenant = {
        id: '1',
        name: 'My Company',
        description: 'Test company',
        email: 'company@test.com',
        phone: '1234567890',
        taxId: 'TAX-123',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockTenant);

      const result = await TenantService.getTenantById('1');

      expect(result).toMatchObject({
        id: '1',
        name: 'My Company',
        description: 'Test company',
        email: 'company@test.com'
      });
      expect(mockApiGet).toHaveBeenCalledWith('/tenants/1');
    });
  });

  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const tenantData = {
        name: 'New Company',
        email: 'new@company.com',
        phone: '1234567890',
        taxId: 'TAX-456'
      };

      const mockResponse = {
        id: '3',
        ...tenantData,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await TenantService.createTenant(tenantData);

      expect(result.name).toBe('New Company');
      expect(result.email).toBe('new@company.com');
      expect(mockApiPost).toHaveBeenCalledWith('/tenants', tenantData);
    });
  });

  describe('updateTenant', () => {
    it('should update existing tenant', async () => {
      const updateData = {
        name: 'Updated Company',
        email: 'updated@company.com'
      };

      const mockResponse = {
        id: '1',
        name: 'Updated Company',
        email: 'updated@company.com',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await TenantService.updateTenant('1', updateData);

      expect(result.name).toBe('Updated Company');
      expect(mockApiPatch).toHaveBeenCalledWith('/tenants/1', updateData);
    });
  });

  describe('deleteTenant', () => {
    it('should delete tenant', async () => {
      mockApiDelete.mockResolvedValueOnce(undefined);

      await TenantService.deleteTenant('1');

      expect(mockApiDelete).toHaveBeenCalledWith('/tenants/1');
    });
  });

  describe('toggleTenantStatus', () => {
    it('should activate tenant', async () => {
      const mockResponse = {
        id: '1',
        name: 'Company A',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await TenantService.toggleTenantStatus('1', true);

      expect(result.isActive).toBe(true);
      expect(mockApiPatch).toHaveBeenCalledWith('/tenants/1/status', { isActive: true });
    });

    it('should deactivate tenant', async () => {
      const mockResponse = {
        id: '1',
        name: 'Company A',
        isActive: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await TenantService.toggleTenantStatus('1', false);

      expect(result.isActive).toBe(false);
      expect(mockApiPatch).toHaveBeenCalledWith('/tenants/1/status', { isActive: false });
    });
  });
});
