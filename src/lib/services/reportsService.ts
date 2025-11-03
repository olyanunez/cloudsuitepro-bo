import { apiGet } from './apiService';

export enum ReportPeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  CUSTOM = 'CUSTOM',
}

export interface ReportFilters {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  branchId?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TopProductItem {
  productId: number;
  productName: string;
  sku: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface ProductMarginItem {
  productId: number;
  productName: string;
  sku: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface SalesByCategoryItem {
  categoryId: number;
  categoryName: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  percentage: number;
}

export interface SalesByCashierItem {
  userId: number;
  cashierName: string;
  totalInvoices: number;
  totalRevenue: number;
  averageTicket: number;
  cancelledInvoices: number;
}

export interface SalesTrendItem {
  date: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  invoiceCount: number;
}

export interface PeriodComparisonData {
  current: {
    period: string;
    totalRevenue: number;
    totalInvoices: number;
    averageTicket: number;
  };
  previous: {
    period: string;
    totalRevenue: number;
    totalInvoices: number;
    averageTicket: number;
  };
  comparison: {
    revenueChange: number;
    revenueChangePercent: number;
    invoicesChange: number;
    invoicesChangePercent: number;
    averageTicketChange: number;
    averageTicketChangePercent: number;
  };
}

const reportsService = {
  async getTopProducts(filters?: ReportFilters): Promise<TopProductItem[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return await apiGet<TopProductItem[]>(`/reports/top-products?${params.toString()}`);
  },

  async getProductMargins(filters?: ReportFilters): Promise<ProductMarginItem[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return await apiGet<ProductMarginItem[]>(`/reports/product-margins?${params.toString()}`);
  },

  async getSalesByCategory(filters?: ReportFilters): Promise<SalesByCategoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());

    return await apiGet<SalesByCategoryItem[]>(`/reports/sales-by-category?${params.toString()}`);
  },

  async getSalesByCashier(filters?: ReportFilters): Promise<SalesByCashierItem[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return await apiGet<SalesByCashierItem[]>(`/reports/sales-by-cashier?${params.toString()}`);
  },

  async getSalesTrend(filters?: ReportFilters): Promise<SalesTrendItem[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());

    return await apiGet<SalesTrendItem[]>(`/reports/sales-trend?${params.toString()}`);
  },

  async getPeriodComparison(filters?: ReportFilters): Promise<PeriodComparisonData> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());

    return await apiGet<PeriodComparisonData>(`/reports/period-comparison?${params.toString()}`);
  },
};

export default reportsService;
