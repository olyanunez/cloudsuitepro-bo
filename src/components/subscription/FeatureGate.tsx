import React from 'react';
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeMessage?: boolean;
}

/**
 * Componente que controla el acceso a funcionalidades basado en el plan de suscripción
 * @param feature - Código de la funcionalidad requerida
 * @param children - Contenido a mostrar si tiene acceso
 * @param fallback - Contenido alternativo si no tiene acceso (opcional)
 * @param showUpgradeMessage - Si debe mostrar mensaje de upgrade por defecto (default: true)
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradeMessage = true,
}: FeatureGateProps) {
  const { hasAccess, loading } = useFeatureAccess(feature);

  if (loading) {
    return null; // O un skeleton loader
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradeMessage) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Lock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Funcionalidad no disponible</AlertTitle>
        <AlertDescription className="text-yellow-800">
          Esta funcionalidad no está incluida en tu plan actual.{' '}
          <Link
            href="/settings/subscription"
            className="font-medium underline hover:text-yellow-900"
          >
            Actualiza tu plan
          </Link>{' '}
          para acceder a ella.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}