export type NewsItem = { title: string; url: string; source: string; date: string };

// Feed configurabili. Si usano solo titolo, link e data: il testo resta sul sito della fonte.
const FEEDS = [
  { source: "Variety", url: "https://variety.com/feed/" },
  { source: "Deadline", url: "https://deadline.com/feed/" },
];

const FALLBACK: NewsItem[] = [
  { title: "Le notizie sono momentaneamente non disponibili", url: "https://www.themoviedb.org/", source: "Riprova più tardi", date: "" },
];

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

function parse(xml: string, source: string): NewsItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8).flatMap(([, item]) => {
    const pick = (tag: string) =>
      item.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1]?.trim() ?? "";
    const url = pick("link");
    const d = new Date(pick("pubDate"));
    if (!url.startsWith("https://")) return [];
    return [{ title: decode(pick("title")), url, source, date: isNaN(+d) ? "" : d.toISOString() }];
  });
}

export async function getNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ source, url }) => {
      const res = await fetch(url, { next: { revalidate: 900 } });
      if (!res.ok) throw new Error(res.statusText);
      return parse(await res.text(), source);
    }),
  );
  const items = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
  return items.length ? items : FALLBACK;
}
