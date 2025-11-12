import { AuthService } from '../authService';
import { PermissionService } from '../permissionService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock PermissionService
jest.mock('../permissionService', () => ({
  PermissionService: {
    setUserPermissions: jest.fn(),
    clearUserPermissions: jest.fn(),
  },
}));

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

describe('AuthService', () => {
  const mockLoginData = {
    email: 'test@test.com',
    password: 'password123',
  };

  const mockLoginResponse = {
    access_token: 'test-token-123',
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      roleId: 1,
      role: {
        id: 1,
        name: 'Admin',
      },
      permissions: [
        { id: 1, code: 'VIEW_USERS' },
        { id: 2, code: 'CREATE_USERS' },
      ],
      tenantId: 1,
      tenant: {
        id: 1,
        name: 'Test Company',
      },
    },
  };

  const mockRegisterData = {
    tenant: {
      name: 'Test Company',
      email: 'company@test.com',
      taxId: '123456789',
      address: '123 Test St',
      phone: '555-1234',
    },
    admin: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
    },
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();

    // Set default environment variable
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  });

  describe('login', () => {
    it('should successfully login and store token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse,
      });

      const result = await AuthService.login(mockLoginData);

      expect(result).toEqual(mockLoginResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockLoginData),
        }
      );
      expect(localStorage.getItem('auth_token')).toBe('test-token-123');
      expect(localStorage.getItem('tenant_id')).toBe('1');
      expect(localStorage.getItem('tenant_name')).toBe('Test Company');
      expect(PermissionService.setUserPermissions).toHaveBeenCalledWith(
        mockLoginResponse.user.permissions
      );
    });

    it('should throw error on failed login', async () => {
      const errorMessage = 'Credenciales inválidas';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: errorMessage }),
      });

      await expect(AuthService.login(mockLoginData)).rejects.toThrow(
        errorMessage
      );
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(AuthService.login(mockLoginData)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle login without tenant information', async () => {
      const responseWithoutTenant = {
        ...mockLoginResponse,
        user: {
          ...mockLoginResponse.user,
          tenant: undefined,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutTenant,
      });

      const result = await AuthService.login(mockLoginData);

      expect(result).toEqual(responseWithoutTenant);
      // When tenant is undefined, tenantName is not set, so it should be null
      expect(localStorage.getItem('tenant_name')).toBeNull();
    });
  });

  describe('register', () => {
    it('should successfully register a new tenant and admin', async () => {
      const mockRegisterResponse = {
        message: 'Empresa registrada exitosamente',
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@test.com',
          roleId: 1,
          role: {
            id: 1,
            name: 'Admin',
          },
          tenantId: 1,
        },
        tenant: {
          id: 1,
          name: 'Test Company',
          email: 'company@test.com',
          taxId: '123456789',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegisterResponse,
      });

      const result = await AuthService.register(mockRegisterData);

      expect(result).toEqual(mockRegisterResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRegisterData),
        }
      );
      // Token should NOT be stored on registration
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should throw error on failed registration', async () => {
      const errorMessage = 'Email ya registrado';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: errorMessage }),
      });

      await expect(AuthService.register(mockRegisterData)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe('logout', () => {
    it('should clear all auth data from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('tenant_id', '1');
      localStorage.setItem('tenant_name', 'Test Company');
      localStorage.setItem('active_branch_id', '1');
      localStorage.setItem('active_branch_name', 'Main Branch');

      AuthService.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('tenant_id')).toBeNull();
      expect(localStorage.getItem('tenant_name')).toBeNull();
      expect(localStorage.getItem('active_branch_id')).toBeNull();
      expect(localStorage.getItem('active_branch_name')).toBeNull();
      expect(PermissionService.clearUserPermissions).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');

      const token = AuthService.getToken();

      expect(token).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      const token = AuthService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', 'test-token');

      const isAuth = AuthService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when no token exists', () => {
      const isAuth = AuthService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('getProfile', () => {
    it('should throw error when no token exists', async () => {
      await expect(AuthService.getProfile()).rejects.toThrow(
        'No hay token de autenticación'
      );
    });

    // Note: Full test would require mocking apiGet
    // This is covered by the basic validation test above
  });
});
