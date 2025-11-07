'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Básico',
    price: '$29',
    period: '/mes',
    description: 'Perfecto para pequeños negocios que están comenzando',
    features: [
      'Hasta 3 usuarios',
      'Hasta 500 productos',
      '1 sucursal y almacén',
      'Sistema POS básico',
      'Reportes estándar',
      'Facturación electrónica',
      'Soporte por email',
      'Actualizaciones incluidas',
    ],
    cta: 'Comenzar Gratis',
  },
  {
    name: 'Profesional',
    price: '$79',
    period: '/mes',
    description: 'Ideal para negocios en crecimiento con múltiples ubicaciones',
    features: [
      'Hasta 10 usuarios',
      'Hasta 2,000 productos',
      '3 sucursales y almacenes',
      'Sistema POS avanzado',
      'Reportes y analytics avanzados',
      'Facturación electrónica',
      'Gestión de inventario en tiempo real',
      'Soporte prioritario',
      'Integraciones API',
      'Respaldos diarios',
    ],
    highlighted: true,
    cta: 'Prueba Gratis 14 Días',
  },
  {
    name: 'Empresarial',
    price: '$199',
    period: '/mes',
    description: 'Solución completa para empresas grandes y cadenas',
    features: [
      'Usuarios ilimitados',
      'Productos ilimitados',
      'Sucursales ilimitadas',
      'Sistema POS completo',
      'Reportes personalizados',
      'Facturación electrónica masiva',
      'Multi-tenant',
      'API completa',
      'Soporte 24/7',
      'Gerente de cuenta dedicado',
      'Capacitación personalizada',
      'Respaldos cada 6 horas',
    ],
    cta: 'Contactar Ventas',
  },
];

export function PricingSection() {
  return (
    <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan perfecto para tu negocio. Todos los planes incluyen 14 días de prueba gratis
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative p-8 ${
                tier.highlighted
                  ? 'border-2 border-yellow-400 shadow-xl scale-105'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg font-semibold text-sm">
                  <Star className="h-4 w-4 inline mr-1" />
                  Más Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {tier.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  style={{
                    backgroundColor: tier.highlighted ? '#eab308' : 'transparent',
                    color: tier.highlighted ? 'white' : '#eab308',
                    borderColor: '#eab308',
                    borderWidth: '1px'
                  }}
                  className={`w-full font-semibold ${
                    tier.highlighted
                      ? 'hover:opacity-90'
                      : 'hover:bg-yellow-50'
                  } transition-all`}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
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
              'Migracion de datos',
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
