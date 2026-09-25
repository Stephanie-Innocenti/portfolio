import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <section>
        <h1 className="mb-4 text-xl font-semibold">Eventi</h1>
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <Link key={e.id} href={`/admin/eventi/${e.id}`}>
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
        <h1 className="mb-4 text-xl font-semibold">Codici di download</h1>
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
                    {status.label === "Attivo" && <RevokeButton id={c.id} />}
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
