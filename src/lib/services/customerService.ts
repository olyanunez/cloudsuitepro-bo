import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';

export interface Customer {
  id: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy?: number;
  invoiceCount?: number;
  totalPurchased?: string;
  lastPurchaseDate?: string;
}

export interface CreateCustomerDto {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CustomerService = {
  async getCustomers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedCustomers> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    return apiGet<PaginatedCustomers>(`/customers?${params.toString()}`);
  },

  async getCustomer(id: number): Promise<Customer> {
    return apiGet<Customer>(`/customers/${id}`);
  },

  async getActiveCustomers(): Promise<Customer[]> {
    return apiGet<Customer[]>('/customers/active');
  },

  async searchCustomers(search: string): Promise<Customer[]> {
    const response = await apiGet<PaginatedCustomers>(`/customers?search=${encodeURIComponent(search)}&limit=20`);
    return response.data;
  },

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    return apiPost<Customer>('/customers', data);
  },

  async updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
    return apiPatch<Customer>(`/customers/${id}`, data);
  },

  async deleteCustomer(id: number): Promise<void> {
    await apiDelete(`/customers/${id}`);
  },

  async generateNextCode(): Promise<string> {
    const response = await apiGet<{ code: string }>('/customers/next-code');
    return response.code;
  },
};
