import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthProvider";

beforeEach(() => {
  vi.restoreAllMocks();
});

function TestConsumer() {
  const { isConnected, openConnectModal, connect, closeConnectModal, showConnectModal } = useAuth();
  return (
    <div>
      <span data-testid="connected">{String(isConnected)}</span>
      <span data-testid="modal">{String(showConnectModal)}</span>
      <button data-testid="open" onClick={() => openConnectModal()}>Open</button>
      <button data-testid="open-with-action" onClick={() => openConnectModal(() => {
        document.title = "ACTION_EXECUTED";
      })}>Open With Action</button>
      <button data-testid="close" onClick={() => closeConnectModal()}>Close</button>
      <button data-testid="connect" onClick={() => connect("key", "user")}>Connect</button>
    </div>
  );
}

describe("AuthProvider pending action", () => {
  it("executes pending action after successful connect", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ connected: false }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {});

    document.title = "";
    act(() => { screen.getByTestId("open-with-action").click(); });
    expect(screen.getByTestId("modal").textContent).toBe("true");

    await act(async () => { screen.getByTestId("connect").click(); });
    expect(document.title).toBe("ACTION_EXECUTED");
  });

  it("clears pending action when modal is closed without connecting", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ connected: false }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {});

    document.title = "";
    act(() => { screen.getByTestId("open-with-action").click(); });
    act(() => { screen.getByTestId("close").click(); });

    await act(async () => { screen.getByTestId("connect").click(); });
    expect(document.title).toBe("");
  });

  it("does not execute pending action when opened without one", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ connected: false }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {});

    document.title = "";
    act(() => { screen.getByTestId("open").click(); });
    await act(async () => { screen.getByTestId("connect").click(); });
    expect(document.title).toBe("");
  });
});
