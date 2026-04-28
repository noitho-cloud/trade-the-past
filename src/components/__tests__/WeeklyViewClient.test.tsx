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

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

function localDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const mockEvents: MarketEventSummary[] = [
  {
    id: "evt-001",
    title: "Fed Holds Rates Steady",
    type: "interest-rates",
    date: localDateStr(0),
    summary: "The Fed held rates steady.",
    imageUrl: null,
    source: "Reuters",
    keyReaction: { asset: "S&P 500", direction: "up", day1Pct: 1.1 },
  },
  {
    id: "evt-002",
    title: "Tesla Reports Record Q1",
    type: "earnings",
    date: localDateStr(-1),
    summary: "Tesla delivered record vehicles.",
    imageUrl: null,
    source: "Bloomberg",
    keyReaction: { asset: "TSLA", direction: "up", day1Pct: 3.2 },
  },
];

const localEvents: MarketEventSummary[] = [
  {
    id: "evt-006",
    title: "Deutsche Bank Faces Lawsuit",
    type: "lawsuits",
    date: localDateStr(-2),
    summary: "Deutsche Bank lawsuit filed.",
    imageUrl: null,
    source: "Handelsblatt",
    keyReaction: { asset: "Deutsche Bank", direction: "down", day1Pct: -3.4 },
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

  it("toggles back to global without breaking (uses cache)", async () => {
    const user = userEvent.setup();
    render(<WeeklyViewClient initialEvents={mockEvents} />);

    // Switch to local
    await user.click(screen.getByText("UK / DE / FR"));
    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });

    // Switch back to global — uses cached initial data, no fetch needed
    await user.click(screen.getByText("Global"));
    expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();
    expect(fetchCallCount).toBe(1); // only the local fetch
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

  it("renders a chevron affordance on each event card", () => {
    render(<WeeklyViewClient initialEvents={mockEvents} />);
    const chevrons = document.querySelectorAll("[data-testid='card-chevron']");
    expect(chevrons.length).toBe(mockEvents.length);
  });

  it("renders today's card with a prominent TODAY pill badge", () => {
    render(<WeeklyViewClient initialEvents={mockEvents} />);
    const todayBadge = screen.getByText("Today");
    expect(todayBadge).toBeInTheDocument();
    expect(todayBadge.className).toContain("bg-etoro-green");
    expect(todayBadge.className).toContain("text-white");
  });

  it("shows a prominent value proposition and interaction hint above events", () => {
    render(<WeeklyViewClient initialEvents={mockEvents} />);
    const tagline = screen.getByText(/one market-moving event per day/i);
    expect(tagline).toBeInTheDocument();
    expect(tagline.className).not.toContain("text-sm");

    const hint = screen.getByText(/select an event/i);
    expect(hint).toBeInTheDocument();
  });

  it("renders today's badge as a pill (not ghost text)", () => {
    render(<WeeklyViewClient initialEvents={mockEvents} />);
    const todayBadge = screen.getByText("Today");
    expect(todayBadge.className).toContain("rounded");
    expect(todayBadge.className).toContain("px-");
  });

  it("shows empty state when scope returns zero events", async () => {
    const user = userEvent.setup();
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ events: [], scope: "local" }),
    });

    render(<WeeklyViewClient initialEvents={mockEvents} />);
    await user.click(screen.getByText("UK / DE / FR"));

    await waitFor(() => {
      expect(
        screen.getByText(/no local events this week/i)
      ).toBeInTheDocument();
    });
  });

  it("renders one card per unique date when API returns multiple events for the same day", () => {
    const today = localDateStr(0);
    const sameDayEvents: MarketEventSummary[] = [
      {
        id: "dup-1",
        title: "Event A",
        type: "earnings",
        date: today,
        summary: "Summary A",
        imageUrl: null,
        source: "Reuters",
        keyReaction: null,
      },
      {
        id: "dup-2",
        title: "Event B",
        type: "geopolitical",
        date: today,
        summary: "Summary B",
        imageUrl: null,
        source: "Bloomberg",
        keyReaction: null,
      },
      {
        id: "dup-3",
        title: "Event C",
        type: "layoffs",
        date: today,
        summary: "Summary C",
        imageUrl: null,
        source: "CNBC",
        keyReaction: null,
      },
    ];

    render(<WeeklyViewClient initialEvents={sameDayEvents} />);

    const links = screen.getAllByRole("link").filter((a) =>
      a.getAttribute("href")?.startsWith("/event/")
    );
    expect(links).toHaveLength(1);
  });

  it("uses cached data when toggling back to a previously loaded scope", async () => {
    const user = userEvent.setup();
    render(<WeeklyViewClient initialEvents={mockEvents} />);

    // Toggle to local — triggers a fetch
    await user.click(screen.getByText("UK / DE / FR"));
    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });
    expect(fetchCallCount).toBe(1);

    // Toggle back to global — should use cached data, no fetch
    await user.click(screen.getByText("Global"));
    expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();
    expect(fetchCallCount).toBe(1); // no additional fetch

    // No skeleton should have appeared
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(0);
  });

  it("uses cached local data when toggling local → global → local", async () => {
    const user = userEvent.setup();
    render(<WeeklyViewClient initialEvents={mockEvents} />);

    // Toggle to local
    await user.click(screen.getByText("UK / DE / FR"));
    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });
    expect(fetchCallCount).toBe(1);

    // Toggle back to global (cached)
    await user.click(screen.getByText("Global"));
    expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();

    // Toggle to local again — should use cached local data
    await user.click(screen.getByText("UK / DE / FR"));
    expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    expect(fetchCallCount).toBe(1); // still no additional fetch
  });

  it("refetches when cache has expired (TTL exceeded)", async () => {
    const user = userEvent.setup();
    const realDateNow = Date.now;
    let fakeNow = realDateNow.call(Date);
    vi.spyOn(Date, "now").mockImplementation(() => fakeNow);

    render(<WeeklyViewClient initialEvents={mockEvents} />);

    // Toggle to local
    await user.click(screen.getByText("UK / DE / FR"));
    await waitFor(() => {
      expect(screen.getByText("Deutsche Bank Faces Lawsuit")).toBeInTheDocument();
    });
    expect(fetchCallCount).toBe(1);

    // Toggle back to global
    await user.click(screen.getByText("Global"));
    expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();

    // Advance time past the 2-minute TTL
    fakeNow += 2 * 60 * 1000 + 1;

    // Toggle to local again — cache expired, should refetch
    await user.click(screen.getByText("UK / DE / FR"));
    await waitFor(() => {
      expect(fetchCallCount).toBe(2);
    });

    vi.spyOn(Date, "now").mockRestore();
  });

  it("aborts the previous in-flight request when toggling rapidly", async () => {
    const user = userEvent.setup();
    const abortSpy = vi.fn();

    const originalAbortController = globalThis.AbortController;
    globalThis.AbortController = class extends originalAbortController {
      abort(...args: Parameters<AbortController["abort"]>) {
        abortSpy();
        return super.abort(...args);
      }
    } as typeof AbortController;

    let resolvers: Array<(value: unknown) => void> = [];
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return new Promise((resolve) => {
        resolvers.push(resolve);
      });
    });

    render(<WeeklyViewClient initialEvents={mockEvents} />);

    // Toggle to local — starts fetch 1
    await user.click(screen.getByText("UK / DE / FR"));

    // Toggle back to global immediately — should abort fetch 1
    await user.click(screen.getByText("Global"));

    expect(abortSpy).toHaveBeenCalled();

    globalThis.AbortController = originalAbortController;
  });

  it("hides summary paragraph when it duplicates the title", () => {
    const eventsWithDupSummary: MarketEventSummary[] = [
      {
        id: "dup-sum-1",
        title: "Fed Holds Rates Steady",
        type: "interest-rates",
        date: localDateStr(0),
        summary: "Fed Holds Rates Steady",
        imageUrl: null,
        source: "Google News",
        keyReaction: null,
      },
    ];

    const { container } = render(
      <WeeklyViewClient initialEvents={eventsWithDupSummary} />
    );

    const title = screen.getByText("Fed Holds Rates Steady");
    expect(title.tagName).toBe("H3");

    const summaryParagraphs = container.querySelectorAll(
      "p.text-xs.text-muted.line-clamp-2"
    );
    expect(summaryParagraphs).toHaveLength(0);
  });

  it("shows summary paragraph when it differs from the title", () => {
    render(<WeeklyViewClient initialEvents={mockEvents} />);

    expect(screen.getByText("The Fed held rates steady.")).toBeInTheDocument();
    expect(
      screen.getByText("Tesla delivered record vehicles.")
    ).toBeInTheDocument();
  });

  it("empty state has a button to switch back to Global", async () => {
    const user = userEvent.setup();
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ events: [], scope: "local" }),
    });

    render(<WeeklyViewClient initialEvents={mockEvents} />);
    await user.click(screen.getByText("UK / DE / FR"));

    await waitFor(() => {
      expect(
        screen.getByText(/no local events this week/i)
      ).toBeInTheDocument();
    });

    const switchButton = screen.getByRole("button", {
      name: /switch to global/i,
    });
    expect(switchButton).toBeInTheDocument();

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ events: mockEvents, scope: "global" }),
    });

    await user.click(switchButton);
    await waitFor(() => {
      expect(screen.getByText("Fed Holds Rates Steady")).toBeInTheDocument();
    });
  });
});
