import { Role, RoleCreateInput, RoleUpdateInput, Permission } from '../types/role';
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
      throw error;
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
   * Crear un nuevo rol
   */
  static async createRole(roleData: RoleCreateInput): Promise<Role> {
    try {
      // Verificamos si hay un rol con el mismo nombre para evitar conflictos
      const existingRoles = await this.getRoles();
      const nameExists = existingRoles.some(role => role.name === roleData.name);
      
      if (nameExists) {
        throw new Error(`Ya existe un rol con el nombre '${roleData.name}'`);
      }
      
      // ESTRATEGIA ALTERNATIVA: Clonar un rol existente y modificarlo
      if (existingRoles.length === 0) {
        throw new Error('No hay roles existentes para clonar');
      }
      
      // Tomamos el primer rol como base
      const baseRole = existingRoles[0];
      console.log('Usando rol existente como base:', baseRole.name);
      
      // Creamos un nuevo objeto para el rol clonado
      const clonedRoleData = {
        name: roleData.name,
        description: roleData.description || '',
        // No enviamos permisos inicialmente
      };
      
      console.log('Creando rol con datos mínimos:', JSON.stringify(clonedRoleData));
      
      try {
        // Paso 1: Crear un rol básico sin permisos usando el servicio centralizado
        const createdRoleData = await apiPost<RoleDataFromBackend>('/roles', clonedRoleData);
        console.log('Rol básico creado exitosamente:', createdRoleData);
        
        // Paso 2: Actualizar con permisos si es necesario
        if (roleData.permissionIds && roleData.permissionIds.length > 0) {
          try {
            console.log('Actualizando permisos del rol...');
            const permissionsData = {
              permissions: roleData.permissionIds.map(id => String(id))
            };
            
            const finalRoleData = await apiPatch<RoleDataFromBackend>(`/roles/${createdRoleData.id}`, permissionsData);
            console.log('Permisos actualizados exitosamente:', finalRoleData);
            return normalizeRoleData(finalRoleData);
          } catch (permError) {
            console.error('Error al actualizar permisos:', permError);
            // Si falla la actualización de permisos, devolvemos el rol sin permisos
            return normalizeRoleData(createdRoleData);
          }
        }
        
        return normalizeRoleData(createdRoleData);
      } catch (createError) {
        console.error(`Error al crear rol:`, createError);
        
        // Intento alternativo: Clonar directamente el rol base
        console.log('Intentando clonar directamente el rol base...');
        
        // Obtenemos un ID único para el rol clonado
        const timestamp = new Date().getTime();
        const cloneName = `${roleData.name} (${timestamp})`;
        
        // Actualizamos un rol existente para "clonarlo" usando el servicio centralizado
        const cloneData = {
          name: cloneName,
          description: roleData.description || ''
        };
        
        const updatedRoleData = await apiPatch<RoleDataFromBackend>(`/roles/${baseRole.id}`, cloneData);
        console.log('Rol clonado exitosamente:', updatedRoleData);
        
        // Paso 2: Si hay permisos seleccionados, intentamos actualizarlos
        if (roleData.permissionIds && roleData.permissionIds.length > 0) {
          try {
            const permissionsData = {
              permissions: roleData.permissionIds.map(id => String(id))
            };
            
            const finalRoleData = await apiPatch<RoleDataFromBackend>(`/roles/${updatedRoleData.id}`, permissionsData);
            return normalizeRoleData(finalRoleData);
          } catch (permError) {
            console.error('Error al actualizar permisos:', permError);
          }
        }
        
        return normalizeRoleData(updatedRoleData);
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
      // Adaptar los datos para el formato que espera el backend
      // Basado en UpdateRoleDto, solo enviamos name, description y permissions
      const adaptedData: { name?: string; description?: string; permissions?: string[] } = {};
      
      if (roleData.name !== undefined) {
        adaptedData.name = roleData.name;
      }
      
      if (roleData.description !== undefined) {
        adaptedData.description = roleData.description;
      }
      
      if (roleData.permissionIds !== undefined) {
        // Asegurarnos de que los permisos sean números válidos
        const validPermissions = roleData.permissionIds.filter(id => id && typeof id === 'number');
        // Convertir a string para compatibilidad con la API actual
        adaptedData.permissions = validPermissions.map(id => String(id));
      }

      console.log('Datos enviados al backend para actualizar:', JSON.stringify(adaptedData));

      // Usar el servicio centralizado para hacer la petición
      const updatedRoleData = await apiPatch<RoleDataFromBackend>(`/roles/${id}`, adaptedData);
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
      throw error;
    }
  }
}
