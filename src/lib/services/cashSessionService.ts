import { apiGet, apiPost } from './apiService';

export interface CashSession {
  id: number;
  sessionNumber: string;
  userId: number;
  branchId: number;
  warehouseId: number | null;
  openingAmount: string;
  closingAmount: string | null;
  closingVouchers: string | null;
  expectedAmount: string | null;
  expectedVouchers: string | null;
  difference: string | null;
  differenceVouchers: string | null;
  totalCash: string | null;
  totalCard: string | null;
  totalTransfer: string | null;
  totalOther: string | null;
  openedAt: string;
  closedAt: string | null;
  status: 'OPEN' | 'CLOSED';
  notes: string | null;
  closingNotes: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  branch?: {
    id: number;
    name: string;
    code: string;
  };
  warehouse?: {
    id: number;
    name: string;
    code: string;
  };
  invoices?: any[];
  denominations?: CashDenomination[];
  _count?: {
    invoices: number;
  };
}

export interface CashDenomination {
  id: number;
  type: 'BILL' | 'COIN';
  denomination: string;
  quantity: number;
  subtotal: string;
}

export interface CashDenominationDto {
  type: 'BILL' | 'COIN';
  denomination: number;
  quantity: number;
}

export interface OpenCashSessionDto {
  branchId: number;
  warehouseId?: number;
  openingAmount: number;
  notes?: string;
}

export interface CloseCashSessionDto {
  denominations: CashDenominationDto[];
  closingVouchers: number;
  closingNotes?: string;
}

export interface CashierSummary {
  status: 'OK' | 'SHORTAGE';
  message: string;
  cashShortage: number | null;
  voucherShortage: number | null;
}

export interface CloseSessionResponse extends CashSession {
  cashierSummary: CashierSummary;
}

export class CashSessionService {
  /**
   * Abre una nueva sesión de caja
   */
  static async openSession(data: OpenCashSessionDto): Promise<CashSession> {
    return apiPost<CashSession>('/cash-sessions/open', data);
  }

  /**
   * Cierra la sesión de caja especificada
   */
  static async closeSession(
    sessionId: number,
    data: CloseCashSessionDto,
  ): Promise<CloseSessionResponse> {
    return apiPost<CloseSessionResponse>(`/cash-sessions/${sessionId}/close`, data);
  }

  /**
   * Obtiene la sesión de caja abierta del usuario actual
   * @param branchId - ID de la sucursal para filtrar (opcional)
   */
  static async getCurrentSession(branchId?: number): Promise<CashSession | null> {
    try {
      const queryParams = branchId ? `?branchId=${branchId}` : '';
      return await apiGet<CashSession>(`/cash-sessions/current${queryParams}`);
    } catch (error: any) {
      // Si no hay sesión abierta, retorna null en lugar de lanzar error
      if (error?.message?.includes('no encontrada') || error?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtiene el resumen detallado de una sesión con todas sus facturas
   */
  static async getSessionSummary(sessionId: number): Promise<CashSession> {
    return apiGet<CashSession>(`/cash-sessions/${sessionId}/summary`);
  }

  /**
   * Obtiene una sesión específica por ID
   */
  static async getSessionById(sessionId: number): Promise<CashSession> {
    return apiGet<CashSession>(`/cash-sessions/${sessionId}`);
  }

  /**
   * Lista sesiones de caja con filtros opcionales
   */
  static async getSessions(params?: {
    userId?: number;
    branchId?: number;
    warehouseId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<CashSession[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return apiGet<CashSession[]>(
      `/cash-sessions${query ? `?${query}` : ''}`,
    );
  }

  /**
   * Verifica si el usuario tiene una sesión de caja abierta
   * @param branchId - ID de la sucursal para filtrar (opcional)
   */
  static async hasOpenSession(branchId?: number): Promise<boolean> {
    const session = await this.getCurrentSession(branchId);
    return session !== null && session.status === 'OPEN';
  }

  /**
   * Obtiene el ID de la sesión de caja abierta (para vincular facturas)
   * @param branchId - ID de la sucursal para filtrar (opcional)
   */
  static async getOpenSessionId(branchId?: number): Promise<number | null> {
    const session = await this.getCurrentSession(branchId);
    return session?.id || null;
  }
}
