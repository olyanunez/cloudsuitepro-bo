'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/xotica_logo.png"
                alt="Xotica Business"
                width={360}
                height={100}
                priority
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/como-funciona"
              className="px-4 py-2 text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Cómo Funciona
            </Link>
            <Link
              href="/nosotros"
              className="px-4 py-2 text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="/precios"
              className="px-4 py-2 text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Precios
            </Link>
            <Link
              href="/contacto"
              className="px-4 py-2 text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* Botones de autenticación - a la derecha */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button
                style={{
                  backgroundColor: '#eab308',
                  color: 'white',
                  borderColor: '#eab308'
                }}
                className="hover:opacity-90 transition-opacity px-4 py-2 font-medium"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
