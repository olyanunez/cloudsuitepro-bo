import { apiGet, apiPost, apiPatch } from './apiService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Enums
export enum NcfType {
  B01 = 'B01', // Crédito Fiscal
  B02 = 'B02', // Consumo
  B03 = 'B03', // Nota de Débito
  B04 = 'B04', // Nota de Crédito
  B11 = 'B11', // Proveedores Informales
  B12 = 'B12', // Registro Único de Ingresos
  B13 = 'B13', // Gastos Menores
  B14 = 'B14', // Regímenes Especiales
  B15 = 'B15', // Comprobante Gubernamental
  B16 = 'B16', // Comprobante para Exportaciones
}

export enum DgiiReportType {
  REPORT_606 = '606', // Compras
  REPORT_607 = '607', // Ventas
}

// Tipos
export interface NcfSequence {
  id: number;
  tenantId: number;
  branchId: number | null;
  ncfType: NcfType;
  series: string;
  prefix: string;
  rangeStart: number;
  rangeEnd: number;
  currentNumber: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isExpired: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: number;
    name: string;
  };
}

export interface NcfConfiguration {
  id: number;
  tenantId: number;
  defaultCreditFiscal?: number;
  defaultConsumo?: number;
  defaultNotaDebito?: number;
  defaultNotaCredito?: number;
  itbisRate: number;
  autoAssignNcf: boolean;
  requireNcfForInvoice: boolean;
  allowManualNcf: boolean;
  requireCustomerRnc: boolean;
  alertDaysBeforeExpiry: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNcfSequenceDto {
  branchId?: number;
  ncfType: NcfType;
  series: string;
  prefix: string;
  rangeStart: number;
  rangeEnd: number;
  validFrom: string;
  validUntil: string;
  description?: string;
}

export interface UpdateNcfSequenceDto {
  branchId?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  description?: string;
}

export interface CreateNcfConfigurationDto {
  defaultCreditFiscal?: number;
  defaultConsumo?: number;
  defaultNotaDebito?: number;
  defaultNotaCredito?: number;
  itbisRate: number;
  autoAssignNcf: boolean;
  requireNcfForInvoice: boolean;
  allowManualNcf: boolean;
  requireCustomerRnc: boolean;
  alertDaysBeforeExpiry: number;
}

export interface GenerateDgiiReportDto {
  reportType: DgiiReportType;
  startDate: string;
  endDate: string;
}

export interface ExpiringSequence {
  id: number;
  ncfType: NcfType;
  prefix: string;
  series: string;
  currentNumber: number;
  rangeEnd: number;
  validUntil: string;
  branchName: string;
  daysUntilExpiry: number;
  available: number;
}

export interface CriticalSequence {
  id: number;
  ncfType: NcfType;
  prefix: string;
  available: number;
  total: number;
  percentAvailable: number;
  branchName: string;
}

export interface DashboardStats {
  expiringSequences: ExpiringSequence[];
  criticalSequences: CriticalSequence[];
  totalActiveSequences: number;
  expiringCount: number;
  criticalCount: number;
  ncfUsageByMonth: Array<{
    ncfType: NcfType;
    _count: { id: number };
  }>;
}

export interface NcfUsageByMonth {
  month: string;
  B01?: number;
  B02?: number;
  B03?: number;
  B04?: number;
  total: number;
}

// Helper para obtener headers de autenticación
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'x-tenant-id': tenantId || '',
  };
};

// Servicio NCF
const ncfService = {
  // ===== SECUENCIAS NCF =====

  /**
   * Crear una nueva secuencia NCF
   */
  createSequence: async (data: CreateNcfSequenceDto): Promise<NcfSequence> => {
    return apiPost<NcfSequence>('/ncf/sequences', data);
  },

  /**
   * Obtener todas las secuencias NCF
   */
  getAllSequences: async (branchId?: number): Promise<NcfSequence[]> => {
    const endpoint = branchId
      ? `/ncf/sequences?branchId=${branchId}`
      : '/ncf/sequences';
    return apiGet<NcfSequence[]>(endpoint);
  },

  /**
   * Obtener una secuencia NCF por ID
   */
  getSequenceById: async (id: number): Promise<NcfSequence> => {
    return apiGet<NcfSequence>(`/ncf/sequences/${id}`);
  },

  /**
   * Actualizar una secuencia NCF
   */
  updateSequence: async (
    id: number,
    data: UpdateNcfSequenceDto
  ): Promise<NcfSequence> => {
    return apiPatch<NcfSequence>(`/ncf/sequences/${id}`, data);
  },

  /**
   * Verificar secuencias próximas a vencer
   */
  checkExpiringSequences: async (): Promise<NcfSequence[]> => {
    return apiGet<NcfSequence[]>('/ncf/sequences/expiring/check');
  },

  // ===== CONFIGURACIÓN NCF =====

  /**
   * Obtener configuración NCF
   */
  getConfiguration: async (): Promise<NcfConfiguration> => {
    return apiGet<NcfConfiguration>('/ncf/configuration');
  },

  /**
   * Crear o actualizar configuración NCF
   */
  upsertConfiguration: async (
    data: CreateNcfConfigurationDto
  ): Promise<NcfConfiguration> => {
    return apiPost<NcfConfiguration>('/ncf/configuration', data);
  },

  /**
   * Actualizar configuración NCF
   */
  updateConfiguration: async (
    data: Partial<CreateNcfConfigurationDto>
  ): Promise<NcfConfiguration> => {
    return apiPatch<NcfConfiguration>('/ncf/configuration', data);
  },

  // ===== REPORTES DGII =====

  /**
   * Generar y descargar reporte DGII
   */
  generateDgiiReport: async (data: GenerateDgiiReportDto): Promise<Blob> => {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_URL}/ncf/reports/dgii`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte');
    }

    return response.blob();
  },

  /**
   * Descargar reporte DGII como archivo
   */
  downloadDgiiReport: async (data: GenerateDgiiReportDto): Promise<void> => {
    const blob = await ncfService.generateDgiiReport(data);
    const filename = `${data.reportType}_${data.startDate}_${data.endDate}.txt`;

    // Crear link de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ===== ESTADÍSTICAS PARA DASHBOARD =====

  /**
   * Obtener estadísticas de NCF para el dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiGet<DashboardStats>('/ncf/dashboard/stats');
  },

  /**
   * Obtener uso de NCF agrupado por mes
   */
  getNcfUsageByMonth: async (months: number = 6): Promise<NcfUsageByMonth[]> => {
    return apiGet<NcfUsageByMonth[]>(`/ncf/dashboard/usage-by-month?months=${months}`);
  },
};

// Utilidades
export const ncfTypeLabels: Record<NcfType, string> = {
  [NcfType.B01]: 'B01 - Crédito Fiscal',
  [NcfType.B02]: 'B02 - Consumo',
  [NcfType.B03]: 'B03 - Nota de Débito',
  [NcfType.B04]: 'B04 - Nota de Crédito',
  [NcfType.B11]: 'B11 - Proveedores Informales',
  [NcfType.B12]: 'B12 - Registro Único de Ingresos',
  [NcfType.B13]: 'B13 - Gastos Menores',
  [NcfType.B14]: 'B14 - Regímenes Especiales',
  [NcfType.B15]: 'B15 - Comprobante Gubernamental',
  [NcfType.B16]: 'B16 - Comprobante para Exportaciones',
};

export const dgiiReportTypeLabels: Record<DgiiReportType, string> = {
  [DgiiReportType.REPORT_606]: '606 - Compras',
  [DgiiReportType.REPORT_607]: '607 - Ventas',
};

export default ncfService;
