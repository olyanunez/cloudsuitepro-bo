import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
  Batch,
  BatchExitDto,
  BatchExitResult,
  CreateBatchDto,
  ExpiringBatch,
  FilterBatchDto,
  PaginatedBatchResponse,
  UpdateBatchDto,
} from '@/lib/types/batch';

/**
 * Servicio para gestión de lotes (Batch Management)
 */
export const BatchService = {
  /**
   * Obtener todos los lotes con filtros y paginación
   */
  getAll: async (filters?: FilterBatchDto): Promise<PaginatedBatchResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.withStock !== undefined) params.append('withStock', filters.withStock.toString());
    if (filters?.batchNumber) params.append('batchNumber', filters.batchNumber);
    if (filters?.supplierName) params.append('supplierName', filters.supplierName);
    if (filters?.expiringInDays) params.append('expiringInDays', filters.expiringInDays.toString());

    const queryString = params.toString();
    return apiGet(`/batches${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Obtener un lote por ID
   */
  getById: async (id: number): Promise<Batch> => {
    return apiGet(`/batches/${id}`);
  },

  /**
   * Crear un nuevo lote (entrada de mercancía)
   */
  create: async (data: CreateBatchDto): Promise<Batch> => {
    return apiPost('/batches', data);
  },

  /**
   * Actualizar un lote
   */
  update: async (id: number, data: UpdateBatchDto): Promise<Batch> => {
    return apiPatch(`/batches/${id}`, data);
  },

  /**
   * Eliminar un lote (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return apiDelete(`/batches/${id}`);
  },

  /**
   * Registrar salida de productos (venta/transferencia)
   */
  createExit: async (data: BatchExitDto): Promise<BatchExitResult> => {
    return apiPost('/batches/exit', data);
  },

  /**
   * Obtener lotes próximos a vencer
   */
  getExpiringBatches: async (days: number): Promise<ExpiringBatch[]> => {
    return apiGet(`/batches/expiring/${days}`);
  },

  /**
   * Obtener lotes disponibles para un producto en un almacén
   */
  getAvailableBatches: async (productId: number, warehouseId: number): Promise<Batch[]> => {
    return apiGet(`/batches/available?productId=${productId}&warehouseId=${warehouseId}`);
  },

  /**
   * Obtener historial de movimientos de un lote
   */
  getMovements: async (batchId: number) => {
    return apiGet(`/batches/${batchId}/movements`);
  },

  /**
   * Obtener estadísticas de lotes
   */
  getStats: async () => {
    return apiGet('/batches/stats');
  },
};
