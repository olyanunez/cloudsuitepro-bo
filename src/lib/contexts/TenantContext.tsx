"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTenantId, setTenantId } from '../services/apiService';

// Definir la interfaz para el contexto
interface TenantContextType {
  tenantId: string | null;
  tenantName: string | null;
  setCurrentTenant: (id: string, name: string) => void;
  clearTenant: () => void;
}

// Crear el contexto con un valor por defecto
const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  tenantName: null,
  setCurrentTenant: () => {},
  clearTenant: () => {},
});

// Hook personalizado para usar el contexto
export const useTenant = () => useContext(TenantContext);

interface TenantProviderProps {
  children: ReactNode;
}

// Componente proveedor que envuelve la aplicación
export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);

  // Cargar el tenantId y tenantName del localStorage al iniciar
  useEffect(() => {
    const loadTenantData = () => {
      const storedTenantId = getTenantId();
      const storedTenantName = localStorage.getItem('tenant_name');
      console.log('Loading tenant data from localStorage:');
      console.log('- storedTenantId:', storedTenantId);
      console.log('- storedTenantName:', storedTenantName);

      if (storedTenantId) {
        setTenantIdState(storedTenantId);
        const finalTenantName = storedTenantName || `Empresa ${storedTenantId}`;
        console.log('- finalTenantName:', finalTenantName);
        setTenantName(finalTenantName);
      }
    };

    loadTenantData();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tenant_id' || e.key === 'tenant_name') {
        console.log('Storage changed:', e.key, '=', e.newValue);
        loadTenantData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función para establecer el tenant actual
  const setCurrentTenant = (id: string, name: string) => {
    console.log('setCurrentTenant called with:', { id, name });
    setTenantId(id);
    setTenantIdState(id);
    setTenantName(name);
    localStorage.setItem('tenant_name', name);
  };

  // Función para limpiar el tenant
  const clearTenant = () => {
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('tenant_name');
    setTenantIdState(null);
    setTenantName(null);
  };

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        tenantName,
        setCurrentTenant,
        clearTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;
