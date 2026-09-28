import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { event } from "@/lib/schema";
import DownloadRequestForm from "@/app/components/download-request-form";
import EventFolderCard from "@/app/components/event-folder-card";
import YearFilter from "@/app/components/year-filter";
import LogoutButton from "../components/logout-button";
import AccountAvatar from "@/app/components/account-avatar";

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
  const years = [...new Set([new Date().getFullYear(), 2025, 2024, ...allEvents.map(({ year }) => year)])].sort(
    (a, b) => b - a,
  );

  return (
    <main className="archive-page relative isolate min-h-dvh overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-200">Archivio fotografico</p>
            <h1 className="mt-1 font-script text-4xl font-bold leading-tight text-white sm:text-5xl">
              Ciao, {session?.user.name ?? ""}
            </h1>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <AccountAvatar name={session?.user.name ?? "Profilo"} image={session?.user.image} />
            <LogoutButton />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(290px,360px)] lg:gap-8">
          <div className="min-w-0 space-y-5">
            <YearFilter years={years} activeYear={activeYear} />

            <section
              aria-label="Eventi fotografici"
              className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3"
            >
              {events.length === 0 && (
                <p className="col-span-full rounded-xl border border-white/15 bg-black/20 px-5 py-8 text-center font-medium text-white/80">
                  Nessun evento trovato per quest&apos;anno.
                </p>
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
          </div>

          <div className="min-w-0 lg:sticky lg:top-6">
            <DownloadRequestForm />
          </div>
        </div>
      </div>
    </main>
  );
}
