import * as apiService from '../apiService';
import ncfService, { NcfType, DgiiReportType } from '../ncfService';

jest.mock('../apiService');

// Mock fetch globally
global.fetch = jest.fn();

describe('ncfService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('createSequence', () => {
    it('should create a new NCF sequence', async () => {
      const sequenceData = {
        branchId: 1,
        ncfType: NcfType.B01,
        series: 'A',
        prefix: 'B01',
        rangeStart: 1,
        rangeEnd: 1000,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        description: 'Test sequence'
      };

      const mockResponse = {
        id: 1,
        tenantId: 1,
        ...sequenceData,
        currentNumber: 1,
        isActive: true,
        isExpired: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await ncfService.createSequence(sequenceData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/ncf/sequences', sequenceData);
    });
  });

  describe('getAllSequences', () => {
    it('should fetch all NCF sequences', async () => {
      const mockSequences = [
        { id: 1, ncfType: NcfType.B01, series: 'A', prefix: 'B01', currentNumber: 1 },
        { id: 2, ncfType: NcfType.B02, series: 'B', prefix: 'B02', currentNumber: 1 }
      ];

      mockApiGet.mockResolvedValueOnce(mockSequences);

      const result = await ncfService.getAllSequences();

      expect(result).toEqual(mockSequences);
      expect(mockApiGet).toHaveBeenCalledWith('/ncf/sequences');
    });

    it('should fetch sequences filtered by branch', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await ncfService.getAllSequences(1);

      expect(mockApiGet).toHaveBeenCalledWith('/ncf/sequences?branchId=1');
    });
  });

  describe('getSequenceById', () => {
    it('should fetch NCF sequence by id', async () => {
      const mockSequence = {
        id: 1,
        ncfType: NcfType.B01,
        series: 'A',
        prefix: 'B01',
        currentNumber: 1,
        tenantId: 1,
        branchId: null,
        rangeStart: 1,
        rangeEnd: 1000,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        isActive: true,
        isExpired: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockSequence);

      const result = await ncfService.getSequenceById(1);

      expect(result).toEqual(mockSequence);
      expect(mockApiGet).toHaveBeenCalledWith('/ncf/sequences/1');
    });
  });

  describe('updateSequence', () => {
    it('should update NCF sequence', async () => {
      const updateData = {
        validUntil: '2025-12-31',
        isActive: true,
        description: 'Updated sequence'
      };

      const mockResponse = {
        id: 1,
        ncfType: NcfType.B01,
        ...updateData,
        tenantId: 1,
        branchId: null,
        series: 'A',
        prefix: 'B01',
        rangeStart: 1,
        rangeEnd: 1000,
        currentNumber: 1,
        validFrom: '2024-01-01',
        isExpired: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await ncfService.updateSequence(1, updateData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/ncf/sequences/1', updateData);
    });
  });

  describe('checkExpiringSequences', () => {
    it('should fetch expiring sequences', async () => {
      const mockExpiringSequences = [
        {
          id: 1,
          ncfType: NcfType.B01,
          validUntil: '2024-12-31',
          isExpired: false,
          tenantId: 1,
          branchId: null,
          series: 'A',
          prefix: 'B01',
          rangeStart: 1,
          rangeEnd: 1000,
          currentNumber: 900,
          validFrom: '2024-01-01',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockExpiringSequences);

      const result = await ncfService.checkExpiringSequences();

      expect(result).toEqual(mockExpiringSequences);
      expect(mockApiGet).toHaveBeenCalledWith('/ncf/sequences/expiring/check');
    });
  });

  describe('getConfiguration', () => {
    it('should fetch NCF configuration', async () => {
      const mockConfig = {
        id: 1,
        tenantId: 1,
        defaultCreditFiscal: 1,
        defaultConsumo: 2,
        itbisRate: 18,
        autoAssignNcf: true,
        requireNcfForInvoice: true,
        allowManualNcf: false,
        requireCustomerRnc: true,
        alertDaysBeforeExpiry: 30,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockConfig);

      const result = await ncfService.getConfiguration();

      expect(result).toEqual(mockConfig);
      expect(mockApiGet).toHaveBeenCalledWith('/ncf/configuration');
    });
  });

  describe('upsertConfiguration', () => {
    it('should create or update NCF configuration', async () => {
      const configData = {
        itbisRate: 18,
        autoAssignNcf: true,
        requireNcfForInvoice: true,
        allowManualNcf: false,
        requireCustomerRnc: true,
        alertDaysBeforeExpiry: 30
      };

      const mockResponse = {
        id: 1,
        tenantId: 1,
        ...configData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await ncfService.upsertConfiguration(configData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/ncf/configuration', configData);
    });
  });

  describe('updateConfiguration', () => {
    it('should update NCF configuration', async () => {
      const updateData = { itbisRate: 19 };

      const mockResponse = {
        id: 1,
        tenantId: 1,
        itbisRate: 19,
        autoAssignNcf: true,
        requireNcfForInvoice: true,
        allowManualNcf: false,
        requireCustomerRnc: true,
        alertDaysBeforeExpiry: 30,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await ncfService.updateConfiguration(updateData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/ncf/configuration', updateData);
    });
  });

  describe('generateDgiiReport', () => {
    it('should generate DGII report blob', async () => {
      const reportData = {
        reportType: DgiiReportType.REPORT_607,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockBlob = new Blob(['test data'], { type: 'text/plain' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      const result = await ncfService.generateDgiiReport(reportData);

      expect(result).toEqual(mockBlob);
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/ncf/reports/dgii`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(reportData)
        })
      );
    });

    it('should throw error when report generation fails', async () => {
      const reportData = {
        reportType: DgiiReportType.REPORT_606,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(ncfService.generateDgiiReport(reportData)).rejects.toThrow(
        'Error al generar el reporte'
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should fetch NCF dashboard statistics', async () => {
      const mockStats = {
        expiringSequences: [],
        criticalSequences: [],
        totalActiveSequences: 5,
        expiringCount: 1,
        criticalCount: 2,
        ncfUsageByMonth: []
      };

      mockApiGet.mockResolvedValueOnce(mockStats);

      const result = await ncfService.getDashboardStats();

      expect(result).toEqual(mockStats);
      expect(mockApiGet).toHaveBeenCalledWith('/ncf/dashboard/stats');
    });
  });

  describe('getNcfUsageByMonth', () => {
    it('should fetch NCF usage by month with default months', async () => {
      const mockUsage = [
        { month: '2024-01', B01: 10, B02: 20, total: 30 },
        { month: '2024-02', B01: 15, B02: 25, total: 40 }
      ];

      mockApiGet.mockResolvedValueOnce(mockUsage);

      const result = await ncfService.getNcfUsageByMonth();

      expect(result).toEqual(mockUsage);
      expect(mockApiGet).toHaveBeenCalledWith('/ncf/dashboard/usage-by-month?months=6');
    });

    it('should fetch NCF usage by month with custom months', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await ncfService.getNcfUsageByMonth(12);

      expect(mockApiGet).toHaveBeenCalledWith('/ncf/dashboard/usage-by-month?months=12');
    });
  });
});
