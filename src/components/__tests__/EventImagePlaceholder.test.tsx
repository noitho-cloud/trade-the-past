import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EventImagePlaceholder } from "../EventImagePlaceholder";
import { EVENT_TYPES } from "@/lib/types";

describe("Task 0012 — EventImagePlaceholder", () => {
  it("renders an SVG icon for every event type (small card)", () => {
    for (const type of EVENT_TYPES) {
      const { container } = render(
        <EventImagePlaceholder type={type} className="w-16 h-16 rounded-lg" />
      );
      const svg = container.querySelector("svg");
      expect(svg, `Missing SVG for type: ${type}`).toBeTruthy();
      expect(svg!.getAttribute("width")).toBe("24");
    }
  });

  it("renders no text elements in the small card placeholder", () => {
    for (const type of EVENT_TYPES) {
      const { container } = render(
        <EventImagePlaceholder type={type} className="w-16 h-16 rounded-lg" />
      );
      const spans = container.querySelectorAll("span");
      expect(
        spans.length,
        `Found text span in small placeholder for type: ${type}`
      ).toBe(0);
    }
  });

  it("renders a larger icon for the hero variant", () => {
    const { container } = render(
      <EventImagePlaceholder type="earnings" className="w-full h-48 rounded-xl" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute("width")).toBe("64");
  });

  it("includes a noise texture overlay for the hero variant", () => {
    const { container } = render(
      <EventImagePlaceholder type="regulation" className="w-full h-48 rounded-xl" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toBeTruthy();
    const textureDiv = wrapper!.querySelector("[class*='opacity']");
    expect(textureDiv, "Hero should have noise texture overlay").toBeTruthy();
  });

  it("does NOT include noise texture overlay for the small variant", () => {
    const { container } = render(
      <EventImagePlaceholder type="regulation" className="w-16 h-16 rounded-lg" />
    );
    const wrapper = container.firstElementChild;
    const children = wrapper!.children;
    for (const child of children) {
      expect(child.className).not.toContain("opacity-[0.035]");
    }
  });

  it("applies gradient background for all event types", () => {
    for (const type of EVENT_TYPES) {
      const { container } = render(
        <EventImagePlaceholder type={type} className="w-16 h-16 rounded-lg" />
      );
      const wrapper = container.firstElementChild;
      expect(
        wrapper!.className,
        `Missing gradient for type: ${type}`
      ).toContain("bg-gradient-to-br");
    }
  });

  it("each event type produces a unique SVG icon", () => {
    const svgContents = new Map<string, string>();
    for (const type of EVENT_TYPES) {
      const { container } = render(
        <EventImagePlaceholder type={type} className="w-16 h-16 rounded-lg" />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      svgContents.set(type, svg!.innerHTML);
    }
    const uniqueIcons = new Set(svgContents.values());
    expect(uniqueIcons.size).toBe(EVENT_TYPES.length);
  });

  it("does not cause layout shifts (consistent wrapper classes)", () => {
    for (const type of EVENT_TYPES) {
      const { container } = render(
        <EventImagePlaceholder type={type} className="w-16 h-16 rounded-lg" />
      );
      const wrapper = container.firstElementChild;
      expect(wrapper!.className).toContain("w-16 h-16 rounded-lg");
      expect(wrapper!.className).toContain("overflow-hidden");
    }
  });
});
