export enum ExpenseCategory {
    FUEL = 'FUEL',
    TOLLS = 'TOLLS',
    MEALS = 'MEALS',
    TRANSPORT = 'TRANSPORT',
    OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
    MAINTENANCE = 'MAINTENANCE',
    PARKING = 'PARKING',
    UTILITIES = 'UTILITIES',
    OTHER = 'OTHER',
}

export enum ExpenseStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CHECK = 'CHECK',
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FUEL]: 'Combustible',
    [ExpenseCategory.TOLLS]: 'Peajes',
    [ExpenseCategory.MEALS]: 'Alimentación',
    [ExpenseCategory.TRANSPORT]: 'Transporte',
    [ExpenseCategory.OFFICE_SUPPLIES]: 'Útiles de Oficina',
    [ExpenseCategory.MAINTENANCE]: 'Mantenimiento',
    [ExpenseCategory.PARKING]: 'Estacionamiento',
    [ExpenseCategory.UTILITIES]: 'Servicios Públicos',
    [ExpenseCategory.OTHER]: 'Otros',
};

export const expenseStatusLabels: Record<ExpenseStatus, string> = {
    [ExpenseStatus.PENDING]: 'Pendiente',
    [ExpenseStatus.APPROVED]: 'Aprobado',
    [ExpenseStatus.REJECTED]: 'Rechazado',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Efectivo',
    [PaymentMethod.CARD]: 'Tarjeta',
    [PaymentMethod.BANK_TRANSFER]: 'Transferencia',
    [PaymentMethod.CHECK]: 'Cheque',
};

export interface MinorExpense {
    id: number;
    expenseNumber: string;
    status: ExpenseStatus;
    ncfB13?: string;
    ncfSequenceId?: number;
    date: Date;
    description: string;
    category: ExpenseCategory;
    amount: number;
    taxableAmount: number;
    tax: number;
    beneficiary?: string;
    beneficiaryId?: string;
    paymentMethod: PaymentMethod;
    attachments?: string[];
    notes?: string;
    accountId?: number;
    account?: {
        id: number;
        code: string;
        name: string;
    };
    journalEntryId?: number;
    journalEntry?: {
        id: number;
        entryNumber: string;
    };
    branchId?: number;
    branch?: {
        id: number;
        name: string;
    };
    approvedBy?: number;
    approver?: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
    approvedAt?: Date;
    rejectionReason?: string;
    createdBy: number;
    creator: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMinorExpenseInput {
    date?: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    taxableAmount?: number;
    tax?: number;
    beneficiary?: string;
    beneficiaryId?: string;
    paymentMethod: PaymentMethod;
    attachments?: string[];
    notes?: string;
    accountId?: number;
    branchId?: number;
}

export interface UpdateMinorExpenseInput extends Partial<CreateMinorExpenseInput> { }

export interface ApproveMinorExpenseInput {
    approved: boolean;
    rejectionReason?: string;
}

export interface MinorExpenseResponse {
    data: MinorExpense[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface MinorExpenseStatistics {
    total: {
        count: number;
        amount: number;
    };
    approved: {
        count: number;
        amount: number;
    };
    pending: {
        count: number;
        amount: number;
    };
    rejected: {
        count: number;
        amount: number;
    };
    byCategory: Array<{
        category: ExpenseCategory;
        _sum: {
            amount: number | null;
        };
        _count: number;
    }>;
}
