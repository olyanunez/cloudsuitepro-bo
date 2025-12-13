"use client";

import { useEffect, useState, useCallback } from 'react';
import { PermissionService } from '@/lib/services/permissionService';

/**
 * Hook personalizado para gestionar permisos en componentes
 * Proporciona métodos para verificar permisos VIEW, CREATE, UPDATE, DELETE
 * y un método genérico hasPermission para permisos personalizados
 */
export function usePermissions(screenCode: string) {
  const [permissions, setPermissions] = useState({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  const checkPermissions = useCallback(() => {
    setPermissions({
      canView: PermissionService.canView(screenCode),
      canCreate: PermissionService.canCreate(screenCode),
      canUpdate: PermissionService.canUpdate(screenCode),
      canDelete: PermissionService.canDelete(screenCode),
    });
  }, [screenCode]);

  useEffect(() => {
    // Verificar permisos inicialmente
    checkPermissions();

    // Escuchar cambios en localStorage (cuando se actualizan los permisos)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_permissions') {
        checkPermissions();
      }
    };

    // Escuchar evento personalizado para cambios en permisos
    const handlePermissionsUpdate = () => {
      checkPermissions();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('permissionsUpdated', handlePermissionsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate);
    };
  }, [screenCode, checkPermissions]);

  /**
   * Verifica si el usuario tiene un permiso específico para la pantalla actual
   * @param permissionCode Código del permiso (ej: 'CAN_CASH_EXPENSE', 'EXECUTE_SALES')
   * @returns true si el usuario tiene el permiso
   */
  const hasPermission = useCallback((permissionCode: string): boolean => {
    return PermissionService.hasPermission(screenCode, permissionCode);
  }, [screenCode]);

  return { ...permissions, hasPermission };
}

/**
 * Hook para verificar si el usuario tiene al menos un permiso VIEW para acceder
 * Útil para proteger páginas completas
 */
export function useHasViewPermission(screenCode: string): boolean {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      const canView = PermissionService.canView(screenCode);
      setHasPermission(canView);
      setIsLoading(false);
    };

    checkPermission();
  }, [screenCode]);

  return hasPermission;
}
