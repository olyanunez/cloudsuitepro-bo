import { BaseEntity } from './base';

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  lastLogin?: Date;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
  avatar?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  avatar?: string;
  isActive?: boolean;
}
