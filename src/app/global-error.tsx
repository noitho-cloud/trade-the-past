"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/error-reporter";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { boundary: "global", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: "#F5F5F5",
          color: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 400, padding: 24 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#999",
              marginBottom: 16,
            }}
          >
            Error
          </p>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#666",
              marginBottom: 32,
            }}
          >
            A critical error occurred. You can try again or refresh the page.
          </p>
          <button
            onClick={reset}
            style={{
              fontSize: 16,
              fontWeight: 600,
              backgroundColor: "#0EB12E",
              color: "#fff",
              border: "none",
              borderRadius: 48,
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
