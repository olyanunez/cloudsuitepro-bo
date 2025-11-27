'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Star, Loader2 } from 'lucide-react';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Plan, BillingCycle } from '@/lib/types/subscription';

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await SubscriptionService.getPlans();
      // Ordenar por displayOrder
      const sortedPlans = fetchedPlans.sort((a, b) => a.displayOrder - b.displayOrder);
      setPlans(sortedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturesList = (plan: Plan): string[] => {
    const features: string[] = [];

    // Límites de recursos
    if (plan.maxUsers !== null) {
      features.push(`Hasta ${plan.maxUsers} usuarios`);
    } else {
      features.push('Usuarios ilimitados');
    }

    if (plan.maxProducts !== null) {
      features.push(`Hasta ${plan.maxProducts.toLocaleString()} productos`);
    } else {
      features.push('Productos ilimitados');
    }

    if (plan.maxBranches !== null) {
      features.push(`${plan.maxBranches} sucursal${plan.maxBranches > 1 ? 'es' : ''}`);
    } else {
      features.push('Sucursales ilimitadas');
    }

    if (plan.maxWarehouses !== null) {
      features.push(`${plan.maxWarehouses} almacén${plan.maxWarehouses > 1 ? 'es' : ''}`);
    } else {
      features.push('Almacenes ilimitados');
    }

    // Almacenamiento
    if (plan.maxStorageGB !== null && plan.maxStorageGB !== undefined) {
      features.push(`${plan.maxStorageGB} GB de almacenamiento`);
    } else if (plan.maxStorageGB === null) {
      features.push('Almacenamiento ilimitado');
    }

    // NCF
    if (plan.maxNCFSequences !== null && plan.maxNCFSequences !== undefined && plan.maxNCFSequences > 0) {
      features.push(`${plan.maxNCFSequences} secuencia${plan.maxNCFSequences > 1 ? 's' : ''} NCF`);
    }

    // Características principales
    if (plan.hasPOS) features.push('Sistema POS completo');
    if (plan.hasInventory) features.push('Gestión de inventario');
    if (plan.hasBatchTracking) features.push('Seguimiento de lotes');
    if (plan.hasMultiBranch) features.push('Multi-sucursal');
    if (plan.hasMultiWarehouse) features.push('Multi-almacén');
    if (plan.hasCreditNotes) features.push('Notas de crédito');
    if (plan.hasPurchaseOrders) features.push('Órdenes de compra');
    if (plan.hasSuppliers) features.push('Gestión de proveedores');

    // Contabilidad: Mostrar solo la más avanzada
    if (plan.hasFullAccounting) {
      features.push('Contabilidad completa');
    } else if (plan.hasBasicAccounting) {
      features.push('Contabilidad básica');
    }

    if (plan.hasCOGS) features.push('Costo de ventas (COGS)');
    if (plan.hasFinancialReports) features.push('Reportes financieros');
    if (plan.hasAccountsPayable) features.push('Cuentas por pagar');
    if (plan.hasNCF) features.push('Facturación electrónica (NCF)');
    if (plan.hasAllNCFTypes) features.push('Todos los tipos de NCF');
    if (plan.hasDGIIReports) features.push('Reportes DGII');

    // Reportes: Mostrar en orden de más específico a más general
    if (plan.hasCustomReports) features.push('Reportes personalizados');
    if (plan.hasAdvancedReports) features.push('Reportes avanzados');
    if (plan.hasBasicReports && !plan.hasAdvancedReports && !plan.hasCustomReports) {
      features.push('Reportes básicos');
    }

    if (plan.hasExport) features.push('Exportación de datos');
    if (plan.hasAPIAccess) features.push('Acceso API');
    if (plan.hasWebhooks) features.push('Webhooks');

    // Soporte y servicios
    if (plan.supportLevel) {
      const supportNames: Record<string, string> = {
        EMAIL: 'Soporte por email',
        PRIORITY: 'Soporte prioritario',
        DEDICATED: 'Soporte dedicado 24/7',
        '24/7': 'Soporte dedicado 24/7',
      };
      features.push(supportNames[plan.supportLevel] || 'Soporte por email');
    } else if (plan.hasEmailSupport) {
      features.push('Soporte por email');
    }

    if (plan.hasTraining) features.push('Capacitación incluida');
    if (plan.hasConsulting) features.push('Consultoría especializada');

    return features;
  };

  const getCtaText = (plan: Plan): string => {
    if (plan.trialDays > 0) {
      return `Prueba Gratis ${plan.trialDays} Días`;
    }
    return 'Comenzar Ahora';
  };

  const isHighlighted = (plan: Plan): boolean => {
    return plan.code === 'PROFESSIONAL';
  };

  if (loading) {
    return (
      <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes y Precios
            </h2>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan perfecto para tu negocio. Todos los planes incluyen período de prueba gratis
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1.5 gap-2">
            <button
              onClick={() => setSelectedBillingCycle(BillingCycle.MONTHLY)}
              className={`px-8 py-3 rounded-md font-medium transition-all ${selectedBillingCycle === BillingCycle.MONTHLY
                ? 'bg-yellow-500 text-white shadow-md scale-120 mr-2.5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="flex flex-col items-center justify-center py-2">
                <span>Mensual</span>
              </span>
            </button>
            <button
              onClick={() => setSelectedBillingCycle(BillingCycle.QUARTERLY)}
              className={`px-8 py-3 rounded-md font-medium transition-all ${selectedBillingCycle === BillingCycle.QUARTERLY
                ? 'bg-yellow-500 text-white shadow-md scale-120 mx-2.5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="flex flex-col items-center justify-center">
                <span>Trimestral</span>
                {plans.length > 0 && (
                  <span className={`text-xs font-semibold mt-0.5 ${selectedBillingCycle === BillingCycle.QUARTERLY ? 'text-yellow-100' : 'text-green-600'}`}>
                    Ahorra {SubscriptionService.calculateDiscount(plans[0], BillingCycle.QUARTERLY)}%
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setSelectedBillingCycle(BillingCycle.YEARLY)}
              className={`px-8 py-3 rounded-md font-medium transition-all ${selectedBillingCycle === BillingCycle.YEARLY
                ? 'bg-yellow-500 text-white shadow-md scale-120 ml-2.5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="flex flex-col items-center justify-center">
                <span>Anual</span>
                {plans.length > 0 && (
                  <span className={`text-xs font-semibold mt-0.5 ${selectedBillingCycle === BillingCycle.YEARLY ? 'text-yellow-100' : 'text-green-600'}`}>
                    Ahorra {SubscriptionService.calculateDiscount(plans[0], BillingCycle.YEARLY)}%
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const highlighted = isHighlighted(plan);
            const features = getFeaturesList(plan);
            const price = SubscriptionService.calculatePlanPrice(plan, selectedBillingCycle);

            return (
              <Card
                key={plan.id}
                className={`relative p-8 ${highlighted
                  ? 'border-2 border-yellow-400 shadow-xl scale-105'
                  : 'hover:shadow-lg transition-shadow'
                  }`}
              >
                {highlighted && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg font-semibold text-sm">
                    <Star className="h-4 w-4 inline mr-1" />
                    Más Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {plan.description}
                    </p>
                  )}
                  <div className="flex items-baseline mb-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {SubscriptionService.formatPrice(price).split(',')[0]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      / {SubscriptionService.getBillingCycleName(selectedBillingCycle).toLowerCase()}
                    </span>
                  </div>
                  {selectedBillingCycle !== BillingCycle.MONTHLY && (
                    <p className="text-sm text-green-600 font-medium">
                      {SubscriptionService.formatPrice(price / (selectedBillingCycle === BillingCycle.QUARTERLY ? 3 : 12))} por mes
                    </p>
                  )}
                  {plan.setupFee && (typeof plan.setupFee === 'string' ? parseFloat(plan.setupFee) : plan.setupFee) > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      + {SubscriptionService.formatPrice(typeof plan.setupFee === 'string' ? parseFloat(plan.setupFee) : plan.setupFee)} cargo de instalación
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                  {features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-gray-600 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.code}&billing=${selectedBillingCycle}`}
                  className="block"
                >
                  <Button
                    style={{
                      backgroundColor: highlighted ? '#eab308' : 'transparent',
                      color: highlighted ? 'white' : '#eab308',
                      borderColor: '#eab308',
                      borderWidth: '1px'
                    }}
                    className={`w-full font-semibold ${highlighted
                      ? 'hover:opacity-90'
                      : 'hover:bg-yellow-50'
                      } transition-all`}
                    size="lg"
                  >
                    {getCtaText(plan)}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Todos los planes incluyen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Actualizaciones automáticas',
              'Encriptación de datos',
              'Respaldos en la nube',
              'Acceso desde cualquier dispositivo',
              'Capacitación inicial',
              'Sin contratos de permanencia',
              'Migración de datos',
              'Documentación completa',
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Necesitas una solución personalizada?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Para empresas con necesidades específicas, ofrecemos planes personalizados con
            funcionalidades a medida, integraciones especiales y soporte dedicado.
          </p>
          <a href="#contacto">
            <Button
              variant="outline"
              style={{
                borderColor: '#eab308',
                color: '#ca8a04',
              }}
              className="hover:bg-yellow-100 font-semibold"
              size="lg"
            >
              Contactar a Ventas
            </Button>
          </a>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            💯 <span className="font-semibold">Garantía de satisfacción:</span> Si no estás completamente satisfecho en los primeros 30 días, te devolvemos tu dinero.
          </p>
        </div>
      </div>
    </section>
  );
}
