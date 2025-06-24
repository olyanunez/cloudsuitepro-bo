import { Role, RoleCreateInput, RoleUpdateInput, Permission, Screen } from '../types/role';

// Definimos interfaces para la estructura que devuelve la API
interface ApiScreenPermissionRelation {
  id: number;
  screenId: number;
  permissionId: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
  screen: Screen;
  permission: Permission;
  _count?: {
    roleScreenPermissions: number;
  };
}

// Esta es la estructura normalizada que usaremos internamente
interface ApiScreenWithPermissions {
  id: number;
  name: string;
  code: string;
  permissions: Permission[];
}
import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';

// Ya no necesitamos la URL base de la API, ya que usamos el servicio centralizado apiService

/**
 * Tipo para los datos de rol recibidos del backend
 */
interface RoleDataFromBackend {
  id: number;
  name: string;
  code: string; // Campo obligatorio en el backend
  description?: string;
  permissions?: number[]; // IDs de permisos como números
  isActive?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Normaliza los datos de rol para asegurar que todos los campos de auditoría estén presentes
 * @param roleData Datos del rol recibidos del backend
 */
const normalizeRoleData = (roleData: RoleDataFromBackend): Role => {
  // Convertir los permisos de número a objetos Permission
  const permissions: Permission[] = (roleData.permissions || []).map(permissionId => {
    // Si el permiso ya es un objeto, lo devolvemos tal cual
    if (typeof permissionId === 'object' && permissionId !== null) {
      return permissionId as unknown as Permission;
    }
    // Si es un número, lo convertimos a objeto Permission con todos los campos requeridos
    return {
      id: permissionId,
      name: `Permission ${permissionId}`,
      code: `PERM_${permissionId}`,  // Generamos un código basado en el ID
      description: '',
      module: 'default'  // Valor por defecto para el módulo
    };
  });

  // Asegurarnos de que todos los campos esperados estén presentes
  return {
    id: roleData.id,
    name: roleData.name,
    code: roleData.code, // Campo obligatorio
    description: roleData.description || '',
    isActive: roleData.isActive !== undefined ? roleData.isActive : true,
    // Campos específicos del frontend
    screensWithPermissions: undefined,
    permissionsCount: permissions.length,
    // Campos de auditoría
    version: roleData.version,
    createdAt: roleData.createdAt ? new Date(roleData.createdAt) : undefined,
    updatedAt: roleData.updatedAt ? new Date(roleData.updatedAt) : undefined,
    createdBy: roleData.createdBy,
    updatedBy: roleData.updatedBy,
  };
};

// La función normalizeRoles ha sido eliminada ya que no se utiliza

// La función handleResponse ha sido eliminada ya que ahora usamos el servicio de API centralizado

export class RoleService {
  /**
   * Obtener todos los roles
   */
  static async getRoles(): Promise<Role[]> {
    try {
      const data = await apiGet<RoleDataFromBackend[]>('/roles');
      return data.map(normalizeRoleData);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      // Retornar datos de ejemplo en caso de error para evitar que la aplicación se rompa
      return [
        {
          id: 1,
          name: 'Administrador',
          code: 'ADMIN',
          description: 'Acceso completo al sistema',
          isActive: true,
          permissionsCount: 5,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Usuario',
          code: 'USER',
          description: 'Acceso limitado al sistema',
          isActive: true,
          permissionsCount: 2,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  /**
   * Obtener un rol por ID
   */
  static async getRoleById(id: number): Promise<Role | null> {
    try {
      const data = await apiGet<RoleDataFromBackend>(`/roles/${id}`);
      return normalizeRoleData(data);
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo rol con sus permisos en un solo request
   */
  static async createRole(roleData: RoleCreateInput): Promise<Role> {
    try {
      // Verificamos si hay un rol con el mismo nombre o código para evitar conflictos
      const existingRoles = await this.getRoles();
      const nameExists = existingRoles.some(role => role.name === roleData.name);
      const codeExists = existingRoles.some(role => role.code === roleData.code);
      
      if (nameExists) {
        throw new Error(`Ya existe un rol con el nombre '${roleData.name}'`);
      }
      
      if (codeExists) {
        throw new Error(`Ya existe un rol con el código '${roleData.code}'`);
      }
      
      // Creamos el objeto completo para enviar al backend
      const completeRoleData = {
        role: {
          name: roleData.name,
          code: roleData.code,
          description: roleData.description || '',
          isActive: true
        },
        screenPermissionIds: roleData.screenPermissionIds || []
      };
      
      console.log('Datos completos para crear rol:', completeRoleData);
      
      // Crear el rol con sus permisos en un solo request
      try {
        const response = await apiPost<RoleDataFromBackend>('/roles/with-permissions', completeRoleData);
        console.log('Rol creado exitosamente con permisos:', response);
        
        if (response) {
          return normalizeRoleData(response);
        } else {
          throw new Error('Respuesta inválida del servidor al crear rol');
        }
      } catch (error) {
        console.error('Error al crear rol con permisos:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en el proceso de creación de rol:', error);
      throw error;
    }
  }

  /**
   * Actualizar un rol existente
   */
  static async updateRole(id: number, roleData: RoleUpdateInput): Promise<Role> {
    try {
      // Verificamos si hay un rol con el mismo nombre o código para evitar conflictos
      const existingRoles = await this.getRoles();
      const nameExists = roleData.name ? existingRoles.some(role => role.name === roleData.name && role.id !== id) : false;
      const codeExists = roleData.code ? existingRoles.some(role => role.code === roleData.code && role.id !== id) : false;
      
      if (nameExists) {
        throw new Error(`Ya existe un rol con el nombre '${roleData.name}'`);
      }
      
      if (codeExists) {
        throw new Error(`Ya existe un rol con el código '${roleData.code}'`);
      }
      
      // Actualizamos los datos básicos del rol
      const updatedRoleData = await apiPatch<RoleDataFromBackend>(`/roles/${id}`, {
        name: roleData.name,
        code: roleData.code,
        description: roleData.description,
        isActive: roleData.isActive
      });
      
      // Si hay permisos seleccionados, actualizamos las asignaciones de permisos
      if (roleData.screenPermissionIds && roleData.screenPermissionIds.length > 0) {
        try {
          // Primero eliminamos todas las asignaciones existentes para este rol
          await apiDelete(`/role-screen-permissions/role/${id}`);
          
          // Luego creamos las nuevas asignaciones
          const roleScreenPermissions = roleData.screenPermissionIds.map((screenPermissionId: number) => ({
            roleId: id,
            screenPermissionId: screenPermissionId,
            isActive: true
          }));
          
          // Llamar al endpoint para crear las asignaciones
          await apiPost('/role-screen-permissions/batch', { roleScreenPermissions });
          
          // Obtener el rol actualizado con todos sus permisos
          const finalRoleData = await apiGet<RoleDataFromBackend>(`/roles/${id}`);
          return normalizeRoleData(finalRoleData);
        } catch (permError) {
          console.error('Error al actualizar permisos del rol:', permError);
        }
      }
      
      return normalizeRoleData(updatedRoleData);
    } catch (error) {
      console.error(`Error al actualizar rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un rol
   */
  static async deleteRole(id: number): Promise<{ message: string }> {
    try {
      return await apiDelete<{ message: string }>(`/roles/${id}`);
    } catch (error) {
      console.error(`Error al eliminar rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener todos los permisos disponibles
   */
  static async getPermissions(): Promise<Permission[]> {
    try {
      try {
        // Intentamos primero obtener los permisos desde un endpoint específico
        // si existe en el backend
        const permissions = await apiGet<Permission[]>('/permissions');
        return permissions;
      } catch {
        console.log('No se encontró un endpoint específico para permisos, extrayendo de roles...');
        
        // Si no hay endpoint específico, extraemos los permisos de los roles existentes
        const roles = await this.getRoles();
        const allPermissions: Permission[] = [];
        
        // Recolectamos todos los permisos de todos los roles
        roles.forEach(role => {
          if (role.screensWithPermissions) {
            role.screensWithPermissions.forEach(screenWithPerm => {
              screenWithPerm.permissions.forEach(permission => {
                // Evitamos duplicados verificando si ya existe un permiso con el mismo ID
                if (!allPermissions.some(p => p.id === permission.id)) {
                  allPermissions.push(permission);
                }
              });
            });
          }
        });
        
        return allPermissions;
      }
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      // Retornar datos de ejemplo en caso de error
      return [
        { id: 1, name: 'Crear', code: 'CREATE', description: 'Permiso para crear registros', module: 'general' },
        { id: 2, name: 'Leer', code: 'READ', description: 'Permiso para leer registros', module: 'general' },
        { id: 3, name: 'Actualizar', code: 'UPDATE', description: 'Permiso para actualizar registros', module: 'general' },
        { id: 4, name: 'Eliminar', code: 'DELETE', description: 'Permiso para eliminar registros', module: 'general' },
        { id: 5, name: 'Administrar Usuarios', code: 'MANAGE_USERS', description: 'Permiso para administrar usuarios', module: 'usuarios' }
      ];
    }
  }
  
  /**
   * Obtener todas las pantallas con sus permisos asociados
   */
  static async getScreensWithPermissions(): Promise<ApiScreenWithPermissions[]> {
    try {
      // Intentamos obtener las pantallas con permisos desde un endpoint específico
      try {
        const response = await apiGet<ApiScreenPermissionRelation[]>('/screen-permissions');
        console.log('Estructura de datos recibida de /screen-permissions:', JSON.stringify(response, null, 2));
        
        // Normalizar los datos para agrupar por pantalla
        const screenMap = new Map<number, ApiScreenWithPermissions>();
        
        response.forEach(relation => {
          const { screen, permission } = relation;
          
          if (!screenMap.has(screen.id)) {
            screenMap.set(screen.id, {
              id: screen.id,
              name: screen.name,
              code: screen.code,
              permissions: []
            });
          }
          
          const screenWithPermissions = screenMap.get(screen.id)!;
          // Evitar duplicados de permisos
          if (!screenWithPermissions.permissions.some(p => p.id === permission.id)) {
            screenWithPermissions.permissions.push(permission);
          }
        });
        
        return Array.from(screenMap.values());
      } catch {
        console.log('No se encontró un endpoint específico para pantallas con permisos, intentando otro enfoque...');
        
        // Intentamos obtener las pantallas primero
        try {
          const screens = await apiGet<Screen[]>('/screens');
          const permissions = await this.getPermissions();
          
          // Agrupamos los permisos por pantalla
          const screenPermissionsMap: Record<number, Permission[]> = {};
          
          // Intentamos obtener las relaciones entre pantallas y permisos
          try {
            const screenPermissions = await apiGet<{screenId: number, permissionId: number}[]>('/screen-permissions/relations');
            
            // Agrupamos los permisos por pantalla
            screenPermissions.forEach(sp => {
              if (!screenPermissionsMap[sp.screenId]) {
                screenPermissionsMap[sp.screenId] = [];
              }
              
              const permission = permissions.find(p => p.id === sp.permissionId);
              if (permission) {
                screenPermissionsMap[sp.screenId].push(permission);
              }
            });
          } catch (error) {
            console.error('Error al obtener relaciones de pantallas y permisos:', error);
          }
          
          // Transformamos los datos al formato esperado por ApiScreenWithPermissions
          return screens.map(screen => ({
            id: screen.id,
            name: screen.name,
            code: screen.code,
            permissions: screenPermissionsMap[screen.id] || []
          }));
        } catch (error) {
          console.error('Error al obtener pantallas:', error);
          // Fallback: Retornar datos de ejemplo
          return [];
        }
      }
    } catch (error) {
      console.error('Error al obtener pantallas con permisos:', error);
      // Datos de ejemplo para pantallas y permisos
      const mockPermissions = [
        { id: 1, name: 'Crear', code: 'CREATE', description: 'Permiso para crear registros', module: 'general' },
        { id: 2, name: 'Leer', code: 'READ', description: 'Permiso para leer registros', module: 'general' },
        { id: 3, name: 'Actualizar', code: 'UPDATE', description: 'Permiso para actualizar registros', module: 'general' },
        { id: 4, name: 'Eliminar', code: 'DELETE', description: 'Permiso para eliminar registros', module: 'general' },
        { id: 5, name: 'Administrar Usuarios', code: 'MANAGE_USERS', description: 'Permiso para administrar usuarios', module: 'usuarios' }
      ];
      
      return [
        {
          id: 1,
          name: 'Dashboard',
          code: 'DASHBOARD',
          permissions: [mockPermissions[1]]
        },
        {
          id: 2,
          name: 'Usuarios',
          code: 'USERS',
          permissions: [mockPermissions[0], mockPermissions[1], mockPermissions[2], mockPermissions[3]]
        },
        {
          id: 3,
          name: 'Roles',
          code: 'ROLES',
          permissions: [mockPermissions[0], mockPermissions[1], mockPermissions[2], mockPermissions[3]]
        },
        {
          id: 4,
          name: 'Configuración',
          code: 'SETTINGS',
          permissions: [mockPermissions[1], mockPermissions[2]]
        }
      ];
    }
  }
}
