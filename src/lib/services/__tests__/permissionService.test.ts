import { PermissionService } from '../permissionService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PermissionService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserPermissions', () => {
    it('should return empty array when no permissions in localStorage', () => {
      const result = PermissionService.getUserPermissions();

      expect(result).toEqual([]);
    });

    it('should return permissions from localStorage', () => {
      const permissions = [
        { screenCode: 'USERS', permissionCode: 'VIEW' },
        { screenCode: 'USERS', permissionCode: 'CREATE' }
      ];

      localStorage.setItem('user_permissions', JSON.stringify(permissions));

      const result = PermissionService.getUserPermissions();

      expect(result).toEqual(permissions);
    });

    it('should return empty array on parse error', () => {
      localStorage.setItem('user_permissions', 'invalid json');

      const result = PermissionService.getUserPermissions();

      expect(result).toEqual([]);
    });
  });

  describe('setUserPermissions', () => {
    it('should save permissions to localStorage', () => {
      const permissions = [
        { screenCode: 'PRODUCTS', permissionCode: 'VIEW' },
        { screenCode: 'PRODUCTS', permissionCode: 'UPDATE' }
      ];

      PermissionService.setUserPermissions(permissions);

      const stored = localStorage.getItem('user_permissions');
      expect(JSON.parse(stored!)).toEqual(permissions);
    });
  });

  describe('clearUserPermissions', () => {
    it('should remove permissions from localStorage', () => {
      localStorage.setItem('user_permissions', JSON.stringify([{ screenCode: 'TEST', permissionCode: 'VIEW' }]));

      PermissionService.clearUserPermissions();

      expect(localStorage.getItem('user_permissions')).toBeNull();
    });
  });

  describe('hasPermission', () => {
    beforeEach(() => {
      const permissions = [
        { screenCode: 'USERS', permissionCode: 'VIEW' },
        { screenCode: 'USERS', permissionCode: 'CREATE' },
        { screenCode: 'PRODUCTS', permissionCode: 'VIEW' }
      ];
      localStorage.setItem('user_permissions', JSON.stringify(permissions));
    });

    it('should return true when user has the permission', () => {
      const result = PermissionService.hasPermission('USERS', 'VIEW');

      expect(result).toBe(true);
    });

    it('should return false when user does not have the permission', () => {
      const result = PermissionService.hasPermission('USERS', 'DELETE');

      expect(result).toBe(false);
    });

    it('should return false when screen does not exist', () => {
      const result = PermissionService.hasPermission('NONEXISTENT', 'VIEW');

      expect(result).toBe(false);
    });
  });

  describe('canView', () => {
    it('should return true when user has VIEW permission', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'DASHBOARD', permissionCode: 'VIEW' }
      ]));

      const result = PermissionService.canView('DASHBOARD');

      expect(result).toBe(true);
    });

    it('should return false when user does not have VIEW permission', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'DASHBOARD', permissionCode: 'CREATE' }
      ]));

      const result = PermissionService.canView('DASHBOARD');

      expect(result).toBe(false);
    });
  });

  describe('canCreate', () => {
    it('should return true when user has CREATE permission', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'INVOICES', permissionCode: 'CREATE' }
      ]));

      const result = PermissionService.canCreate('INVOICES');

      expect(result).toBe(true);
    });
  });

  describe('canUpdate', () => {
    it('should return true when user has UPDATE permission', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'CUSTOMERS', permissionCode: 'UPDATE' }
      ]));

      const result = PermissionService.canUpdate('CUSTOMERS');

      expect(result).toBe(true);
    });
  });

  describe('canDelete', () => {
    it('should return true when user has DELETE permission', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'PRODUCTS', permissionCode: 'DELETE' }
      ]));

      const result = PermissionService.canDelete('PRODUCTS');

      expect(result).toBe(true);
    });
  });

  describe('getScreenCodesWithPermissions', () => {
    it('should return unique screen codes', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'USERS', permissionCode: 'VIEW' },
        { screenCode: 'USERS', permissionCode: 'CREATE' },
        { screenCode: 'PRODUCTS', permissionCode: 'VIEW' },
        { screenCode: 'INVOICES', permissionCode: 'VIEW' }
      ]));

      const result = PermissionService.getScreenCodesWithPermissions();

      expect(result).toEqual(['USERS', 'PRODUCTS', 'INVOICES']);
    });

    it('should return empty array when no permissions', () => {
      const result = PermissionService.getScreenCodesWithPermissions();

      expect(result).toEqual([]);
    });
  });

  describe('screenHasPermissions', () => {
    it('should return true when screen has permissions', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'SETTINGS', permissionCode: 'VIEW' }
      ]));

      const result = PermissionService.screenHasPermissions('SETTINGS');

      expect(result).toBe(true);
    });

    it('should return false when screen has no permissions', () => {
      localStorage.setItem('user_permissions', JSON.stringify([
        { screenCode: 'SETTINGS', permissionCode: 'VIEW' }
      ]));

      const result = PermissionService.screenHasPermissions('REPORTS');

      expect(result).toBe(false);
    });
  });
});
