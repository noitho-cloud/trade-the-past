type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function sanitize(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sensitiveKeys = /key|secret|token|password|authorization|cookie/i;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    if (sensitiveKeys.test(k)) {
      cleaned[k] = "[REDACTED]";
    } else if (typeof v === "string" && v.length > 500) {
      cleaned[k] = v.slice(0, 500) + "...[truncated]";
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: sanitize(context),
  };

  const json = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(json);
      break;
    case "warn":
      console.warn(json);
      break;
    default:
      console.log(json);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
};
