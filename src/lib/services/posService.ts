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
  images?: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
    order: number;
  }>;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface InvoiceItem {
  variantId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: DiscountType;
  discountValue?: number;
  discountReason?: string;
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
  globalDiscountType?: DiscountType;
  globalDiscountValue?: number;
  globalDiscountAmount?: number;
  itemDiscountsTotal?: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'CREDIT';
  notes?: string;
  paymentReference?: string; // Voucher de tarjeta o referencia de transferencia
  manualNcf?: string; // NCF manual (solo si está permitido en configuración)
  items: InvoiceItem[];
  sendEmail?: boolean; // Enviar factura por correo electrónico
  customerEmail?: string; // Correo del cliente (opcional, si no se proporciona se usa el del cliente registrado)
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  ncf: string | null;
  ncfType: string | null;
  ncfValidUntil: string | null;
  customerId: number | null;
  customerName: string | null;
  customerRnc: string | null;
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
  paymentReference: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    variantId: number;
    quantity: number;
    unitPrice: string;
    unitCost?: string; // Costo unitario al momento de la venta (para COGS)
    discount: string;
    subtotal: string;
    tax: string;
    total: string;
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
