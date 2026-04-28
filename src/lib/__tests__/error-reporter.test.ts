import { describe, it, expect } from "vitest";
import { sanitizeErrorMessage } from "../error-reporter";

describe("sanitizeErrorMessage", () => {
  it("returns the original message for safe errors", () => {
    const err = new Error("User not found");
    expect(sanitizeErrorMessage(err)).toBe("User not found");
  });

  it("sanitizes SyntaxError messages", () => {
    const err = new SyntaxError("Unexpected end of JSON input");
    expect(sanitizeErrorMessage(err)).toBe("An unexpected error occurred");
  });

  it("sanitizes TypeError messages about undefined properties", () => {
    const err = new TypeError("Cannot read properties of undefined");
    expect(sanitizeErrorMessage(err)).toBe("An unexpected error occurred");
  });

  it("sanitizes network errors", () => {
    const err = new Error("fetch failed");
    expect(sanitizeErrorMessage(err)).toBe("An unexpected error occurred");
  });

  it("sanitizes connection errors", () => {
    expect(sanitizeErrorMessage(new Error("ECONNREFUSED"))).toBe("An unexpected error occurred");
    expect(sanitizeErrorMessage(new Error("ETIMEDOUT"))).toBe("An unexpected error occurred");
  });

  it("sanitizes very long error messages", () => {
    const err = new Error("x".repeat(300));
    expect(sanitizeErrorMessage(err)).toBe("An unexpected error occurred");
  });

  it("returns generic message for non-Error types", () => {
    expect(sanitizeErrorMessage("string error")).toBe("An unexpected error occurred");
    expect(sanitizeErrorMessage(null)).toBe("An unexpected error occurred");
    expect(sanitizeErrorMessage(undefined)).toBe("An unexpected error occurred");
  });
});
