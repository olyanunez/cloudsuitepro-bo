'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/lib/services/authService';
import ProfileService from '@/lib/services/profileService';
import { useTenant } from '@/lib/contexts/TenantContext';
import { useBranch } from '@/lib/contexts/BranchContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { setCurrentTenant } = useTenant();
  const { loadUserBranches } = useBranch();

  // Cargar credenciales guardadas al montar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        if (token) {
          const profile = await ProfileService.getMyProfile();

          if (profile) {
            router.push('/home');
            return;
          }
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('tenant_id');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Por favor complete todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      const response = await AuthService.login({
        email,
        password
      });

      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }

      if (response.user && response.user.tenantId && response.user.tenant) {
        setCurrentTenant(
          response.user.tenantId.toString(),
          response.user.tenant.name
        );
      }

      if (response.user && response.user.id) {
        await loadUserBranches(response.user.id);
      }

      router.push('/home');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión. Por favor intente nuevamente.';
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo - Branding (solo en desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-300 relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-gray-900">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
              alt="CloudSuite Pro"
              width={280}
              height={80}
              priority
              className="h-16 w-auto drop-shadow-md"
            />
          </div>

          {/* Texto de bienvenida */}
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">
              Bienvenido de vuelta
            </h1>
            <p className="text-lg text-gray-700">
              Gestiona tu negocio de forma inteligente con nuestra plataforma todo-en-uno
            </p>
          </div>

          {/* Features */}
          <div className="mt-12 space-y-4 text-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Punto de venta rápido y eficiente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Control de inventario en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Reportes y análisis detallados</span>
            </div>
          </div>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/20 rounded-full" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 rounded-full" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 relative">
        {/* Botón para volver */}
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>
        </div>

        {/* Contenedor del formulario */}
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src="/branding/transparente/icon/cloudsuitepro_short_logo1.png"
              alt="CloudSuite Pro"
              width={200}
              height={60}
              priority
              className="h-12 w-auto"
            />
          </div>

          {/* Card del formulario */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Iniciar Sesión
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Formulario */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contraseña
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Recordar mis datos
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary hover:bg-primary/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                  ¿Nuevo en CloudSuite Pro?
                </span>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <Link
                href="/precios"
                className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              >
                Crear una cuenta
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
