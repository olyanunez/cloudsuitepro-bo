
interface User extends GenericEntity {
  name: string;
  password: string;
  email: string;
  roleId?: number;
  role?: Role;
  wasActivated: boolean
  // passwordRecoveryCodes?: PasswordRecoveryCode[];
}
interface UserUpdate extends GenericEntity {
  name: string;
  password: string;
  email: string;
  roleId?: number;
}