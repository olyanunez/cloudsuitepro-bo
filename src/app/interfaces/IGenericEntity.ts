interface GenericEntity {
  id: number;
  enabled: boolean;
  createdAt: Date;
  modifiedAt: Date;
  createdById?: number;
  createdBy?: User;
  updatedById?: number;
  updatedBy?: User;
}

interface GenericDtoEntity {
  id: number;
  enabled?: boolean;
  createdAt?: Date;
  modifiedAt?: Date;
  createdById?: number;
  createdBy?: User;
  updatedById?: number;
  updatedBy?: User;
}