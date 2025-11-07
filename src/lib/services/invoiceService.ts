"use client";

import { apiGet, apiPost } from './apiService';

/**
 * Interfaz para el producto en un item de factura
 */
export interface InvoiceItemProduct {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  category?: {
    id: number;
    name: string;
  };
}

/**
 * Interfaz para un item de factura
 */
export interface InvoiceItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  product: InvoiceItemProduct;
}

/**
 * Interfaz para el cliente de una factura
 */
export interface InvoiceCustomer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Interfaz para la sucursal de una factura
 */
export interface InvoiceBranch {
  id: number;
  code: string;
  name: string;
}

/**
 * Interfaz para el almacén de una factura
 */
export interface InvoiceWarehouse {
  id: number;
  name: string;
}

/**
 * Interfaz para el usuario de una factura
 */
export interface InvoiceUser {
  id: number;
  name?: string;
  email: string;
}

/**
 * Interfaz para una factura
 */
export interface Invoice {
  id: number;
  invoiceNumber: string;
  branchId: number;
  warehouseId: number;
  customerId: number;
  userId: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  customer: InvoiceCustomer;
  branch: InvoiceBranch;
  warehouse: InvoiceWarehouse;
  user: InvoiceUser;
}

/**
 * Interfaz para parámetros de consulta de facturas
 */
export interface InvoiceQueryParams {
  branchId?: number;
  warehouseId?: number;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
  invoiceNumber?: string;
  limit?: number;
  offset?: number;
}

/**
 * Interfaz para la respuesta paginada de facturas
 */
export interface InvoiceListResponse {
  data: Invoice[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Interfaz para estadísticas de facturas
 */
export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  invoicesByPaymentMethod: Array<{
    paymentMethod: string;
    count: number;
    total: number;
  }>;
}

/**
 * Servicio de facturas
 */
export class InvoiceService {
  /**
   * Obtiene todas las facturas con filtros opcionales
   * @param params Parámetros de consulta para filtrar facturas
   * @returns Promise con la respuesta paginada de facturas
   */
  static async getInvoices(params?: InvoiceQueryParams): Promise<InvoiceListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/invoices?${queryString}` : '/invoices';

      return await apiGet<InvoiceListResponse>(endpoint);
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una factura por ID
   * @param invoiceId ID de la factura
   * @returns Promise con la factura
   */
  static async getInvoice(invoiceId: number): Promise<Invoice> {
    try {
      return await apiGet<Invoice>(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error al obtener factura:', error);
      throw error;
    }
  }

  /**
   * Cancela una factura existente
   * @param invoiceId ID de la factura a cancelar
   * @returns Promise con la factura cancelada
   */
  static async cancelInvoice(invoiceId: number): Promise<Invoice> {
    try {
      return await apiPost<Invoice>(`/invoices/${invoiceId}/cancel`);
    } catch (error) {
      console.error('Error al cancelar factura:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de facturas
   * @param branchId ID de la sucursal (opcional)
   * @param startDate Fecha de inicio (opcional)
   * @param endDate Fecha de fin (opcional)
   * @returns Promise con las estadísticas
   */
  static async getStats(
    branchId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<InvoiceStats> {
    try {
      const queryParams = new URLSearchParams();

      if (branchId) queryParams.append('branchId', branchId.toString());
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/invoices/stats?${queryString}` : '/invoices/stats';

      return await apiGet<InvoiceStats>(endpoint);
    } catch (error) {
      console.error('Error al obtener estadísticas de facturas:', error);
      throw error;
    }
  }

  /**
   * Formatea un número como moneda
   * @param amount Monto a formatear
   * @returns String con el formato de moneda
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Formatea el método de pago
   * @param paymentMethod Método de pago
   * @returns String con el método de pago formateado
   */
  static formatPaymentMethod(paymentMethod: string): string {
    const methods: Record<string, string> = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
      OTHER: 'Otro',
    };
    return methods[paymentMethod] || paymentMethod;
  }

  /**
   * Formatea el estado de la factura
   * @param status Estado de la factura
   * @returns String con el estado formateado
   */
  static formatStatus(status: string): string {
    const statuses: Record<string, string> = {
      PENDING: 'Pendiente',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return statuses[status] || status;
  }

  /**
   * Obtiene el color del badge según el estado
   * @param status Estado de la factura
   * @returns String con la clase de color de Tailwind
   */
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
