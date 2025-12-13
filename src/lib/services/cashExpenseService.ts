import { apiGet, apiPost, apiDelete } from './apiService';

// ============================================
// Interfaces para Categorías de Gastos
// ============================================

export interface CashExpenseCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

// ============================================
// Interfaces para Gastos de Caja
// ============================================

export interface CashExpense {
  id: number;
  cashSessionId: number;
  amount: number;
  categoryId: number;
  category: {
    id: number;
    code: string;
    name: string;
    color?: string;
  };
  description: string;
  receiptNumber?: string;
  createdBy: number;
  createdAt: string;
  creator?: {
    id: number;
    name: string;
  };
}

export interface CreateCashExpenseDto {
  amount: number;
  categoryId: number;
  description: string;
  receiptNumber?: string;
}

export interface CashExpenseSummary {
  totalExpenses: number;
  expenseCount: number;
  byCategory: {
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    total: number;
    count: number;
  }[];
}

// ============================================
// Servicio de Categorías de Gastos
// ============================================

export const CashExpenseCategoryService = {
  /**
   * Obtener todas las categorías activas
   */
  async getCategories(): Promise<CashExpenseCategory[]> {
    return apiGet<CashExpenseCategory[]>('/cash-expense-categories');
  },

  /**
   * Inicializar categorías por defecto
   */
  async initializeDefaults(): Promise<void> {
    await apiPost('/cash-expense-categories/initialize');
  },
};

// ============================================
// Servicio de Gastos de Caja
// ============================================

export const CashExpenseService = {
  /**
   * Registrar un nuevo gasto de caja
   */
  async createExpense(data: CreateCashExpenseDto): Promise<CashExpense> {
    return apiPost<CashExpense>('/cash-expenses', data);
  },

  /**
   * Obtener gastos de la sesión actual del usuario
   */
  async getMySessionExpenses(): Promise<CashExpense[]> {
    return apiGet<CashExpense[]>('/cash-expenses/my-session');
  },

  /**
   * Obtener gastos de una sesión específica
   */
  async getSessionExpenses(sessionId: number): Promise<CashExpense[]> {
    return apiGet<CashExpense[]>(`/cash-expenses/session/${sessionId}`);
  },

  /**
   * Obtener resumen de gastos de una sesión
   */
  async getSessionExpenseSummary(sessionId: number): Promise<CashExpenseSummary> {
    return apiGet<CashExpenseSummary>(`/cash-expenses/session/${sessionId}/summary`);
  },

  /**
   * Eliminar un gasto (solo si la sesión está abierta)
   */
  async deleteExpense(expenseId: number): Promise<void> {
    await apiDelete(`/cash-expenses/${expenseId}`);
  },

  /**
   * Formatear monto como moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  },
};
