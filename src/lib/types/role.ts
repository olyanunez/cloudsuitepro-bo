export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
}

export interface RoleCreateInput {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
}
