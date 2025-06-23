import { AuthResponse, LoginDto } from '../types/auth';
import { apiGet } from './apiService';

/**
 * Interfaz para el perfil del usuario
 */
interface UserProfile {
  userId: string;
  email: string;
  role: string;
}

// Ya no necesitamos definir API_URL aquí, se obtiene del apiService

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
      
      // Guardar el token en localStorage para futuras peticiones
      if (data && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  static logout(): void {
    localStorage.removeItem('auth_token');
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
