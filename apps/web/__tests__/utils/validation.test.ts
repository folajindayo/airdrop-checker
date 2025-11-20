/**
 * Validation Utilities Tests
 */

import {
  isValidEmail,
  isValidURL,
  isValidEthAddress,
  isValidENS,
} from '../../lib/utils/consolidated/validation.utils';

describe('isValidEmail', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});

describe('isValidEthAddress', () => {
  it('should validate correct address', () => {
    expect(isValidEthAddress('0x1234567890123456789012345678901234567890')).toBe(true);
  });

  it('should reject invalid address', () => {
    expect(isValidEthAddress('0xinvalid')).toBe(false);
  });
});

describe('isValidENS', () => {
  it('should validate ENS name', () => {
    expect(isValidENS('vitalik.eth')).toBe(true);
  });

  it('should reject invalid ENS', () => {
    expect(isValidENS('invalid')).toBe(false);
  });
});
