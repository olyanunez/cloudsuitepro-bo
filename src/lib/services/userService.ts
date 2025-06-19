import { User, UserCreateInput, UserUpdateInput } from '../types/user';

// Simulación de datos para desarrollo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    roleId: '1', // Admin role
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lastLogin: new Date('2025-06-19'),
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    roleId: '2', // Manager role
    isActive: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    lastLogin: new Date('2025-06-18'),
  },
  {
    id: '3',
    name: 'Staff User',
    email: 'staff@example.com',
    roleId: '3', // Staff role
    isActive: true,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
    lastLogin: new Date('2025-06-17'),
  },
  {
    id: '4',
    name: 'Inactive User',
    email: 'inactive@example.com',
    roleId: '3', // Staff role
    isActive: false,
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-15'),
    lastLogin: new Date('2025-03-10'),
  },
];

export class UserService {
  /**
   * Obtener todos los usuarios
   */
  static async getUsers(): Promise<User[]> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    return Promise.resolve([...MOCK_USERS]);
  }

  /**
   * Obtener un usuario por ID
   */
  static async getUserById(id: string): Promise<User | null> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const user = MOCK_USERS.find(u => u.id === id);
    return Promise.resolve(user || null);
  }

  /**
   * Crear un nuevo usuario
   */
  static async createUser(userData: UserCreateInput): Promise<User> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9), // Generar ID aleatorio
      name: userData.name,
      email: userData.email,
      roleId: userData.roleId,
      avatar: userData.avatar,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // En un entorno real, aquí se guardaría el usuario en la base de datos
    
    return Promise.resolve(newUser);
  }

  /**
   * Actualizar un usuario existente
   */
  static async updateUser(id: string, userData: UserUpdateInput): Promise<User | null> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const userIndex = MOCK_USERS.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return Promise.resolve(null);
    }
    
    const updatedUser = {
      ...MOCK_USERS[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    
    // En un entorno real, aquí se actualizaría el usuario en la base de datos
    
    return Promise.resolve(updatedUser);
  }

  /**
   * Eliminar un usuario
   */
  static async deleteUser(id: string): Promise<boolean> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const userIndex = MOCK_USERS.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return Promise.resolve(false);
    }
    
    // En un entorno real, aquí se eliminaría el usuario de la base de datos
    
    return Promise.resolve(true);
  }

  /**
   * Cambiar el estado de activación de un usuario
   */
  static async toggleUserStatus(id: string): Promise<User | null> {
    // En un entorno real, esto sería una llamada a una API o base de datos
    const userIndex = MOCK_USERS.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return Promise.resolve(null);
    }
    
    const updatedUser = {
      ...MOCK_USERS[userIndex],
      isActive: !MOCK_USERS[userIndex].isActive,
      updatedAt: new Date()
    };
    
    // En un entorno real, aquí se actualizaría el usuario en la base de datos
    
    return Promise.resolve(updatedUser);
  }
}
