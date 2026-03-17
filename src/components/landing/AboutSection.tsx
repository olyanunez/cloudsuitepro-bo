'use client';

import { Card } from '@/components/ui/card';
import { Target, Eye, Heart, Award, Users, Globe } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function AboutSection() {
  const [activeCompanies, setActiveCompanies] = useState<number>(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/active-companies`)
      .then(res => res.json())
      .then(data => setActiveCompanies(data.count))
      .catch(err => console.error('Error fetching active companies:', err));
  }, []);

  return (
    <section id="nosotros" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
            Sobre CloudSuite Pro
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Somos una empresa dedicada a transformar la manera en que los negocios gestionan
            sus operaciones diarias a través de tecnología innovadora y fácil de usar.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
            <p className="text-gray-600 leading-relaxed">
              Empoderar a pequeñas y medianas empresas con herramientas de gestión empresarial
              de clase mundial, permitiéndoles competir en igualdad de condiciones con grandes
              corporaciones mediante tecnología accesible, intuitiva y potente.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser la plataforma líder en gestión empresarial para PYMEs en América Latina,
              reconocida por nuestra innovación continua, excelencia en servicio al cliente
              y el impacto positivo que generamos en el crecimiento de los negocios de
              nuestros clientes.
            </p>
          </Card>
        </div>

        {/* Company Story */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Nuestra Historia
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  CloudSuite Pro nació en 2020 con una visión clara: simplificar la gestión empresarial
                  para negocios de todos los tamaños. Fundada por un equipo de emprendedores y
                  desarrolladores apasionados por la tecnología y los negocios, nuestra plataforma
                  fue diseñada desde cero pensando en las necesidades reales de los empresarios.
                </p>
                <p>
                  A lo largo de estos años, hemos crecido de ser una simple herramienta de
                  inventario a convertirnos en una suite completa de gestión empresarial que
                  incluye punto de venta, facturas electrónicas, reportes avanzados y mucho más.
                </p>
                <p>
                  Hoy, más de {activeCompanies > 0 ? activeCompanies : '...'} empresas confían en CloudSuite Pro para gestionar sus operaciones
                  diarias, procesando miles de transacciones y ayudando a nuestros clientes a
                  tomar decisiones más inteligentes basadas en datos reales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nuestros Valores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Pasión</h4>
              <p className="text-gray-600">
                Nos apasiona ayudar a los negocios a crecer y alcanzar su máximo potencial.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Excelencia</h4>
              <p className="text-gray-600">
                Buscamos la excelencia en cada producto y servicio que ofrecemos.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Colaboración</h4>
              <p className="text-gray-600">
                Trabajamos en conjunto con nuestros clientes para crear soluciones efectivas.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Innovación</h4>
              <p className="text-gray-600">
                Innovamos constantemente para estar a la vanguardia de la tecnología.
              </p>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-yellow-500 mb-2">{(activeCompanies ? activeCompanies + "+" : false) || '...'}</p>
            <p className="text-gray-600">Empresas Activas</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-yellow-500 mb-2">30+</p>
            <p className="text-gray-600">Usuarios Diarios</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-yellow-500 mb-2">99.9%</p>
            <p className="text-gray-600">Uptime</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-yellow-500 mb-2">24/7</p>
            <p className="text-gray-600">Soporte</p>
          </div>
        </div>
      </div>
    </section>
  );
}
