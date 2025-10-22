import { apiGet, apiPost } from './apiService';

export interface ProductStock {
  id: number;
  code: string;
  name: string;
  description: string;
  price: string;
  cost: string;
  category: {
    id: number;
    name: string;
  };
  stock: {
    quantity: number;
    minStock: number;
    warehouse: {
      id: number;
      name: string;
    };
  };
}

export interface InvoiceItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface CreateInvoicePayload {
  customerId?: number;
  branchId: number;
  warehouseId: number;
  cashSessionId?: number; // Sesión de caja asociada
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'CREDIT';
  notes?: string;
  items: InvoiceItem[];
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number | null;
  branchId: number;
  warehouseId: number;
  userId: number;
  tenantId: number;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  paymentMethod: string;
  status: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    discount: string;
    subtotal: string;
    tax: string;
    total: string;
    product: {
      id: number;
      code: string;
      name: string;
      description: string;
      price: string;
    };
  }>;
  branch?: {
    id: number;
    name: string;
    code: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export class PosService {
  /**
   * Busca productos por código, nombre o categoría que tengan stock en el almacén especificado
   */
  static async searchProducts(params: {
    search: string;
    warehouseId: number;
    branchId?: number;
    limit?: number;
  }): Promise<ProductStock[]> {
    const queryParams = new URLSearchParams({
      search: params.search,
      warehouseId: params.warehouseId.toString(),
      ...(params.branchId && { branchId: params.branchId.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    return apiGet<ProductStock[]>(`/pos/products/search?${queryParams}`);
  }

  /**
   * Crea una nueva factura/venta
   */
  static async createInvoice(invoice: CreateInvoicePayload): Promise<Invoice> {
    return apiPost<Invoice>('/pos/invoices', invoice);
  }

  /**
   * Lista las facturas con filtros opcionales
   */
  static async getInvoices(params?: {
    branchId?: number;
    warehouseId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Invoice[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return apiGet<Invoice[]>(`/pos/invoices${query ? `?${query}` : ''}`);
  }

  /**
   * Obtiene el detalle de una factura específica
   */
  static async getInvoiceById(id: number): Promise<Invoice> {
    return apiGet<Invoice>(`/pos/invoices/${id}`);
  }

  /**
   * Cancela una factura desde POS (Caja)
   * Solo permite cancelar facturas del día actual creadas por el mismo usuario
   */
  static async cancelInvoice(invoiceNumber: string): Promise<Invoice> {
    return apiPost<Invoice>('/pos/invoices/cancel', { invoiceNumber });
  }
}
