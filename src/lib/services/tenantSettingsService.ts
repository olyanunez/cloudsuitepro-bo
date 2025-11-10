import { apiGet, apiPatch } from './apiService';

export interface TenantSettings {
  id: number;
  tenantId: number;
  // Configuración de Facturas
  invoicePrefix: string;
  autoPrintInvoices: boolean;
  includeLogo: boolean;
  invoiceFooter: string | null;
  termsAndConditions: string | null;
  // Configuración de POS
  defaultPaymentMethod: string;
  enableSounds: boolean;
  autoPrintReceipts: boolean;
  askForCustomer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantSettingsDto {
  invoicePrefix?: string;
  autoPrintInvoices?: boolean;
  includeLogo?: boolean;
  invoiceFooter?: string;
  termsAndConditions?: string;
  defaultPaymentMethod?: string;
  enableSounds?: boolean;
  autoPrintReceipts?: boolean;
  askForCustomer?: boolean;
}

class TenantSettingsService {
  /**
   * Obtener configuración del tenant actual
   */
  async getSettings(): Promise<TenantSettings> {
    return await apiGet<TenantSettings>('/tenant-settings');
  }

  /**
   * Actualizar configuración del tenant
   */
  async updateSettings(data: UpdateTenantSettingsDto): Promise<TenantSettings> {
    return await apiPatch<TenantSettings>('/tenant-settings', data);
  }
}

export default new TenantSettingsService();
