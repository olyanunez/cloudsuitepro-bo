"use client";

import { apiGet } from './apiService';

/**
 * Interfaz para Branch (Sucursal)
 */
export interface Branch {
  id: number;
  code: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean | number; // MySQL devuelve 1/0
}

/**
 * Interfaz para UserBranch (Relación entre Usuario y Sucursal)
 */
export interface UserBranch {
  id: number;
  userId: number;
  branchId: number;
  branch: Branch;
  isActive: boolean | number; // MySQL devuelve 1/0
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfaz para el usuario con sus sucursales
 */
export interface UserWithBranches {
  id: number;
  email: string;
  name?: string;
  lastName?: string;
  userBranches: UserBranch[];
}

/**
 * Servicio de sucursales
 */
export class BranchService {
  /**
   * Obtiene las sucursales asignadas al usuario actual
   * @returns Promise con las sucursales del usuario
   */
  static async getUserBranches(userId: number): Promise<UserBranch[]> {
    try {
      console.log('🌐 Fetching user branches for userId:', userId);
      const user = await apiGet<UserWithBranches>(`/users/${userId}`);
      console.log('📦 User data received:', user);
      console.log('🔗 User branches raw:', user.userBranches);

      // Filtrar solo sucursales activas (compatible con MySQL que devuelve 1/0)
      const filteredBranches = user.userBranches.filter(ub => {
        const ubActive = ub.isActive === true || ub.isActive === 1;
        const branchActive = ub.branch.isActive === true || ub.branch.isActive === 1;
        console.log(`🔍 Filtering branch ${ub.branch.name}:`, {
          ubActive,
          branchActive,
          ubIsActiveRaw: ub.isActive,
          branchIsActiveRaw: ub.branch.isActive
        });
        return ubActive && branchActive;
      });
      console.log('✅ Filtered active branches:', filteredBranches);

      return filteredBranches;
    } catch (error) {
      console.error('❌ Error al obtener sucursales del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las sucursales del tenant
   * @returns Promise con todas las sucursales
   */
  static async getAllBranches(): Promise<Branch[]> {
    try {
      return await apiGet<Branch[]>('/branches');
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      throw error;
    }
  }

  /**
   * Obtiene una sucursal por ID
   * @param branchId ID de la sucursal
   * @returns Promise con la sucursal
   */
  static async getBranch(branchId: number): Promise<Branch> {
    try {
      return await apiGet<Branch>(`/branches/${branchId}`);
    } catch (error) {
      console.error('Error al obtener sucursal:', error);
      throw error;
    }
  }

  /**
   * Obtiene la sucursal activa del localStorage
   * @returns ID de la sucursal activa o null
   */
  static getActiveBranchId(): number | null {
    if (typeof window !== 'undefined') {
      const branchId = localStorage.getItem('active_branch_id');
      return branchId ? parseInt(branchId, 10) : null;
    }
    return null;
  }

  /**
   * Establece la sucursal activa en localStorage
   * @param branchId ID de la sucursal
   * @param branchName Nombre de la sucursal
   */
  static setActiveBranch(branchId: number, branchName: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_branch_id', branchId.toString());
      localStorage.setItem('active_branch_name', branchName);
    }
  }

  /**
   * Obtiene el nombre de la sucursal activa del localStorage
   * @returns Nombre de la sucursal activa o null
   */
  static getActiveBranchName(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('active_branch_name');
    }
    return null;
  }

  /**
   * Limpia la sucursal activa del localStorage
   */
  static clearActiveBranch(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('active_branch_id');
      localStorage.removeItem('active_branch_name');
    }
  }
}
