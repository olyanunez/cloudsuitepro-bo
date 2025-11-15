"use client";

/**
 * Interfaz para permisos del usuario
 */
export interface UserPermission {
  screenCode: string;
  permissionCode: string;
  screenName?: string;
  permissionName?: string;
}

/**
 * Servicio de permisos
 * Maneja la lógica de permisos del usuario
 */
export class PermissionService {
  /**
   * Obtiene los permisos del usuario desde localStorage
   * @returns Array de permisos del usuario
   */
  static getUserPermissions(): UserPermission[] {
    if (typeof window === 'undefined') return [];

    const permissionsStr = localStorage.getItem('user_permissions');
    if (!permissionsStr) return [];

    try {
      return JSON.parse(permissionsStr);
    } catch (error) {
      console.error('Error parsing user permissions:', error);
      return [];
    }
  }

  /**
   * Guarda los permisos del usuario en localStorage
   * @param permissions Array de permisos
   */
  static setUserPermissions(permissions: UserPermission[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_permissions', JSON.stringify(permissions));

    // Emitir evento personalizado para notificar a los componentes que los permisos han cambiado
    window.dispatchEvent(new CustomEvent('permissionsUpdated'));
  }

  /**
   * Limpia los permisos del usuario
   */
  static clearUserPermissions(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user_permissions');
  }

  /**
   * Verifica si el usuario tiene un permiso específico para una pantalla
   * @param screenCode Código de la pantalla
   * @param permissionCode Código del permiso (VIEW, CREATE, UPDATE, DELETE)
   * @returns true si el usuario tiene el permiso
   */
  static hasPermission(screenCode: string, permissionCode: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.some(
      (p) => p.screenCode === screenCode && p.permissionCode === permissionCode
    );
  }

  /**
   * Verifica si el usuario tiene permiso VIEW para una pantalla
   * @param screenCode Código de la pantalla
   * @returns true si el usuario tiene permiso VIEW
   */
  static canView(screenCode: string): boolean {
    return this.hasPermission(screenCode, 'VIEW');
  }

  /**
   * Verifica si el usuario tiene permiso CREATE para una pantalla
   * @param screenCode Código de la pantalla
   * @returns true si el usuario tiene permiso CREATE
   */
  static canCreate(screenCode: string): boolean {
    return this.hasPermission(screenCode, 'CREATE');
  }

  /**
   * Verifica si el usuario tiene permiso UPDATE para una pantalla
   * @param screenCode Código de la pantalla
   * @returns true si el usuario tiene permiso UPDATE
   */
  static canUpdate(screenCode: string): boolean {
    return this.hasPermission(screenCode, 'UPDATE');
  }

  /**
   * Verifica si el usuario tiene permiso DELETE para una pantalla
   * @param screenCode Código de la pantalla
   * @returns true si el usuario tiene permiso DELETE
   */
  static canDelete(screenCode: string): boolean {
    return this.hasPermission(screenCode, 'DELETE');
  }

  /**
   * Obtiene todos los códigos de pantallas únicas para las cuales el usuario tiene permisos
   * @returns Array de códigos de pantalla
   */
  static getScreenCodesWithPermissions(): string[] {
    const permissions = this.getUserPermissions();
    const uniqueScreens = new Set(permissions.map(p => p.screenCode));
    return Array.from(uniqueScreens);
  }

  /**
   * Verifica si una pantalla tiene permisos parametrizados
   * Esto se puede hacer verificando si existe algún permiso para esa pantalla
   * Si no hay permisos parametrizados, la pantalla es de acceso libre
   * @param screenCode Código de la pantalla
   * @returns true si la pantalla tiene permisos parametrizados
   */
  static screenHasPermissions(screenCode: string): boolean {
    const allPermissions = this.getUserPermissions();
    // Si el usuario tiene algún permiso para esta pantalla, significa que está parametrizada
    return allPermissions.some(p => p.screenCode === screenCode);
  }
}
