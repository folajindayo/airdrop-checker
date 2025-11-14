/**
 * Tests for Number Utility Functions
 */

import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  formatBytes,
  round,
  clamp,
  inRange,
  isEven,
  isOdd,
  isPositive,
  isNegative,
  random,
  randomInt,
  percentage,
  percentageChange,
  average,
  sum,
  median,
  min,
  max,
  standardDeviation,
  lerp,
  mapRange,
  isInteger,
  isFloat,
  isNumeric,
  toNumber,
  parseInt,
  parseFloat,
  factorial,
  gcd,
  lcm,
  isPrime,
  toRadians,
  toDegrees,
  distance,
  compoundInterest,
  roundUpToNearest,
  roundDownToNearest,
  movingAverage,
  normalize,
  denormalize,
  sign,
  abs,
  floor,
  ceil,
  trunc,
} from '@/lib/utils/number';

describe('Number Utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle decimals', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    });
  });

  describe('formatCurrency', () => {
    it('should format as USD by default', () => {
      expect(formatCurrency(1234.56)).toContain('1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('should format as percentage', () => {
      expect(formatPercentage(0.5)).toBe('50.00%');
      expect(formatPercentage(0.755, 1)).toBe('75.5%');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers', () => {
      expect(formatCompactNumber(1000)).toBe('1.0K');
      expect(formatCompactNumber(1000000)).toBe('1.0M');
      expect(formatCompactNumber(1000000000)).toBe('1.0B');
      expect(formatCompactNumber(1000000000000)).toBe('1.0T');
    });

    it('should not format small numbers', () => {
      expect(formatCompactNumber(100)).toBe('100');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toContain('KB');
      expect(formatBytes(1048576)).toContain('MB');
    });
  });

  describe('round', () => {
    it('should round to decimal places', () => {
      expect(round(1.2345, 2)).toBe(1.23);
      expect(round(1.2367, 2)).toBe(1.24);
    });
  });

  describe('clamp', () => {
    it('should clamp values', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('inRange', () => {
    it('should check if number is in range', () => {
      expect(inRange(5, 0, 10)).toBe(true);
      expect(inRange(15, 0, 10)).toBe(false);
    });
  });

  describe('isEven', () => {
    it('should check if even', () => {
      expect(isEven(2)).toBe(true);
      expect(isEven(3)).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('should check if odd', () => {
      expect(isOdd(3)).toBe(true);
      expect(isOdd(2)).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('should check if positive', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(-1)).toBe(false);
      expect(isPositive(0)).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('should check if negative', () => {
      expect(isNegative(-1)).toBe(true);
      expect(isNegative(1)).toBe(false);
      expect(isNegative(0)).toBe(false);
    });
  });

  describe('random', () => {
    it('should generate number in range', () => {
      const result = random(0, 10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe('randomInt', () => {
    it('should generate integer in range', () => {
      const result = randomInt(0, 10);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe('percentage', () => {
    it('should calculate percentage', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(25, 100)).toBe(25);
    });

    it('should handle zero total', () => {
      expect(percentage(50, 0)).toBe(0);
    });
  });

  describe('percentageChange', () => {
    it('should calculate percentage change', () => {
      expect(percentageChange(100, 150)).toBe(50);
      expect(percentageChange(100, 50)).toBe(-50);
    });
  });

  describe('average', () => {
    it('should calculate average', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20, 30])).toBe(20);
    });

    it('should handle empty array', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('sum', () => {
    it('should calculate sum', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
      expect(sum([10, 20, 30])).toBe(60);
    });
  });

  describe('median', () => {
    it('should calculate median for odd count', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate median for even count', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    it('should handle empty array', () => {
      expect(median([])).toBe(0);
    });
  });

  describe('min', () => {
    it('should find minimum', () => {
      expect(min([3, 1, 4, 1, 5])).toBe(1);
    });
  });

  describe('max', () => {
    it('should find maximum', () => {
      expect(max([3, 1, 4, 1, 5])).toBe(5);
    });
  });

  describe('standardDeviation', () => {
    it('should calculate standard deviation', () => {
      const result = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result).toBeCloseTo(2, 0);
    });
  });

  describe('lerp', () => {
    it('should interpolate', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 100, 0.25)).toBe(25);
    });
  });

  describe('mapRange', () => {
    it('should map between ranges', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(2.5, 0, 10, 0, 100)).toBe(25);
    });
  });

  describe('isInteger', () => {
    it('should check if integer', () => {
      expect(isInteger(5)).toBe(true);
      expect(isInteger(5.5)).toBe(false);
    });
  });

  describe('isFloat', () => {
    it('should check if float', () => {
      expect(isFloat(5.5)).toBe(true);
      expect(isFloat(5)).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should check if numeric', () => {
      expect(isNumeric(123)).toBe(true);
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('abc')).toBe(false);
    });
  });

  describe('toNumber', () => {
    it('should convert to number', () => {
      expect(toNumber('123')).toBe(123);
      expect(toNumber('abc', 0)).toBe(0);
    });
  });

  describe('parseInt', () => {
    it('should parse integer', () => {
      expect(parseInt('123')).toBe(123);
      expect(parseInt('abc', 10, 0)).toBe(0);
    });
  });

  describe('parseFloat', () => {
    it('should parse float', () => {
      expect(parseFloat('123.45')).toBe(123.45);
      expect(parseFloat('abc', 0)).toBe(0);
    });
  });

  describe('factorial', () => {
    it('should calculate factorial', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(5)).toBe(120);
    });
  });

  describe('gcd', () => {
    it('should calculate GCD', () => {
      expect(gcd(48, 18)).toBe(6);
      expect(gcd(100, 50)).toBe(50);
    });
  });

  describe('lcm', () => {
    it('should calculate LCM', () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(15, 20)).toBe(60);
    });
  });

  describe('isPrime', () => {
    it('should check if prime', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(7)).toBe(true);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(1)).toBe(false);
    });
  });

  describe('toRadians', () => {
    it('should convert degrees to radians', () => {
      expect(toRadians(180)).toBeCloseTo(Math.PI, 5);
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  describe('toDegrees', () => {
    it('should convert radians to degrees', () => {
      expect(toDegrees(Math.PI)).toBeCloseTo(180, 5);
      expect(toDegrees(Math.PI / 2)).toBeCloseTo(90, 5);
    });
  });

  describe('distance', () => {
    it('should calculate distance', () => {
      expect(distance(0, 0, 3, 4)).toBe(5);
      expect(distance(1, 1, 4, 5)).toBe(5);
    });
  });

  describe('compoundInterest', () => {
    it('should calculate compound interest', () => {
      const result = compoundInterest(1000, 0.05, 2, 1);
      expect(result).toBeCloseTo(1102.5, 1);
    });
  });

  describe('roundUpToNearest', () => {
    it('should round up to nearest', () => {
      expect(roundUpToNearest(23, 10)).toBe(30);
      expect(roundUpToNearest(31, 5)).toBe(35);
    });
  });

  describe('roundDownToNearest', () => {
    it('should round down to nearest', () => {
      expect(roundDownToNearest(23, 10)).toBe(20);
      expect(roundDownToNearest(31, 5)).toBe(30);
    });
  });

  describe('movingAverage', () => {
    it('should calculate moving average', () => {
      const result = movingAverage([1, 2, 3, 4, 5], 3);
      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('normalize', () => {
    it('should normalize to 0-1', () => {
      expect(normalize(5, 0, 10)).toBe(0.5);
      expect(normalize(0, 0, 10)).toBe(0);
      expect(normalize(10, 0, 10)).toBe(1);
    });
  });

  describe('denormalize', () => {
    it('should denormalize from 0-1', () => {
      expect(denormalize(0.5, 0, 10)).toBe(5);
      expect(denormalize(0, 0, 10)).toBe(0);
      expect(denormalize(1, 0, 10)).toBe(10);
    });
  });

  describe('sign', () => {
    it('should return sign', () => {
      expect(sign(5)).toBe(1);
      expect(sign(-5)).toBe(-1);
      expect(sign(0)).toBe(0);
    });
  });

  describe('abs', () => {
    it('should return absolute value', () => {
      expect(abs(-5)).toBe(5);
      expect(abs(5)).toBe(5);
    });
  });

  describe('floor', () => {
    it('should floor value', () => {
      expect(floor(4.7)).toBe(4);
      expect(floor(-4.7)).toBe(-5);
    });
  });

  describe('ceil', () => {
    it('should ceil value', () => {
      expect(ceil(4.1)).toBe(5);
      expect(ceil(-4.1)).toBe(-4);
    });
  });

  describe('trunc', () => {
    it('should truncate value', () => {
      expect(trunc(4.7)).toBe(4);
      expect(trunc(-4.7)).toBe(-4);
    });
  });
});

