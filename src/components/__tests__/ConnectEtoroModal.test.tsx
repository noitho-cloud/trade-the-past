import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ConnectEtoroModal } from "../ConnectEtoroModal";
import { useAuth } from "../AuthProvider";

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
    connect: vi.fn().mockResolvedValue({ success: true }),
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

  it("limits API key input length to prevent oversized payloads", () => {
    render(<ConnectEtoroModal />);

    const apiKeyInput = document.querySelector("#etoro-api-key") as HTMLInputElement;
    const userKeyInput = document.querySelector("#etoro-user-key") as HTMLInputElement;

    expect(apiKeyInput).toBeTruthy();
    expect(userKeyInput).toBeTruthy();
    expect(apiKeyInput.maxLength).toBeLessThanOrEqual(200);
    expect(apiKeyInput.maxLength).toBeGreaterThan(0);
    expect(userKeyInput.maxLength).toBeLessThanOrEqual(200);
    expect(userKeyInput.maxLength).toBeGreaterThan(0);
  });
});
