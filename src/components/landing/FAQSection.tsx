'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '¿Necesito instalar algún software?',
    answer: 'CloudSuite Pro es una plataforma 100% en la nube. Solo necesitas un navegador web y conexión a internet para acceder desde cualquier dispositivo. Opcionalmente, si deseas imprimir recibos en impresoras térmicas, puedes descargar nuestra aplicación de impresión gratuita.',
  },
  {
    question: '¿Cuánto tiempo toma implementar el sistema?',
    answer: 'La configuración inicial toma aproximadamente 5 minutos. La carga de productos y capacitación del equipo puede tomar de 1 a 3 horas dependiendo del tamaño de tu negocio.',
  },
  {
    question: '¿Puedo gestionar múltiples sucursales?',
    answer: 'Sí, CloudSuite Pro te permite gestionar múltiples sucursales y almacenes desde una sola cuenta. Puedes ver reportes consolidados o individuales por ubicación.',
  },
  {
    question: '¿Los datos de mi empresa están seguros?',
    answer: 'Absolutamente. Utilizamos encriptación de nivel bancario, respaldos automáticos diarios y servidores seguros en la nube. Tus datos están protegidos 24/7.',
  },
  {
    question: '¿Puedo importar mi inventario actual?',
    answer: 'Sí, ofrecemos herramientas de importación masiva mediante archivos Excel/CSV. También podemos ayudarte a migrar datos de otros sistemas.',
  },
  {
    question: '¿Qué tipo de soporte técnico ofrecen?',
    answer: 'Ofrecemos soporte por email, chat en vivo y teléfono. Los clientes premium tienen acceso a soporte 24/7 y un gerente de cuenta dedicado.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí, no hay contratos de permanencia. Puedes cancelar tu suscripción en cualquier momento y mantener acceso hasta el final del período pagado.',
  },
  {
    question: '¿Funciona offline?',
    answer: 'Actualmente CloudSuite Pro requiere conexión a internet. Estamos trabajando en una versión offline para el sistema POS que estará disponible próximamente.',
  },
  {
    question: '¿Puedo personalizar facturas y reportes?',
    answer: 'Sí, puedes personalizar tus facturas con tu logo y datos fiscales. Los reportes también pueden filtrarse y exportarse según tus necesidades.',
  },
  {
    question: '¿Hay límite de usuarios o productos?',
    answer: 'Los límites dependen del plan contratado. El plan básico incluye 3 usuarios y 500 productos. Los planes superiores ofrecen usuarios y productos ilimitados.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-yellow-100 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center">
              <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-2">
            Encuentra respuestas a las preguntas más comunes sobre CloudSuite Pro
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 lg:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-3 sm:pr-4 text-sm sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'transform rotate-180' : ''
                    }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-6 sm:mt-8 lg:mt-12 text-center bg-yellow-50 rounded-lg p-4 sm:p-6 lg:p-8">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Nuestro equipo está disponible para responder todas tus preguntas
          </p>
          <a
            href="/contacto"
            className="text-yellow-600 hover:text-yellow-700 font-semibold inline-flex items-center text-sm sm:text-base"
          >
            Contáctanos
            <ChevronDown className="h-4 w-4 ml-1 transform rotate-[-90deg]" />
          </a>
        </div>
      </div>
    </section>
  );
}
