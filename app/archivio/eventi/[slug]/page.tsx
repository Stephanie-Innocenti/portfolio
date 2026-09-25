import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { event } from "@/lib/schema";

export default async function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  let slug: string;

  try {
    slug = decodeURIComponent(rawSlug).normalize("NFC");
  } catch {
    notFound();
  }

  const ev = await db.query.event.findFirst({
    where: eq(event.slug, slug),
    with: { photos: { orderBy: (p, { asc }) => asc(p.position) } },
  });

  if (!ev) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/archivio" className="text-sm text-haze hover:underline">
        ← Torna all&apos;archivio
      </Link>

      <div className="mb-8 mt-2 flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">{ev.title}</h1>
        <span className="text-haze">{ev.year}</span>
      </div>

      <p className="mb-6 text-sm text-haze">
        Foto generali dell&apos;evento. Le tue foto personali si scaricano dal link dedicato nella pagina archivio.
      </p>

      {/* select-none + contextmenu bloccato: scoraggia il salvataggio occasionale.
          Non è una vera protezione (uno screenshot è sempre possibile) — le foto qui
          sono comunque a bassa risoluzione, di proposito. */}
      <div
        className="grid grid-cols-2 gap-3 select-none sm:grid-cols-3 lg:grid-cols-4"
        onContextMenu={undefined}
      >
        {ev.photos.map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={p.url}
              alt={p.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 220px, 45vw"
              className="pointer-events-none object-cover"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
