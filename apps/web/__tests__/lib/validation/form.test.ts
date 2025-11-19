import {
  validateForm,
  validateField,
  getFieldError,
  hasFieldError,
  clearFieldError,
  setFieldError,
  hasAnyErrors,
  getErrorMessages,
  FormErrors,
  FieldError,
} from "@/lib/validation/form";
import { z } from "zod";

describe("Form Validation", () => {
  const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18),
  });

  type UserForm = z.infer<typeof userSchema>;

  describe("validateForm", () => {
    it("validates correct form data", () => {
      const data = {
        name: "John",
        email: "john@example.com",
        age: 25,
      };

      const result = validateForm(userSchema, data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("returns errors for invalid form data", () => {
      const data = {
        name: "J",
        email: "invalid",
        age: 15,
      };

      const result = validateForm(userSchema, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.age).toBeDefined();
    });

    it("returns error messages", () => {
      const data = {
        name: "J",
        email: "invalid",
        age: 15,
      };

      const result = validateForm(userSchema, data);
      expect(result.errors.name?.message).toBeTruthy();
      expect(result.errors.email?.message).toBeTruthy();
    });
  });

  describe("validateField", () => {
    it("validates correct field value", () => {
      const error = validateField(userSchema, "name", "John");
      expect(error).toBeNull();
    });

    it("returns error for invalid field value", () => {
      const error = validateField(userSchema, "name", "J");
      expect(error).not.toBeNull();
      expect(error?.message).toBeTruthy();
    });
  });

  describe("getFieldError", () => {
    it("returns error message for field", () => {
      const errors: FormErrors<UserForm> = {
        name: { message: "Too short", type: "too_small" },
      };

      const message = getFieldError(errors, "name");
      expect(message).toBe("Too short");
    });

    it("returns undefined for field without error", () => {
      const errors: FormErrors<UserForm> = {};
      const message = getFieldError(errors, "name");
      expect(message).toBeUndefined();
    });
  });

  describe("hasFieldError", () => {
    it("returns true for field with error", () => {
      const errors: FormErrors<UserForm> = {
        name: { message: "Too short", type: "too_small" },
      };

      expect(hasFieldError(errors, "name")).toBe(true);
    });

    it("returns false for field without error", () => {
      const errors: FormErrors<UserForm> = {};
      expect(hasFieldError(errors, "name")).toBe(false);
    });
  });

  describe("clearFieldError", () => {
    it("removes error for specific field", () => {
      const errors: FormErrors<UserForm> = {
        name: { message: "Too short", type: "too_small" },
        email: { message: "Invalid email", type: "invalid_string" },
      };

      const newErrors = clearFieldError(errors, "name");
      expect(newErrors.name).toBeUndefined();
      expect(newErrors.email).toBeDefined();
    });
  });

  describe("setFieldError", () => {
    it("adds error for specific field", () => {
      const errors: FormErrors<UserForm> = {};
      const fieldError: FieldError = {
        message: "Too short",
        type: "too_small",
      };

      const newErrors = setFieldError(errors, "name", fieldError);
      expect(newErrors.name).toEqual(fieldError);
    });
  });

  describe("hasAnyErrors", () => {
    it("returns true when errors exist", () => {
      const errors: FormErrors<UserForm> = {
        name: { message: "Too short", type: "too_small" },
      };

      expect(hasAnyErrors(errors)).toBe(true);
    });

    it("returns false when no errors exist", () => {
      const errors: FormErrors<UserForm> = {};
      expect(hasAnyErrors(errors)).toBe(false);
    });
  });

  describe("getErrorMessages", () => {
    it("returns all error messages", () => {
      const errors: FormErrors<UserForm> = {
        name: { message: "Too short", type: "too_small" },
        email: { message: "Invalid email", type: "invalid_string" },
      };

      const messages = getErrorMessages(errors);
      expect(messages).toHaveLength(2);
      expect(messages).toContain("Too short");
      expect(messages).toContain("Invalid email");
    });

    it("returns empty array when no errors", () => {
      const errors: FormErrors<UserForm> = {};
      const messages = getErrorMessages(errors);
      expect(messages).toEqual([]);
    });
  });
});

