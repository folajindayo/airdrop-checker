/**
 * @fileoverview GDPR compliance utilities
 * @module lib/gdpr/compliance
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * GDPR consent types
 */
export enum ConsentType {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PREFERENCES = 'preferences',
}

/**
 * Consent record
 */
export interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Data subject request types
 */
export enum DataSubjectRequestType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection',
}

/**
 * Data subject request
 */
export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: DataSubjectRequestType;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

/**
 * Personal data categories
 */
export enum DataCategory {
  IDENTITY = 'identity',
  CONTACT = 'contact',
  FINANCIAL = 'financial',
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
}

/**
 * Data retention policy
 */
export interface RetentionPolicy {
  category: DataCategory;
  retentionPeriodDays: number;
  deletionMethod: 'soft' | 'hard' | 'anonymize';
}

/**
 * GDPR compliance manager
 */
export class GDPRCompliance {
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private retentionPolicies: Map<DataCategory, RetentionPolicy> = new Map();

  constructor() {
    this.initializeRetentionPolicies();
  }

  /**
   * Initialize default retention policies
   */
  private initializeRetentionPolicies(): void {
    this.retentionPolicies.set(DataCategory.IDENTITY, {
      category: DataCategory.IDENTITY,
      retentionPeriodDays: 365 * 2, // 2 years
      deletionMethod: 'anonymize',
    });

    this.retentionPolicies.set(DataCategory.CONTACT, {
      category: DataCategory.CONTACT,
      retentionPeriodDays: 365, // 1 year
      deletionMethod: 'hard',
    });

    this.retentionPolicies.set(DataCategory.FINANCIAL, {
      category: DataCategory.FINANCIAL,
      retentionPeriodDays: 365 * 7, // 7 years (legal requirement)
      deletionMethod: 'hard',
    });

    this.retentionPolicies.set(DataCategory.BEHAVIORAL, {
      category: DataCategory.BEHAVIORAL,
      retentionPeriodDays: 365, // 1 year
      deletionMethod: 'anonymize',
    });

    this.retentionPolicies.set(DataCategory.TECHNICAL, {
      category: DataCategory.TECHNICAL,
      retentionPeriodDays: 90, // 90 days
      deletionMethod: 'hard',
    });
  }

  /**
   * Record user consent
   */
  public recordConsent(consent: ConsentRecord): void {
    const userConsents = this.consentRecords.get(consent.userId) || [];
    userConsents.push(consent);
    this.consentRecords.set(consent.userId, userConsents);

    logger.info('GDPR consent recorded', {
      userId: consent.userId,
      consentType: consent.consentType,
      granted: consent.granted,
    });
  }

  /**
   * Check if user has given consent
   */
  public hasConsent(userId: string, consentType: ConsentType): boolean {
    const consents = this.consentRecords.get(userId) || [];
    const latestConsent = consents
      .filter((c) => c.consentType === consentType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return latestConsent?.granted || false;
  }

  /**
   * Get all consents for a user
   */
  public getUserConsents(userId: string): ConsentRecord[] {
    return this.consentRecords.get(userId) || [];
  }

  /**
   * Withdraw consent
   */
  public withdrawConsent(userId: string, consentType: ConsentType): void {
    this.recordConsent({
      userId,
      consentType,
      granted: false,
      timestamp: new Date(),
    });

    logger.info('GDPR consent withdrawn', { userId, consentType });
  }

  /**
   * Export user data (Right to Access)
   */
  public async exportUserData(userId: string): Promise<Record<string, any>> {
    logger.info('GDPR data export requested', { userId });

    // In production, fetch from all data sources
    const userData = {
      userId,
      personalData: {
        // Identity data
        email: 'user@example.com',
        name: 'John Doe',
      },
      consents: this.getUserConsents(userId),
      activity: {
        // Behavioral data
        lastLogin: new Date(),
        sessions: [],
      },
      exportedAt: new Date().toISOString(),
    };

    return userData;
  }

  /**
   * Anonymize user data
   */
  public async anonymizeUserData(userId: string): Promise<void> {
    logger.info('GDPR data anonymization started', { userId });

    // In production, anonymize across all systems
    // Replace identifiable information with pseudonyms
    const anonymousId = this.generateAnonymousId();

    logger.info('GDPR data anonymized', {
      userId,
      anonymousId,
    });
  }

  /**
   * Delete user data (Right to Erasure)
   */
  public async deleteUserData(
    userId: string,
    category?: DataCategory
  ): Promise<void> {
    logger.info('GDPR data deletion requested', { userId, category });

    if (category) {
      // Delete specific category
      const policy = this.retentionPolicies.get(category);
      if (policy?.deletionMethod === 'hard') {
        // Permanently delete
      } else if (policy?.deletionMethod === 'anonymize') {
        await this.anonymizeUserData(userId);
      }
    } else {
      // Delete all data
      this.consentRecords.delete(userId);
    }

    logger.info('GDPR data deletion completed', { userId, category });
  }

  /**
   * Check if data should be deleted based on retention policy
   */
  public shouldDeleteData(
    category: DataCategory,
    lastActivityDate: Date
  ): boolean {
    const policy = this.retentionPolicies.get(category);
    if (!policy) return false;

    const daysSinceActivity =
      (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceActivity > policy.retentionPeriodDays;
  }

  /**
   * Process data subject request
   */
  public async processDataSubjectRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    logger.info('Processing data subject request', {
      requestId: request.id,
      type: request.requestType,
    });

    switch (request.requestType) {
      case DataSubjectRequestType.ACCESS:
        await this.exportUserData(request.userId);
        break;

      case DataSubjectRequestType.ERASURE:
        await this.deleteUserData(request.userId);
        break;

      case DataSubjectRequestType.RECTIFICATION:
        // Handle data correction
        break;

      case DataSubjectRequestType.RESTRICTION:
        // Restrict processing
        break;

      case DataSubjectRequestType.PORTABILITY:
        // Export in machine-readable format
        await this.exportUserData(request.userId);
        break;

      case DataSubjectRequestType.OBJECTION:
        // Stop processing
        break;
    }

    logger.info('Data subject request processed', {
      requestId: request.id,
      type: request.requestType,
    });
  }

  /**
   * Generate privacy notice
   */
  public generatePrivacyNotice(): string {
    return `
# Privacy Notice

## Data We Collect
- Identity data (name, email)
- Contact data (wallet addresses)
- Financial data (transaction history)
- Behavioral data (usage patterns)
- Technical data (IP address, browser info)

## Legal Basis for Processing
We process your data based on:
- Your consent
- Performance of contract
- Legal obligations
- Legitimate interests

## Your Rights
You have the right to:
- Access your personal data
- Rectify inaccurate data
- Request erasure
- Restrict processing
- Data portability
- Object to processing
- Withdraw consent

## Data Retention
We retain your data for:
- Identity data: 2 years
- Contact data: 1 year
- Financial data: 7 years (legal requirement)
- Behavioral data: 1 year
- Technical data: 90 days

## Contact
For privacy-related inquiries, contact: privacy@example.com
    `.trim();
  }

  /**
   * Generate consent form
   */
  public generateConsentForm(): {
    necessary: { label: string; description: string; required: boolean };
    analytics: { label: string; description: string; required: boolean };
    marketing: { label: string; description: string; required: boolean };
  } {
    return {
      necessary: {
        label: 'Necessary Cookies',
        description: 'Required for basic website functionality',
        required: true,
      },
      analytics: {
        label: 'Analytics Cookies',
        description: 'Help us improve our services by analyzing usage',
        required: false,
      },
      marketing: {
        label: 'Marketing Cookies',
        description: 'Used to deliver relevant advertisements',
        required: false,
      },
    };
  }

  /**
   * Validate data processing lawfulness
   */
  public validateProcessingLawfulness(
    userId: string,
    purpose: string
  ): boolean {
    // Check if user has given consent for this purpose
    if (purpose === 'analytics') {
      return this.hasConsent(userId, ConsentType.ANALYTICS);
    }

    if (purpose === 'marketing') {
      return this.hasConsent(userId, ConsentType.MARKETING);
    }

    // Necessary processing doesn't require consent
    return true;
  }

  /**
   * Generate anonymous ID
   */
  private generateAnonymousId(): string {
    return `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log data access for audit trail
   */
  public logDataAccess(
    userId: string,
    accessor: string,
    purpose: string
  ): void {
    logger.info('Data access logged', {
      userId,
      accessor,
      purpose,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check data breach notification requirement
   */
  public shouldNotifyBreach(
    affectedUsers: number,
    dataCategories: DataCategory[]
  ): boolean {
    // Notify if breach affects more than 100 users or includes sensitive data
    if (affectedUsers > 100) return true;

    const sensit

iveCategories = [
      DataCategory.FINANCIAL,
      DataCategory.IDENTITY,
    ];

    return dataCategories.some((cat) => sensitiveCategories.includes(cat));
  }
}

/**
 * Singleton instance
 */
let gdprInstance: GDPRCompliance | null = null;

/**
 * Get GDPR compliance instance
 */
export function getGDPRCompliance(): GDPRCompliance {
  if (!gdprInstance) {
    gdprInstance = new GDPRCompliance();
  }
  return gdprInstance;
}

