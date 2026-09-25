import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import RevokeButton from "./revoke-button";

function codeStatus(c: { revoked: boolean; expiresAt: Date; usedCount: number; maxUses: number }) {
  if (c.revoked) return { label: "Revocato", variant: "secondary" as const };
  if (c.expiresAt.getTime() < Date.now()) return { label: "Scaduto", variant: "secondary" as const };
  if (c.usedCount >= c.maxUses) return { label: "Esaurito", variant: "secondary" as const };
  return { label: "Attivo", variant: "default" as const };
}

export default async function AdminDashboard() {
  const events = await db.query.event.findMany({
    orderBy: (e, { desc }) => desc(e.createdAt),
    with: { photos: true },
  });

  const codes = await db.query.downloadCode.findMany({
    orderBy: (c, { desc }) => desc(c.createdAt),
    with: { event: true },
    limit: 30,
  });

  return (
    <div className="flex flex-col gap-10">
      <header className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.18em] text-neon">Area privata</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Dashboard fotografica</h1>
        <p className="mt-3 text-haze">
          Organizza le fiere, prepara le anteprime e gestisci i link personali per il download.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Azioni rapide">
        <Link href="/admin/eventi/nuovo" className="group">
          <Card className="h-full border-neon/30 bg-neon/10 transition-colors group-hover:bg-neon/20">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neon">01 · Archivio</p>
              <CardTitle className="mt-2">Nuovo evento</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4 text-sm text-haze">
              Crea una nuova cartella con copertina e foto di anteprima.
              <span className="shrink-0 text-lg text-white transition-transform group-hover:translate-x-1">→</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/codici/nuovo" className="group">
          <Card className="h-full border-cyan-300/30 bg-cyan-300/10 transition-colors group-hover:bg-cyan-300/20">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">02 · Consegna</p>
              <CardTitle className="mt-2">Nuovo codice</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4 text-sm text-haze">
              Genera un accesso temporaneo collegato a un link SwissTransfer.
              <span className="shrink-0 text-lg text-white transition-transform group-hover:translate-x-1">→</span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Eventi</h2>
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <Link key={e.id} href={`/admin/eventi/nuovo/${e.id}`}>
              <Card className="transition-colors hover:bg-white/5">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-haze">
                      {e.year} · {e.photos.length} foto di anteprima
                    </p>
                  </div>
                  <span className="text-haze">Gestisci →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
          {events.length === 0 && <p className="text-haze">Nessun evento ancora. Creane uno.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Codici di download</h2>
        <div className="flex flex-col gap-2">
          {codes.map((c) => {
            const status = codeStatus(c);
            return (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">@{c.igHandle}</p>
                    <p className="text-sm text-haze">
                      {c.event?.title ?? "Nessun evento collegato"} · usato {c.usedCount}/{c.maxUses} · scade{" "}
                      {c.expiresAt.toLocaleString("it-IT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {status.label === "Attivo" ? (
                      <RevokeButton id={c.id} />
                    ) : (
                      <Link
                        href={`/admin/codici/nuovo?ig=${encodeURIComponent(c.igHandle)}${
                          c.eventId ? `&eventId=${c.eventId}` : ""
                        }`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Rigenera
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {codes.length === 0 && <p className="text-haze">Nessun codice ancora.</p>}
        </div>
      </section>
    </div>
  );
}
