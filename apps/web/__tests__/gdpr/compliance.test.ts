/**
 * @fileoverview Tests for GDPR compliance
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  GDPRCompliance,
  ConsentType,
  DataSubjectRequestType,
  DataCategory,
} from '@/lib/gdpr/compliance';

describe('GDPR Compliance', () => {
  let gdpr: GDPRCompliance;

  beforeEach(() => {
    gdpr = new GDPRCompliance();
  });

  describe('Consent Management', () => {
    it('should record consent', () => {
      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: new Date(),
      });

      expect(gdpr.hasConsent('user-123', ConsentType.ANALYTICS)).toBe(true);
    });

    it('should check consent', () => {
      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.MARKETING,
        granted: true,
        timestamp: new Date(),
      });

      expect(gdpr.hasConsent('user-123', ConsentType.MARKETING)).toBe(true);
      expect(gdpr.hasConsent('user-123', ConsentType.ANALYTICS)).toBe(false);
    });

    it('should withdraw consent', () => {
      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: new Date(),
      });

      gdpr.withdrawConsent('user-123', ConsentType.ANALYTICS);

      expect(gdpr.hasConsent('user-123', ConsentType.ANALYTICS)).toBe(false);
    });

    it('should get user consents', () => {
      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: new Date(),
      });

      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.MARKETING,
        granted: true,
        timestamp: new Date(),
      });

      const consents = gdpr.getUserConsents('user-123');
      expect(consents).toHaveLength(2);
    });

    it('should use latest consent', () => {
      const oldDate = new Date('2023-01-01');
      const newDate = new Date('2024-01-01');

      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: oldDate,
      });

      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: false,
        timestamp: newDate,
      });

      expect(gdpr.hasConsent('user-123', ConsentType.ANALYTICS)).toBe(false);
    });
  });

  describe('Data Subject Requests', () => {
    it('should export user data', async () => {
      const data = await gdpr.exportUserData('user-123');

      expect(data).toHaveProperty('userId', 'user-123');
      expect(data).toHaveProperty('personalData');
      expect(data).toHaveProperty('consents');
      expect(data).toHaveProperty('exportedAt');
    });

    it('should anonymize user data', async () => {
      await expect(gdpr.anonymizeUserData('user-123')).resolves.toBeUndefined();
    });

    it('should delete user data', async () => {
      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: new Date(),
      });

      await gdpr.deleteUserData('user-123');

      expect(gdpr.getUserConsents('user-123')).toHaveLength(0);
    });

    it('should delete data by category', async () => {
      await expect(
        gdpr.deleteUserData('user-123', DataCategory.CONTACT)
      ).resolves.toBeUndefined();
    });

    it('should process data subject request', async () => {
      const request = {
        id: 'req-123',
        userId: 'user-123',
        requestType: DataSubjectRequestType.ACCESS,
        status: 'pending' as const,
        createdAt: new Date(),
      };

      await expect(gdpr.processDataSubjectRequest(request)).resolves.toBeUndefined();
    });
  });

  describe('Retention Policies', () => {
    it('should check if data should be deleted', () => {
      const oldDate = new Date('2020-01-01');

      const shouldDelete = gdpr.shouldDeleteData(
        DataCategory.TECHNICAL,
        oldDate
      );

      expect(shouldDelete).toBe(true);
    });

    it('should not delete recent data', () => {
      const recentDate = new Date();

      const shouldDelete = gdpr.shouldDeleteData(
        DataCategory.TECHNICAL,
        recentDate
      );

      expect(shouldDelete).toBe(false);
    });

    it('should respect retention periods', () => {
      const financialOldDate = new Date();
      financialOldDate.setFullYear(financialOldDate.getFullYear() - 8);

      const shouldDelete = gdpr.shouldDeleteData(
        DataCategory.FINANCIAL,
        financialOldDate
      );

      expect(shouldDelete).toBe(true);
    });
  });

  describe('Privacy Notice', () => {
    it('should generate privacy notice', () => {
      const notice = gdpr.generatePrivacyNotice();

      expect(notice).toContain('Privacy Notice');
      expect(notice).toContain('Data We Collect');
      expect(notice).toContain('Your Rights');
    });
  });

  describe('Consent Form', () => {
    it('should generate consent form', () => {
      const form = gdpr.generateConsentForm();

      expect(form).toHaveProperty('necessary');
      expect(form).toHaveProperty('analytics');
      expect(form).toHaveProperty('marketing');
      expect(form.necessary.required).toBe(true);
      expect(form.analytics.required).toBe(false);
    });
  });

  describe('Processing Lawfulness', () => {
    it('should validate processing lawfulness', () => {
      gdpr.recordConsent({
        userId: 'user-123',
        consentType: ConsentType.ANALYTICS,
        granted: true,
        timestamp: new Date(),
      });

      expect(gdpr.validateProcessingLawfulness('user-123', 'analytics')).toBe(true);
    });

    it('should reject unlawful processing', () => {
      expect(gdpr.validateProcessingLawfulness('user-123', 'marketing')).toBe(false);
    });

    it('should allow necessary processing', () => {
      expect(gdpr.validateProcessingLawfulness('user-123', 'essential')).toBe(true);
    });
  });

  describe('Data Access Logging', () => {
    it('should log data access', () => {
      expect(() => {
        gdpr.logDataAccess('user-123', 'admin', 'support');
      }).not.toThrow();
    });
  });

  describe('Breach Notification', () => {
    it('should require notification for large breaches', () => {
      const shouldNotify = gdpr.shouldNotifyBreach(150, [DataCategory.CONTACT]);

      expect(shouldNotify).toBe(true);
    });

    it('should require notification for sensitive data', () => {
      const shouldNotify = gdpr.shouldNotifyBreach(50, [
        DataCategory.FINANCIAL,
      ]);

      expect(shouldNotify).toBe(true);
    });

    it('should not require notification for minor breaches', () => {
      const shouldNotify = gdpr.shouldNotifyBreach(50, [
        DataCategory.TECHNICAL,
      ]);

      expect(shouldNotify).toBe(false);
    });
  });

  describe('Data Categories', () => {
    it('should have all data categories', () => {
      expect(DataCategory.IDENTITY).toBe('identity');
      expect(DataCategory.CONTACT).toBe('contact');
      expect(DataCategory.FINANCIAL).toBe('financial');
      expect(DataCategory.BEHAVIORAL).toBe('behavioral');
      expect(DataCategory.TECHNICAL).toBe('technical');
    });
  });

  describe('Consent Types', () => {
    it('should have all consent types', () => {
      expect(ConsentType.NECESSARY).toBe('necessary');
      expect(ConsentType.ANALYTICS).toBe('analytics');
      expect(ConsentType.MARKETING).toBe('marketing');
      expect(ConsentType.PREFERENCES).toBe('preferences');
    });
  });

  describe('Request Types', () => {
    it('should have all request types', () => {
      expect(DataSubjectRequestType.ACCESS).toBe('access');
      expect(DataSubjectRequestType.RECTIFICATION).toBe('rectification');
      expect(DataSubjectRequestType.ERASURE).toBe('erasure');
      expect(DataSubjectRequestType.RESTRICTION).toBe('restriction');
      expect(DataSubjectRequestType.PORTABILITY).toBe('portability');
      expect(DataSubjectRequestType.OBJECTION).toBe('objection');
    });
  });
});

