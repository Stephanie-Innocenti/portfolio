"use client";

import { localeOptions } from "@/lib/i18n";
import { useLanguage } from "@/app/components/language-provider";

export default function LanguageSelect() {
  const { locale, setLocale } = useLanguage();
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    if (nextLocale === "it" || nextLocale === "en") setLocale(nextLocale);
  };

  return (
    <label className="flex items-center gap-2 rounded-full border border-haze/40 bg-white/5 px-3 py-2 text-sm text-haze transition hover:border-badge/70 hover:text-badge">
      <select
        aria-label="Language"
        value={locale}
        onChange={handleChange}
        className="cursor-pointer appearance-none bg-transparent  font-semibold text-badge outline-none"
      >
        {localeOptions.map((option) => <option key={option.value} value={option.value} className="bg-moquette">{option.label}</option>)}
      </select>
    </label>
  );
}