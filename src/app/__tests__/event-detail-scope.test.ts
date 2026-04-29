import { describe, it, expect } from "vitest";
import { inferScopeFromId } from "../event/[id]/page";

describe("inferScopeFromId", () => {
  it("returns 'local' for live-local IDs", () => {
    expect(inferScopeFromId("live-local-0-2026-04-29")).toBe("local");
    expect(inferScopeFromId("live-local-3-2026-04-28")).toBe("local");
  });

  it("returns 'global' for live-global IDs", () => {
    expect(inferScopeFromId("live-global-0-2026-04-29")).toBe("global");
    expect(inferScopeFromId("live-global-5-2026-04-25")).toBe("global");
  });

  it("defaults to 'global' for mock event IDs", () => {
    expect(inferScopeFromId("evt-fed-rate-hike")).toBe("global");
    expect(inferScopeFromId("evt-meta-layoffs")).toBe("global");
  });

  it("defaults to 'global' for unknown formats", () => {
    expect(inferScopeFromId("unknown-id")).toBe("global");
    expect(inferScopeFromId("")).toBe("global");
  });
});
