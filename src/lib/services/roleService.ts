import { Role, RoleCreateInput, RoleUpdateInput, Permission } from '../types/role';

// Simulación de datos para desarrollo
const MOCK_PERMISSIONS: Permission[] = [
  { id: '1', name: 'Ver usuarios', code: 'users:read', description: 'Ver lista de usuarios', module: 'users' },
  { id: '2', name: 'Crear usuarios', code: 'users:create', description: 'Crear nuevos usuarios', module: 'users' },
  { id: '3', name: 'Editar usuarios', code: 'users:update', description: 'Modificar usuarios existentes', module: 'users' },
  { id: '4', name: 'Eliminar usuarios', code: 'users:delete', description: 'Eliminar usuarios', module: 'users' },
  { id: '5', name: 'Ver roles', code: 'roles:read', description: 'Ver lista de roles', module: 'roles' },
  { id: '6', name: 'Crear roles', code: 'roles:create', description: 'Crear nuevos roles', module: 'roles' },
  { id: '7', name: 'Editar roles', code: 'roles:update', description: 'Modificar roles existentes', module: 'roles' },
  { id: '8', name: 'Eliminar roles', code: 'roles:delete', description: 'Eliminar roles', module: 'roles' },
  { id: '9', name: 'Ver productos', code: 'products:read', description: 'Ver lista de productos', module: 'products' },
  { id: '10', name: 'Crear productos', code: 'products:create', description: 'Crear nuevos productos', module: 'products' },
  { id: '11', name: 'Editar productos', code: 'products:update', description: 'Modificar productos existentes', module: 'products' },
  { id: '12', name: 'Eliminar productos', code: 'products:delete', description: 'Eliminar productos', module: 'products' },
];

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acceso completo a todas las funcionalidades',
    permissions: MOCK_PERMISSIONS,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'Gerente',
    description: 'Acceso a la mayoría de funcionalidades excepto configuración avanzada',
    permissions: MOCK_PERMISSIONS.filter(p => !['roles:delete', 'users:delete'].includes(p.code)),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '3',
    name: 'Staff',
    description: 'Acceso limitado a funcionalidades básicas',
    permissions: MOCK_PERMISSIONS.filter(p => p.code.endsWith(':read') || p.module === 'products'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

export class RoleService {
  /**
   * Obtener todos los roles
   */
  static async getRoles(): Promise<Role[]> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    return Promise.resolve([...MOCK_ROLES]);
  }

  /**
   * Obtener un rol por ID
   */
  static async getRoleById(id: string): Promise<Role | null> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const role = MOCK_ROLES.find(r => r.id === id);
    return Promise.resolve(role || null);
  }

  /**
   * Crear un nuevo rol
   */
  static async createRole(roleData: RoleCreateInput): Promise<Role> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const permissions = MOCK_PERMISSIONS.filter(p => roleData.permissionIds.includes(p.id));
    
    const newRole: Role = {
      id: Math.random().toString(36).substr(2, 9), // Generar ID aleatorio
      name: roleData.name,
      description: roleData.description,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // En un entorno real, aquí se guardaría el rol en la base de datos
    
    return Promise.resolve(newRole);
  }

  /**
   * Actualizar un rol existente
   */
  static async updateRole(id: string, roleData: RoleUpdateInput): Promise<Role | null> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const roleIndex = MOCK_ROLES.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return Promise.resolve(null);
    }
    
    let permissions = MOCK_ROLES[roleIndex].permissions;
    if (roleData.permissionIds) {
      permissions = MOCK_PERMISSIONS.filter(p => roleData.permissionIds!.includes(p.id));
    }
    
    const updatedRole = {
      ...MOCK_ROLES[roleIndex],
      ...roleData,
      permissions,
      updatedAt: new Date()
    };
    
    // En un entorno real, aquí se actualizaría el rol en la base de datos
    
    return Promise.resolve(updatedRole);
  }

  /**
   * Eliminar un rol
   */
  static async deleteRole(id: string): Promise<boolean> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const roleIndex = MOCK_ROLES.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return Promise.resolve(false);
    }
    
    // En un entorno real, aquí se eliminaría el rol de la base de datos
    
    return Promise.resolve(true);
  }

  /**
   * Obtener todos los permisos disponibles
   */
  static async getPermissions(): Promise<Permission[]> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    return Promise.resolve([...MOCK_PERMISSIONS]);
  }
}
