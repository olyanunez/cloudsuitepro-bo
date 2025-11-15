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
    id: number;
    email: string;
    name: string;
    roleId: number;
    tenantId: number;
    isActive: boolean;
    lastLogin?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    role: {
      id: number;
      name: string;
      defaultScreen?: {
        id: number;
        name: string;
        code: string;
        description?: string;
      };
    };
    tenant?: {
      id: number;
      name: string;
      email?: string;
      taxId?: string;
      address?: string;
      phone?: string;
      description?: string;
      isActive?: boolean;
    };
    permissions?: Array<{
      id: number;
      screenName: string;
      permissionName: string;
      screenCode: string;
      permissionCode: string;
      description: string | null;
      isActive: boolean;
    }>;
  };
}
