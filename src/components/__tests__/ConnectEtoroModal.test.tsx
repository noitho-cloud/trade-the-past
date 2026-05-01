import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ConnectEtoroModal } from "../ConnectEtoroModal";
import { useAuth } from "../AuthProvider";

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const defaultAuthMock = {
  isConnected: false,
  isLoading: false,
  showConnectModal: true,
  openConnectModal: vi.fn(),
  closeConnectModal: vi.fn(),
  connect: vi.fn().mockResolvedValue({ success: true }),
  disconnect: vi.fn(),
  ssoAvailable: false,
  loginWithSSO: vi.fn(),
  authMethod: null as "sso" | "apikey" | null,
};

beforeEach(() => {
  HTMLDialogElement.prototype.showModal ??= vi.fn() as typeof HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.close ??= vi.fn() as typeof HTMLDialogElement.prototype.close;

  mockUseAuth.mockReturnValue(defaultAuthMock);
});

afterEach(() => {
  vi.restoreAllMocks();
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

  it("closes when backdrop (dialog element) is clicked directly", () => {
    const closeConnectModal = vi.fn();
    mockUseAuth.mockReturnValue({
      ...defaultAuthMock,
      closeConnectModal,
    });

    render(<ConnectEtoroModal />);

    const dialog = document.querySelector("dialog")!;
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(closeConnectModal).toHaveBeenCalled();
  });

  it("shows a value proposition subtitle explaining what connecting enables", () => {
    render(<ConnectEtoroModal />);

    const allText = document.body.textContent ?? "";
    expect(allText).toMatch(/trade.*directly/i);
    expect(allText).toMatch(/watchlist/i);
  });

  it("dialog has max-height and scrollable content for short viewports", () => {
    render(<ConnectEtoroModal />);

    const dialog = document.querySelector("dialog")!;
    expect(dialog.className).toMatch(/max-h-\[90vh\]/);

    const contentDiv = dialog.querySelector(":scope > div")!;
    expect(contentDiv.className).toMatch(/overflow-y-auto/);
  });

  it("does not show SSO-related technical messages", () => {
    render(<ConnectEtoroModal />);

    const allText = document.body.textContent ?? "";
    expect(allText).not.toContain("SSO is not configured");
    expect(allText).not.toContain("administrator");
    expect(allText).not.toContain("OAuth credentials");
    expect(allText).not.toContain("Continue with eToro");
  });

  it("shows API key form directly without SSO conditional", () => {
    render(<ConnectEtoroModal />);

    expect(document.querySelector("#etoro-api-key")).toBeTruthy();
    expect(document.querySelector("#etoro-user-key")).toBeTruthy();
    const allText = document.body.textContent ?? "";
    expect(allText).toContain("How to get your API keys");
    expect(allText).toContain("Connect with API keys");
  });

  it("does not close when inner content is clicked", () => {
    const closeConnectModal = vi.fn();
    mockUseAuth.mockReturnValue({
      ...defaultAuthMock,
      closeConnectModal,
    });

    render(<ConnectEtoroModal />);

    const heading = document.querySelector("h2")!;
    heading.click();
    expect(closeConnectModal).not.toHaveBeenCalled();
  });
});
