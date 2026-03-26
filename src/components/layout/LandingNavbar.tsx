'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function LandingNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { href: '/welcome', label: 'Inicio' },
    { href: '/como-funciona', label: 'Cómo Funciona' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/precios', label: 'Precios' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/welcome" className="flex items-center space-x-2">
              <Image
                src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
                alt="CloudSuite Pro"
                width={360}
                height={100}
                priority
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 font-medium transition-colors ${isActive(link.href)
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-700 hover:text-yellow-600'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Botones de autenticación - Desktop */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 text-sm sm:text-base px-2 sm:px-4">
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
                className="hover:opacity-90 transition-opacity px-3 sm:px-4 py-2 font-medium text-sm sm:text-base"
              >
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-3">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 font-medium transition-colors rounded-lg ${isActive(link.href)
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-3 px-4 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/precios" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    style={{
                      backgroundColor: '#eab308',
                      color: 'white',
                      borderColor: '#eab308'
                    }}
                    className="w-full hover:opacity-90"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
