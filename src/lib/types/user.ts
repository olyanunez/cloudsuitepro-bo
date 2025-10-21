import { BaseEntity } from './base';
import { Role } from './role';
import { Branch } from './inventory';

export interface UserBranch {
  id: number;
  userId: number;
  branchId: number;
  branch: Branch;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  tenantId?: string; // ID de la empresa a la que pertenece el usuario
  userBranches?: UserBranch[]; // Sucursales asignadas al usuario
}

export interface UserCreateInput {
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  roleId?: number;
  avatar?: string;
  isActive?: boolean;
  tenantId?: string; // ID de la empresa a la que pertenece el usuario
}

export interface UserUpdateInput {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roleId?: number;
  avatar?: string;
  isActive?: boolean;
  tenantId?: string; // ID de la empresa a la que pertenece el usuario
}

export interface AssignBranchesDto {
  branchIds: number[];
}
