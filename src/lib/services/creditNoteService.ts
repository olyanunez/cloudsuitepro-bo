import { apiGet, apiPost } from './apiService';

// ===== TYPES =====

export enum ReturnType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export enum RefundMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  STORE_CREDIT = 'STORE_CREDIT',
}

export interface CreditNoteItem {
  id: number;
  creditNoteId: number;
  originalInvoiceItemId?: number;
  variantId: number;
  variant: {
    id: number;
    sku: string;
    name: string | null;
    product: {
      id: number;
      code: string;
      name: string;
      description: string;
    };
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNote {
  id: number;
  creditNoteNumber: string;
  ncf?: string;
  ncfType?: string;
  ncfValidUntil?: string;
  ncfSequenceId?: number;
  originalInvoiceId: number;
  originalNcf?: string;
  originalInvoiceNumber: string;
  fiscalType: 'FISCAL' | 'INTERNAL';
  noNcfReason?: string;
  customerId?: number;
  customer?: {
    id: number;
    code: string;
    name: string;
    lastName?: string;
    email?: string;
    phone?: string;
    taxId?: string;
  };
  customerRnc?: string;
  customerName?: string;
  branchId: number;
  branch: {
    id: number;
    code: string;
    name: string;
    address?: string;
    phone?: string;
  };
  warehouseId: number;
  warehouse: {
    id: number;
    name: string;
  };
  userId: number;
  user: {
    id: number;
    name?: string;
    email: string;
  };
  cashSessionId?: number;
  tenantId: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  returnType: ReturnType;
  refundMethod: RefundMethod;
  refundReference?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  reason?: string;
  notes?: string;
  items: CreditNoteItem[];
  originalInvoice?: {
    id: number;
    invoiceNumber: string;
    ncf?: string;
    total: number;
    createdAt: string;
  };
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateCreditNoteItemDto {
  originalInvoiceItemId?: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  tax?: number;
  total: number;
  reason?: string;
}

export interface CreateCreditNoteDto {
  originalInvoiceId: number;
  returnType: ReturnType;
  refundMethod: RefundMethod;
  refundReference?: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  itemDiscountsTotal?: number;
  globalDiscountAmount?: number;
  total: number;
  reason?: string;
  notes?: string;
  items: CreateCreditNoteItemDto[];
  branchId?: number;
  warehouseId?: number;
  cashSessionId?: number;
}

export interface QueryCreditNotesDto {
  branchId?: number;
  warehouseId?: number;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  fiscalType?: 'FISCAL' | 'INTERNAL';
  refundMethod?: string;
  creditNoteNumber?: string;
  ncf?: string;
  originalInvoiceNumber?: string;
  limit?: number;
  offset?: number;
}

export interface CreditNoteListResponse {
  data: CreditNote[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreditNoteStats {
  totalReturns: number;
  totalAmount: number;
  fiscalReturns: number;
  internalReturns: number;
}

// ===== SERVICE =====

export const creditNoteService = {
  /**
   * Crear una nota de crédito / devolución
   */
  create: async (dto: CreateCreditNoteDto): Promise<CreditNote> => {
    return apiPost<CreditNote>('/credit-notes', dto);
  },

  /**
   * Listar notas de crédito con filtros
   */
  getAll: async (query?: QueryCreditNotesDto): Promise<CreditNoteListResponse> => {
    const params = new URLSearchParams();
    if (query?.branchId) params.append('branchId', query.branchId.toString());
    if (query?.warehouseId) params.append('warehouseId', query.warehouseId.toString());
    if (query?.customerId) params.append('customerId', query.customerId.toString());
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.status) params.append('status', query.status);
    if (query?.fiscalType) params.append('fiscalType', query.fiscalType);
    if (query?.refundMethod) params.append('refundMethod', query.refundMethod);
    if (query?.creditNoteNumber) params.append('creditNoteNumber', query.creditNoteNumber);
    if (query?.ncf) params.append('ncf', query.ncf);
    if (query?.originalInvoiceNumber) params.append('originalInvoiceNumber', query.originalInvoiceNumber);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    return apiGet<CreditNoteListResponse>(`/credit-notes${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Obtener una nota de crédito por ID
   */
  getById: async (id: number): Promise<CreditNote> => {
    return apiGet<CreditNote>(`/credit-notes/${id}`);
  },

  /**
   * Obtener estadísticas de devoluciones
   */
  getStats: async (branchId?: number, startDate?: string, endDate?: string): Promise<CreditNoteStats> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    return apiGet<CreditNoteStats>(`/credit-notes/stats${queryString ? `?${queryString}` : ''}`);
  },
};
