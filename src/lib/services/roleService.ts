import { Role, RoleCreateInput, RoleUpdateInput, Permission, Screen, ScreenWithPermissions } from '../types/role';
import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';

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
  permissions: (Permission & { screenPermissionId?: number })[];
}

// Tipo para los datos de relación rol-permiso-pantalla
interface RoleScreenPermissionData {
  id: number;
  roleId: number;
  screenPermissionId: number;
  isActive: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  screenPermission?: {
    id: number;
    screenId: number;
    permissionId: number;
    isActive: boolean;
    screen?: {
      id: number;
      name: string;
      code: string;
      description?: string;
      isActive?: boolean;
    };
    permission?: {
      id: number;
      name: string;
      code: string;
      description?: string;
      module?: string;
      isActive?: boolean;
    };
  };
}

/**
 * Tipo para los datos de rol recibidos del backend
 */
interface RoleDataFromBackend {
  id: number;
  name: string;
  code: string; // Campo obligatorio en el backend
  description?: string;
  permissions?: number[] | Permission[]; // IDs de permisos como números o objetos Permission
  roleScreenPermissions?: RoleScreenPermissionData[];
  isActive?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  // Conteo de relaciones desde el backend
  _count?: {
    users?: number;
    roleScreenPermissions?: number;
  };
}

/**
 * Normaliza los datos de rol para asegurar que todos los campos de auditoría estén presentes
 * @param roleData Datos del rol recibidos del backend
 */
const normalizeRoleData = (roleData: RoleDataFromBackend): Role => {
  console.log('Normalizando datos de rol:', roleData);
  console.log('roleScreenPermissions:', roleData.roleScreenPermissions);

  // Mapa para almacenar pantallas y sus permisos
  const screenMap = new Map<number, ScreenWithPermissions>();
  const permissionsSet = new Set<number>(); // Para contar permisos únicos

  // Si el backend ya envía screensWithPermissions, usarlo directamente
  if (Array.isArray((roleData as any).screensWithPermissions)) {
    (roleData as any).screensWithPermissions.forEach((screenWithPerm: any) => {
      const screen = screenWithPerm.screen;
      const permissions = Array.isArray(screenWithPerm.permissions)
        ? screenWithPerm.permissions.map((perm: any) => ({
          ...perm,
          screenPermissionId: perm.screenPermissionId
        }))
        : [];
      screenMap.set(screen.id, {
        screen: {
          id: screen.id,
          name: screen.name,
          code: screen.code,
          description: screen.description || ''
        },
        permissions
      });
      permissions.forEach((perm: any) => permissionsSet.add(perm.id));
    });
  } else if (roleData.roleScreenPermissions && roleData.roleScreenPermissions.length > 0) {
    console.log(`Procesando ${roleData.roleScreenPermissions.length} roleScreenPermissions`);

    roleData.roleScreenPermissions.forEach(rsp => {
      console.log('Procesando rsp:', rsp);
      if (!rsp.screenPermission) {
        console.log('No hay screenPermission en este rsp');
        return;
      }

      const screenId = rsp.screenPermission.screenId;
      const permissionId = rsp.screenPermission.permissionId;
      const screenPermissionId = rsp.screenPermission.id;
      console.log(`screenId: ${screenId}, permissionId: ${permissionId}`);
      console.log('screenPermission:', rsp.screenPermission);

      // Obtener o crear la entrada de pantalla
      if (!screenMap.has(screenId)) {
        // Usar los datos completos de la pantalla que ahora vienen del backend
        console.log('Datos de pantalla en screenPermission:', rsp.screenPermission.screen);

        const screenData = rsp.screenPermission.screen || {
          id: screenId,
          name: `Screen ${screenId}`,
          code: `SCREEN_${screenId}`,
          description: ''
        };

        console.log('screenData procesado:', screenData);

        screenMap.set(screenId, {
          screen: {
            id: screenData.id,
            name: screenData.name,
            code: screenData.code,
            description: screenData.description || ''
          },
          permissions: []
        });

        console.log('Pantalla añadida al mapa:', screenMap.get(screenId));
      }

      // Añadir el permiso a la pantalla
      const screenWithPerms = screenMap.get(screenId)!;

      // Verificar si el permiso ya existe en la pantalla
      const permissionExists = screenWithPerms.permissions.some(p => p.id === permissionId);
      console.log(`Permiso ${permissionId} ya existe en pantalla ${screenId}:`, permissionExists);

      if (!permissionExists) {
        // Usar los datos completos del permiso que ahora vienen del backend
        console.log('Datos de permiso en screenPermission:', rsp.screenPermission.permission);

        const permissionData = rsp.screenPermission.permission || {
          id: permissionId,
          name: `Permission ${permissionId}`,
          code: `PERM_${permissionId}`,
          description: '',
          module: 'default'
        };

        console.log('permissionData procesado:', permissionData);

        // Añadir el permiso a la pantalla
        screenWithPerms.permissions.push({
          id: permissionData.id,
          name: permissionData.name,
          code: permissionData.code,
          description: permissionData.description || '',
          module: permissionData.module || 'default',
          screenPermissionId: screenPermissionId
        });

        console.log('Permiso añadido a la pantalla:', screenWithPerms.permissions[screenWithPerms.permissions.length - 1]);

        // Añadir el permiso al conjunto de permisos únicos
        permissionsSet.add(permissionId);
        console.log('Total permisos únicos:', permissionsSet.size);
      }
    });
  }

  // Convertir el mapa a un array
  const screensWithPermissions = Array.from(screenMap.values());

  // Asegurarnos de que todos los campos esperados estén presentes
  return {
    id: roleData.id,
    name: roleData.name,
    code: roleData.code, // Campo obligatorio
    description: roleData.description || '',
    isActive: roleData.isActive !== undefined ? roleData.isActive : true,
    // Campos específicos del frontend
    screensWithPermissions: screensWithPermissions,
    permissionsCount: permissionsSet.size,
    // Preservar la información de conteo del backend
    _count: roleData._count,
    // Campos de auditoría
    version: roleData.version,
    createdAt: roleData.createdAt ? new Date(roleData.createdAt) : undefined,
    updatedAt: roleData.updatedAt ? new Date(roleData.updatedAt) : undefined,
    createdBy: roleData.createdBy !== null ? roleData.createdBy : undefined,
    updatedBy: roleData.updatedBy !== null ? roleData.updatedBy : undefined,
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
      // Solicitar explícitamente que se incluyan los permisos
      const data = await apiGet<RoleDataFromBackend[]>('/roles?includePermissions=true');
      console.log('Datos de roles recibidos del backend:', data);
      return data.map(normalizeRoleData);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      // Retornar datos de ejemplo en caso de error para evitar que la aplicación se rompa
      return [
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
   * Actualizar un rol existente con permisos
   */
  static async updateRoleWithPermissions(id: number, roleData: RoleUpdateInput & { initialScreenPermissionIds?: number[], selectedScreenPermissionIds?: number[] }): Promise<Role> {
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

      try {
        console.log('Actualizando rol con permisos:', roleData);

        // Si se proveen los arrays inicial y final, calcular los cambios
        let permissionsToAdd = roleData.permissionsToAdd || [];
        let permissionsToRemove = roleData.permissionsToRemove || [];
        let screenPermissionIds = roleData.screenPermissionIds || [];

        if (roleData.initialScreenPermissionIds && roleData.selectedScreenPermissionIds) {
          permissionsToAdd = roleData.selectedScreenPermissionIds.filter(
            id => !roleData.initialScreenPermissionIds!.includes(id)
          );
          permissionsToRemove = roleData.initialScreenPermissionIds.filter(
            id => !roleData.selectedScreenPermissionIds!.includes(id)
          );
          screenPermissionIds = roleData.selectedScreenPermissionIds;
        }

        console.log('Enviando permissionsToAdd:', permissionsToAdd);
        console.log('Enviando permissionsToRemove:', permissionsToRemove);

        // Usar el nuevo endpoint para actualizar rol con permisos en una sola llamada
        const response = await apiPatch<RoleDataFromBackend>(`/roles/with-permissions/${id}`, {
          role: {
            name: roleData.name,
            code: roleData.code,
            description: roleData.description,
            isActive: roleData.isActive
          },
          // Enviamos las listas de permisos a agregar y quitar
          permissionsToAdd: permissionsToAdd,
          permissionsToRemove: permissionsToRemove,
          // Mantenemos screenPermissionIds para compatibilidad
          screenPermissionIds: screenPermissionIds
        });

        console.log('Rol actualizado exitosamente con permisos:', response);

        if (response) {
          return normalizeRoleData(response);
        } else {
          throw new Error('Respuesta inválida del servidor al actualizar rol');
        }
      } catch (error) {
        console.error('Error al actualizar rol con permisos:', error);
        throw error;
      }
    } catch (error) {
      console.error(`Error en el proceso de actualización de rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar un rol existente
   */
  static async updateRole(id: number, roleData: RoleUpdateInput): Promise<Role> {
    // Usar el nuevo método updateRoleWithPermissions para mantener compatibilidad
    return this.updateRoleWithPermissions(id, roleData);
  }

  /**
   * Eliminar un rol
   */
  static async deleteRole(id: string | number): Promise<{ message: string }> {
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
        // Definimos una interfaz para la estructura de los datos de screen-permissions
        interface ScreenPermissionResponse {
          id: number;
          screenId: number;
          permissionId: number;
          permission: Permission;
          screen: Screen;
          isActive: boolean;
        }

        // Intentamos primero obtener los permisos desde el endpoint de screen-permissions
        // que existe en el backend
        const screenPermissions = await apiGet<ScreenPermissionResponse[]>('/screen-permissions');

        // Extraer los permisos únicos de las relaciones de pantalla-permiso
        const uniquePermissions = new Map<number, Permission>();

        screenPermissions.forEach(sp => {
          if (sp.permission && !uniquePermissions.has(sp.permission.id)) {
            uniquePermissions.set(sp.permission.id, sp.permission);
          }
        });

        return Array.from(uniquePermissions.values());
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
          const { screen, permission, id: screenPermissionId } = relation;

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
            // Incluir el screenPermissionId en el objeto de permiso
            screenWithPermissions.permissions.push({
              ...permission,
              screenPermissionId: screenPermissionId
            });
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
            const screenPermissions = await apiGet<{ screenId: number, permissionId: number }[]>('/screen-permissions/relations');

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
