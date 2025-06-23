import { BaseEntity } from './base';
import { Role } from './role';

export interface User extends BaseEntity {
  name?: string; // Opcional en el backend
  lastName?: string; // Campo del backend
  email: string;
  avatar?: string; // Campo específico del frontend
  roleId?: number; // Opcional en el backend y cambiado a number
  role?: Role;
  lastLogin?: Date;
  permissionsCount?: number; // Campo específico del frontend
  isActive?: boolean;
}

export interface UserCreateInput {
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  roleId?: number;
  avatar?: string;
  isActive?: boolean;
}

export interface UserUpdateInput {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roleId?: number;
  avatar?: string;
  isActive?: boolean;
}
