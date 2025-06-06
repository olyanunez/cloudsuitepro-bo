import { GenericEntity } from '../IGenericEntity';
import { Role } from './IRole';

export interface User extends GenericEntity {
  name: string;
  password: string;
  email: string;
  roleId?: number;
  role?: Role;
  wasActivated: boolean
  // passwordRecoveryCodes?: PasswordRecoveryCode[];
}

export interface UserUpdate extends GenericEntity {
  name: string;
  password: string;
  email: string;
  roleId?: number;
}