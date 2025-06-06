import { User } from './User/IUser';

export interface GenericEntity {
  id: number;
  enabled: boolean;
  createdAt: Date;
  modifiedAt: Date;
  createdById?: number;
  createdBy?: User;
  updatedById?: number;
  updatedBy?: User;
}

export interface GenericDtoEntity {
  id: number;
  enabled?: boolean;
  createdAt?: Date;
  modifiedAt?: Date;
  createdById?: number;
  createdBy?: User;
  updatedById?: number;
  updatedBy?: User;
}