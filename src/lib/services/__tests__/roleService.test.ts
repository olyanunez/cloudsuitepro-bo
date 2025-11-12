import * as apiService from '../apiService';
import { RoleService } from '../roleService';
import { Role, RoleCreateInput, RoleUpdateInput } from '../../types/role';

jest.mock('../apiService');

describe('RoleService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getRoles', () => {
    it('should fetch all roles and normalize data', async () => {
      const mockRoles = [
        {
          id: 1,
          name: 'Admin',
          code: 'ADMIN',
          description: 'Administrator role',
          isActive: true,
          roleScreenPermissions: [],
          _count: { users: 5 }
        },
        {
          id: 2,
          name: 'User',
          code: 'USER',
          description: 'Regular user',
          isActive: true,
          roleScreenPermissions: [],
          _count: { users: 10 }
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockRoles);

      const result = await RoleService.getRoles();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Admin');
      expect(result[1].name).toBe('User');
      expect(mockApiGet).toHaveBeenCalledWith('/roles');
    });

    it('should return empty array on error', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Network error'));

      const result = await RoleService.getRoles();

      expect(result).toEqual([]);
    });
  });

  describe('getRoleById', () => {
    it('should fetch role by id', async () => {
      const mockRole = {
        id: 1,
        name: 'Admin',
        code: 'ADMIN',
        description: 'Administrator',
        isActive: true,
        roleScreenPermissions: []
      };

      mockApiGet.mockResolvedValueOnce(mockRole);

      const result = await RoleService.getRoleById(1);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Admin');
      expect(mockApiGet).toHaveBeenCalledWith('/roles/1');
    });

    it('should throw error when role not found', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Role not found'));

      await expect(RoleService.getRoleById(999)).rejects.toThrow('Role not found');
    });
  });

  describe('createRole', () => {
    it('should create a new role with permissions', async () => {
      const roleData: RoleCreateInput = {
        name: 'New Role',
        code: 'NEW_ROLE',
        description: 'A new role',
        screenPermissionIds: [1, 2, 3]
      };

      // Mock getRoles for validation
      mockApiGet.mockResolvedValueOnce([]);

      const mockResponse = {
        id: 3,
        name: 'New Role',
        code: 'NEW_ROLE',
        description: 'A new role',
        isActive: true,
        roleScreenPermissions: []
      };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await RoleService.createRole(roleData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Role');
      expect(mockApiPost).toHaveBeenCalledWith('/roles/with-permissions', {
        role: {
          name: 'New Role',
          code: 'NEW_ROLE',
          description: 'A new role',
          isActive: true
        },
        screenPermissionIds: [1, 2, 3]
      });
    });

    it('should throw error if role name already exists', async () => {
      const roleData: RoleCreateInput = {
        name: 'Admin',
        code: 'NEW_ADMIN',
        description: 'Duplicate name'
      };

      mockApiGet.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Admin',
          code: 'ADMIN',
          description: 'Existing admin',
          isActive: true,
          screensWithPermissions: [],
          permissionsCount: 0
        }
      ]);

      await expect(RoleService.createRole(roleData)).rejects.toThrow(
        "Ya existe un rol con el nombre 'Admin'"
      );
    });

    it('should throw error if role code already exists', async () => {
      const roleData: RoleCreateInput = {
        name: 'New Admin',
        code: 'ADMIN',
        description: 'Duplicate code'
      };

      mockApiGet.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Admin',
          code: 'ADMIN',
          description: 'Existing admin',
          isActive: true,
          screensWithPermissions: [],
          permissionsCount: 0
        }
      ]);

      await expect(RoleService.createRole(roleData)).rejects.toThrow(
        "Ya existe un rol con el código 'ADMIN'"
      );
    });
  });

  describe('updateRoleWithPermissions', () => {
    it('should update role with permissions', async () => {
      const updateData: RoleUpdateInput = {
        name: 'Updated Role',
        description: 'Updated description',
        initialScreenPermissionIds: [1, 2],
        selectedScreenPermissionIds: [2, 3]
      };

      mockApiGet.mockResolvedValueOnce([]);

      const mockResponse = {
        id: 1,
        name: 'Updated Role',
        code: 'ROLE',
        description: 'Updated description',
        isActive: true,
        roleScreenPermissions: []
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await RoleService.updateRoleWithPermissions(1, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Role');
      expect(mockApiPatch).toHaveBeenCalledWith('/roles/with-permissions/1', expect.objectContaining({
        role: expect.any(Object),
        permissionsToAdd: [3],
        permissionsToRemove: [1]
      }));
    });
  });

  describe('deleteRole', () => {
    it('should delete role by id', async () => {
      const mockResponse = { message: 'Role deleted successfully' };

      mockApiDelete.mockResolvedValueOnce(mockResponse);

      const result = await RoleService.deleteRole(1);

      expect(result).toEqual(mockResponse);
      expect(mockApiDelete).toHaveBeenCalledWith('/roles/1');
    });
  });

  describe('getPermissions', () => {
    it('should fetch permissions from screen-permissions endpoint', async () => {
      const mockScreenPermissions = [
        {
          id: 1,
          screenId: 1,
          permissionId: 1,
          permission: { id: 1, name: 'Read', code: 'READ', description: 'Read permission', module: 'users' },
          screen: { id: 1, name: 'Users', code: 'USERS' },
          isActive: true
        },
        {
          id: 2,
          screenId: 1,
          permissionId: 2,
          permission: { id: 2, name: 'Write', code: 'WRITE', description: 'Write permission', module: 'users' },
          screen: { id: 1, name: 'Users', code: 'USERS' },
          isActive: true
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockScreenPermissions);

      const result = await RoleService.getPermissions();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Read');
      expect(result[1].name).toBe('Write');
      expect(mockApiGet).toHaveBeenCalledWith('/screen-permissions');
    });

    it('should return empty array on error', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Network error'));

      const result = await RoleService.getPermissions();

      expect(result).toEqual([]);
    });
  });

  describe('getScreensWithPermissions', () => {
    it('should fetch and normalize screens with permissions', async () => {
      const mockResponse = [
        {
          id: 1,
          screenId: 1,
          permissionId: 1,
          screen: { id: 1, name: 'Dashboard', code: 'DASHBOARD' },
          permission: { id: 1, name: 'View', code: 'VIEW', description: 'View permission', module: 'dashboard' },
          isActive: true
        },
        {
          id: 2,
          screenId: 1,
          permissionId: 2,
          screen: { id: 1, name: 'Dashboard', code: 'DASHBOARD' },
          permission: { id: 2, name: 'Edit', code: 'EDIT', description: 'Edit permission', module: 'dashboard' },
          isActive: true
        }
      ];

      mockApiGet.mockResolvedValueOnce(mockResponse);

      const result = await RoleService.getScreensWithPermissions();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dashboard');
      expect(result[0].permissions).toHaveLength(2);
      expect(mockApiGet).toHaveBeenCalledWith('/screen-permissions');
    });
  });
});
