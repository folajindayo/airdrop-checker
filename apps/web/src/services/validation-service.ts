/**
 * Validation Service
 * Centralized validation logic
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ValidationService {
  /**
   * Validate Ethereum address
   */
  validateAddress(address: string): ValidationResult {
    const errors: string[] = [];

    if (!address) {
      errors.push('Address is required');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      errors.push('Invalid Ethereum address format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate transaction hash
   */
  validateTransactionHash(hash: string): ValidationResult {
    const errors: string[] = [];

    if (!hash) {
      errors.push('Transaction hash is required');
    } else if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      errors.push('Invalid transaction hash format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate amount
   */
  validateAmount(amount: string | number): ValidationResult {
    const errors: string[] = [];

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      errors.push('Amount must be a valid number');
    } else if (numAmount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate date range
   */
  validateDateRange(startDate: Date, endDate: Date): ValidationResult {
    const errors: string[] = [];

    if (!startDate || !endDate) {
      errors.push('Both start and end dates are required');
    } else if (startDate > endDate) {
      errors.push('Start date must be before end date');
    } else if (endDate > new Date()) {
      errors.push('End date cannot be in the future');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate pagination params
   */
  validatePagination(page: number, limit: number): ValidationResult {
    const errors: string[] = [];

    if (page < 1) {
      errors.push('Page must be at least 1');
    }

    if (limit < 1 || limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize string input
   */
  sanitize(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

export const validationService = new ValidationService();

