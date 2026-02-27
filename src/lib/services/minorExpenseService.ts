import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
    MinorExpense,
    MinorExpenseResponse,
    MinorExpenseStatistics,
    CreateMinorExpenseInput,
    UpdateMinorExpenseInput,
    ApproveMinorExpenseInput,
    ExpenseCategory,
    ExpenseStatus,
} from '../types/minor-expense';

export class MinorExpenseService {
    static async getMinorExpenses(params?: {
        page?: number;
        limit?: number;
        status?: ExpenseStatus;
        category?: ExpenseCategory;
        startDate?: string;
        endDate?: string;
    }): Promise<MinorExpenseResponse> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.status) queryParams.append('status', params.status);
            if (params?.category) queryParams.append('category', params.category);
            if (params?.startDate) queryParams.append('startDate', params.startDate);
            if (params?.endDate) queryParams.append('endDate', params.endDate);

            return await apiGet<MinorExpenseResponse>(
                `/minor-expenses?${queryParams.toString()}`,
            );
        } catch (error) {
            console.error('Error al obtener gastos menores:', error);
            throw error;
        }
    }

    static async getMinorExpenseById(id: number): Promise<MinorExpense> {
        try {
            return await apiGet<MinorExpense>(`/minor-expenses/${id}`);
        } catch (error) {
            console.error(`Error al obtener gasto menor ${id}:`, error);
            throw error;
        }
    }

    static async createMinorExpense(
        data: CreateMinorExpenseInput,
    ): Promise<MinorExpense> {
        try {
            return await apiPost<MinorExpense>('/minor-expenses', data);
        } catch (error) {
            console.error('Error al crear gasto menor:', error);
            throw error;
        }
    }

    static async updateMinorExpense(
        id: number,
        data: UpdateMinorExpenseInput,
    ): Promise<MinorExpense> {
        try {
            return await apiPatch<MinorExpense>(`/minor-expenses/${id}`, data);
        } catch (error) {
            console.error(`Error al actualizar gasto menor ${id}:`, error);
            throw error;
        }
    }

    static async approveMinorExpense(
        id: number,
        data: ApproveMinorExpenseInput,
    ): Promise<MinorExpense> {
        try {
            return await apiPost<MinorExpense>(`/minor-expenses/${id}/approve`, data);
        } catch (error) {
            console.error(`Error al aprobar gasto menor ${id}:`, error);
            throw error;
        }
    }

    static async deleteMinorExpense(id: number): Promise<void> {
        try {
            await apiDelete(`/minor-expenses/${id}`);
        } catch (error) {
            console.error(`Error al eliminar gasto menor ${id}:`, error);
            throw error;
        }
    }

    static async getStatistics(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<MinorExpenseStatistics> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.startDate) queryParams.append('startDate', params.startDate);
            if (params?.endDate) queryParams.append('endDate', params.endDate);

            return await apiGet<MinorExpenseStatistics>(
                `/minor-expenses/statistics?${queryParams.toString()}`,
            );
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
}

export default MinorExpenseService;
