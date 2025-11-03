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
    // Calcular fecha de inicio
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.getSalesStats({
      branchId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    // Por ahora retornamos datos simulados para la tendencia
    // TODO: Crear endpoint en backend que retorne datos por día
    const trend: SalesTrend[] = [];
    const avgDaily = stats.totalAmount / days;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Simular variación diaria
      const variation = (Math.random() - 0.5) * 0.4;
      const total = avgDaily * (1 + variation);

      trend.push({
        date: date.toISOString().split('T')[0],
        total: Math.round(total * 100) / 100,
        count: Math.floor(stats.totalInvoices / days),
      });
    }

    return trend;
  }
}