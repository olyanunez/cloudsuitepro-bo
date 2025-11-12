"use client";

/**
 * Servicio para gestionar las empresas (tenants)
 */
import { apiGet, apiPost, apiPatch, apiDelete, apiPostFormData } from './apiService';

// Interfaz para el modelo de empresa (tenant)
export interface Tenant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para la creación de una empresa
export interface CreateTenantDto {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string;
}

// Interfaz para la actualización de una empresa
export interface UpdateTenantDto {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string;
  isActive?: boolean;
}

/**
 * Normaliza los datos de una empresa
 */
const normalizeTenantData = (tenant: Partial<Tenant>): Tenant => {
  return {
    id: tenant.id || '',
    name: tenant.name || '',
    description: tenant.description || '',
    address: tenant.address || '',
    phone: tenant.phone || '',
    email: tenant.email || '',
    taxId: tenant.taxId || '',
    logo: tenant.logo || '',
    isActive: tenant.isActive !== undefined ? tenant.isActive : true,
    createdAt: tenant.createdAt || new Date().toISOString(),
    updatedAt: tenant.updatedAt || new Date().toISOString(),
  };
};

/**
 * Servicio para gestionar las empresas (tenants)
 */
export class TenantService {
  /**
   * Obtiene todas las empresas
   */
  static async getTenants(): Promise<Tenant[]> {
    try {
      const response = await apiGet<Partial<Tenant>[]>('/tenants');
      return response.map(normalizeTenantData);
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una empresa por su ID
   */
  static async getTenantById(id: string): Promise<Tenant> {
    try {
      const response = await apiGet<Partial<Tenant>>(`/tenants/${id}`);
      return normalizeTenantData(response);
    } catch (error) {
      console.error(`Error al obtener empresa con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva empresa
   */
  static async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    try {
      const response = await apiPost<Partial<Tenant>>('/tenants', tenantData);
      return normalizeTenantData(response);
    } catch (error) {
      console.error('Error al crear empresa:', error);
      throw error;
    }
  }

  /**
   * Actualiza una empresa existente
   */
  static async updateTenant(id: string, tenantData: UpdateTenantDto): Promise<Tenant> {
    try {
      const response = await apiPatch<Partial<Tenant>>(`/tenants/${id}`, tenantData);
      return normalizeTenantData(response);
    } catch (error) {
      console.error(`Error al actualizar empresa con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una empresa
   */
  static async deleteTenant(id: string): Promise<void> {
    try {
      await apiDelete<void>(`/tenants/${id}`);
    } catch (error) {
      console.error(`Error al eliminar empresa con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activa o desactiva una empresa
   */
  static async toggleTenantStatus(id: string, isActive: boolean): Promise<Tenant> {
    try {
      const response = await apiPatch<Partial<Tenant>>(`/tenants/${id}/status`, { isActive });
      return normalizeTenantData(response);
    } catch (error) {
      console.error(`Error al cambiar estado de empresa con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Sube el logo de la empresa a Cloudinary
   */
  static async uploadLogo(id: string, file: File): Promise<{ url: string; publicId: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiPostFormData<{ url: string; publicId: string }>(
        `/tenants/${id}/upload-logo`,
        formData
      );

      return response;
    } catch (error) {
      console.error(`Error al subir logo para empresa con ID ${id}:`, error);
      throw error;
    }
  }
}

export default TenantService;
