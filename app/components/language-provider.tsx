"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { copy, type Copy, type Locale } from "@/app/lib/i18n";

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: Copy };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("it");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-locale");
    startTransition(() => {
      if (saved === "it" || saved === "en") setLocale(saved);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("portfolio-locale", locale);
    document.documentElement.lang = locale;
  }, [hydrated, locale]);

  return <LanguageContext.Provider value={{ locale, setLocale, t: copy[locale] }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}