"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionService } from '@/lib/services/permissionService';
import { AlertCircle } from 'lucide-react';

interface ProtectedPageProps {
  children: React.ReactNode;
  screenCode: string;
  requiredPermission?: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE';
}

/**
 * Componente para proteger páginas que requieren permisos específicos
 * Si el usuario no tiene el permiso requerido, se muestra un mensaje de acceso denegado
 */
export default function ProtectedPage({
  children,
  screenCode,
  requiredPermission = 'VIEW',
}: ProtectedPageProps) {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      let permitted = false;

      switch (requiredPermission) {
        case 'VIEW':
          permitted = PermissionService.canView(screenCode);
          break;
        case 'CREATE':
          permitted = PermissionService.canCreate(screenCode);
          break;
        case 'UPDATE':
          permitted = PermissionService.canUpdate(screenCode);
          break;
        case 'DELETE':
          permitted = PermissionService.canDelete(screenCode);
          break;
        default:
          permitted = false;
      }

      setHasPermission(permitted);
      setIsLoading(false);
    };

    checkPermission();
  }, [screenCode, requiredPermission]);

  // Mostrar loading mientras se verifica el permiso
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene permiso, mostrar mensaje de acceso denegado
  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No tienes permisos para acceder a esta página. Por favor, contacta con tu
              administrador si crees que esto es un error.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene permiso, renderizar el contenido
  return <>{children}</>;
}
