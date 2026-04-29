import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectEtoroModal } from "../ConnectEtoroModal";
import { useAuth } from "../AuthProvider";
import type { ReactNode } from "react";

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  HTMLDialogElement.prototype.showModal ??= vi.fn() as typeof HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.close ??= vi.fn() as typeof HTMLDialogElement.prototype.close;

  mockUseAuth.mockReturnValue({
    isConnected: false,
    isLoading: false,
    showConnectModal: true,
    openConnectModal: vi.fn(),
    closeConnectModal: vi.fn(),
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
  });
});

describe("ConnectEtoroModal", () => {
  it("displays accurate security disclaimer that does not claim keys are never sent to server", () => {
    render(<ConnectEtoroModal />);

    const allText = document.body.textContent ?? "";
    expect(allText).not.toContain("never sent to our servers");
  });

  it("displays accurate security disclaimer mentioning encryption", () => {
    render(<ConnectEtoroModal />);

    const allText = document.body.textContent ?? "";
    expect(allText).toMatch(/encrypted/i);
    expect(allText).toMatch(/secure/i);
  });
});
