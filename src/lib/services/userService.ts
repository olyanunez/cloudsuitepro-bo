import { User, UserCreateInput, UserUpdateInput, AssignBranchesDto, UserBranch } from '../types/user';
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
    _count?: {
      roleScreenPermissions?: number;
    };
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
  tenantId?: string; // ID de la empresa a la que pertenece el usuario
  userBranches?: UserBranch[]; // Sucursales asignadas al usuario
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
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
      _count: userData.role._count
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
    tenantId: userData.tenantId,
    userBranches: userData.userBranches,
  };
};

// Ya no necesitamos esta función porque normalizamos directamente en cada método

// La función handleResponse ha sido eliminada ya que ahora usamos el servicio de API centralizado

export class UserService {
  /**
   * Obtener todos los usuarios
   * Si se proporciona un tenantId, filtra los usuarios por esa empresa
   */
  static async getUsers(tenantId?: string): Promise<User[]> {
    try {
      // Si el tenantId se proporciona explícitamente, lo usamos
      // Si no, el apiGet incluirá automáticamente el tenantId del localStorage en los headers
      const endpoint = tenantId ? `/users?tenantId=${tenantId}` : '/users';
      const data = await apiGet<UserDataFromBackend[]>(endpoint);
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
   * Si no se proporciona un tenantId en userData, se usará el del localStorage
   */
  static async createUser(userData: UserCreateInput): Promise<User> {
    try {
      // Si el usuario no tiene tenantId, usamos el del localStorage
      if (!userData.tenantId) {
        const tenantId = localStorage.getItem('tenant_id');
        if (tenantId) {
          userData = { ...userData, tenantId };
        }
      }
      
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

  /**
   * Asignar sucursales a un usuario
   */
  static async assignBranches(userId: number, assignBranchesDto: AssignBranchesDto): Promise<User> {
    try {
      const data = await apiPost<UserDataFromBackend>(`/users/${userId}/branches`, assignBranchesDto);
      return normalizeUserData(data);
    } catch (error) {
      console.error(`Error al asignar sucursales al usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Desasignar una sucursal de un usuario
   */
  static async unassignBranch(userId: number, branchId: number): Promise<User> {
    try {
      const data = await apiDelete<UserDataFromBackend>(`/users/${userId}/branches/${branchId}`);
      return normalizeUserData(data);
    } catch (error) {
      console.error(`Error al desasignar sucursal ${branchId} del usuario ${userId}:`, error);
      throw error;
    }
  }
}
