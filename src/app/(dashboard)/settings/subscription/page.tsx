'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle, Users, Package, Building2, Warehouse, Check, FileText, HardDrive } from 'lucide-react';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Subscription, Plan, UsageStats } from '@/lib/types/subscription';
import { toast } from 'sonner';
import { getTenantId } from '@/lib/services/apiService';
import Image from 'next/image';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadSubscriptionData();
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

      if (sub) {
        const stats = await SubscriptionService.getUsageStats(sub.id);
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Error al cargar la información de la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const plans = await SubscriptionService.getAvailablePlans();
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar los planes disponibles');
    }
  };

  const handleOpenChangePlan = async () => {
    await loadAvailablePlans();
    setShowChangePlanDialog(true);
  };

  const handleChangePlan = async () => {
    if (!selectedPlan || !subscription) {
      toast.error('Por favor selecciona un plan');
      return;
    }

    if (selectedPlan.id === subscription.planId) {
      toast.error('Ya estás suscrito a este plan');
      return;
    }

    try {
      setLoadingAction(true);
      await SubscriptionService.changePlan(subscription.id, { planId: selectedPlan.id });
      toast.success(`Plan cambiado exitosamente a ${selectedPlan.name}`);
      setShowChangePlanDialog(false);
      setSelectedPlan(null);
      await loadSubscriptionData();
    } catch (error: any) {
      console.error('Error changing plan:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo cambiar el plan';
      toast.error('Error al cambiar plan', {
        description: errorMessage,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      TRIAL: { color: 'bg-blue-500', text: 'Período de Prueba', icon: CheckCircle2 },
      ACTIVE: { color: 'bg-green-500', text: 'Activa', icon: CheckCircle2 },
      PAST_DUE: { color: 'bg-yellow-500', text: 'Pago Pendiente', icon: AlertCircle },
      SUSPENDED: { color: 'bg-orange-500', text: 'Suspendida', icon: XCircle },
      CANCELLED: { color: 'bg-red-500', text: 'Cancelada', icon: XCircle },
      EXPIRED: { color: 'bg-gray-500', text: 'Expirada', icon: XCircle },
    };

    const { color, text, icon: Icon } = config[status as keyof typeof config] || config.EXPIRED;

    return (
      <Badge className={`${color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {text}
      </Badge>
    );
  };

  const getUsagePercentage = (current: number, max: number | null): number => {
    if (max === null) return 0; // Ilimitado
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No hay suscripción activa</CardTitle>
            <CardDescription>
              No se encontró una suscripción para tu cuenta. Por favor contacta a soporte.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const trialDaysRemaining = SubscriptionService.getTrialDaysRemaining(subscription);
  const isInTrial = SubscriptionService.isInTrial(subscription);
  const isActive = SubscriptionService.isSubscriptionActive(subscription);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Suscripción</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu plan y uso de recursos
        </p>
      </div>

      {/* Trial Alert */}
      {isInTrial && trialDaysRemaining !== null && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">
                  Período de prueba activo
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Te quedan <span className="font-bold">{trialDaysRemaining} días</span> de prueba gratis.
                  Después de este período, necesitarás activar un método de pago para continuar usando el servicio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Plan {subscription.plan.name}
                <div className="flex justify-center">
                  <Image
                    src="/branding/transparente/icon/cloudsuitepro_short_logo3.png"
                    alt="CloudSuite Pro"
                    width={800}
                    height={240}
                    priority
                    className="h-5 w-auto"
                  />
                </div>
                {getStatusBadge(subscription.status)}
              </CardTitle>
              <CardDescription className="mt-2">
                {subscription.plan.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {SubscriptionService.formatPrice(
                  typeof subscription.amount === 'string'
                    ? parseFloat(subscription.amount)
                    : subscription.amount
                )}
              </div>
              <div className="text-sm text-gray-600">
                / {SubscriptionService.getBillingCycleName(subscription.billingCycle)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de inicio */}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Fecha de inicio</p>
                <p className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString('es-DO')}
                </p>
              </div>
            </div>

            {/* Próximo pago */}
            {subscription.nextBillingDate && (
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Próximo pago</p>
                  <p className="font-medium">
                    {new Date(subscription.nextBillingDate).toLocaleDateString('es-DO')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleOpenChangePlan}
            >
              Cambiar Plan
            </Button>
            {isActive && (
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => toast('Funcionalidad de cancelación próximamente', {
                  icon: 'ℹ️',
                })}
              >
                Cancelar Suscripción
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uso de Recursos */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle>Uso de Recursos</CardTitle>
            <CardDescription>
              Monitorea el uso de recursos de tu plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usuarios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Usuarios</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usageStats.activeUsers} / {subscription.currentMaxUsers || '∞'}
                </span>
              </div>
              {subscription.currentMaxUsers && (
                <Progress
                  value={getUsagePercentage(usageStats.activeUsers, subscription.currentMaxUsers)}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    getUsagePercentage(usageStats.activeUsers, subscription.currentMaxUsers)
                  )}
                />
              )}
            </div>

            {/* Productos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Productos</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usageStats.activeProducts} / {subscription.currentMaxProducts || '∞'}
                </span>
              </div>
              {subscription.currentMaxProducts && (
                <Progress
                  value={getUsagePercentage(usageStats.activeProducts, subscription.currentMaxProducts)}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    getUsagePercentage(usageStats.activeProducts, subscription.currentMaxProducts)
                  )}
                />
              )}
            </div>

            {/* Sucursales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Sucursales</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usageStats.activeBranches} / {subscription.currentMaxBranches || '∞'}
                </span>
              </div>
              {subscription.currentMaxBranches && (
                <Progress
                  value={getUsagePercentage(usageStats.activeBranches, subscription.currentMaxBranches)}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    getUsagePercentage(usageStats.activeBranches, subscription.currentMaxBranches)
                  )}
                />
              )}
            </div>

            {/* Almacenes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Warehouse className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Almacenes</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usageStats.activeWarehouses} / {subscription.currentMaxWarehouses || '∞'}
                </span>
              </div>
              {subscription.currentMaxWarehouses && (
                <Progress
                  value={getUsagePercentage(usageStats.activeWarehouses, subscription.currentMaxWarehouses)}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    getUsagePercentage(usageStats.activeWarehouses, subscription.currentMaxWarehouses)
                  )}
                />
              )}
            </div>

            {/* Secuencias NCF - Solo mostrar si el plan tiene NCF */}
            {subscription.plan.hasNCF && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Secuencias NCF</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {usageStats.activeNCFSequences || 0} / {subscription.currentMaxNCFSequences || '∞'}
                  </span>
                </div>
                {subscription.currentMaxNCFSequences && (
                  <Progress
                    value={getUsagePercentage(usageStats.activeNCFSequences || 0, subscription.currentMaxNCFSequences)}
                    className="h-2"
                    indicatorClassName={getUsageColor(
                      getUsagePercentage(usageStats.activeNCFSequences || 0, subscription.currentMaxNCFSequences)
                    )}
                  />
                )}
              </div>
            )}

            {/* Almacenamiento */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Almacenamiento</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usageStats.storageUsedGB >= 1
                    ? `${usageStats.storageUsedGB.toFixed(2)} GB`
                    : `${usageStats.storageUsedMB?.toFixed(2) || 0} MB`} / {subscription.currentMaxStorageGB ? `${subscription.currentMaxStorageGB} GB` : '∞'}
                </span>
              </div>
              {subscription.currentMaxStorageGB && (
                <Progress
                  value={getUsagePercentage(usageStats.storageUsedGB || 0, subscription.currentMaxStorageGB)}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    getUsagePercentage(usageStats.storageUsedGB || 0, subscription.currentMaxStorageGB)
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Características del Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Características Incluidas</CardTitle>
          <CardDescription>
            Funcionalidades disponibles en tu plan actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscription.plan.hasPOS && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Sistema POS</span>
              </div>
            )}
            {subscription.plan.hasInventory && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Gestión de Inventario</span>
              </div>
            )}
            {subscription.plan.hasBatchTracking && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Seguimiento de Lotes</span>
              </div>
            )}
            {subscription.plan.hasMultiBranch && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Multi-sucursal</span>
              </div>
            )}
            {subscription.plan.hasMultiWarehouse && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Multi-almacén</span>
              </div>
            )}
            {subscription.plan.hasCreditNotes && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Notas de Crédito</span>
              </div>
            )}
            {subscription.plan.hasPurchaseOrders && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Órdenes de Compra</span>
              </div>
            )}
            {subscription.plan.hasSuppliers && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Gestión de Proveedores</span>
              </div>
            )}
            {subscription.plan.hasFullAccounting && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Contabilidad Completa</span>
              </div>
            )}
            {subscription.plan.hasBasicAccounting && !subscription.plan.hasFullAccounting && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Contabilidad Básica</span>
              </div>
            )}
            {subscription.plan.hasCOGS && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Costo de Ventas (COGS)</span>
              </div>
            )}
            {subscription.plan.hasNCF && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Facturas electrónicas (NCF)</span>
              </div>
            )}
            {subscription.plan.hasAllNCFTypes && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Todos los Tipos de NCF</span>
              </div>
            )}
            {subscription.plan.hasDGIIReports && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reportes DGII (606, 607, 608)</span>
              </div>
            )}
            {subscription.plan.hasAccountsPayable && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cuentas por Pagar</span>
              </div>
            )}
            {subscription.plan.hasFinancialReports && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reportes Financieros</span>
              </div>
            )}
            {subscription.plan.hasAdvancedReports && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reportes Avanzados</span>
              </div>
            )}
            {subscription.plan.hasExport && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Exportación de Datos</span>
              </div>
            )}
            {subscription.plan.hasCustomReports && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reportes Personalizados</span>
              </div>
            )}
            {subscription.plan.hasAPIAccess && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Acceso API</span>
              </div>
            )}
            {subscription.plan.hasWebhooks && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Webhooks</span>
              </div>
            )}
            {subscription.plan.hasBasicReports && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reportes Básicos</span>
              </div>
            )}
            {subscription.plan.hasEmailSupport && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Soporte por Email</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para cambiar plan */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent className="max-w-[92vw] w-[92vw] lg:max-w-[1500px] lg:w-[1500px] max-h-[90vh] overflow-y-auto p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl">Cambiar Plan de Suscripción</DialogTitle>
            <DialogDescription className="text-lg">
              Selecciona el plan que mejor se adapte a tus necesidades. Los cambios se aplicarán inmediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 py-4">
            {availablePlans.map((plan) => {
              const isCurrentPlan = subscription?.planId === plan.id;
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${isSelected
                    ? 'ring-2 ring-primary border-primary'
                    : isCurrentPlan
                      ? 'border-green-500 bg-green-50'
                      : 'hover:border-gray-400'
                    }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="bg-green-500 text-white">
                          Plan Actual
                        </Badge>
                      )}
                      {isSelected && !isCurrentPlan && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardDescription className="text-2xl font-bold">
                      ${plan.monthlyPrice}
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {plan.maxUsers ? `${plan.maxUsers} usuarios` : 'Usuarios ilimitados'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>
                          {plan.maxProducts ? `${plan.maxProducts} productos` : 'Productos ilimitados'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>
                          {plan.maxBranches ? `${plan.maxBranches} sucursales` : 'Sucursales ilimitadas'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        <span>
                          {plan.maxWarehouses ? `${plan.maxWarehouses} almacenes` : 'Almacenes ilimitados'}
                        </span>
                      </div>
                      {plan.hasNCF && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>
                            {plan.maxNCFSequences ? `${plan.maxNCFSequences} secuencias NCF` : 'Secuencias NCF ilimitadas'}
                          </span>
                        </div>
                      )}
                      {plan.maxStorageGB && (
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          <span>{plan.maxStorageGB} GB de almacenamiento</span>
                        </div>
                      )}
                      {plan.hasAPIAccess && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Acceso API</span>
                        </div>
                      )}
                      {plan.hasFullAccounting && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Contabilidad Completa</span>
                        </div>
                      )}
                      {plan.hasNCF && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Facturación NCF</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangePlanDialog(false)}
              disabled={loadingAction}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={!selectedPlan || selectedPlan.id === subscription?.planId || loadingAction}
            >
              {loadingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
