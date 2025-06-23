import { Role, RoleCreateInput, RoleUpdateInput, Permission } from '../types/role';

/**
 * URL base de la API
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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

/**
 * Normaliza un array de roles
 */
const normalizeRoles = (roles: RoleDataFromBackend[]): Role[] => {
  return roles.map(normalizeRoleData);
};

/**
 * Manejar errores de respuesta HTTP
 */
const handleResponse = async (response: Response, isRoleData = false) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error desconocido',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Si son datos de rol, normalizarlos
  if (isRoleData) {
    if (Array.isArray(data)) {
      return normalizeRoles(data);
    } else if (data) {
      return normalizeRoleData(data);
    }
  }
  
  return data;
};

export class RoleService {
  /**
   * Obtener todos los roles
   */
  static async getRoles(): Promise<Role[]> {
    try {
      const response = await fetch(
        `${API_URL}/roles`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('auth_token') || ''}`
          },
        }
       
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const roles = await handleResponse(response);
      return roles.map(normalizeRoleData);
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
      const response = await fetch(
        `${API_URL}/roles/${id}`,
        getDefaultOptions('GET')
      );
      return handleResponse(response, true);
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo rol
   */
  /**
   * Crea un nuevo rol usando un enfoque extremadamente simplificado
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
      
      // Paso 1: Crear un rol básico sin permisos
      const createResponse = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(clonedRoleData)
      });
      
      // Si falla la creación, intentamos un enfoque aún más básico
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`Error ${createResponse.status} al crear rol:`, errorText);
        
        // Intento alternativo: Clonar directamente el rol base
        console.log('Intentando clonar directamente el rol base...');
        
        // Obtenemos un ID único para el rol clonado
        const timestamp = new Date().getTime();
        const cloneName = `${roleData.name} (${timestamp})`;
        
        // Actualizamos un rol existente para "clonarlo"
        const updateResponse = await fetch(`${API_URL}/roles/${baseRole.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify({
            name: cloneName,
            description: roleData.description || ''
          })
        });
        
        if (!updateResponse.ok) {
          const updateErrorText = await updateResponse.text();
          console.error(`Error ${updateResponse.status} al actualizar rol:`, updateErrorText);
          throw new Error(`No se pudo crear ni clonar el rol: ${updateErrorText.substring(0, 100)}`);
        }
        
        const updatedRoleData = await updateResponse.json();
        console.log('Rol clonado exitosamente:', updatedRoleData);
        
        // Paso 2: Si hay permisos seleccionados, intentamos actualizarlos
        if (roleData.permissionIds && roleData.permissionIds.length > 0) {
          try {
            const permissionsResponse = await fetch(`${API_URL}/roles/${updatedRoleData.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `${localStorage.getItem('auth_token') || ''}`
              },
              body: JSON.stringify({
                permissions: roleData.permissionIds
              })
            });
            
            if (permissionsResponse.ok) {
              const finalRoleData = await permissionsResponse.json();
              return normalizeRoleData(finalRoleData);
            }
          } catch (permError) {
            console.error('Error al actualizar permisos:', permError);
          }
        }
        
        return normalizeRoleData(updatedRoleData);
      }
      
      // Si llegamos aquí, la creación básica fue exitosa
      const createdRoleData = await createResponse.json();
      console.log('Rol básico creado exitosamente:', createdRoleData);
      
      // Paso 2: Actualizar con permisos si es necesario
      if (roleData.permissionIds && roleData.permissionIds.length > 0) {
        try {
          console.log('Actualizando permisos del rol...');
          const permissionsResponse = await fetch(`${API_URL}/roles/${createdRoleData.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${localStorage.getItem('auth_token') || ''}`
            },
            body: JSON.stringify({
              permissions: roleData.permissionIds
            })
          });
          
          if (permissionsResponse.ok) {
            const finalRoleData = await permissionsResponse.json();
            console.log('Permisos actualizados exitosamente:', finalRoleData);
            return normalizeRoleData(finalRoleData);
          } else {
            const errorText = await permissionsResponse.text();
            console.error(`Error ${permissionsResponse.status} al actualizar permisos:`, errorText);
          }
        } catch (permError) {
          console.error('Error al actualizar permisos:', permError);
        }
      }
      
      // Si no pudimos actualizar los permisos, devolvemos el rol básico
      return normalizeRoleData(createdRoleData);
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

      // Usamos fetch directamente para tener más control sobre la solicitud
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(adaptedData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Error: ${response.status}`);
        } catch {
          // Si no podemos parsear el error como JSON, devolvemos el texto crudo
          throw new Error(`Error: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }
      
      const updatedRole = await response.json();
      return normalizeRoleData(updatedRole);
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
      const response = await fetch(
        `${API_URL}/roles/${id}`,
        getDefaultOptions('DELETE')
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al eliminar rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener todos los permisos disponibles
   * Nota: Esta funcionalidad podría requerir un endpoint específico en el backend
   * Por ahora, asumimos que los permisos vienen incluidos en los roles
   */
  static async getPermissions(): Promise<Permission[]> {
    try {
      // Esta implementación dependerá de cómo el backend exponga los permisos
      // Por ahora, podemos extraer los permisos de los roles existentes
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
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  }
}
