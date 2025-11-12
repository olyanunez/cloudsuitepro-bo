import * as apiService from '../apiService';
import profileService from '../profileService';

jest.mock('../apiService');

describe('ProfileService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
  const mockApiPatch = apiService.apiPatch as jest.MockedFunction<typeof apiService.apiPatch>;
  const mockApiPatchFormData = apiService.apiPatchFormData as jest.MockedFunction<typeof apiService.apiPatchFormData>;
  const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should fetch current user profile', async () => {
      const mockProfile = {
        id: 1,
        email: 'user@test.com',
        name: 'John',
        lastName: 'Doe',
        avatar: null,
        isActive: true,
        roleId: 1,
        tenantId: 1,
        role: {
          id: 1,
          name: 'Admin',
          code: 'ADMIN'
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      mockApiGet.mockResolvedValueOnce(mockProfile);

      const result = await profileService.getMyProfile();

      expect(result).toEqual(mockProfile);
      expect(mockApiGet).toHaveBeenCalledWith('/users/me');
    });
  });

  describe('updateMyProfile', () => {
    it('should update profile without avatar', async () => {
      const updateData = {
        name: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com'
      };

      const mockResponse = {
        id: 1,
        email: 'jane@test.com',
        name: 'Jane',
        lastName: 'Smith',
        avatar: null,
        isActive: true,
        roleId: 1,
        tenantId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await profileService.updateMyProfile(updateData);

      expect(result).toEqual(mockResponse);
      expect(mockApiPatch).toHaveBeenCalledWith('/users/me', updateData);
    });

    it('should update profile with avatar file', async () => {
      const updateData = {
        name: 'Jane',
        lastName: 'Smith'
      };

      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

      const mockResponse = {
        id: 1,
        email: 'jane@test.com',
        name: 'Jane',
        lastName: 'Smith',
        avatar: '/uploads/avatar.jpg',
        isActive: true,
        roleId: 1,
        tenantId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatchFormData.mockResolvedValueOnce(mockResponse);

      const result = await profileService.updateMyProfile(updateData, mockFile);

      expect(result).toEqual(mockResponse);
      expect(mockApiPatchFormData).toHaveBeenCalledWith('/users/me', expect.any(FormData));
    });

    it('should update only specific fields', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const mockResponse = {
        id: 1,
        email: 'user@test.com',
        name: 'Updated Name',
        lastName: 'Doe',
        avatar: null,
        isActive: true,
        roleId: 1,
        tenantId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      mockApiPatch.mockResolvedValueOnce(mockResponse);

      const result = await profileService.updateMyProfile(updateData);

      expect(result.name).toBe('Updated Name');
      expect(mockApiPatch).toHaveBeenCalledWith('/users/me', updateData);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const mockResponse = { message: 'Password changed successfully' };

      mockApiPost.mockResolvedValueOnce(mockResponse);

      const result = await profileService.changePassword('oldPassword123', 'newPassword456');

      expect(result).toEqual(mockResponse);
      expect(mockApiPost).toHaveBeenCalledWith('/users/me/change-password', {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456'
      });
    });

    it('should handle password change errors', async () => {
      const error = new Error('Current password is incorrect');
      mockApiPost.mockRejectedValueOnce(error);

      await expect(
        profileService.changePassword('wrongPassword', 'newPassword')
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
