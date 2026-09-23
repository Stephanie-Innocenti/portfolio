"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { NewsItem } from "@/app/lib/news";
import { useLanguage } from "@/app/components/language-provider";

const arrow =
  "grid size-10 place-items-center rounded-full border border-haze/40 text-xl transition hover:bg-white/10";

export default function NewsCarousel({ items }: { items: NewsItem[] }) {
  const { locale, t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ref, api] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 4500, stopOnMouseEnter: true, stopOnInteraction: false }),
  ]);
  const fmt = new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-US", { day: "numeric", month: "short" });

  // Rispetta "riduci animazioni": niente scorrimento automatico.
  useEffect(() => {
    if (api && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      api.plugins().autoplay?.stop();
    }
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => { api.off("select", onSelect); };
  }, [api]);

  return (
    <section aria-roledescription="carousel" aria-label={t.newsLabel}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold">{t.newsTitle}</h2>
        <div className="flex gap-2">
          <button type="button" className={arrow} onClick={() => api?.scrollPrev()} aria-label={t.previous}>
            ‹
          </button>
          <button type="button" className={arrow} onClick={() => api?.scrollNext()} aria-label={t.next}>
            ›
          </button>
        </div>
      </div>

      <div ref={ref} className="overflow-hidden">
        <div className="flex">
          {items.map((n) => (
            <div key={n.url} className="min-w-0 shrink-0 grow-0 basis-[85%] pr-4 sm:basis-1/2 lg:basis-1/3">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col gap-3 border-l-2 border-dashed border-neon/70 bg-white/5 p-5 hover:bg-white/10"
              >
                <span className="text-sm text-haze">
                  {n.source}
                  {n.date && ` · ${fmt.format(new Date(n.date))}`}
                </span>
                <span className="font-serif text-xl leading-snug">{n.title}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-2" aria-label="Carousel pagination">
        {items.map((item, index) => (
          <button type="button" key={item.url} onClick={() => api?.scrollTo(index)} aria-label={`${t.newsTitle} ${index + 1}`} aria-current={selectedIndex === index} className={`h-1.5 rounded-full transition-all ${selectedIndex === index ? "w-8 bg-neon" : "w-2 bg-haze/40"}`} />
        ))}
      </div>
    </section>
  );
}
