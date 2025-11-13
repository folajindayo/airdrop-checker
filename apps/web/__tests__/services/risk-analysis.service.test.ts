/**
 * Tests for RiskAnalysisService
 */

import { analyzeRisk } from '@/lib/services/risk-analysis.service';
import { MOCK_ADDRESS } from '../helpers';

describe('RiskAnalysisService', () => {
  describe('analyzeRisk', () => {
    it('should analyze risk for valid address', async () => {
      const result = await analyzeRisk(MOCK_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('riskScore');
      expect(result).toHaveProperty('approvals');
    });

    it('should calculate risk scores', async () => {
      const result = await analyzeRisk(MOCK_ADDRESS);

      expect(result.riskScore).toBeDefined();
      expect(result.riskScore).toHaveProperty('overall');
      expect(typeof result.riskScore.overall).toBe('number');
      expect(result.riskScore.overall).toBeGreaterThanOrEqual(0);
      expect(result.riskScore.overall).toBeLessThanOrEqual(100);
    });

    it('should include token approvals', async () => {
      const result = await analyzeRisk(MOCK_ADDRESS);

      expect(Array.isArray(result.approvals)).toBe(true);
      expect(typeof result.totalApprovals).toBe('number');
      expect(typeof result.criticalApprovals).toBe('number');
    });

    it('should include security checks', async () => {
      const result = await analyzeRisk(MOCK_ADDRESS);

      expect(Array.isArray(result.securityChecks)).toBe(true);
    });

    it('should include security recommendations', async () => {
      const result = await analyzeRisk(MOCK_ADDRESS);

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});

