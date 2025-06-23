"use client";

/**
 * Servicio centralizado para realizar peticiones a la API
 * Este servicio maneja automáticamente los headers de autenticación
 * y el tenantId para soporte multi-empresa
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Obtiene el token de autenticación del localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Obtiene el tenantId (ID de la empresa) del localStorage
 */
export const getTenantId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tenant_id');
  }
  return null;
};

/**
 * Establece el tenantId (ID de la empresa) en localStorage
 */
export const setTenantId = (tenantId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tenant_id', tenantId);
  }
};

/**
 * Opciones por defecto para todas las peticiones fetch
 * Incluye automáticamente el token de autenticación y el tenantId si están disponibles
 */
export const getDefaultOptions = (method: string, body?: unknown): RequestInit => {
  const token = getAuthToken();
  const tenantId = getTenantId();
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * Realiza una petición GET a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @returns Promise con la respuesta
 */
export const apiGet = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, getDefaultOptions('GET'));
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error desconocido',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Realiza una petición POST a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param data Datos a enviar en el cuerpo de la petición
 * @returns Promise con la respuesta
 */
export const apiPost = async <T>(endpoint: string, data: unknown): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, getDefaultOptions('POST', data));
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error desconocido',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Realiza una petición PATCH a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param data Datos a enviar en el cuerpo de la petición
 * @returns Promise con la respuesta
 */
export const apiPatch = async <T>(endpoint: string, data: unknown): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, getDefaultOptions('PATCH', data));
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error desconocido',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Realiza una petición DELETE a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @returns Promise con la respuesta
 */
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, getDefaultOptions('DELETE'));
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error desconocido',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  return await response.json();
};
