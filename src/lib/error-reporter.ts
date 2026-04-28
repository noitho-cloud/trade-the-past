import { logger } from "./logger";

export function captureException(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(message, {
    ...context,
    stack: stack?.split("\n").slice(0, 5).join("\n"),
  });

  if (typeof window !== "undefined" && typeof window.__SENTRY_CAPTURE === "function") {
    window.__SENTRY_CAPTURE(error, context);
  }
}

export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const raw = error.message;
    const patterns = [
      /unexpected\s+(end|token)/i,
      /syntaxerror/i,
      /cannot read propert/i,
      /is not a function/i,
      /ECONNREFUSED/i,
      /ETIMEDOUT/i,
      /fetch failed/i,
    ];
    for (const p of patterns) {
      if (p.test(raw)) return "An unexpected error occurred";
    }
    if (raw.length > 200) return "An unexpected error occurred";
    return raw;
  }
  return "An unexpected error occurred";
}

declare global {
  interface Window {
    __SENTRY_CAPTURE?: (error: unknown, context?: Record<string, unknown>) => void;
  }
}
