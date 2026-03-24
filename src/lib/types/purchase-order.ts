export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  RECEIVED = 'RECEIVED',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
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
      barcode?: string;
      category?: {
        id: number;
        name: string;
      };
    };
  };
  quantity: number;
  receivedQty: number;
  unitCost: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplier?: {
    id: number;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    supplierType?: 'FORMAL' | 'INFORMAL';
  };
  warehouseId: number;
  warehouse?: {
    id: number;
    name: string;
  };
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  status: PurchaseOrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  sentAt?: Date;
  sentBy?: number;
  supplierNcf?: string;
  supplierNcfType?: string;
  items?: PurchaseOrderItem[];
  _count?: {
    items: number;
  };
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreatePurchaseOrderItemInput {
  variantId: number;
  quantity: number;
  unitCost: number;
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: number;
  warehouseId: number;
  expectedDate?: string;
  paymentTerms?: string;
  notes?: string;
  items: CreatePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput extends Partial<CreatePurchaseOrderInput> {
  status?: PurchaseOrderStatus;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReceivePurchaseOrderItem {
  purchaseOrderItemId: number;
  receivedQuantity: number;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface ReceivePurchaseOrderInput {
  items: ReceivePurchaseOrderItem[];
  receivedDate?: string;
  notes?: string;
  supplierNcf?: string;
  supplierNcfType?: string;
  excludeFrom606?: boolean; // Si true, esta compra no aparecerá en el reporte 606 de la DGII
}
