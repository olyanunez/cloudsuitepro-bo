import {
  PurchaseOrder,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  PurchaseOrderResponse,
  PurchaseOrderStatus,
  ReceivePurchaseOrderInput,
} from '../types/purchase-order';
import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';

export class PurchaseOrderService {
  /**
   * Obtener todas las órdenes de compra con paginación
   */
  static async getPurchaseOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: PurchaseOrderStatus,
    supplierId?: number,
  ): Promise<PurchaseOrderResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (supplierId) params.append('supplierId', supplierId.toString());

      return await apiGet<PurchaseOrderResponse>(
        `/purchase-orders?${params}`,
      );
    } catch (error) {
      console.error('Error al obtener órdenes de compra:', error);
      throw error;
    }
  }

  /**
   * Obtener una orden de compra por ID
   */
  static async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    try {
      return await apiGet<PurchaseOrder>(`/purchase-orders/${id}`);
    } catch (error) {
      console.error(`Error al obtener orden de compra ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva orden de compra
   */
  static async createPurchaseOrder(
    purchaseOrderData: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    try {
      return await apiPost<PurchaseOrder>(
        '/purchase-orders',
        purchaseOrderData,
      );
    } catch (error) {
      console.error('Error al crear orden de compra:', error);
      throw error;
    }
  }

  /**
   * Actualizar una orden de compra existente
   */
  static async updatePurchaseOrder(
    id: number,
    purchaseOrderData: UpdatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    try {
      return await apiPatch<PurchaseOrder>(
        `/purchase-orders/${id}`,
        purchaseOrderData,
      );
    } catch (error) {
      console.error(`Error al actualizar orden de compra ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una orden de compra
   */
  static async deletePurchaseOrder(id: number): Promise<void> {
    try {
      await apiDelete(`/purchase-orders/${id}`);
    } catch (error) {
      console.error(`Error al eliminar orden de compra ${id}:`, error);
      throw error;
    }
  }

  /**
   * Enviar orden de compra al proveedor
   */
  static async sendToSupplier(id: number): Promise<PurchaseOrder> {
    try {
      return await apiPost<PurchaseOrder>(
        `/purchase-orders/${id}/send`,
        {},
      );
    } catch (error) {
      console.error(
        `Error al enviar orden de compra ${id} al proveedor:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generar el siguiente número de orden
   */
  static async generateNextOrderNumber(): Promise<string> {
    try {
      const response = await apiGet<{ orderNumber: string }>(
        '/purchase-orders/generate/next-number',
      );
      return response.orderNumber;
    } catch (error) {
      console.error('Error al generar número de orden:', error);
      throw error;
    }
  }

  /**
   * Recibir una orden de compra (total o parcial)
   */
  static async receivePurchaseOrder(
    id: number,
    receiveData: ReceivePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    try {
      return await apiPost<PurchaseOrder>(
        `/purchase-orders/${id}/receive`,
        receiveData,
      );
    } catch (error) {
      console.error(`Error al recibir orden de compra ${id}:`, error);
      throw error;
    }
  }
}
