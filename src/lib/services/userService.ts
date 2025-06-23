import { User, UserCreateInput, UserUpdateInput } from '../types/user';
import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';

// Ya no necesitamos definir estas funciones aquí, se obtienen del apiService

/**
 * Manejar errores de respuesta HTTP
 */
/**
 * Tipo para los datos de usuario recibidos del backend
 */
interface UserDataFromBackend {
  id: number;
  name?: string;
  lastName?: string; // Campo del backend
  email: string;
  roleId?: number;
  role?: {
    id: number;
    name: string;
    code: string;
  };
  avatar?: string;
  isActive?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  lastLogin?: string;
  permissionsCount?: number;
}

/**
 * Normaliza los datos de usuario para asegurar que todos los campos de auditoría estén presentes
 * @param userData Datos del usuario recibidos del backend
 */
const normalizeUserData = (userData: UserDataFromBackend): User => {
  // Asegurarnos de que todos los campos esperados estén presentes
  return {
    id: userData.id,
    name: userData.name,
    lastName: userData.lastName,
    email: userData.email,
    roleId: userData.roleId,
    role: userData.role ? {
      id: userData.roleId || 0,
      name: userData.role.name,
      code: userData.role.code,
      description: '',
      version: userData.version,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined
    } : undefined,
    avatar: userData.avatar,
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    version: userData.version,
    createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
    updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
    createdBy: userData.createdBy || undefined,
    updatedBy: userData.updatedBy || undefined,
    lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
    permissionsCount: userData.permissionsCount || 0,
  };
};

// Ya no necesitamos esta función porque normalizamos directamente en cada método

// La función handleResponse ha sido eliminada ya que ahora usamos el servicio de API centralizado

export class UserService {
  /**
   * Obtener todos los usuarios
   */
  static async getUsers(): Promise<User[]> {
    try {
      const data = await apiGet<UserDataFromBackend[]>('/users');
      return data.map(normalizeUserData);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID
   */
  static async getUserById(id: number): Promise<User | null> {
    try {
      const data = await apiGet<UserDataFromBackend>(`/users/${id}`);
      return normalizeUserData(data);
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  static async createUser(userData: UserCreateInput): Promise<User> {
    try {
      const data = await apiPost<UserDataFromBackend>('/users', userData);
      return normalizeUserData(data);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar un usuario existente
   */
  static async updateUser(id: number, userData: UserUpdateInput): Promise<User> {
    try {
      const data = await apiPatch<UserDataFromBackend>(`/users/${id}`, userData);
      return normalizeUserData(data);
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario
   */
  static async deleteUser(id: number): Promise<void> {
    try {
      await apiDelete(`/users/${id}`);
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar el estado de activación de un usuario
   * Nota: Esta funcionalidad requiere implementación específica en el backend
   * Por ahora, usamos el método de actualización general
   */
  static async toggleUserStatus(id: number): Promise<User> {
    try {
      // Primero obtenemos el usuario actual para conocer su estado
      const currentUser = await this.getUserById(id);
      if (!currentUser) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      
      // Luego actualizamos su estado
      return this.updateUser(id, { isActive: !currentUser.isActive });
    } catch (error) {
      console.error(`Error al cambiar estado del usuario ${id}:`, error);
      throw error;
    }
  }
}
