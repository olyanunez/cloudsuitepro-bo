import { apiGet, apiPatch } from './apiService';

export interface UserPreferences {
  id: number;
  userId: number;
  // Apariencia
  theme: string;
  sidebarExpanded: boolean;
  compactView: boolean;
  itemsPerPage: number;
  // Notificaciones
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  ncfExpirationAlerts: boolean;
  dailySalesSummary: boolean;
  ncfExpirationDays: number;
  // Regional
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: string;
  // Impresión
  printBrowserInvoice: boolean;
  printThermalVoucher: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferencesDto {
  theme?: string;
  sidebarExpanded?: boolean;
  compactView?: boolean;
  itemsPerPage?: number;
  emailNotifications?: boolean;
  lowStockAlerts?: boolean;
  ncfExpirationAlerts?: boolean;
  dailySalesSummary?: boolean;
  ncfExpirationDays?: number;
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  firstDayOfWeek?: string;
  printBrowserInvoice?: boolean;
  printThermalVoucher?: boolean;
}

class UserPreferencesService {
  /**
   * Obtener preferencias del usuario actual
   */
  async getPreferences(): Promise<UserPreferences> {
    return await apiGet<UserPreferences>('/user-preferences');
  }

  /**
   * Actualizar preferencias del usuario
   */
  async updatePreferences(data: UpdateUserPreferencesDto): Promise<UserPreferences> {
    return await apiPatch<UserPreferences>('/user-preferences', data);
  }
}

export default new UserPreferencesService();
