import * as apiService from '../apiService';
import tenantSettingsService from '../tenantSettingsService';

jest.mock('../apiService');

describe('TenantSettingsService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should fetch tenant settings', async () => {
      const mockSettings = {
        id: 1,
        tenantId: 1,
        invoicePrefix: 'INV',
        autoPrintInvoices: true,
        includeLogo: true,
        invoiceFooter: 'Thank you for your business',
        termsAndConditions: 'Payment due within 30 days',
        defaultPaymentMethod: 'CASH',
        enableSounds: true,
        autoPrintReceipts: false,
        askForCustomer: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockSettings);

      const result = await tenantSettingsService.getSettings();

      expect(result).toEqual(mockSettings);
      expect(result.invoicePrefix).toBe('INV');
      expect(result.defaultPaymentMethod).toBe('CASH');
      expect(mockApiGet).toHaveBeenCalledWith('/tenant-settings');
    });
  });

  describe('updateSettings', () => {
    it('should update tenant settings', async () => {
      const updateData = {
        invoicePrefix: 'FACT',
        autoPrintInvoices: false,
        enableSounds: false,
        defaultPaymentMethod: 'CARD'
      };

      const mockResponse = {
        id: 1,
        tenantId: 1,
        invoicePrefix: 'FACT',
        autoPrintInvoices: false,
        includeLogo: true,
        invoiceFooter: 'Thank you',
        termsAndConditions: null,
        defaultPaymentMethod: 'CARD',
        enableSounds: false,
        autoPrintReceipts: false,
        askForCustomer: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await tenantSettingsService.updateSettings(updateData);

      expect(result).toEqual(mockResponse);
      expect(result.invoicePrefix).toBe('FACT');
      expect(result.defaultPaymentMethod).toBe('CARD');
      expect(result.enableSounds).toBe(false);
      expect(mockApiPatch).toHaveBeenCalledWith('/tenant-settings', updateData);
    });

    it('should update partial settings', async () => {
      const updateData = {
        invoiceFooter: 'Custom footer message'
      };

      const mockResponse = {
        id: 1,
        tenantId: 1,
        invoicePrefix: 'INV',
        autoPrintInvoices: true,
        includeLogo: true,
        invoiceFooter: 'Custom footer message',
        termsAndConditions: null,
        defaultPaymentMethod: 'CASH',
        enableSounds: true,
        autoPrintReceipts: false,
        askForCustomer: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await tenantSettingsService.updateSettings(updateData);

      expect(result.invoiceFooter).toBe('Custom footer message');
      expect(mockApiPatch).toHaveBeenCalledWith('/tenant-settings', updateData);
    });

    it('should update boolean settings', async () => {
      const updateData = {
        autoPrintReceipts: true,
        askForCustomer: false,
        includeLogo: false
      };

      const mockResponse = {
        id: 1,
        tenantId: 1,
        invoicePrefix: 'INV',
        autoPrintInvoices: true,
        includeLogo: false,
        invoiceFooter: null,
        termsAndConditions: null,
        defaultPaymentMethod: 'CASH',
        enableSounds: true,
        autoPrintReceipts: true,
        askForCustomer: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await tenantSettingsService.updateSettings(updateData);

      expect(result.autoPrintReceipts).toBe(true);
      expect(result.askForCustomer).toBe(false);
      expect(result.includeLogo).toBe(false);
    });
  });
});
