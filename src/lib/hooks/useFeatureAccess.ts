import { useState, useEffect } from 'react';
import { SubscriptionService } from '../services/subscriptionService';
import { getTenantId } from '../services/apiService';

interface UseFeatureAccessReturn {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para verificar si el tenant actual tiene acceso a una funcionalidad específica
 * @param feature - Código de la funcionalidad a verificar (ej: 'hasPOS', 'hasMultiBranch')
 * @returns Objeto con hasAccess, loading y error
 */
export function useFeatureAccess(feature: string): UseFeatureAccessReturn {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        const tenantId = getTenantId();

        if (!tenantId) {
          throw new Error('No se encontró el ID del tenant');
        }

        const access = await SubscriptionService.hasFeature(feature, parseInt(tenantId));
        setHasAccess(access);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al verificar acceso';
        setError(errorMessage);
        console.error('Error checking feature access:', err);
        setHasAccess(false); // Por seguridad, denegar acceso en caso de error
      } finally {
        setLoading(false);
      }
    };

    if (feature) {
      checkAccess();
    }
  }, [feature]);

  return { hasAccess, loading, error };
}

/**
 * Hook para verificar múltiples funcionalidades a la vez
 * @param features - Array de códigos de funcionalidades
 * @returns Map con el estado de cada funcionalidad
 */
export function useMultipleFeatureAccess(features: string[]): Record<string, UseFeatureAccessReturn> {
  const [results, setResults] = useState<Record<string, UseFeatureAccessReturn>>({});

  useEffect(() => {
    const checkAllAccess = async () => {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const newResults: Record<string, UseFeatureAccessReturn> = {};

      for (const feature of features) {
        try {
          const access = await SubscriptionService.hasFeature(feature, parseInt(tenantId));
          newResults[feature] = {
            hasAccess: access,
            loading: false,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al verificar acceso';
          newResults[feature] = {
            hasAccess: false,
            loading: false,
            error: errorMessage,
          };
        }
      }

      setResults(newResults);
    };

    if (features.length > 0) {
      checkAllAccess();
    }
  }, [features.join(',')]); // Solo re-ejecutar si cambia el array de features

  return results;
}
