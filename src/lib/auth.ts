import { encryptJson, decryptJson } from "./encryption";

export const KEYS_COOKIE_NAME = "ttp_etoro_keys";
export const KEYS_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface EtoroKeys {
  apiKey: string;
  userKey: string;
}

export function encryptKeys(keys: EtoroKeys): string {
  return encryptJson(keys);
}

export function decryptKeys(encrypted: string): EtoroKeys {
  return decryptJson<EtoroKeys>(encrypted);
}
