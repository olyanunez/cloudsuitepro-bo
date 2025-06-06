import { GenericEntity } from '../IGenericEntity';

// Extendemos la interfaz GenericEntity para permitir fechas como string o Date
export interface FlexibleDateEntity extends Omit<GenericEntity, 'createdAt' | 'modifiedAt'> {
  createdAt: Date | string;
  modifiedAt: Date | string;
}
import { Role } from './IRole';

export interface User extends FlexibleDateEntity {
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