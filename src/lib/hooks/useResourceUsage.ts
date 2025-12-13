import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService } from '../services/subscriptionService';
import { UsageStats } from '../types/subscription';
import { useSubscription } from './useSubscription';

interface ResourceLimit {
  current: number;
  max: number | null;
  percentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  remaining: number | null;
}

interface UseResourceUsageReturn {
  usageStats: UsageStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  users: ResourceLimit;
  products: ResourceLimit;
  branches: ResourceLimit;
  warehouses: ResourceLimit;
}

/**
 * Hook para obtener estadísticas de uso de recursos
 * @returns Objeto con estadísticas de uso y estados de carga
 */
export function useResourceUsage(): UseResourceUsageReturn {
  const { subscription } = useSubscription();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageStats = useCallback(async () => {
    if (!subscription) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await SubscriptionService.getUsageStats(subscription.id);
      setUsageStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      console.error('Error loading usage stats:', err);
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  const calculateResourceLimit = (
    current: number,
    max: number | null
  ): ResourceLimit => {
    if (max === null) {
      return {
        current,
        max: null,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        remaining: null,
      };
    }

    const percentage = Math.min((current / max) * 100, 100);
    const remaining = Math.max(max - current, 0);

    return {
      current,
      max,
      percentage,
      isNearLimit: percentage >= 75 && percentage < 100,
      isAtLimit: current >= max,
      remaining,
    };
  };

  const users = calculateResourceLimit(
    usageStats?.currentUsers || 0,
    subscription?.currentMaxUsers || null
  );

  const products = calculateResourceLimit(
    usageStats?.currentProducts || 0,
    subscription?.currentMaxProducts || null
  );

  const branches = calculateResourceLimit(
    usageStats?.currentBranches || 0,
    subscription?.currentMaxBranches || null
  );

  const warehouses = calculateResourceLimit(
    usageStats?.currentWarehouses || 0,
    subscription?.currentMaxWarehouses || null
  );

  return {
    usageStats,
    loading,
    error,
    refetch: fetchUsageStats,
    users,
    products,
    branches,
    warehouses,
  };
}

/**
 * Hook para verificar si un recurso específico está disponible
 * @param resourceType - Tipo de recurso ('users' | 'products' | 'branches' | 'warehouses')
 * @returns true si hay espacio disponible, false si está al límite
 */
export function useCanAddResource(
  resourceType: 'users' | 'products' | 'branches' | 'warehouses'
): boolean {
  const { users, products, branches, warehouses } = useResourceUsage();

  const resourceMap = {
    users,
    products,
    branches,
    warehouses,
  };

  const resource = resourceMap[resourceType];

  // Si no hay límite (null), siempre puede agregar
  if (resource.max === null) return true;

  // Si está al límite, no puede agregar
  return !resource.isAtLimit;
}
