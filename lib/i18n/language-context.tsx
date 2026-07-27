"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { translations, type Language, type Translations } from "@/lib/i18n/translations";

const STORAGE_KEY = "cvforge:lang";
const listeners = new Set<() => void>();

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "km";
}

function getSnapshot(): Language {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(stored) ? stored : "en";
}

function getServerSnapshot(): Language {
  return "en";
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setStoredLanguage(lang: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore storage failures; language just won't persist.
  }
  listeners.forEach((callback) => callback());
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(
    () => ({ language, setLanguage: setStoredLanguage, t: translations[language] }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

/** Convenience hook for components that only need the translation dictionary. */
export function useT() {
  return useLanguage().t;
}
