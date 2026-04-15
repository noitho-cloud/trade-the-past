import { describe, it, expect } from "vitest";
import { createSession, getSession, deleteSession } from "../auth";

describe("Session store", () => {
  const testUserId = "test-user-123";

  it("creates a session and returns a session ID", () => {
    const sessionId = createSession(testUserId);
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThan(0);
  });

  it("retrieves a created session", () => {
    const sessionId = createSession(testUserId);
    const session = getSession(sessionId);
    expect(session).toBeDefined();
    expect(session!.userId).toBe(testUserId);
    expect(session!.createdAt).toBeLessThanOrEqual(Date.now());
  });

  it("stores access and refresh tokens", () => {
    const sessionId = createSession(testUserId, "access-tok", "refresh-tok");
    const session = getSession(sessionId);
    expect(session!.accessToken).toBe("access-tok");
    expect(session!.refreshToken).toBe("refresh-tok");
    expect(session!.accessTokenExpiresAt).toBeDefined();
  });

  it("returns undefined for non-existent session", () => {
    expect(getSession("non-existent-id")).toBeUndefined();
  });

  it("deletes a session", () => {
    const sessionId = createSession(testUserId);
    expect(getSession(sessionId)).toBeDefined();
    deleteSession(sessionId);
    expect(getSession(sessionId)).toBeUndefined();
  });

  it("generates unique session IDs", () => {
    const ids = new Set(Array.from({ length: 10 }, () => createSession(testUserId)));
    expect(ids.size).toBe(10);
  });
});
