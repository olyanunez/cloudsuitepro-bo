'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Subscription } from '@/lib/types/subscription';
import { toast } from 'react-hot-toast';
import { getTenantId } from '@/lib/services/apiService';

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
    handlePaymentCallback();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      if (!tenantId) {
        throw new Error('No se encontró el ID del tenant');
      }

      const sub = await SubscriptionService.getCurrentSubscription(parseInt(tenantId));
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Error al cargar la información de facturación');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = () => {
    const payment = searchParams.get('payment');

    if (payment === 'success') {
      toast.success('Método de pago configurado exitosamente');
      // Limpiar parámetros de URL
      router.replace('/settings/billing');
      loadSubscriptionData();
    } else if (payment === 'cancelled') {
      toast.error('Configuración de pago cancelada');
      router.replace('/settings/billing');
    }
  };

  const handleSetupPayment = async () => {
    if (!subscription) return;

    try {
      setProcessingPayment(true);
      const returnUrl = `${window.location.origin}/settings/billing?payment=success`;
      const cancelUrl = `${window.location.origin}/settings/billing?payment=cancelled`;

      const { approvalUrl } = await SubscriptionService.createPayPalSubscription(
        subscription.id,
        returnUrl,
        cancelUrl
      );

      // Redirigir a PayPal
      window.location.href = approvalUrl;
    } catch (error: any) {
      console.error('Error setting up payment:', error);
      toast.error(error.message || 'Error al configurar método de pago');
      setProcessingPayment(false);
    }
  };

  const handleChangePaymentMethod = () => {
    setShowPaymentModal(true);
  };

  const handleCancelPayPalSubscription = async () => {
    if (!subscription || !subscription.paypalSubscriptionId) return;

    if (!confirm('¿Estás seguro de que deseas cancelar tu método de pago? Tu suscripción se cancelará.')) {
      return;
    }

    try {
      setProcessingPayment(true);
      await SubscriptionService.cancelPayPalSubscription(subscription.id);
      toast.success('Método de pago cancelado');
      await loadSubscriptionData();
      setShowPaymentModal(false);
    } catch (error: any) {
      console.error('Error cancelling payment:', error);
      toast.error(error.message || 'Error al cancelar método de pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground">
            Administra tu método de pago y facturación
          </p>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            No se encontró una suscripción activa. Por favor contacta a soporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasPaymentMethod = !!subscription.paypalSubscriptionId;
  const isInTrial = SubscriptionService.isInTrial(subscription);
  const trialDaysRemaining = SubscriptionService.getTrialDaysRemaining(subscription);
  const needsPaymentSetup = isInTrial && !hasPaymentMethod && (trialDaysRemaining || 0) <= 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <p className="text-muted-foreground">
          Administra tu método de pago y facturación
        </p>
      </div>

      {/* Alerta de configuración de pago */}
      {needsPaymentSetup && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Configura tu método de pago</p>
                <p className="text-sm">
                  Tu período de prueba termina en {trialDaysRemaining} {trialDaysRemaining === 1 ? 'día' : 'días'}.
                  Configura un método de pago para continuar sin interrupciones.
                </p>
              </div>
              <Button
                onClick={handleSetupPayment}
                disabled={processingPayment}
                className="ml-4"
              >
                {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Configurar Ahora
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Método de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </CardTitle>
            <CardDescription>
              Administra cómo pagas tu suscripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPaymentMethod ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="h-12 w-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                    <Image
                      src="/paypal_logo.png"
                      alt="PayPal"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Cuenta</p>
                      <Badge variant="outline" className="bg-green-500 text-white border-green-500">
                        Activo
                      </Badge>
                    </div>
                    {subscription.paypalSubscriberEmail && (
                      <p className="text-sm text-muted-foreground">
                        {subscription.paypalSubscriberEmail}
                      </p>
                    )}
                    {subscription.paypalCustomerId && (
                      <p className="text-sm text-muted-foreground">
                        Cliente: {subscription.paypalCustomerId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleChangePaymentMethod}
                  >
                    Cambiar Método
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleCancelPayPalSubscription}
                    disabled={processingPayment}
                  >
                    {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">No hay método de pago configurado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configura PayPal para continuar después del período de prueba
                </p>
                <Button
                  onClick={handleSetupPayment}
                  disabled={processingPayment}
                  className="bg-[#FFC439] hover:bg-[#F7B600] text-black font-semibold flex items-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Image
                        src="/paypal_logo2.png"
                        alt="PayPal"
                        width={100}
                        height={24}
                        className="object-contain"
                      />
                      <span>Configurar</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de Facturación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Información de Facturación
            </CardTitle>
            <CardDescription>
              Detalles de tu suscripción actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Plan Actual</span>
              <span className="font-semibold">{subscription.plan.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Ciclo de Facturación</span>
              <span className="font-semibold">
                {SubscriptionService.getBillingCycleName(subscription.billingCycle)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Monto</span>
              <span className="font-semibold text-lg">
                {SubscriptionService.formatPrice(Number(subscription.amount))}
              </span>
            </div>
            {subscription.nextBillingDate && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Próximo Cobro
                </span>
                <span className="font-semibold">
                  {new Date(subscription.nextBillingDate).toLocaleDateString('es-DO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {isInTrial && trialDaysRemaining !== null && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Días de Prueba Restantes
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? 'día' : 'días'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de Pagos - Próximamente */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>
            Tus transacciones y facturas recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay historial de pagos disponible</p>
            <p className="text-sm">Los pagos aparecerán aquí una vez procesados</p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cambio de Método de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Método de Pago</DialogTitle>
            <DialogDescription>
              Actualiza tu método de pago de PayPal
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Para cambiar tu método de pago, primero debes cancelar el actual y configurar uno nuevo.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              disabled={processingPayment}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await handleCancelPayPalSubscription();
                if (!processingPayment) {
                  handleSetupPayment();
                }
              }}
              disabled={processingPayment}
            >
              {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
