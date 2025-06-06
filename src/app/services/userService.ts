'use client';

import { User } from '../interfaces/User/IUser';
import { API_CONFIG } from './config';

// Clase para manejar errores de la API
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Función para generar datos simulados (mock)
const generateMockUsers = (): User[] => {
  // Usamos una fecha estática para evitar problemas de hidratación
  const now = new Date('2023-01-01').toISOString();
  
  return Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: `User${index + 1}`,
    password: `password${index + 1}`,
    email: `user${index + 1}@example.com`,
    roleId: index % 5 === 0 ? 1 : 2, // Alterna roles entre 1 y 2
    wasActivated: index % 10 > 3, // 70% de los usuarios están activados
    enabled: index % 10 > 2, // 80% de los usuarios están habilitados
    createdAt: now,
    modifiedAt: now,
    createdById: index > 0 ? 1 : undefined,
    createdBy: index > 0 ? { 
      id: 1, 
      name: "SuperAdmin", 
      password: "admin123", 
      email: "admin@example.com", 
      wasActivated: true, 
      enabled: true, 
      createdAt: now, 
      modifiedAt: now 
    } : undefined,
    updatedById: index > 0 ? 1 : undefined,
    updatedBy: index > 0 ? { 
      id: 1, 
      name: "SuperAdmin", 
      password: "admin123", 
      email: "admin@example.com", 
      wasActivated: true, 
      enabled: true, 
      createdAt: now, 
      modifiedAt: now 
    } : undefined,
  }));
};

// Servicio de usuarios
export const UserService = {
  // Obtener todos los usuarios
  getUsers: async (): Promise<User[]> => {
    try {
      // Si estamos en modo simulación, devolvemos datos simulados
      if (API_CONFIG.USE_MOCK) {
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockUsers();
      }
      
      // Si no, hacemos la petición real a la API
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
      
      if (!response.ok) {
        throw new ApiError(`Error al obtener usuarios: ${response.statusText}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en el servicio de usuarios:', error);
      // Si hay un error en la API real, podemos devolver datos simulados como fallback
      if (error instanceof ApiError) {
        throw error; // Propagamos el error de la API
      }
      return generateMockUsers(); // Fallback a datos simulados en caso de error de red
    }
  },
  
  // Obtener un usuario por ID
  getUserById: async (id: number): Promise<User> => {
    try {
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const users = generateMockUsers();
        const user = users.find(u => u.id === id);
        
        if (!user) {
          throw new ApiError(`Usuario con ID ${id} no encontrado`, 404);
        }
        
        return user;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`);
      
      if (!response.ok) {
        throw new ApiError(`Error al obtener usuario: ${response.statusText}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`No se pudo obtener el usuario ${id}`);
    }
  },
  
  // Crear un nuevo usuario
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'modifiedAt'>): Promise<User> => {
    try {
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 700));
        const users = generateMockUsers();
        const newId = Math.max(...users.map(u => u.id)) + 1;
        const now = new Date().toISOString();
        
        const newUser: User = {
          ...userData,
          id: newId,
          createdAt: now,
          modifiedAt: now,
        };
        
        return newUser;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new ApiError(`Error al crear usuario: ${response.statusText}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('No se pudo crear el usuario');
    }
  },
  
  // Actualizar un usuario existente
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const users = generateMockUsers();
        const userIndex = users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
          throw new ApiError(`Usuario con ID ${id} no encontrado`, 404);
        }
        
        const now = new Date().toISOString();
        const updatedUser: User = {
          ...users[userIndex],
          ...userData,
          modifiedAt: now,
        };
        
        return updatedUser;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new ApiError(`Error al actualizar usuario: ${response.statusText}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`No se pudo actualizar el usuario ${id}`);
    }
  },
  
  // Eliminar un usuario
  deleteUser: async (id: number): Promise<void> => {
    try {
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const users = generateMockUsers();
        const userIndex = users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
          throw new ApiError(`Usuario con ID ${id} no encontrado`, 404);
        }
        
        return;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new ApiError(`Error al eliminar usuario: ${response.statusText}`, response.status);
      }
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`No se pudo eliminar el usuario ${id}`);
    }
  },
};
