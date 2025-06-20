/**
 * Interfaz base para entidades con campos de auditoría
 * Incluye campos comunes que se utilizan en todas las entidades
 */
export interface BaseEntity {
  id: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}
