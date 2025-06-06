import { GenericEntity } from '../IGenericEntity';

export interface Role extends GenericEntity {
  name: string;
  // users?: User[];
  // permissions: Permission[]
}
