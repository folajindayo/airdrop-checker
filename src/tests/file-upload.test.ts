import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FeatureService } from './feature';

describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(() => {
    service = new FeatureService();
  });

  describe('process', () => {
    it('should process valid input successfully', async () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      const result = await service.process(input);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(input.data);
    });

    it('should use cache for duplicate requests', async () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        data: { key: 'value' },
        timestamp: Date.now(),
      };

      const result1 = await service.process(input);
      const result2 = await service.process(input);

      expect(result1).toEqual(result2);
    });

    it('should handle errors gracefully', async () => {
      const invalidInput = {
        id: 'invalid-uuid',
        data: {},
        timestamp: -1,
      };

      await expect(service.process(invalidInput as any)).rejects.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', () => {
      expect(() => service.clearCache()).not.toThrow();
    });
  });
});
