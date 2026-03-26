'use client';

import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'María Rodríguez',
    role: 'Gerente General',
    company: 'Farmacia Central',
    content:
      'CloudSuite Pro transformó completamente la gestión de nuestras 5 sucursales. Ahora podemos ver el inventario en tiempo real y los reportes nos ayudan a tomar mejores decisiones de compra. El ROI fue inmediato.',
    rating: 5,
  },
  {
    name: 'Carlos Méndez',
    role: 'Propietario',
    company: 'Supermercado El Ahorro',
    content:
      'Las facturas electrónicas y el sistema POS son increíblemente rápidos. Nuestros cajeros se adaptaron en menos de una hora. El soporte técnico es excelente, siempre disponibles cuando los necesitamos.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Directora de Operaciones',
    company: 'Tiendas Fashion Style',
    content:
      'Antes perdíamos mucho tiempo con hojas de Excel. Ahora todo está automatizado y sincronizado. Los reportes de ventas por categoría nos han ayudado a optimizar nuestro stock y aumentar las ganancias en un 30%.',
    rating: 5,
  },
  {
    name: 'Roberto Sánchez',
    role: 'CEO',
    company: 'Distribuidora Global',
    content:
      'La capacidad de gestionar múltiples almacenes desde una sola plataforma es invaluable. Las alertas automáticas de stock mínimo nos han ahorrado miles de dólares en ventas perdidas.',
    rating: 5,
  },
  {
    name: 'Laura Jiménez',
    role: 'Gerente de Ventas',
    company: 'Boutique Elegancia',
    content:
      'El sistema es muy intuitivo. No necesitamos capacitación técnica avanzada. La aplicación web funciona perfectamente en tablets y computadoras. Nuestro equipo está muy satisfecho.',
    rating: 5,
  },
  {
    name: 'José Hernández',
    role: 'Contador',
    company: 'Ferretería La Popular',
    content:
      'La generación automática de reportes fiscales nos facilita enormemente el trabajo contable. La integración con facturas electrónicas funciona sin problemas. Muy recomendado.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [activeCompanies, setActiveCompanies] = useState<number>(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/active-companies`)
      .then(res => res.json())
      .then(data => setActiveCompanies(data.count))
      .catch(err => console.error('Error fetching active companies:', err));
  }, []);

  return (
    <section id="testimonios" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-yellow-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            {activeCompanies > 0 ? `Más de ${activeCompanies} empresas confían en CloudSuite Pro` : 'Empresas confían en CloudSuite Pro'} para gestionar sus operaciones diarias
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-lg transition-shadow relative">
              {/* Quote Icon */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-yellow-200">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <span className="text-yellow-600 font-bold text-base sm:text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{testimonial.role}</p>
                  <p className="text-xs sm:text-sm text-yellow-600 font-medium truncate">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center text-white">
            <div>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">{(activeCompanies ? activeCompanies + "+" : false) || '...'}</p>
              <p className="text-xs sm:text-sm lg:text-lg opacity-90">Empresas Activas</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">4.9/5</p>
              <p className="text-xs sm:text-sm lg:text-lg opacity-90">Calificación Promedio</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">98%</p>
              <p className="text-xs sm:text-sm lg:text-lg opacity-90">Tasa de Satisfacción</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">24/7</p>
              <p className="text-xs sm:text-sm lg:text-lg opacity-90">Soporte Disponible</p>
            </div>
          </div>
        </div>

        {/* Logos Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <p className="text-center text-gray-600 mb-4 sm:mb-6 lg:mb-8 font-semibold text-sm sm:text-base">
            Empresas de diversos sectores confían en CloudSuite Pro
          </p>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center gap-3 sm:gap-6 lg:gap-8 opacity-60">
            {/* Placeholder for company logos */}
            {[
              'Retail',
              'Farmacia',
              'Restaurantes',
              'Ferretería',
              'Tecnología',
              'Distribución',
            ].map((industry, index) => (
              <div
                key={index}
                className="bg-gray-200 px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg text-gray-600 font-semibold text-xs sm:text-sm lg:text-base text-center"
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
