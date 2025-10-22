import { apiGet, apiPost } from './apiService';

export interface CashSession {
  id: number;
  sessionNumber: string;
  userId: number;
  branchId: number;
  warehouseId: number | null;
  openingAmount: string;
  closingAmount: string | null;
  expectedAmount: string | null;
  difference: string | null;
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
  _count?: {
    invoices: number;
  };
}

export interface OpenCashSessionDto {
  branchId: number;
  warehouseId?: number;
  openingAmount: number;
  notes?: string;
}

export interface CloseCashSessionDto {
  closingAmount: number;
  closingNotes?: string;
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
  ): Promise<CashSession> {
    return apiPost<CashSession>(`/cash-sessions/${sessionId}/close`, data);
  }

  /**
   * Obtiene la sesión de caja abierta del usuario actual
   */
  static async getCurrentSession(): Promise<CashSession | null> {
    try {
      return await apiGet<CashSession>('/cash-sessions/current');
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
   */
  static async hasOpenSession(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null && session.status === 'OPEN';
  }

  /**
   * Obtiene el ID de la sesión de caja abierta (para vincular facturas)
   */
  static async getOpenSessionId(): Promise<number | null> {
    const session = await this.getCurrentSession();
    return session?.id || null;
  }
}
