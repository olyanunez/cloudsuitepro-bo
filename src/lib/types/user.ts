export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
