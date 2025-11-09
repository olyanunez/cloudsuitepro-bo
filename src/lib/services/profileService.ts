import { apiGet, apiPatch, apiPatchFormData, apiPost } from './apiService';

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
   * @param data Datos del perfil a actualizar
   * @param avatarFile Archivo de imagen del avatar (opcional)
   */
  async updateMyProfile(data: UpdateProfileDto, avatarFile?: File | null): Promise<UserProfile> {
    // Si hay un archivo, usamos FormData
    if (avatarFile) {
      const formData = new FormData();

      // Agregar campos del perfil
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.lastName !== undefined) formData.append('lastName', data.lastName);
      if (data.email !== undefined) formData.append('email', data.email);

      // Agregar archivo de avatar
      formData.append('avatar', avatarFile);

      return await apiPatchFormData<UserProfile>('/users/me', formData);
    }

    // Si no hay archivo, usamos la petición normal
    return await apiPatch<UserProfile>('/users/me', data);
  }

  /**
   * Cambiar contraseña del usuario autenticado
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return await apiPost<{ message: string }>('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
  }
}

export default new ProfileService();
