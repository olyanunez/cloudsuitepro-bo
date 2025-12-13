import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService } from '../services/subscriptionService';
import { Subscription, UsageStats } from '../types/subscription';
import { getTenantId } from '../services/apiService';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isInTrial: boolean;
  isActive: boolean;
  trialDaysRemaining: number | null;
}

/**
 * Hook para obtener la suscripción actual del tenant
 * @returns Objeto con la suscripción, estados de carga y funciones útiles
 */
export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tenantId = getTenantId();

      if (!tenantId) {
        throw new Error('No se encontró el ID del tenant');
      }

      const sub = await SubscriptionService.getCurrentSubscription(parseInt(tenantId));
      setSubscription(sub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar la suscripción';
      setError(errorMessage);
      console.error('Error loading subscription:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isInTrial = subscription ? SubscriptionService.isInTrial(subscription) : false;
  const isActive = subscription ? SubscriptionService.isSubscriptionActive(subscription) : false;
  const trialDaysRemaining = subscription ? SubscriptionService.getTrialDaysRemaining(subscription) : null;

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    isInTrial,
    isActive,
    trialDaysRemaining,
  };
}
