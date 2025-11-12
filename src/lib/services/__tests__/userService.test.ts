import * as apiService from '../apiService';
import { UserService } from '../userService';

jest.mock('../apiService');

describe('UserService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch all users and normalize data', async () => {
      const mockUsersFromBackend = [
        { id: 1, name: 'User 1', email: 'user1@test.com', isActive: true },
        { id: 2, name: 'User 2', email: 'user2@test.com', isActive: true },
      ];

      mockApiGet.mockResolvedValueOnce(mockUsersFromBackend);

      const result = await UserService.getUsers();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('User 1');
      expect(result[0].email).toBe('user1@test.com');
      expect(result[0].isActive).toBe(true);
      expect(mockApiGet).toHaveBeenCalledWith('/users');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id and normalize data', async () => {
      const mockUserFromBackend = { id: 1, name: 'User 1', email: 'user1@test.com', isActive: true };

      mockApiGet.mockResolvedValueOnce(mockUserFromBackend);

      const result = await UserService.getUserById(1);

      expect(result).toBeDefined();
      expect(result?.name).toBe('User 1');
      expect(result?.email).toBe('user1@test.com');
      expect(result?.isActive).toBe(true);
      expect(mockApiGet).toHaveBeenCalledWith('/users/1');
    });
  });

  describe('createUser', () => {
    it('should create a new user and normalize data', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        roleId: 1,
      };

      const mockResponseFromBackend = {
        id: 3,
        name: 'New User',
        email: 'newuser@test.com',
        roleId: 1,
        isActive: true
      };

      mockApiPost.mockResolvedValueOnce(mockResponseFromBackend);

      const result = await UserService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New User');
      expect(result.email).toBe('newuser@test.com');
      expect(result.roleId).toBe(1);
      expect(mockApiPost).toHaveBeenCalledWith('/users', expect.objectContaining({
        name: 'New User',
        email: 'newuser@test.com',
        roleId: 1
      }));
    });
  });

  describe('updateUser', () => {
    it('should update existing user and normalize data', async () => {
      const updateData = { name: 'Updated Name' };
      const mockResponseFromBackend = {
        id: 1,
        name: 'Updated Name',
        email: 'user@test.com',
        isActive: true
      };

      mockApiPatch.mockResolvedValueOnce(mockResponseFromBackend);

      const result = await UserService.updateUser(1, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('user@test.com');
      expect(mockApiPatch).toHaveBeenCalledWith('/users/1', updateData);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      mockApiDelete.mockResolvedValueOnce(undefined);

      await UserService.deleteUser(1);

      expect(mockApiDelete).toHaveBeenCalledWith('/users/1');
    });
  });
});
