'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Star, Loader2 } from 'lucide-react';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Plan, BillingCycle } from '@/lib/types/subscription';
import Image from 'next/image';

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
    if (plan.hasNCF) features.push('Facturas electrónicas (NCF)');
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
      <section id="precios" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 lg:mb-8 flex justify-center">
            <Image
              src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
              alt="CloudSuite Pro"
              width={800}
              height={240}
              priority
              className="h-16 sm:h-20 lg:h-30 w-auto"
            />
          </div>
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Planes y Precios
            </h2>
          </div>
          <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-yellow-500" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="precios" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Image
              src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
              alt="CloudSuite Pro"
              width={800}
              height={240}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Planes y Precios
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Elige el plan perfecto para tu negocio. Todos los planes incluyen período de prueba gratis
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8 lg:mb-12 overflow-x-auto pb-2">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 sm:p-1.5 gap-1 sm:gap-2">
            <button
              onClick={() => setSelectedBillingCycle(BillingCycle.MONTHLY)}
              className={`px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-md font-medium transition-all text-sm sm:text-base ${selectedBillingCycle === BillingCycle.MONTHLY
                ? 'bg-yellow-500 text-white shadow-md scale-105 sm:scale-110'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="flex flex-col items-center justify-center py-1 sm:py-2">
                <span>Mensual</span>
              </span>
            </button>
            <button
              onClick={() => setSelectedBillingCycle(BillingCycle.QUARTERLY)}
              className={`px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-md font-medium transition-all text-sm sm:text-base ${selectedBillingCycle === BillingCycle.QUARTERLY
                ? 'bg-yellow-500 text-white shadow-md scale-105 sm:scale-110'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="flex flex-col items-center justify-center">
                <span>Trimestral</span>
                {plans.length > 0 && (
                  <span className={`text-[10px] sm:text-xs font-semibold mt-0.5 ${selectedBillingCycle === BillingCycle.QUARTERLY ? 'text-yellow-100' : 'text-green-600'}`}>
                    Ahorra {SubscriptionService.calculateDiscount(plans[0], BillingCycle.QUARTERLY)}%
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setSelectedBillingCycle(BillingCycle.YEARLY)}
              className={`px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-md font-medium transition-all text-sm sm:text-base ${selectedBillingCycle === BillingCycle.YEARLY
                ? 'bg-yellow-500 text-white shadow-md scale-105 sm:scale-110'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
              <span className="flex flex-col items-center justify-center">
                <span>Anual</span>
                {plans.length > 0 && (
                  <span className={`text-[10px] sm:text-xs font-semibold mt-0.5 ${selectedBillingCycle === BillingCycle.YEARLY ? 'text-yellow-100' : 'text-green-600'}`}>
                    Ahorra {SubscriptionService.calculateDiscount(plans[0], BillingCycle.YEARLY)}%
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {plans.map((plan) => {
            const highlighted = isHighlighted(plan);
            const features = getFeaturesList(plan);
            const price = SubscriptionService.calculatePlanPrice(plan, selectedBillingCycle);

            return (
              <Card
                key={plan.id}
                className={`relative p-4 sm:p-6 lg:p-8 ${highlighted
                  ? 'border-2 border-yellow-400 shadow-xl md:scale-105'
                  : 'hover:shadow-lg transition-shadow'
                  }`}
              >
                {highlighted && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-2 sm:px-4 py-1 rounded-bl-lg rounded-tr-lg font-semibold text-xs sm:text-sm">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    Más Popular
                  </div>
                )}

                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex justify-center">
                      <Image
                        src="/branding/transparente/icon/cloudsuitepro_short_logo3.png"
                        alt="CloudSuite Pro"
                        width={800}
                        height={240}
                        priority
                        className="h-4 sm:h-5 w-auto"
                      />
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      {plan.description}
                    </p>
                  )}
                  <div className="flex items-baseline mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                      {SubscriptionService.formatPrice(price).split(',')[0]}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600 ml-1 sm:ml-2">
                      / {SubscriptionService.getBillingCycleName(selectedBillingCycle).toLowerCase()}
                    </span>
                  </div>
                  {selectedBillingCycle !== BillingCycle.MONTHLY && (
                    <p className="text-xs sm:text-sm text-green-600 font-medium">
                      {SubscriptionService.formatPrice(price / (selectedBillingCycle === BillingCycle.QUARTERLY ? 3 : 12))} por mes
                    </p>
                  )}
                  {plan.setupFee && (typeof plan.setupFee === 'string' ? parseFloat(plan.setupFee) : plan.setupFee) > 0 && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                      + {SubscriptionService.formatPrice(typeof plan.setupFee === 'string' ? parseFloat(plan.setupFee) : plan.setupFee)} cargo de instalación
                    </p>
                  )}
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 lg:mb-8 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                  {features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-2 sm:ml-3 text-gray-600 text-xs sm:text-sm">
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
                    className={`w-full font-semibold text-sm sm:text-base ${highlighted
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
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Todos los planes incluyen
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
              <div key={index} className="flex items-center space-x-1.5 sm:space-x-2">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-6 sm:mt-8 lg:mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            ¿Necesitas una solución personalizada?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
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
              className="hover:bg-yellow-100 font-semibold text-sm sm:text-base"
              size="lg"
            >
              Contactar a Ventas
            </Button>
          </a>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-4 sm:mt-6 lg:mt-8 text-center px-2">
          <p className="text-sm sm:text-base text-gray-600">
            💯 <span className="font-semibold">Garantía de satisfacción:</span> Si no estás completamente satisfecho en los primeros 30 días, te devolvemos tu dinero.
          </p>
        </div>
      </div>
    </section>
  );
}
