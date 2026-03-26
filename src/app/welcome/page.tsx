'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Footer } from '@/components/landing/Footer';
import { useEffect, useState } from 'react';

export default function Welcome() {
  const [activeCompanies, setActiveCompanies] = useState<number>(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/active-companies`)
      .then(res => res.json())
      .then(data => setActiveCompanies(data.count))
      .catch(err => console.error('Error fetching active companies:', err));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section id="inicio" className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6 sm:mb-8 flex justify-center">
              <Image
                src="/branding/transparente/cloudsuitepro_logo2.png"
                alt="CloudSuite Pro"
                width={800}
                height={240}
                priority
                className="h-24 sm:h-32 md:h-40 w-auto"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              Gestiona tu negocio con{' '}
              <span className="text-yellow-500">CloudSuite Pro</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              La plataforma todo-en-uno para gestionar inventario, ventas, facturación y reportes.
              Optimiza tu negocio y toma decisiones inteligentes basadas en datos.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Link href="/precios" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  style={{
                    backgroundColor: '#eab308',
                    color: 'white',
                    borderColor: '#eab308'
                  }}
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 hover:opacity-90 transition-opacity font-semibold"
                >
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
              Herramientas poderosas diseñadas para hacer crecer tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Gestión de Inventario
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Controla tu stock en tiempo real, múltiples almacenes y sucursales con alertas automáticas.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Punto de Venta (POS)
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Sistema POS rápido e intuitivo para procesar ventas y generar facturas al instante.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Reportes y Analytics
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Visualiza tendencias, márgenes de ganancia y toma decisiones basadas en datos reales.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Gestión de Usuarios
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Control de accesos y permisos para tu equipo con roles personalizables.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Facturas Electrónicas
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Genera facturas profesionales y gestiona tus documentos fiscales con facilidad.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Seguridad Garantizada
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Tus datos protegidos con encriptación y respaldos automáticos en la nube.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                ¿Por qué elegir CloudSuite Pro?
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Fácil de usar</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Interfaz intuitiva que no requiere capacitación técnica
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Acceso desde cualquier lugar</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Gestiona tu negocio desde cualquier dispositivo con conexión a internet
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Soporte 24/7</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Equipo de soporte disponible para ayudarte cuando lo necesites
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Actualizaciones constantes</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Nuevas funcionalidades y mejoras sin costo adicional
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-6 sm:p-8 lg:p-12 text-white">
              <div className="text-center">
                <Zap className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Comienza hoy</h3>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8">
                  Únete a cientos de negocios que ya están creciendo con CloudSuite Pro
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                  <div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{(activeCompanies ? activeCompanies + "+" : false) || '...'}</p>
                    <p className="text-xs sm:text-sm">Empresas</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">99.9%</p>
                    <p className="text-xs sm:text-sm">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">24/7</p>
                    <p className="text-xs sm:text-sm">Soporte</p>
                  </div>
                </div>
                <Link href="/precios">
                  <Button
                    size="lg"
                    style={{
                      backgroundColor: 'white',
                      color: '#ca8a04',
                      borderColor: 'white'
                    }}
                    className="hover:bg-gray-100 w-full font-semibold text-sm sm:text-base"
                  >
                    Regístrate Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Quick Links Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Descubre Más Sobre CloudSuite Pro
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
              Explora todas las funcionalidades y beneficios de nuestra plataforma
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Link href="/como-funciona">
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                <div className="text-center">
                  <div className="bg-yellow-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Cómo Funciona</h3>
                  <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                    Descubre lo fácil que es implementar CloudSuite Pro en tu negocio
                  </p>
                </div>
              </Card>
            </Link>
            <Link href="/nosotros">
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                <div className="text-center">
                  <div className="bg-yellow-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Nosotros</h3>
                  <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                    Conoce nuestra misión, visión y valores como empresa
                  </p>
                </div>
              </Card>
            </Link>
            <Link href="/precios">
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                <div className="text-center">
                  <div className="bg-yellow-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Precios</h3>
                  <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                    Planes flexibles que se adaptan al tamaño de tu negocio
                  </p>
                </div>
              </Card>
            </Link>
            <Link href="/contacto">
              <Card className="p-4 sm:p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                <div className="text-center">
                  <div className="bg-yellow-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Contacto</h3>
                  <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                    ¿Tienes preguntas? Contáctanos y te ayudaremos
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
            Crea tu cuenta gratis y empieza a gestionar tu negocio de manera profesional
          </p>
          <Link href="/precios">
            <Button
              size="lg"
              style={{
                backgroundColor: '#eab308',
                color: 'white',
                borderColor: '#eab308'
              }}
              className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 hover:opacity-90 transition-opacity font-semibold"
            >
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
