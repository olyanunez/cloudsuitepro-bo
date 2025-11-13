"use client";

import { useEffect, useState } from 'react';
import { PermissionService } from '@/lib/services/permissionService';

/**
 * Hook personalizado para gestionar permisos en componentes
 * Proporciona métodos para verificar permisos VIEW, CREATE, UPDATE, DELETE
 */
export function usePermissions(screenCode: string) {
  const [permissions, setPermissions] = useState({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  useEffect(() => {
    // Verificar todos los permisos para esta pantalla
    setPermissions({
      canView: PermissionService.canView(screenCode),
      canCreate: PermissionService.canCreate(screenCode),
      canUpdate: PermissionService.canUpdate(screenCode),
      canDelete: PermissionService.canDelete(screenCode),
    });
  }, [screenCode]);

  return permissions;
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
