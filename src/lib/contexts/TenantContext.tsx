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

  // Cargar el tenantId del localStorage al iniciar
  useEffect(() => {
    const storedTenantId = getTenantId();
    if (storedTenantId) {
      setTenantIdState(storedTenantId);
      // Aquí podrías hacer una llamada a la API para obtener el nombre de la empresa
      // basado en el ID, por ahora usamos un placeholder
      setTenantName(`Empresa ${storedTenantId}`);
    }
  }, []);

  // Función para establecer el tenant actual
  const setCurrentTenant = (id: string, name: string) => {
    setTenantId(id);
    setTenantIdState(id);
    setTenantName(name);
  };

  // Función para limpiar el tenant
  const clearTenant = () => {
    localStorage.removeItem('tenant_id');
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
