import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { personalPhoto } from "@/lib/schema";
import { hasPhotoAccess } from "@/lib/photo-access";
import { buttonVariants } from "@/components/ui/button";

const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });

export default async function LeMieFotoPage({ params }: { params: Promise<{ ighandle: string }> }) {
  const { ighandle } = await params;
  const igHandle = ighandle;

  if (!(await hasPhotoAccess(igHandle))) {
    redirect("/archivio?errore=accesso-scaduto");
  }

  const photos = await db.query.personalPhoto.findMany({
    where: eq(personalPhoto.igHandle, igHandle),
    with: { event: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
  });

  const groups = new Map<string, { title: string; date: string; photos: typeof photos }>();
  for (const p of photos) {
    const key = p.event?.id ?? "senza-evento";
    const title = p.event?.title ?? "Foto generali";
    const date = p.event ? String(p.event.year) : dateFmt.format(p.createdAt);
    if (!groups.has(key)) groups.set(key, { title, date, photos: [] });
    groups.get(key)!.photos.push(p);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-haze">Le tue foto</p>
          <h1 className="text-3xl font-semibold">@{igHandle}</h1>
        </div>
        {photos.length > 0 && (
          <Link href={`/api/fotozip/${encodeURIComponent(igHandle)}`} className={buttonVariants({ size: "lg" })}>
            Scarica tutto (.zip)
          </Link>
        )}
      </div>

      {photos.length === 0 && (
        <p className="text-haze">Non ci sono ancora foto qui. Se pensi sia un errore, scrivimi.</p>
      )}

      <div className="flex flex-col gap-10">
        {[...groups.values()].map((group) => (
          <section key={group.title}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-xl font-semibold">{group.title}</h2>
              <span className="text-sm text-haze">{group.date}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.photos.map((p) => (
                <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={p.url} alt="" fill sizes="(min-width: 1024px) 220px, 45vw" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {photos.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Link href="/archivio" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Ho finito, torna all&apos;archivio
          </Link>
        </div>
      )}
    </main>
  );
}
