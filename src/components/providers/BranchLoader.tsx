"use client";

import { useEffect } from 'react';
import { useBranch } from '@/lib/contexts/BranchContext';
import { AuthService } from '@/lib/services/authService';

/**
 * Componente que carga las sucursales del usuario automáticamente
 * cuando está autenticado
 */
export function BranchLoader() {
  const { loadUserBranches, userBranches } = useBranch();

  useEffect(() => {
    // Solo cargar si el usuario está autenticado y no hay sucursales cargadas
    if (AuthService.isAuthenticated() && userBranches.length === 0) {
      console.log('🔄 BranchLoader: User is authenticated, loading branches...');

      // Obtener el userId del token JWT
      const token = AuthService.getToken();
      if (token) {
        try {
          // Decodificar el token para obtener el userId
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);

          console.log('📋 Decoded token payload:', payload);

          if (payload.sub) {
            console.log('👤 Loading branches for userId:', payload.sub);
            loadUserBranches(payload.sub);
          }
        } catch (error) {
          console.error('❌ Error decoding token:', error);
        }
      }
    }
  }, []); // Solo ejecutar una vez al montar

  return null; // Este componente no renderiza nada
}
