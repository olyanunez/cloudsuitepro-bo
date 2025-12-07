'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthService } from '@/lib/services/authService';
import ProfileService from '@/lib/services/profileService';
import { useTenant } from '@/lib/contexts/TenantContext';
import { useBranch } from '@/lib/contexts/BranchContext';

export default function LoginPage() {
  // const [email, setEmail] = useState('admin@xotica.com');
  // const [password, setPassword] = useState('admin123');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          // Verificar si el token es válido obteniendo el perfil
          const profile = await ProfileService.getMyProfile();

          if (profile) {
            // Determinar la ruta de redirección basada en la pantalla por defecto del rol
            let redirectPath = '/dashboard'; // Ruta por defecto

            if (profile.role?.defaultScreen?.code) {
              // Mapear el código de la pantalla a la ruta correspondiente
              const screenCodeToPath: Record<string, string> = {
                'DASHBOARD': '/dashboard',
                'INVENTORY': '/inventory/items',
                'POS': '/pos',
                'PRODUCTS': '/inventory/products',
                'REPORTS': '/reports',
                'USERS': '/users',
                'ROLES': '/roles',
                'SETTINGS': '/settings',
                'CUSTOMERS': '/customers',
                'INVOICES': '/invoices',
                'BRANCH': '/inventory/branches',
                'WAREHOUSE': '/inventory/warehouses',
                'CASH_SESSIONS': '/cash-sessions',
                'NCF': '/ncf',
                'ACCOUNTING': '/accounting',
                'PRODUCT_CATEGORY': '/inventory/categories',
                'CREDIT_NOTE': '/credit-notes',
                'MOVEMENTS': '/inventory/movements',
                'INVENTORY_REPORT': '/inventory/reports',
              };

              redirectPath = screenCodeToPath[profile.role.defaultScreen.code] || '/dashboard';
            }

            // Usuario autenticado, redirigir a la pantalla correspondiente
            router.push(redirectPath);
            return;
          }
        }
      } catch (error) {
        // Token inválido o expirado, limpiar
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

    // Basic validation
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      // Llamar al servicio de autenticación para iniciar sesión
      const response = await AuthService.login({
        email,
        password
      });

      // Guardar o eliminar credenciales según la opción "Recordarme"
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }

      // Actualizar el contexto del tenant con el nombre correcto
      if (response.user && response.user.tenantId && response.user.tenant) {
        setCurrentTenant(
          response.user.tenantId.toString(),
          response.user.tenant.name
        );
      }

      // Cargar las sucursales del usuario
      if (response.user && response.user.id) {
        await loadUserBranches(response.user.id);
      }

      // Determinar la ruta de redirección basada en la pantalla por defecto del rol
      let redirectPath = '/dashboard'; // Ruta por defecto

      if (response.user?.role?.defaultScreen?.code) {
        // Mapear el código de la pantalla a la ruta correspondiente
        const screenCodeToPath: Record<string, string> = {
          'DASHBOARD': '/dashboard',
          'INVENTORY': '/inventory/items',
          'POS': '/pos',
          'PRODUCTS': '/inventory/products',
          'REPORTS': '/reports',
          'USERS': '/users',
          'ROLES': '/roles',
          'SETTINGS': '/settings',
          'CUSTOMERS': '/customers',
          'INVOICES': '/invoices',
          'BRANCH': '/inventory/branches',
          'WAREHOUSE': '/inventory/warehouses',
          'CASH_SESSIONS': '/cash-sessions',
          'NCF': '/ncf',
          'ACCOUNTING': '/accounting',
          'PRODUCT_CATEGORY': '/inventory/categories',
          'CREDIT_NOTE': '/credit-notes',
          'MOVEMENTS': '/inventory/movements',
          'INVENTORY_REPORT': '/inventory/reports',
        };

        redirectPath = screenCodeToPath[response.user.role.defaultScreen.code] || '/dashboard';
      }

      // Redirigir a la pantalla correspondiente
      router.push(redirectPath);
    } catch (error: unknown) {
      // Mostrar mensaje de error
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión. Por favor intente nuevamente.';
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/xotica_logo.png"
              alt="Xotica Business"
              width={200}
              height={60}
              priority
              className="h-30 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña
                </label>
                <Link href="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary accent-primary focus:ring-primary focus:ring-offset-primary-50 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Recordarme
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary hover:bg-primary-600 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
