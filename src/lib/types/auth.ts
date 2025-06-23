/**
 * DTO para el login de usuario
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Respuesta del servicio de autenticación
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string; // ID de la empresa a la que pertenece el usuario
  };
}
