"use client";

import Link from "next/link";
import NewsCarousel from "@/app/components/news-carousel";
import LanguageSelect from "@/app/components/language-select";
import { useLanguage } from "@/app/components/language-provider";
import type { NewsItem } from "@/lib/news";

export default function HomeContent({ news }: { news: NewsItem[] }) {
  const { t } = useLanguage();
  const mail = `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "tuamail@example.com"}?subject=${encodeURIComponent(
    t.contact,
  )}`;

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <span className="text-lg  font-semibold">Aihara Ph</span>
        <nav className="flex items-center gap-3" aria-label="Main navigation">
          <LanguageSelect />
          <Link href="/login" className="rounded-full border border-haze/50 px-4 py-2 text-sm transition hover:bg-white/10">{t.login}</Link>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <span className="absolute -left-24 top-10 size-80 rounded-full bg-neon/30 blur-3xl" />
            <span className="absolute right-0 top-40 size-96 rounded-full bg-[#5b6cff]/30 blur-3xl" />
            <span className="absolute bottom-0 left-1/3 size-64 rounded-full bg-[#ffd166]/15 blur-3xl" />
          </div>
          <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-28">
            <h1 className="max-w-3xl text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[0.95] tracking-tight">{t.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg text-haze">{t.heroDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-neon px-6 py-3 font-semibold text-moquette transition hover:brightness-110">{t.archive}</Link>
              <a href={mail} className="rounded-full border border-badge/40 px-6 py-3 font-semibold transition hover:bg-white/10">{t.contact}</a>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-6 pb-24"><NewsCarousel items={news} /></div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-haze">© {new Date().getFullYear()} Aihara Ph. {t.copyright}</footer>
    </>
  );
}