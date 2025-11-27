import React from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Banner que muestra información del período de prueba
 * Solo se muestra si la suscripción está en TRIAL
 */
export function TrialBanner() {
  const { subscription, isInTrial, trialDaysRemaining } = useSubscription();

  if (!isInTrial || trialDaysRemaining === null) {
    return null;
  }

  const isEndingSoon = trialDaysRemaining <= 3;

  return (
    <Alert
      className={
        isEndingSoon
          ? 'border-red-200 bg-red-50'
          : 'border-blue-200 bg-blue-50'
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {isEndingSoon ? (
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          )}
          <div className="flex-1">
            <h3
              className={`font-semibold ${
                isEndingSoon ? 'text-red-900' : 'text-blue-900'
              }`}
            >
              {isEndingSoon
                ? '¡Tu período de prueba está por terminar!'
                : 'Período de prueba activo'}
            </h3>
            <AlertDescription
              className={`mt-1 ${
                isEndingSoon ? 'text-red-800' : 'text-blue-700'
              }`}
            >
              {trialDaysRemaining === 1 ? (
                <>
                  Te queda <span className="font-bold">1 día</span> de prueba
                  gratis.
                </>
              ) : (
                <>
                  Te quedan{' '}
                  <span className="font-bold">{trialDaysRemaining} días</span>{' '}
                  de prueba gratis.
                </>
              )}{' '}
              {isEndingSoon && (
                <>
                  Configura un método de pago para continuar sin
                  interrupciones.
                </>
              )}
            </AlertDescription>
          </div>
        </div>
        <Link href="/settings/subscription">
          <Button
            size="sm"
            variant={isEndingSoon ? 'default' : 'outline'}
            className={
              isEndingSoon
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
            }
          >
            {isEndingSoon ? 'Activar Ahora' : 'Ver Detalles'}
          </Button>
        </Link>
      </div>
    </Alert>
  );
}