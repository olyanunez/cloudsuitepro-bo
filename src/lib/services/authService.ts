"use client";

import { AuthResponse, LoginDto } from '../types/auth';
import { apiGet } from './apiService';
import { PermissionService } from './permissionService';

/**
 * Interfaz para el perfil del usuario
 */
interface UserProfile {
  userId: string;
  email: string;
  role: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    role: {
      id: number;
      name: string;
    };
    permissions: any[];
    tenantId: number;
  };
}

interface RegisterData {
  tenant: {
    name: string;
    email: string;
    taxId: string;
    address?: string;
    phone?: string;
    description?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    role: {
      id: number;
      name: string;
    };
    tenantId: number;
  };
  tenant: {
    id: number;
    name: string;
    email: string;
    taxId: string;
  };
}

/**
 * Servicio de autenticación
 * Integra el servicio de login del backend
 */
export class AuthService {
  /**
   * Iniciar sesión con email y contraseña
   * @param loginDto Datos de inicio de sesión
   * @returns Respuesta con token y datos del usuario
   */
  static async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Nota: No podemos usar apiPost aquí porque el token aún no existe
      // y apiService siempre intenta incluir el token si está disponible
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginDto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error desconocido',
        }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();

      console.log('Login response data:', data);
      console.log('Tenant object:', data.user?.tenant);
      console.log('Tenant name:', data.user?.tenant?.name);

      // Guardar el token en localStorage para futuras peticiones
      if (data && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }

      // Guardar el tenantId si está disponible
      if (data && data.user && data.user.tenantId) {
        localStorage.setItem('tenant_id', data.user.tenantId.toString());
        const tenantName = data.user.tenant?.name || '';
        console.log('Saving tenant_name to localStorage:', tenantName);
        localStorage.setItem('tenant_name', tenantName);
      }

      // Guardar permisos del usuario
      if (data && data.user && data.user.permissions) {
        console.log('Saving user permissions:', data.user.permissions);
        PermissionService.setUserPermissions(data.user.permissions);
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registrar empresa y usuario administrador
   * @param registerData Datos de registro
   * @returns Respuesta con mensaje de confirmación y datos del usuario y tenant creados
   */
  static async register(registerData: RegisterData): Promise<RegisterResponse> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar la empresa');
      }

      const data = await response.json();

      // Ya no guardamos el token porque el registro no devuelve uno
      // El usuario debe iniciar sesión después del registro

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('tenant_name');
    localStorage.removeItem('active_branch_id');
    localStorage.removeItem('active_branch_name');
    PermissionService.clearUserPermissions();
  }

  /**
   * Obtener el token de autenticación
   * @returns Token de autenticación
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns true si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtener el perfil del usuario autenticado
   * @returns Datos del perfil del usuario
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Usamos apiGet que ya incluye el token en el header
      return await apiGet<UserProfile>('/auth/validate');
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }
}
