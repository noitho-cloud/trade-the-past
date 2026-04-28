import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "../logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs structured JSON to console.log for info level", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test message", { route: "/api/test" });
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test message");
    expect(parsed.context.route).toBe("/api/test");
    expect(parsed.timestamp).toBeDefined();
  });

  it("logs to console.error for error level", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("something broke");
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("error");
  });

  it("redacts sensitive keys in context", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("auth event", { apiKey: "secret-123", userId: "user-1" });
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.context.apiKey).toBe("[REDACTED]");
    expect(parsed.context.userId).toBe("user-1");
  });

  it("redacts keys matching secret/token/password/authorization", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("check", {
      secretValue: "x",
      accessToken: "y",
      password: "z",
      authorization: "w",
      normalField: "ok",
    });
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.context.secretValue).toBe("[REDACTED]");
    expect(parsed.context.accessToken).toBe("[REDACTED]");
    expect(parsed.context.password).toBe("[REDACTED]");
    expect(parsed.context.authorization).toBe("[REDACTED]");
    expect(parsed.context.normalField).toBe("ok");
  });
});
