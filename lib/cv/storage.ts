import { cvDataSchema, type CvData } from "@/lib/cv/schema";

const ANONYMOUS_KEY = "cvforge:cv";

/**
 * Signed-out visitors share one CV under a fixed key. Once a demo account is
 * logged in, its CV is namespaced by email so different demo accounts on the
 * same browser don't overwrite each other's data.
 */
export function cvStorageKey(accountEmail?: string | null): string {
  return accountEmail ? `cvforge:cv:${accountEmail}` : ANONYMOUS_KEY;
}

export function loadCv(key: string = ANONYMOUS_KEY): CvData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = cvDataSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveCv(data: CvData, key: string = ANONYMOUS_KEY) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage unavailable (private browsing, quota exceeded, etc). The demo
    // still works in-memory for the session, it just won't persist.
  }
}

export function clearCv(key: string = ANONYMOUS_KEY) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
