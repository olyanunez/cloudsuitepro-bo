import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  getAuthToken,
  getTenantId,
  setTenantId,
  isAuthenticated,
  getDefaultOptions,
} from '../apiService';

// Mock fetch globally
global.fetch = jest.fn();

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

// Mock window.location
delete (window as any).location;
(window as any).location = { href: '' };

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();
    (window as any).location.href = '';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  });

  describe('getAuthToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(getAuthToken()).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('getTenantId', () => {
    it('should return tenantId from localStorage', () => {
      localStorage.setItem('tenant_id', '123');
      expect(getTenantId()).toBe('123');
    });

    it('should return null if no tenantId exists', () => {
      expect(getTenantId()).toBeNull();
    });
  });

  describe('setTenantId', () => {
    it('should set tenantId in localStorage', () => {
      setTenantId('456');
      expect(localStorage.getItem('tenant_id')).toBe('456');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getDefaultOptions', () => {
    it('should return basic options without auth', () => {
      const options = getDefaultOptions('GET');

      expect(options.method).toBe('GET');
      expect(options.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should include Authorization header when token exists', () => {
      localStorage.setItem('auth_token', 'test-token');

      const options = getDefaultOptions('GET');

      expect((options.headers as any)['Authorization']).toBe('Bearer test-token');
    });

    it('should include X-Tenant-ID header when tenantId exists', () => {
      localStorage.setItem('tenant_id', '123');

      const options = getDefaultOptions('GET');

      expect((options.headers as any)['X-Tenant-ID']).toBe('123');
    });

    it('should include body when provided', () => {
      const body = { name: 'Test' };
      const options = getDefaultOptions('POST', body);

      expect(options.body).toBe(JSON.stringify(body));
    });
  });

  describe('apiGet', () => {
    it('should successfully fetch data', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiGet<typeof mockData>('/test');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include auth token in headers', async () => {
      localStorage.setItem('auth_token', 'test-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiGet('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle 401 error and redirect', async () => {
      localStorage.setItem('auth_token', 'expired-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiGet('/test')).rejects.toThrow('Sesión expirada');
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect((window as any).location.href).toBe('/login');
    });

    it('should handle other errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
      });

      await expect(apiGet('/test')).rejects.toThrow('Bad Request');
    });
  });

  describe('apiPost', () => {
    it('should successfully post data', async () => {
      const mockData = { id: 1, name: 'Created' };
      const postData = { name: 'New Item' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiPost<typeof mockData>('/test', postData);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });

    it('should handle POST without body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiPost('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('apiPatch', () => {
    it('should successfully patch data', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const patchData = { name: 'Updated Name' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiPatch<typeof mockData>('/test/1', patchData);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );
    });
  });

  describe('apiDelete', () => {
    it('should successfully delete data', async () => {
      const mockResponse = { message: 'Deleted' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiDelete<typeof mockResponse>('/test/1');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Error handling across all methods', () => {
    const methods = [
      { name: 'apiGet', fn: apiGet, args: ['/test'] },
      { name: 'apiPost', fn: apiPost, args: ['/test', {}] },
      { name: 'apiPatch', fn: apiPatch, args: ['/test', {}] },
      { name: 'apiDelete', fn: apiDelete, args: ['/test'] },
    ];

    methods.forEach(({ name, fn, args }) => {
      it(`${name} should handle network errors`, async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(
          new Error('Network error')
        );

        await expect((fn as any)(...args)).rejects.toThrow('Network error');
      });
    });
  });
});
