const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function generateState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const STORAGE_KEY_STATE = "etoro_sso_state";
const STORAGE_KEY_VERIFIER = "etoro_sso_code_verifier";

export function storeAuthParams(state: string, codeVerifier: string): void {
  sessionStorage.setItem(STORAGE_KEY_STATE, state);
  sessionStorage.setItem(STORAGE_KEY_VERIFIER, codeVerifier);
}

export function getStoredState(): string | null {
  return sessionStorage.getItem(STORAGE_KEY_STATE);
}

export function getStoredCodeVerifier(): string | null {
  return sessionStorage.getItem(STORAGE_KEY_VERIFIER);
}

export function clearAuthParams(): void {
  sessionStorage.removeItem(STORAGE_KEY_STATE);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
}
