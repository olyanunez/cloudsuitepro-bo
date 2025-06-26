import { BaseEntity } from './base';

export interface Role extends BaseEntity {
  name: string;
  code: string; // Campo obligatorio en el backend
  description?: string; // Opcional en el backend
  isActive?: boolean;
  // Campos específicos del frontend
  screensWithPermissions?: ScreenWithPermissions[];
  permissionsCount?: number;
  // Campos que vienen del backend
  _count?: {
    users?: number;
    roleScreenPermissions?: number;
  };
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  module: string;
  screenPermissionId?: number; // ID de la relación entre pantalla y permiso
}

export interface Screen {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface ScreenWithPermissions {
  screen: Screen;
  permissions: Permission[];
}

export interface RoleCreateInput {
  name: string;
  code: string; // Campo obligatorio en el backend
  description?: string;
  isActive?: boolean;
  // Cambiado para adaptarse al nuevo backend que usa screenPermissionIds
  screenPermissionIds: number[];
}

export interface RoleUpdateInput {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  screenPermissionIds?: number[];
  // Agregamos el campo para los pares screenId-permissionId
  screenPermissionPairs?: { screenId: number; permissionId: number }[];
}
