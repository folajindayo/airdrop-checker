import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatCurrency,
  parseNumber,
  clampNumber,
  isEven,
  isOdd,
  toOrdinal,
  roundTo,
  inRange,
  sumNumbers,
  averageNumbers,
  isFiniteNumber,
  toNumber,
} from "@/lib/utils/number";

describe("Number Utilities", () => {
  describe("formatNumber", () => {
    it("formats numbers with commas", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000, 2)).toBe("1,000,000.00");
    });
  });

  describe("formatCompactNumber", () => {
    it("formats large numbers compactly", () => {
      expect(formatCompactNumber(1500)).toBe("1.5K");
      expect(formatCompactNumber(1500000)).toBe("1.5M");
      expect(formatCompactNumber(1500000000)).toBe("1.5B");
    });
  });

  describe("formatPercent", () => {
    it("formats as percentage", () => {
      expect(formatPercent(0.5)).toBe("50.00%");
      expect(formatPercent(0.123, 1)).toBe("12.3%");
    });
  });

  describe("formatCurrency", () => {
    it("formats currency", () => {
      expect(formatCurrency(1000)).toBe("$1,000.00");
      expect(formatCurrency(1000, "EUR")).toBe("€1,000.00");
    });
  });

  describe("parseNumber", () => {
    it("parses numbers from strings", () => {
      expect(parseNumber("$1,000.50")).toBe(1000.5);
      expect(parseNumber("invalid")).toBe(0);
    });
  });

  describe("clampNumber", () => {
    it("clamps numbers to range", () => {
      expect(clampNumber(5, 0, 10)).toBe(5);
      expect(clampNumber(-5, 0, 10)).toBe(0);
      expect(clampNumber(15, 0, 10)).toBe(10);
    });
  });

  describe("isEven", () => {
    it("checks if number is even", () => {
      expect(isEven(4)).toBe(true);
      expect(isEven(5)).toBe(false);
    });
  });

  describe("isOdd", () => {
    it("checks if number is odd", () => {
      expect(isOdd(5)).toBe(true);
      expect(isOdd(4)).toBe(false);
    });
  });

  describe("toOrdinal", () => {
    it("converts to ordinal", () => {
      expect(toOrdinal(1)).toBe("1st");
      expect(toOrdinal(2)).toBe("2nd");
      expect(toOrdinal(3)).toBe("3rd");
      expect(toOrdinal(4)).toBe("4th");
      expect(toOrdinal(21)).toBe("21st");
    });
  });

  describe("roundTo", () => {
    it("rounds to precision", () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 3)).toBe(3.142);
    });
  });

  describe("inRange", () => {
    it("checks if in range", () => {
      expect(inRange(5, 0, 10)).toBe(true);
      expect(inRange(15, 0, 10)).toBe(false);
    });
  });

  describe("sumNumbers", () => {
    it("sums numbers", () => {
      expect(sumNumbers(1, 2, 3, 4)).toBe(10);
    });
  });

  describe("averageNumbers", () => {
    it("calculates average", () => {
      expect(averageNumbers(2, 4, 6)).toBe(4);
    });
  });

  describe("isFiniteNumber", () => {
    it("checks if finite number", () => {
      expect(isFiniteNumber(5)).toBe(true);
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(NaN)).toBe(false);
    });
  });

  describe("toNumber", () => {
    it("converts to number safely", () => {
      expect(toNumber("5")).toBe(5);
      expect(toNumber("invalid", 0)).toBe(0);
    });
  });
});

