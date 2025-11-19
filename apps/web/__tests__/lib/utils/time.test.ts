import {
  formatDuration,
  formatRelativeTime,
  formatTimeRemaining,
  isExpired,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  isSameDay,
  getDaysBetween,
  formatTime,
} from "@/lib/utils/time";

describe("Time Utilities", () => {
  describe("formatDuration", () => {
    it("formats durations", () => {
      expect(formatDuration(1000)).toBe("1s");
      expect(formatDuration(60000)).toBe("1m 0s");
      expect(formatDuration(3600000)).toBe("1h 0m");
      expect(formatDuration(86400000)).toBe("1d 0h");
    });
  });

  describe("formatRelativeTime", () => {
    it("formats relative time", () => {
      const now = new Date();
      const fiveSecsAgo = new Date(now.getTime() - 5000);
      const oneMinAgo = new Date(now.getTime() - 60000);
      const oneHourAgo = new Date(now.getTime() - 3600000);

      expect(formatRelativeTime(fiveSecsAgo)).toBe("just now");
      expect(formatRelativeTime(oneMinAgo)).toBe("1 minute ago");
      expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
    });
  });

  describe("formatTimeRemaining", () => {
    it("formats time remaining", () => {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 3600000);
      expect(formatTimeRemaining(inOneHour)).toContain("h");
    });

    it("returns expired for past dates", () => {
      const past = new Date(Date.now() - 1000);
      expect(formatTimeRemaining(past)).toBe("expired");
    });
  });

  describe("isExpired", () => {
    it("checks if date is expired", () => {
      const past = new Date(Date.now() - 1000);
      const future = new Date(Date.now() + 1000);
      expect(isExpired(past)).toBe(true);
      expect(isExpired(future)).toBe(false);
    });
  });

  describe("addDays", () => {
    it("adds days to date", () => {
      const date = new Date("2024-01-01");
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });
  });

  describe("addHours", () => {
    it("adds hours to date", () => {
      const date = new Date("2024-01-01T00:00:00");
      const result = addHours(date, 5);
      expect(result.getHours()).toBe(5);
    });
  });

  describe("startOfDay", () => {
    it("gets start of day", () => {
      const date = new Date("2024-01-01T15:30:45");
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe("endOfDay", () => {
    it("gets end of day", () => {
      const date = new Date("2024-01-01T15:30:45");
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });
  });

  describe("isSameDay", () => {
    it("checks if same day", () => {
      const date1 = new Date("2024-01-01T10:00:00");
      const date2 = new Date("2024-01-01T20:00:00");
      const date3 = new Date("2024-01-02T10:00:00");
      
      expect(isSameDay(date1, date2)).toBe(true);
      expect(isSameDay(date1, date3)).toBe(false);
    });
  });

  describe("getDaysBetween", () => {
    it("calculates days between dates", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-06");
      expect(getDaysBetween(date1, date2)).toBe(5);
    });
  });

  describe("formatTime", () => {
    it("formats time in 12h format", () => {
      const date = new Date("2024-01-01T15:30:00");
      expect(formatTime(date, "12h")).toBe("3:30 PM");
    });

    it("formats time in 24h format", () => {
      const date = new Date("2024-01-01T15:30:00");
      expect(formatTime(date, "24h")).toBe("15:30");
    });
  });
});

