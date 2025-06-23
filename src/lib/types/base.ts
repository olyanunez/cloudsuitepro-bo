/**
 * Interfaz base para entidades con campos de auditoría
 * Incluye campos comunes que se utilizan en todas las entidades
 */
export interface BaseEntity {
  id: number;
  isActive?: boolean;
  version?: number; // Campo específico del frontend para control de versiones
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
}
