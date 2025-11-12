import * as apiService from '../apiService';
import { BranchService } from '../branchService';

jest.mock('../apiService');

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

describe('BranchService', () => {
  const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Suppress console logs in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserBranches', () => {
    it('should fetch and filter active user branches', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        userBranches: [
          {
            id: 1,
            userId: 1,
            branchId: 1,
            isActive: 1,
            branch: {
              id: 1,
              code: 'BR001',
              name: 'Main Branch',
              isActive: 1
            },
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: 2,
            userId: 1,
            branchId: 2,
            isActive: 0,
            branch: {
              id: 2,
              code: 'BR002',
              name: 'Inactive Branch',
              isActive: 1
            },
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        ]
      };

      mockApiGet.mockResolvedValueOnce(mockUser);

      const result = await BranchService.getUserBranches(1);

      expect(result).toHaveLength(1);
      expect(result[0].branch.name).toBe('Main Branch');
      expect(mockApiGet).toHaveBeenCalledWith('/users/1');
    });

    it('should filter out inactive branches', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        userBranches: [
          {
            id: 1,
            userId: 1,
            branchId: 1,
            isActive: true,
            branch: {
              id: 1,
              code: 'BR001',
              name: 'Active Branch',
              isActive: false
            },
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        ]
      };

      mockApiGet.mockResolvedValueOnce(mockUser);

      const result = await BranchService.getUserBranches(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllBranches', () => {
    it('should fetch all branches', async () => {
      const mockBranches = [
        { id: 1, code: 'BR001', name: 'Branch 1', isActive: true },
        { id: 2, code: 'BR002', name: 'Branch 2', isActive: true }
      ];

      mockApiGet.mockResolvedValueOnce(mockBranches);

      const result = await BranchService.getAllBranches();

      expect(result).toEqual(mockBranches);
      expect(mockApiGet).toHaveBeenCalledWith('/branches');
    });
  });

  describe('getBranch', () => {
    it('should fetch branch by id', async () => {
      const mockBranch = {
        id: 1,
        code: 'BR001',
        name: 'Main Branch',
        isActive: true
      };

      mockApiGet.mockResolvedValueOnce(mockBranch);

      const result = await BranchService.getBranch(1);

      expect(result).toEqual(mockBranch);
      expect(mockApiGet).toHaveBeenCalledWith('/branches/1');
    });
  });

  describe('localStorage operations', () => {
    it('should get active branch id from localStorage', () => {
      localStorage.setItem('active_branch_id', '5');

      const result = BranchService.getActiveBranchId();

      expect(result).toBe(5);
    });

    it('should return null if no active branch id', () => {
      const result = BranchService.getActiveBranchId();

      expect(result).toBeNull();
    });

    it('should set active branch in localStorage', () => {
      BranchService.setActiveBranch(3, 'Test Branch');

      expect(localStorage.getItem('active_branch_id')).toBe('3');
      expect(localStorage.getItem('active_branch_name')).toBe('Test Branch');
    });

    it('should get active branch name from localStorage', () => {
      localStorage.setItem('active_branch_name', 'My Branch');

      const result = BranchService.getActiveBranchName();

      expect(result).toBe('My Branch');
    });

    it('should clear active branch from localStorage', () => {
      localStorage.setItem('active_branch_id', '1');
      localStorage.setItem('active_branch_name', 'Branch');

      BranchService.clearActiveBranch();

      expect(localStorage.getItem('active_branch_id')).toBeNull();
      expect(localStorage.getItem('active_branch_name')).toBeNull();
    });
  });
});
