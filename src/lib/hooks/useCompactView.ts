'use client';

import { useState, useEffect } from 'react';
import UserPreferencesService from '@/lib/services/userPreferencesService';

/**
 * Hook para obtener la preferencia de vista compacta de tablas
 * Escucha cambios en las preferencias del usuario
 */
export function useCompactView() {
  const [compactView, setCompactView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar preferencia inicial
    async function loadPreference() {
      try {
        const preferences = await UserPreferencesService.getPreferences();
        setCompactView(preferences.compactView);
      } catch (error) {
        console.error('Error loading compact view preference:', error);
        setCompactView(false);
      } finally {
        setLoading(false);
      }
    }

    loadPreference();

    // Escuchar cambios en las preferencias
    const handlePreferenceChange = (event: CustomEvent) => {
      if (event.detail.compactView !== undefined) {
        setCompactView(event.detail.compactView);
      }
    };

    window.addEventListener('preferencesChanged' as any, handlePreferenceChange);

    return () => {
      window.removeEventListener('preferencesChanged' as any, handlePreferenceChange);
    };
  }, []);

  return { compactView, loading };
}
