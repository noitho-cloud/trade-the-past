import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeeklyViewClient } from "../WeeklyViewClient";
import type { MarketEventSummary } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const mockEvents: MarketEventSummary[] = [
  {
    id: "evt-001",
    title: "Fed Holds Rates Steady",
    type: "interest-rates",
    date: new Date().toISOString().split("T")[0],
    summary: "The Fed held rates steady.",
    imageUrl: null,
    source: "Reuters",
    keyReaction: { asset: "S&P 500", direction: "up", day1Pct: 1.1 },
  },
  {
    id: "evt-002",
    title: "Tesla Reports Record Q1",
    type: "earnings",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    summary: "Tesla delivered record vehicles.",
    imageUrl: null,
    source: "Bloomberg",
    keyReaction: { asset: "TSLA", direction: "up", day1Pct: 3.2 },
  },
];

describe("Task 0013 — Interactive states", () => {
  describe("Event card hover classes", () => {
    it("does NOT apply group-hover:text-foreground/80 to headline", () => {
      render(<WeeklyViewClient initialEvents={mockEvents} />);
      const headline = screen.getByText("Fed Holds Rates Steady");
      expect(headline.className).not.toContain("group-hover:text-foreground/80");
    });

    it("applies hover:shadow-md and hover:-translate-y-0.5 to card links", () => {
      render(<WeeklyViewClient initialEvents={mockEvents} />);
      const links = screen.getAllByRole("link");
      const cardLink = links.find((l) => l.getAttribute("href")?.startsWith("/event/"));
      expect(cardLink).toBeDefined();
      expect(cardLink!.className).toContain("hover:shadow-md");
      expect(cardLink!.className).toContain("hover:-translate-y-0.5");
    });
  });

  describe("Card entrance animations", () => {
    it("applies staggered animation delays to event cards", () => {
      render(<WeeklyViewClient initialEvents={mockEvents} />);
      const links = screen.getAllByRole("link");
      const cardLinks = links.filter((l) =>
        l.getAttribute("href")?.startsWith("/event/")
      );
      expect(cardLinks.length).toBe(2);

      cardLinks.forEach((link, i) => {
        expect(link.style.animationDelay).toBe(`${i * 60}ms`);
      });
    });

    it("applies card-enter class to event cards", () => {
      render(<WeeklyViewClient initialEvents={mockEvents} />);
      const links = screen.getAllByRole("link");
      const cardLink = links.find((l) => l.getAttribute("href")?.startsWith("/event/"));
      expect(cardLink!.className).toContain("card-enter");
    });
  });

});
