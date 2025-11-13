/**
 * Tests for TransactionSimulatorService
 */

import { TransactionSimulatorService } from '@/lib/services/transaction-simulator.service';
import { MOCK_ADDRESS, MOCK_TX_HASH } from '../helpers';

describe('TransactionSimulatorService', () => {
  describe('simulateTransaction', () => {
    it('should simulate a transaction', async () => {
      const result = await TransactionSimulatorService.simulateTransaction(
        MOCK_ADDRESS,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0x',
        '0',
        1
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('gasUsed');
      expect(result).toHaveProperty('totalCost');
    });

    it('should return gas estimation', async () => {
      const result = await TransactionSimulatorService.simulateTransaction(
        MOCK_ADDRESS,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0x',
        '0',
        1
      );

      expect(typeof result.gasUsed).toBe('number');
      expect(result.gasUsed).toBeGreaterThan(0);
    });

    it('should calculate total cost', async () => {
      const result = await TransactionSimulatorService.simulateTransaction(
        MOCK_ADDRESS,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0x',
        '0',
        1
      );

      expect(result.totalCost).toBeDefined();
      expect(typeof result.totalCost).toBe('string');
    });

    it('should include state changes', async () => {
      const result = await TransactionSimulatorService.simulateTransaction(
        MOCK_ADDRESS,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0x',
        '0',
        1
      );

      expect(Array.isArray(result.changes)).toBe(true);
    });
  });
});

