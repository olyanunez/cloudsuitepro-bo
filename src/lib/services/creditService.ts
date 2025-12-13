'use client';

import { apiGet, apiPost, apiPut } from './apiService';

export enum CreditPaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}

export interface CreateCreditPaymentDto {
  customerId: number;
  invoiceId: number;
  amount: number;
  paymentMethod: CreditPaymentMethod;
  paymentReference?: string;
  branchId: number;
  notes?: string;
}

export interface CreditPayment {
  id: number;
  paymentNumber: string;
  customerId: number;
  customerName: string;
  invoiceId?: number;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  cashSessionId?: number;
  branchId: number;
  branchName: string;
  receivedBy: number;
  receivedByName: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerCreditSummary {
  customerId: number;
  customerName: string;
  allowCredit: boolean;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  pendingInvoicesCount: number;
  totalPendingAmount: number;
}

export interface PendingInvoice {
  id: number;
  invoiceNumber: string;
  ncf?: string;
  total: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: string;
  dueDate?: string;
  createdAt: string;
}

export interface CustomerWithPendingBalance {
  id: number;
  code: string;
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  pendingInvoicesCount: number;
}

export interface QueryCreditPaymentsDto {
  customerId?: number;
  branchId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedCreditPayments {
  data: CreditPayment[];
  total: number;
  limit: number;
  offset: number;
}

// Interfaces para gestión de límites de crédito
export interface CustomerCreditListItem {
  id: number;
  code: string;
  name: string;
  lastName?: string;
  phone?: string;
  email?: string;
  allowCredit: boolean;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  pendingInvoicesCount: number;
}

export interface UpdateCustomerCreditDto {
  allowCredit: boolean;
  creditLimit: number;
}

export interface UpdateCustomerCreditResponse {
  id: number;
  code: string;
  name: string;
  lastName?: string;
  allowCredit: boolean;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  message: string;
}

export const CreditService = {
  /**
   * Crear un nuevo pago de crédito
   */
  async createPayment(data: CreateCreditPaymentDto): Promise<CreditPayment> {
    return apiPost<CreditPayment>('/credit/payments', data);
  },

  /**
   * Obtener historial de pagos de crédito
   */
  async getPayments(query?: QueryCreditPaymentsDto): Promise<PaginatedCreditPayments> {
    const params = new URLSearchParams();

    if (query?.customerId) params.append('customerId', query.customerId.toString());
    if (query?.branchId) params.append('branchId', query.branchId.toString());
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    return apiGet<PaginatedCreditPayments>(`/credit/payments${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Obtener clientes con crédito habilitado
   */
  async getCustomersWithCredit(): Promise<CustomerWithPendingBalance[]> {
    return apiGet<CustomerWithPendingBalance[]>('/credit/customers');
  },

  /**
   * Obtener clientes con saldo pendiente
   */
  async getCustomersWithPendingBalance(): Promise<CustomerWithPendingBalance[]> {
    return apiGet<CustomerWithPendingBalance[]>('/credit/customers/pending');
  },

  /**
   * Obtener resumen de crédito de un cliente
   */
  async getCustomerCreditSummary(customerId: number): Promise<CustomerCreditSummary> {
    return apiGet<CustomerCreditSummary>(`/credit/customers/${customerId}/summary`);
  },

  /**
   * Obtener facturas pendientes de un cliente
   */
  async getCustomerPendingInvoices(customerId: number): Promise<PendingInvoice[]> {
    return apiGet<PendingInvoice[]>(`/credit/customers/${customerId}/invoices`);
  },

  // ============================================
  // Funciones para gestión de límites de crédito
  // ============================================

  /**
   * Obtener todos los clientes para gestión de crédito
   */
  async getAllCustomersForCreditManagement(): Promise<CustomerCreditListItem[]> {
    return apiGet<CustomerCreditListItem[]>('/credit/management/customers');
  },

  /**
   * Actualizar configuración de crédito de un cliente
   */
  async updateCustomerCredit(
    customerId: number,
    data: UpdateCustomerCreditDto
  ): Promise<UpdateCustomerCreditResponse> {
    return apiPut<UpdateCustomerCreditResponse>(`/credit/management/customers/${customerId}`, data);
  },

  /**
   * Habilitar crédito para un cliente
   */
  async enableCustomerCredit(
    customerId: number,
    creditLimit: number
  ): Promise<UpdateCustomerCreditResponse> {
    return apiPost<UpdateCustomerCreditResponse>(
      `/credit/management/customers/${customerId}/enable`,
      { creditLimit }
    );
  },

  /**
   * Deshabilitar crédito de un cliente
   */
  async disableCustomerCredit(customerId: number): Promise<UpdateCustomerCreditResponse> {
    return apiPost<UpdateCustomerCreditResponse>(
      `/credit/management/customers/${customerId}/disable`,
      {}
    );
  },
};
