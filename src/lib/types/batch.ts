/**
 * Tipos para el Sistema de Gestión de Lotes
 */

export enum BatchStatus {
  ACTIVE = 'ACTIVE',
  RESERVED = 'RESERVED',
  DEPLETED = 'DEPLETED',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

export enum BatchSelectionPolicy {
  FIFO = 'FIFO', // First In, First Out
  FEFO = 'FEFO', // First Expired, First Out
  LIFO = 'LIFO', // Last In, First Out
  MANUAL = 'MANUAL', // Selección manual
}

export interface Batch {
  id: number;
  batchNumber: string;
  productId: number;
  warehouseId: number;
  inventoryItemId: number;

  // Cantidades
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;

  // Fechas
  entryDate: string | Date;
  expirationDate?: string | Date | null;
  manufacturingDate?: string | Date | null;

  // Costos
  unitCost: number;
  totalCost: number;

  // Información adicional
  status: BatchStatus;
  location?: string | null;
  supplierName?: string | null;
  purchaseOrderRef?: string | null;
  notes?: string | null;
  blockReason?: string | null;

  // Multi-tenancy
  tenantId: number;

  // Auditoría
  isActive: boolean;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy?: number | null;
  updatedBy?: number | null;

  // Relaciones (opcionales)
  product?: {
    id: number;
    code: string;
    name: string;
    barcode?: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
  movements?: BatchMovement[];
}

export interface BatchMovement {
  id: number;
  batchId: number;
  type: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reference?: string | null;
  notes?: string | null;
  tenantId: number;
  createdAt: string | Date;
  createdBy?: number | null;
}

export interface CreateBatchDto {
  productId: number;
  warehouseId: number;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expirationDate?: string | Date;
  manufacturingDate?: string | Date;
  supplierName?: string;
  purchaseOrderRef?: string;
  location?: string;
  reference?: string;
  notes?: string;
}

export interface UpdateBatchDto {
  location?: string;
  notes?: string;
  status?: BatchStatus;
  blockReason?: string;
}

export interface BatchExitDto {
  productId: number;
  warehouseId: number;
  quantity: number;
  policy: BatchSelectionPolicy;
  selectedBatches?: ManualBatchSelection[];
  reference?: string;
  notes?: string;
}

export interface ManualBatchSelection {
  batchId: number;
  quantity: number;
}

export interface FilterBatchDto {
  page?: number;
  limit?: number;
  productId?: number;
  warehouseId?: number;
  status?: BatchStatus;
  withStock?: boolean;
  batchNumber?: string;
  supplierName?: string;
  expiringInDays?: number;
}

export interface BatchExitResult {
  success: boolean;
  batchesUsed: Array<{
    batch: string;
    quantity: number;
    movement: BatchMovement;
  }>;
  totalQuantity: number;
  inventoryMovementId: number;
}

export interface ExpiringBatch extends Batch {
  daysUntilExpiration: number;
  estimatedLoss: number;
}

export interface PaginatedBatchResponse {
  data: Batch[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
