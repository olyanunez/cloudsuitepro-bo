'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/xotica_short_logo.png"
                alt="Xotica"
                width={60}
                height={60}
                className="h-15 w-15"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              La plataforma todo-en-uno para gestionar tu negocio de manera profesional y eficiente.
            </p>
            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/precios" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Registrarse
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Centro de Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>contacto@xotica.com</p>
                  <p>soporte@xotica.com</p>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>+1 (809) 555-0100</p>
                  <p>+1 (809) 555-0200</p>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>Av. Winston Churchill</p>
                  <p>Santo Domingo, RD</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Xotica. Todos los derechos reservados.
            </p>

            {/* Legal Links */}
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Términos de Servicio
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
