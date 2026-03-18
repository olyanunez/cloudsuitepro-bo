'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserPlus, Settings, Rocket, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <Image
              src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
              alt="CloudSuite Pro"
              width={800}
              height={240}
              priority
              className="h-30 w-auto"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comienza a gestionar tu negocio en minutos con nuestro proceso simple y rápido
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Step 1 */}
          <div className="relative">
            <Card className="p-6 hover:shadow-lg transition-shadow h-full">
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Regístrate Gratis
              </h3>
              <p className="text-gray-600">
                Crea tu cuenta en menos de 2 minutos. Solo necesitas tu email y algunos
                datos básicos de tu empresa.
              </p>
            </Card>
            {/* Arrow - Hidden on mobile */}
            <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <Card className="p-6 hover:shadow-lg transition-shadow h-full">
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Configura tu Negocio
              </h3>
              <p className="text-gray-600">
                Agrega tus productos, categorías, usuarios y sucursales. Nuestro asistente
                te guiará paso a paso.
              </p>
            </Card>
            <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <Card className="p-6 hover:shadow-lg transition-shadow h-full">
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¡Lanza tu Sistema!
              </h3>
              <p className="text-gray-600">
                Comienza a procesar ventas, gestionar inventario y generar reportes desde
                el primer día.
              </p>
            </Card>
            <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <Card className="p-6 hover:shadow-lg transition-shadow h-full">
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Crece y Escala
              </h3>
              <p className="text-gray-600">
                Utiliza nuestros reportes y analytics para tomar decisiones inteligentes
                y hacer crecer tu negocio.
              </p>
            </Card>
          </div>
        </div>

        {/* Features Timeline */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Todo Incluido Desde el Primer Día
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Sistema POS intuitivo y rápido',
              'Gestión de inventario en tiempo real',
              'Facturas electrónicas',
              'Múltiples sucursales y almacenes',
              'Control de usuarios y permisos',
              'Reportes y análisis avanzados',
              'Respaldos automáticos diarios',
              'Actualizaciones gratuitas',
              'Soporte técnico especializado',
              'Aplicación móvil (próximamente)',
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Time */}
        <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tiempo de Implementación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div>
              <p className="text-4xl font-bold text-yellow-500 mb-2">5 min</p>
              <p className="text-gray-600">Registro y configuración inicial</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-500 mb-2">1 hora</p>
              <p className="text-gray-600">Carga de productos y datos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-500 mb-2">2 horas</p>
              <p className="text-gray-600">Capacitación del equipo</p>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/precios">
              <Button
                size="lg"
                style={{
                  backgroundColor: '#eab308',
                  color: 'white',
                  borderColor: '#eab308'
                }}
                className="hover:opacity-90 transition-opacity font-semibold px-8"
              >
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
