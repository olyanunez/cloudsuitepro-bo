'use client';

import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

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
      'La facturación electrónica y el sistema POS son increíblemente rápidos. Nuestros cajeros se adaptaron en menos de una hora. El soporte técnico es excelente, siempre disponibles cuando los necesitamos.',
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
      'La generación automática de reportes fiscales nos facilita enormemente el trabajo contable. La integración con facturación electrónica funciona sin problemas. Muy recomendado.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-yellow-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 500 empresas confían en CloudSuite Pro para gestionar sus operaciones diarias
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow relative">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-yellow-200">
                <Quote className="h-10 w-10" fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-yellow-600 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-yellow-600 font-medium">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-5xl font-bold mb-2">500+</p>
              <p className="text-lg opacity-90">Empresas Activas</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">4.9/5</p>
              <p className="text-lg opacity-90">Calificación Promedio</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">98%</p>
              <p className="text-lg opacity-90">Tasa de Satisfacción</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">24/7</p>
              <p className="text-lg opacity-90">Soporte Disponible</p>
            </div>
          </div>
        </div>

        {/* Logos Section */}
        <div className="mt-16">
          <p className="text-center text-gray-600 mb-8 font-semibold">
            Empresas de diversos sectores confían en CloudSuite Pro
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
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
                className="bg-gray-200 px-8 py-4 rounded-lg text-gray-600 font-semibold"
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
