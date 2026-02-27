import { apiGet } from './apiService';

export interface Account {
    id: number;
    code: string;
    name: string;
    accountType: string;
    parentId?: number;
    isActive: boolean;
    balance?: number;
}

export class AccountingService {
    private static BASE_URL = '/accounting';

    static async getAccounts(includeInactive: boolean = false): Promise<Account[]> {
        try {
            const queryParams = new URLSearchParams();
            if (includeInactive) queryParams.append('includeInactive', 'true');

            const url = `${this.BASE_URL}/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiGet<Account[]>(url);
            return response;
        } catch (error: any) {
            console.error('Error fetching accounts:', error);
            throw new Error(error?.message || 'Error al cargar las cuentas contables');
        }
    }

    static async getAccountsByType(accountType: string, includeInactive: boolean = false): Promise<Account[]> {
        try {
            const queryParams = new URLSearchParams();
            if (includeInactive) queryParams.append('includeInactive', 'true');

            const url = `${this.BASE_URL}/accounts/by-type/${accountType}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiGet<Account[]>(url);
            return response;
        } catch (error: any) {
            console.error('Error fetching accounts by type:', error);
            throw new Error(error?.message || 'Error al cargar las cuentas contables');
        }
    }

    static async getAccount(id: number): Promise<Account> {
        try {
            const response = await apiGet<Account>(
                `${this.BASE_URL}/accounts/${id}`
            );
            return response;
        } catch (error: any) {
            console.error('Error fetching account:', error);
            throw new Error(error?.message || 'Error al cargar la cuenta contable');
        }
    }
}
