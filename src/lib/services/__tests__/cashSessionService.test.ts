import * as apiService from '../apiService';
import { CashSessionService } from '../cashSessionService';

jest.mock('../apiService');

describe('CashSessionService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openSession', () => {
    it('should open a new cash session', async () => {
      const sessionData = {
        branchId: 1,
        warehouseId: 1,
        openingAmount: 1000,
        notes: 'Opening session'
      };

      const mockResponse = {
        id: 1,
        sessionNumber: 'CS-001',
        userId: 1,
        branchId: 1,
        warehouseId: 1,
        openingAmount: '1000.00',
        closingAmount: null,
        closingVouchers: null,
        expectedAmount: null,
        expectedVouchers: null,
        difference: null,
        differenceVouchers: null,
        totalCash: null,
        totalCard: null,
        totalTransfer: null,
        totalOther: null,
        openedAt: '2024-01-01T10:00:00Z',
        closedAt: null,
        status: 'OPEN' as const,
        notes: 'Opening session',
        closingNotes: null
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await CashSessionService.openSession(sessionData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/cash-sessions/open', sessionData);
    });
  });

  describe('closeSession', () => {
    it('should close a cash session', async () => {
      const closeData = {
        closingAmount: 2000,
        closingVouchers: 500,
        closingNotes: 'Closing session'
      };

      const mockResponse = {
        id: 1,
        sessionNumber: 'CS-001',
        userId: 1,
        branchId: 1,
        warehouseId: 1,
        openingAmount: '1000.00',
        closingAmount: '2000.00',
        closingVouchers: '500.00',
        expectedAmount: '2000.00',
        expectedVouchers: '500.00',
        difference: '0.00',
        differenceVouchers: '0.00',
        totalCash: '1500.00',
        totalCard: '500.00',
        totalTransfer: '0.00',
        totalOther: '0.00',
        openedAt: '2024-01-01T10:00:00Z',
        closedAt: '2024-01-01T18:00:00Z',
        status: 'CLOSED' as const,
        notes: 'Opening session',
        closingNotes: 'Closing session'
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await CashSessionService.closeSession(1, closeData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/cash-sessions/1/close', closeData);
    });
  });

  describe('getCurrentSession', () => {
    it('should fetch current open session', async () => {
      const mockSession = {
        id: 1,
        sessionNumber: 'CS-001',
        status: 'OPEN' as const,
        openingAmount: '1000.00'
      };

      mockApiGet.mockResolvedValueOnce(mockSession);

      const result = await CashSessionService.getCurrentSession();

      expect(result).toEqual(mockSession);
      expect(mockApiGet).toHaveBeenCalledWith('/cash-sessions/current');
    });

    it('should return null when no session is found', async () => {
      mockApiGet.mockRejectedValueOnce({ message: 'Sesión no encontrada', status: 404 });

      const result = await CashSessionService.getCurrentSession();

      expect(result).toBeNull();
    });

    it('should include branchId in query params', async () => {
      mockApiGet.mockResolvedValueOnce({ id: 1, status: 'OPEN' } as any);

      await CashSessionService.getCurrentSession(5);

      expect(mockApiGet).toHaveBeenCalledWith('/cash-sessions/current?branchId=5');
    });
  });

  describe('getSessionSummary', () => {
    it('should fetch session summary', async () => {
      const mockSummary = {
        id: 1,
        sessionNumber: 'CS-001',
        status: 'CLOSED' as const,
        invoices: []
      };

      mockApiGet.mockResolvedValueOnce(mockSummary);

      const result = await CashSessionService.getSessionSummary(1);

      expect(result).toEqual(mockSummary);
      expect(mockApiGet).toHaveBeenCalledWith('/cash-sessions/1/summary');
    });
  });

  describe('getSessionById', () => {
    it('should fetch session by id', async () => {
      const mockSession = {
        id: 1,
        sessionNumber: 'CS-001',
        status: 'OPEN' as const
      };

      mockApiGet.mockResolvedValueOnce(mockSession);

      const result = await CashSessionService.getSessionById(1);

      expect(result).toEqual(mockSession);
      expect(mockApiGet).toHaveBeenCalledWith('/cash-sessions/1');
    });
  });

  describe('getSessions', () => {
    it('should fetch sessions without filters', async () => {
      const mockSessions = [
        { id: 1, sessionNumber: 'CS-001', status: 'CLOSED' },
        { id: 2, sessionNumber: 'CS-002', status: 'OPEN' }
      ];

      mockApiGet.mockResolvedValueOnce(mockSessions);

      const result = await CashSessionService.getSessions();

      expect(result).toEqual(mockSessions);
      expect(mockApiGet).toHaveBeenCalledWith('/cash-sessions');
    });

    it('should fetch sessions with filters', async () => {
      mockApiGet.mockResolvedValueOnce([]);

      await CashSessionService.getSessions({
        branchId: 1,
        status: 'OPEN',
        limit: 10
      });

      expect(mockApiGet).toHaveBeenCalledWith('/cash-sessions?branchId=1&status=OPEN&limit=10');
    });
  });

  describe('hasOpenSession', () => {
    it('should return true when there is an open session', async () => {
      mockApiGet.mockResolvedValueOnce({
        id: 1,
        status: 'OPEN'
      } as any);

      const result = await CashSessionService.hasOpenSession();

      expect(result).toBe(true);
    });

    it('should return false when there is no session', async () => {
      mockApiGet.mockRejectedValueOnce({ status: 404 });

      const result = await CashSessionService.hasOpenSession();

      expect(result).toBe(false);
    });

    it('should return false when session is closed', async () => {
      mockApiGet.mockResolvedValueOnce({
        id: 1,
        status: 'CLOSED'
      } as any);

      const result = await CashSessionService.hasOpenSession();

      expect(result).toBe(false);
    });
  });

  describe('getOpenSessionId', () => {
    it('should return session id when there is an open session', async () => {
      mockApiGet.mockResolvedValueOnce({
        id: 5,
        status: 'OPEN'
      } as any);

      const result = await CashSessionService.getOpenSessionId();

      expect(result).toBe(5);
    });

    it('should return null when there is no session', async () => {
      mockApiGet.mockRejectedValueOnce({ status: 404 });

      const result = await CashSessionService.getOpenSessionId();

      expect(result).toBeNull();
    });
  });
});
