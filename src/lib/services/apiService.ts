"use client";

/**
 * Servicio centralizado para realizar peticiones a la API
 * Este servicio maneja automáticamente los headers de autenticación
 * y el tenantId para soporte multi-empresa
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
 * Verifica si hay un token válido
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Función para construir los headers de la petición
 */
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const tenantId = getTenantId();
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  return headers;
};

/**
 * Maneja los errores de la API
 */
const handleApiError = async (response: Response) => {
  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: 'Error en la petición' };
  }

  // Crear un error personalizado con toda la información del backend
  const error: any = new Error(errorData.message || 'Error en la petición');
  error.statusCode = errorData.statusCode || response.status;
  error.error = errorData.error;
  error.data = errorData;
  throw error;
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
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Realiza una petición POST a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param data Datos a enviar en el cuerpo de la petición
 * @returns Promise con la respuesta
 */
export const apiPost = async <T>(endpoint: string, data?: any): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Realiza una petición PUT a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param data Datos a enviar en el cuerpo de la petición
 * @returns Promise con la respuesta
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Realiza una petición PATCH a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param data Datos a enviar en el cuerpo de la petición
 * @returns Promise con la respuesta
 */
export const apiPatch = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Realiza una petición DELETE a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @returns Promise con la respuesta
 */
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Función para construir los headers de la petición para FormData
 * No incluye Content-Type para que el navegador lo establezca automáticamente con boundary
 */
const getFormDataHeaders = () => {
  const headers: Record<string, string> = {};

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const tenantId = getTenantId();
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  return headers;
};

/**
 * Realiza una petición POST a la API con FormData (para archivos)
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param formData FormData a enviar
 * @returns Promise con la respuesta
 */
export const apiPostFormData = async <T>(endpoint: string, formData: FormData): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: getFormDataHeaders(),
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Realiza una petición PATCH a la API con FormData (para archivos)
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param formData FormData a enviar
 * @returns Promise con la respuesta
 */
export const apiPatchFormData = async <T>(endpoint: string, formData: FormData): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: getFormDataHeaders(),
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
