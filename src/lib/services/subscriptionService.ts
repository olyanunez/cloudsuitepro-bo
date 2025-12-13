"use client";

/**
 * Servicio para gestionar suscripciones y planes
 */
import { apiGet, apiPost, apiPatch, getTenantId } from './apiService';
import {
  Plan,
  Subscription,
  UsageStats,
  FeatureCheckResponse,
  CreateSubscriptionDto,
  ChangePlanDto,
  CancelSubscriptionDto,
  BillingCycle,
} from '../types/subscription';

/**
 * Servicio para gestionar suscripciones y planes
 */
export class SubscriptionService {
  /**
   * Obtiene todos los planes activos públicamente disponibles
   */
  static async getPlans(): Promise<Plan[]> {
    try {
      const response = await apiGet<Plan[]>('/plans?publicOnly=true');
      return response;
    } catch (error) {
      console.error('Error al obtener planes:', error);
      throw error;
    }
  }

  /**
   * Alias para getPlans - Obtiene planes disponibles
   */
  static async getAvailablePlans(): Promise<Plan[]> {
    return this.getPlans();
  }

  /**
   * Obtiene un plan específico por su código
   */
  static async getPlanByCode(code: string): Promise<Plan> {
    try {
      const response = await apiGet<Plan>(`/plans/code/${code}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener plan con código ${code}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un plan específico por su ID
   */
  static async getPlanById(id: number): Promise<Plan> {
    try {
      const response = await apiGet<Plan>(`/plans/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener plan con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva suscripción para un tenant
   */
  static async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    try {
      const response = await apiPost<Subscription>('/subscriptions', data);
      return response;
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      throw error;
    }
  }

  /**
   * Obtiene la suscripción actual del tenant
   */
  static async getCurrentSubscription(tenantId?: number): Promise<Subscription | null> {
    try {
      const currentTenantId = tenantId || getTenantId();
      if (!currentTenantId) {
        throw new Error('No se encontró el ID del tenant');
      }

      const response = await apiGet<Subscription>(`/subscriptions/tenant/${currentTenantId}`);
      return response;
    } catch (error) {
      console.error('Error al obtener suscripción actual:', error);
      // Si no hay suscripción, retornar null en lugar de error
      if ((error as any)?.message?.includes('404') || (error as any)?.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Cambia el plan de una suscripción
   */
  static async changePlan(subscriptionId: number, data: ChangePlanDto): Promise<Subscription> {
    try {
      const response = await apiPatch<Subscription>(
        `/subscriptions/${subscriptionId}/change-plan`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error al cambiar plan de suscripción ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancela una suscripción
   */
  static async cancelSubscription(
    subscriptionId: number,
    data?: CancelSubscriptionDto
  ): Promise<Subscription> {
    try {
      const response = await apiPost<Subscription>(
        `/subscriptions/${subscriptionId}/cancel`,
        data || {}
      );
      return response;
    } catch (error) {
      console.error(`Error al cancelar suscripción ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Reactiva una suscripción cancelada o suspendida
   */
  static async reactivateSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await apiPost<Subscription>(
        `/subscriptions/${subscriptionId}/reactivate`
      );
      return response;
    } catch (error) {
      console.error(`Error al reactivar suscripción ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Suspende una suscripción
   */
  static async suspendSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await apiPost<Subscription>(
        `/subscriptions/${subscriptionId}/suspend`
      );
      return response;
    } catch (error) {
      console.error(`Error al suspender suscripción ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas de uso de recursos del tenant
   */
  static async getUsageStats(subscriptionId: number): Promise<UsageStats> {
    try {
      const response = await apiGet<UsageStats>(`/subscriptions/${subscriptionId}/usage`);
      return response;
    } catch (error) {
      console.error(`Error al obtener estadísticas de uso:`, error);
      throw error;
    }
  }

  /**
   * Verifica si el tenant actual tiene acceso a una funcionalidad específica
   */
  static async hasFeature(feature: string, tenantId?: number): Promise<boolean> {
    try {
      const currentTenantId = tenantId || getTenantId();
      if (!currentTenantId) {
        throw new Error('No se encontró el ID del tenant');
      }

      const response = await apiGet<FeatureCheckResponse>(
        `/subscriptions/tenant/${currentTenantId}/feature/${feature}`
      );
      return response.hasAccess;
    } catch (error) {
      console.error(`Error al verificar acceso a funcionalidad ${feature}:`, error);
      // Por seguridad, si hay error retornamos false
      return false;
    }
  }

  /**
   * Crea una suscripción de PayPal para el tenant actual
   */
  static async createPayPalSubscription(
    subscriptionId: number,
    returnUrl: string,
    cancelUrl: string
  ): Promise<{ approvalUrl: string }> {
    try {
      const response = await apiPost<{ approvalUrl: string }>(
        `/paypal/create-subscription/${subscriptionId}`,
        {
          returnUrl,
          cancelUrl,
        }
      );
      return response;
    } catch (error) {
      console.error('Error al crear suscripción de PayPal:', error);
      throw error;
    }
  }

  /**
   * Cancela una suscripción de PayPal
   */
  static async cancelPayPalSubscription(subscriptionId: number): Promise<void> {
    try {
      await apiPost<void>(`/paypal/cancel-subscription/${subscriptionId}`);
    } catch (error) {
      console.error('Error al cancelar suscripción de PayPal:', error);
      throw error;
    }
  }

  /**
   * Calcula el precio de un plan según el ciclo de facturación
   */
  static calculatePlanPrice(plan: Plan, billingCycle: BillingCycle): number {
    // Convertir strings a números si es necesario
    const monthlyPrice = typeof plan.monthlyPrice === 'string'
      ? parseFloat(plan.monthlyPrice)
      : plan.monthlyPrice;

    const quarterlyPrice = plan.quarterlyPrice
      ? (typeof plan.quarterlyPrice === 'string' ? parseFloat(plan.quarterlyPrice) : plan.quarterlyPrice)
      : null;

    const yearlyPrice = plan.yearlyPrice
      ? (typeof plan.yearlyPrice === 'string' ? parseFloat(plan.yearlyPrice) : plan.yearlyPrice)
      : null;

    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        return monthlyPrice;
      case BillingCycle.QUARTERLY:
        return quarterlyPrice || monthlyPrice * 3;
      case BillingCycle.YEARLY:
        return yearlyPrice || monthlyPrice * 12;
      default:
        return monthlyPrice;
    }
  }

  /**
   * Calcula el descuento de un ciclo de facturación comparado con el mensual
   */
  static calculateDiscount(plan: Plan, billingCycle: BillingCycle): number {
    if (billingCycle === BillingCycle.MONTHLY) {
      return 0;
    }

    const price = this.calculatePlanPrice(plan, billingCycle);
    const monthlyPrice = typeof plan.monthlyPrice === 'string'
      ? parseFloat(plan.monthlyPrice)
      : plan.monthlyPrice;

    const monthlyEquivalent =
      billingCycle === BillingCycle.QUARTERLY
        ? monthlyPrice * 3
        : monthlyPrice * 12;

    const discount = ((monthlyEquivalent - price) / monthlyEquivalent) * 100;
    return Math.round(discount);
  }

  /**
   * Formatea un precio con el símbolo de moneda
   */
  static formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Obtiene el nombre legible de un ciclo de facturación
   */
  static getBillingCycleName(cycle: BillingCycle): string {
    const names = {
      [BillingCycle.MONTHLY]: 'Mensual',
      [BillingCycle.QUARTERLY]: 'Trimestral',
      [BillingCycle.YEARLY]: 'Anual',
    };
    return names[cycle] || 'Mensual';
  }

  /**
   * Obtiene el nombre legible de un estado de suscripción
   */
  static getStatusName(status: string): string {
    const names: Record<string, string> = {
      TRIAL: 'Período de Prueba',
      ACTIVE: 'Activa',
      PAST_DUE: 'Pago Pendiente',
      SUSPENDED: 'Suspendida',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
    };
    return names[status] || status;
  }

  /**
   * Obtiene el color del badge según el estado de la suscripción
   */
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      TRIAL: 'blue',
      ACTIVE: 'green',
      PAST_DUE: 'yellow',
      SUSPENDED: 'orange',
      CANCELLED: 'red',
      EXPIRED: 'gray',
    };
    return colors[status] || 'gray';
  }

  /**
   * Verifica si una suscripción está activa (incluye TRIAL y ACTIVE)
   */
  static isSubscriptionActive(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'TRIAL' || subscription.status === 'ACTIVE';
  }

  /**
   * Verifica si una suscripción está en período de prueba
   */
  static isInTrial(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'TRIAL';
  }

  /**
   * Calcula los días restantes de una fecha
   */
  static getDaysRemaining(dateString: string | null): number | null {
    if (!dateString) return null;

    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }

  /**
   * Obtiene los días restantes del período de prueba
   */
  static getTrialDaysRemaining(subscription: Subscription | null): number | null {
    if (!subscription || !subscription.trialEndDate) return null;
    return this.getDaysRemaining(subscription.trialEndDate);
  }
}

export default SubscriptionService;
