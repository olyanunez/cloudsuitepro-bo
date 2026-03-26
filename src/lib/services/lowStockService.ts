import { apiGet } from './apiService';

export interface LowStockItem {
  id: number;
  variantId: number;
  productCode: string;
  productName: string;
  variantSku: string;
  variantName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  minStock: number;
  deficit: number;
}

export interface LowStockReport {
  items: LowStockItem[];
  count: number;
}

export interface LowStockCount {
  count: number;
}

class LowStockService {
  /**
   * Obtener productos con stock bajo
   */
  async getLowStockItems(warehouseId?: number): Promise<LowStockReport> {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return apiGet<LowStockReport>(`/inventory/reports/low-stock${params}`);
  }

  /**
   * Obtener solo el conteo de productos con stock bajo
   */
  async getLowStockCount(): Promise<LowStockCount> {
    return apiGet<LowStockCount>('/inventory/low-stock/count');
  }
}

export default new LowStockService();
