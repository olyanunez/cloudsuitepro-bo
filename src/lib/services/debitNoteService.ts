import { apiGet, apiPost, apiPatch } from './apiService';

// ===== TYPES =====

export interface DebitNote {
    id: number;
    debitNoteNumber: string;
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
    status: 'COMPLETED' | 'CANCELLED';
    reason: string;
    notes?: string;
    originalInvoice?: {
        id: number;
        invoiceNumber: string;
        ncf?: string;
        total: number;
        balanceDue: number;
        createdAt: string;
    };
    isActive: boolean;
    version: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: number;
    updatedBy?: number;
    cancelledAt?: string;
    cancelledBy?: number;
    cancellationReason?: string;
}

export interface CreateDebitNoteDto {
    originalInvoiceId: number;
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    reason: string;
    notes?: string;
    branchId?: number;
    cashSessionId?: number;
}

export interface UpdateDebitNoteDto {
    reason?: string;
    notes?: string;
}

export interface QueryDebitNotesDto {
    branchId?: number;
    customerId?: number;
    startDate?: string;
    endDate?: string;
    status?: 'COMPLETED' | 'CANCELLED';
    fiscalType?: 'FISCAL' | 'INTERNAL';
    debitNoteNumber?: string;
    ncf?: string;
    originalInvoiceNumber?: string;
    limit?: number;
    offset?: number;
}

export interface DebitNoteListResponse {
    data: DebitNote[];
    total: number;
    limit: number;
    offset: number;
}

export interface DebitNoteStats {
    totalDebitNotes: number;
    totalAmount: number;
    fiscalDebitNotes: number;
    internalDebitNotes: number;
    activeDebitNotes: number;
    cancelledDebitNotes: number;
}

// ===== SERVICE =====

export const debitNoteService = {
    /**
     * Crear una nota de débito
     */
    create: async (dto: CreateDebitNoteDto): Promise<DebitNote> => {
        return apiPost<DebitNote>('/debit-notes', dto);
    },

    /**
     * Listar notas de débito con filtros
     */
    getAll: async (query?: QueryDebitNotesDto): Promise<DebitNoteListResponse> => {
        const params = new URLSearchParams();
        if (query?.branchId) params.append('branchId', query.branchId.toString());
        if (query?.customerId) params.append('customerId', query.customerId.toString());
        if (query?.startDate) params.append('startDate', query.startDate);
        if (query?.endDate) params.append('endDate', query.endDate);
        if (query?.status) params.append('status', query.status);
        if (query?.fiscalType) params.append('fiscalType', query.fiscalType);
        if (query?.debitNoteNumber) params.append('debitNoteNumber', query.debitNoteNumber);
        if (query?.ncf) params.append('ncf', query.ncf);
        if (query?.originalInvoiceNumber) params.append('originalInvoiceNumber', query.originalInvoiceNumber);
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.offset) params.append('offset', query.offset.toString());

        const queryString = params.toString();
        return apiGet<DebitNoteListResponse>(`/debit-notes${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Obtener una nota de débito por ID
     */
    getById: async (id: number): Promise<DebitNote> => {
        return apiGet<DebitNote>(`/debit-notes/${id}`);
    },

    /**
     * Actualizar una nota de débito
     */
    update: async (id: number, dto: UpdateDebitNoteDto): Promise<DebitNote> => {
        return apiPatch<DebitNote>(`/debit-notes/${id}`, dto);
    },

    /**
     * Cancelar una nota de débito
     */
    cancel: async (id: number, cancellationReason?: string): Promise<DebitNote> => {
        return apiPost<DebitNote>(`/debit-notes/${id}/cancel`, { cancellationReason });
    },

    /**
     * Obtener estadísticas de notas de débito
     */
    getStats: async (branchId?: number, startDate?: string, endDate?: string): Promise<DebitNoteStats> => {
        const params = new URLSearchParams();
        if (branchId) params.append('branchId', branchId.toString());
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const queryString = params.toString();
        return apiGet<DebitNoteStats>(`/debit-notes/stats${queryString ? `?${queryString}` : ''}`);
    },
};
