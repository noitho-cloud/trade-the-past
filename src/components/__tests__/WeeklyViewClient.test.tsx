import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeeklyViewClient } from "../WeeklyViewClient";
import type { MarketEventSummary } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockEvents: MarketEventSummary[] = [
  {
    id: "evt-001",
    title: "Fed Holds Rates Steady",
    type: "interest-rates",
    date: new Date().toISOString().split("T")[0],
    imageUrl: null,
    source: "Reuters",
  },
  {
    id: "evt-002",
    title: "Tesla Reports Record Q1",
    type: "earnings",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    imageUrl: null,
    source: "Bloomberg",
  },
];

const localEvents: MarketEventSummary[] = [
  {
    id: "evt-006",
    title: "Deutsche Bank Faces Lawsuit",
    type: "lawsuits",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    imageUrl: null,
    source: "Handelsblatt",
  },
];

describe("WeeklyViewClient", () => {
  let fetchCallCount: number;

  beforeEach(() => {
    fetchCallCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        fetchCallCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: localEvents, scope: "local" }),
        });
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders initial events without fetching", () => {
    render(<WeeklyViewClient initialEvents={mockEvents} />);
    expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();
    expect(screen.getByText("Tesla Reports Record Q1")).toBeInTheDocument();
    expect(fetchCallCount).toBe(0);
  });

  it("does not trigger infinite fetch loop when toggling scope", async () => {
    const user = userEvent.setup();
    render(<WeeklyViewClient initialEvents={mockEvents} />);

    await user.click(screen.getByText("UK / DE / FR"));

    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });

    // Wait a bit to make sure no additional fetches happen
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    expect(fetchCallCount).toBe(1);
  });

  it("toggles back to global without breaking", async () => {
    const user = userEvent.setup();
    render(<WeeklyViewClient initialEvents={mockEvents} />);

    // Switch to local
    await user.click(screen.getByText("UK / DE / FR"));
    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });

    // Switch back to global
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ events: mockEvents, scope: "global" }),
    });

    await user.click(screen.getByText("Global"));
    await waitFor(() => {
      expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();
    });
  });

  it("shows loading skeleton while fetching", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void;
    (fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<WeeklyViewClient initialEvents={mockEvents} />);
    await user.click(screen.getByText("UK / DE / FR"));

    // Skeletons should be showing while fetch is pending
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);

    // Resolve the fetch
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ events: localEvents, scope: "local" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });
  });
});
