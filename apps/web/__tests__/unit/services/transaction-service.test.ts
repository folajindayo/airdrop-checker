/**
 * Transaction Service Tests
 */

import { TransactionService } from '../../../src/services/transaction-service';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
  });

  describe('getTransactions', () => {
    it('should return transactions list', async () => {
      const result = await service.getTransactions('0x' + '0'.repeat(40));
      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('total');
    });

    it('should filter by chain', async () => {
      const result = await service.getTransactions('0x' + '0'.repeat(40), { chain: 'ethereum' });
      expect(result.transactions).toBeInstanceOf(Array);
    });
  });

  describe('analyzeTransactions', () => {
    it('should analyze transaction patterns', async () => {
      const result = await service.analyzeTransactions('0x' + '0'.repeat(40));
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('avgGasUsed');
    });
  });
});

