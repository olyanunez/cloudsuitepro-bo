import { cn } from '../utils';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', { active: true, inactive: false });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('inactive');
    });

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should override conflicting Tailwind classes', () => {
      // clsx and tailwind-merge should handle this
      const result = cn('p-4', 'p-8');
      // tailwind-merge should keep only p-8
      expect(result).toBe('p-8');
    });
  });
});
