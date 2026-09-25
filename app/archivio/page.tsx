import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { event } from "@/lib/schema";
import DownloadRequestForm from "@/app/components/download-request-form";
import EventFolderCard from "@/app/components/event-folder-card";
import YearFilter from "@/app/components/year-filter";
import LogoutButton from "../components/logout-button";

export default async function ArchivioPage({
  searchParams,
}: {
  searchParams: Promise<{ anno?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { anno } = await searchParams;
  const activeYear = anno ? Number(anno) : undefined;

  const events = await db.query.event.findMany({
    where: activeYear ? eq(event.year, activeYear) : undefined,
    orderBy: [desc(event.year), desc(event.createdAt)],
  });

  const allEvents = await db.query.event.findMany({ columns: { year: true } });
  const years = [...new Set([2025, 2024, ...allEvents.map(({ year }) => year)])].sort(
    (a, b) => b - a,
  );

  return (
    <main className="archive-page relative isolate min-h-dvh overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-400 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-haze">Archivio foto</p>
            <h1 className="text-3xl font-semibold">Ciao, {session?.user.name}</h1>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[180px_minmax(0,1fr)_340px] 2xl:gap-10">
          <YearFilter years={years} activeYear={activeYear} />

          <section className="mx-auto grid w-full max-w-190 min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
            {events.length === 0 && (
              <p className="col-span-full text-haze">Nessuna fiera trovata per questo filtro.</p>
            )}
            {events.map((currentEvent) => (
              <EventFolderCard
                key={currentEvent.id}
                slug={currentEvent.slug}
                title={currentEvent.title}
                year={currentEvent.year}
                coverImageUrl={currentEvent.coverImageUrl}
              />
            ))}
          </section>

          <div className="min-w-0 xl:sticky xl:top-8">
            <DownloadRequestForm />
          </div>
        </div>
      </div>
    </main>
  );
}
