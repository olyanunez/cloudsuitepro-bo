import * as apiService from '../apiService';
import userPreferencesService from '../userPreferencesService';

jest.mock('../apiService');

describe('UserPreferencesService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should fetch user preferences', async () => {
      const mockPreferences = {
        id: 1,
        userId: 1,
        theme: 'light',
        sidebarExpanded: true,
        compactView: false,
        itemsPerPage: 25,
        emailNotifications: true,
        lowStockAlerts: true,
        ncfExpirationAlerts: true,
        dailySalesSummary: false,
        ncfExpirationDays: 30,
        currency: 'DOP',
        timezone: 'America/Santo_Domingo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 'monday',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockPreferences);

      const result = await userPreferencesService.getPreferences();

      expect(result).toEqual(mockPreferences);
      expect(result.theme).toBe('light');
      expect(result.itemsPerPage).toBe(25);
      expect(result.currency).toBe('DOP');
      expect(mockApiGet).toHaveBeenCalledWith('/user-preferences');
    });
  });

  describe('updatePreferences', () => {
    it('should update appearance preferences', async () => {
      const updateData = {
        theme: 'dark',
        sidebarExpanded: false,
        compactView: true,
        itemsPerPage: 50
      };

      const mockResponse = {
        id: 1,
        userId: 1,
        theme: 'dark',
        sidebarExpanded: false,
        compactView: true,
        itemsPerPage: 50,
        emailNotifications: true,
        lowStockAlerts: true,
        ncfExpirationAlerts: true,
        dailySalesSummary: false,
        ncfExpirationDays: 30,
        currency: 'DOP',
        timezone: 'America/Santo_Domingo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 'monday',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await userPreferencesService.updatePreferences(updateData);

      expect(result).toEqual(mockResponse);
      expect(result.theme).toBe('dark');
      expect(result.compactView).toBe(true);
      expect(result.itemsPerPage).toBe(50);
      expect(mockApiPatch).toHaveBeenCalledWith('/user-preferences', updateData);
    });

    it('should update notification preferences', async () => {
      const updateData = {
        emailNotifications: false,
        lowStockAlerts: false,
        ncfExpirationAlerts: true,
        dailySalesSummary: true,
        ncfExpirationDays: 15
      };

      const mockResponse = {
        id: 1,
        userId: 1,
        theme: 'light',
        sidebarExpanded: true,
        compactView: false,
        itemsPerPage: 25,
        emailNotifications: false,
        lowStockAlerts: false,
        ncfExpirationAlerts: true,
        dailySalesSummary: true,
        ncfExpirationDays: 15,
        currency: 'DOP',
        timezone: 'America/Santo_Domingo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 'monday',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await userPreferencesService.updatePreferences(updateData);

      expect(result.emailNotifications).toBe(false);
      expect(result.dailySalesSummary).toBe(true);
      expect(result.ncfExpirationDays).toBe(15);
      expect(mockApiPatch).toHaveBeenCalledWith('/user-preferences', updateData);
    });

    it('should update regional preferences', async () => {
      const updateData = {
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
        firstDayOfWeek: 'sunday'
      };

      const mockResponse = {
        id: 1,
        userId: 1,
        theme: 'light',
        sidebarExpanded: true,
        compactView: false,
        itemsPerPage: 25,
        emailNotifications: true,
        lowStockAlerts: true,
        ncfExpirationAlerts: true,
        dailySalesSummary: false,
        ncfExpirationDays: 30,
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
        firstDayOfWeek: 'sunday',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await userPreferencesService.updatePreferences(updateData);

      expect(result.currency).toBe('USD');
      expect(result.timezone).toBe('America/New_York');
      expect(result.dateFormat).toBe('MM/DD/YYYY');
      expect(result.timeFormat).toBe('24h');
      expect(mockApiPatch).toHaveBeenCalledWith('/user-preferences', updateData);
    });

    it('should update single preference', async () => {
      const updateData = {
        compactView: true
      };

      const mockResponse = {
        id: 1,
        userId: 1,
        theme: 'light',
        sidebarExpanded: true,
        compactView: true,
        itemsPerPage: 25,
        emailNotifications: true,
        lowStockAlerts: true,
        ncfExpirationAlerts: true,
        dailySalesSummary: false,
        ncfExpirationDays: 30,
        currency: 'DOP',
        timezone: 'America/Santo_Domingo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 'monday',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await userPreferencesService.updatePreferences(updateData);

      expect(result.compactView).toBe(true);
      expect(mockApiPatch).toHaveBeenCalledWith('/user-preferences', updateData);
    });
  });
});
