"use client";

import { useEffect, useRef } from "react";

export function ScrollSentinel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.dataset.scrolled = entry.isIntersecting
          ? "false"
          : "true";
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden="true" style={{ height: 0 }} />;
}
