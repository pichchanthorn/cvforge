"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "cvforge:demo-account";
const listeners = new Set<() => void>();

export type DemoAccount = {
  name: string;
  email: string;
  createdAt: string;
  loggedIn: boolean;
  avatarDataUrl?: string;
};

function parseStored(raw: string | null): DemoAccount | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name !== "string" || typeof parsed?.email !== "string") return null;
    return parsed as DemoAccount;
  } catch {
    return null;
  }
}

function readStored(): DemoAccount | null {
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(account: DemoAccount | null) {
  try {
    if (account) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private browsing, quota exceeded, etc). The demo
    // still works in-memory for the session, it just won't persist.
  }
  listeners.forEach((callback) => callback());
}

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value when nothing has changed, or it re-renders forever. Cache the parsed
// result and only re-parse when the raw stored string actually changes.
let cachedRaw: string | null = null;
let cachedSnapshot: DemoAccount | null = null;

function getSnapshot(): DemoAccount | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parseStored(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): DemoAccount | null {
  return null;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

type SignUpResult = { ok: true } | { ok: false; error: "invalid" };
type LogInResult = { ok: true } | { ok: false; error: "not-found" };

type DemoAccountContextValue = {
  account: DemoAccount | null;
  isLoggedIn: boolean;
  signUp: (name: string, email: string) => SignUpResult;
  logIn: (email: string) => LogInResult;
  logOut: () => void;
  updateProfile: (updates: { name?: string; avatarDataUrl?: string | null }) => void;
};

const DemoAccountContext = createContext<DemoAccountContextValue | null>(null);

export function DemoAccountProvider({ children }: { children: React.ReactNode }) {
  const account = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<DemoAccountContextValue>(
    () => ({
      account,
      isLoggedIn: account?.loggedIn ?? false,
      signUp(name, email) {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedName || !trimmedEmail) return { ok: false, error: "invalid" };
        writeStored({
          name: trimmedName,
          email: trimmedEmail,
          createdAt: new Date().toISOString(),
          loggedIn: true,
        });
        return { ok: true };
      },
      logIn(email) {
        const existing = readStored();
        const trimmedEmail = email.trim().toLowerCase();
        if (!existing || existing.email !== trimmedEmail) {
          return { ok: false, error: "not-found" };
        }
        writeStored({ ...existing, loggedIn: true });
        return { ok: true };
      },
      logOut() {
        const existing = readStored();
        if (existing) writeStored({ ...existing, loggedIn: false });
      },
      updateProfile(updates) {
        const existing = readStored();
        if (!existing) return;
        const next: DemoAccount = { ...existing };
        if (updates.name !== undefined) {
          const trimmed = updates.name.trim();
          if (trimmed) next.name = trimmed;
        }
        if (updates.avatarDataUrl !== undefined) {
          if (updates.avatarDataUrl === null) {
            delete next.avatarDataUrl;
          } else {
            next.avatarDataUrl = updates.avatarDataUrl;
          }
        }
        writeStored(next);
      },
    }),
    [account],
  );

  return <DemoAccountContext.Provider value={value}>{children}</DemoAccountContext.Provider>;
}

/**
 * Reads the logged-in state directly from localStorage, bypassing React
 * state. Route guards must use this instead of `isLoggedIn` from
 * useDemoAccount(): on a hard navigation, useSyncExternalStore first renders
 * with getServerSnapshot() (always null) and only corrects itself in an
 * effect on DemoAccountProvider. A guard effect in a child component (like a
 * dashboard page) can fire first with that stale null and redirect away
 * before the correction ever happens. localStorage itself is never stale.
 */
export function hasActiveDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  return readStored()?.loggedIn ?? false;
}

export function useDemoAccount() {
  const ctx = useContext(DemoAccountContext);
  if (!ctx) {
    throw new Error("useDemoAccount must be used within a DemoAccountProvider");
  }
  return ctx;
}
