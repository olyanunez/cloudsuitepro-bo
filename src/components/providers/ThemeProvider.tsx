'use client';

import { useEffect } from 'react';
import UserPreferencesService from '@/lib/services/userPreferencesService';

/**
 * Función global para aplicar el tema
 * Puede ser llamada desde cualquier parte de la aplicación
 */
export function applyTheme(theme: string) {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // Auto - usar preferencia del sistema
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

/**
 * ThemeProvider - Componente que carga y aplica el tema del usuario
 * Se ejecuta en el layout principal para aplicar el tema en toda la aplicación
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const loadAndApplyTheme = async () => {
      try {
        // Cargar preferencias del usuario
        const preferences = await UserPreferencesService.getPreferences();

        // Aplicar tema
        applyTheme(preferences.theme);
      } catch (error) {
        // Si hay error (ej: usuario no autenticado), usar tema por defecto
        console.log('No se pudieron cargar preferencias de tema, usando valor por defecto');
        applyTheme('light');
      }
    };

    loadAndApplyTheme();

    // Escuchar cambios de tema desde otras partes de la app
    const handleThemeChange = (event: CustomEvent) => {
      applyTheme(event.detail.theme);
    };

    window.addEventListener('themeChange' as any, handleThemeChange);

    return () => {
      window.removeEventListener('themeChange' as any, handleThemeChange);
    };
  }, []);

  return <>{children}</>;
}
