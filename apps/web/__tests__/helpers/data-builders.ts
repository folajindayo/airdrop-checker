/**
 * Test data builders
 * Provides builder pattern for creating test data
 */

import type { AirdropProject } from '@airdrop-finder/shared';

/**
 * Builder for creating test airdrop projects
 */
export class AirdropProjectBuilder {
  private project: Partial<AirdropProject> = {
    id: 'test-project',
    name: 'Test Project',
    status: 'confirmed',
    chains: [1],
    criteria: [],
  };

  withId(id: string): this {
    this.project.id = id;
    return this;
  }

  withName(name: string): this {
    this.project.name = name;
    return this;
  }

  withStatus(status: 'confirmed' | 'rumored' | 'announced'): this {
    this.project.status = status;
    return this;
  }

  withChains(chains: number[]): this {
    this.project.chains = chains;
    return this;
  }

  withCriteria(criteria: any[]): this {
    this.project.criteria = criteria;
    return this;
  }

  build(): AirdropProject {
    return this.project as AirdropProject;
  }
}

/**
 * Builder for creating test reminders
 */
export class ReminderBuilder {
  private reminder: any = {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    type: 'claim',
    reminderTime: new Date(Date.now() + 86400000).toISOString(),
    message: 'Test reminder',
    enabled: true,
  };

  withAddress(address: string): this {
    this.reminder.address = address;
    return this;
  }

  withType(type: 'snapshot' | 'claim' | 'announcement' | 'custom'): this {
    this.reminder.type = type;
    return this;
  }

  withReminderTime(time: string): this {
    this.reminder.reminderTime = time;
    return this;
  }

  withMessage(message: string): this {
    this.reminder.message = message;
    return this;
  }

  withEnabled(enabled: boolean): this {
    this.reminder.enabled = enabled;
    return this;
  }

  build(): any {
    return { ...this.reminder };
  }
}

/**
 * Builder for creating test claims
 */
export class ClaimBuilder {
  private claim: any = {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    projectId: 'test-project',
    projectName: 'Test Project',
    status: 'claimed',
    amount: '1000',
    valueUSD: 1000,
  };

  withAddress(address: string): this {
    this.claim.address = address;
    return this;
  }

  withProjectId(projectId: string): this {
    this.claim.projectId = projectId;
    return this;
  }

  withStatus(status: 'claimed' | 'pending' | 'failed'): this {
    this.claim.status = status;
    return this;
  }

  withAmount(amount: string): this {
    this.claim.amount = amount;
    return this;
  }

  withValueUSD(value: number): this {
    this.claim.valueUSD = value;
    return this;
  }

  build(): any {
    return { ...this.claim };
  }
}

/**
 * Helper functions for creating test data
 */
export const testDataBuilders = {
  airdropProject: () => new AirdropProjectBuilder(),
  reminder: () => new ReminderBuilder(),
  claim: () => new ClaimBuilder(),
};

