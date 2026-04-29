import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { ScrollSentinel } from "../ScrollSentinel";

let observerCallback: IntersectionObserverCallback;
let observerOptions: IntersectionObserverInit | undefined;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-scrolled");
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
        observerCallback = cb;
        observerOptions = opts;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
    }
  );
});

describe("ScrollSentinel", () => {
  it("renders an invisible sentinel element", () => {
    const { container } = render(<ScrollSentinel />);
    const sentinel = container.firstElementChild;
    expect(sentinel).toBeTruthy();
    expect(sentinel?.getAttribute("aria-hidden")).toBe("true");
  });

  it("creates an IntersectionObserver with threshold 0", () => {
    render(<ScrollSentinel />);
    expect(mockObserve).toHaveBeenCalled();
    expect(observerOptions?.threshold).toBe(0);
  });

  it("sets data-scrolled='true' when sentinel is not intersecting", () => {
    render(<ScrollSentinel />);
    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    expect(document.documentElement.dataset.scrolled).toBe("true");
  });

  it("sets data-scrolled='false' when sentinel is intersecting", () => {
    document.documentElement.dataset.scrolled = "true";
    render(<ScrollSentinel />);
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    expect(document.documentElement.dataset.scrolled).toBe("false");
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = render(<ScrollSentinel />);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
