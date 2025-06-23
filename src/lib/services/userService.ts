import { User, UserCreateInput, UserUpdateInput } from '../types/user';

/**
 * URL base de la API
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Obtener el token de autenticación del localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Opciones por defecto para las peticiones fetch
 */
const getDefaultOptions = (method: string, body?: unknown): RequestInit => {
  const token = getAuthToken();
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `${token}` } : {}),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

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

/**
 * Normaliza un array de usuarios
 */
const normalizeUsers = (users: UserDataFromBackend[]): User[] => {
  return users.map(normalizeUserData);
};

/**
 * Manejar errores de respuesta HTTP
 */
const handleResponse = async (response: Response, isUserData = false) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error desconocido',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Si son datos de usuario, normalizarlos
  if (isUserData) {
    if (Array.isArray(data)) {
      return normalizeUsers(data);
    } else if (data) {
      return normalizeUserData(data);
    }
  }
  
  return data;
};

export class UserService {
  /**
   * Obtener todos los usuarios
   */
  static async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_URL}/users`, getDefaultOptions('GET'));
      return handleResponse(response, true);
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
      const response = await fetch(
        `${API_URL}/users/${id}`,
        getDefaultOptions('GET')
      );
      return handleResponse(response, true);
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
      const response = await fetch(
        `${API_URL}/users`,
        getDefaultOptions('POST', userData)
      );
      return handleResponse(response, true);
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
      const response = await fetch(
        `${API_URL}/users/${id}`,
        getDefaultOptions('PATCH', userData)
      );
      return handleResponse(response, true);
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario
   */
  static async deleteUser(id: number): Promise<{ message: string }> {
    try {
      const response = await fetch(
        `${API_URL}/users/${id}`,
        getDefaultOptions('DELETE')
      );
      return handleResponse(response);
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
