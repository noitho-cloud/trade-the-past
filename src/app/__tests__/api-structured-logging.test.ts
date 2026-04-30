import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const TEST_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock("@/lib/logger", () => ({ logger: mockLogger }));

vi.mock("@/lib/event-service", () => ({
  getEvents: vi.fn().mockRejectedValue(new Error("test failure")),
  getEventById: vi.fn().mockRejectedValue(new Error("test failure")),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
  }),
}));

vi.mock("@/lib/etoro-proxy", () => ({
  getEtoroRequestHeaders: vi.fn().mockResolvedValue(null),
  getEtoroKeys: vi.fn().mockResolvedValue(null),
  validateKeys: vi.fn().mockResolvedValue("valid"),
  EtoroAuthError: class EtoroAuthError extends Error {
    constructor() {
      super("eToro API keys are invalid — please reconnect");
      this.name = "EtoroAuthError";
    }
  },
}));

describe("API routes use structured logger for errors", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockLogger.error.mockClear();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("/api/events logs via logger.error, not raw console.error", async () => {
    const { GET } = await import("@/app/api/events/route");
    const req = new Request("http://localhost:3050/api/events?scope=global");
    Object.defineProperty(req, "nextUrl", {
      value: new URL("http://localhost:3050/api/events?scope=global"),
    });
    const res = await GET(req as never);
    expect(res.status).toBe(500);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Events API"),
      expect.objectContaining({ route: "/api/events" })
    );
  });

  it("/api/events/[id] logs via logger.error, not raw console.error", async () => {
    const { GET } = await import("@/app/api/events/[id]/route");
    const req = new Request("http://localhost:3050/api/events/test-id");
    Object.defineProperty(req, "nextUrl", {
      value: new URL("http://localhost:3050/api/events/test-id"),
    });
    const res = await GET(req as never, {
      params: Promise.resolve({ id: "test-id" }),
    });
    expect(res.status).toBe(500);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Event detail"),
      expect.objectContaining({ route: "/api/events/[id]" })
    );
  });

  it("/api/auth/etoro logs via logger.error on internal failure", async () => {
    vi.doMock("@/lib/auth", () => ({
      encryptKeys: () => {
        throw new Error("encryption failed");
      },
      KEYS_COOKIE_NAME: "ttp_etoro_keys",
      KEYS_MAX_AGE: 2592000,
    }));

    const { POST } = await import("@/app/api/auth/etoro/route");
    const req = new Request("http://localhost:3050/api/auth/etoro", {
      method: "POST",
      body: JSON.stringify({ apiKey: "test-key", userKey: "test-user" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Connect"),
      expect.objectContaining({ route: "/api/auth/etoro" })
    );
  });
});
