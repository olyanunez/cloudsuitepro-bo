import React from 'react';
import { useResourceUsage } from '@/lib/hooks/useResourceUsage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ResourceLimitAlertProps {
  resourceType: 'users' | 'products' | 'branches' | 'warehouses';
  threshold?: number; // Porcentaje a partir del cual mostrar alerta (default: 75)
}

const resourceLabels = {
  users: 'usuarios',
  products: 'productos',
  branches: 'sucursales',
  warehouses: 'almacenes',
};

/**
 * Componente que muestra una alerta cuando un recurso está cerca de su límite
 * @param resourceType - Tipo de recurso a monitorear
 * @param threshold - Porcentaje a partir del cual mostrar la alerta (default: 75)
 */
export function ResourceLimitAlert({
  resourceType,
  threshold = 75,
}: ResourceLimitAlertProps) {
  const usage = useResourceUsage();
  const resource = usage[resourceType];

  if (usage.loading || !resource) {
    return null;
  }

  // Si no hay límite (ilimitado), no mostrar alerta
  if (resource.max === null) {
    return null;
  }

  // Si no ha alcanzado el threshold, no mostrar alerta
  if (resource.percentage < threshold) {
    return null;
  }

  const isAtLimit = resource.isAtLimit;
  const label = resourceLabels[resourceType];

  return (
    <Alert
      className={
        isAtLimit
          ? 'border-red-200 bg-red-50'
          : 'border-yellow-200 bg-yellow-50'
      }
    >
      <AlertTriangle
        className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-yellow-600'}`}
      />
      <AlertTitle
        className={isAtLimit ? 'text-red-900' : 'text-yellow-900'}
      >
        {isAtLimit
          ? `Límite de ${label} alcanzado`
          : `Cerca del límite de ${label}`}
      </AlertTitle>
      <AlertDescription
        className={isAtLimit ? 'text-red-800' : 'text-yellow-800'}
      >
        {isAtLimit ? (
          <>
            Has alcanzado el límite de {resource.max} {label} de tu plan.{' '}
            <Link
              href="/settings/subscription"
              className="font-medium underline hover:text-red-900"
            >
              Actualiza tu plan
            </Link>{' '}
            para agregar más.
          </>
        ) : (
          <>
            Estás usando {resource.current} de {resource.max} {label} (
            {Math.round(resource.percentage)}%). Quedan {resource.remaining}{' '}
            disponibles.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}