import { apiGet } from './apiService';

export interface DashboardStats {
  sales: {
    totalInvoices: number;
    totalAmount: number;
    invoicesByPaymentMethod: Array<{
      paymentMethod: string;
      count: number;
      total: number;
    }>;
  };
  inventory: {
    totalValue: number;
    lowStockCount: number;
    totalItems: number;
  };
}

export interface SalesTrend {
  date: string;
  total: number;
  count: number;
}

export interface StockValuation {
  items: Array<{
    productCode: string;
    productName: string;
    warehouseName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
  };
}

export interface LowStockReport {
  items: Array<{
    productCode: string;
    productName: string;
    warehouseName: string;
    quantity: number;
    minStock: number;
    deficit: number;
  }>;
  count: number;
}

export class DashboardService {
  /**
   * Obtiene estadísticas de ventas
   */
  static async getSalesStats(params?: {
    branchId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardStats['sales']> {
    const queryParams = new URLSearchParams();
    if (params?.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return apiGet(`/invoices/stats${query ? `?${query}` : ''}`);
  }

  /**
   * Obtiene reporte de valorización de inventario
   */
  static async getStockValuation(warehouseId?: number): Promise<StockValuation> {
    const query = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return apiGet(`/inventory/reports/stock-valuation${query}`);
  }

  /**
   * Obtiene reporte de productos con stock bajo
   */
  static async getLowStockReport(warehouseId?: number): Promise<LowStockReport> {
    const query = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return apiGet(`/inventory/reports/low-stock${query}`);
  }

  /**
   * Obtiene tendencia de ventas por día (últimos N días)
   */
  static async getSalesTrend(days: number = 30, branchId?: number): Promise<SalesTrend[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('days', days.toString());
    if (branchId) queryParams.append('branchId', branchId.toString());

    const query = queryParams.toString();
    return apiGet(`/invoices/sales-trend${query ? `?${query}` : ''}`);
  }

  /**
   * Obtiene la tasa de crecimiento comparando el período actual con el anterior
   */
  static async getGrowthRate(params?: {
    branchId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    currentPeriod: {
      startDate: string;
      endDate: string;
      total: number;
      invoiceCount: number;
    };
    previousPeriod: {
      startDate: string;
      endDate: string;
      total: number;
      invoiceCount: number;
    };
    growthRate: number;
    periodDurationDays: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return apiGet(`/invoices/growth-rate${query ? `?${query}` : ''}`);
  }
}