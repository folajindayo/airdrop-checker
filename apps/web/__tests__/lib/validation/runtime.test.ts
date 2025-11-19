import {
  createRuntimeValidator,
  validateAtRuntime,
  isValidAtRuntime,
  createTypeGuard,
  createAssertion,
  RuntimeValidationError,
  validateWithDetails,
  createSchemaValidator,
} from "@/lib/validation/runtime";
import { z } from "zod";

describe("Runtime Validation", () => {
  const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18),
  });

  describe("createRuntimeValidator", () => {
    it("creates validator with validate method", () => {
      const validator = createRuntimeValidator(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(validator.validate(validData)).toBe(true);
      expect(validator.validate({ name: "J" })).toBe(false);
    });

    it("creates validator with assert method", () => {
      const validator = createRuntimeValidator(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(() => validator.assert(validData)).not.toThrow();
      expect(() => validator.assert({ name: "J" })).toThrow();
    });

    it("creates validator with parse method", () => {
      const validator = createRuntimeValidator(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(validator.parse(validData)).toEqual(validData);
      expect(() => validator.parse({ name: "J" })).toThrow();
    });
  });

  describe("validateAtRuntime", () => {
    it("validates and returns data for valid input", () => {
      const data = { name: "John", email: "john@example.com", age: 25 };
      const result = validateAtRuntime(userSchema, data);
      expect(result).toEqual(data);
    });

    it("throws error for invalid input", () => {
      const data = { name: "J", email: "invalid", age: 15 };
      expect(() => validateAtRuntime(userSchema, data)).toThrow();
    });

    it("includes custom error message", () => {
      const data = { name: "J" };
      expect(() => validateAtRuntime(userSchema, data, "Custom error")).toThrow(
        "Custom error"
      );
    });
  });

  describe("isValidAtRuntime", () => {
    it("returns true for valid data", () => {
      const data = { name: "John", email: "john@example.com", age: 25 };
      expect(isValidAtRuntime(userSchema, data)).toBe(true);
    });

    it("returns false for invalid data", () => {
      const data = { name: "J" };
      expect(isValidAtRuntime(userSchema, data)).toBe(false);
    });
  });

  describe("createTypeGuard", () => {
    it("creates type guard function", () => {
      const isUser = createTypeGuard(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(isUser(validData)).toBe(true);
      expect(isUser({ name: "J" })).toBe(false);
    });
  });

  describe("createAssertion", () => {
    it("creates assertion function", () => {
      const assertUser = createAssertion(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(() => assertUser(validData)).not.toThrow();
      expect(() => assertUser({ name: "J" })).toThrow();
    });

    it("uses custom error message", () => {
      const assertUser = createAssertion(userSchema, "Not a valid user");
      expect(() => assertUser({ name: "J" })).toThrow("Not a valid user");
    });
  });

  describe("RuntimeValidationError", () => {
    it("creates error with message and errors", () => {
      const error = new RuntimeValidationError("Validation failed", []);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("RuntimeValidationError");
      expect(error.message).toBe("Validation failed");
    });
  });

  describe("validateWithDetails", () => {
    it("validates and returns data for valid input", () => {
      const data = { name: "John", email: "john@example.com", age: 25 };
      const result = validateWithDetails(userSchema, data);
      expect(result).toEqual(data);
    });

    it("throws RuntimeValidationError for invalid input", () => {
      const data = { name: "J" };
      try {
        validateWithDetails(userSchema, data);
        fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(RuntimeValidationError);
        if (error instanceof RuntimeValidationError) {
          expect(error.errors).toBeDefined();
          expect(error.errors.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("createSchemaValidator", () => {
    it("creates validator with isValid method", () => {
      const validator = createSchemaValidator(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(validator.isValid(validData)).toBe(true);
      expect(validator.isValid({ name: "J" })).toBe(false);
    });

    it("creates validator with validateOrNull method", () => {
      const validator = createSchemaValidator(userSchema);
      const validData = { name: "John", email: "john@example.com", age: 25 };

      expect(validator.validateOrNull(validData)).toEqual(validData);
      expect(validator.validateOrNull({ name: "J" })).toBeNull();
    });

    it("creates validator with validateOrDefault method", () => {
      const validator = createSchemaValidator(userSchema);
      const defaultUser = { name: "Default", email: "default@example.com", age: 18 };

      expect(validator.validateOrDefault({ name: "J" }, defaultUser)).toEqual(
        defaultUser
      );
    });
  });
});

