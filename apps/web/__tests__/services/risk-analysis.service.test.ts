/**
 * Tests for RiskAnalysisService
 */

import { getRiskAnalysis } from '@/lib/services/risk-analysis.service';
import { MOCK_ADDRESS } from '../helpers';

describe('RiskAnalysisService', () => {
  describe('getRiskAnalysis', () => {
    it('should get risk analysis for valid address', async () => {
      const result = await getRiskAnalysis(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('riskScore');
    });

    it('should return normalized address', async () => {
      const upperCaseAddress = MOCK_ADDRESS.toUpperCase();
      const result = await getRiskAnalysis(upperCaseAddress);

      expect(result.address).toBe(MOCK_ADDRESS.toLowerCase());
    });

    it('should calculate risk score between 0 and 100', async () => {
      const result = await getRiskAnalysis(MOCK_ADDRESS);

      expect(typeof result.riskScore).toBe('number');
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    it('should include token approvals', async () => {
      const result = await getRiskAnalysis(MOCK_ADDRESS);

      expect(result).toHaveProperty('tokenApprovals');
      expect(Array.isArray(result.tokenApprovals)).toBe(true);
    });

    it('should include security recommendations', async () => {
      const result = await getRiskAnalysis(MOCK_ADDRESS);

      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});

