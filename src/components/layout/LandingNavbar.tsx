'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LandingNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/welcome" className="flex items-center space-x-2">
              <Image
                src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
                alt="CloudSuite Pro"
                width={360}
                height={100}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/welcome"
              className={`px-4 py-2 font-medium transition-colors ${isActive('/welcome')
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-700 hover:text-yellow-600'
                }`}
            >
              Inicio
            </Link>
            <Link
              href="/como-funciona"
              className={`px-4 py-2 font-medium transition-colors ${isActive('/como-funciona')
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-700 hover:text-yellow-600'
                }`}
            >
              Cómo Funciona
            </Link>
            <Link
              href="/nosotros"
              className={`px-4 py-2 font-medium transition-colors ${isActive('/nosotros')
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-700 hover:text-yellow-600'
                }`}
            >
              Nosotros
            </Link>
            <Link
              href="/precios"
              className={`px-4 py-2 font-medium transition-colors ${isActive('/precios')
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-700 hover:text-yellow-600'
                }`}
            >
              Precios
            </Link>
            <Link
              href="/contacto"
              className={`px-4 py-2 font-medium transition-colors ${isActive('/contacto')
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-700 hover:text-yellow-600'
                }`}
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
            <Link href="/precios">
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
