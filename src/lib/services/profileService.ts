import { apiGet, apiPatch } from './apiService';

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  lastName: string | null;
  avatar: string | null;
  isActive: boolean;
  roleId: number | null;
  tenantId: number;
  role?: {
    id: number;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

class ProfileService {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getMyProfile(): Promise<UserProfile> {
    return await apiGet<UserProfile>('/users/me');
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  async updateMyProfile(data: UpdateProfileDto): Promise<UserProfile> {
    return await apiPatch<UserProfile>('/users/me', data);
  }
}

export default new ProfileService();
